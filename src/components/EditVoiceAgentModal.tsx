
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { VoiceAgent, VoiceAgentFormData } from '@/types/voiceAgent';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface EditVoiceAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAgent: (agent: VoiceAgent) => void;
  agent: VoiceAgent | null;
}

const EditVoiceAgentModal: React.FC<EditVoiceAgentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSaveAgent,
  agent 
}) => {
  const form = useForm<VoiceAgentFormData>({
    defaultValues: {
      name: '',
      description: '',
      voiceId: '',
      webhookUrl: ''
    }
  });

  // Update form values when agent changes
  useEffect(() => {
    if (agent) {
      form.reset({
        name: agent.name,
        description: agent.description || '',
        voiceId: agent.voiceId,
        webhookUrl: agent.webhookUrl || ''
      });
    }
  }, [agent, form.reset, form]);

  const handleSubmit = (data: VoiceAgentFormData) => {
    if (!agent) return;
    
    const updatedAgent: VoiceAgent = {
      ...agent,
      name: data.name,
      description: data.description || undefined,
      voiceId: data.voiceId,
      webhookUrl: data.webhookUrl || undefined
    };
    
    onSaveAgent(updatedAgent);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Voice Agent</DialogTitle>
          <DialogDescription>
            Update your voice agent settings.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Assistant" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A helpful AI assistant" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="voiceId"
              rules={{ required: "ElevenLabs Voice ID is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ElevenLabs Voice ID</FormLabel>
                  <FormControl>
                    <Input placeholder="EXAVITQu4vr4xnSDxMaL" {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Use a voice ID from your ElevenLabs account
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="webhookUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>n8n Webhook URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://your-n8n-webhook-url.com" {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    URL of your n8n webhook that will process messages and return responses
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditVoiceAgentModal;
