import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Send, Plus, MessageSquare, LogOut } from 'lucide-react';

interface Message {
  message_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface Chat {
  chat_id: string;
  title: string | null;
  created_at: string;
}

interface ChatInterfaceProps {
  sessionId: string;
  userId: number;
  onBackToDashboard: () => void;
  onLogout: () => void;
  webhookUrl?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  sessionId,
  userId,
  onBackToDashboard,
  onLogout,
  webhookUrl
}) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadChats();
  }, [sessionId]);

  useEffect(() => {
    if (currentChatId) {
      loadMessages();
    }
  }, [currentChatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChats = async () => {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('chat_id, title, created_at')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChats(data || []);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const loadMessages = async () => {
    if (!currentChatId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('message_id, role, content, created_at')
        .eq('chat_id', currentChatId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []) as Message[]);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const updateChatTitle = async (chatId: string, newTitle: string) => {
    try {
      const { error } = await supabase
        .from('chats')
        .update({ title: newTitle })
        .eq('chat_id', chatId);

      if (error) throw error;

      setChats(chats.map(chat => 
        chat.chat_id === chatId ? { ...chat, title: newTitle } : chat
      ));

      toast({
        title: "Chat renamed",
        description: "Chat title has been updated."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to rename chat.",
        variant: "destructive"
      });
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('chat_id', chatId);

      if (error) throw error;

      setChats(chats.filter(chat => chat.chat_id !== chatId));
      
      if (currentChatId === chatId) {
        setCurrentChatId(null);
        setMessages([]);
      }
      
      toast({
        title: "Chat deleted",
        description: "Chat and all its messages have been removed."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete chat.",
        variant: "destructive"
      });
    }
  };

  const startEditing = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId);
    setEditingTitle(currentTitle || 'New Chat');
  };

  const saveEdit = () => {
    if (editingChatId) {
      updateChatTitle(editingChatId, editingTitle);
      setEditingChatId(null);
      setEditingTitle('');
    }
  };

  const cancelEdit = () => {
    setEditingChatId(null);
    setEditingTitle('');
  };

  const createNewChat = async () => {
    try {
      const { data, error } = await supabase
        .from('chats')
        .insert({ session_id: sessionId, title: 'New Chat' })
        .select('chat_id')
        .single();

      if (error) throw error;

      setCurrentChatId(data.chat_id);
      await loadChats();
      toast({
        title: "Chat Created",
        description: "New chat started successfully",
      });
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: "Error",
        description: "Failed to create new chat",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentChatId) return;

    setIsLoading(true);
    try {
      // Add user message
      const { error: userError } = await supabase
        .from('messages')
        .insert({
          chat_id: currentChatId,
          role: 'user',
          content: newMessage
        });

      if (userError) throw userError;

      let assistantResponse: string;

      if (webhookUrl) {
        // Send to n8n webhook
        try {
          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: userId,
              chatId: currentChatId,
              message: newMessage
            }),
          });

          if (!response.ok) {
            throw new Error(`Webhook request failed: ${response.status}`);
          }

          const data = await response.json();
          assistantResponse = data.response || 'No response received from assistant.';
        } catch (webhookError) {
          console.error('Webhook error:', webhookError);
          assistantResponse = 'Sorry, I encountered an error processing your request.';
        }
      } else {
        // Use simulated response for other pages
        assistantResponse = `I received your message: "${newMessage}". This is a simulated response from the assistant.`;
      }
      
      const { error: assistantError } = await supabase
        .from('messages')
        .insert({
          chat_id: currentChatId,
          role: 'assistant',
          content: assistantResponse
        });

      if (assistantError) throw assistantError;

      setNewMessage('');
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={onBackToDashboard}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="font-semibold truncate">Session</h2>
        </div>

        <Button onClick={createNewChat} className="mb-4 w-full">
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>

        <div className="flex-1 overflow-y-auto space-y-2">
          {chats.map((chat) => (
            <div
              key={chat.chat_id}
              className={`p-2 rounded hover:bg-accent ${
                currentChatId === chat.chat_id ? 'bg-accent' : ''
              }`}
            >
              {editingChatId === chat.chat_id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="flex-1 px-2 py-1 border rounded text-xs"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') saveEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    autoFocus
                  />
                  <Button variant="ghost" size="sm" onClick={saveEdit}>
                    ✓
                  </Button>
                  <Button variant="ghost" size="sm" onClick={cancelEdit}>
                    ✕
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div 
                    className="flex items-center gap-2 flex-1 cursor-pointer"
                    onClick={() => setCurrentChatId(chat.chat_id)}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm truncate">{chat.title || 'Untitled Chat'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(chat.chat_id, chat.title || 'New Chat');
                      }}
                      className="h-6 w-6 p-0"
                    >
                      ✎
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.chat_id);
                      }}
                      className="h-6 w-6 p-0"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={onLogout} className="mt-4">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChatId ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.message_id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <Card className={`max-w-xs md:max-w-md lg:max-w-lg p-3 ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </p>
                  </Card>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={isLoading || !newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">No chat selected</p>
              <p className="text-muted-foreground mb-4">Choose a chat from the sidebar or create a new one</p>
              <Button onClick={createNewChat}>
                <Plus className="w-4 h-4 mr-2" />
                Start New Chat
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};