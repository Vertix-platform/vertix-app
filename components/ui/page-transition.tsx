'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Logo from "@/assets/svg/vertix-long.svg"

export const PageTransition = () => {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);

    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isTransitioning) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
            <Image src={Logo} alt="Vertix" width={100} height={100} className='w-full h-full animate-pulse' />
          <div className="absolute inset-0 h-16 w-16 border-4 border-primary/20 rounded-full animate-ping" />
        </div>
      </div>
    </div>
  );
};
