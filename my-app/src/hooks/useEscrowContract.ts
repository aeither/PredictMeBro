import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { ESCROW_CONTRACT_ADDRESS, ESCROW_CONTRACT_ABI } from '@/config/contract'
import { validatePoolData } from '@/utils/test-data'

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
    participantCount: bigint,
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
      endsAt: new Date(Number(poolData.endTime) * 1000).toISOString().split('T')[0],
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