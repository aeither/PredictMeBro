/**
 * Format currency values to avoid scientific notation and make them human readable
 */
export function formatCurrency(value: number | string, decimals: number = 6): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  
  if (num === 0) return '0'
  if (isNaN(num)) return '0'
  
  // For very small amounts (less than 0.001), show more decimal places
  if (Math.abs(num) < 0.001) {
    return num.toFixed(decimals)
  }
  
  // For amounts less than 1, show 4 decimal places
  if (Math.abs(num) < 1) {
    return num.toFixed(4)
  }
  
  // For amounts greater than 1, show 2 decimal places
  return num.toFixed(2)
}

/**
 * Format ETH amounts with proper units
 */
export function formatEth(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  
  if (num === 0) return '0 ETH'
  if (isNaN(num)) return '0 ETH'
  
  // Convert to Wei for very small amounts
  if (Math.abs(num) < 0.000001) {
    const weiValue = num * 1e18
    return `${weiValue.toFixed(0)} Wei`
  }
  
  // Convert to Gwei for small amounts
  if (Math.abs(num) < 0.001) {
    const gweiValue = num * 1e9
    return `${gweiValue.toFixed(2)} Gwei`
  }
  
  // Show as ETH for normal amounts
  return `${formatCurrency(num)} ETH`
}

/**
 * Format dollar amounts for display
 */
export function formatDollar(value: number | string): string {
  const formatted = formatCurrency(value)
  return `$${formatted}`
} 