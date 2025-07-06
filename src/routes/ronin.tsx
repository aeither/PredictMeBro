import { createFileRoute } from '@tanstack/react-router'
import CreatePoolModal from "@/components/CreatePoolModal";
import AllPoolsList from "@/components/AllPoolsList";
import { toast } from "sonner";
import { useEscrowContract } from "@/hooks/useEscrowContract";
import { usePoolNotifications } from "@/hooks/usePoolNotifications";
import { useRealtimeToasts } from "@/hooks/useRealtimeToasts";
import { useAccount } from 'wagmi';

export const Route = createFileRoute('/ronin')({
  component: RoninPage,
})

function RoninPage() {
  const { vote, resolvePool, claimReward } = useEscrowContract();
  const { address } = useAccount();
  const { isListening } = usePoolNotifications();
  const { broadcastSuccess, broadcastError, broadcastInfo, isConnected } = useRealtimeToasts('ronin');

  const handlePoolCreated = () => {
    toast.success("Pool created successfully!", {
      description: "Your prediction pool is now active on Ronin blockchain.",
    });
    broadcastSuccess("Pool created successfully!", "Your prediction pool is now active on Ronin blockchain.", "🛡️");
  };

  const handleVote = async (poolId: string, voteChoice: "yes" | "no", participationAmount: number) => {
    try {
      const numericId = BigInt(poolId.replace('ronin-', ''));
      await vote(numericId, voteChoice === "yes", participationAmount);
      toast.success(`Vote submitted: ${voteChoice.toUpperCase()} on Ronin`, {
        description: "Your vote has been recorded on Ronin blockchain!",
      });
      broadcastSuccess(`Vote submitted: ${voteChoice.toUpperCase()} on Ronin`, "Your vote has been recorded on Ronin blockchain!", "🛡️");
    } catch (error) {
      console.error('Error voting:', error);
      toast.error("Failed to vote", {
        description: "Could not submit your vote. Please try again."
      });
      broadcastError("Failed to vote", "Could not submit your vote. Please try again.", "🛡️");
    }
  };

  const handleResolve = async (poolId: string, winningVote: boolean) => {
    try {
      const numericId = BigInt(poolId.replace('ronin-', ''));
      await resolvePool(numericId, winningVote);
      toast.success(`Pool resolved: ${winningVote ? "YES" : "NO"} wins!`, {
        description: "The pool has been resolved on Ronin blockchain.",
      });
      broadcastSuccess(`Pool resolved: ${winningVote ? "YES" : "NO"} wins!`, "The pool has been resolved on Ronin blockchain.", "🛡️");
    } catch (error) {
      console.error('Error resolving pool:', error);
      toast.error("Failed to resolve pool", {
        description: "Could not resolve the pool. Please try again."
      });
      broadcastError("Failed to resolve pool", "Could not resolve the pool. Please try again.", "🛡️");
    }
  };

  const handleClaim = async (poolId: string) => {
    try {
      const numericId = BigInt(poolId.replace('ronin-', ''));
      await claimReward(numericId);
      toast.success("Reward claimed successfully!", {
        description: "Your reward has been claimed from Ronin blockchain.",
      });
      broadcastSuccess("Reward claimed successfully!", "Your reward has been claimed from Ronin blockchain.", "🛡️");
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast.error("Failed to claim reward", {
        description: "Could not claim your reward. Please try again."
      });
      broadcastError("Failed to claim reward", "Could not claim your reward. Please try again.", "🛡️");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="glass-card rounded-3xl p-8 mb-8 shadow-glow">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              Ronin Prediction Markets
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-300">
              Create and participate in prediction markets on Ronin blockchain. Connect with Tanto.
            </p>
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 backdrop-blur-sm">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-sm text-gray-300">
                {isConnected ? 'Live Updates: Connected' : 'Live Updates: Connecting...'}
              </span>
            </div>
            <CreatePoolModal onPoolCreated={handlePoolCreated} />
          </div>
        </div>
        {/* Pools Grid */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6 text-white">All Ronin Pools</h2>
          <AllPoolsList onVote={handleVote} onResolve={handleResolve} onClaim={handleClaim} />
        </div>
      </main>
    </div>
  );
} 