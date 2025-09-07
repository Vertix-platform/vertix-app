import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { CollectionsGrid } from "./components/collections-grid"
import { CollectionsLoadingSkeleton } from "./components/loading-skeleton"
import { getCollections } from "@/lib/server-actions"

// Error boundary component for collections fetching
async function CollectionsData() {
  try {
    const collections = await getCollections()
    return <CollectionsGrid collections={collections} />
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {errorMessage}</p>
        <Button 
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    )
  }
}

export default async function CollectionsPage() {
  return (
    <div className="min-h-screen">
      <section className="container mx-auto px-4 py-8">
        <div className="text-left space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl 2xl:text-5xl font-bold">Collections</h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Discover and explore NFT collections on the platform
              </p>
            </div>
            <Link href="/create/collection">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Collection
              </Button>
            </Link>
          </div>

          <Suspense fallback={<CollectionsLoadingSkeleton />}>
            <CollectionsData />
          </Suspense>
        </div>
      </section>
    </div>
  )
}