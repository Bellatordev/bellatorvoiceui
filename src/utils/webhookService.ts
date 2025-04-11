
/**
 * Utility service for handling webhook interactions with n8n
 */

interface WebhookResponse {
  message?: string;
  output?: string;
  binaryFile?: {
    data: string; // Base64 encoded binary data
    mimeType: string;
    filename: string;
  };
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
    
    // Check if the response is JSON
    const contentType = response.headers.get('content-type');
    
    // Handle different content types
    if (contentType && contentType.includes('application/json')) {
      // Parse the response as JSON
      const result = await response.json();
      console.log("Webhook JSON response received:", result);
      return result;
    } 
    else if (contentType && contentType.includes('multipart/form-data')) {
      // Handle multipart responses (often used for file + data combinations)
      const formData = await response.formData();
      const result: WebhookResponse = {};
      
      // Process form data fields
      for (const [key, value] of formData.entries()) {
        if (key === 'message' || key === 'output') {
          result[key] = value.toString();
        } 
        else if (value instanceof Blob) {
          // Process file
          const fileReader = new FileReader();
          const binaryData = await new Promise<string>((resolve) => {
            fileReader.onload = () => resolve(fileReader.result as string);
            fileReader.readAsDataURL(value);
          });
          
          result.binaryFile = {
            data: binaryData.split(',')[1], // Remove the data URL prefix
            mimeType: value.type,
            filename: (value as any).name || 'file'
          };
        }
      }
      
      console.log("Webhook multipart response processed:", result);
      return result;
    }
    else if (contentType && contentType.includes('application/octet-stream')) {
      // Handle binary response
      const binaryData = await response.arrayBuffer();
      const base64Data = btoa(
        new Uint8Array(binaryData).reduce(
          (data, byte) => data + String.fromCharCode(byte), ''
        )
      );
      
      // Create a response object with the binary data
      const result: WebhookResponse = {
        binaryFile: {
          data: base64Data,
          mimeType: contentType,
          filename: 'file' // Default filename
        }
      };
      
      // Try to get filename from headers if available
      const disposition = response.headers.get('content-disposition');
      if (disposition && disposition.includes('filename=')) {
        const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          result.binaryFile.filename = filenameMatch[1];
        }
      }
      
      console.log("Webhook binary response processed");
      return result;
    }
    else {
      // Handle as plain text
      const textResponse = await response.text();
      console.log("Webhook text response received:", textResponse);
      
      // Try to parse as JSON just in case the content-type header is wrong
      try {
        const jsonData = JSON.parse(textResponse);
        return jsonData;
      } catch (e) {
        // Not JSON, return as text message
        return { message: textResponse };
      }
    }
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

/**
 * Utility function to handle binary files from webhook responses
 * 
 * @param binaryFile The binary file data object
 * @returns Information about how to use the binary file
 */
export const processBinaryFile = (binaryFile: WebhookResponse['binaryFile']): string => {
  if (!binaryFile) return '';
  
  // For different file types, return appropriate usage information
  if (binaryFile.mimeType.startsWith('image/')) {
    return `[Image file received: ${binaryFile.filename}]`;
  } else if (binaryFile.mimeType.startsWith('audio/')) {
    return `[Audio file received: ${binaryFile.filename}]`;
  } else if (binaryFile.mimeType.startsWith('video/')) {
    return `[Video file received: ${binaryFile.filename}]`;
  } else if (binaryFile.mimeType.includes('pdf')) {
    return `[PDF document received: ${binaryFile.filename}]`;
  } else {
    return `[File received: ${binaryFile.filename} (${binaryFile.mimeType})]`;
  }
};
