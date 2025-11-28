module community_budget::governance {
    use sui::object::{Self as Object, UID, ID};
    use sui::tx_context::{Self as Tx, TxContext};
    use sui::transfer;
    use std::string::{Self as StringMod, String};

    /// Proposal status değerleri
    const STATUS_DISCUSSION: u8 = 0;
    const STATUS_VOTING: u8 = 1;
    const STATUS_APPROVED: u8 = 2;
    const STATUS_REJECTED: u8 = 3;
    const STATUS_EXECUTED: u8 = 4;

    /// Bu demo için sabit: 6 kişi oy kullanacak
    const DEFAULT_TOTAL_VOTERS: u8 = 6;

    /// Topluluk bütçesi
    public struct CommunityBudget has key {
        id: UID,
        name: String,
        total: u64,
        spent: u64,
    }

    /// Öneri / Problem kartı
    ///
    /// chat_channel_id:
    ///   - Messaging SDK ile frontend’de bir kanal açtığında aldığın ID’yi
    ///     burada saklayabilirsin (örneğin bir roomId, conversationId vs.).
    public struct Proposal has key {
        id: UID,
        title: String,
        description: String,
        amount: u64,
        status: u8,
        yes_votes: u64,
        no_votes: u64,
        /// Bu öneri için oy kullanacak toplam kişi sayısı (biz 6 yapıyoruz)
        total_voters: u8,
        /// Şu ana kadar kaç kişi oy verdi
        votes_cast: u8,
        creator: address,
        /// Para hangi adrese gidecek (kulüp cüzdanı vs.)
        receiver: address,
        /// Sui Messaging SDK kanal kimliği (frontend’den gelecek)
        chat_channel_id: vector<u8>,
    }

    /// Harcama log’u
    /// - Hangi proposal’dan çıktığını bilmek için proposal_id de saklıyoruz.
    public struct SpendingLog has key {
        id: UID,
        proposal_id: ID,
        amount: u64,
        receiver: address,
    }

    /// İlk bütçeyi oluştur (ör: "42 Kocaeli Bütçesi", 1000 birim)
    public entry fun create_budget(
        name_bytes: vector<u8>,
        total: u64,
        ctx: &mut TxContext
    ) {
        let sender = Tx::sender(ctx);

        let budget = CommunityBudget {
            id: Object::new(ctx),
            name: StringMod::utf8(name_bytes),
            total,
            spent: 0,
        };

        transfer::transfer(budget, sender);
    }

    /// Yeni bir öneri (problem + çözüm talebi) oluştur
    ///
    /// Frontend akışı:
    ///   1. Messaging SDK ile bir chat kanalı aç (ör: room/channel oluştur).
    ///   2. O kanaldan aldığın `channel_id` (bytes) değerini bu fonksiyona argüman olarak gönder.
    public entry fun create_proposal(
        title_bytes: vector<u8>,
        description_bytes: vector<u8>,
        amount: u64,
        receiver: address,
        chat_channel_id: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = Tx::sender(ctx);

        let proposal = Proposal {
            id: Object::new(ctx),
            title: StringMod::utf8(title_bytes),
            description: StringMod::utf8(description_bytes),
            amount,
            status: STATUS_VOTING, // şimdilik direkt “oylama” durumunda açıyoruz
            yes_votes: 0,
            no_votes: 0,
            total_voters: DEFAULT_TOTAL_VOTERS, // = 6
            votes_cast: 0,
            creator: sender,
            receiver,
            chat_channel_id,
        };

        transfer::transfer(proposal, sender);
    }

    /// Oy verme fonksiyonu
    /// - Her oyda yes/no sayıları güncellenir
    /// - votes_cast 1 artar
    /// - votes_cast == total_voters olduğunda otomatik finalize edilir
    public entry fun vote(
        budget: &mut CommunityBudget,
        proposal: &mut Proposal,
        choice: bool,
        ctx: &mut TxContext
    ) {
        // Sadece oylama durumunda oy verilebilsin
        assert!(proposal.status == STATUS_VOTING, 1);

        if (choice) {
            proposal.yes_votes = proposal.yes_votes + 1;
        } else {
            proposal.no_votes = proposal.no_votes + 1;
        };

        // Kullanılmış oy sayısını arttır
        proposal.votes_cast = proposal.votes_cast + 1;

        // Eğer tüm seçmenler oy vermişse, sonucu otomatik olarak belirle
        if (proposal.votes_cast == proposal.total_voters) {
            finalize_proposal(budget, proposal, ctx);
        };
    }

    /// İç fonksiyon: tüm oylar geldikten sonra sonucu belirler.
    /// - yes > no ise: bütçeden düş, log oluştur, status = EXECUTED
    /// - aksi halde: status = REJECTED
    fun finalize_proposal(
        budget: &mut CommunityBudget,
        proposal: &mut Proposal,
        ctx: &mut TxContext
    ) {
        let sender = Tx::sender(ctx);

        if (proposal.yes_votes > proposal.no_votes) {
            // Öneri kabul
            let remaining = budget.total - budget.spent;
            assert!(remaining >= proposal.amount, 4);

            budget.spent = budget.spent + proposal.amount;
            proposal.status = STATUS_EXECUTED;

            //let proposal_id = Object::id(&proposal);

			// let proposal_ref: &Proposal = &*proposal;
            // let proposal_id: ID = Object::id(proposal_ref);
			let proposal_id: ID = Object::id(proposal);

            let log = SpendingLog {
                id: Object::new(ctx),
                proposal_id,
                amount: proposal.amount,
                receiver: proposal.receiver,
            };

            transfer::transfer(log, sender);
        } else {
            // Reddedildi
            proposal.status = STATUS_REJECTED;
        };
    }

    /// Gerekirse admin/manual tetiklemek için (opsiyonel)
    /// Örneğin demo sırasında hata olursa elle de çalıştırabilirsin.
    public entry fun manual_finalize(
        budget: &mut CommunityBudget,
        proposal: &mut Proposal,
        ctx: &mut TxContext
    ) {
        finalize_proposal(budget, proposal, ctx);
    }
}
