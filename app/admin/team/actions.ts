'use server'

import { createClient } from '@/lib/supabase/server'

const BUCKET = 'club-media'

async function uploadImages(files: File[], folder: string): Promise<string[]> {
  const supabase = await createClient()
  const urls: string[] = []

  for (const file of files) {
    if (!file || file.size === 0) continue
    const ext = file.name.split('.').pop() ?? 'png'
    const path = `${folder}/${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: false,
    })
    if (error) {
      console.log('[admin] upload error:', error.message)
      continue
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    urls.push(data.publicUrl)
  }

  return urls
}

async function deleteStoragePath(url: string): Promise<void> {
  try {
    const urlObj = new URL(url)
    const parts = urlObj.pathname.split('/club-media/')
    if (parts.length < 2) return
    const path = parts[1]
    if (!path) return
    const supabase = await createClient()
    await supabase.storage.from(BUCKET).remove([path])
  } catch {
    // not a storage URL (e.g. local /images/ path) — ignore
  }
}

export async function addTeamMember(formData: FormData): Promise<{ error?: string }> {
  const name = String(formData.get('name') ?? '').trim()
  const position = String(formData.get('position') ?? '').trim()
  const branch = String(formData.get('branch') ?? '').trim()
  const files = formData.getAll('images') as File[]

  if (!name || !position || !branch) {
    return { error: 'Name, position, and branch are required.' }
  }

  const imageUrls = await uploadImages(files, 'team')

  const supabase = await createClient()
  const { error } = await supabase.from('team_members').insert({
    name,
    position,
    branch,
    image_urls: imageUrls,
  })

  if (error) {
    console.log('[admin] addTeamMember error:', error.message)
    return { error: 'Failed to add team member.' }
  }

  return {}
}

export async function updateTeamMember(formData: FormData): Promise<{ error?: string }> {
  const id = String(formData.get('id') ?? '')
  const name = String(formData.get('name') ?? '').trim()
  const position = String(formData.get('position') ?? '').trim()
  const branch = String(formData.get('branch') ?? '').trim()
  const existingUrlsRaw = String(formData.get('existing_urls') ?? '[]')
  const files = formData.getAll('images') as File[]

  if (!id || !name || !position || !branch) {
    return { error: 'All fields are required.' }
  }

  let existingUrls: string[] = []
  try {
    existingUrls = JSON.parse(existingUrlsRaw)
  } catch {
    existingUrls = []
  }

  const removedRaw = String(formData.get('removed_urls') ?? '[]')
  let removedUrls: string[] = []
  try {
    removedUrls = JSON.parse(removedRaw)
  } catch {
    removedUrls = []
  }

  for (const url of removedUrls) {
    await deleteStoragePath(url)
  }

  const keptUrls = existingUrls.filter((u) => !removedUrls.includes(u))
  const newUrls = await uploadImages(files, 'team')
  const finalUrls = [...keptUrls, ...newUrls]

  const supabase = await createClient()
  const { error } = await supabase
    .from('team_members')
    .update({ name, position, branch, image_urls: finalUrls })
    .eq('id', id)

  if (error) {
    console.log('[admin] updateTeamMember error:', error.message)
    return { error: 'Failed to update team member.' }
  }

  return {}
}

export async function deleteTeamMember(id: string, imageUrls: string[]): Promise<{ error?: string }> {
  for (const url of imageUrls) {
    await deleteStoragePath(url)
  }

  const supabase = await createClient()
  const { error } = await supabase.from('team_members').delete().eq('id', id)

  if (error) {
    console.log('[admin] deleteTeamMember error:', error.message)
    return { error: 'Failed to delete team member.' }
  }

  return {}
}
