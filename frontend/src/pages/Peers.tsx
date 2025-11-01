import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { MessageSquare, Users, Send, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatRoom {
  id: string;
  name: string;
  topic: string;
  description: string | null;
}

interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  profiles: { full_name: string | null };
}

const Peers = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setCurrentUser(user);
    loadRooms();
  };

  const loadRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error loading rooms:', error);
      toast({
        title: t('error'),
        description: 'Failed to load chat rooms',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          id,
          content,
          sender_id,
          created_at
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Fetch profiles separately
      if (data && data.length > 0) {
        const senderIds = [...new Set(data.map(m => m.sender_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', senderIds);
        
        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
        const messagesWithProfiles = data.map(msg => ({
          ...msg,
          profiles: { full_name: profilesMap.get(msg.sender_id)?.full_name || null }
        }));
        
        setMessages(messagesWithProfiles);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  useEffect(() => {
    if (!selectedRoom) return;

    loadMessages(selectedRoom.id);

    // Subscribe to new messages
    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${selectedRoom.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedRoom]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || !currentUser) return;

    try {
      const { error } = await supabase.from('chat_messages').insert({
        room_id: selectedRoom.id,
        sender_id: currentUser.id,
        content: newMessage.trim(),
      });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: t('error'),
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{t('Peer Network')}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="rooms" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="rooms">
              <Users className="h-4 w-4 mr-2" />
              {t('Chat Rooms')}
            </TabsTrigger>
            <TabsTrigger value="mentors">
              <MessageSquare className="h-4 w-4 mr-2" />
              {t('Find Mentors')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rooms" className="mt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-4 h-[600px] flex flex-col">
                <h2 className="text-lg font-semibold mb-4">{t('Available Rooms')}</h2>
                <ScrollArea className="flex-1">
                  <div className="space-y-2">
                    {rooms.map((room) => (
                      <motion.div
                        key={room.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <Button
                          variant={selectedRoom?.id === room.id ? 'default' : 'ghost'}
                          className="w-full justify-start text-left"
                          onClick={() => setSelectedRoom(room)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{room.name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {room.topic}
                            </div>
                          </div>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>

              {selectedRoom ? (
                <Card className="md:col-span-2 p-4 h-[600px] flex flex-col">
                  <div className="border-b pb-4 mb-4">
                    <h2 className="text-xl font-bold">{selectedRoom.name}</h2>
                    <Badge variant="secondary">{selectedRoom.topic}</Badge>
                  </div>

                  <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-4">
                      {messages.map((msg, index) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex gap-3 ${
                            msg.sender_id === currentUser?.id ? 'flex-row-reverse' : ''
                          }`}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {msg.profiles?.full_name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={`flex flex-col max-w-[70%] ${
                              msg.sender_id === currentUser?.id ? 'items-end' : ''
                            }`}
                          >
                            <span className="text-xs text-muted-foreground mb-1">
                              {msg.profiles?.full_name || 'Anonymous'}
                            </span>
                            <div
                              className={`rounded-lg p-3 ${
                                msg.sender_id === currentUser?.id
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              {msg.content}
                            </div>
                            <span className="text-xs text-muted-foreground mt-1">
                              {new Date(msg.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="flex gap-2 mt-4">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder={t('Type a message...')}
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card className="md:col-span-2 p-4 h-[600px] flex items-center justify-center text-muted-foreground">
                  {t('Select a room to start chatting')}
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="mentors" className="mt-6">
            <Card className="p-6 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">{t('Mentor Matching Coming Soon')}</h3>
              <p className="text-muted-foreground">
                {t('Find mentors based on skills and schedule sessions')}
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Peers;
