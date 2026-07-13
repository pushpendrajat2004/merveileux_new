import { createClient } from '@/lib/supabase/server'
import { TeamAdminClient } from '@/app/admin/team/team-admin-client'

export default async function TeamAdminPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.log('[admin] TeamAdminPage error:', error.message)
  }

  return <TeamAdminClient members={data ?? []} />
}
