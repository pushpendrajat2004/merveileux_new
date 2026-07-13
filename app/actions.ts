'use server'

import { createClient } from '@/lib/supabase/server'

export type RegisterState = {
  status: 'idle' | 'success' | 'error'
  message: string
}

export async function registerMember(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()
  const whyJoin = String(formData.get('why_join') ?? '').trim()

  if (!name || !email || !phone || !whyJoin) {
    return { status: 'error', message: 'Please fill in all fields.' }
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  if (!emailOk) {
    return { status: 'error', message: 'Please enter a valid email address.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('registrations').insert({
    name,
    email,
    phone,
    why_join: whyJoin,
  })

  if (error) {
    console.log('[v0] registerMember error:', error.message)
    return { status: 'error', message: 'Something went wrong. Please try again.' }
  }

  return {
    status: 'success',
    message: `Thank you, ${name}! Your application to MERVEILLEUX has been received.`,
  }
}
