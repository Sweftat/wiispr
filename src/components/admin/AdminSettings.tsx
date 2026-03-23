'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

export default function AdminSettings() {
  const [saved, setSaved] = useState(false)
  const [maintenance, setMaintenance] = useState(false)
  const [registrations, setRegistrations] = useState(true)

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Site Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Global platform configuration.</p>
      </div>

      {/* Platform info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Platform</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Platform name', value: 'wiispr', type: 'text' },
            { label: 'Tagline', value: 'Say what you actually think', type: 'text' },
            { label: 'Contact email', value: 'hello@wiispr.com', type: 'email' },
          ].map(field => (
            <div key={field.label} className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">{field.label}</label>
              <Input type={field.type} defaultValue={field.value} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Toggles */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Platform Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 p-0">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <p className="text-sm font-semibold text-foreground">Maintenance mode</p>
              <p className="text-xs text-muted-foreground mt-0.5">Disables new posts and shows maintenance message</p>
            </div>
            <div className="flex items-center gap-2">
              {maintenance && <Badge variant="destructive" className="text-[10px]">Active</Badge>}
              <Switch checked={maintenance} onCheckedChange={setMaintenance} />
            </div>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Open registrations</p>
              <p className="text-xs text-muted-foreground mt-0.5">Allow new users to sign up</p>
            </div>
            <div className="flex items-center gap-2">
              {!registrations && <Badge variant="secondary" className="text-[10px]">Closed</Badge>}
              <Switch checked={registrations} onCheckedChange={setRegistrations} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Clear all reports</p>
              <p className="text-xs text-muted-foreground">Permanently delete all report records</p>
            </div>
            <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
              Clear reports
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button onClick={save} className="w-full" variant={saved ? 'outline' : 'default'}>
        {saved ? '✓ Saved!' : 'Save settings'}
      </Button>
    </div>
  )
}