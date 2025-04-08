
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
 * @returns A promise that resolves with the webhook response
 */
export const sendWebhookRequest = async (webhookUrl: string, message: string): Promise<WebhookResponse | null> => {
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
    
    // Send POST request with only the message as the body
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: messageText }),
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
