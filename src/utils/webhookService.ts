
/**
 * Utility service for handling webhook interactions with n8n
 */

interface WebhookRequestData {
  type: string;
  message: string;
  messageId: string;
  [key: string]: any; // Allow for additional properties
}

interface WebhookResponse {
  message: string;
  [key: string]: any; // Allow for additional properties
}

/**
 * Send data to a webhook URL and get a response
 * 
 * @param webhookUrl The URL to send the data to
 * @param data The data to send
 * @returns A promise that resolves with the webhook response
 */
export const sendWebhookRequest = async (webhookUrl: string, data: WebhookRequestData): Promise<WebhookResponse | null> => {
  if (!webhookUrl) {
    console.warn("No webhook URL provided");
    return null;
  }
  
  try {
    // Ensure the message is a proper string
    if (data.message) {
      data.message = typeof data.message === 'object' 
        ? JSON.stringify(data.message)
        : String(data.message);
    }
    
    console.log(`Sending webhook request to: ${webhookUrl}`);
    console.log('Webhook data:', data);
    
    // Add common fields
    const webhookData = {
      ...data,
      timestamp: new Date().toISOString(),
      source: window.location.origin
    };
    
    // Send POST request with JSON body (not using no-cors to get a response)
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookData),
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
