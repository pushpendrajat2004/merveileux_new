import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-foreground">
          Authentication Error
        </h1>
        <p className="mt-3 text-muted-foreground">
          Something went wrong while signing you in. Please try again.
        </p>
      </div>
      <Button asChild size="lg" className="rounded-none tracking-wide">
        <Link href="/auth/login">Back to Login</Link>
      </Button>
    </div>
  )
}
