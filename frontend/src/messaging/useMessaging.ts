// src/messaging/useMessaging.ts
import { useCallback, useState } from "react";
import { messaging, chatSignerKeypair, chatSupportAddress } from "./client";

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
}

export type CreateProposalChannelInput = {
  proposalId: string;
  budgetId: string;
  members: string[];
};

export function useMessaging() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1) Proposal için channel oluştur
  const createOrGetProposalChannel = useCallback(
    async ({ proposalId, budgetId, members }: CreateProposalChannelInput) => {
      setIsLoading(true);
      try {
        console.log("[messaging] Creating channel for proposal", {
          proposalId,
          budgetId,
          members,
        });

        const { channelId } = await messaging.executeCreateChannelTransaction({
          signer: chatSignerKeypair,
          initialMembers: members,
        });

        console.log("[messaging] Created channel", channelId);
        return channelId as string;
      } catch (err) {
        console.error("[messaging] Channel creation failed:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 2) Channel mesajlarını getir
  const getChannelMessages = useCallback(async (channelId: string) => {
    setIsLoading(true);
    try {
      const res = await messaging.getChannelMessages({
        channelId,
        userAddress: chatSupportAddress,
        limit: 50,
        direction: "backward",
      });

      const formattedMessages: Message[] = res.messages.map((m: any) => ({
        id: m.id || crypto.randomUUID(),
        sender: m.sender || "unknown",
        content: m.content || m.text || "",
        timestamp: m. timestamp || Date.now(),
      }));

      setMessages(formattedMessages);
      return formattedMessages;
    } catch (err) {
      console.error("[messaging] Get messages failed:", err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 3) Channel'a mesaj gönder
  const sendMessage = useCallback(
    async (channelId: string, text: string): Promise<boolean> => {
      if (!text.trim()) return false;

      setIsLoading(true);
      try {
        // a) Support tarafındaki membership / MemberCap'i bul
        const memberships = await messaging.getChannelMemberships({
          address: chatSupportAddress,
        });

        const membership = memberships.memberships. find(
          (m: any) => m.channel_id === channelId
        );
        if (!membership) {
          throw new Error("No MemberCap for this channel");
        }
        const memberCapId = membership. member_cap_id;

        // b) Channel object'ten encryption key'i çek
        const [channelObj] = await messaging.getChannelObjectsByChannelIds({
          channelIds: [channelId],
          userAddress: chatSupportAddress,
        });

        const encryptedKey = {
          $kind: "Encrypted" as const,
          encryptedBytes: new Uint8Array(
            channelObj.encryption_key_history. latest
          ),
          version: channelObj.encryption_key_history. latest_version,
        };

        // c) Mesajı gönder
        const res = await messaging.executeSendMessageTransaction({
          signer: chatSignerKeypair,
          channelId,
          memberCapId,
          message: text.trim(),
          encryptedKey,
        });

        console.log("[messaging] sent message", res);

        // d) Mesaj listesini yenile
        await getChannelMessages(channelId);
        return true;
      } catch (err) {
        console. error("[messaging] Send message failed:", err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [getChannelMessages]
  );

  return {
    // State
    messages,
    isLoading,
    chatSupportAddress,

    // Actions
    createOrGetProposalChannel,
    getChannelMessages,
    sendMessage,
  };
}