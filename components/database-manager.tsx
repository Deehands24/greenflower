"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { useState } from "react"
import { useStore } from "@/lib/store"
import type { Database } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  FuturisticCard,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/futuristic-card"
import { FuturisticButton } from "./futuristic-button"
import { NewDatabaseDialog } from "./new-database-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2, Edit, DatabaseIcon, Download, Upload, CloudDownload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DatabaseManagerProps {
  onSelectDatabase: (database: Database | null) => void
  activeDatabase: Database | null
}

export default function DatabaseManager({ onSelectDatabase, activeDatabase }: DatabaseManagerProps) {
  const { databases, updateDatabase, deleteDatabase, exportData, importData } = useStore()
  const [editingDatabase, setEditingDatabase] = useState<Database | null>(null)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [jsonOutput, setJsonOutput] = useState("")
  const { toast } = useToast()
  const [syncLoading, setSyncLoading] = useState<{ save: boolean; load: boolean }>({ save: false, load: false })

  const handleDatabaseCreated = (databaseId: number) => {
    const newDatabase = databases.find((db) => db.databaseId === databaseId)
    if (newDatabase) {
      onSelectDatabase(newDatabase)
    }
  }

  const handleUpdateDatabase = () => {
    if (!editingDatabase || !editingDatabase.name.trim()) return

    updateDatabase(editingDatabase)
    setEditingDatabase(null)
  }

  const handleDeleteDatabase = (databaseId: number) => {
    deleteDatabase(databaseId)
    if (activeDatabase?.databaseId === databaseId) {
      onSelectDatabase(null)
    }
  }

  const handleExport = () => {
    const json = exportData()
    setJsonOutput(json)
    setExportDialogOpen(true)
  }

  const handleSaveToSupabase = async () => {
    try {
      setSyncLoading((s) => ({ ...s, save: true }))
      const json = exportData()
      const payload = JSON.parse(json)
      const res = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "default", data: payload }),
      })
      const out = await res.json()
      if (!res.ok || !out.ok) throw new Error(out.error || "Failed to save")
      toast({ title: "Saved", description: "Data saved to Supabase." })
    } catch (err: any) {
      toast({ title: "Save failed", description: err?.message || "Unknown error" })
    } finally {
      setSyncLoading((s) => ({ ...s, save: false }))
    }
  }

  const handleLoadFromSupabase = async () => {
    try {
      setSyncLoading((s) => ({ ...s, load: true }))
      const res = await fetch("/api/state?name=default")
      const out = await res.json()
      if (!res.ok || !out.ok) throw new Error(out.error || "Failed to load")
      const record = out.data
      if (!record?.data) throw new Error("No data found in Supabase.")
      const ok = useStore.getState().importData(JSON.stringify(record.data))
      if (ok) {
        toast({ title: "Loaded", description: "Data loaded from Supabase." })
      } else {
        throw new Error("Import failed. Invalid data shape.")
      }
    } catch (err: any) {
      toast({ title: "Load failed", description: err?.message || "Unknown error" })
    } finally {
      setSyncLoading((s) => ({ ...s, load: false }))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
          Databases
        </h2>
        <div className="flex gap-2">
          <NewDatabaseDialog onDatabaseCreated={handleDatabaseCreated} />

          <FuturisticButton
            variant="outline"
            onClick={handleLoadFromSupabase}
            disabled={syncLoading.load}
            className="text-white"
            title="Load from Supabase"
          >
            <CloudDownload className="h-4 w-4 mr-2" />
            {syncLoading.load ? "Loading..." : "Load"}
          </FuturisticButton>

          <FuturisticButton
            variant="outline"
            onClick={handleSaveToSupabase}
            disabled={syncLoading.save}
            className="text-white"
            title="Save to Supabase"
          >
            <Upload className="h-4 w-4 mr-2" />
            {syncLoading.save ? "Saving..." : "Save"}
          </FuturisticButton>

          <FuturisticButton
            variant="outline"
            onClick={handleExport}
            className="text-white" // Ensuring white text color for Export button
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </FuturisticButton>

          <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
            <DialogContent className="glass-card max-w-3xl">
              <DialogHeader>
                <DialogTitle className="text-gray-100">Export Data</DialogTitle>
                <DialogDescription className="text-gray-300">
                  Copy this JSON to save or transfer your data.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea className="glass-input min-h-[300px] font-mono text-sm" value={jsonOutput} readOnly />
              </div>
              <DialogFooter>
                <FuturisticButton
                  onClick={() => {
                    navigator.clipboard.writeText(jsonOutput)
                    toast({
                      title: "Copied to clipboard",
                      description: "The JSON data has been copied to your clipboard",
                    })
                  }}
                >
                  Copy to Clipboard
                </FuturisticButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {databases.length === 0 ? (
        <div className="text-center py-12 border border-gray-700/30 rounded-lg backdrop-blur-sm bg-gray-800/20 grid-lines">
          <DatabaseIcon className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-300">No databases yet</h3>
          <p className="mt-1 text-sm text-gray-400">Create your first database to get started.</p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-250px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {databases.map((database) => (
              <FuturisticCard
                key={database.databaseId}
                className={`cursor-pointer transition-all ${activeDatabase?.databaseId === database.databaseId ? "active-item scale-102" : ""}`}
                onClick={() => onSelectDatabase(database)}
                popEffect
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex justify-between items-center text-gray-100">
                    <span>{database.name}</span>
                    <div className="flex gap-1">
                      <FuturisticButton
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingDatabase({ ...database })
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </FuturisticButton>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <FuturisticButton variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                            <Trash2 className="h-4 w-4" />
                          </FuturisticButton>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass-card">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-gray-100">Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-300">
                              This will permanently delete the database and all its tables, forms, and relationships.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="glass-button">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="glass-button bg-red-500/20"
                              onClick={() => handleDeleteDatabase(database.databaseId)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardTitle>
                  <CardDescription className="text-gray-300">{database.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-200">
                    <div className="flex justify-between">
                      <span>Tables:</span>
                      <span className="glass-badge px-2 py-0.5 rounded-md">{database.tables.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Forms:</span>
                      <span className="glass-badge px-2 py-0.5 rounded-md">{database.forms.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Relationships:</span>
                      <span className="glass-badge px-2 py-0.5 rounded-md">{database.relationships.length}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="text-xs text-gray-400">
                  Created: {new Date(database.createdDate).toLocaleDateString()}
                </CardFooter>
              </FuturisticCard>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Edit Database Dialog */}
      <Dialog open={!!editingDatabase} onOpenChange={(open) => !open && setEditingDatabase(null)}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle className="text-gray-100">Edit Database</DialogTitle>
            <DialogDescription className="text-gray-300">Update the details for your database.</DialogDescription>
          </DialogHeader>
          {editingDatabase && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-name" className="text-sm font-medium text-gray-200">
                  Name
                </label>
                <Input
                  id="edit-name"
                  className="glass-input"
                  value={editingDatabase.name}
                  onChange={(e) => setEditingDatabase({ ...editingDatabase, name: e.target.value })}
                  placeholder="Database name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-description" className="text-sm font-medium text-gray-200">
                  Description
                </label>
                <Textarea
                  id="edit-description"
                  className="glass-input"
                  value={editingDatabase.description}
                  onChange={(e) => setEditingDatabase({ ...editingDatabase, description: e.target.value })}
                  placeholder="Database description"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <FuturisticButton onClick={handleUpdateDatabase}>Update Database</FuturisticButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
