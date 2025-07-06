import { createFileRoute } from '@tanstack/react-router'
import CreatePoolModal from "@/components/CreatePoolModal";
import AllPoolsList from "@/components/AllPoolsList";
import { toast } from "sonner";
import { useEscrowContract } from "@/hooks/useEscrowContract";
import { useVoteNotifications } from "@/hooks/useVoteNotifications";
import { useAccount } from 'wagmi';

export const Route = createFileRoute('/flow')({
  component: FlowPage,
})

function FlowPage() {
  const { vote } = useEscrowContract();
  const { address } = useAccount();
  const { broadcastVote } = useVoteNotifications(address);

  const handlePoolCreated = () => {
    // Pools will be automatically refetched by the AllPoolsList component
    toast.success("Pool created successfully!", {
      description: "Your prediction pool is now active on Flow blockchain.",
    });
  };

  const handleVote = async (poolId: string, voteChoice: "yes" | "no", participationAmount: number) => {
    try {
      // Extract the numeric ID from the poolId (remove "flow-" prefix)
      const numericId = BigInt(poolId.replace('flow-', ''));
      
      await vote(numericId, voteChoice === "yes", participationAmount);
      
      // Broadcast the vote to other users
      if (address) {
        try {
          await broadcastVote({
            poolId: poolId,
            vote: voteChoice,
            blockchain: 'flow',
            voter: address,
            timestamp: new Date().toISOString(),
            amount: participationAmount
          });
        } catch (broadcastError) {
          console.warn('Failed to broadcast vote:', broadcastError);
        }
      }
      
      toast.success(`Vote submitted: ${voteChoice.toUpperCase()} on Flow`, {
        description: "Your vote has been recorded on Flow blockchain!",
      });

    } catch (error) {
      console.error('Error voting:', error);
      toast.error("Failed to vote", {
        description: "Could not submit your vote. Please try again."
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="glass-card rounded-3xl p-8 mb-8 shadow-glow">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Flow Prediction Markets
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-300">
              Create and participate in prediction markets on Flow blockchain. Connect with Privy.
            </p>
            <CreatePoolModal onPoolCreated={handlePoolCreated} />
          </div>
        </div>

        {/* Pools Grid */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6 text-white">All Flow Pools</h2>
          <AllPoolsList onVote={handleVote} />
        </div>
      </main>
    </div>
  );
}

 