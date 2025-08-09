"use client"

import * as React from "react"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, Download, Database } from "lucide-react"
import { FuturisticButton } from "@/components/futuristic-button"
import { useAppStore } from "@/lib/store"

export default function SupabaseSyncControls() {
  const { toast } = useToast()
  const [loading, setLoading] = React.useState<"save" | "load" | "health" | null>(null)

  // Get the entire store state and setState function
  const storeState = useAppStore((state) => state)
  const setState = useAppStore.setState

  async function handleHealthCheck() {
    try {
      setLoading("health")
      const res = await fetch("/api/supabase/health")
      const json = await res.json()

      if (json.ok) {
        toast({
          title: "✅ Supabase Connected",
          description: json.message || "Connection successful",
        })
      } else {
        toast({
          title: "❌ Connection Failed",
          description: json.error || "Unknown error",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      toast({
        title: "❌ Health Check Failed",
        description: err?.message || "Network error",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  async function handleSave() {
    try {
      setLoading("save")

      const res = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: storeState }),
      })

      const json = await res.json()

      if (json.ok) {
        toast({
          title: "💾 Saved to Supabase",
          description: "Your form builder state has been saved",
        })
      } else {
        throw new Error(json.error || "Save failed")
      }
    } catch (err: any) {
      toast({
        title: "❌ Save Failed",
        description: err?.message || "Unknown error",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  async function handleLoad() {
    try {
      setLoading("load")

      const res = await fetch("/api/state")
      const json = await res.json()

      if (json.ok) {
        if (json.data) {
          // Replace the entire store state
          setState(json.data, true)
          toast({
            title: "📥 Loaded from Supabase",
            description: `State restored from ${new Date(json.lastUpdated).toLocaleString()}`,
          })
        } else {
          toast({
            title: "📭 No Saved State",
            description: "No previous state found in Supabase",
          })
        }
      } else {
        throw new Error(json.error || "Load failed")
      }
    } catch (err: any) {
      toast({
        title: "❌ Load Failed",
        description: err?.message || "Unknown error",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 backdrop-blur-md bg-white/5 border border-white/10 rounded-xl shadow-lg p-3 flex items-center gap-2">
      <FuturisticButton onClick={handleHealthCheck} disabled={loading !== null} size="sm">
        {loading === "health" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
      </FuturisticButton>

      <FuturisticButton onClick={handleLoad} disabled={loading !== null} size="sm">
        {loading === "load" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        Load
      </FuturisticButton>

      <FuturisticButton onClick={handleSave} disabled={loading !== null} size="sm">
        {loading === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save
      </FuturisticButton>
    </div>
  )
}
