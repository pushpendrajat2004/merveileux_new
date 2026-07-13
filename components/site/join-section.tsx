'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { registerMember, type RegisterState } from '@/app/actions'
import { SectionHeading } from '@/components/site/section-heading'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const initialState: RegisterState = { status: 'idle', message: '' }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      size="lg"
      disabled={pending}
      className="w-full rounded-none tracking-wide sm:w-auto"
    >
      {pending ? 'Submitting…' : 'Submit Application'}
    </Button>
  )
}

export function JoinSection() {
  const [state, formAction] = useActionState(registerMember, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.status === 'success') {
      toast.success(state.message)
      formRef.current?.reset()
    } else if (state.status === 'error') {
      toast.error(state.message)
    }
  }, [state])

  return (
    <section id="join" className="mx-auto max-w-3xl scroll-mt-20 px-6 py-24">
      <SectionHeading
        eyebrow="Become a Member"
        title="Join MERVEILLEUX"
        className="text-center [&_p]:mx-auto"
      />
      <p className="mx-auto -mt-6 mb-10 max-w-xl text-pretty text-center leading-relaxed text-muted-foreground">
        Ready to own the runway? Tell us a little about yourself and why you want
        to be part of the movement.
      </p>

      <form
        ref={formRef}
        action={formAction}
        className="space-y-6 rounded-sm border border-border bg-card p-6 sm:p-8"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" required placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              required
              placeholder="+91 00000 00000"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@nitj.ac.in"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="why_join">Why do you want to join?</Label>
          <Textarea
            id="why_join"
            name="why_join"
            required
            rows={4}
            placeholder="Tell us what draws you to MERVEILLEUX…"
          />
        </div>
        <SubmitButton />
      </form>
    </section>
  )
}
