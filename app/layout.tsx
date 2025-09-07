import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
// import { ThemeProvider } from "@/components/theme/theme-provider";
import { NuqsAdapter } from 'nuqs/adapters/next/pages'
import { Toaster } from 'react-hot-toast';
import { PageTransition } from "@/components/ui/page-transition";


const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Vertix - Decentralized Digital Asset Marketplace",
  description: "Trade NFTs, gaming assets, and digital collectibles on Polygon and Base networks",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} antialiased font-space-grotesk`}
        suppressHydrationWarning
      >
        {/* <ThemeProvider defaultTheme="dark" storageKey="vertix-theme"> */}
          <AuthProvider>
            <NuqsAdapter>
              <PageTransition />
              {children}
            </NuqsAdapter>
          </AuthProvider>
          <Toaster position="top-right" />
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
