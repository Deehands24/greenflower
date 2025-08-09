"use client"

import { useState } from "react"
import { Database, Save, Upload, Loader2 } from "lucide-react"
import { FuturisticButton } from "./futuristic-button"
import { useStore } from "@/lib/store"

export function SupabaseSyncControls() {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<string>("")
  const store = useStore()

  const testConnection = async () => {
    setIsLoading(true)
    setStatus("Testing connection...")

    try {
      const response = await fetch("/api/supabase/health")
      const result = await response.json()

      if (result.ok) {
        setStatus("✅ Connected to Supabase!")
      } else {
        setStatus(`❌ Connection failed: ${result.error}`)
      }
    } catch (error) {
      setStatus(`❌ Connection error: ${error}`)
    } finally {
      setIsLoading(false)
      setTimeout(() => setStatus(""), 3000)
    }
  }

  const saveState = async () => {
    setIsLoading(true)
    setStatus("Saving to Supabase...")

    try {
      const appState = {
        // Renamed from 'state' to 'appState'
        databases: store.databases,
        currentDatabase: store.currentDatabase,
        forms: store.forms,
        currentForm: store.currentForm,
        elements: store.elements,
        selectedElement: store.selectedElement,
        theme: store.theme,
      }

      const response = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appState }), // Sending 'appState'
      })

      const result = await response.json()

      if (result.success) {
        setStatus("✅ Saved to Supabase!")
      } else {
        setStatus(`❌ Save failed: ${result.error}`)
      }
    } catch (error) {
      setStatus(`❌ Save error: ${error}`)
    } finally {
      setIsLoading(false)
      setTimeout(() => setStatus(""), 3000)
    }
  }

  const loadState = async () => {
    setIsLoading(true)
    setStatus("Loading from Supabase...")

    try {
      const response = await fetch("/api/state")
      const result = await response.json()

      if (result.appState) {
        // Expecting 'appState' from response
        // Update the store with loaded state
        if (result.appState.databases) store.setDatabases(result.appState.databases)
        if (result.appState.currentDatabase) store.setCurrentDatabase(result.appState.currentDatabase)
        if (result.appState.forms) store.setForms(result.appState.forms)
        if (result.appState.currentForm) store.setCurrentForm(result.appState.currentForm)
        if (result.appState.elements) store.setElements(result.appState.elements)
        if (result.appState.selectedElement) store.setSelectedElement(result.appState.selectedElement)
        if (result.appState.theme) store.setTheme(result.appState.theme)

        setStatus("✅ Loaded from Supabase!")
      } else {
        setStatus("ℹ️ No saved state found")
      }
    } catch (error) {
      setStatus(`❌ Load error: ${error}`)
    } finally {
      setIsLoading(false)
      setTimeout(() => setStatus(""), 3000)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <div className="flex gap-2">
        <FuturisticButton
          onClick={testConnection}
          disabled={isLoading}
          className="p-2"
          title="Test Supabase Connection"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
        </FuturisticButton>

        <FuturisticButton onClick={saveState} disabled={isLoading} className="p-2" title="Save to Supabase">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        </FuturisticButton>

        <FuturisticButton onClick={loadState} disabled={isLoading} className="p-2" title="Load from Supabase">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        </FuturisticButton>
      </div>

      {status && (
        <div className="bg-black/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg px-3 py-2 text-sm text-cyan-300 max-w-xs">
          {status}
        </div>
      )}
    </div>
  )
}
