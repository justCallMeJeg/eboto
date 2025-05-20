"use client";

import { createClient } from "@/utils/supabase/client";
import { Shield } from "lucide-react";
import NextLink from "next/link";
import { useEffect, useState } from "react";
import { AvatarDropdown } from "./avatar-dropdown";
import { MobileNav } from "./mobile-nav";
import { Button } from "./ui/button";

const supabase = createClient();

export function Header({ initialIsLoggedIn = false }) {
  const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
    });

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setIsLoggedIn(!!session);
      } else if (event === "SIGNED_OUT") {
        setIsLoggedIn(false);
      }
    });
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-16 space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <NextLink href="/#hero" className="flex items-center space-x-2">
            <Shield className="h-6 w-6" />
            <span className="inline-block font-bold">SECURE Chain</span>
          </NextLink>
          <nav className="hidden gap-6 lg:flex">
            <NextLink
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Features
            </NextLink>
            <NextLink
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-primary"
            >
              How It Works
            </NextLink>
            <NextLink
              href="#pricing"
              className="text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Pricing
            </NextLink>
            <NextLink
              href="#docs"
              className="text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Documentation
            </NextLink>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {isLoggedIn ? (
            <>
              <Button asChild className="hidden lg:inline-flex">
                <NextLink href="/dashboard">Dashboard</NextLink>
              </Button>
              <AvatarDropdown />
            </>
          ) : (
            <>
              <NextLink
                href="/dashboard/login"
                className="hidden text-sm font-medium text-muted-foreground hover:text-primary lg:inline-block"
              >
                Login
              </NextLink>
              <Button asChild className="hidden lg:inline-flex">
                <NextLink href="/dashboard/signup">Get Started</NextLink>
              </Button>
            </>
          )}
          <MobileNav isLoggedIn={isLoggedIn} />
        </div>
      </div>
    </header>
  );
}
