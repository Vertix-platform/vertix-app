import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import { NFTCreationForm } from './components/nft-creation-form';

export default function MintNftPage() {
  return (
    <div className='min-h-screen'>
      <section className='container mx-auto px-4 py-8'>
        <div>
          {/* Header */}
          <div className='mb-8'>
            <PageBreadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'Create', href: '/create' },
                { label: 'Create NFT' },
              ]}
              className='mb-4'
            />
            <div>
              <h1 className='text-3xl font-bold'>Create an NFT</h1>
              <p className='text-muted-foreground'>
                Provide the details for your NFT. Upload an image and fill in
                the metadata.
              </p>
            </div>
          </div>

          <NFTCreationForm />
        </div>
      </section>
    </div>
  );
}
