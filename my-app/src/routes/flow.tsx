import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from "react";
import PredictionPool from "@/components/PredictionPool";
import CreatePoolModal from "@/components/CreatePoolModal";
import { toast } from "sonner";
import { useEscrowContract } from "@/hooks/useEscrowContract";
import type { ContractPool } from "@/hooks/useEscrowContract";

export const Route = createFileRoute('/flow')({
  component: FlowPage,
})

function FlowPage() {
  const [pools, setPools] = useState<ContractPool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { totalPools, vote } = useEscrowContract();

  // Load pools from contract
  const loadPools = async () => {
    setIsLoading(true);
    try {
      const poolsData: ContractPool[] = [];
      
      // For now, we'll show a message if no pools exist
      // In a real implementation, you'd fetch all pools from the contract
      if (totalPools === 0) {
        setIsLoading(false);
        return;
      }

      // Load each pool (this is a simplified version)
      // In practice, you'd want to batch these calls or use events
      for (let i = 1; i <= totalPools; i++) {
        // This would fetch pool data using the contract hooks
        // For now, we'll just set an empty array
      }
      
      setPools(poolsData);
    } catch (error) {
      console.error('Error loading pools:', error);
      toast.error("Failed to load pools", {
        description: "Could not fetch pools from the contract."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPools();
  }, [totalPools]);

  const handlePoolCreated = () => {
    // Refetch pools after a new one is created
    loadPools();
  };

  const handleVote = async (poolId: string, voteChoice: "yes" | "no") => {
    try {
      // Extract the numeric ID from the poolId (remove "flow-" prefix)
      const numericId = BigInt(poolId.replace('flow-', ''));
      const pool = pools.find(p => p.id === poolId);
      
      if (!pool) {
        toast.error("Pool not found");
        return;
      }

      await vote(numericId, voteChoice === "yes", pool.participationAmount);
      
      toast.success(`Vote submitted: ${voteChoice.toUpperCase()} on Flow`, {
        description: "Your vote has been recorded on Flow blockchain!",
      });

      // Reload pools to get updated data
      await loadPools();
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
          <div className="bg-gradient-hero rounded-2xl p-8 mb-8" style={{ 
            background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.1), rgba(30, 144, 255, 0.1))',
            border: '1px solid rgba(138, 43, 226, 0.2)'
          }}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#ededed' }}>
              Flow Prediction Markets
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: '#a0a0a0' }}>
              Create and participate in prediction markets on Flow blockchain. Connect with Privy.
            </p>
            <CreatePoolModal onPoolCreated={handlePoolCreated} />
          </div>
        </div>

        {/* Pools Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#ededed' }}>Active Flow Pools</h2>
          
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-lg" style={{ color: '#a0a0a0' }}>Loading pools...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pools.map((pool) => (
                  <PredictionPool key={pool.id} {...pool} onVote={handleVote} />
                ))}
              </div>
              
              {pools.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-lg" style={{ color: '#a0a0a0' }}>No Flow prediction pools yet.</p>
                  <p style={{ color: '#a0a0a0' }}>Be the first to create one!</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

 