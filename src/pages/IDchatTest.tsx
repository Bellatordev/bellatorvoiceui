import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ChatLogin } from '@/components/ChatLogin';
import { ChatDashboard } from '@/components/ChatDashboard';

const IDchatTest = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<number | null>(null);

  const handleLogin = (userId: number) => {
    setCurrentUser(userId);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (currentUser) {
    return <ChatDashboard userId={currentUser} onLogout={handleLogout} />;
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