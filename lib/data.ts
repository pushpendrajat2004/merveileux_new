import { createClient } from '@/lib/supabase/server'
import type { MediaItem, TeamMember } from '@/lib/types'

export async function getTeamMembers(): Promise<TeamMember[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.log('[v0] getTeamMembers error:', error.message)
    return []
  }
  return data as TeamMember[]
}

export async function getMedia(type: 'lookbook' | 'history'): Promise<MediaItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('media_gallery')
    .select('*')
    .eq('type', type)
    .order('created_at', { ascending: true })

  if (error) {
    console.log('[v0] getMedia error:', error.message)
    return []
  }
  return data as MediaItem[]
}
