"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Logo } from "@/components/logo"
import { Search, Menu, X } from "lucide-react"

const categories: Array<{
  name: string
  href: string
}> = []

export function Navbar() {
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
          </Link>

          <div className="hidden items-center gap-6 lg:flex">
            <Link href="/hackathons" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:underline">
              Hackathons
            </Link>
            <Link href="/organizer/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Host a Hackathon
            </Link>
          </div>
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search hackathons..."
              className="w-56 bg-secondary/50 pl-9 border-0 text-sm"
            />
          </div>
          <Button asChild variant="ghost" className="text-sm text-muted-foreground">
            <Link href="/auth/login">
              Log in
            </Link>
          </Button>
          <Button asChild className="text-sm">
            <Link href="/auth/register">Sign up</Link>
          </Button>
        </div>

        <button
          type="button"
          className="lg:hidden p-2 touch-manipulation"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-foreground" />
          )}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="border-t border-border bg-background px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search hackathons..."
                className="w-full bg-secondary/50 pl-9 h-10 border-0 text-sm"
              />
            </div>
            <Link href="/hackathons" className="text-base font-medium text-muted-foreground py-2 touch-manipulation" onClick={() => setMobileMenuOpen(false)}>
              Hackathons
            </Link>
            <Link href="/organizer/dashboard" className="text-base font-medium text-muted-foreground py-2 touch-manipulation" onClick={() => setMobileMenuOpen(false)}>
              Host a Hackathon
            </Link>
            <div className="flex gap-2 pt-2">
              <Button asChild variant="outline" className="flex-1 bg-transparent h-11 touch-manipulation">
                <Link href="/auth/login">Log in</Link>
              </Button>
              <Button asChild className="flex-1 h-11 touch-manipulation">
                <Link href="/auth/register">Sign up</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
