'use server'

import type { Collection } from "@/types/listings"

const baseUrl = process.env.NEXT_PUBLIC_RUST_BACKEND_URL + '/api/v1'

/**
 * Fetch all collections from the backend
 * @returns Promise<Collection[]> - Array of collections or empty array on error
 */
export async function getCollections(): Promise<Collection[]> {
  try {
    const response = await fetch(`${baseUrl}/contracts/collections`, {
      next: { revalidate: 60 } // Revalidate every minute
    })

    if (!response.ok) {
      // Log the error for debugging
      const errorText = await response.text()
      console.error('Backend error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })

      if (response.status === 500) {
        throw new Error('Backend service temporarily unavailable. Please try again later.')
      } else if (response.status === 404) {
        throw new Error('Collections endpoint not found. Please check backend configuration.')
      } else {
        throw new Error(`Backend error: ${response.status} ${response.statusText}`)
      }
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || data.error || 'Failed to fetch collections')
    }

    const collections = data.data || []

    return collections
  } catch (error) {
    console.error('Error fetching collections:', error)

    // Provide user-friendly error messages
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        throw new Error('Unable to connect to the backend service. Please check your internet connection and try again.')
      } else if (error.message.includes('Backend error')) {
        throw error // Re-throw backend-specific errors
      } else {
        throw new Error('Failed to load collections. Please try again later.')
      }
    }

    throw new Error('An unexpected error occurred while loading collections.')
  }
}
