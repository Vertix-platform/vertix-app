'use client';

import { useState, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount, useChainId } from 'wagmi';
import {
  Upload,
  Image as ImageIcon,
  X,
  Wallet,
  AlertCircle,
} from 'lucide-react';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import { useIPFS } from '@/hooks/use-ipfs';
import { useCreateCollection } from '@/hooks/use-create-collection';
import { isSupportedChain } from '@/lib/contracts/addresses';
import { supportedChains } from '@/lib/wagmi/config';
import { toast } from 'react-hot-toast';

interface CreateCollectionFormData {
  name: string;
  symbol: string;
  image: File | null;
  max_supply: string;
}

const CreateCollectionPage = () => {
  const { authenticated, login: privyLogin, ready } = usePrivy();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const {
    uploadFile,
    isUploading: isIPFSUploading,
    clearError: clearIPFSError,
  } = useIPFS();
  const {
    createCollection,
    reset: resetCreateCollection,
    isProcessing,
    canCreate,
    error: createError,
    isSuccess,
    transactionHash,
  } = useCreateCollection();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<CreateCollectionFormData>({
    name: '',
    symbol: '',
    image: null,
    max_supply: '100', // Default 100 NFTs
  });

  const handleInputChange = (
    field: keyof CreateCollectionFormData,
    value: string | File | null
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = validateFile(file);
      if (!validation.isValid) {
        toast.error(validation.error || 'Invalid file');
        return;
      }
      handleInputChange('image', file);
    }
  };

  const removeImage = () => {
    handleInputChange('image', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { isValid: false, error: 'Please select a valid image file' };
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return {
        isValid: false,
        error: 'Image file size must be less than 10MB',
      };
    }

    return { isValid: true };
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error('Collection name is required');
      return false;
    }
    if (!formData.symbol.trim()) {
      toast.error('Collection symbol is required');
      return false;
    }
    if (!formData.image) {
      toast.error('Collection image is required');
      return false;
    }
    if (formData.max_supply) {
      const maxSupply = parseInt(formData.max_supply);
      if (isNaN(maxSupply) || maxSupply <= 0 || maxSupply > 1000) {
        toast.error('Max supply must be between 1 and 1000');
        return false;
      }
    }
    return true;
  };

  const handleCreateCollection = async () => {
    if (!authenticated || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!validateForm()) {
      return;
    }

    clearIPFSError();
    resetCreateCollection();

    try {
      // Step 1: Upload image to IPFS
      const imageCid = await uploadFile(formData.image!);
      if (!imageCid) {
        toast.error('Failed to upload image to IPFS');
        return;
      }

      const imageUri = `ipfs://${imageCid}`;

      // Step 2: Create collection on blockchain via smart contract
      const result = await createCollection({
        name: formData.name.trim(),
        symbol: formData.symbol.trim().toUpperCase(),
        image: imageUri,
        maxSupply: parseInt(formData.max_supply),
      });

      if (result.success) {
        // Reset form on success
        setFormData({
          name: '',
          symbol: '',
          image: null,
          max_supply: '100',
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        toast.success('Collection created successfully');
      }
    } catch (err) {
      console.error('Collection creation error:', err);
      toast.error(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
    }
  };

  return (
    <div className='min-h-screen'>
      <section className='container mx-auto px-4 py-8'>
        <div className='max-w-2xl mx-auto'>
          {/* Header */}
          <div className='mb-8'>
            <PageBreadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'Collections', href: '/collections' },
                { label: 'Create Collection' },
              ]}
              className='mb-4'
            />
            <div>
              <h1 className='text-3xl font-bold'>Create Collection</h1>
              <p className='text-muted-foreground'>
                Create a new NFT collection with custom name, symbol, and image
              </p>
            </div>
          </div>

          {/* Collection Details Form */}
          <Card>
            <CardHeader>
              <CardTitle>Collection Details</CardTitle>
              <CardDescription>
                Provide the details for your new NFT collection.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Collection Image */}
              <div className='space-y-2'>
                <Label>Collection Image *</Label>
                <div className='flex items-center space-x-4'>
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/*'
                    onChange={handleImageUpload}
                    className='hidden'
                  />
                  <Button
                    variant='outline'
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                  >
                    <ImageIcon className='h-4 w-4 mr-2' />
                    Choose Image
                  </Button>
                  {formData.image && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={removeImage}
                      disabled={isProcessing}
                    >
                      <X className='h-4 w-4 mr-2' />
                      Remove
                    </Button>
                  )}
                </div>
                {formData.image && (
                  <div className='mt-2'>
                    <p className='text-sm text-muted-foreground'>
                      Selected: {formData.image.name} (
                      {(formData.image.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                )}
                <p className='text-sm text-muted-foreground'>
                  Upload an image file (JPG, PNG, GIF). Max size: 10MB
                </p>
              </div>

              {/* Collection Name */}
              <div className='space-y-2'>
                <Label htmlFor='name'>Collection Name *</Label>
                <Input
                  id='name'
                  placeholder='My Awesome Collection'
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  disabled={isProcessing}
                />
                <p className='text-sm text-muted-foreground'>
                  A descriptive name for your collection (max 100 characters)
                </p>
              </div>

              {/* Collection Symbol */}
              <div className='space-y-2'>
                <Label htmlFor='symbol'>Collection Symbol *</Label>
                <Input
                  id='symbol'
                  placeholder='MAC'
                  value={formData.symbol}
                  onChange={e => handleInputChange('symbol', e.target.value)}
                  disabled={isProcessing}
                  maxLength={20}
                />
                <p className='text-sm text-muted-foreground'>
                  A short symbol for your collection (max 20 characters)
                </p>
              </div>

              {/* Max Supply */}
              <div className='space-y-2'>
                <Label htmlFor='max_supply'>Maximum Supply</Label>
                <Input
                  id='max_supply'
                  type='number'
                  placeholder='100'
                  value={formData.max_supply}
                  onChange={e =>
                    handleInputChange('max_supply', e.target.value)
                  }
                  disabled={isProcessing}
                  min='1'
                  max='1000'
                />
                <p className='text-sm text-muted-foreground'>
                  Maximum number of NFTs in this collection (1-1000)
                </p>
              </div>

              {/* Wallet & Network Info */}
              {authenticated && isConnected && address ? (
                <div className='space-y-3'>
                  <div className='p-4 bg-muted rounded-lg'>
                    <div className='text-sm font-medium mb-1'>
                      Connected Wallet:
                    </div>
                    <div className='text-sm text-muted-foreground font-mono'>
                      {address}
                    </div>
                  </div>

                  {/* Network Status */}
                  <div
                    className={`p-4 rounded-lg border ${
                      isSupportedChain(chainId)
                        ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                        : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                    }`}
                  >
                    <div className='flex items-center space-x-2'>
                      {isSupportedChain(chainId) ? (
                        <>
                          <div className='w-2 h-2 bg-green-500 rounded-full' />
                          <span className='text-sm font-medium text-green-800 dark:text-green-200'>
                            Network Supported
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className='w-4 h-4 text-red-600' />
                          <span className='text-sm font-medium text-red-800 dark:text-red-200'>
                            Unsupported Network
                          </span>
                        </>
                      )}
                    </div>
                    <div className='text-xs text-muted-foreground mt-1'>
                      {isSupportedChain(chainId)
                        ? `Chain ID: ${chainId}`
                        : `Please switch to: ${supportedChains.map(c => c.name).join(', ')}`}
                    </div>
                  </div>

                  {/* Transaction Status */}
                  {createError && (
                    <div className='p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-950 dark:border-red-800'>
                      <div className='flex items-center space-x-2'>
                        <AlertCircle className='w-4 h-4 text-red-600' />
                        <span className='text-sm font-medium text-red-800 dark:text-red-200'>
                          Error
                        </span>
                      </div>
                      <p className='text-sm text-red-700 dark:text-red-300 mt-1'>
                        {createError}
                      </p>
                    </div>
                  )}

                  {isSuccess && transactionHash && (
                    <div className='p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950 dark:border-green-800'>
                      <div className='flex items-center space-x-2'>
                        <div className='w-2 h-2 bg-green-500 rounded-full' />
                        <span className='text-sm font-medium text-green-800 dark:text-green-200'>
                          Collection Created Successfully!
                        </span>
                      </div>
                      <p className='text-xs text-green-700 dark:text-green-300 mt-1 font-mono break-all'>
                        Transaction: {transactionHash}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className='p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950 dark:border-amber-800'>
                  <div className='flex items-center space-x-2'>
                    <Wallet className='w-4 h-4 text-amber-600' />
                    <span className='text-sm font-medium text-amber-800 dark:text-amber-200'>
                      Wallet Not Connected
                    </span>
                  </div>
                  <p className='text-sm text-amber-700 dark:text-amber-300 mt-1'>
                    Connect your wallet to create collections
                  </p>
                </div>
              )}

              {/* Create Collection Button */}
              <Button
                onClick={handleCreateCollection}
                disabled={
                  !canCreate ||
                  !formData.image ||
                  !formData.name.trim() ||
                  !formData.symbol.trim() ||
                  isProcessing ||
                  isIPFSUploading
                }
                className='w-full'
                size='lg'
              >
                {isProcessing || isIPFSUploading ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2' />
                    {isIPFSUploading
                      ? 'Uploading to IPFS...'
                      : 'Creating Collection...'}
                  </>
                ) : (
                  <>
                    <Upload className='h-4 w-4 mr-2' />
                    Create Collection
                  </>
                )}
              </Button>

              {!authenticated && (
                <div className='text-center space-y-4'>
                  <p className='text-sm text-muted-foreground'>
                    Please connect your wallet to create a collection
                  </p>
                  <Button onClick={privyLogin} disabled={!ready}>
                    Connect Wallet
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default CreateCollectionPage;
