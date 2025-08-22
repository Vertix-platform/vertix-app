import React from 'react'
import { Navbar } from '@/components/layout/navbar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="w-full h-screen">
    <Navbar />
    {children}
    </div>
}