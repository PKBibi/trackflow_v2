"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function ReportsSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [branding, setBranding] = useState({ companyName: "", logoUrl: "", contactEmail: "" });
  const [prefs, setPrefs] = useState({
    locale: "",
    currency: "",
    includeCover: true,
    repeatHeader: true,
    rowStriping: true,
    defaultPeriod: ""
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/me/branding");
        const d = await res.json();
        if (d.branding) setBranding(d.branding);
        if (d.prefs) setPrefs((p) => ({ ...p, ...d.prefs }));
      } catch {}
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    try {
      const res = await fetch("/api/me/branding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branding, prefs })
      });
      if (!res.ok) throw new Error("Save failed");
      toast({ title: "Saved", description: "Report preferences updated." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Save failed", variant: "destructive" });
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Report Preferences</h1>
        <p className="text-muted-foreground">Control PDF and export defaults</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>Applied to Exports and PDF reports</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input value={branding.companyName} onChange={(e)=>setBranding({...branding, companyName: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Logo URL</Label>
            <Input value={branding.logoUrl} onChange={(e)=>setBranding({...branding, logoUrl: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Contact Email</Label>
            <Input type="email" value={branding.contactEmail} onChange={(e)=>setBranding({...branding, contactEmail: e.target.value})} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PDF Options</CardTitle>
          <CardDescription>Defaults for weekly report PDFs</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Locale</Label>
            <Input value={prefs.locale} onChange={(e)=>setPrefs({...prefs, locale: e.target.value})} placeholder="e.g., en-US" />
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Input value={prefs.currency} onChange={(e)=>setPrefs({...prefs, currency: e.target.value})} placeholder="e.g., USD" />
          </div>
          <div className="space-y-2">
            <Label>Default Period Label</Label>
            <Input value={prefs.defaultPeriod} onChange={(e)=>setPrefs({...prefs, defaultPeriod: e.target.value})} placeholder="e.g., This Week" />
          </div>
          <div className="space-y-2">
            <Label>Include Cover Page</Label>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={prefs.includeCover} onChange={(e)=>setPrefs({...prefs, includeCover: e.target.checked})} />
              <span className="text-sm text-muted-foreground">Show cover on PDFs</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Repeat Table Header</Label>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={prefs.repeatHeader} onChange={(e)=>setPrefs({...prefs, repeatHeader: e.target.checked})} />
              <span className="text-sm text-muted-foreground">Repeat header on new pages</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Row Striping</Label>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={prefs.rowStriping} onChange={(e)=>setPrefs({...prefs, rowStriping: e.target.checked})} />
              <span className="text-sm text-muted-foreground">Alternate row background</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save}>Save Preferences</Button>
      </div>
    </div>
  )
}

