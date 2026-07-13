'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Pencil, X } from 'lucide-react'
import { toast } from 'sonner'
import type { TeamMember } from '@/lib/types'
import {
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from '@/app/admin/team/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

type EditingState =
  | { mode: 'add' }
  | { mode: 'edit'; member: TeamMember }
  | null

export function TeamAdminClient({ members }: { members: TeamMember[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<EditingState>(null)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [position, setPosition] = useState('')
  const [branch, setBranch] = useState('')
  const [existingUrls, setExistingUrls] = useState<string[]>([])
  const [removedUrls, setRemovedUrls] = useState<string[]>([])

  const openAdd = () => {
    setEditing({ mode: 'add' })
    setName('')
    setPosition('')
    setBranch('')
    setExistingUrls([])
    setRemovedUrls([])
  }

  const openEdit = (member: TeamMember) => {
    setEditing({ mode: 'edit', member })
    setName(member.name)
    setPosition(member.position)
    setBranch(member.branch)
    setExistingUrls(member.image_urls)
    setRemovedUrls([])
  }

  const closeDialog = () => {
    setEditing(null)
    setSaving(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editing) return
    setSaving(true)

    const formData = new FormData(e.currentTarget)
    if (editing.mode === 'edit') {
      formData.set('id', editing.member.id)
      formData.set('existing_urls', JSON.stringify(existingUrls))
      formData.set('removed_urls', JSON.stringify(removedUrls))
    }

    const action = editing.mode === 'add' ? addTeamMember : updateTeamMember
    const result = await action(formData)

    if (result.error) {
      toast.error(result.error)
      setSaving(false)
      return
    }

    toast.success(editing.mode === 'add' ? 'Team member added.' : 'Team member updated.')
    closeDialog()
    router.refresh()
  }

  const handleDelete = async (member: TeamMember) => {
    if (!confirm(`Delete ${member.name}? This cannot be undone.`)) return
    const result = await deleteTeamMember(member.id, member.image_urls)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Team member deleted.')
    router.refresh()
  }

  const removeExistingImage = (url: string) => {
    setRemovedUrls((prev) => [...prev, url])
    setExistingUrls((prev) => prev.filter((u) => u !== url))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-foreground">Team</h1>
          <p className="mt-1 text-sm text-muted-foreground">Add, edit, and remove team members.</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="size-4" /> Add Member
        </Button>
      </div>

      {members.length === 0 ? (
        <p className="text-sm text-muted-foreground">No team members yet. Click "Add Member" to get started.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="overflow-hidden rounded-sm border border-border bg-card"
            >
              <div className="relative aspect-[3/4] bg-muted">
                {member.image_urls[0] ? (
                  <Image
                    src={member.image_urls[0]}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-serif text-lg font-semibold text-foreground">{member.name}</h3>
                <p className="text-sm text-primary">{member.position}</p>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{member.branch}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(member)} className="gap-1.5">
                    <Pencil className="size-3" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(member)}
                    className="gap-1.5"
                  >
                    <Trash2 className="size-3" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing?.mode === 'edit' ? 'Edit Member' : 'Add Member'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input id="position" name="position" required value={position} onChange={(e) => setPosition(e.target.value)} placeholder="President" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Input id="branch" name="branch" required value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="CSE" />
            </div>

            {editing?.mode === 'edit' && existingUrls.length > 0 && (
              <div className="space-y-2">
                <Label>Current Images</Label>
                <div className="flex flex-wrap gap-2">
                  {existingUrls.map((url) => (
                    <div key={url} className="relative size-20 overflow-hidden rounded-md border border-border">
                      <Image src={url} alt="" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(url)}
                        className="absolute top-0.5 right-0.5 rounded-full bg-destructive p-0.5 text-destructive-foreground"
                        aria-label="Remove image"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="images">Upload Images</Label>
              <Input
                id="images"
                name="images"
                type="file"
                accept="image/*"
                multiple
              />
              <p className="text-xs text-muted-foreground">
                {editing?.mode === 'edit' ? 'New images will be appended.' : 'Select one or more images.'}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
