import { createClient } from '@/lib/supabase/server'
import { GalleryAdminClient } from '@/app/admin/gallery/gallery-admin-client'

export default async function GalleryAdminPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('media_gallery')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.log('[admin] GalleryAdminPage error:', error.message)
  }

  return <GalleryAdminClient items={data ?? []} />
}
