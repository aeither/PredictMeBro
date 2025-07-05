# Flow Pools Display System

## Overview
The Flow page now displays all active prediction pools from the smart contract using a real-time fetching system.

## How It Works

### 1. Pool Discovery
- Gets total pool count from `getTotalPools()` contract function
- Loops through all pool IDs (0 to totalPools-1)
- Fetches each pool's data individually

### 2. Data Fetching
For each pool, the system fetches:
- **Pool Info**: `getPoolInfo(poolId, participant)` - Basic pool data, participant count, claimable amount
- **Vote Counts**: `getVoteCounts(poolId)` - Number of Yes/No votes
- **Walrus Hash**: `getPoolWalrusHash(poolId)` - Pool question/content identifier

### 3. Filtering
- Only displays pools where `isActive = true`
- Filters out expired or cancelled pools
- Shows real-time vote counts and participation

### 4. Real-time Updates
- Uses wagmi hooks for automatic updates
- Data refreshes when blockchain state changes
- Individual pool components update independently

## Components Architecture

### AllPoolsList
- Main container component
- Manages overall loading state
- Displays debug information
- Handles pool collection

### PoolFetcher
- Individual pool data fetcher
- Uses `usePoolData` hook for each pool
- Converts contract data to display format
- Renders `PredictionPool` component when data is ready

### usePoolData Hook
- Fetches data for a specific pool ID
- Uses multiple wagmi `useReadContract` hooks
- Handles loading states and errors
- Provides refetch functionality

## Debug Information

The system shows helpful debug info:
- **Total Pools**: Number from contract
- **Wallet**: Connected address (truncated)
- **Status**: Whether pools exist but are inactive
- **Active Count**: Number of pools currently displayed

## Testing Your Pools

1. **Create a Pool**: Use the "Create New Pool" button
2. **Check Debug Info**: Verify total pools count increases
3. **Wait for Display**: Pool should appear automatically
4. **Verify Data**: Check vote counts, participation amount, end date

## Common Issues

### Pool Not Appearing
- Check if pool is active (`isActive = true`)
- Verify pool hasn't expired (`endTime` in future)
- Look at debug info to confirm pool was created

### Data Not Loading
- Check wallet connection
- Verify contract address and ABI
- Look at browser console for error messages
- Try the refresh button

### Vote Counts Wrong
- Votes update in real-time via wagmi
- Check if transaction was confirmed
- Verify you're voting on the correct pool

## Code Structure

```typescript
// Flow page loads AllPoolsList
<AllPoolsList onVote={handleVote} />

// AllPoolsList creates PoolFetcher for each pool
{Array.from({ length: totalPools }, (_, i) => (
  <PoolFetcher 
    key={i} 
    poolIndex={i} 
    onPoolLoaded={handlePoolLoaded}
    onVote={onVote}
  />
))}

// PoolFetcher uses usePoolData hook
const { poolInfo, voteCounts, walrusHash } = usePoolData(poolId)

// When data loads, renders PredictionPool
<PredictionPool {...pool} onVote={handleVote} />
```

## Performance Notes

- Each pool fetches data independently
- Uses wagmi's built-in caching and deduplication
- Only active pools are rendered
- Failed pool fetches don't block others

This system provides a robust, real-time display of all active prediction pools from the Flow blockchain contract. 