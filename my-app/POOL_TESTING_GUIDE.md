# Pool Creation Testing Guide

## Overview
This guide provides working dummy data and troubleshooting tips for testing the prediction pool creation functionality on the Flow blockchain.

## Fixed Issues
✅ **Start Time Issue**: Fixed the contract requirement that start time must be in the future by adding a 60-second buffer
✅ **Validation**: Added proper input validation to catch errors early
✅ **Logging**: Added detailed console logging for debugging
✅ **Test Data**: Added easy-to-use test data button in the UI

## Working Test Data

### Quick Test (Recommended)
Use the "📝 Fill Test Data" button in the Create Pool Modal, or manually enter:
- **Question**: "Will Bitcoin reach $100,000 by end of 2024?"
- **Participation Amount**: `0.01` ETH
- **Duration**: `2` hours
- **Expected Cost**: `0.1` ETH (10x participation amount)

### More Test Scenarios

#### 1. Short Duration Test
- **Question**: "Will it rain tomorrow in San Francisco?"
- **Participation Amount**: `0.005` ETH
- **Duration**: `24` hours
- **Cost**: `0.05` ETH

#### 2. Crypto Prediction
- **Question**: "Will Ethereum 2.0 staking rewards exceed 5% APY this month?"
- **Participation Amount**: `0.02` ETH
- **Duration**: `168` hours (1 week)
- **Cost**: `0.2` ETH

#### 3. Long Term Prediction
- **Question**: "Will OpenAI release GPT-5 before 2025?"
- **Participation Amount**: `0.015` ETH
- **Duration**: `8760` hours (1 year)
- **Cost**: `0.15` ETH

## Contract Parameters Explained

### Required Parameters
1. **creatorName**: Automatically set to your wallet address
2. **price**: Participation fee in Wei (converted from ETH)
3. **startTime**: Current timestamp + 60 seconds (in the future)
4. **endTime**: Start time + duration in seconds
5. **walrusHash**: Auto-generated identifier for the pool

### Transaction Value
- **msg.value**: 10x the participation amount (pool prize)
- Example: 0.01 ETH participation = 0.1 ETH total cost

## Smart Contract Requirements

The contract validates:
- ✅ `startTime < endTime` (start before end)
- ✅ `startTime > block.timestamp` (start in future)
- ✅ `msg.value > 0` (pool prize required)
- ✅ `price > 0` (participation fee required)

## Testing Steps

1. **Connect Wallet**: Make sure you're connected to Flow testnet
2. **Have Test Tokens**: Ensure you have enough Flow tokens for testing
3. **Open Create Pool Modal**: Click "Create New Pool"
4. **Use Test Data**: Click "📝 Fill Test Data" button
5. **Verify Cost**: Check the displayed pool creation cost
6. **Submit**: Click "Create Pool" and confirm transaction

## Troubleshooting

### Common Issues & Solutions

#### "Start time must be in the future"
- **Fixed**: We now add 60 seconds buffer to start time
- **Old Issue**: Was setting start time to current time

#### "Insufficient funds"
- **Solution**: Ensure you have enough Flow tokens
- **Remember**: Total cost = participation amount × 10

#### "Invalid time range"
- **Solution**: Ensure duration is positive
- **Minimum**: 0.1 hours (6 minutes)

#### "Pool prize must be greater than 0"
- **Solution**: Ensure participation amount > 0
- **Minimum**: 0.001 ETH

#### Transaction Failed
- **Check**: Browser console for detailed error logs
- **Verify**: Wallet connection and token balance
- **Retry**: Wait a few seconds and try again

## Debug Information

### Console Logs
Check browser console for detailed logs showing:
- Creator name (wallet address)
- Price in Wei
- Start/End timestamps
- Walrus hash
- Pool prize amount
- Current time

### Example Log Output
```
Creating pool with params: {
  creatorName: "0x1234...5678",
  priceInWei: "10000000000000000",
  startTime: "1703123456",
  endTime: "1703130656",
  walrusHash: "pool_1703123456_Will_Bitcoin_reach__",
  poolPrizeInWei: "100000000000000000",
  currentTime: 1703123396
}
```

## Expected Behavior

### Success Flow
1. Form validates input
2. Transaction is submitted
3. Wallet confirms transaction
4. Pool is created on-chain
5. Success toast appears
6. Form resets and closes

### Error Handling
- Input validation errors shown immediately
- Transaction errors shown in toast
- Console logs provide detailed debugging info

## Test Verification

After successful creation:
1. **Check Transaction**: Look for transaction hash in wallet
2. **Verify Pool**: Pool should appear in the pools list
3. **Test Voting**: Try voting on the created pool
4. **Check Balance**: Verify tokens were deducted correctly

## Production Considerations

For production deployment:
- Replace test walrus hash with actual Walrus storage
- Add proper error handling for network issues
- Implement transaction status tracking
- Add gas estimation and fee display
- Consider adding pool templates for common use cases

## Need Help?

If you encounter issues:
1. Check browser console for errors
2. Verify wallet connection and balance
3. Try the recommended test data first
4. Check network connection to Flow testnet
5. Contact support with console logs and transaction details 