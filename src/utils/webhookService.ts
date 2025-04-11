/**
 * Utility service for handling webhook interactions with n8n
 */

interface WebhookResponse {
  message?: string;
  output?: string;
  kwargs?: {
    content?: string;
    [key: string]: any;
  };
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
    
    // Log all response headers for debugging
    console.log('Response headers:');
    response.headers.forEach((value, name) => {
      console.log(`${name}: ${value}`);
    });
    
    // Process the response
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Webhook error response: ${errorText}`);
      throw new Error(`Webhook returned status: ${response.status}, message: ${errorText}`);
    }
    
    // Check if the response is JSON
    const contentType = response.headers.get('content-type');
    console.log(`Response content type: ${contentType}`);
    
    // Handle different content types
    if (contentType && contentType.includes('application/json')) {
      // Parse the response as JSON
      const result = await response.json();
      console.log("Webhook JSON response received:", result);
      
      // Log the raw response
      console.log("Raw JSON response: ", JSON.stringify(result, null, 2));
      
      // Check for kwargs.content in the response
      if (result.kwargs && result.kwargs.content) {
        console.log("Found kwargs.content in response:", result.kwargs.content);
        // Add or update the output field with kwargs.content
        result.output = result.kwargs.content;
      }
      
      // Try to detect if there's an output field in the header
      const outputHeader = response.headers.get('output');
      if (outputHeader) {
        console.log("Found output in header:", outputHeader);
        if (!result.output) {
          result.output = outputHeader;
        }
      }
      
      return result;
    } 
    else if (contentType && contentType.includes('multipart/form-data')) {
      // Handle multipart responses (often used for file + data combinations)
      const formData = await response.formData();
      const result: WebhookResponse = {};
      
      console.log("Processing multipart form data");
      
      // Process form data fields
      for (const [key, value] of formData.entries()) {
        console.log(`Form data field: ${key}`, value);
        
        if (key === 'message' || key === 'output') {
          result[key] = value.toString();
        } 
        else if (value instanceof Blob) {
          // Process file
          console.log(`Processing file blob: ${key}, type: ${value.type}, size: ${value.size}`);
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
      
      // Check for output header
      const outputHeader = response.headers.get('output');
      if (outputHeader) {
        console.log("Found output in header:", outputHeader);
        if (!result.output) {
          result.output = outputHeader;
        }
      }
      
      console.log("Webhook multipart response processed:", result);
      return result;
    }
    else if (contentType && (contentType.includes('application/octet-stream') || contentType.includes('audio/mpeg'))) {
      // Handle binary response (including audio/mpeg)
      const binaryData = await response.arrayBuffer();
      const base64Data = btoa(
        new Uint8Array(binaryData).reduce(
          (data, byte) => data + String.fromCharCode(byte), ''
        )
      );
      
      console.log(`Received binary data (${contentType}), size: ${binaryData.byteLength} bytes`);
      
      // Try to extract output from header
      const outputHeader = response.headers.get('output');
      
      // Create a response object with the binary data and any header info
      const result: WebhookResponse = {
        binaryFile: {
          data: base64Data,
          mimeType: contentType,
          filename: 'audio.mp3' // Default filename for audio
        }
      };
      
      if (outputHeader) {
        console.log("Found output in header:", outputHeader);
        result.output = outputHeader;
      }
      
      // Try to get filename from headers if available
      const disposition = response.headers.get('content-disposition');
      if (disposition && disposition.includes('filename=')) {
        const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          result.binaryFile.filename = filenameMatch[1];
        }
      }
      
      console.log("Webhook binary audio response processed", result);
      return result;
    }
    else {
      // Handle as plain text
      const textResponse = await response.text();
      console.log("Webhook text response received:", textResponse);
      
      // Check for output header
      const outputHeader = response.headers.get('output');
      let result: WebhookResponse;
      
      // Try to parse as JSON just in case the content-type header is wrong
      try {
        const jsonData = JSON.parse(textResponse);
        result = jsonData;
        
        // Check for kwargs.content in the response
        if (result.kwargs && result.kwargs.content) {
          console.log("Found kwargs.content in response:", result.kwargs.content);
          // Add or update the output field with kwargs.content
          result.output = result.kwargs.content;
        }
        
        if (outputHeader && !result.output) {
          console.log("Found output in header:", outputHeader);
          result.output = outputHeader;
        }
        
        return result;
      } catch (e) {
        // Not JSON, return as text message with header info if available
        result = { message: textResponse };
        
        if (outputHeader) {
          console.log("Found output in header:", outputHeader);
          result.output = outputHeader;
        }
        
        return result;
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

/**
 * Create an audio element from a binary file
 * @param binaryFile The binary file containing audio data
 * @returns An HTMLAudioElement or null if not an audio file
 */
export const createAudioFromBinaryFile = (binaryFile: WebhookResponse['binaryFile']): HTMLAudioElement | null => {
  if (!binaryFile || !binaryFile.mimeType.startsWith('audio/')) {
    return null;
  }
  
  try {
    // Create a data URL for the audio file
    const dataUrl = `data:${binaryFile.mimeType};base64,${binaryFile.data}`;
    
    // Create an audio element
    const audio = new Audio();
    audio.src = dataUrl;
    
    console.log(`Created audio element from binary file: ${binaryFile.filename}`);
    return audio;
  } catch (error) {
    console.error("Error creating audio from binary file:", error);
    return null;
  }
};
