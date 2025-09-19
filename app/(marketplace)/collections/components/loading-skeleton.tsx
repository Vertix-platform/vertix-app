import { CardBody, CardContainer, CardItem } from '@/components/ui/3d-card';

export function CollectionsLoadingSkeleton() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
      {[...Array(8)].map((_, i) => (
        <CardContainer
          key={i}
          className='hover:shadow-lg transition-shadow bg-card text-card-foreground border rounded-xl h-full min-w-full animate-pulse'
        >
          <CardBody className='relative group/card border-black/[0.1] h-full rounded-xl p-2 border'>
            {/* Image Section */}
            <CardItem translateZ='100' className='w-full'>
              <div className='w-full h-[200px] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg'></div>
            </CardItem>

            {/* Content Section */}
            <div className='mt-4'>
              {/* Name and Collection ID */}
              <div className='flex justify-between items-center'>
                <CardItem className='text-xl'>
                  <div className='h-6 bg-gray-300 dark:bg-gray-600 rounded w-32'></div>
                </CardItem>
                <CardItem className='flex items-center gap-0.5'>
                  <div className='w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded'></div>
                  <div className='h-4 bg-gray-300 dark:bg-gray-600 rounded w-8'></div>
                </CardItem>
              </div>

              {/* Creator Section */}
              <CardItem className='flex items-center justify-between gap-1.5 text-sm mt-2'>
                {/* Avatar */}
                <div className='w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full'></div>
                {/* Creator Address */}
                <div className='h-4 bg-gray-300 dark:bg-gray-600 rounded w-20'></div>
              </CardItem>
            </div>
          </CardBody>
        </CardContainer>
      ))}
    </div>
  );
}
