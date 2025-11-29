// src/pages/ChatPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMessaging } from "../messaging/useMessaging";
import { useCurrentAccount } from "@mysten/dapp-kit";

export default function ChatPage() {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();
  const currentAccount = useCurrentAccount();
  const { messages, getChannelMessages, sendMessage, isLoading, chatSupportAddress } =
    useMessaging();

  const [newMessage, setNewMessage] = useState("");

  // Mesajları yükle
  useEffect(() => {
    if (channelId) {
      getChannelMessages(channelId);
    }
  }, [channelId, getChannelMessages]);

  // Periyodik yenileme (her 5 saniye)
  useEffect(() => {
    if (! channelId) return;

    const interval = setInterval(() => {
      getChannelMessages(channelId);
    }, 5000);

    return () => clearInterval(interval);
  }, [channelId, getChannelMessages]);

  const handleSend = async () => {
    if (!channelId || !newMessage.trim()) return;

    const success = await sendMessage(channelId, newMessage);
    if (success) {
      setNewMessage("");
    }
  };

  // Cüzdan bağlı değilse
  if (!currentAccount) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-lg">⚠️ Lütfen cüzdanınızı bağlayın</p>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg"
        >
          Giriş Yap
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Geri
          </button>
          <h1 className="text-lg font-semibold">Kanal Sohbeti</h1>
          <div className="text-xs text-gray-400">
            {channelId?. slice(0, 8)}... 
          </div>
        </div>
      </div>

      {/* Mesaj listesi */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Mesajlar yükleniyor... </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Henüz mesaj yok.  İlk mesajı sen gönder!  👋</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg. sender === chatSupportAddress;
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    isMe
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-white border rounded-bl-none"
                  }`}
                >
                  {! isMe && (
                    <p className="text-xs text-gray-500 mb-1">
                      {msg.sender.slice(0, 8)}...
                    </p>
                  )}
                  <p className={isMe ? "text-white" : "text-gray-800"}>
                    {msg. content}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      isMe ? "text-blue-100" : "text-gray-400"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Mesaj gönderme */}
      <div className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ! e.shiftKey && handleSend()}
            placeholder="Mesajınızı yazın..."
            className="flex-1 px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || isLoading}
            className="px-6 py-3 bg-blue-500 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          >
            {isLoading ? "..." : "Gönder"}
          </button>
        </div>
      </div>
    </div>
  );
}