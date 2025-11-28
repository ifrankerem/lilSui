module community_budget::governance_test {
    use community_budget::governance;

    #[test]
    fun test_proposal_executes_when_all_yes() {
        governance::test_all_yes_scenario();
    }
}
