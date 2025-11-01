import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { loadSettings, saveSettings, applyTheme, UserSettings } from "@/lib/settings";

export default function Settings() {
  const [settings, setSettings] = useState<UserSettings>(loadSettings());
  const [saving, setSaving] = useState(false);

  useEffect(() => { applyTheme(settings.appearance.theme); }, [settings.appearance.theme]);

  const handleSave = () => {
    setSaving(true);
    saveSettings(settings);
    setTimeout(() => setSaving(false), 300);
  };

  const update = (updater: (s: UserSettings) => UserSettings) => setSettings(prev => updater({ ...prev }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-4xl">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="study">Study</TabsTrigger>
            <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Update your display name and bio.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={settings.profile.name} onChange={(e)=>update(s=>({...s, profile:{...s.profile, name:e.target.value}}))} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Bio</Label>
                  <Textarea rows={4} value={settings.profile.bio} onChange={(e)=>update(s=>({...s, profile:{...s.profile, bio:e.target.value}}))} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Manage your account details.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="you@example.com" disabled />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          

          <TabsContent value="notifications">
            <Card>
              <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
              <CardContent className="grid gap-4">
                <ToggleRow label="Weekly summary emails" checked={settings.notifications.emailWeekly} onCheckedChange={(v)=>update(s=>({...s, notifications:{...s.notifications, emailWeekly:v}}))} />
                <ToggleRow label="Study reminders" checked={settings.notifications.emailReminders} onCheckedChange={(v)=>update(s=>({...s, notifications:{...s.notifications, emailReminders:v}}))} />
                <ToggleRow label="In-app toasts" checked={settings.notifications.inAppToasts} onCheckedChange={(v)=>update(s=>({...s, notifications:{...s.notifications, inAppToasts:v}}))} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="study">
            <Card>
              <CardHeader><CardTitle>Study Preferences</CardTitle></CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Daily goal (minutes)</Label>
                    <Input type="number" min={5} max={240} value={settings.study.dailyMinutes} onChange={(e)=>update(s=>({...s, study:{...s.study, dailyMinutes:Number(e.target.value)}}))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Question difficulty</Label>
                    <Select value={settings.study.difficulty} onValueChange={(v)=>update(s=>({...s, study:{...s.study, difficulty:v as any}}))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="adaptive">Adaptive</SelectItem>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-6">
                  <ToggleRow label="Hints" checked={settings.study.hints} onCheckedChange={(v)=>update(s=>({...s, study:{...s.study, hints:v}}))} />
                  <ToggleRow label="Retakes allowed" checked={settings.study.retakesAllowed} onCheckedChange={(v)=>update(s=>({...s, study:{...s.study, retakesAllowed:v}}))} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accessibility">
            <Card>
              <CardHeader><CardTitle>Accessibility & Voice</CardTitle></CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid sm:grid-cols-3 gap-6">
                  <ToggleRow label="Voice assist enabled" checked={settings.accessibility.voiceEnabled} onCheckedChange={(v)=>update(s=>({...s, accessibility:{...s.accessibility, voiceEnabled:v}}))} />
                  <ToggleRow label="High contrast" checked={settings.accessibility.highContrast} onCheckedChange={(v)=>update(s=>({...s, accessibility:{...s.accessibility, highContrast:v}}))} />
                  <ToggleRow label="Reduced motion" checked={settings.accessibility.reducedMotion} onCheckedChange={(v)=>update(s=>({...s, accessibility:{...s.accessibility, reducedMotion:v}}))} />
                </div>
                <div className="grid sm:grid-cols-3 gap-6 items-center">
                  <SliderField label="Voice rate" min={0.5} max={2} step={0.1} value={settings.accessibility.voiceRate} onChange={(v)=>update(s=>({...s, accessibility:{...s.accessibility, voiceRate:v}}))} />
                  <SliderField label="Voice pitch" min={0} max={2} step={0.1} value={settings.accessibility.voicePitch} onChange={(v)=>update(s=>({...s, accessibility:{...s.accessibility, voicePitch:v}}))} />
                  <SliderField label="Voice volume" min={0} max={1} step={0.05} value={settings.accessibility.voiceVolume} onChange={(v)=>update(s=>({...s, accessibility:{...s.accessibility, voiceVolume:v}}))} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="pt-6 flex gap-3">
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Settings"}</Button>
          <Button variant="outline" onClick={()=>{ const d = loadSettings(); setSettings(d); }}>Reset</Button>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, checked, onCheckedChange }: { label: string; checked: boolean; onCheckedChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-1">
        <p className="font-medium">{label}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function SliderField({ label, min, max, step, value, onChange }: { label: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={(vals)=>onChange(vals[0])} />
      <div className="text-xs text-muted-foreground">{value}</div>
    </div>
  );
}
