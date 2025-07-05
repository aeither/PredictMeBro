import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { ESCROW_CONTRACT_ADDRESS, ESCROW_CONTRACT_ABI } from '@/config/contract'

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
    creatorName: string,
    question: string,
    priceInEth: number,
    durationInDays: number = 30
  ) => {
    if (!address) throw new Error('Wallet not connected')

    const price = parseEther(priceInEth.toString())
    const startTime = BigInt(Math.floor(Date.now() / 1000))
    const endTime = startTime + BigInt(durationInDays * 24 * 60 * 60)
    
    // For now, we'll use the question as the walrus hash
    // In a real implementation, you'd upload to Walrus and get the hash
    const walrusHash = question

    return writeContract({
      address: ESCROW_CONTRACT_ADDRESS,
      abi: ESCROW_CONTRACT_ABI,
      functionName: 'createPool',
      args: [creatorName, price, startTime, endTime, walrusHash],
      value: price, // Pool prize
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