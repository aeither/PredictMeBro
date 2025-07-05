import { createFileRoute } from '@tanstack/react-router'
import CreatePoolModal from "@/components/CreatePoolModal";
import AllPoolsList from "@/components/AllPoolsList";
import { toast } from "sonner";
import { useEscrowContract } from "@/hooks/useEscrowContract";

export const Route = createFileRoute('/flow')({
  component: FlowPage,
})

function FlowPage() {
  const { vote } = useEscrowContract();

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
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#ededed' }}>All Flow Pools</h2>
          <AllPoolsList onVote={handleVote} />
        </div>
      </main>
    </div>
  );
}

 