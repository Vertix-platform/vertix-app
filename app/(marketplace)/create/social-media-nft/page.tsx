"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiClient } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { ArrowLeft, Upload, AlertCircle} from "lucide-react"
import Link from "next/link"
import { RiFacebookFill, RiInstagramFill, RiTiktokFill, RiTwitchFill, RiTwitterFill, RiYoutubeFill } from "@remixicon/react"
import type { InitiateSocialMediaNftMintResponse, MintSocialMediaNftResponse } from "@/types/listings"

interface SocialMediaFormData {
  platform: 'x' | 'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'twitch'
  user_id: string
  username: string
  display_name: string
  profile_image_url: string
  follower_count: string
  verified: boolean
  access_token: string
  custom_image_url: string
  royalty_bps: string
}

const platformConfig = {
  x: { name: 'X (Twitter)', icon: RiTwitterFill, color: 'text-blue-500' },
  instagram: { name: 'Instagram', icon: RiInstagramFill, color: 'text-pink-500' },
  facebook: { name: 'Facebook', icon: RiFacebookFill, color: 'text-blue-600' },
  youtube: { name: 'YouTube', icon: RiYoutubeFill, color: 'text-red-500' },
  tiktok: { name: 'TikTok', icon: RiTiktokFill, color: 'text-black' },
  twitch: { name: 'Twitch', icon: RiTwitchFill, color: 'text-purple-500' },
}

