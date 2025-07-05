import { useReadContract, useWriteContract, useAccount, useChainId } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { ESCROW_POOL_ABI, getContractAddress, type Pool, type PoolInfo } from '@/config/contracts';
import { toast } from 'sonner';

// Hook to get total number of pools
export function useTotalPools() {
  const chainId = useChainId();
  
  return useReadContract({
    address: getContractAddress(chainId) as `0x${string}`,
    abi: ESCROW_POOL_ABI,
    functionName: 'getTotalPools',
    query: {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  });
}

// Hook to get pool information
export function usePoolInfo(poolId: number, participant?: string) {
  const chainId = useChainId();
  const { address } = useAccount();
  
  return useReadContract({
    address: getContractAddress(chainId) as `0x${string}`,
    abi: ESCROW_POOL_ABI,
    functionName: 'getPoolInfo',
    args: [BigInt(poolId), (participant || address || '0x0000000000000000000000000000000000000000') as `0x${string}`],
    query: {
      enabled: poolId >= 0,
      refetchInterval: 15000, // Refetch every 15 seconds
    }
  });
}

// Hook to get vote counts for a pool
export function useVoteCounts(poolId: number) {
  const chainId = useChainId();
  
  return useReadContract({
    address: getContractAddress(chainId) as `0x${string}`,
    abi: ESCROW_POOL_ABI,
    functionName: 'getVoteCounts',
    args: [BigInt(poolId)],
    query: {
      enabled: poolId >= 0,
      refetchInterval: 10000, // Refetch every 10 seconds
    }
  });
}

// Hook to check if user has voted
export function useHasVoted(poolId: number) {
  const chainId = useChainId();
  const { address } = useAccount();
  
  return useReadContract({
    address: getContractAddress(chainId) as `0x${string}`,
    abi: ESCROW_POOL_ABI,
    functionName: 'hasVoted',
    args: [BigInt(poolId), address as `0x${string}`],
    query: {
      enabled: poolId >= 0 && !!address,
      refetchInterval: 5000,
    }
  });
}

// Hook to get claimable amount
export function useClaimableAmount(poolId: number) {
  const chainId = useChainId();
  const { address } = useAccount();
  
  return useReadContract({
    address: getContractAddress(chainId) as `0x${string}`,
    abi: ESCROW_POOL_ABI,
    functionName: 'getClaimableAmount',
    args: [BigInt(poolId), address as `0x${string}`],
    query: {
      enabled: poolId >= 0 && !!address,
      refetchInterval: 15000,
    }
  });
}

// Hook for contract write operations
export function useEscrowPoolActions() {
  const { writeContract } = useWriteContract();
  const chainId = useChainId();
  const contractAddress = getContractAddress(chainId) as `0x${string}`;

  const createPool = async (
    creatorName: string,
    question: string, // This will be stored in walrusHash field for now
    pricePerVote: string, // in ETH/native token
    startTime: Date,
    endTime: Date,
    poolPrize: string // in ETH/native token
  ) => {
    try {
      const priceWei = parseEther(pricePerVote);
      const prizeWei = parseEther(poolPrize);
      const startTimestamp = BigInt(Math.floor(startTime.getTime() / 1000));
      const endTimestamp = BigInt(Math.floor(endTime.getTime() / 1000));

      await writeContract({
        address: contractAddress,
        abi: ESCROW_POOL_ABI,
        functionName: 'createPool',
        args: [creatorName, priceWei, startTimestamp, endTimestamp, question],
        value: prizeWei,
      });

      toast.success('Pool Creation Transaction Sent!', {
        description: 'Please wait for transaction confirmation...',
      });
    } catch (error: any) {
      console.error('Error creating pool:', error);
      toast.error('Failed to create pool', {
        description: error.message || 'Unknown error occurred',
      });
      throw error;
    }
  };

  const vote = async (poolId: number, voteChoice: boolean, amount: string) => {
    try {
      const amountWei = parseEther(amount);

      await writeContract({
        address: contractAddress,
        abi: ESCROW_POOL_ABI,
        functionName: 'vote',
        args: [BigInt(poolId), voteChoice],
        value: amountWei,
      });

      toast.success('Vote Transaction Sent!', {
        description: 'Please wait for transaction confirmation...',
      });
    } catch (error: any) {
      console.error('Error voting:', error);
      toast.error('Failed to vote', {
        description: error.message || 'Unknown error occurred',
      });
      throw error;
    }
  };

  const claimReward = async (poolId: number) => {
    try {
      await writeContract({
        address: contractAddress,
        abi: ESCROW_POOL_ABI,
        functionName: 'claimReward',
        args: [BigInt(poolId)],
      });

      toast.success('Claim Transaction Sent!', {
        description: 'Please wait for transaction confirmation...',
      });
    } catch (error: any) {
      console.error('Error claiming reward:', error);
      toast.error('Failed to claim reward', {
        description: error.message || 'Unknown error occurred',
      });
      throw error;
    }
  };

  const resolvePool = async (poolId: number, winningVote: boolean) => {
    try {
      await writeContract({
        address: contractAddress,
        abi: ESCROW_POOL_ABI,
        functionName: 'resolvePool',
        args: [BigInt(poolId), winningVote],
      });

      toast.success('Pool Resolution Transaction Sent!', {
        description: 'Please wait for transaction confirmation...',
      });
    } catch (error: any) {
      console.error('Error resolving pool:', error);
      toast.error('Failed to resolve pool', {
        description: error.message || 'Unknown error occurred',
      });
      throw error;
    }
  };

  return {
    createPool,
    vote,
    claimReward,
    resolvePool,
  };
}

// Utility function to format pool data for display
export function formatPoolForDisplay(poolInfo: PoolInfo, poolId: number, voteCounts?: { yesVotes: bigint; noVotes: bigint }) {
  const { pool, participantCount, claimableAmount } = poolInfo;
  
  return {
    id: poolId.toString(),
    question: pool.walrusHash, // Question is stored in walrusHash field
    creatorName: pool.creatorName,
    totalAmount: Number(formatEther(pool.poolBalance)),
    poolPrize: Number(formatEther(pool.poolPrize)),
    participationAmount: Number(formatEther(pool.price)),
    yesVotes: voteCounts ? Number(voteCounts.yesVotes) : 0,
    noVotes: voteCounts ? Number(voteCounts.noVotes) : 0,
    totalVotes: Number(participantCount),
    endsAt: new Date(Number(pool.endTime) * 1000).toISOString().split('T')[0],
    startTime: new Date(Number(pool.startTime) * 1000),
    endTime: new Date(Number(pool.endTime) * 1000),
    isActive: pool.isActive,
    isResolved: pool.isResolved,
    winningVote: pool.winningVote,
    creator: pool.creator,
    claimableAmount: Number(formatEther(claimableAmount)),
    hasEnded: new Date() > new Date(Number(pool.endTime) * 1000),
  };
} 