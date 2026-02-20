"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Menu, X, Loader2 } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { useAuth, useClerk, UserButton } from "@clerk/nextjs";
import { ModeToggle } from "@/components/mode-toggle";

import { useLottie } from "lottie-react";
import medicalAnimation from "@/animations/doctor.json";

const navigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

const userNavigation = [
  { name: "Profile", href: "/profile" },
  { name: "Reports", href: "/reports" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { openSignIn, openSignUp } = useClerk();

  const defaultOptions = {
    animationData: medicalAnimation,
    loop: true,
  };

  const { View } = useLottie(defaultOptions);

  console.log('User ID:', userId);

  // Show loading state
  if (!isLoaded) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <nav className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative h-8 w-8">
                {View}
              </div>
              <span className="hidden font-bold text-xl sm:inline-block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Medstra
              </span>
            </Link>
          </div>
          <Loader2 className="h-5 w-5 animate-spin" />
        </nav>
      </header>
    );
  }

  const handleSignIn = () => {
    openSignIn({
      redirectUrl: pathname,
    });
  };

  const handleSignUp = () => {
    openSignUp({
      redirectUrl: pathname,
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between">
        {/* Logo and Desktop Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-8 w-8">
              {View}
            </div>
            <span className="hidden font-bold text-xl sm:inline-block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Medstra
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {item.name}
                {pathname === item.href && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-primary"
                    animate
                  />
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            {!isSignedIn ? (
              <>
                <ModeToggle />
                <Button variant="ghost" onClick={handleSignIn}>
                  Sign In
                </Button>
                <Button variant="outline" onClick={handleSignUp}>
                  Sign Up
                </Button>
                <Button asChild>
                  <Link href="/assessment/select">Start Assessment</Link>
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <ModeToggle />
                  {userNavigation.map((item) => (
                    <Button key={item.href} variant="ghost" asChild>
                      <Link href={item.href}>{item.name}</Link>
                    </Button>
                  ))}
                  <Button asChild>
                    <Link href="/assessment/select">Start Assessment</Link>
                  </Button>
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8",
                      },
                    }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ModeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden border-t bg-background"
        >
          <div className="container py-4 space-y-4">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block py-2 text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="grid gap-4 pt-4 border-t">
              {!isSignedIn ? (
                <>
                  <Button variant="outline" onClick={handleSignIn}>
                    Sign In
                  </Button>
                  <Button onClick={handleSignUp}>Sign Up</Button>
                  <Button asChild className="w-full">
                    <Link href="/assessment/select">Start Assessment</Link>
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium">Account</span>
                    <UserButton afterSignOutUrl="/" />
                  </div>
                  <Button asChild className="w-full">
                    <Link href="/assessment/select">Start Assessment</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}
