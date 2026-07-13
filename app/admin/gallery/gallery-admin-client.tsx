'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { MediaItem } from '@/lib/types'
import { addGalleryItem, deleteGalleryItem } from '@/app/admin/gallery/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function GalleryAdminClient({ items }: { items: MediaItem[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [type, setType] = useState<'lookbook' | 'history'>('lookbook')
  const [caption, setCaption] = useState('')

  const lookbook = items.filter((i) => i.type === 'lookbook')
  const history = items.filter((i) => i.type === 'history')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)

    const formData = new FormData(e.currentTarget)
    formData.set('type', type)

    const result = await addGalleryItem(formData)

    if (result.error) {
      toast.error(result.error)
      setSaving(false)
      return
    }

    toast.success('Gallery item added.')
    setOpen(false)
    setCaption('')
    setSaving(false)
    router.refresh()
  }

  const handleDelete = async (item: MediaItem) => {
    if (!confirm('Delete this image? This cannot be undone.')) return
    const result = await deleteGalleryItem(item.id, item.media_url)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Gallery item deleted.')
    router.refresh()
  }

  const renderGrid = (list: MediaItem[], emptyMsg: string) => {
    if (list.length === 0) {
      return <p className="text-sm text-muted-foreground">{emptyMsg}</p>
    }
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {list.map((item) => (
          <div
            key={item.id}
            className="group relative aspect-[3/4] overflow-hidden rounded-sm border border-border bg-muted"
          >
            <Image
              src={item.media_url}
              alt={item.caption ?? 'Gallery image'}
              fill
              className="object-cover"
            />
            {item.caption && (
              <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-3 text-xs text-foreground">
                {item.caption}
              </p>
            )}
            <button
              type="button"
              onClick={() => handleDelete(item)}
              className="absolute top-2 right-2 rounded-full bg-destructive p-1.5 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Delete"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-foreground">Gallery</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage lookbook and history images.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="gap-2"><Plus className="size-4" /> Add Image</Button>} />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Gallery Image</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Gallery Type</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={type === 'lookbook' ? 'default' : 'outline'}
                    onClick={() => setType('lookbook')}
                    className="flex-1"
                  >
                    Lookbook
                  </Button>
                  <Button
                    type="button"
                    variant={type === 'history' ? 'default' : 'outline'}
                    onClick={() => setType('history')}
                    className="flex-1"
                  >
                    History
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <Input id="image" name="image" type="file" accept="image/*" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="caption">Caption (optional)</Label>
                <Textarea
                  id="caption"
                  name="caption"
                  rows={2}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="A short description…"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving…' : 'Add Image'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="lookbook">
        <TabsList>
          <TabsTrigger value="lookbook">Lookbook ({lookbook.length})</TabsTrigger>
          <TabsTrigger value="history">History ({history.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="lookbook" className="pt-6">
          {renderGrid(lookbook, 'No lookbook images yet.')}
        </TabsContent>
        <TabsContent value="history" className="pt-6">
          {renderGrid(history, 'No history images yet.')}
        </TabsContent>
      </Tabs>
    </div>
  )
}
