import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ChatLogin } from '@/components/ChatLogin';
import { ChatDashboard } from '@/components/ChatDashboard';

const IDchatTest = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<number | null>(null);
  const webhookUrl = 'https://bellatorai1.app.n8n.cloud/webhook/38156d19-0551-4653-8754-ba6d6834d4e6';

  const handleLogin = (userId: number) => {
    setCurrentUser(userId);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (currentUser) {
    return <ChatDashboard userId={currentUser} onLogout={handleLogout} webhookUrl={webhookUrl} />;
  }

  return (
    <>
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Button>
      </div>
      <ChatLogin onLogin={handleLogin} />
    </>
  );
};

export default IDchatTest;