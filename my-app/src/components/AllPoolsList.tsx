import React from 'react'
import { useAccount } from 'wagmi'
import PredictionPool from './PredictionPool'
import { useEscrowContract, useAllPoolsData, type ContractPool } from '@/hooks/useEscrowContract'
import { toast } from 'sonner'

interface AllPoolsListProps {
  onVote: (poolId: string, voteChoice: "yes" | "no", participationAmount: number) => void
}

const AllPoolsList = ({ onVote }: AllPoolsListProps) => {
  const { address } = useAccount()
  const { totalPools } = useEscrowContract()
  const { pools, isLoading, error } = useAllPoolsData()

  if (error) {
    return <ErrorDisplay error={error} />
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-lg text-gray-300">Loading pools...</p>
        <p className="text-sm text-gray-500">Found {totalPools} total pools</p>
        <div className="mt-4 p-4 bg-gray-800 rounded-lg max-w-md mx-auto">
          <p className="text-xs text-gray-400">Debug Info:</p>
          <p className="text-xs text-gray-300">Total Pools: {totalPools}</p>
          <p className="text-xs text-gray-300">Wallet: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}</p>
        </div>
      </div>
    )
  }

  if (pools.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-300">No prediction pools yet.</p>
        <p className="text-gray-500">Be the first to create one!</p>
        <div className="mt-4 p-4 bg-gray-800 rounded-lg max-w-md mx-auto">
          <p className="text-xs text-gray-400">Debug Info:</p>
          <p className="text-xs text-gray-300">Total Pools: {totalPools}</p>
          <p className="text-xs text-gray-300">Wallet: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}</p>
          <p className="text-xs text-gray-300">Status: {totalPools > 0 ? 'Pools exist but loading...' : 'No pools created yet'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-400">
          Showing {pools.length} pools (out of {totalPools} total)
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
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
          />
        ))}
      </div>
    </div>
  )
}

// Error display component
const ErrorDisplay = ({ error }: { error: string }) => (
  <div className="text-center py-12">
    <p className="text-lg text-red-400">Error loading pools</p>
    <p className="text-gray-500">{error}</p>
  </div>
)

export default AllPoolsList 