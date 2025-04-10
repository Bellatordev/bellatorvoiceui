
import React, { useState, useEffect } from 'react';
import { VoiceAgent } from '@/types/voiceAgent';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, Check, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface VoiceAgentCardProps {
  agent: VoiceAgent;
  isSelected: boolean;
  onClick: () => void;
  onUpdate?: (agent: VoiceAgent) => void;
  onDelete?: (agentId: string) => void;
}

const VoiceAgentCard: React.FC<VoiceAgentCardProps> = ({
  agent,
  isSelected,
  onClick,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAgent, setEditedAgent] = useState<VoiceAgent>(agent);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Update the editedAgent when the agent prop changes
  useEffect(() => {
    setEditedAgent(agent);
  }, [agent]);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click event from firing
    setIsEditing(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click event from firing
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(agent.id);
    }
    setIsDeleteDialogOpen(false);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    if (onUpdate) {
      onUpdate(editedAgent);
    }
    
    // Exit edit mode
    setIsEditing(false);
  };

  const handleCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    // Reset edited agent to original agent
    setEditedAgent(agent);
    
    // Exit edit mode
    setIsEditing(false);
  };

  const handleChange = (field: keyof VoiceAgent, value: string) => {
    setEditedAgent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <>
      <Card 
        className={`cursor-pointer transition-all ${
          isSelected 
            ? 'bg-primary/10 border-primary/60' 
            : 'hover:bg-muted/50'
        }`}
        onClick={isEditing ? undefined : onClick}
      >
        <CardContent className="p-4">
          {isEditing ? (
            <div className="space-y-3" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Edit Agent</h3>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleSaveClick}
                  >
                    <Check size={16} className="text-green-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleCancelClick}
                  >
                    <X size={16} className="text-red-500" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input 
                  value={editedAgent.name} 
                  onChange={e => handleChange('name', e.target.value)}
                  placeholder="Assistant"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description (Optional)</label>
                <Textarea 
                  value={editedAgent.description || ''} 
                  onChange={e => handleChange('description', e.target.value)}
                  placeholder="A helpful AI assistant"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Voice ID</label>
                <Input 
                  value={editedAgent.voiceId} 
                  onChange={e => handleChange('voiceId', e.target.value)}
                  placeholder="EXAVITQu4vr4xnSDxMaL"
                />
                <p className="text-xs text-muted-foreground">Use a voice ID from your ElevenLabs account</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Webhook URL (Optional)</label>
                <Input 
                  value={editedAgent.webhookUrl || ''} 
                  onChange={e => handleChange('webhookUrl', e.target.value)}
                  placeholder="https://your-n8n-webhook-url.com"
                />
                <p className="text-xs text-muted-foreground">URL of your n8n webhook for processing messages</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start">
                <h3 className="font-medium">{agent.name}</h3>
                
                <div className="flex">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleEditClick}
                    className="h-8 w-8"
                  >
                    <Pencil size={16} />
                  </Button>
                  
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDeleteClick}
                      className="h-8 w-8 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </div>
              
              {agent.description && (
                <p className="text-sm text-muted-foreground mt-1">{agent.description}</p>
              )}
              
              {isSelected && (
                <div className="mt-3 pt-3 border-t text-sm">
                  <div className="flex flex-col gap-2">
                    <div>
                      <span className="font-medium">Voice ID:</span> 
                      <span className="text-muted-foreground ml-2">{agent.voiceId}</span>
                    </div>
                    
                    {agent.webhookUrl && (
                      <div>
                        <span className="font-medium">Webhook:</span> 
                        <span className="text-muted-foreground ml-2 break-all">{agent.webhookUrl}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Voice Agent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{agent.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default VoiceAgentCard;
