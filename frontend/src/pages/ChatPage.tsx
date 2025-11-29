import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useMessaging } from "../hooks/useMessaging";
import { useSessionKey } from "../providers/SessionKeyProvider";

export default function ChatPage() {
  const { channelId } = useParams<{ channelId: string }>();
  const { sessionKey, isLoading: sessionLoading } = useSessionKey();
  const { messages, fetchMessages, sendMessage, isLoading, isReady } = useMessaging();
  
  const [newMessage, setNewMessage] = useState("");

  // Mesajları yükle
  useEffect(() => {
    if (channelId && isReady) {
      fetchMessages(channelId);
    }
  }, [channelId, isReady]);

  const handleSend = async () => {
    if (! channelId || !newMessage.trim()) return;
    
    const success = await sendMessage(channelId, newMessage);
    if (success) {
      setNewMessage("");
    }
  };

  // Session key bekleniyor
  if (sessionLoading) {
    return <div className="p-4">🔐 Oturum oluşturuluyor...</div>;
  }

  // Session key yok
  if (!sessionKey) {
    return <div className="p-4">⚠️ Lütfen cüzdanınızı bağlayın ve imza verin.</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Mesaj listesi */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading ?  (
          <p>Yükleniyor...</p>
        ) : (
          messages. map((msg) => (
            <div key={msg.id} className="p-3 bg-gray-100 rounded-lg">
              <p className="text-xs text-gray-500">{msg.sender. slice(0, 8)}...</p>
              <p>{msg.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Mesaj gönderme */}
      <div className="p-4 border-t flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Mesajınızı yazın..."
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <button
          onClick={handleSend}
          disabled={!newMessage.trim() || isLoading}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
        >
          Gönder
        </button>
      </div>
    </div>
  );
}