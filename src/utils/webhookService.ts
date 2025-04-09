
/**
 * Utility service for handling webhook interactions with n8n
 */

interface WebhookResponse {
  message: string;
  [key: string]: any; // Allow for additional properties
}

interface WebhookPayload {
  message: string;
  sessionId: string;
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
    console.log('Webhook payload:', { message: messageText, sessionId });
    
    // Prepare the payload for n8n webhook
    const payload: WebhookPayload = {
      message: messageText,
      sessionId: sessionId
    };
    
    // Make the POST request to n8n
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    
    console.log(`Webhook response status: ${response.status}`);
    
    // Process the response
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Webhook error response: ${errorText}`);
      throw new Error(`Webhook returned status: ${response.status}, message: ${errorText}`);
    }
    
    // Parse the response as JSON
    const result = await response.json();
    console.log("Webhook response received:", result);
    
    // If n8n doesn't return a message property, create one with a default message
    if (!result.message) {
      console.warn("No message property in webhook response, using default");
      return {
        message: "I received your message and processed it through the workflow.",
        ...result
      };
    }
    
    return result;
  } catch (error) {
    console.error("Error sending webhook request:", error);
    
    // Provide more specific error message based on the nature of the error
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Return a structured error response that the UI can handle
    return {
      message: `I received your message but there was an issue with the webhook: ${errorMessage}. Please check your n8n webhook configuration and ensure it's properly set up to receive POST requests.`,
      error: errorMessage,
      success: false
    };
  }
};
