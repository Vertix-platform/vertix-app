'use client';

import { formatEther, parseEther } from 'viem';

/**
 * Convert wei to ETH with proper formatting
 * @param wei - Price in wei (as string or number)
 * @param decimals - Number of decimal places (default: 4)
 * @returns Formatted ETH price string
 */
export const formatPrice = (
  wei: string | number | bigint,
  decimals: number = 4
): string => {
  try {
    const ethValue = formatEther(BigInt(wei.toString()));
    const numValue = parseFloat(ethValue);
    return `${numValue.toFixed(decimals)} ETH`;
  } catch (error) {
    console.error('Error formatting price:', error);
    return '0 ETH';
  }
};

/**
 * Convert ETH to wei
 * @param eth - Price in ETH (as string or number)
 * @returns Price in wei as bigint
 */
export const parsePrice = (eth: string | number): bigint => {
  try {
    return parseEther(eth.toString());
  } catch (error) {
    console.error('Error parsing price:', error);
    return BigInt(0);
  }
};

/**
 * Format date to readable string
 * @param date - Date string, Date object, or timestamp
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDate = (
  date: string | Date | number,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
): string => {
  try {
    const dateObj =
      typeof date === 'string'
        ? new Date(date)
        : typeof date === 'number'
          ? new Date(date)
          : date;

    return new Intl.DateTimeFormat('en-US', options).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @param date - Date string, Date object, or timestamp
 * @returns Relative time string
 */
export const formatRelativeTime = (date: string | Date | number): string => {
  try {
    const dateObj =
      typeof date === 'string'
        ? new Date(date)
        : typeof date === 'number'
          ? new Date(date)
          : date;

    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - dateObj.getTime()) / 1000
    );

    if (diffInSeconds < 60) {
      return 'Just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Unknown time';
  }
};

/**
 * Format large numbers with K, M, B suffixes
 * @param num - Number to format
 * @returns Formatted number string
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`;
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

/**
 * Format wallet address to shortened version
 * @param address - Full wallet address
 * @param startChars - Number of characters to show at start (default: 6)
 * @param endChars - Number of characters to show at end (default: 4)
 * @returns Shortened address string
 */
export const formatAddress = (
  address: string,
  startChars: number = 6,
  endChars: number = 4
): string => {
  if (!address || address.length < startChars + endChars) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};
