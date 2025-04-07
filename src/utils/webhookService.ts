
/**
 * Utility service for handling webhook interactions
 */

interface WebhookRequestData {
  type: string;
  message: string;
  messageId: string;
  [key: string]: any; // Allow for additional properties
}

/**
 * Send data to a webhook URL
 * 
 * @param webhookUrl The URL to send the data to
 * @param data The data to send
 * @returns A promise that resolves when the request is complete
 */
export const sendWebhookRequest = async (webhookUrl: string, data: WebhookRequestData): Promise<void> => {
  if (!webhookUrl) return;
  
  try {
    // Create URL object to handle query parameters
    const url = new URL(webhookUrl);
    
    // Ensure the message is a proper string
    if (data.message) {
      const messageText = typeof data.message === 'object' 
        ? JSON.stringify(data.message)
        : String(data.message);
      
      // Add message as a query parameter
      url.searchParams.append('message', messageText);
      
      // Also ensure message in the body is a proper string
      data.message = messageText;
    }
    
    // Add messageId as a query parameter
    if (data.messageId) {
      url.searchParams.append('messageId', data.messageId);
    }
    
    // Construct path parameter URL if needed
    // If the messageId is present, add it as a path parameter
    let finalUrl = url.toString();
    if (data.messageId) {
      // Ensure the URL doesn't end with a slash before appending
      finalUrl = finalUrl.endsWith('/') ? `${finalUrl}${data.messageId}` : `${finalUrl}/${data.messageId}`;
    }
    
    console.log(`Sending webhook request to: ${finalUrl}`);
    console.log('Webhook data:', data);
    
    // Add common fields
    const webhookData = {
      ...data,
      timestamp: new Date().toISOString(),
      source: window.location.origin
    };
    
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors", // This is necessary to avoid CORS issues with external webhooks
      body: JSON.stringify(webhookData),
    });
    
    console.log("Webhook request sent successfully");
  } catch (error) {
    console.error("Error sending webhook request:", error);
    // We intentionally don't throw here to avoid disrupting the user experience
  }
};
