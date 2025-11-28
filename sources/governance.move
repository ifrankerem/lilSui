module community_budget::governance {
    use sui::object;
    use sui::tx_context;
    use sui::transfer;
    use sui::event;
    use std::string;
    use std::vector;

    /**********************
     *  Status enum'u     *
     **********************/

    /// Öneri durumları için enum.
    /// Sadece bu üç state’i kullanıyoruz: Voting, Rejected, Executed.
    public enum ProposalStatus has copy, drop, store {
        Voting(),
        Rejected(),
        Executed(),
    }

    /**********************
     *  Hata kodları      *
     **********************/

    /// Oy verme sadece VOTING durumunda mümkün
    const E_NOT_IN_VOTING_STATUS: u64 = 1;
    /// Proposal için hiç participant verilmemiş
    const E_ZERO_PARTICIPANTS: u64 = 2;
    /// Çok fazla participant
    const E_TOO_MANY_PARTICIPANTS: u64 = 3;
    /// Bütçe, proposal.amount'ı karşılayamıyor
    const E_BUDGET_INSUFFICIENT: u64 = 4;

    /**********************
     *  Struct'lar        *
     **********************/

    /// Topluluk bütçesi
    public struct CommunityBudget has key {
        id: object::UID,
        name: string::String,
        total: u64,
        spent: u64,
    }

    /// Öneri / Problem kartı
    ///
    /// `participants`:
    ///  - Messaging SDK ile kanal oluştururken UI'de girdiğin
    ///    Sui adresleri (0x... listesi) burada tutuluyor.
    ///  - Frontend bu vector'den yola çıkarak channel'ı oluşturabilir.
    public struct Proposal has key {
        id: object::UID,
        title: string::String,
        description: string::String,
        amount: u64,
        status: ProposalStatus,
        yes_votes: u64,
        no_votes: u64,
        /// Bu öneri için oy kullanacak toplam kişi sayısı
        total_voters: u64,
        /// Şu ana kadar kaç kişi oy verdi
        votes_cast: u64,
        creator: address,
        /// Para hangi adrese gidecek (kulüp/organizasyon cüzdanı vs.)
        receiver: address,
        /// Messaging kanalına dahil olan tüm Sui adresleri
        participants: vector<address>,
    }

    /// Bütçeden harcama yapıldığında emit edilen event.
    /// Log ekranında bu event'leri okuyup tabloyu doldurabilirsin.
    public struct SpendingEvent has copy, drop {
        budget_id: object::ID,
        proposal_id: object::ID,
        amount: u64,
        receiver: address,
    }

    /**********************
     *  Entry fonksiyonlar *
     **********************/

    /// İlk bütçeyi oluştur (ör: "42 Kocaeli Budget", 1000 birim).
    /// Shared object olarak publish ediliyor.
    public entry fun create_budget(
        name_bytes: vector<u8>,
        total: u64,
        ctx: &mut tx_context::TxContext,
    ) {
        let budget = CommunityBudget {
            id: object::new(ctx),
            name: string::utf8(name_bytes),
            total,
            spent: 0,
        };

        // Topluluk bütçesini shared yapıyoruz ki herkes okuyup güncelleyebilsin.
        transfer::share_object(budget);
    }

    /// Yeni bir öneri (problem + çözüm talebi) oluştur.
    ///
    /// Frontend akışı:
    ///   1. Messaging SDK ile kanal oluştururken UI'de participant
    ///      adreslerini toplarsın.
    ///   2. Aynı adres listesini `participants` argümanı olarak
    ///      bu fonksiyona gönderirsin.
    public entry fun create_proposal(
        title_bytes: vector<u8>,
        description_bytes: vector<u8>,
        amount: u64,
        receiver: address,
        participants: vector<address>,
        ctx: &mut tx_context::TxContext,
    ) {
        let creator = tx_context::sender(ctx);

        let count = vector::length(&participants);
        // En az bir participant olsun
        assert!(count > 0, E_ZERO_PARTICIPANTS);
        // İstersen yukarı limit de koy (opsiyonel)
        assert!(count <= 1000, E_TOO_MANY_PARTICIPANTS);

        let proposal = Proposal {
            id: object::new(ctx),
            title: string::utf8(title_bytes),
            description: string::utf8(description_bytes),
            amount,
            status: ProposalStatus::Voting(),
            yes_votes: 0,
            no_votes: 0,
            total_voters: count,
            votes_cast: 0,
            creator,
            receiver,
            participants,
        };

        // Proposal da shared object oluyor; herkes görebilir / oy verebilir.
        transfer::share_object(proposal);
    }

    /// Oy verme fonksiyonu.
    /// - Her oyda yes/no sayıları güncellenir
    /// - votes_cast 1 artar
    /// - votes_cast == total_voters olduğunda otomatik finalize edilir
	public entry fun vote(
		budget: &mut CommunityBudget,
		proposal: &mut Proposal,
		choice: bool,
		_ctx: &mut tx_context::TxContext,
	) {
		// Basit guard: zaten yeterli oy kullanılmışsa, tekrar oy verme.
		if (proposal.votes_cast >= proposal.total_voters) {
			abort E_NOT_IN_VOTING_STATUS;
		};

		if (choice) {
			proposal.yes_votes = proposal.yes_votes + 1;
		} else {
			proposal.no_votes = proposal.no_votes + 1;
		};

		proposal.votes_cast = proposal.votes_cast + 1;

		if (proposal.votes_cast == proposal.total_voters) {
			finalize_proposal(budget, proposal);
		};
	}

    /**********************
     *  İç fonksiyonlar   *
     **********************/

    /// Tüm oylar geldikten sonra sonucu belirler.
    /// - yes > no ise: bütçeden düş, event emit et, status = Executed
    /// - aksi halde: status = Rejected
    fun finalize_proposal(
        budget: &mut CommunityBudget,
        proposal: &mut Proposal,
    ) {
        if (proposal.yes_votes > proposal.no_votes) {
            let remaining = budget.total - budget.spent;
            assert!(remaining >= proposal.amount, E_BUDGET_INSUFFICIENT);

            budget.spent = budget.spent + proposal.amount;
            proposal.status = ProposalStatus::Executed();

            let budget_id = object::id(budget);
            let proposal_id = object::id(proposal);

            event::emit(SpendingEvent {
                budget_id,
                proposal_id,
                amount: proposal.amount,
                receiver: proposal.receiver,
            });
        } else {
            // Oy çokluğu yoksa reddedildi
            proposal.status = ProposalStatus::Rejected();
        };
    }
}