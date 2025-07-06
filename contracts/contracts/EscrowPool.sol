// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract EscrowPool {
    struct Pool {
        string creatorName;
        uint256 price;
        uint256 poolPrize;
        uint256 poolBalance;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        address creator;
        string walrusHash;
        bool isResolved;
        bool winningVote;
        uint256 totalWinners;
        uint256 totalWinnerAmount;
        uint256 claimedAmount;
    }
    
    struct Participant {
        address participant;
        bool vote;
        uint256 amount;
        uint256 timestamp;
        bool hasClaimed;
    }
    
    mapping(uint256 => Pool) public pools;
    mapping(uint256 => Participant[]) public poolParticipants;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => uint256)) public participantIndex;
    
    uint256 public poolCounter;
    uint256 public constant CREATOR_FEE_PERCENT = 5;
    
    event PoolCreated(
        uint256 indexed poolId,
        string creatorName,
        uint256 price,
        uint256 poolPrize,
        uint256 startTime,
        uint256 endTime,
        address creator
    );
    
    event VoteCast(
        uint256 indexed poolId,
        address indexed participant,
        bool vote,
        uint256 amount
    );
    
    event PoolResolved(
        uint256 indexed poolId,
        bool winningVote,
        uint256 totalWinners,
        uint256 totalWinnerAmount
    );
    
    event RewardClaimed(
        uint256 indexed poolId,
        address indexed participant,
        uint256 amount
    );
    
    modifier poolExists(uint256 poolId) {
        require(poolId < poolCounter, "Pool does not exist");
        _;
    }
    
    modifier poolActive(uint256 poolId) {
        require(pools[poolId].isActive, "Pool is not active");
        require(block.timestamp >= pools[poolId].startTime, "Pool has not started");
        require(block.timestamp <= pools[poolId].endTime, "Pool has ended");
        _;
    }
    
    modifier poolEnded(uint256 poolId) {
        require(block.timestamp > pools[poolId].endTime, "Pool has not ended yet");
        _;
    }
    
    modifier hasNotVoted(uint256 poolId) {
        require(!hasVoted[poolId][msg.sender], "Already voted in this pool");
        _;
    }
    
    modifier onlyCreator(uint256 poolId) {
        require(msg.sender == pools[poolId].creator, "Only pool creator can call this");
        _;
    }
    
    function createPool(
        string memory _creatorName,
        uint256 _price,
        uint256 _startTime,
        uint256 _endTime,
        string memory _walrusHash
    ) external payable returns (uint256) {
        require(_startTime < _endTime, "Invalid time range");
        require(_startTime > block.timestamp, "Start time must be in the future");
        require(msg.value > 0, "Pool prize must be greater than 0");
        require(_price > 0, "Participation price must be greater than 0");
        
        uint256 poolId = poolCounter++;
        
        _createPoolData(poolId, _creatorName, _price, _startTime, _endTime, _walrusHash);
        
        emit PoolCreated(poolId, _creatorName, _price, msg.value, _startTime, _endTime, msg.sender);
        
        return poolId;
    }
    
    function _createPoolData(
        uint256 poolId,
        string memory _creatorName,
        uint256 _price,
        uint256 _startTime,
        uint256 _endTime,
        string memory _walrusHash
    ) internal {
        pools[poolId] = Pool({
            creatorName: _creatorName,
            price: _price,
            poolPrize: msg.value,
            poolBalance: msg.value,
            startTime: _startTime,
            endTime: _endTime,
            isActive: true,
            creator: msg.sender,
            walrusHash: _walrusHash,
            isResolved: false,
            winningVote: false,
            totalWinners: 0,
            totalWinnerAmount: 0,
            claimedAmount: 0
        });
    }
    
    function vote(uint256 poolId, bool _vote) 
        external 
        payable 
        poolExists(poolId) 
        poolActive(poolId) 
        hasNotVoted(poolId) 
    {
        require(msg.value >= pools[poolId].price, "Insufficient payment");
        
        _addParticipant(poolId, _vote);
        
        emit VoteCast(poolId, msg.sender, _vote, msg.value);
    }
    
    function _addParticipant(uint256 poolId, bool _vote) internal {
        participantIndex[poolId][msg.sender] = poolParticipants[poolId].length;
        
        poolParticipants[poolId].push(Participant({
            participant: msg.sender,
            vote: _vote,
            amount: msg.value,
            timestamp: block.timestamp,
            hasClaimed: false
        }));
        
        pools[poolId].poolBalance += msg.value;
        hasVoted[poolId][msg.sender] = true;
    }
    
    function resolvePool(uint256 poolId, bool _winningVote) 
        external 
        poolExists(poolId) 
        poolEnded(poolId) 
        onlyCreator(poolId) 
    {
        require(!pools[poolId].isResolved, "Pool already resolved");
        
        pools[poolId].isResolved = true;
        pools[poolId].winningVote = _winningVote;
        
        _calculateWinners(poolId, _winningVote);
        
        emit PoolResolved(poolId, _winningVote, pools[poolId].totalWinners, pools[poolId].totalWinnerAmount);
    }
    
    function _calculateWinners(uint256 poolId, bool _winningVote) internal {
        uint256 totalWinnerAmount = 0;
        uint256 totalWinners = 0;
        uint256 participantCount = poolParticipants[poolId].length;
        
        for (uint256 i = 0; i < participantCount; i++) {
            if (poolParticipants[poolId][i].vote == _winningVote) {
                totalWinners++;
                totalWinnerAmount += poolParticipants[poolId][i].amount;
            }
        }
        
        pools[poolId].totalWinners = totalWinners;
        pools[poolId].totalWinnerAmount = totalWinnerAmount;
    }
    
    function claimReward(uint256 poolId) 
        external 
        poolExists(poolId) 
        poolEnded(poolId) 
    {
        require(pools[poolId].isResolved, "Pool not resolved yet");
        require(hasVoted[poolId][msg.sender], "You didn't participate in this pool");
        
        _processRewardClaim(poolId);
    }
    
    function _processRewardClaim(uint256 poolId) internal {
        uint256 participantIdx = participantIndex[poolId][msg.sender];
        Participant storage participant = poolParticipants[poolId][participantIdx];
        
        require(participant.vote == pools[poolId].winningVote, "You didn't vote for the winning side");
        require(!participant.hasClaimed, "Reward already claimed");
        
        uint256 participantReward = _calculateReward(poolId, participant.amount);
        
        participant.hasClaimed = true;
        pools[poolId].claimedAmount += participantReward;
        
        payable(msg.sender).transfer(participantReward);
        
        emit RewardClaimed(poolId, msg.sender, participantReward);
    }
    
    function _calculateReward(uint256 poolId, uint256 participantAmount) 
        internal 
        view 
        returns (uint256) 
    {
        uint256 totalPoolBalance = pools[poolId].poolBalance;
        uint256 creatorFee = (totalPoolBalance * CREATOR_FEE_PERCENT) / 100;
        uint256 availableReward = totalPoolBalance - creatorFee;
        
        return (availableReward * participantAmount) / pools[poolId].totalWinnerAmount;
    }
    
    function claimCreatorFee(uint256 poolId) 
        external 
        poolExists(poolId) 
        poolEnded(poolId) 
        onlyCreator(poolId) 
    {
        require(pools[poolId].isResolved, "Pool not resolved yet");
        
        uint256 creatorFee = (pools[poolId].poolBalance * CREATOR_FEE_PERCENT) / 100;
        
        payable(pools[poolId].creator).transfer(creatorFee);
        pools[poolId].poolBalance -= creatorFee;
    }
    
    function getClaimableAmount(uint256 poolId, address participant) 
        public 
        view 
        poolExists(poolId) 
        returns (uint256) 
    {
        if (!pools[poolId].isResolved || !hasVoted[poolId][participant]) {
            return 0;
        }
        
        return _getClaimableAmountInternal(poolId, participant);
    }
    
    function _getClaimableAmountInternal(uint256 poolId, address participant) 
        internal 
        view 
        returns (uint256) 
    {
        uint256 participantIdx = participantIndex[poolId][participant];
        Participant memory participantData = poolParticipants[poolId][participantIdx];
        
        if (participantData.vote != pools[poolId].winningVote || participantData.hasClaimed) {
            return 0;
        }
        
        return _calculateReward(poolId, participantData.amount);
    }
    
    function getPoolInfo(uint256 poolId, address participant) 
        external 
        view 
        poolExists(poolId) 
        returns (Pool memory, uint256 participantCount, uint256 claimableAmount, bool voted) 
    {
        return (pools[poolId], poolParticipants[poolId].length, getClaimableAmount(poolId, participant), hasVoted[poolId][participant]);
    }
    
    function getParticipantCount(uint256 poolId) 
        external 
        view 
        poolExists(poolId) 
        returns (uint256) 
    {
        return poolParticipants[poolId].length;
    }
    
    function getVoteCounts(uint256 poolId) 
        external 
        view 
        poolExists(poolId) 
        returns (uint256 yesVotes, uint256 noVotes) 
    {
        return _countVotes(poolId);
    }
    
    function _countVotes(uint256 poolId) 
        internal 
        view 
        returns (uint256 yesVotes, uint256 noVotes) 
    {
        uint256 participantCount = poolParticipants[poolId].length;
        
        for (uint256 i = 0; i < participantCount; i++) {
            if (poolParticipants[poolId][i].vote) {
                yesVotes++;
            } else {
                noVotes++;
            }
        }
    }
    
    function getTotalPools() external view returns (uint256) {
        return poolCounter;
    }
    
    function getPoolParticipants(uint256 poolId) 
        external 
        view 
        poolExists(poolId) 
        returns (Participant[] memory) 
    {
        return poolParticipants[poolId];
    }
    
    function getPoolWalrusHash(uint256 poolId) 
        external 
        view 
        poolExists(poolId) 
        returns (string memory) 
    {
        return pools[poolId].walrusHash;
    }
}
