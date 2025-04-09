
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
  sessionId: string
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
    
    // Send POST request with the message in the body and sessionId in the header
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Session-ID": sessionId
      },
      body: JSON.stringify({ 
        message: messageText
      }),
    });
    
    // Process the response
    if (!response.ok) {
      throw new Error(`Webhook returned status: ${response.status}`);
    }
    
    // Parse the response as JSON
    const result = await response.json();
    console.log("Webhook response received:", result);
    return result;
  } catch (error) {
    console.error("Error sending webhook request:", error);
    return null;
  }
};
