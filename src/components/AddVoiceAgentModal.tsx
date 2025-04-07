
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { VoiceAgent, VoiceAgentFormData } from '@/types/voiceAgent';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { v4 as uuidv4 } from 'uuid';

interface AddVoiceAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAgent: (agent: VoiceAgent) => void;
}

const AddVoiceAgentModal: React.FC<AddVoiceAgentModalProps> = ({ isOpen, onClose, onAddAgent }) => {
  const form = useForm<VoiceAgentFormData>({
    defaultValues: {
      name: '',
      description: '',
      voiceId: '',
      webhookUrl: ''
    }
  });

  const handleSubmit = (data: VoiceAgentFormData) => {
    const newAgent: VoiceAgent = {
      id: uuidv4(),
      name: data.name,
      description: data.description || undefined,
      voiceId: data.voiceId,
      webhookUrl: data.webhookUrl || undefined
    };
    
    onAddAgent(newAgent);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Agent</DialogTitle>
          <DialogDescription>
            Configure a new voice agent with custom settings.
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
                  <FormLabel>Webhook URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://your-webhook-url.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save Agent</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddVoiceAgentModal;