const MintSocialMediaNftPage = () => {
  const { user } = useAuth()
  const [formData, setFormData] = useState<SocialMediaFormData>({
    platform: 'instagram',
    user_id: "",
    username: "",
    display_name: "",
    profile_image_url: "",
    follower_count: "",
    verified: false,
    access_token: "",
    custom_image_url: "",
    royalty_bps: "500", // Default 5%
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<MintSocialMediaNftResponse | null>(null)
  const [initiateData, setInitiateData] = useState<InitiateSocialMediaNftMintResponse | null>(null)

  const handleInputChange = (field: keyof SocialMediaFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError(null)
  }

  const validateForm = (): boolean => {
    if (!formData.user_id.trim()) {
      setError("User ID is required")
      return false
    }
    if (!formData.username.trim()) {
      setError("Username is required")
      return false
    }
    if (!formData.display_name.trim()) {
      setError("Display name is required")
      return false
    }
    if (!formData.access_token.trim()) {
      setError("Access token is required")
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

  const handleInitiateMint = async () => {
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
      const response = await apiClient.initiateSocialMediaNftMint({
        platform: formData.platform,
        user_id: formData.user_id.trim(),
        username: formData.username.trim(),
        display_name: formData.display_name.trim(),
        profile_image_url: formData.profile_image_url.trim() || undefined,
        follower_count: formData.follower_count ? parseInt(formData.follower_count) : undefined,
        verified: formData.verified,
        access_token: formData.access_token.trim(),
        custom_image_url: formData.custom_image_url.trim() || undefined,
        royalty_bps: formData.royalty_bps ? parseInt(formData.royalty_bps) : undefined,
      })

      if (response.success && response.data) {
        setInitiateData(response.data)
      } else {
        setError(response.error || "Failed to initiate social media NFT minting")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleMint = async () => {
    if (!user?.wallet_address || !initiateData) {
      setError("Please initiate the minting process first")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.mintSocialMediaNft({
        wallet_address: user.wallet_address,
        social_media_id: initiateData.data!.social_media_id,
        token_uri: initiateData.data!.token_uri,
        metadata_hash: initiateData.data!.metadata_hash,
        royalty_bps: initiateData.data!.royalty_bps,
        signature: initiateData.data!.signature,
      })

      if (response.success && response.data) {
        setSuccess(response.data)
        setInitiateData(null)
        setFormData({
          platform: 'instagram',
          user_id: "",
          username: "",
          display_name: "",
          profile_image_url: "",
          follower_count: "",
          verified: false,
          access_token: "",
          custom_image_url: "",
          royalty_bps: "500",
        })
      } else {
        setError(response.error || "Failed to mint social media NFT")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const PlatformIcon = platformConfig[formData.platform].icon

  return (
    <div className="min-h-screen">
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <Link href="/mint">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Mint
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Mint Social Media NFT</h1>
              <p className="text-muted-foreground">
                Create verifiable NFTs from your social media profiles
              </p>
            </div>
          </div>


          {/* Error Alert */}
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Initiate Data Display */}
          {initiateData && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800">Ready to Mint</CardTitle>
                <CardDescription className="text-blue-700">
                  Your social media data has been verified. Click the button below to mint your NFT.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>Social Media ID:</strong> {initiateData.data?.social_media_id}</div>
                  <div><strong>Royalty:</strong> {initiateData.data?.royalty_bps ? (initiateData.data.royalty_bps / 100) : 0}%</div>
                </div>
                <Button
                  onClick={handleMint}
                  disabled={isLoading}
                  className="w-full mt-4"
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
                      Mint Social Media NFT
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Social Media Form */}
          <Card>
            <CardHeader>
              <CardTitle>Social Media Profile Details</CardTitle>
              <CardDescription>
                Connect your social media profile to create a verifiable NFT
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Platform Selection */}
              <div className="space-y-2">
                <Label>Platform *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(platformConfig).map(([key, config]) => (
                    <Button
                      key={key}
                      variant={formData.platform === key ? "default" : "outline"}
                      onClick={() => handleInputChange("platform", key as 'x' | 'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'twitch')}
                      className="justify-start"
                      disabled={isLoading}
                    >
                      {config.icon && <config.icon className="h-4 w-4 mr-2" />}
                      {config.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* User ID */}
              <div className="space-y-2">
                <Label htmlFor="user_id">User ID *</Label>
                <Input
                  id="user_id"
                  placeholder="123456789"
                  value={formData.user_id}
                  onChange={(e) => handleInputChange("user_id", e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground">
                  Your unique user ID on the selected platform
                </p>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  placeholder="@username"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name *</Label>
                <Input
                  id="display_name"
                  placeholder="Your Display Name"
                  value={formData.display_name}
                  onChange={(e) => handleInputChange("display_name", e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Profile Image URL */}
              <div className="space-y-2">
                <Label htmlFor="profile_image_url">Profile Image URL</Label>
                <Input
                  id="profile_image_url"
                  placeholder="https://example.com/profile.jpg"
                  value={formData.profile_image_url}
                  onChange={(e) => handleInputChange("profile_image_url", e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Follower Count */}
              <div className="space-y-2">
                <Label htmlFor="follower_count">Follower Count</Label>
                <Input
                  id="follower_count"
                  type="number"
                  placeholder="1000"
                  value={formData.follower_count}
                  onChange={(e) => handleInputChange("follower_count", e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Verified Status */}
              <div className="flex items-center space-x-2">
                <input
                  id="verified"
                  type="checkbox"
                  checked={formData.verified}
                  onChange={(e) => handleInputChange("verified", e.target.checked)}
                  disabled={isLoading}
                  className="rounded"
                />
                <Label htmlFor="verified">Verified Account</Label>
              </div>

              {/* Access Token */}
              <div className="space-y-2">
                <Label htmlFor="access_token">Access Token *</Label>
                <Input
                  id="access_token"
                  type="password"
                  placeholder="Your platform access token"
                  value={formData.access_token}
                  onChange={(e) => handleInputChange("access_token", e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground">
                  Platform-specific access token for verification
                </p>
              </div>

              {/* Custom Image URL */}
              <div className="space-y-2">
                <Label htmlFor="custom_image_url">Custom Image URL</Label>
                <Input
                  id="custom_image_url"
                  placeholder="https://example.com/custom-image.jpg"
                  value={formData.custom_image_url}
                  onChange={(e) => handleInputChange("custom_image_url", e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground">
                  Optional custom image for your NFT (overrides profile image)
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

              {/* Initiate Button */}
              <Button
                onClick={handleInitiateMint}
                disabled={isLoading || !user?.wallet_address}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Verify & Prepare Mint
                  </>
                )}
              </Button>

              {!user?.wallet_address && (
                <p className="text-sm text-muted-foreground text-center">
                  Please connect your wallet to mint a social media NFT
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

export default MintSocialMediaNftPage
