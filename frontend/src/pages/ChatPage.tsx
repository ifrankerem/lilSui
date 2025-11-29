// src/pages/ChatPage.tsx
export function ChatPage() {
  return (
    <div className="max-w-3xl mx-auto mt-8 space-y-4">
      <h1 className="text-2xl font-bold mb-2">Proposal Chat (Coming soon)</h1>
      <p className="text-sm text-slate-300">
        Buraya her proposal için ayrı bir chat kanalı gelecek.
        <br />
        Altta Sui Messaging SDK + Surflux + Walrus entegrasyonu ile
        mesajlar ve ekli dosyalar tutulacak.
      </p>

      <div className="border border-dashed rounded p-4 text-sm text-slate-400">
        Şimdilik sadece placeholder. Backend ve governance mantığı oturdu.
        Sonraki iterasyonda:
        <ul className="list-disc ml-5 mt-2">
          <li>Proposal ID&apos;ye göre kanal açma</li>
          <li>Mesaj gönderme / okuma (Sui Messaging SDK)</li>
          <li>Surflux üzerinden mesajları stream etmek</li>
          <li>Walrus ile dosya ekleri</li>
        </ul>
      </div>
    </div>
  );
}
