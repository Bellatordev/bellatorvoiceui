
import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';

const RA2 = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  useEffect(() => {
    // Create and append the script element
    const script = document.createElement('script');
    script.type = 'module';
    script.innerHTML = `
      import Chatbot from 'https://cdn.jsdelivr.net/npm/flowise-embed/dist/web.js';
      Chatbot.init({
        chatflowid: '8c306382-f882-4de0-bc87-f99a38d929ef',
        apiHost: 'http://localhost:3000',
        chatflowConfig: {
          // topK: 2
        },
        observersConfig: {
          // (optional) Allows you to execute code in parent based upon signal observations within the chatbot.
          // The userinput field submitted to bot ("" when reset by bot)
          observeUserInput: (userInput) => {
            console.log({ userInput });
          },
          // The bot message stack has changed
          observeMessages: (messages) => {
            console.log({ messages });
          },
          // The bot loading signal changed
          observeLoading: (loading) => {
            console.log({ loading });
          },
        },
        theme: {
          button: {
            backgroundColor: '#3B81F6',
            right: 20,
            bottom: 20,
            size: 48, // small | medium | large | number
            dragAndDrop: true,
            iconColor: 'white',
            customIconSrc: 'https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/svg/google-messages.svg',
            autoWindowOpen: {
              autoOpen: true, //parameter to control automatic window opening
              openDelay: 2, // Optional parameter for delay time in seconds
              autoOpenOnMobile: false, //parameter to control automatic window opening in mobile
            },
          },
          tooltip: {
            showTooltip: true,
            tooltipMessage: 'Hi There 👋!',
            tooltipBackgroundColor: 'black',
            tooltipTextColor: 'white',
            tooltipFontSize: 16,
          },
          disclaimer: {
            title: 'Disclaimer',
            message: 'By using this chatbot, you agree to the <a target="_blank" href="https://flowiseai.com/terms">Terms & Condition</a>',
            textColor: 'black',
            buttonColor: '#3b82f6',
            buttonText: 'Start Chatting',
            buttonTextColor: 'white',
            blurredBackgroundColor: 'rgba(0, 0, 0, 0.4)', //The color of the blurred background that overlays the chat interface
            backgroundColor: 'white',
            denyButtonText: 'Cancel',
            denyButtonBgColor: '#ef4444',
          },
          form: {
            backgroundColor: 'white',
            textColor: 'black',
          },
          customCSS: \`\`, // Add custom CSS styles. Use !important to override default styles
          chatWindow: {
            showTitle: true,
            showAgentMessages: true,
            title: 'Flowise Bot',
            titleAvatarSrc: 'https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/svg/google-messages.svg',
            titleBackgroundColor: '#3B81F6',
            titleTextColor: '#ffffff',
            welcomeMessage: 'Hello! This is custom welcome message',
            errorMessage: 'This is a custom error message',
            backgroundColor: '#ffffff',
            backgroundImage: 'enter image path or link', // If set, this will overlap the background color of the chat window.
            height: 700,
            width: 400,
            fontSize: 16,
            starterPrompts: ['What is a bot?', 'Who are you?'], // It overrides the starter prompts set by the chat flow passed
            starterPromptFontSize: 15,
            clearChatOnReload: false, // If set to true, the chat will be cleared when the page reloads
            sourceDocsTitle: 'Sources:',
            renderHTML: true,
            botMessage: {
              backgroundColor: '#f7f8ff',
              textColor: '#303235',
              showAvatar: true,
              avatarSrc: 'https://raw.githubusercontent.com/zahidkhawaja/langchain-chat-nextjs/main/public/parroticon.png',
            },
            userMessage: {
              backgroundColor: '#3B81F6',
              textColor: '#ffffff',
              showAvatar: true,
              avatarSrc: 'https://raw.githubusercontent.com/zahidkhawaja/langchain-chat-nextjs/main/public/usericon.png',
            },
            textInput: {
              placeholder: 'Type your question',
              backgroundColor: '#ffffff',
              textColor: '#303235',
              sendButtonColor: '#3B81F6',
              maxChars: 50,
              maxCharsWarningMessage: 'You exceeded the characters limit. Please input less than 50 characters.',
              autoFocus: true, // If not used, autofocus is disabled on mobile and enabled on desktop. true enables it on both, false disables it on both.
              sendMessageSound: true,
              // sendSoundLocation: "send_message.mp3", // If this is not used, the default sound effect will be played if sendSoundMessage is true.
              receiveMessageSound: true,
              // receiveSoundLocation: "receive_message.mp3", // If this is not used, the default sound effect will be played if receiveSoundMessage is true.
            },
            feedback: {
              color: '#303235',
            },
            dateTimeToggle: {
              date: true,
              time: true,
            },
            footer: {
              textColor: '#303235',
              text: 'Powered by',
              company: 'Flowise',
              companyLink: 'https://flowiseai.com',
            },
          },
        },
      });
    `;
    
    document.head.appendChild(script);

    // Cleanup function to remove the script when component unmounts
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">RA2 Research Agent</h1>
          <p className="text-lg text-muted-foreground mb-4">
            Welcome to the RA2 research agent page
          </p>
          <p className="text-sm text-muted-foreground">
            The chatbot will appear in the bottom right corner
          </p>
        </div>
      </div>
    </div>
  );
};

export default RA2;
