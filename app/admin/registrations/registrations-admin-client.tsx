'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Eye, Mail, Phone } from 'lucide-react'
import { toast } from 'sonner'
import type { Registration } from '@/lib/types'
import { deleteRegistration } from '@/app/admin/registrations/actions'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function RegistrationsAdminClient({ registrations }: { registrations: Registration[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<Registration | null>(null)

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}'s registration?`)) return
    const result = await deleteRegistration(id)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Registration deleted.')
    setSelected(null)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-foreground">Registrations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review membership applications from the join form.
        </p>
      </div>

      {registrations.length === 0 ? (
        <p className="text-sm text-muted-foreground">No registrations yet.</p>
      ) : (
        <div className="rounded-sm border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.map((reg) => (
                <TableRow key={reg.id}>
                  <TableCell className="font-medium text-foreground">{reg.name}</TableCell>
                  <TableCell className="text-muted-foreground">{reg.email}</TableCell>
                  <TableCell className="text-muted-foreground">{reg.phone}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(reg.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog open={selected?.id === reg.id} onOpenChange={(open) => !open && setSelected(null)}>
                        <DialogTrigger
                          render={
                            <Button size="icon-sm" variant="outline" onClick={() => setSelected(reg)}>
                              <Eye className="size-3.5" />
                            </Button>
                          }
                        />
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>{selected?.name}</DialogTitle>
                          </DialogHeader>
                          {selected && (
                            <div className="space-y-4">
                              <div className="flex flex-col gap-2">
                                <a
                                  href={`mailto:${selected.email}`}
                                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                                >
                                  <Mail className="size-4" /> {selected.email}
                                </a>
                                <a
                                  href={`tel:${selected.phone}`}
                                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                                >
                                  <Phone className="size-4" /> {selected.phone}
                                </a>
                              </div>
                              <div>
                                <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                                  Why they want to join
                                </p>
                                <p className="text-sm leading-relaxed text-foreground">
                                  {selected.why_join}
                                </p>
                              </div>
                              <div className="flex justify-end gap-2 pt-2">
                                <Button
                                  variant="destructive"
                                  className="gap-1.5"
                                  onClick={() => handleDelete(selected.id, selected.name)}
                                >
                                  <Trash2 className="size-4" /> Delete
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        size="icon-sm"
                        variant="destructive"
                        onClick={() => handleDelete(reg.id, reg.name)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
