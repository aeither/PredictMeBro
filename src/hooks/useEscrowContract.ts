import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { readContract } from 'wagmi/actions'
import { parseEther, formatEther } from 'viem'
import { ESCROW_CONTRACT_ADDRESS, ESCROW_CONTRACT_ABI } from '@/config/contract'
import { validatePoolData } from '@/utils/test-data'
import { config } from '@/config/wagmi'
import { useState, useEffect } from 'react'

export interface Pool {
  id: bigint
  creatorName: string
  price: bigint
  poolPrize: bigint
  poolBalance: bigint
  startTime: bigint
  endTime: bigint
  isActive: boolean
  creator: string
  walrusHash: string
  isResolved: boolean
  winningVote: boolean
  totalWinners: bigint
  totalWinnerAmount: bigint
  claimedAmount: bigint
}

export interface ContractPool {
  id: string
  question: string
  totalAmount: number
  yesVotes: number
  noVotes: number
  endsAt: string
  participationAmount: number
  creator: string
  walrusHash: string
  isActive: boolean
  isResolved: boolean
}

export const useEscrowContract = () => {
  const { address } = useAccount()
  const { writeContract } = useWriteContract()

  // Read total pools count
  const { data: totalPools, refetch: refetchTotalPools } = useReadContract({
    address: ESCROW_CONTRACT_ADDRESS,
    abi: ESCROW_CONTRACT_ABI,
    functionName: 'getTotalPools',
  })

  // Create a new pool
  const createPool = async (
    question: string,
    priceInEth: number,
    durationInHours: number = 1
  ) => {
    if (!address) throw new Error('Wallet not connected')

    // Validate input data
    const validation = validatePoolData(
      question,
      priceInEth.toString(),
      durationInHours.toString()
    )
    
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
    }

    // Convert price to Wei (smallest unit)
    const priceInWei = parseEther(priceInEth.toString())
    
    // For the pool prize (value), let's use 10x the participation price
    // This matches the pattern from your successful transaction (100 vs 1000)
    const poolPrizeInWei = priceInWei * BigInt(10)
    
    // Add 1 minute buffer to ensure start time is in the future
    const startTime = BigInt(Math.floor(Date.now() / 1000) + 60) // +60 seconds buffer
    const endTime = startTime + BigInt(durationInHours * 60 * 60) // Convert hours to seconds
    
    // Use wallet address as creator name
    const creatorName = address
    
    // Use a simple placeholder for walrus hash - in production you'd upload to Walrus
    const walrusHash = `pool_${Date.now()}_${question.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}`

    console.log('Creating pool with params:', {
      creatorName,
      priceInWei: priceInWei.toString(),
      startTime: startTime.toString(),
      endTime: endTime.toString(),
      walrusHash,
      poolPrizeInWei: poolPrizeInWei.toString(),
      currentTime: Math.floor(Date.now() / 1000),
    })

    return writeContract({
      address: ESCROW_CONTRACT_ADDRESS,
      abi: ESCROW_CONTRACT_ABI,
      functionName: 'createPool',
      args: [creatorName, priceInWei, startTime, endTime, walrusHash],
      value: poolPrizeInWei, // Send 10x the participation price as pool prize
    })
  }

  // Vote on a pool
  const vote = async (poolId: bigint, voteYes: boolean, amountInEth: number) => {
    if (!address) throw new Error('Wallet not connected')

    const amount = parseEther(amountInEth.toString())

    return writeContract({
      address: ESCROW_CONTRACT_ADDRESS,
      abi: ESCROW_CONTRACT_ABI,
      functionName: 'vote',
      args: [poolId, voteYes],
      value: amount,
    })
  }

  // Get pool information
  const getPoolInfo = (poolId: bigint, participant?: string) => {
    return useReadContract({
      address: ESCROW_CONTRACT_ADDRESS,
      abi: ESCROW_CONTRACT_ABI,
      functionName: 'getPoolInfo',
      args: [poolId, (participant || address) as `0x${string}` || '0x0000000000000000000000000000000000000000'],
    })
  }

  // Get vote counts for a pool
  const getVoteCounts = (poolId: bigint) => {
    return useReadContract({
      address: ESCROW_CONTRACT_ADDRESS,
      abi: ESCROW_CONTRACT_ABI,
      functionName: 'getVoteCounts',
      args: [poolId],
    })
  }

  // Get pool walrus hash (question content)
  const getPoolWalrusHash = (poolId: bigint) => {
    return useReadContract({
      address: ESCROW_CONTRACT_ADDRESS,
      abi: ESCROW_CONTRACT_ABI,
      functionName: 'getPoolWalrusHash',
      args: [poolId],
    })
  }

  // Convert contract pool data to UI format
  const convertPoolData = (
    poolData: any,
    _participantCount: bigint, // Unused but required by contract response
    voteCounts: { yesVotes: bigint; noVotes: bigint },
    walrusHash: string,
    poolId: string
  ): ContractPool => {
    return {
      id: `flow-${poolId}`,
      question: walrusHash, // Using walrus hash as question for now
      totalAmount: Number(formatEther(poolData.poolBalance)),
      yesVotes: Number(voteCounts.yesVotes),
      noVotes: Number(voteCounts.noVotes),
      endsAt: new Date(Number(poolData.endTime) * 1000).toISOString(),
      participationAmount: Number(formatEther(poolData.price)),
      creator: poolData.creator,
      walrusHash: poolData.walrusHash,
      isActive: poolData.isActive,
      isResolved: poolData.isResolved,
    }
  }

  return {
    totalPools: totalPools ? Number(totalPools) : 0,
    createPool,
    vote,
    getPoolInfo,
    getVoteCounts,
    getPoolWalrusHash,
    convertPoolData,
    refetchTotalPools,
  }
}

