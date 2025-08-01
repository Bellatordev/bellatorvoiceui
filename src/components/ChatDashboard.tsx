import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ChatInterface } from './ChatInterface';
import { Plus, MessageSquare, LogOut } from 'lucide-react';

interface Session {
  session_id: string;
  created_at: string;
  title?: string;
}

interface ChatDashboardProps {
  userId: number;
  onLogout: () => void;
}

export const ChatDashboard: React.FC<ChatDashboardProps> = ({ userId, onLogout }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadSessions();
  }, [userId]);

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('session_id, created_at, title')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load sessions",
        variant: "destructive",
      });
    }
  };

  const createNewSession = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert({ user_id: userId, title: 'New Session' })
        .select('session_id')
        .single();

      if (error) throw error;

      toast({
        title: "Session Created",
        description: "New session started successfully",
      });

      setCurrentSessionId(data.session_id);
      await loadSessions();
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: "Error",
        description: "Failed to create new session",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSessionTitle = async (sessionId: string, newTitle: string) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ title: newTitle })
        .eq('session_id', sessionId);

      if (error) throw error;

      setSessions(sessions.map(session => 
        session.session_id === sessionId ? { ...session, title: newTitle } : session
      ));

      toast({
        title: "Session renamed",
        description: "Session title has been updated."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to rename session.",
        variant: "destructive"
      });
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('session_id', sessionId);

      if (error) throw error;

      setSessions(sessions.filter(session => session.session_id !== sessionId));
      
      toast({
        title: "Session deleted",
        description: "Session and all its chats have been removed."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete session.",
        variant: "destructive"
      });
    }
  };

  const startEditing = (sessionId: string, currentTitle: string) => {
    setEditingSessionId(sessionId);
    setEditingTitle(currentTitle || 'New Session');
  };

  const saveEdit = () => {
    if (editingSessionId) {
      updateSessionTitle(editingSessionId, editingTitle);
      setEditingSessionId(null);
      setEditingTitle('');
    }
  };

  const cancelEdit = () => {
    setEditingSessionId(null);
    setEditingTitle('');
  };

  if (currentSessionId) {
    return (
      <ChatInterface
        sessionId={currentSessionId}
        userId={userId}
        onBackToDashboard={() => setCurrentSessionId(null)}
        onLogout={onLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Chat Dashboard</h1>
            <p className="text-muted-foreground">User ID: {userId}</p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Start New Session
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={createNewSession} disabled={isLoading} className="w-full">
                {isLoading ? 'Creating...' : 'Create New Session'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Your Sessions ({sessions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No sessions yet. Create your first session to start chatting!
                </p>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div
                      key={session.session_id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
                    >
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => setCurrentSessionId(session.session_id)}
                      >
                        {editingSessionId === session.session_id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              className="flex-1 px-2 py-1 border rounded text-sm"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') saveEdit();
                                if (e.key === 'Escape') cancelEdit();
                              }}
                              autoFocus
                            />
                            <Button variant="ghost" size="sm" onClick={saveEdit}>
                              Save
                            </Button>
                            <Button variant="ghost" size="sm" onClick={cancelEdit}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <>
                            <p className="font-medium">{session.title || 'Untitled Session'}</p>
                            <p className="text-sm text-muted-foreground">
                              Created: {new Date(session.created_at).toLocaleString()}
                            </p>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(session.session_id, session.title || 'New Session');
                          }}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSession(session.session_id);
                          }}
                        >
                          Delete
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setCurrentSessionId(session.session_id)}>
                          Open
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};