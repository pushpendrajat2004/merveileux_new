import Link from 'next/link'
import { Users, Image as ImageIcon, Inbox, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminOverviewPage() {
  const supabase = await createClient()
  const [teamRes, lookbookRes, historyRes, regRes] = await Promise.all([
    supabase.from('team_members').select('id', { count: 'exact', head: true }),
    supabase.from('media_gallery').select('id', { count: 'exact', head: true }).eq('type', 'lookbook'),
    supabase.from('media_gallery').select('id', { count: 'exact', head: true }).eq('type', 'history'),
    supabase.from('registrations').select('id', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Team Members', value: teamRes.count ?? 0, href: '/admin/team', icon: Users },
    { label: 'Lookbook Items', value: lookbookRes.count ?? 0, href: '/admin/gallery', icon: ImageIcon },
    { label: 'History Items', value: historyRes.count ?? 0, href: '/admin/gallery', icon: ImageIcon },
    { label: 'Registrations', value: regRes.count ?? 0, href: '/admin/registrations', icon: Inbox },
  ]

  const { data: recent } = await supabase
    .from('registrations')
    .select('id, name, email, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-foreground">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your club content and review applications.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {s.label}
                  </CardTitle>
                  <s.icon className="size-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <span className="font-serif text-3xl font-semibold text-foreground">
                  {s.value}
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Registrations</CardTitle>
            <Link
              href="/admin/registrations"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View all <ArrowRight className="size-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {!recent || recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No registrations yet.</p>
          ) : (
            <ul className="space-y-3">
              {recent.map((r) => (
                <li key={r.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
