import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

const PACKAGE_ID = "0x774c316bb580ed5d8709f90ce6fbbd9193e78484c3b6e8868d35d618453b93b5";

export function useVote() {
  const { mutateAsync: signAndExecute, isPending } = useSignAndExecuteTransaction();

  const vote = async (params: {
    budgetId: string;
    proposalId: string;
    choice: boolean;
  }) => {
    const tx = new Transaction();

    tx.moveCall({
      target: `${PACKAGE_ID}::governance::vote`,
      arguments: [
        tx.object(params.budgetId),
        tx.object(params.proposalId),
        tx.pure.bool(params.choice),
      ],
    });

    const result = await signAndExecute({
      transaction: tx,
    });

    return result;
  };

  return { vote, isPending };
}