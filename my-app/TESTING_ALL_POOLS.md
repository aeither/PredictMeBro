# Testing All Pools Display

## Overview
The system now displays ALL pools from the smart contract, not just active ones. Here's how to test it:

## What to Expect

### With 6 Total Pools
If you have 6 pools in the contract (as mentioned), you should see:
- Debug info showing "Total Pools: 6"
- Individual pool loading logs in browser console
- Up to 6 pool cards displayed in the UI

### Console Logs to Watch For

1. **Total Pools Detection**:
   ```
   AllPoolsList: Total pools changed to: 6
   Fetching 6 pools...
   ```

2. **Individual Pool Loading**:
   ```
   Pool 0 status: {isLoading: true, hasError: false, hasPoolInfo: false, ...}
   Pool 1 status: {isLoading: true, hasError: false, hasPoolInfo: false, ...}
   ...
   Pool 0 loaded: {isActive: true, creatorName: "0x1234...", participantCount: "2", ...}
   Pool 1 loaded: {isActive: false, creatorName: "0x5678...", participantCount: "0", ...}
   ```

3. **Pool State Updates**:
   ```
   Pool loaded into state: flow-0 Will Bitcoin reach $100,000?
   Pool loaded into state: flow-1 Will it rain tomorrow?
   ```

## Testing Steps

### 1. Open Browser Console
- Press F12 or right-click → Inspect Element
- Go to Console tab
- Filter by "Pool" to see relevant logs

### 2. Navigate to Flow Page
- Go to `/flow` route
- Watch console for pool loading messages
- Look at debug info panel

### 3. Check UI Display
- Should show "All Flow Pools" header
- Should show "Showing X pools (out of 6 total)"
- Should display pool cards for all existing pools

### 4. Verify Pool Data
Each pool card should show:
- Pool question (from walrus hash)
- Vote counts (Yes/No)
- Participation amount
- Status (Active/Inactive)
- End date

## Expected Behavior

### Success Case
- Console shows all 6 pools loading
- UI displays all pools that exist
- No error messages
- Vote counts are accurate

### Common Issues

#### No Pools Showing
- Check if `getTotalPools()` returns 6
- Look for error messages in console
- Verify wallet is connected

#### Some Pools Missing
- Check individual pool loading logs
- Look for specific pool errors
- Verify pool IDs 0-5 all exist

#### Wrong Data
- Check if `getPoolInfo()` returns correct data
- Verify contract address/ABI are correct
- Check if pools are properly formatted

## Debug Information Panel

The UI shows helpful debug info:
- **Total Pools**: Should show 6
- **Wallet**: Your connected address
- **Status**: Loading state or error info

## Contract Call Sequence

For each pool (0-5), the system calls:
1. `getPoolInfo(poolId, userAddress)` → Pool details, participant count
2. `getVoteCounts(poolId)` → [yesVotes, noVotes]
3. `getPoolWalrusHash(poolId)` → Question/content hash

## Troubleshooting

### If you see "No pools yet" but have 6 pools:
1. Check console for error messages
2. Verify `getTotalPools()` returns 6
3. Look for individual pool loading errors
4. Try refreshing the page

### If some pools are missing:
1. Check which pool IDs are failing
2. Verify those pools exist in the contract
3. Check for data format issues

### If pools show but wrong data:
1. Verify contract ABI matches actual contract
2. Check pool data structure in console logs
3. Verify convertPoolData function handles all cases

The system should automatically load and display all 6 pools from your contract! 