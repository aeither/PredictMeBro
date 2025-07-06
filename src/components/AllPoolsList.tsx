import { useAccount } from 'wagmi'
import PredictionPool from './PredictionPool'
import { useEscrowContract, useAllPoolsData } from '@/hooks/useEscrowContract'

interface AllPoolsListProps {
  onVote: (poolId: string, voteChoice: "yes" | "no", participationAmount: number) => void
  onResolve?: (poolId: string, winningVote: boolean) => void
  onClaim?: (poolId: string) => void
}

const AllPoolsList = ({ onVote, onResolve, onClaim }: AllPoolsListProps) => {
  const { address } = useAccount()
  const { totalPools } = useEscrowContract()
  const { pools, isLoading, error } = useAllPoolsData()

  if (error) {
    return <ErrorDisplay error={error} />
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-6"></div>
        <h3 className="text-lg font-semibold text-white mb-2">Loading pools...</h3>
        <p className="text-sm text-gray-300 mb-6">Found <span className="font-semibold text-purple-300">{totalPools}</span> total pools</p>
        <div className="mt-4 p-4 glass-card rounded-lg max-w-md mx-auto border border-gray-700/50">
          <p className="text-xs font-semibold text-gray-300 mb-2">Debug Info:</p>
          <div className="space-y-1 text-left">
            <p className="text-xs text-gray-200">Total Pools: <span className="text-purple-300 font-medium">{totalPools}</span></p>
            <p className="text-xs text-gray-200">Wallet: <span className="text-blue-300 font-medium">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}</span></p>
          </div>
        </div>
      </div>
    )
  }

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
            <p className="text-xs text-gray-200">Total Pools: <span className="text-purple-300 font-medium">{totalPools}</span></p>
            <p className="text-xs text-gray-200">Wallet: <span className="text-blue-300 font-medium">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}</span></p>
            <p className="text-xs text-gray-200">Status: <span className={`font-medium ${totalPools > 0 ? 'text-yellow-300' : 'text-green-300'}`}>{totalPools > 0 ? 'Pools exist but loading...' : 'No pools created yet'}</span></p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg px-3 py-2 backdrop-blur-sm">
          <p className="text-sm text-gray-200 font-medium">
            Showing <span className="text-white font-semibold">{pools.length}</span> pools 
            <span className="text-gray-400"> (out of {totalPools} total)</span>
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-500/30 text-blue-300 hover:from-blue-600/50 hover:to-purple-600/50 hover:text-blue-200 rounded-lg text-sm backdrop-blur-sm transition-all duration-200 font-medium"
        >
          🔄 Refresh
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pools.map((pool) => (
          <PredictionPool
            key={pool.id}
            {...pool}
            onVote={(poolId, voteChoice) => onVote(poolId, voteChoice, pool.participationAmount)}
            onResolve={(poolId, winningVote) => onResolve?.(poolId, winningVote)}
            onClaim={(poolId) => onClaim?.(poolId)}
          />
        ))}
      </div>
    </div>
  )
}

// Error display component
const ErrorDisplay = ({ error }: { error: string }) => (
  <div className="text-center py-12">
    <div className="mb-6">
      <div className="text-6xl mb-4">⚠️</div>
      <h3 className="text-xl font-semibold text-red-300 mb-2">Error loading pools</h3>
      <div className="max-w-md mx-auto p-4 glass-card rounded-lg border border-red-700/30 bg-red-900/10">
        <p className="text-sm text-red-200 font-medium break-words">{error}</p>
      </div>
    </div>
  </div>
)

export default AllPoolsList 