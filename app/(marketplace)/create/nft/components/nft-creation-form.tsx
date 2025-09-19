'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useChainId } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import {
  Upload,
  Image as ImageIcon,
  X,
  Wallet,
  AlertCircle,
} from 'lucide-react';
import { useIPFS } from '@/hooks/use-ipfs';
import { useMintNft } from '@/hooks/use-mint-nft';
import { isSupportedChain } from '@/lib/contracts/addresses';
import { supportedChains } from '@/lib/wagmi/config';
import { toast } from 'react-hot-toast';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';

interface MintFormData {
  name: string;
  description: string;
  image: File | null;
  attributes: Array<{ trait_type: string; value: string }>;
  collection_id?: string;
  royalty_bps?: string;
}

export function NFTCreationForm() {
  const {
    authenticated,
    login: privyLogin,
    ready,
    user: privyUser,
  } = usePrivy();

  const chainId = useChainId();
  const { uploadNFT, validateFile, clearError: clearIPFSError } = useIPFS();
  const {
    mintNft,
    reset: resetMintNft,
    isProcessing,
    canMint,
    error: mintError,
    isSuccess,
    transactionHash,
  } = useMintNft();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<MintFormData>({
    name: '',
    description: '',
    image: null,
    attributes: [{ trait_type: '', value: '' }],
    collection_id: '',
    royalty_bps: '500', // Default 5%
  });

  const handleInputChange = (
    field: keyof MintFormData,
    value: string | File | null
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAttributeChange = (
    index: number,
    field: 'trait_type' | 'value',
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) =>
        i === index ? { ...attr, [field]: value } : attr
      ),
    }));
  };

  const addAttribute = () => {
    setFormData(prev => ({
      ...prev,
      attributes: [...prev.attributes, { trait_type: '', value: '' }],
    }));
  };

  const removeAttribute = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
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

  const handleMint = async () => {
    if (!authenticated || !privyUser?.wallet?.address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!validateForm()) {
      return;
    }

    clearIPFSError();
    resetMintNft();

    try {
      // Step 1: Upload to IPFS
      const uploadedData = await uploadNFT(
        formData.image!,
        formData.name.trim(),
        formData.description.trim(),
        formData.attributes
      );

      if (!uploadedData) {
        toast.error('Failed to upload to IPFS');
        return;
      }

      // Step 2: Mint NFT on blockchain via smart contract
      const result = await mintNft({
        to: privyUser?.wallet?.address,
        uri: uploadedData.metadataUri,
        metadataHash: uploadedData.metadataHash,
        royaltyBps: formData.royalty_bps ? parseInt(formData.royalty_bps) : 500,
      });

      if (result.success) {
        // Reset form on success
        setFormData({
          name: '',
          description: '',
          image: null,
          attributes: [{ trait_type: '', value: '' }],
          collection_id: '',
          royalty_bps: '500',
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        toast.success('NFT created successfully');
      }
    } catch (err) {
      console.error('NFT creation error:', err);
      toast.error(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error('NFT name is required');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('NFT description is required');
      return false;
    }
    if (!formData.image) {
      toast.error('Please select an image to upload');
      return false;
    }
    if (formData.royalty_bps) {
      const royalty = parseInt(formData.royalty_bps);
      if (isNaN(royalty) || royalty < 0 || royalty > 1000) {
        toast.error('Royalty must be between 0 and 1000 basis points (0-10%)');
        return false;
      }
    }
    return true;
  };

  return (
    <div className='space-y-6 flex flex-col max-w-[960px] flex-1'>
      {/* NFT Details Form */}
      <div>
        <div className='space-y-6'>
          {/* Image Upload */}
          <div className='space-y-2'>
            <Label>NFT Image *</Label>
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

          {/* NFT Name */}
          <div className='max-w-[480px]'>
            <div className='min-w-40 space-y-2'>
              <Label htmlFor='name'>NFT Name *</Label>
              <Input
                id='name'
                placeholder='My Awesome NFT'
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                disabled={isProcessing}
                className='flex w-full min-w-0 flex-1 rounded-xl border h-14 p-[15px] pr-2 text-base font-normal leading-normal'
              />
            </div>
          </div>

          {/* NFT Description */}
          <div className='max-w-[480px]'>
            <div className='min-w-40 space-y-2'>
              <Label htmlFor='description'>Description *</Label>
              <Textarea
                id='description'
                placeholder='Describe your NFT...'
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* Attributes */}
          <div className=''>
            <div className='space-y-2'>
              <Label>Attributes</Label>
              <div className='space-y-3'>
                {formData.attributes.map((attr, index) => (
                  <div key={index} className='flex space-x-2 items-center'>
                    <Input
                      placeholder='Trait Type (e.g., Rarity)'
                      value={attr.trait_type}
                      onChange={e =>
                        handleAttributeChange(
                          index,
                          'trait_type',
                          e.target.value
                        )
                      }
                      disabled={isProcessing}
                      className='flex w-full min-w-0 flex-1 rounded-xl border h-14 p-[15px] pr-2 text-base font-normal leading-normal'
                    />
                    <Input
                      placeholder='Value (e.g., Common)'
                      value={attr.value}
                      onChange={e =>
                        handleAttributeChange(index, 'value', e.target.value)
                      }
                      disabled={isProcessing}
                      className='flex w-full min-w-0 flex-1 rounded-xl border h-14 p-[15px] pr-2 text-base font-normal leading-normal'
                    />
                    {formData.attributes.length > 1 && (
                      <X
                        onClick={() => removeAttribute(index)}
                        aria-label='Remove attribute'
                        className='h-4 w-4 hover:text-accent cursor-pointer'
                        size={16}
                      />
                    )}
                  </div>
                ))}
                <Button
                  variant='outline'
                  size='sm'
                  onClick={addAttribute}
                  disabled={isProcessing}
                  className='h-10 px-4 py-2 min-w-[84px] max-w-[480px] rounded-xl'
                >
                  Add Attribute
                </Button>
              </div>
            </div>
          </div>

          {/* Royalty BPS */}
          <div className='max-w-[480px]'>
            <div className='min-w-40 space-y-2'>
              <Label htmlFor='royalty_bps'>Royalty (Basis Points)</Label>
              <Input
                id='royalty_bps'
                type='number'
                placeholder='500'
                value={formData.royalty_bps}
                onChange={e => handleInputChange('royalty_bps', e.target.value)}
                disabled={isProcessing}
                className='flex w-full min-w-0 flex-1 rounded-xl border h-14 p-[15px] pr-2 text-base font-normal leading-normal'
              />
              <p className='text-sm text-muted-foreground'>
                Royalty percentage in basis points (500 = 5%, 1000 = 10%, max
                1000)
              </p>
            </div>
          </div>

          {/* NFT Preview */}
          {formData.image && (
            <div className='max-w-[480px]'>
              <div className='min-w-40 space-y-2'>
                <Label>NFT Preview</Label>
              </div>
              <div className='flex items-center space-x-4 my-2'>
                <Image
                  src={URL.createObjectURL(formData.image)}
                  alt='NFT Preview'
                  className='w-full h-[300] rounded-xl'
                  width={480}
                  height={480}
                />
              </div>
              <p className='text-sm text-muted-foreground'>
                This is how your NFT will appear when listed on the marketplace.
                Please review the details above and ensure they are correct.
              </p>
            </div>
          )}

          {/* Wallet & Network Info */}
          {authenticated && privyUser?.wallet?.address ? (
            <div className='space-y-3'>
              <div className=''>
                <div className='text-sm font-medium mb-1'>
                  Connected Wallet:
                </div>
                <div className='text-sm text-muted-foreground font-mono'>
                  {privyUser?.wallet?.address}
                </div>
              </div>

              {/* Network Status */}
              <div>
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
              {mintError && (
                <div className='p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-950 dark:border-red-800'>
                  <div className='flex items-center space-x-2'>
                    <AlertCircle className='w-4 h-4 text-red-600' />
                    <span className='text-sm font-medium text-red-800 dark:text-red-200'>
                      Error
                    </span>
                  </div>
                  <p className='text-sm text-red-700 dark:text-red-300 mt-1'>
                    {mintError}
                  </p>
                </div>
              )}

              {isSuccess && transactionHash && (
                <div className='p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950 dark:border-green-800'>
                  <div className='flex items-center space-x-2'>
                    <div className='w-2 h-2 bg-green-500 rounded-full' />
                    <span className='text-sm font-medium text-green-800 dark:text-green-200'>
                      NFT Created Successfully!
                    </span>
                  </div>
                  <p className='text-xs text-green-700 dark:text-green-300 mt-1 font-mono break-all'>
                    Transaction: {transactionHash}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className='max-w-[480px] p-4 bg-amber-50 border border-amber-200 rounded-xl dark:bg-amber-950 dark:border-amber-800'>
              <div className='flex items-center space-x-2'>
                <Wallet className='w-4 h-4 text-amber-600' />
                <span className='text-sm font-medium text-amber-800 dark:text-amber-200'>
                  Wallet Not Connected
                </span>
              </div>
              <p className='text-sm text-amber-700 dark:text-amber-300 mt-1'>
                Connect your wallet to create NFTs
              </p>
            </div>
          )}

          {/* Mint Button */}
          {authenticated && privyUser?.wallet?.address && (
            <div className='flex lg:justify-end'>
              <Button
                onClick={handleMint}
                disabled={
                  !canMint ||
                  !formData.image ||
                  !formData.name.trim() ||
                  !formData.description.trim() ||
                  isProcessing
                }
                className='flex w-full lg:min-w-[84px] lg:max-w-[480px] cursor-pointer items-center justify-center rounded-full h-12 px-5'
              >
                {isProcessing ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2' />
                    Creating NFT...
                  </>
                ) : (
                  <>
                    <Upload className='h-4 w-4 mr-2' />
                    Create NFT
                  </>
                )}
              </Button>
            </div>
          )}

          {!authenticated && (
            <div>
              <Button
                onClick={privyLogin}
                disabled={!ready}
                className='h-10 px-4 py-2 w-full lg:min-w-[84px] lg:max-w-[480px] rounded-xl'
              >
                Connect Wallet
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
