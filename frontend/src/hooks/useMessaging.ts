import { useState, useCallback } from "react";
import { useMessagingClient } from "../providers/MessagingClientProvider";

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
}

export interface Channel {
  id: string;
  name: string;
  members: string[];
  createdAt: number;
}

export function useMessaging() {
  const { client, isReady } = useMessagingClient();
  
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Kullanıcının kanallarını getir
  const fetchChannels = useCallback(async () => {
    if (!client) return;
    
    setIsLoading(true);
    try {
      const result = await client.getChannelObjectsByAddress({
        address: client.address,
      });
      setChannels(result.channels);
    } catch (err) {
      console.error("Kanallar yüklenemedi:", err);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  // Yeni kanal oluştur
  const createChannel = useCallback(async (name: string, members: string[]) => {
    if (!client) return null;
    
    setIsLoading(true);
    try {
      const result = await client. createChannelFlow({
        name,
        members,
      });
      
      // Listeyi güncelle
      await fetchChannels();
      return result.channelId;
    } catch (err) {
      console.error("Kanal oluşturulamadı:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [client, fetchChannels]);

  // Kanal mesajlarını getir
  const fetchMessages = useCallback(async (channelId: string) => {
    if (!client) return;
    
    setIsLoading(true);
    try {
      const result = await client.getChannelObjectsByChannelIds({
        channelIds: [channelId],
      });
      
      if (result.channels[0]) {
        setMessages(result.channels[0].messages);
      }
    } catch (err) {
      console.error("Mesajlar yüklenemedi:", err);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  // Mesaj gönder
  const sendMessage = useCallback(async (channelId: string, content: string) => {
    if (!client) return false;
    
    try {
      await client.sendMessage({
        channelId,
        content,
      });
      
      // Mesajları yenile
      await fetchMessages(channelId);
      return true;
    } catch (err) {
      console.error("Mesaj gönderilemedi:", err);
      return false;
    }
  }, [client, fetchMessages]);

  return {
    // State
    channels,
    messages,
    isLoading,
    isReady,
    
    // Actions
    fetchChannels,
    createChannel,
    fetchMessages,
    sendMessage,
  };
}