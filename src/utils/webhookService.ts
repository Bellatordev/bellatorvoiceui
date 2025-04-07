
/**
 * Utility service for handling webhook interactions
 */

/**
 * Send data to a webhook URL
 * 
 * @param webhookUrl The URL to send the data to
 * @param data The data to send
 * @returns A promise that resolves when the request is complete
 */
export const sendWebhookRequest = async (webhookUrl: string, data: any): Promise<void> => {
  if (!webhookUrl) return;
  
  try {
    console.log(`Sending webhook request to: ${webhookUrl}`);
    
    // Add common fields
    const webhookData = {
      ...data,
      timestamp: new Date().toISOString(),
      source: window.location.origin
    };
    
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors", // This is necessary to avoid CORS issues with external webhooks
      body: JSON.stringify(webhookData),
    });
    
    console.log("Webhook request sent");
  } catch (error) {
    console.error("Error sending webhook request:", error);
    // We intentionally don't throw here to avoid disrupting the user experience
  }
};
