import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
}

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  const isBackendError =
    error.includes('Backend') ||
    error.includes('500') ||
    error.includes('service');
  const isConnectionError =
    error.includes('connect') || error.includes('internet');

  return (
    <div className='space-y-6'>
      <Alert className='border-red-200 bg-red-50'>
        <AlertCircle className='h-4 w-4 text-red-600' />
        <AlertDescription className='text-red-800'>
          <div className='font-medium mb-2'>Failed to load collections</div>
          <p className='text-sm mb-4'>{error}</p>

          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={onRetry}
              className='border-red-300 text-red-700 hover:bg-red-100'
            >
              <RefreshCw className='h-4 w-4 mr-2' />
              Retry
            </Button>

            {isBackendError && (
              <Button
                variant='outline'
                size='sm'
                onClick={() => window.open('/api/health', '_blank')}
                className='border-red-300 text-red-700 hover:bg-red-100'
              >
                <ExternalLink className='h-4 w-4 mr-2' />
                Check Backend Status
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>

      <div className='text-center py-12'>
        <div className='mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4'>
          <AlertCircle className='w-12 h-12 text-red-400' />
        </div>

        <h3 className='text-lg font-medium text-gray-900 mb-2'>
          Unable to load collections
        </h3>

        {isBackendError && (
          <div className='text-gray-500 mb-6 space-y-2'>
            <p>There seems to be an issue with the backend service.</p>
            <p className='text-sm'>This could be due to:</p>
            <ul className='text-sm text-left max-w-md mx-auto space-y-1'>
              <li>• Backend service is starting up</li>
              <li>• Database connection issues</li>
              <li>• Smart contract configuration problems</li>
              <li>• Network connectivity issues</li>
            </ul>
          </div>
        )}

        {isConnectionError && (
          <div className='text-gray-500 mb-6 space-y-2'>
            <p>Unable to connect to the backend service.</p>
            <p className='text-sm'>Please check:</p>
            <ul className='text-sm text-left max-w-md mx-auto space-y-1'>
              <li>• Your internet connection</li>
              <li>• Backend service is running</li>
              <li>• Environment variables are configured</li>
            </ul>
          </div>
        )}

        <div className='flex gap-3 justify-center'>
          <Button onClick={onRetry} variant='outline'>
            <RefreshCw className='h-4 w-4 mr-2' />
            Try Again
          </Button>

          <Button
            variant='outline'
            onClick={() => (window.location.href = '/collections')}
          >
            Go to Collections
          </Button>
        </div>
      </div>
    </div>
  );
}
