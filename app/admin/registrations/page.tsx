import { createClient } from '@/lib/supabase/server'
import { RegistrationsAdminClient } from '@/app/admin/registrations/registrations-admin-client'

export default async function RegistrationsAdminPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.log('[admin] RegistrationsAdminPage error:', error.message)
  }

  return <RegistrationsAdminClient registrations={data ?? []} />
}
