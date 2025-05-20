import {
  ArrowRight,
  BarChart3,
  Check,
  Database,
  Lock,
  Shield,
  Users,
  Vote,
} from "lucide-react";
import Link from "next/link";

import { AnimatedBackground } from "@/components/animated-background";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mr-auto ml-auto pr-16 pl-16 flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10">
            <Link href="/#hero" className="flex items-center space-x-2">
              <Shield className="h-6 w-6" />
              <span className="inline-block font-bold">SECURE Chain</span>
            </Link>
            <nav className="hidden gap-6 md:flex">
              <Link
                href="#features"
                className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                How It Works
              </Link>
              <Link
                href="#pricing"
                className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Pricing
              </Link>
              <Link
                href="#docs"
                className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Documentation
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2 gap-4">
              <Link
                href="/dashboard/login"
                className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-primary sm:inline-block"
              >
                Login
              </Link>
              <Button asChild className="hidden sm:inline-flex">
                <Link href="/dashboard/signup">Get Started</Link>
              </Button>
              <MobileNav />
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section
          id="#hero"
          className="relative space-y-6 overflow-hidden pb-8 pt-10 md:pb-12 md:pt-16 lg:py-32 min-h-screen flex items-center"
        >
          <AnimatedBackground />
          <div className="container mr-auto ml-auto pr-16 pl-16 flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-muted px-4 py-1.5 text-sm font-medium">
              Secure Elections for Educational Institutions
            </div>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Blockchain-Powered{" "}
              <span className="text-primary">Election Platform</span>
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Conduct transparent, secure, and tamper-proof elections for your
              educational institution with our blockchain-based voting system.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/dashboard/signup">
                  Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                <Link href="#how-it-works">How It Works</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="container space-y-12 py-8 md:py-12 lg:py-24">
          <div className="mx-auto grid max-w-[58rem] grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border bg-background p-4 shadow-sm transition-all hover:shadow-md">
              <Shield className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold">Secure & Immutable</h3>
              <p className="text-center text-muted-foreground">
                Blockchain technology ensures votes cannot be altered
              </p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border bg-background p-4 shadow-sm transition-all hover:shadow-md">
              <Users className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold">Group-Based Access</h3>
              <p className="text-center text-muted-foreground">
                Organize voters by departments, colleges, or custom groups
              </p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border bg-background p-4 shadow-sm transition-all hover:shadow-md">
              <Vote className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold">Verified Voting</h3>
              <p className="text-center text-muted-foreground">
                Identity verification ensures only eligible voters participate
              </p>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="relative overflow-hidden bg-muted py-8 dark:bg-muted/20 md:py-12 lg:py-24"
        >
          <AnimatedBackground />
          <div className="container">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
                Features
              </h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Our platform provides everything you need to run secure,
                transparent elections at your institution.
              </p>
            </div>
            <div className="mx-auto mt-8 grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
              <div className="relative overflow-hidden rounded-lg border bg-background p-2 transition-all hover:shadow-md">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                  <Shield className="h-10 w-10 text-primary" />
                  <div className="space-y-2">
                    <h3 className="font-bold">Blockchain Security</h3>
                    <p className="text-sm text-muted-foreground">
                      Hyperledger Fabric ensures immutable, transparent
                      record-keeping
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg border bg-background p-2 transition-all hover:shadow-md">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                  <Users className="h-10 w-10 text-primary" />
                  <div className="space-y-2">
                    <h3 className="font-bold">Voter Group Management</h3>
                    <p className="text-sm text-muted-foreground">
                      Organize voters by departments, colleges, or custom groups
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg border bg-background p-2 transition-all hover:shadow-md">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                  <Lock className="h-10 w-10 text-primary" />
                  <div className="space-y-2">
                    <h3 className="font-bold">Identity Verification</h3>
                    <p className="text-sm text-muted-foreground">
                      Secure verification process for candidates and voters
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg border bg-background p-2 transition-all hover:shadow-md">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                  <Vote className="h-10 w-10 text-primary" />
                  <div className="space-y-2">
                    <h3 className="font-bold">Position-Specific Ballots</h3>
                    <p className="text-sm text-muted-foreground">
                      Dynamically filtered ballots based on voter eligibility
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg border bg-background p-2 transition-all hover:shadow-md">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                  <BarChart3 className="h-10 w-10 text-primary" />
                  <div className="space-y-2">
                    <h3 className="font-bold">Real-time Results</h3>
                    <p className="text-sm text-muted-foreground">
                      Instant, accurate vote tallying and result publication
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg border bg-background p-2 transition-all hover:shadow-md">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                  <Database className="h-10 w-10 text-primary" />
                  <div className="space-y-2">
                    <h3 className="font-bold">Campaign Management</h3>
                    <p className="text-sm text-muted-foreground">
                      Complete lifecycle management for your election campaigns
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="container py-8 md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
              How It Works
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Our platform simplifies the election process while maintaining the
              highest security standards.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-2 lg:gap-12">
            <div className="order-2 lg:order-1 flex items-center justify-center">
              <div className="relative h-64 w-full md:h-80 rounded-lg border bg-muted/50 flex items-center justify-center">
                <p className="text-muted-foreground">
                  Blockchain Visualization
                </p>
              </div>
            </div>
            <div className="order-1 flex flex-col justify-center space-y-4 lg:order-2">
              <ul className="grid gap-6">
                <li>
                  <div className="grid gap-1">
                    <h3 className="text-xl font-bold">
                      1. Set Up Your Campaign
                    </h3>
                    <p className="text-muted-foreground">
                      Define your election details, positions, and voter groups.
                      Invite other electoral board members.
                    </p>
                  </div>
                </li>
                <li>
                  <div className="grid gap-1">
                    <h3 className="text-xl font-bold">
                      2. Add Candidates & Voters
                    </h3>
                    <p className="text-muted-foreground">
                      Add candidates for each position and import your voter
                      list, assigning them to appropriate groups.
                    </p>
                  </div>
                </li>
                <li>
                  <div className="grid gap-1">
                    <h3 className="text-xl font-bold">3. Verify Identities</h3>
                    <p className="text-muted-foreground">
                      Participants verify their identities through email
                      confirmation or ID upload for admin review.
                    </p>
                  </div>
                </li>
                <li>
                  <div className="grid gap-1">
                    <h3 className="text-xl font-bold">4. Open Voting</h3>
                    <p className="text-muted-foreground">
                      Voters receive secure access tokens and cast their votes
                      on position-specific ballots.
                    </p>
                  </div>
                </li>
                <li>
                  <div className="grid gap-1">
                    <h3 className="text-xl font-bold">5. Publish Results</h3>
                    <p className="text-muted-foreground">
                      Close voting and publish results with complete
                      transparency and blockchain verification.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <h3 className="text-2xl font-bold">Secure Voting Experience</h3>
              <p className="text-muted-foreground">
                Our platform provides a seamless voting experience while
                ensuring the highest level of security and transparency. Voters
                can easily access their personalized ballots and cast their
                votes with confidence.
              </p>
              <ul className="grid gap-2">
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-5 w-5 text-primary" />
                  <span>Personalized ballots based on voter groups</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-5 w-5 text-primary" />
                  <span>Secure, token-based access</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-5 w-5 text-primary" />
                  <span>Immutable vote recording</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-5 w-5 text-primary" />
                  <span>Transparent verification process</span>
                </li>
              </ul>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-64 w-full md:h-80 rounded-lg border bg-muted/50 flex items-center justify-center">
                <p className="text-muted-foreground">
                  Voting Process Visualization
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="pricing"
          className="relative overflow-hidden bg-muted py-8 dark:bg-muted/20 md:py-12 lg:py-24"
        >
          <AnimatedBackground />
          <div className="container">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
                Pricing
              </h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Flexible pricing options to suit institutions of all sizes.
              </p>
            </div>

            <div className="container mr-auto ml-auto pr-16 pl-16 grid gap-6 pt-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              <div className="flex flex-col justify-between rounded-lg border bg-background p-8 shadow-sm transition-all hover:shadow-md">
                <div>
                  <h3 className="text-lg font-bold">Freemium</h3>
                  <div className="mt-4 text-4xl font-bold">$0</div>
                  <p className="mt-2 text-muted-foreground">
                    For small elections and testing
                  </p>
                  <ul className="mt-8 space-y-3">
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-primary" />
                      <span>Up to 100 voters</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-primary" />
                      <span>Basic campaign management</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-primary" />
                      <span>Email verification</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-primary" />
                      <span>Standard ballot templates</span>
                    </li>
                  </ul>
                </div>
                <Button className="mt-8" variant="outline">
                  <Link href="/dashboard/signup">Get Started</Link>
                </Button>
              </div>
              <div className="flex flex-col justify-between rounded-lg border bg-background p-8 shadow-sm ring-2 ring-primary transition-all hover:shadow-md">
                <div>
                  <h3 className="text-lg font-bold">Pay-as-you-go</h3>
                  <div className="mt-4 text-4xl font-bold">$0.50</div>
                  <p className="mt-2 text-muted-foreground">
                    Per voter, per campaign
                  </p>
                  <ul className="mt-8 space-y-3">
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-primary" />
                      <span>Unlimited voters</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-primary" />
                      <span>Advanced campaign management</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-primary" />
                      <span>ID verification</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-primary" />
                      <span>Custom ballot design</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-primary" />
                      <span>Detailed audit reports</span>
                    </li>
                  </ul>
                </div>
                <Button className="mt-8">
                  <Link href="/dashboard/signup">Get Started</Link>
                </Button>
              </div>
              <div className="flex flex-col justify-between rounded-lg border bg-background p-8 shadow-sm transition-all hover:shadow-md">
                <div>
                  <h3 className="text-lg font-bold">Subscription</h3>
                  <div className="mt-4 text-4xl font-bold">$299</div>
                  <p className="mt-2 text-muted-foreground">
                    Per month, billed annually
                  </p>
                  <ul className="mt-8 space-y-3">
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-primary" />
                      <span>Up to 5,000 voters monthly</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-primary" />
                      <span>Multiple concurrent campaigns</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-primary" />
                      <span>Advanced ID verification</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-primary" />
                      <span>Bulk import tools</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-primary" />
                      <span>API access</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-primary" />
                      <span>Priority support</span>
                    </li>
                  </ul>
                </div>
                <Button className="mt-8" variant="outline">
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden py-12">
          {/* <AnimatedBackground /> */}
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to get started?
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Join educational institutions worldwide using S.E.C.U.R.E
                  Chain for their election needs.
                </p>
              </div>
              <div className="mx-auto w-full max-w-sm space-y-2">
                <form className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                  <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter your email"
                    type="email"
                  />
                  <Button type="submit">Subscribe</Button>
                </form>
                <p className="text-xs text-muted-foreground">
                  Get updates on new features and release dates.{" "}
                  <Link
                    href="/privacy"
                    className="underline underline-offset-2"
                  >
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container mr-auto ml-auto pr-16 pl-16 flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 S.E.C.U.R.E Chain. All rights reserved.
          </p>
          <div className="flex gap-4 items-center">
            <Link
              href="/terms"
              className="text-sm text-muted-foreground underline underline-offset-4"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground underline underline-offset-4"
            >
              Privacy
            </Link>
            <Link
              href="/contact"
              className="text-sm text-muted-foreground underline underline-offset-4"
            >
              Contact
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </footer>
    </div>
  );
}
