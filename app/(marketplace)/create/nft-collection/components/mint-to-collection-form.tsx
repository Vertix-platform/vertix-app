"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAccount, useChainId } from "wagmi"
import { usePrivy } from "@privy-io/react-auth"
import { Upload, Image as ImageIcon, X, Wallet, AlertCircle } from "lucide-react"
import { useIPFS } from "@/hooks/use-ipfs"
import { useMintNftToCollection } from "@/hooks/use-mint-nft-to-collection"
import { isSupportedChain } from "@/lib/contracts/addresses"
import { supportedChains } from "@/lib/wagmi/config"
import type { Collection } from "@/types/listings"
import { toast } from "react-hot-toast"

interface CollectionMintFormData {
  collection_id: string
  name: string
  description: string
  image: File | null
  attributes: Array<{ trait_type: string; value: string }>
  royalty_bps: string
}

interface MintToCollectionFormProps {
  collections: Collection[]
}

export function MintToCollectionForm({ collections }: MintToCollectionFormProps) {
  const { authenticated, login: privyLogin, ready } = usePrivy()
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { uploadNFT, validateFile, clearError: clearIPFSError } = useIPFS()
  const {
    mintToCollection,
    reset: resetMintToCollection,
    isProcessing,
    canMint,
    error: mintError,
    isSuccess,
    transactionHash
  } = useMintNftToCollection()
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<CollectionMintFormData>({
    collection_id: "",
    name: "",
    description: "",
    image: null,
    attributes: [{ trait_type: "", value: "" }],
    royalty_bps: "500", // Default 5%
  })

  const handleInputChange = (field: keyof CollectionMintFormData, value: string | File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAttributeChange = (index: number, field: 'trait_type' | 'value', value: string) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) =>
        i === index ? { ...attr, [field]: value } : attr
      )
    }))
  }

  const addAttribute = () => {
    setFormData(prev => ({
      ...prev,
      attributes: [...prev.attributes, { trait_type: "", value: "" }]
    }))
  }

  const removeAttribute = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const validation = validateFile(file)
      if (!validation.isValid) {
        toast.error(validation.error || "Invalid file")
        return
      }
      handleInputChange("image", file)
    }
  }

  const removeImage = () => {
    handleInputChange("image", null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const validateForm = (): boolean => {
    if (!formData.collection_id.trim()) {
      toast.error("Please select a collection")
      return false
    }
    if (!formData.image) {
      toast.error("Please select an image to upload")
      return false
    }
    if (!formData.name.trim()) {
      toast.error("NFT name is required")
      return false
    }
    if (!formData.description.trim()) {
      toast.error("NFT description is required")
      return false
    }
    if (formData.royalty_bps) {
      const royalty = parseInt(formData.royalty_bps)
      if (isNaN(royalty) || royalty < 0 || royalty > 10000) {
        toast.error("Royalty must be between 0 and 10000 basis points (0-100%)")
        return false
      }
    }
    return true
  }

  const handleMint = async () => {
    if (!authenticated || !address) {
      toast.error("Please connect your wallet first")
      return
    }

    if (!validateForm()) {
      return
    }

    clearIPFSError()
    resetMintToCollection()

    try {
      // Step 1: Upload to IPFS
      const uploadedData = await uploadNFT(
        formData.image!,
        formData.name.trim(),
        formData.description.trim(),
        formData.attributes
      )

      if (!uploadedData) {
        toast.error("Failed to upload to IPFS")
        return
      }

      // Step 2: Mint NFT to collection via smart contract
      const result = await mintToCollection({
        to: address,
        collectionId: parseInt(formData.collection_id),
        uri: uploadedData.metadataUri,
        metadataHash: uploadedData.metadataHash,
        royaltyBps: formData.royalty_bps ? parseInt(formData.royalty_bps) : 500,
      })

      if (result.success) {
        // Reset form on success
        setFormData({
          collection_id: "",
          name: "",
          description: "",
          image: null,
          attributes: [{ trait_type: "", value: "" }],
          royalty_bps: "500",
        })
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        toast.success("NFT minted to collection successfully")
      }
    } catch (err) {
      console.error("NFT collection mint error:", err)
      toast.error(err instanceof Error ? err.message : "An unexpected error occurred")
    }
  }

  const selectedCollection = collections.find(c => c.collection_id.toString() === formData.collection_id)

  return (
    <div className="space-y-6">
      {/* Collection Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Collection</CardTitle>
          <CardDescription>
            Choose the collection you want to add your NFT to
          </CardDescription>
        </CardHeader>
        <CardContent>
          {collections.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No collections available</p>
            </div>
          ) : (
            <div className="space-y-2">
              {collections.map((collection) => (
                <Button
                  key={collection.collection_id}
                  variant={formData.collection_id === collection.collection_id.toString() ? "default" : "outline"}
                  onClick={() => handleInputChange("collection_id", collection.collection_id.toString())}
                  className="w-full justify-start"
                  disabled={isProcessing}
                >
                  <div className="text-left">
                    <div className="font-medium">{collection.name}</div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Collection Info */}
      {selectedCollection && (
        <Card className="border">
          <CardHeader>
            <CardTitle className="text-accent">Selected Collection</CardTitle>
          </CardHeader>
          <CardContent className="-mt-3">
            <div className="space-y-2">
              <div><strong>Name:</strong> {selectedCollection.name}</div>
              <div><strong>Symbol:</strong> {selectedCollection.symbol}</div>
              <div><strong>Collection ID:</strong> {selectedCollection.collection_id}</div>
              <div><strong>Current Supply:</strong> {selectedCollection.current_supply} / {selectedCollection.max_supply}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* NFT Details Form */}
      <Card>
        <CardHeader>
          <CardTitle>NFT Details</CardTitle>
          <CardDescription>
            Provide the details for your NFT. Upload an image and fill in the metadata.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>NFT Image *</Label>
            <div className="flex items-center space-x-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Choose Image
              </Button>
              {formData.image && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={removeImage}
                  disabled={isProcessing}
                >
                  <X className="h-4 w-4" />
                  Remove
                </Button>
              )}
            </div>
            {formData.image && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">
                  Selected: {formData.image.name} ({(formData.image.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Upload an image file (JPG, PNG, GIF). Max size: 10MB
            </p>
          </div>

          {/* NFT Name */}
          <div className="space-y-2">
            <Label htmlFor="name">NFT Name *</Label>
            <Input
              id="name"
              placeholder="My Awesome NFT"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              disabled={isProcessing}
            />
          </div>

          {/* NFT Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              placeholder="Describe your NFT..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              disabled={isProcessing}
              className="w-full min-h-[100px] p-3 border border-input rounded-md bg-background text-sm"
            />
          </div>

          {/* Attributes */}
          <div className="space-y-2">
            <Label>Attributes</Label>
            <div className="space-y-3">
              {formData.attributes.map((attr, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    placeholder="Trait Type (e.g., Rarity)"
                    value={attr.trait_type}
                    onChange={(e) => handleAttributeChange(index, 'trait_type', e.target.value)}
                    disabled={isProcessing}
                  />
                  <Input
                    placeholder="Value (e.g., Common)"
                    value={attr.value}
                    onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                    disabled={isProcessing}
                  />
                  {formData.attributes.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeAttribute(index)}
                      disabled={isProcessing}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addAttribute}
                disabled={isProcessing}
              >
                Add Attribute
              </Button>
            </div>
          </div>

          {/* Royalty BPS */}
          <div className="space-y-2">
            <Label htmlFor="royalty_bps">Royalty (Basis Points)</Label>
            <Input
              id="royalty_bps"
              type="number"
              placeholder="500"
              value={formData.royalty_bps}
              onChange={(e) => handleInputChange("royalty_bps", e.target.value)}
              disabled={isProcessing}
            />
            <p className="text-sm text-muted-foreground">
              Royalty percentage in basis points (500 = 5%, 1000 = 10%, max 1000)
            </p>
          </div>

          {/* Wallet & Network Info */}
          {authenticated && isConnected && address ? (
            <div className="space-y-3">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-1">Connected Wallet:</div>
                <div className="text-sm text-muted-foreground font-mono">
                  {address}
                </div>
              </div>

              {/* Network Status */}
              <div className={`p-4 rounded-lg border ${
                isSupportedChain(chainId) 
                  ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                  : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
              }`}>
                <div className="flex items-center space-x-2">
                  {isSupportedChain(chainId) ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">
                        Network Supported
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800 dark:text-red-200">
                        Unsupported Network
                      </span>
                    </>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {isSupportedChain(chainId) 
                    ? `Chain ID: ${chainId}` 
                    : `Please switch to: ${supportedChains.map(c => c.name).join(', ')}`
                  }
                </div>
              </div>

              {/* Transaction Status */}
              {mintError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-950 dark:border-red-800">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-200">Error</span>
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{mintError}</p>
                </div>
              )}

              {isSuccess && transactionHash && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950 dark:border-green-800">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      NFT Minted to Collection Successfully!
                    </span>
                  </div>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1 font-mono break-all">
                    Transaction: {transactionHash}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950 dark:border-amber-800">
              <div className="flex items-center space-x-2">
                <Wallet className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Wallet Not Connected
                </span>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Connect your wallet to mint NFTs to collections
              </p>
            </div>
          )}

          {/* Mint Button */}
          <Button
            onClick={handleMint}
            disabled={!canMint || !formData.collection_id || !formData.image || !formData.name.trim() || !formData.description.trim() || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Minting to Collection...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Mint to Collection
              </>
            )}
          </Button>

          {!authenticated && (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Please connect your wallet to create an NFT
              </p>
              <Button onClick={privyLogin} disabled={!ready}>
                Connect Wallet
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
