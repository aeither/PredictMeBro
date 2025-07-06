import { createFileRoute } from '@tanstack/react-router'
import { useState } from "react";
import PredictionPool from "@/components/PredictionPool";
import CreatePoolModal from "@/components/CreatePoolModal";
import { toast } from "sonner";
import { useEscrowContract } from "@/hooks/useEscrowContract";
import { usePoolNotifications } from "@/hooks/usePoolNotifications";
import { useRealtimeToasts } from "@/hooks/useRealtimeToasts";
import { useAccount } from 'wagmi';

interface Pool {
  id: string;
  question: string;
  totalAmount: number;
  yesVotes: number;
  noVotes: number;
  endsAt: string;
  participationAmount: number;
}

export const Route = createFileRoute('/ronin')({
  component: RoninPage,
})

function RoninPage() {
  const { vote, resolvePool, claimReward } = useEscrowContract();
  const { address } = useAccount();
  const { isListening } = usePoolNotifications();
  const { broadcastSuccess, broadcastError, broadcastInfo, isConnected } = useRealtimeToasts('ronin');
  const [pools, setPools] = useState<Pool[]>([
    {
      id: "ronin-1",
      question: "Will Axie Infinity reach 1M active users by end of 2024?",
      totalAmount: 200,
      yesVotes: 12,
      noVotes: 8,
      endsAt: "2024-12-31",
      participationAmount: 10,
    },
    {
      id: "ronin-2", 
      question: "Will Ronin Network launch a new game this year?",
      totalAmount: 450,
      yesVotes: 25,
      noVotes: 15,
      endsAt: "2024-06-30",
      participationAmount: 20,
    },
  ]);

  const handlePoolCreated = () => {
    // Pools will be automatically refetched by the AllPoolsList component
    toast.success("Pool created successfully!", {
      description: "Your prediction pool is now active on Ronin blockchain.",
    });
    
    // Broadcast to other devices
    broadcastSuccess("Pool created successfully!", "Your prediction pool is now active on Ronin blockchain.", "🛡️");
  };

  const handleVote = async (poolId: string, voteChoice: "yes" | "no", participationAmount: number) => {
    try {
      // Extract the numeric ID from the poolId (remove "ronin-" prefix)
      const numericId = BigInt(poolId.replace('ronin-', ''));
      
      await vote(numericId, voteChoice === "yes", participationAmount);
      
      toast.success(`Vote submitted: ${voteChoice.toUpperCase()} on Ronin`, {
        description: "Your vote has been recorded on Ronin blockchain!",
      });
      
      // Broadcast to other devices
      broadcastSuccess(`Vote submitted: ${voteChoice.toUpperCase()} on Ronin`, "Your vote has been recorded on Ronin blockchain!", "🛡️");

    } catch (error) {
      console.error('Error voting:', error);
      toast.error("Failed to vote", {
        description: "Could not submit your vote. Please try again."
      });
      
      // Broadcast to other devices
      broadcastError("Failed to vote", "Could not submit your vote. Please try again.", "🛡️");
    }
  };

  const handleResolve = async (poolId: string, winningVote: boolean) => {
    try {
      // Extract the numeric ID from the poolId (remove "ronin-" prefix)
      const numericId = BigInt(poolId.replace('ronin-', ''));
      
      await resolvePool(numericId, winningVote);
      
      toast.success(`Pool resolved: ${winningVote ? "YES" : "NO"} wins!`, {
        description: "The pool has been resolved on Ronin blockchain.",
      });
      
      // Broadcast to other devices
      broadcastSuccess(`Pool resolved: ${winningVote ? "YES" : "NO"} wins!`, "The pool has been resolved on Ronin blockchain.", "🛡️");

    } catch (error) {
      console.error('Error resolving pool:', error);
      toast.error("Failed to resolve pool", {
        description: "Could not resolve the pool. Please try again."
      });
      
      // Broadcast to other devices
      broadcastError("Failed to resolve pool", "Could not resolve the pool. Please try again.", "🛡️");
    }
  };

  const handleClaim = async (poolId: string) => {
    try {
      // Extract the numeric ID from the poolId (remove "ronin-" prefix)
      const numericId = BigInt(poolId.replace('ronin-', ''));
      
      await claimReward(numericId);
      
      toast.success("Reward claimed successfully!", {
        description: "Your reward has been claimed from Ronin blockchain.",
      });
      
      // Broadcast to other devices
      broadcastSuccess("Reward claimed successfully!", "Your reward has been claimed from Ronin blockchain.", "🛡️");

    } catch (error) {
      console.error('Error claiming reward:', error);
      toast.error("Failed to claim reward", {
        description: "Could not claim your reward. Please try again."
      });
      
      // Broadcast to other devices
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
            
            {/* Realtime Status */}
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
          <h2 className="text-3xl font-bold mb-6 text-white">Active Ronin Pools</h2>
          <RoninPoolsList pools={pools} onVote={handleVote} onResolve={handleResolve} onClaim={handleClaim} />
        </div>
      </main>
    </div>
  );
}

// Component to match AllPoolsList structure
function RoninPoolsList({ pools, onVote, onResolve, onClaim }: { pools: Pool[]; onVote: (poolId: string, vote: "yes" | "no", participationAmount: number) => void; onResolve: (poolId: string, winningVote: boolean) => void; onClaim: (poolId: string) => void }) {
  if (pools.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-6">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-white mb-2">No prediction pools yet</h3>
          <p className="text-gray-300">Be the first to create one!</p>
        </div>
        <div className="mt-6 p-4 glass-card rounded-lg max-w-md mx-auto border border-gray-700/50">
          <p className="text-xs font-semibold text-gray-300 mb-2">Debug Info:</p>
          <div className="space-y-1 text-left">
            <p className="text-xs text-gray-200">Total Pools: <span className="text-blue-300 font-medium">{pools.length}</span></p>
            <p className="text-xs text-gray-200">Status: <span className="text-green-300 font-medium">Ready for new pools</span></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg px-3 py-2 backdrop-blur-sm">
          <p className="text-sm text-gray-200 font-medium">
            Showing <span className="text-white font-semibold">{pools.length}</span> active pools
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gradient-to-r from-blue-600/30 to-green-600/30 border border-blue-500/30 text-blue-300 hover:from-blue-600/50 hover:to-green-600/50 hover:text-blue-200 rounded-lg text-sm backdrop-blur-sm transition-all duration-200 font-medium"
        >
          🔄 Refresh
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {pools.map((pool) => (
          <PredictionPool
            key={pool.id}
            {...pool}
            onVote={(poolId, voteChoice) => onVote(poolId, voteChoice, pool.participationAmount)}
            onResolve={(poolId, winningVote) => onResolve(poolId, winningVote)}
            onClaim={() => onClaim(pool.id)}
          />
        ))}
      </div>
    </div>
  );
} 