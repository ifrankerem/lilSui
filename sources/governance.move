module community_budget::governance {
    use sui::object;
    use sui::tx_context;
    use sui::transfer;
    use sui::event;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use std::string;
    use std::vector;

    /**********************
     *  Status enum       *
     **********************/

    /// Proposal status enum.
    /// Only three states: Voting, Rejected, Executed.
    public enum ProposalStatus has copy, drop, store {
        Voting(),
        Rejected(),
        Executed(),
    }

    /**********************
     *  Error codes       *
     **********************/

    /// Voting is only possible during VOTING status
    const E_NOT_IN_VOTING_STATUS: u64 = 1;
    /// No participants provided for proposal
    const E_ZERO_PARTICIPANTS: u64 = 2;
    /// Too many participants
    const E_TOO_MANY_PARTICIPANTS: u64 = 3;
    /// Budget cannot cover proposal.amount
    const E_BUDGET_INSUFFICIENT: u64 = 4;
    /// Not admin
    const E_NOT_ADMIN: u64 = 5;

    /**********************
     *  Structs           *
     **********************/

    /// Admin capability - only the holder of this object can create budgets
    public struct AdminCap has key, store {
        id: object::UID,
    }

    /// Community budget with real SUI balance
    public struct CommunityBudget has key {
        id: object::UID,
        name: string::String,
        total: u64,
        spent: u64,
        /// Real SUI balance
        funds: Balance<SUI>,
    }

    /// Proposal / Problem card
    ///
    /// `participants`:
    ///  - Sui addresses (0x... list) for messaging channel
    ///  - Frontend can create channel from this vector
    public struct Proposal has key {
        id: object::UID,
        title: string::String,
        description: string::String,
        amount: u64,
        status: ProposalStatus,
        yes_votes: u64,
        no_votes: u64,
        /// Total number of voters for this proposal
        total_voters: u64,
        /// Votes cast so far
        votes_cast: u64,
        creator: address,
        /// Address to receive the funds (club/organization wallet)
        receiver: address,
        /// All Sui addresses participating in the messaging channel
        participants: vector<address>,
    }

    /// Event emitted when spending from budget.
    /// Used to populate the log table in the frontend.
    public struct SpendingEvent has copy, drop {
        budget_id: object::ID,
        proposal_id: object::ID,
        amount: u64,
        receiver: address,
    }

    /**********************
     *  Init function     *
     **********************/

    /// When contract is deployed, send AdminCap to the designated admin address
    fun init(ctx: &mut tx_context::TxContext) {
        let admin_address = @0x6b34f727c0faba6ab8e45fe344432fd14f3a31c4ee968a354c1940233d02daf6;
        transfer::transfer(AdminCap {
            id: object::new(ctx),
        }, admin_address);
    }

    /**********************
     *  Entry functions   *
     **********************/

    /// Create a budget (only AdminCap holder can do this).
    /// coin: Mutable reference to the coin to split from
    /// amount: Amount to deposit into the budget (in MIST)
    /// The remaining balance stays with the user
    public entry fun create_budget(
        _admin: &AdminCap,
        name_bytes: vector<u8>,
        coin: &mut Coin<SUI>,
        amount: u64,
        ctx: &mut tx_context::TxContext,
    ) {
        // Split only the requested amount from the coin
        let budget_coin = coin::split(coin, amount, ctx);
        
        let budget = CommunityBudget {
            id: object::new(ctx),
            name: string::utf8(name_bytes),
            total: amount,
            spent: 0,
            funds: coin::into_balance(budget_coin),
        };

        // Make budget a shared object so everyone can read and update
        transfer::share_object(budget);
    }

    /// Create a new proposal (problem + solution request).
    ///
    /// Frontend flow:
    ///   1. Collect participant addresses when creating messaging channel
    ///   2. Pass the same address list as `participants` argument
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
        // At least one participant required
        assert!(count > 0, E_ZERO_PARTICIPANTS);
        // Optional upper limit
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

        // Proposal is also a shared object; everyone can see / vote
        transfer::share_object(proposal);
    }

    /// Vote on a proposal.
    /// - Each vote updates yes/no counts
    /// - votes_cast increments by 1
    /// - When votes_cast == total_voters, automatically finalize
    public entry fun vote(
        budget: &mut CommunityBudget,
        proposal: &mut Proposal,
        choice: bool,
        ctx: &mut tx_context::TxContext,
    ) {
        // Simple guard: if enough votes have been cast, don't allow more votes
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
            finalize_proposal(budget, proposal, ctx);
        };
    }

    /**********************
     *  Internal functions *
     **********************/

    /// Determine the result after all votes have been cast.
    /// - yes > no: deduct from budget, transfer real SUI, emit event, status = Executed
    /// - otherwise: status = Rejected
    fun finalize_proposal(
        budget: &mut CommunityBudget,
        proposal: &mut Proposal,
        ctx: &mut tx_context::TxContext,
    ) {
        if (proposal.yes_votes > proposal.no_votes) {
            let remaining = balance::value(&budget.funds);
            assert!(remaining >= proposal.amount, E_BUDGET_INSUFFICIENT);

            // Extract real SUI coin and transfer to receiver
            let payment = coin::take(&mut budget.funds, proposal.amount, ctx);
            transfer::public_transfer(payment, proposal.receiver);

            budget.spent = budget.spent + proposal.amount;
            proposal.status = ProposalStatus::Executed();

            event::emit(SpendingEvent {
                budget_id: object::id(budget),
                proposal_id: object::id(proposal),
                amount: proposal.amount,
                receiver: proposal.receiver,
            });
        } else {
            // No majority, rejected
            proposal.status = ProposalStatus::Rejected();
        };
    }
}
