
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
    
    // Send POST request with just the message in body and session ID in headers
    // We'll try with and without no-cors mode if needed
    let response;
    
    try {
      // First attempt: without no-cors mode to allow proper response handling
      response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Session-ID": sessionId,
          "X-Session-ID": sessionId,
          "Authorization": `Session ${sessionId}`
        },
        body: JSON.stringify({ 
          message: messageText
        }),
        // No mode: "no-cors" here to allow proper response handling
      });
    } catch (initialError) {
      console.warn("Initial fetch attempt failed, trying with no-cors mode:", initialError);
      
      // Second attempt: with no-cors as fallback if the first attempt fails
      response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Session-ID": sessionId,
          "X-Session-ID": sessionId,
          "Authorization": `Session ${sessionId}`
        },
        mode: "no-cors", // Fallback to no-cors mode
        body: JSON.stringify({ 
          message: messageText
        }),
      });
    }
    
    // Check if we got an opaque response (due to no-cors mode)
    if (response.type === 'opaque') {
      console.log("Received opaque response due to no-cors mode");
      // For opaque responses, we'll assume success but can't parse the response
      // The webhook probably worked, but we can't confirm the exact response
      return { 
        message: "I received your message and I'm processing it. (Note: I'm unable to show the actual response due to cross-origin restrictions, but your message was sent.)"
      };
    }
    
    // Process the response (this will only happen if CORS is properly configured)
    if (!response.ok) {
      throw new Error(`Webhook returned status: ${response.status}`);
    }
    
    // Parse the response as JSON
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
    console.warn("Unexpected webhook response format:", result);
    return { 
      message: Array.isArray(result) 
        ? JSON.stringify(result) 
        : (typeof result === 'string' ? result : JSON.stringify(result)) 
    };
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
      message: "I'm sorry, I couldn't connect to the n8n webhook. This might be due to CORS restrictions or network issues. Please ensure your webhook URL is correct and accessible from a browser."
    };
  }
};
