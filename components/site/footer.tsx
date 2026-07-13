import Link from 'next/link'
import { Instagram, Youtube, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-14 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-serif text-2xl font-semibold tracking-[0.2em] text-foreground">
            MERVEILLEUX
          </p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            The Fashion & Modelling Club of NIT Jalandhar. Confidence, artistry, and
            the runway.
          </p>
        </div>
        <div className="flex items-center gap-5">
          <Link
            href="https://instagram.com"
            aria-label="Instagram"
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            <Instagram className="size-5" />
          </Link>
          <Link
            href="https://youtube.com"
            aria-label="YouTube"
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            <Youtube className="size-5" />
          </Link>
          <Link
            href="mailto:merveilleux@nitj.ac.in"
            aria-label="Email"
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            <Mail className="size-5" />
          </Link>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-6 py-6 text-xs tracking-wide text-muted-foreground">
          © {new Date().getFullYear()} MERVEILLEUX · NIT Jalandhar. All rights
          reserved.
        </p>
      </div>
    </footer>
  )
}
