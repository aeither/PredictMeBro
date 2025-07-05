export const ESCROW_CONTRACT_ADDRESS = "0x1324b3c786d517Cd4D43cDF3CF76c435E6b82F68"

export const ESCROW_CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "poolId", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "creatorName", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "price", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "poolPrize", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "startTime", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "endTime", "type": "uint256"},
      {"indexed": false, "internalType": "address", "name": "creator", "type": "address"}
    ],
    "name": "PoolCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "poolId", "type": "uint256"},
      {"indexed": false, "internalType": "bool", "name": "winningVote", "type": "bool"},
      {"indexed": false, "internalType": "uint256", "name": "totalWinners", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "totalWinnerAmount", "type": "uint256"}
    ],
    "name": "PoolResolved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "poolId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "participant", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "RewardClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "poolId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "participant", "type": "address"},
      {"indexed": false, "internalType": "bool", "name": "vote", "type": "bool"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "VoteCast",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "CREATOR_FEE_PERCENT",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "poolId", "type": "uint256"}],
    "name": "claimCreatorFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "poolId", "type": "uint256"}],
    "name": "claimReward",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "_creatorName", "type": "string"},
      {"internalType": "uint256", "name": "_price", "type": "uint256"},
      {"internalType": "uint256", "name": "_startTime", "type": "uint256"},
      {"internalType": "uint256", "name": "_endTime", "type": "uint256"},
      {"internalType": "string", "name": "_walrusHash", "type": "string"}
    ],
    "name": "createPool",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "poolId", "type": "uint256"},
      {"internalType": "address", "name": "participant", "type": "address"}
    ],
    "name": "getClaimableAmount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "poolId", "type": "uint256"}],
    "name": "getParticipantCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "poolId", "type": "uint256"},
      {"internalType": "address", "name": "participant", "type": "address"}
    ],
    "name": "getPoolInfo",
    "outputs": [
      {
        "components": [
          {"internalType": "string", "name": "creatorName", "type": "string"},
          {"internalType": "uint256", "name": "price", "type": "uint256"},
          {"internalType": "uint256", "name": "poolPrize", "type": "uint256"},
          {"internalType": "uint256", "name": "poolBalance", "type": "uint256"},
          {"internalType": "uint256", "name": "startTime", "type": "uint256"},
          {"internalType": "uint256", "name": "endTime", "type": "uint256"},
          {"internalType": "bool", "name": "isActive", "type": "bool"},
          {"internalType": "address", "name": "creator", "type": "address"},
          {"internalType": "string", "name": "walrusHash", "type": "string"},
          {"internalType": "bool", "name": "isResolved", "type": "bool"},
          {"internalType": "bool", "name": "winningVote", "type": "bool"},
          {"internalType": "uint256", "name": "totalWinners", "type": "uint256"},
          {"internalType": "uint256", "name": "totalWinnerAmount", "type": "uint256"},
          {"internalType": "uint256", "name": "claimedAmount", "type": "uint256"}
        ],
        "internalType": "struct EscrowPool.Pool",
        "name": "",
        "type": "tuple"
      },
      {"internalType": "uint256", "name": "participantCount", "type": "uint256"},
      {"internalType": "uint256", "name": "claimableAmount", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "poolId", "type": "uint256"}],
    "name": "getPoolParticipants",
    "outputs": [
      {
        "components": [
          {"internalType": "address", "name": "participant", "type": "address"},
          {"internalType": "bool", "name": "vote", "type": "bool"},
          {"internalType": "uint256", "name": "amount", "type": "uint256"},
          {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
          {"internalType": "bool", "name": "hasClaimed", "type": "bool"}
        ],
        "internalType": "struct EscrowPool.Participant[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "poolId", "type": "uint256"}],
    "name": "getPoolWalrusHash",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalPools",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "poolId", "type": "uint256"}],
    "name": "getVoteCounts",
    "outputs": [
      {"internalType": "uint256", "name": "yesVotes", "type": "uint256"},
      {"internalType": "uint256", "name": "noVotes", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"},
      {"internalType": "address", "name": "", "type": "address"}
    ],
    "name": "hasVoted",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"},
      {"internalType": "address", "name": "", "type": "address"}
    ],
    "name": "participantIndex",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "poolCounter",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"},
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "name": "poolParticipants",
    "outputs": [
      {"internalType": "address", "name": "participant", "type": "address"},
      {"internalType": "bool", "name": "vote", "type": "bool"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
      {"internalType": "bool", "name": "hasClaimed", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "name": "pools",
    "outputs": [
      {"internalType": "string", "name": "creatorName", "type": "string"},
      {"internalType": "uint256", "name": "price", "type": "uint256"},
      {"internalType": "uint256", "name": "poolPrize", "type": "uint256"},
      {"internalType": "uint256", "name": "poolBalance", "type": "uint256"},
      {"internalType": "uint256", "name": "startTime", "type": "uint256"},
      {"internalType": "uint256", "name": "endTime", "type": "uint256"},
      {"internalType": "bool", "name": "isActive", "type": "bool"},
      {"internalType": "address", "name": "creator", "type": "address"},
      {"internalType": "string", "name": "walrusHash", "type": "string"},
      {"internalType": "bool", "name": "isResolved", "type": "bool"},
      {"internalType": "bool", "name": "winningVote", "type": "bool"},
      {"internalType": "uint256", "name": "totalWinners", "type": "uint256"},
      {"internalType": "uint256", "name": "totalWinnerAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "claimedAmount", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "poolId", "type": "uint256"},
      {"internalType": "bool", "name": "_winningVote", "type": "bool"}
    ],
    "name": "resolvePool",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "poolId", "type": "uint256"},
      {"internalType": "bool", "name": "_vote", "type": "bool"}
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
] as const 