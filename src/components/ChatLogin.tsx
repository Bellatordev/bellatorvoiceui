import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ChatLoginProps {
  onLogin: (userId: number) => void;
}

export const ChatLogin: React.FC<ChatLoginProps> = ({ onLogin }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !password) {
      toast({
        title: "Error",
        description: "Please enter both User ID and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Validate user credentials
      const { data, error } = await supabase
        .from('users')
        .select('id, password')
        .eq('id', parseInt(userId))
        .single();

      if (error || !data) {
        toast({
          title: "Login Failed",
          description: "Invalid User ID or password",
          variant: "destructive",
        });
        return;
      }

      // Simple password check (in production, use proper hashing)
      if (data.password !== password) {
        toast({
          title: "Login Failed",
          description: "Invalid User ID or password",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Login Successful",
        description: `Welcome back, User ${userId}!`,
      });

      onLogin(parseInt(userId));
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Chat Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="number"
                placeholder="User ID (e.g., 12345)"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};