// src/messaging/useMessaging.ts
import { useCallback } from "react";
import { messaging, chatSignerKeypair, chatSupportAddress } from "./client";

export type CreateProposalChannelInput = {
  proposalId: string;
  budgetId: string;
  members: string[];
};

export function useMessaging() {
  // 1) Proposal için channel oluştur
  const createOrGetProposalChannel = useCallback(
    async ({ proposalId, budgetId, members }: CreateProposalChannelInput) => {
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
    },
    [],
  );

  // 2) Channel mesajlarını getir (support hesabı açısından)
  const getChannelMessagesForId = useCallback(
    async (channelId: string) => {
      const res = await messaging.getChannelMessages({
        channelId,
        userAddress: chatSupportAddress,
        limit: 50,
        direction: "backward",
      });

      return res.messages;
    },
    [],
  );

  // 3) Channel’a mesaj gönder
  const sendMessageToChannel = useCallback(
    async (channelId: string, text: string) => {
      if (!text.trim()) return;

      // a) Support tarafındaki membership / MemberCap’i bul
      const memberships = await messaging.getChannelMemberships({
        address: chatSupportAddress,
      });

      const membership = memberships.memberships.find(
        (m: any) => m.channel_id === channelId,
      );
      if (!membership) {
        throw new Error("No MemberCap for this channel");
      }
      const memberCapId = membership.member_cap_id;

      // b) Channel object’ten encryption key’i çek
      const [channelObj] = await messaging.getChannelObjectsByChannelIds({
        channelIds: [channelId],
        userAddress: chatSupportAddress,
      });

      const encryptedKey = {
        $kind: "Encrypted" as const,
        encryptedBytes: new Uint8Array(
          channelObj.encryption_key_history.latest,
        ),
        version: channelObj.encryption_key_history.latest_version,
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
      return res;
    },
    [],
  );

  return {
    createOrGetProposalChannel,
    getChannelMessages: getChannelMessagesForId,
    sendMessage: sendMessageToChannel,
  };
}
