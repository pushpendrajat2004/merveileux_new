export type TeamMember = {
  id: string
  name: string
  position: string
  branch: string
  image_urls: string[]
  created_at: string
}

export type MediaItem = {
  id: string
  type: 'lookbook' | 'history'
  media_url: string
  caption: string | null
  created_at: string
}

export type Registration = {
  id: string
  name: string
  email: string
  phone: string
  why_join: string
  created_at: string
}