// Hook to fetch all pools data
export const useAllPoolsData = () => {
  const { address } = useAccount()
  const { totalPools, convertPoolData } = useEscrowContract()
  
  const [pools, setPools] = useState<ContractPool[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPoolsData = async () => {
    if (!totalPools || totalPools === 0) {
      setPools([])
      return
    }

    setIsLoading(true)
    setError(null)
    console.log(`Fetching ${totalPools} pools...`)

    try {
      // Fetch all pools in parallel (newest first)
       const poolPromises = Array.from({ length: totalPools }, async (_, i) => {
         // Reverse the order so newest pools (highest index) come first
         const poolIndex = totalPools - 1 - i
         try {
           const poolId = BigInt(poolIndex)
           
           console.log(`Fetching pool ${poolIndex} data...`)
           
           // Fetch all data for this pool
           const [poolInfo, voteCounts, walrusHash] = await Promise.all([
             readContract(config, {
               address: ESCROW_CONTRACT_ADDRESS,
               abi: ESCROW_CONTRACT_ABI,
               functionName: 'getPoolInfo',
               args: [poolId, (address as `0x${string}`) || '0x0000000000000000000000000000000000000000'],
             }),
             readContract(config, {
               address: ESCROW_CONTRACT_ADDRESS,
               abi: ESCROW_CONTRACT_ABI,
               functionName: 'getVoteCounts',
               args: [poolId],
             }),
             readContract(config, {
               address: ESCROW_CONTRACT_ADDRESS,
               abi: ESCROW_CONTRACT_ABI,
               functionName: 'getPoolWalrusHash',
               args: [poolId],
             })
           ])

          const [poolData, participantCount] = poolInfo as [any, bigint, bigint]
          const [yesVotes, noVotes] = voteCounts as readonly [bigint, bigint]
          
          console.log(`Pool ${poolIndex} data:`, {
            isActive: poolData.isActive,
            creatorName: poolData.creatorName,
            participantCount: participantCount.toString(),
            yesVotes: yesVotes.toString(),
            noVotes: noVotes.toString(),
            walrusHash: walrusHash as string
          })

          const pool = convertPoolData(
            poolData,
            participantCount,
            { yesVotes, noVotes },
            walrusHash as string,
            poolIndex.toString()
          )

          return pool
        } catch (error) {
          console.error(`Error fetching pool ${poolIndex}:`, error)
          return null
        }
      })

      const results = await Promise.all(poolPromises)
      const validPools = results.filter(pool => pool !== null) as ContractPool[]
      
      console.log(`Successfully loaded ${validPools.length} out of ${totalPools} pools`)
      setPools(validPools)
    } catch (error) {
      console.error('Error fetching pools:', error)
      setError('Failed to fetch pools')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch when totalPools changes
  useEffect(() => {
    if (totalPools > 0) {
      fetchPoolsData()
    } else {
      setPools([])
    }
  }, [totalPools, address])

  return {
    pools,
    isLoading,
    error,
    refetch: fetchPoolsData,
  }
} 