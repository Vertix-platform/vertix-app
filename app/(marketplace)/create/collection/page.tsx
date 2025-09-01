"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiClient } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { ArrowLeft, Upload, CheckCircle, AlertCircle, Plus, FolderOpen } from "lucide-react"
import Link from "next/link"
import type { Collection } from "@/types/listings"

interface CollectionMintFormData {
  collection_id: string
  token_uri: string
  metadata_hash: string
  royalty_bps: string
}

const MintCollectionPage = () => {
  const { user } = useAuth()
  const [formData, setFormData] = useState<CollectionMintFormData>({
    collection_id: "",
    token_uri: "",
    metadata_hash: "",
    royalty_bps: "500", // Default 5%
  })
  const [collections, setCollections] = useState<Collection[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCollections, setIsLoadingCollections] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{
    token_id: number
    collection_id: number
    transaction_hash: string
    block_number: number
  } | null>(null)

  useEffect(() => {
    loadCollections()
  }, [])

  const loadCollections = async () => {
    setIsLoadingCollections(true)
    try {
      // Note: This endpoint needs to be implemented in the backend
      // For now, we'll use a mock response
      const mockCollections: Collection[] = [
        {
          id: 1,
          name: "My First Collection",
          description: "A collection of my first NFTs",
          owner: user?.wallet_address || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: "Digital Art Series",
          description: "A series of digital art pieces",
          owner: user?.wallet_address || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]
      setCollections(mockCollections)
    } catch (err) {
      console.error("Failed to load collections:", err)
    } finally {
      setIsLoadingCollections(false)
    }
  }

  const handleInputChange = (field: keyof CollectionMintFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError(null)
  }

  const validateForm = (): boolean => {
    if (!formData.collection_id.trim()) {
      setError("Collection ID is required")
      return false
    }
    if (!formData.token_uri.trim()) {
      setError("Token URI is required")
      return false
    }
    if (!formData.metadata_hash.trim()) {
      setError("Metadata hash is required")
      return false
    }
    if (formData.royalty_bps) {
      const royalty = parseInt(formData.royalty_bps)
      if (isNaN(royalty) || royalty < 0 || royalty > 10000) {
        setError("Royalty must be between 0 and 10000 basis points (0-100%)")
        return false
      }
    }
    return true
  }

  const handleMint = async () => {
    if (!user?.wallet_address) {
      setError("Please connect your wallet first")
      return
    }

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.mintNftToCollection({
        wallet_address: user.wallet_address,
        token_uri: formData.token_uri.trim(),
        metadata_hash: formData.metadata_hash.trim(),
        collection_id: parseInt(formData.collection_id),
        royalty_bps: formData.royalty_bps ? parseInt(formData.royalty_bps) : undefined,
      })

      if (response.success && response.data) {
        setSuccess({
          token_id: response.data.token_id,
          collection_id: parseInt(formData.collection_id),
          transaction_hash: response.data.transaction_hash,
          block_number: response.data.block_number,
        })
        setFormData({
          collection_id: "",
          token_uri: "",
          metadata_hash: "",
          royalty_bps: "500",
        })
      } else {
        setError(response.error || "Failed to mint NFT to collection")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const selectedCollection = collections.find(c => c.id.toString() === formData.collection_id)

  return (
    <div className="min-h-screen">
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <Link href="/create">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Mint
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Mint to Collection</h1>
              <p className="text-muted-foreground">
                Add NFTs to your existing collections
              </p>
            </div>
          </div>

          {/* Success Alert */}
          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="font-medium mb-2">NFT Minted to Collection Successfully!</div>
                <div className="text-sm space-y-1">
                  <div>Token ID: {success.token_id}</div>
                  <div>Collection ID: {success.collection_id}</div>
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

          {/* Collection Selection */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select Collection</CardTitle>
              <CardDescription>
                Choose the collection you want to create your NFT to
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCollections ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                  <span className="ml-2">Loading collections...</span>
                </div>
              ) : collections.length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No collections found</p>
                  <Link href="/collections/create">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Collection
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {collections.map((collection) => (
                    <Button
                      key={collection.id}
                      variant={formData.collection_id === collection.id.toString() ? "default" : "outline"}
                      onClick={() => handleInputChange("collection_id", collection.id.toString())}
                      className="w-full justify-start"
                      disabled={isLoading}
                    >
                      <div className="text-left">
                        <div className="font-medium">{collection.name}</div>
                        <div className="text-sm text-muted-foreground">{collection.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected Collection Info */}
          {selectedCollection && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800">Selected Collection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div><strong>Name:</strong> {selectedCollection.name}</div>
                  <div><strong>Description:</strong> {selectedCollection.description}</div>
                  <div><strong>Collection ID:</strong> {selectedCollection.id}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mint Form */}
          <Card>
            <CardHeader>
              <CardTitle>NFT Details</CardTitle>
              <CardDescription>
                Provide the metadata for your NFT that will be added to the selected collection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Token URI */}
              <div className="space-y-2">
                <Label htmlFor="token_uri">Token URI *</Label>
                <Input
                  id="token_uri"
                  placeholder="ipfs://QmYourMetadataHash"
                  value={formData.token_uri}
                  onChange={(e) => handleInputChange("token_uri", e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground">
                  IPFS URI pointing to your NFT metadata JSON file
                </p>
              </div>

              {/* Metadata Hash */}
              <div className="space-y-2">
                <Label htmlFor="metadata_hash">Metadata Hash *</Label>
                <Input
                  id="metadata_hash"
                  placeholder="0x1234567890abcdef..."
                  value={formData.metadata_hash}
                  onChange={(e) => handleInputChange("metadata_hash", e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground">
                  32-byte hex hash of your metadata for verification
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
              {user?.wallet_address && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm font-medium mb-1">Minting to Wallet:</div>
                  <div className="text-sm text-muted-foreground font-mono">
                    {user.wallet_address}
                  </div>
                </div>
              )}

              {/* Mint Button */}
              <Button
                onClick={handleMint}
                disabled={isLoading || !user?.wallet_address || !formData.collection_id}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Minting...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Mint to Collection
                  </>
                )}
              </Button>

              {!user?.wallet_address && (
                <p className="text-sm text-muted-foreground text-center">
                  Please connect your wallet to create an NFT
                </p>
              )}
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Collection Minting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Benefits of Collection Minting</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Organize related NFTs together</li>
                    <li>• Easier management and discovery</li>
                    <li>• Consistent branding and metadata</li>
                    <li>• Better marketplace organization</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Metadata Requirements</h4>
                  <p className="text-sm text-muted-foreground">
                    Your metadata should include collection-specific attributes and follow the same format as basic NFTs.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

export default MintCollectionPage
