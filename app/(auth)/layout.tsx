import React from 'react';
import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vertix - Digital Assets Marketplace',
  description: 'Login or signup or connect your wallet to Vertix',
};

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return <section className='h-full overflow-y-auto'>{children}</section>;
};

export default AuthLayout;
