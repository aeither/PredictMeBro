import { createFileRoute } from '@tanstack/react-router'
import { useState } from "react";
import PredictionPool from "@/components/PredictionPool";
import CreatePoolModal from "@/components/CreatePoolModal";
import { toast } from "sonner";

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

  const handleCreatePool = (poolData: { question: string; participationAmount: number }) => {
    const newPool: Pool = {
      id: `ronin-${Date.now()}`,
      question: poolData.question,
      totalAmount: 0,
      yesVotes: 0,
      noVotes: 0,
      endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      participationAmount: poolData.participationAmount,
    };
    
    setPools(prev => [newPool, ...prev]);
  };

  const handleVote = (poolId: string, vote: "yes" | "no") => {
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

    toast.success(`Vote submitted: ${vote.toUpperCase()} on Ronin`, {
      description: "Your vote has been recorded on Ronin blockchain!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="bg-gradient-hero rounded-2xl p-8 mb-8" style={{ 
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1))',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#ededed' }}>
              Ronin Prediction Markets
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: '#a0a0a0' }}>
              Create and participate in prediction markets on Ronin blockchain. Connect with Tanto.
            </p>
            <CreatePoolModal onCreatePool={handleCreatePool} />
          </div>
        </div>

        {/* Pools Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#ededed' }}>Active Ronin Pools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pools.map((pool) => (
              <PredictionPool key={pool.id} {...pool} onVote={handleVote} />
            ))}
          </div>
          
          {pools.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg" style={{ color: '#a0a0a0' }}>No Ronin prediction pools yet.</p>
              <p style={{ color: '#a0a0a0' }}>Be the first to create one!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 