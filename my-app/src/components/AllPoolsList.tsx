import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import PredictionPool from './PredictionPool'
import { useEscrowContract, usePoolData, type ContractPool } from '@/hooks/useEscrowContract'
import { toast } from 'sonner'

interface AllPoolsListProps {
  onVote: (poolId: string, voteChoice: "yes" | "no", participationAmount: number) => void
}

const AllPoolsList = ({ onVote }: AllPoolsListProps) => {
  const { address } = useAccount()
  const { totalPools, convertPoolData } = useEscrowContract()
  const [pools, setPools] = useState<ContractPool[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (totalPools > 0) {
      fetchAllPools()
    } else {
      setPools([])
    }
  }, [totalPools, address])

  const fetchAllPools = async () => {
    if (!totalPools || totalPools === 0) {
      setPools([])
      return
    }

    setIsLoading(true)
    console.log(`Fetching ${totalPools} pools...`)

    try {
      const poolPromises = []
      
      // Create promises for all pools
      for (let i = 0; i < totalPools; i++) {
        poolPromises.push(fetchSinglePool(i))
      }

      // Wait for all pools to be fetched
      const poolResults = await Promise.all(poolPromises)
      
      // Filter out null results and only keep active pools
      const activePools = poolResults.filter(pool => pool !== null) as ContractPool[]
      
      console.log(`Loaded ${activePools.length} active pools out of ${totalPools} total`)
      setPools(activePools)
      
    } catch (error) {
      console.error('Error fetching pools:', error)
      toast.error('Failed to fetch pools')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSinglePool = async (poolIndex: number): Promise<ContractPool | null> => {
    try {
      const poolId = BigInt(poolIndex)
      
      // We'll use a component that fetches individual pool data
      // For now, return a promise that will be resolved by the PoolFetcher component
      return new Promise((resolve) => {
        // This will be handled by individual PoolFetcher components
        resolve(null)
      })
    } catch (error) {
      console.warn(`Error fetching pool ${poolIndex}:`, error)
      return null
    }
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
        <p className="text-lg text-gray-300">No active prediction pools yet.</p>
        <p className="text-gray-500">Be the first to create one!</p>
        <div className="mt-4 p-4 bg-gray-800 rounded-lg max-w-md mx-auto">
          <p className="text-xs text-gray-400">Debug Info:</p>
          <p className="text-xs text-gray-300">Total Pools: {totalPools}</p>
          <p className="text-xs text-gray-300">Wallet: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}</p>
          <p className="text-xs text-gray-300">Status: {totalPools > 0 ? 'Pools exist but none are active' : 'No pools created yet'}</p>
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
        {Array.from({ length: totalPools }, (_, i) => (
          <PoolFetcher
            key={i}
            poolIndex={i}
            onPoolLoaded={(pool) => {
              setPools(prev => {
                const existingIndex = prev.findIndex(p => p.id === pool.id)
                if (existingIndex >= 0) {
                  const newPools = [...prev]
                  newPools[existingIndex] = pool
                  return newPools
                } else {
                  return [...prev, pool]
                }
              })
            }}
            onVote={onVote}
          />
        ))}
      </div>
    </div>
  )
}

// Component to fetch individual pool data
interface PoolFetcherProps {
  poolIndex: number
  onPoolLoaded: (pool: ContractPool) => void
  onVote: (poolId: string, voteChoice: "yes" | "no", participationAmount: number) => void
}

const PoolFetcher = ({ poolIndex, onPoolLoaded, onVote }: PoolFetcherProps) => {
  const { convertPoolData } = useEscrowContract()
  const poolId = BigInt(poolIndex)
  const { poolInfo, voteCounts, walrusHash, isLoading, error } = usePoolData(poolId)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (poolInfo && voteCounts && walrusHash && !hasLoaded) {
      try {
        const [poolData, participantCount] = poolInfo as [any, bigint, bigint]
        
        // Process all pools (not just active ones)
        const [yesVotes, noVotes] = voteCounts as readonly [bigint, bigint]
        const pool = convertPoolData(
          poolData,
          participantCount,
          { yesVotes, noVotes },
          walrusHash as string,
          poolIndex.toString()
        )
        onPoolLoaded(pool)
        setHasLoaded(true)
      } catch (error) {
        console.warn(`Error processing pool ${poolIndex}:`, error)
      }
    }
  }, [poolInfo, voteCounts, walrusHash, hasLoaded, poolIndex, onPoolLoaded, convertPoolData])

  // Don't render anything - this is just a data fetcher
  if (isLoading || error || !poolInfo || !hasLoaded) {
    return null
  }

  const [poolData] = poolInfo as [any, bigint, bigint]
  
  // Render all pools (active and inactive)
  const [yesVotes, noVotes] = voteCounts as readonly [bigint, bigint]
  const pool = convertPoolData(
    poolData,
    poolInfo[1],
    { yesVotes, noVotes },
    walrusHash as string,
    poolIndex.toString()
  )

  const handleVote = (poolId: string, voteChoice: "yes" | "no") => {
    onVote(poolId, voteChoice, pool.participationAmount)
  }

  return <PredictionPool key={pool.id} {...pool} onVote={handleVote} />
}

export default AllPoolsList 