'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  User,
  Wallet,
  LogOut,
  Settings,
  Plus,
  Menu,
  X,
  Search,
  Bell,
} from 'lucide-react';
// import { ThemeToggle } from '@/components/theme/theme-toggle';
import { formatAddress } from '@/lib/custom-utils';
import toast from 'react-hot-toast';
import { Input } from '../ui/input';
import Logo from "@/assets/svg/vertix-long.svg"
import Image from 'next/image';
import {
  mobileMenuVariants,
  backdropVariants,
} from '@/lib/animations';


export const Navbar = () => {
  const { user, isAuthenticated, logout, connectWallet } = useAuth();
  const { login, logout: privyLogout, authenticated, ready, user: privyUser } = usePrivy();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const getLinkClassName = (href: string, isMobile = false) => {
    const baseClasses = `text-sm font-medium transition-colors ${isMobile ? 'block' : ''}`;
    const activeClasses = "text-accent";
    const inactiveClasses = "hover:text-accent";

    return `${baseClasses} ${isActive(href) ? activeClasses : inactiveClasses}`;
  };

  const handleLogout = () => {
    logout();
    privyLogout();
    setIsMobileMenuOpen(false);
  };

  const handleConnectWallet = async () => {
    try {
      setIsConnectingWallet(true);
      await login();

      // If user has a wallet address, connect it to the backend
      if (privyUser?.wallet?.address) {
        await connectWallet(privyUser.wallet.address);
        toast.success('Wallet connected successfully!');
      }
    } catch (err) {
      toast.error('Failed to connect wallet');
      console.error(err);
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const getUserDisplay = () => {
    // Only show user display if user has actually logged in/signed up
    if (!user || !isAuthenticated || (!user.email && !user.wallet_address)) return null;

    if (user.wallet_address) {
      return (
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">
            {formatAddress(user.wallet_address)}
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
          {user.first_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
        </div>
        <span className="hidden sm:inline">
          {user.first_name || user.email}
        </span>
      </div>
    );
  };

  const getWalletButton = () => {
    if (authenticated && privyUser?.wallet?.address) {
      return (
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">
            {formatAddress(privyUser.wallet.address)}
          </span>
        </Button>
      );
    }

    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleConnectWallet}
        disabled={isConnectingWallet || !ready}
        className="flex items-center gap-2"
      >
        <Wallet className="h-4 w-4" />
        {isConnectingWallet ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    );
  };

  return (
    <nav className="bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image src={Logo} alt="Vertix" width={100} height={100} className='w-20 h-20' />
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-input text-primary border-0 rounded-md focus:outline-none text-sm"
              />
            </div>

            <div className="flex items-center gap-6">
              <Link href="/" className={getLinkClassName('/')}>
                Marketplace
              </Link>
              <Link href="/collections" className={getLinkClassName('/collections')}>
                Collections
              </Link>
              <Link href="/creators" className={getLinkClassName('/creators')}>
                Creators
              </Link>
              <Link href="/create" className={getLinkClassName('/create')}>
                Create
              </Link>
            </div>

            {isAuthenticated && user && (user.email || user.wallet_address) && (
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {" "}
                </span>
              </Button>
            )}

            {getWalletButton()}

            {isAuthenticated && user && (user.email || user.wallet_address) ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    {getUserDisplay()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-listings">
                      <Plus className="h-4 w-4 mr-2" />
                      My Listings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm">
                <Link href="/login">
                  Get Started
                </Link>
              </Button>
            )}

            {/* Theme Toggle */}
            {/* <ThemeToggle /> */}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="fixed inset-0 z-50 md:hidden"
              initial="closed"
              animate="open"
              exit="closed"
            >
              <motion.div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                variants={backdropVariants}
                onClick={() => setIsMobileMenuOpen(false)}
              />

              <motion.div
                className="absolute right-0 top-0 bottom-0 h-screen w-screen bg-card border-l shadow-xl"
                variants={mobileMenuVariants}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-2">
                      <Image src={Logo} alt="Vertix" width={80} height={80} className='w-16 h-16' />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2 bg-input text-primary border-0 rounded-md focus:outline-none text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Link
                        href="/"
                        className={getLinkClassName('/', true)}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Marketplace
                      </Link>
                      <Link
                        href="/collections"
                        className={getLinkClassName('/collections', true)}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Collections
                      </Link>
                      <Link
                        href="/creators"
                        className={getLinkClassName('/creators', true)}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Creators
                      </Link>
                      <Link
                        href="/create"
                        className={getLinkClassName('/create', true)}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Create
                      </Link>
                    </div>

                    {isAuthenticated && user && (user.email || user.wallet_address) ? (
                      <div className="space-y-2 pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm">
                          {getUserDisplay()}
                        </div>
                        <div className="space-y-1">
                          <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                            <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                              <User className="h-4 w-4 mr-2" />
                              Profile
                            </Link>
                          </Button>
                          <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                            <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)}>
                              <Settings className="h-4 w-4 mr-2" />
                              Settings
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-destructive hover:text-destructive"
                            onClick={handleLogout}
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={handleConnectWallet}
                          disabled={isConnectingWallet || !ready}
                        >
                          <Wallet className="h-4 w-4 mr-2" />
                          {isConnectingWallet ? 'Connecting...' : 'Connect Wallet'}
                        </Button>
                        <Button asChild size="sm" className="w-full">
                          <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                            Get Started
                          </Link>
                        </Button>
                      </div>
                    )}
                   </div>
                 </div>
               </motion.div>
             </motion.div>
           )}
         </AnimatePresence>
      </div>
    </nav>
  );
};
