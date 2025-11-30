module community_budget::governance {
    use sui::object;
    use sui::tx_context;
    use sui::transfer;
    use sui::event;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::table::{Self, Table};
    use std::string;
    use std::vector;

    /**********************
     *  Status enum       *
     **********************/

    public enum ProposalStatus has copy, drop, store {
        Voting(),
        Rejected(),
        Executed(),
    }

    /**********************
     *  Error codes       *
     **********************/

    const E_NOT_IN_VOTING_STATUS: u64 = 1;
    const E_ZERO_PARTICIPANTS: u64 = 2;
    const E_TOO_MANY_PARTICIPANTS: u64 = 3;
    const E_BUDGET_INSUFFICIENT: u64 = 4;
    const E_NOT_ADMIN: u64 = 5;
    const E_ALREADY_VOTED: u64 = 6;
    const E_NOT_PARTICIPANT: u64 = 7;
    const E_WRONG_BUDGET: u64 = 8;

    /**********************
     *  Structs           *
     **********************/

    public struct AdminCap has key, store {
        id: object::UID,
    }

    public struct CommunityBudget has key {
        id: object::UID,
        name: string::String,
        total: u64,
        spent: u64,
        funds: Balance<SUI>,
    }

    public struct Proposal has key {
        id: object::UID,
        budget_id: object::ID,
        title: string::String,
        description: string::String,
        amount: u64,
        status: ProposalStatus,
        yes_votes: u64,
        no_votes: u64,
        total_voters: u64,
        votes_cast: u64,
        creator: address,
        receiver: address,
        participants: vector<address>,
        voted: Table<address, bool>,
    }

    public struct SpendingEvent has copy, drop {
        budget_id: object::ID,
        proposal_id: object::ID,
        amount: u64,
        receiver: address,
    }

    public struct ProposalCreatedEvent has copy, drop {
        proposal_id: object::ID,
        budget_id: object::ID,
        creator: address,
        participants: vector<address>,
    }

    /**********************
     *  Init function     *
     **********************/

    fun init(ctx: &mut tx_context::TxContext) {
        let admin_address = @0xea8ae94f8ff05578afe1ec7d5b55f30d864bf1f8411a39fe597fd755dbbfc41d;
        transfer::transfer(AdminCap {
            id: object::new(ctx),
        }, admin_address);
    }

    /**********************
     *  Entry functions   *
     **********************/

    public entry fun create_budget(
        _admin: &AdminCap,
        name_bytes: vector<u8>,
        coin: &mut Coin<SUI>,
        amount: u64,
        ctx: &mut tx_context::TxContext,
    ) {
        let budget_coin = coin::split(coin, amount, ctx);
        
        let budget = CommunityBudget {
            id: object::new(ctx),
            name: string::utf8(name_bytes),
            total: amount,
            spent: 0,
            funds: coin::into_balance(budget_coin),
        };

        transfer::share_object(budget);
    }

    public entry fun create_proposal(
        budget: &CommunityBudget,
        title_bytes: vector<u8>,
        description_bytes: vector<u8>,
        amount: u64,
        receiver: address,
        participants: vector<address>,
        ctx: &mut tx_context::TxContext,
    ) {
        let creator = tx_context::sender(ctx);

        let count = vector::length(&participants);
        assert!(count > 0, E_ZERO_PARTICIPANTS);
        assert!(count <= 1000, E_TOO_MANY_PARTICIPANTS);

        let proposal = Proposal {
            id: object::new(ctx),
            budget_id: object::id(budget),
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
            voted: table::new(ctx),
        };

        event::emit(ProposalCreatedEvent {
            proposal_id: object::id(&proposal),
            budget_id: object::id(budget),
            creator,
            participants,
        });

        transfer::share_object(proposal);
    }

    public entry fun vote(
        budget: &mut CommunityBudget,
        proposal: &mut Proposal,
        choice: bool,
        ctx: &mut tx_context::TxContext,
    ) {
        let voter = tx_context::sender(ctx);

        // Check: Doğru budget mi?
        assert!(object::id(budget) == proposal.budget_id, E_WRONG_BUDGET);

        // Check: Voting durumunda mı?
        assert!(proposal.votes_cast < proposal. total_voters, E_NOT_IN_VOTING_STATUS);

        // Check: Participant mı?
        assert!(is_participant(&proposal.participants, voter), E_NOT_PARTICIPANT);

        // Check: Daha önce oy vermiş mi?
        assert! (!table::contains(&proposal. voted, voter), E_ALREADY_VOTED);

        // Oy ver
        if (choice) {
            proposal.yes_votes = proposal.yes_votes + 1;
        } else {
            proposal.no_votes = proposal.no_votes + 1;
        };

        // Oy verildi olarak işaretle
        table::add(&mut proposal.voted, voter, choice);
        proposal.votes_cast = proposal.votes_cast + 1;

        // Tüm oylar toplandı mı?
        if (proposal.votes_cast == proposal.total_voters) {
            finalize_proposal(budget, proposal, ctx);
        };
    }

    /**********************
     *  Internal functions *
     **********************/

    fun is_participant(participants: &vector<address>, addr: address): bool {
        let len = vector::length(participants);
        let mut i = 0;
        while (i < len) {
            if (*vector::borrow(participants, i) == addr) {
                return true
            };
            i = i + 1;
        };
        false
    }

    fun finalize_proposal(
        budget: &mut CommunityBudget,
        proposal: &mut Proposal,
        ctx: &mut tx_context::TxContext,
    ) {
        if (proposal.yes_votes > proposal. no_votes) {
            let remaining = balance::value(&budget.funds);
            assert!(remaining >= proposal. amount, E_BUDGET_INSUFFICIENT);

            let payment = coin::take(&mut budget.funds, proposal.amount, ctx);
            transfer::public_transfer(payment, proposal.receiver);

            budget.spent = budget. spent + proposal.amount;
            proposal. status = ProposalStatus::Executed();

            event::emit(SpendingEvent {
                budget_id: object::id(budget),
                proposal_id: object::id(proposal),
                amount: proposal. amount,
                receiver: proposal.receiver,
            });
        } else {
            proposal.status = ProposalStatus::Rejected();
        };
    }
}