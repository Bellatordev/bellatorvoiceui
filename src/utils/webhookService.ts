
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
    
    // Send POST request with the message in body and sessionId in standard headers
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Session-ID": sessionId, // Standard header format
        "X-Session-ID": sessionId, // Also include X- prefixed version for compatibility
        "Authorization": `Session ${sessionId}` // Additional format some systems recognize
      },
      body: JSON.stringify({ 
        message: messageText
      }),
    });
    
    // Check if we can access the response
    if (response.type === 'opaque') {
      console.log("Received opaque response due to no-cors mode");
      return { 
        message: "I received your message, but I'm unable to show the actual response due to cross-origin restrictions. Please check your n8n webhook configuration."
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

