'use client';

import { AlertCircle, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { type Hash } from 'viem';

interface TransactionStatusProps {
  isProcessing?: boolean;
  isSuccess?: boolean;
  error?: string | null;
  transactionHash?: Hash;
  chainId?: number;
  className?: string;
}

export function TransactionStatus({
  isProcessing,
  isSuccess,
  error,
  transactionHash,
  chainId,
  className = '',
}: TransactionStatusProps) {
  if (!isProcessing && !isSuccess && !error) {
    return null;
  }

  // Get explorer URL based on chain ID
  const getExplorerUrl = (txHash: Hash, chainId?: number) => {
    const explorers: Record<number, string> = {
      84532: 'https://sepolia.basescan.org', // Base Sepolia
      8453: 'https://basescan.org', // Base
      137: 'https://polygonscan.com', // Polygon
      1101: 'https://zkevm.polygonscan.com', // Polygon zkEVM
      2442: 'https://cardona-zkevm.polygonscan.com', // Polygon zkEVM Cardona
    };

    const baseUrl = chainId ? explorers[chainId] : null;
    return baseUrl ? `${baseUrl}/tx/${txHash}` : null;
  };

  const explorerUrl = transactionHash
    ? getExplorerUrl(transactionHash, chainId)
    : null;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Processing Status */}
      {isProcessing && (
        <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950 dark:border-blue-800'>
          <div className='flex items-center space-x-2'>
            <Clock className='w-4 h-4 text-blue-600 animate-pulse' />
            <span className='text-sm font-medium text-blue-800 dark:text-blue-200'>
              Transaction Processing...
            </span>
          </div>
          <p className='text-sm text-blue-700 dark:text-blue-300 mt-1'>
            Please wait while your transaction is being confirmed on the
            blockchain.
          </p>
          {transactionHash && (
            <div className='mt-2'>
              <p className='text-xs text-blue-600 dark:text-blue-400 font-mono break-all'>
                Hash: {transactionHash}
              </p>
              {explorerUrl && (
                <a
                  href={explorerUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 mt-1'
                >
                  View on Explorer <ExternalLink className='w-3 h-3 ml-1' />
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Success Status */}
      {isSuccess && transactionHash && (
        <div className='p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950 dark:border-green-800'>
          <div className='flex items-center space-x-2'>
            <CheckCircle className='w-4 h-4 text-green-600' />
            <span className='text-sm font-medium text-green-800 dark:text-green-200'>
              Transaction Successful!
            </span>
          </div>
          <div className='mt-2'>
            <p className='text-xs text-green-700 dark:text-green-300 font-mono break-all'>
              Hash: {transactionHash}
            </p>
            {explorerUrl && (
              <a
                href={explorerUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center text-xs text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 mt-1'
              >
                View on Explorer <ExternalLink className='w-3 h-3 ml-1' />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Error Status */}
      {error && (
        <div className='p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-950 dark:border-red-800'>
          <div className='flex items-center space-x-2'>
            <AlertCircle className='w-4 h-4 text-red-600' />
            <span className='text-sm font-medium text-red-800 dark:text-red-200'>
              Transaction Error
            </span>
          </div>
          <p className='text-sm text-red-700 dark:text-red-300 mt-1'>{error}</p>
        </div>
      )}
    </div>
  );
}
