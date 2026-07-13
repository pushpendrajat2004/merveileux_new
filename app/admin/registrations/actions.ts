'use server'

import { createClient } from '@/lib/supabase/server'

export async function deleteRegistration(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from('registrations').delete().eq('id', id)

  if (error) {
    console.log('[admin] deleteRegistration error:', error.message)
    return { error: 'Failed to delete registration.' }
  }

  return {}
}
