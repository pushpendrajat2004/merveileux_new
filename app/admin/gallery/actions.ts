'use server'

import { createClient } from '@/lib/supabase/server'

const BUCKET = 'club-media'

export async function addGalleryItem(formData: FormData): Promise<{ error?: string }> {
  const type = String(formData.get('type') ?? '')
  const caption = String(formData.get('caption') ?? '').trim()
  const file = formData.get('image') as File | null

  if (!type || (type !== 'lookbook' && type !== 'history')) {
    return { error: 'Select a valid gallery type.' }
  }
  if (!file || file.size === 0) {
    return { error: 'Please select an image.' }
  }

  const ext = file.name.split('.').pop() ?? 'png'
  const path = `${type}/${crypto.randomUUID()}.${ext}`
  const supabase = await createClient()

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  })

  if (uploadError) {
    console.log('[admin] addGalleryItem upload error:', uploadError.message)
    return { error: 'Failed to upload image.' }
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  const mediaUrl = data.publicUrl

  const { error } = await supabase.from('media_gallery').insert({
    type,
    media_url: mediaUrl,
    caption: caption || null,
  })

  if (error) {
    console.log('[admin] addGalleryItem insert error:', error.message)
    return { error: 'Failed to add gallery item.' }
  }

  return {}
}

export async function deleteGalleryItem(id: string, mediaUrl: string): Promise<{ error?: string }> {
  const supabase = await createClient()

  // Try to remove the file from storage
  try {
    const urlObj = new URL(mediaUrl)
    const parts = urlObj.pathname.split('/club-media/')
    if (parts.length >= 2 && parts[1]) {
      await supabase.storage.from(BUCKET).remove([parts[1]])
    }
  } catch {
    // local path — not in storage, skip
  }

  const { error } = await supabase.from('media_gallery').delete().eq('id', id)

  if (error) {
    console.log('[admin] deleteGalleryItem error:', error.message)
    return { error: 'Failed to delete gallery item.' }
  }

  return {}
}
