import React from 'react';
import { ListAssetFormClient } from './list-asset-form-client';

interface ListAssetFormPageProps {
  params: Promise<{ id: string }>;
}

const ListAssetFormPage = async ({ params }: ListAssetFormPageProps) => {
  const { id } = await params;

  return (
    <div className='min-h-screen'>
      <ListAssetFormClient tokenId={id} />
    </div>
  );
};

export default ListAssetFormPage;
