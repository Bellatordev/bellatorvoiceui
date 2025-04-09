
/**
 * Utility service for handling webhook interactions with n8n
 */

interface WebhookResponse {
  message: string;
  [key: string]: any; // Allow for additional properties
}

/**
 * Send data to a webhook URL and get a response
 * 
 * @param webhookUrl The URL to send the data to
 * @param message The user's message to send
 * @param sessionId Unique identifier for the conversation session
 * @returns A promise that resolves with the webhook response
 */
export const sendWebhookRequest = async (
  webhookUrl: string, 
  message: string, 
  sessionId: string,
  retryCount = 0
): Promise<WebhookResponse | null> => {
  if (!webhookUrl) {
    console.warn("No webhook URL provided");
    return null;
  }
  
  try {
    // Ensure the message is a proper string
    const messageText = typeof message === 'object' 
      ? JSON.stringify(message)
      : String(message);
    
    console.log(`Sending webhook request to: ${webhookUrl}`);
    console.log('Webhook message:', messageText);
    console.log('Session ID:', sessionId);
    
    // Create the request body - ensure message is the primary data being sent
    const requestBody = {
      message: messageText
    };
    
    console.log('Full request body:', JSON.stringify(requestBody));
    
    // First try with proper CORS handling to get full response
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Session-ID": sessionId,
          "X-Session-ID": sessionId,
          "Authorization": `Session ${sessionId}`
        },
        body: JSON.stringify(requestBody)
      });
      
      // If the request was successful (no CORS error)
      if (response.ok) {
        const result = await response.json();
        console.log("Webhook response received:", result);
        
        // Handle different response formats
        if (Array.isArray(result) && result.length > 0) {
          // Handle n8n response format: [{"output":"message text"}]
          if (result[0].output) {
            return { message: result[0].output };
          }
        }
        
        // For the original format with direct message property
        if (result.message) {
          return result;
        }
        
        // Fallback for unexpected formats
        return { 
          message: typeof result === 'string' ? result : JSON.stringify(result)
        };
      } else {
        throw new Error(`Webhook returned status: ${response.status}`);
      }
    } catch (corsError) {
      // If CORS error or any other error, try with no-cors mode
      console.warn("Regular fetch failed, attempting with no-cors mode:", corsError);
      
      // This will allow the request to be sent but the response will be opaque
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Session-ID": sessionId,
          "X-Session-ID": sessionId,
          "Authorization": `Session ${sessionId}`
        },
        mode: "no-cors",
        body: JSON.stringify(requestBody)
      });
      
      // Since we're using no-cors, response will be opaque and we can't read its content
      console.log("Using no-cors mode, response type:", response.type);
      
      // If we've made it this far, the request was sent, but we can't read the response
      // We'll check if we've retried yet, and if not, try again after a short delay
      if (retryCount < 2) {
        console.log(`Waiting 1 second and trying to fetch the response directly (attempt ${retryCount + 1})`);
        
        // Wait a second for the webhook to potentially process the request
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          // Try to get the result by making a direct GET request
          // Some webhooks store the last response and can return it via GET
          const checkResponse = await fetch(webhookUrl, {
            method: "GET",
            headers: {
              "Session-ID": sessionId,
              "X-Session-ID": sessionId
            }
          });
          
          if (checkResponse.ok) {
            const checkResult = await checkResponse.json();
            console.log("Retrieved response via GET:", checkResult);
            
            if (Array.isArray(checkResult) && checkResult.length > 0) {
              if (checkResult[0].output) {
                return { message: checkResult[0].output };
              }
            }
            
            if (checkResult.message) {
              return checkResult;
            }
            
            return { message: typeof checkResult === 'string' ? checkResult : JSON.stringify(checkResult) };
          }
        } catch (checkError) {
          console.warn("Failed to check result via GET:", checkError);
        }
      }
      
      // If nothing else works, return a generic message
      return { 
        message: "Your message was sent, but due to cross-origin restrictions, I couldn't retrieve the actual response. If this issue persists, you may need to enable CORS on your n8n server or use a CORS proxy."
      };
    }
  } catch (error) {
    console.error("Error sending webhook request:", error);
    
    // Implement retry logic (maximum 2 retries)
    if (retryCount < 2) {
      console.log(`Retrying webhook request (attempt ${retryCount + 1})...`);
      // Wait 1 second before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      return sendWebhookRequest(webhookUrl, message, sessionId, retryCount + 1);
    }
    
    // If all retries fail, return a descriptive error
    return { 
      message: "I'm sorry, I couldn't connect to the n8n webhook. This might be due to CORS restrictions or network issues. Please ensure your webhook URL is correct and accessible."
    };
  }
};
