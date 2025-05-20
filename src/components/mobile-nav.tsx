"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "./ui/separator";

export interface MobileNavProps {
  isLoggedIn: boolean;
}

export function MobileNav({ isLoggedIn }: MobileNavProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <nav className="flex flex-col space-y-4 px-7 pt-10">
          <SheetClose asChild>
            <Link
              href="#features"
              className="text-muted-foreground hover:text-foreground"
            >
              Features
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              href="#how-it-works"
              className="text-muted-foreground hover:text-foreground"
            >
              How It Works
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              href="#pricing"
              className="text-muted-foreground hover:text-foreground"
            >
              Pricing
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              href="#docs"
              className="text-muted-foreground hover:text-foreground"
            >
              Documentation
            </Link>
          </SheetClose>
          <Separator />
          {isLoggedIn ? (
            <SheetClose asChild>
              <Link
                href="/dashboard"
                className="font-medium text-primary hover:text-primary/90"
              >
                Dashboard
              </Link>
            </SheetClose>
          ) : (
            <>
              <SheetClose asChild>
                <Link
                  href="/login"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Login
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  href="/signup"
                  className="font-medium text-primary hover:text-primary/90"
                >
                  Get Started
                </Link>
              </SheetClose>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
