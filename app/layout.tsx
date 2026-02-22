import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/styles/Clerk.css";
import "@/styles/ItsBtn.css";
import { ClerkProvider, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import SplashPage from "@/components/SplashPage";
import DemoAccountToast from "@/components/DemoAccountToast";
import DemoSwitchOverlay from "@/components/DemoSwitchOverlay";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Clock 'em",
  description: "Custom employee management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <DemoSwitchOverlay />
            <SignedOut>
              <SplashPage />
            </SignedOut>
            <SignedIn>
              <DemoAccountToast />
              <div className="w-screen h-fit flex justify-center">
                <Navbar />
              </div>
              <div className="mt-16">{children}</div>
            </SignedIn>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
