
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
    console.log('Webhook message:', messageText);
    console.log('Session ID:', sessionId);
    
    // First try with POST request (which is more common for webhooks)
    let response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        message: messageText,
        sessionId: sessionId
      }),
    });
    
    // If we get a 404 that mentions GET requests, try with GET
    if (response.status === 404) {
      const error = await response.json().catch(() => ({ message: "Not found" }));
      
      if (error && error.message && error.message.includes("GET request")) {
        console.log("Webhook suggests using GET instead of POST, trying GET...");
        
        // Append parameters to URL for GET request
        const urlWithParams = new URL(webhookUrl);
        urlWithParams.searchParams.append("message", messageText);
        urlWithParams.searchParams.append("sessionId", sessionId);
        
        response = await fetch(urlWithParams.toString(), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          }
        });
      }
    }
    
    // Process the response
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || `Webhook returned status: ${response.status}`;
      throw new Error(errorMessage);
    }
    
    // Parse the response as JSON
    const result = await response.json();
    console.log("Webhook response received:", result);
    return result;
  } catch (error) {
    console.error("Error sending webhook request:", error);
    
    // Provide more specific error message based on the nature of the error
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Return a structured error response that the UI can handle
    return {
      message: `I received your message but there was an issue with the webhook: ${errorMessage}. Please check your webhook configuration - it may require using GET instead of POST, or the URL might be incorrect.`,
      error: errorMessage,
      success: false
    };
  }
};
