import { createFileRoute } from '@tanstack/react-router'
import { useState } from "react";
import PredictionPool from "@/components/PredictionPool";
import CreatePoolModal from "@/components/CreatePoolModal";
import { toast } from "sonner";
import { useVoteNotifications } from "@/hooks/useVoteNotifications";
import { TantoConnectButton } from '@sky-mavis/tanto-widget';

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
    // Refresh the page or update pools state
    toast.success("Pool created successfully!", {
      description: "Your prediction pool is now active on Ronin blockchain.",
    });
  };

  return (
    <TantoConnectButton>
      {({ address }) => (
        <RoninPageContent 
          pools={pools} 
          setPools={setPools} 
          handlePoolCreated={handlePoolCreated}
          currentAddress={address}
        />
      )}
    </TantoConnectButton>
  );
}

function RoninPageContent({ 
  pools, 
  setPools, 
  handlePoolCreated, 
  currentAddress 
}: {
  pools: Pool[];
  setPools: React.Dispatch<React.SetStateAction<Pool[]>>;
  handlePoolCreated: () => void;
  currentAddress?: string;
}) {
  const { broadcastVote } = useVoteNotifications(currentAddress);

  const handleVote = async (poolId: string, vote: "yes" | "no") => {
    setPools(prev => prev.map(pool => {
      if (pool.id === poolId) {
        return {
          ...pool,
          yesVotes: vote === "yes" ? pool.yesVotes + 1 : pool.yesVotes,
          noVotes: vote === "no" ? pool.noVotes + 1 : pool.noVotes,
          totalAmount: pool.totalAmount + pool.participationAmount,
        };
      }
      return pool;
    }));

    // Broadcast the vote to other users
    if (currentAddress) {
      try {
        await broadcastVote({
          poolId: poolId,
          vote: vote,
          blockchain: 'ronin',
          voter: currentAddress,
          timestamp: new Date().toISOString(),
          amount: pools.find(p => p.id === poolId)?.participationAmount || 0
        });
      } catch (broadcastError) {
        console.warn('Failed to broadcast vote:', broadcastError);
      }
    }

    toast.success(`Vote submitted: ${vote.toUpperCase()} on Ronin`, {
      description: "Your vote has been recorded on Ronin blockchain!",
    });
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
            <CreatePoolModal onPoolCreated={handlePoolCreated} />
          </div>
        </div>

        {/* Pools Grid */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6 text-white">Active Ronin Pools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pools.map((pool) => (
              <PredictionPool key={pool.id} {...pool} onVote={handleVote} />
            ))}
          </div>
          
          {pools.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-gray-400">No Ronin prediction pools yet.</p>
              <p className="text-gray-400">Be the first to create one!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 