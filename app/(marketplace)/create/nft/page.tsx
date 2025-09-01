"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiClient } from "@/lib/api"
import { usePrivy } from "@privy-io/react-auth"
import { ArrowLeft, Upload, CheckCircle, AlertCircle, Image as ImageIcon, X } from "lucide-react"
import Link from "next/link"
import { useIPFS } from "@/hooks/use-ipfs"

interface MintFormData {
  name: string
  description: string
  image: File | null
  attributes: Array<{ trait_type: string; value: string }>
  collection_id?: string
  royalty_bps?: string
}



const MintNftPage = () => {
  const { authenticated, user: privyUser, login: privyLogin, ready } = usePrivy()
  const { uploadNFT, validateFile, clearError: clearIPFSError } = useIPFS()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<MintFormData>({
    name: "",
    description: "",
    image: null,
    attributes: [{ trait_type: "", value: "" }],
    collection_id: "",
    royalty_bps: "500", // Default 5%
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{
    token_id: number
    transaction_hash: string
    block_number: number
  } | null>(null)

  const handleInputChange = (field: keyof MintFormData, value: string | File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError(null)
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
        setError(validation.error || "Invalid file")
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







  const handleMint = async () => {
    if (!authenticated || !privyUser?.wallet?.address) {
      setError("Please connect your wallet first")
      return
    }

    if (!formData.image) {
      setError("Please select an image to upload")
      return
    }

    if (!formData.name.trim()) {
      setError("NFT name is required")
      return
    }

    if (!formData.description.trim()) {
      setError("NFT description is required")
      return
    }

    if (formData.royalty_bps) {
      const royalty = parseInt(formData.royalty_bps)
      if (isNaN(royalty) || royalty < 0 || royalty > 10000) {
        setError("Royalty must be between 0 and 10000 basis points (0-100%)")
        return
      }
    }

    setIsLoading(true)
    setError(null)
    clearIPFSError()

    try {
      // Step 1: Upload to IPFS
      const uploadedData = await uploadNFT(
        formData.image,
        formData.name.trim(),
        formData.description.trim(),
        formData.attributes
      )

      if (!uploadedData) {
        setError("Failed to upload to IPFS")
        return
      }

      // Step 2: Mint NFT on blockchain
      const response = await apiClient.mintNft({
        wallet_address: privyUser.wallet.address,
        token_uri: uploadedData.metadataUri,
        metadata_hash: uploadedData.metadataHash,
        collection_id: formData.collection_id ? parseInt(formData.collection_id) : undefined,
        royalty_bps: formData.royalty_bps ? parseInt(formData.royalty_bps) : undefined,
      })

      if (response.success && response.data) {
        setSuccess({
          token_id: response.data.data?.token_id || 0,
          transaction_hash: response.data.data?.transaction_hash || "",
          block_number: response.data.data?.block_number || 0,
        })
        setFormData({
          name: "",
          description: "",
          image: null,
          attributes: [{ trait_type: "", value: "" }],
          collection_id: "",
          royalty_bps: "500",
        })
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } else {
        setError(response.error || "Failed to mint NFT")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/mint">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Create
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Create Basic NFT</h1>
              <p className="text-muted-foreground">
                Create a new NFT with image upload and metadata generation.
              </p>
            </div>
          </div>

          {/* Success Alert */}
          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="font-medium mb-2">NFT Created Successfully!</div>
                <div className="text-sm space-y-1">
                  <div>Token ID: {success.token_id}</div>
                  <div>Transaction Hash: {success.transaction_hash}</div>
                  <div>Block Number: {success.block_number}</div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}



          {/* NFT Details Form */}
          <Card>
            <CardHeader>
              <CardTitle>Create Basic NFT</CardTitle>
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
                    disabled={isLoading}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Choose Image
                  </Button>
                  {formData.image && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={removeImage}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4 mr-2" />
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                        disabled={isLoading}
                      />
                      <Input
                        placeholder="Value (e.g., Common)"
                        value={attr.value}
                        onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                        disabled={isLoading}
                      />
                      {formData.attributes.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeAttribute(index)}
                          disabled={isLoading}
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
                    disabled={isLoading}
                  >
                    Add Attribute
                  </Button>
                </div>
              </div>

              {/* Collection ID */}
              <div className="space-y-2">
                <Label htmlFor="collection_id">Collection ID (Optional)</Label>
                <Input
                  id="collection_id"
                  type="number"
                  placeholder="123"
                  value={formData.collection_id}
                  onChange={(e) => handleInputChange("collection_id", e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground">
                  ID of the collection to create this NFT to (optional)
                </p>
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
                  disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground">
                  Royalty percentage in basis points (500 = 5%, 1000 = 10%, max 10000)
                </p>
              </div>



              {/* Wallet Info */}
              {authenticated && privyUser?.wallet?.address && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm font-medium mb-1">Creating to Wallet:</div>
                  <div className="text-sm text-muted-foreground font-mono">
                    {privyUser.wallet.address}
                  </div>
                </div>
              )}

              {/* Mint Button */}
              <Button
                onClick={handleMint}
                disabled={isLoading || !authenticated || !privyUser?.wallet?.address || !formData.image || !formData.name.trim() || !formData.description.trim()}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Uploading & Minting...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Create NFT
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

          {/* Help Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">One-Step Process</h4>
                  <p className="text-sm text-muted-foreground">
                    When you click &quot;Create NFT&quot;, your image will be automatically uploaded to IPFS, metadata will be generated, and the NFT will be created on the blockchain in one seamless process. No account creation required - just connect your wallet and start creating!
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Metadata Structure</h4>
                  <p className="text-sm text-muted-foreground">
                    Your metadata will include name, description, image URI, and custom attributes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default MintNftPage;
