'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { User } from 'lucide-react'

const trustVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  new: 'outline', active: 'secondary', trusted: 'default', top: 'default'
}

const trustColor: Record<string, string> = {
  new: 'text-muted-foreground', active: 'text-blue-600', trusted: 'text-green-600', top: 'text-amber-600'
}

export default function AdminUsers({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers)
  const [selected, setSelected] = useState<any>(null)
  const [search, setSearch] = useState('')

  async function suspend(userId: string) {
    await fetch('/api/admin/user-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action: 'suspend' })
    })
    setUsers(users.map(u => u.id === userId ? { ...u, is_suspended: true } : u))
    if (selected?.id === userId) setSelected({ ...selected, is_suspended: true })
  }

  async function unsuspend(userId: string) {
    await fetch('/api/admin/user-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action: 'unsuspend' })
    })
    setUsers(users.map(u => u.id === userId ? { ...u, is_suspended: false } : u))
    if (selected?.id === userId) setSelected({ ...selected, is_suspended: false })
  }

  const filtered = users.filter(u => u.nickname?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">{users.length} users total</p>
        </div>
        <Input
          placeholder="Search nickname..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-56"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Trust</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(user => (
                <TableRow key={user.id} className="cursor-pointer" onClick={() => setSelected(user)}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                        <User size={13} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{user.nickname}</p>
                        {user.is_admin && <Badge variant="secondary" className="text-[10px] px-1 py-0 h-3.5">Admin</Badge>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground capitalize">{user.gender}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{user.age_range}</TableCell>
                  <TableCell>
                    <span className={`text-xs font-bold uppercase ${trustColor[user.trust_level] || 'text-muted-foreground'}`}>
                      {user.trust_level || 'new'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {user.is_suspended
                      ? <Badge variant="destructive" className="text-[10px]">Suspended</Badge>
                      : <Badge variant="outline" className="text-[10px] text-green-600 border-green-200">Active</Badge>
                    }
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="text-xs">View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail sheet */}
      <Sheet open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>User Details</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center">
                  <User size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-foreground">{selected.nickname}</p>
                  <span className={`text-xs font-bold uppercase ${trustColor[selected.trust_level] || 'text-muted-foreground'}`}>
                    {selected.trust_level || 'new'}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                {[
                  { label: 'Gender', value: selected.gender },
                  { label: 'Age range', value: selected.age_range },
                  { label: 'Rep score', value: selected.rep_score || 0 },
                  { label: 'Status', value: selected.is_suspended ? 'Suspended' : 'Active' },
                  { label: 'Joined', value: new Date(selected.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-border">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className={`text-sm font-semibold capitalize ${item.label === 'Status' && selected.is_suspended ? 'text-destructive' : 'text-foreground'}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              {!selected.is_admin && (
                <Button
                  className="w-full mt-4"
                  variant={selected.is_suspended ? 'default' : 'destructive'}
                  onClick={() => selected.is_suspended ? unsuspend(selected.id) : suspend(selected.id)}
                >
                  {selected.is_suspended ? 'Unsuspend user' : 'Suspend user'}
                </Button>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}