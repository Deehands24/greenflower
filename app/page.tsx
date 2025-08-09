"use client"

import { FuturisticThemeProvider } from "@/components/futuristic-theme-provider"
import Dashboard from "@/components/dashboard"
import { SupabaseSyncControls } from "@/components/supabase-sync-controls"
import { MenuBar } from "@/components/menu-bar"
import { Toolbox } from "@/components/toolbox"
import { Canvas } from "@/components/canvas"
import { PropertiesPanel } from "@/components/properties-panel"
import { FormPreview } from "@/components/form-preview"
import { DataImportDialog } from "@/components/data-import-dialog"
import { DatabaseCodeEditor } from "@/components/database-code-editor"
import { FuturisticSidebar } from "@/components/futuristic-sidebar"
import { NewDatabaseDialog } from "@/components/new-database-dialog"
import { BasicDatabaseDialog } from "@/components/basic-database-dialog"
import { TableManager } from "@/components/table-manager"
import { RelationshipManager } from "@/components/relationship-manager"
import { DatabaseManager } from "@/components/database-manager"

export default function Home() {
  return (
    <FuturisticThemeProvider>
      <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-gray-900 to-black text-white">
        <FuturisticSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <MenuBar />
          <main className="flex flex-1 overflow-hidden p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full h-full">
              <div className="md:col-span-1 lg:col-span-1 flex flex-col gap-4">
                <Toolbox />
                <PropertiesPanel />
              </div>
              <div className="md:col-span-2 lg:col-span-2 flex flex-col gap-4">
                <Canvas />
                <FormPreview />
              </div>
              <div className="md:col-span-3 lg:col-span-1 flex flex-col gap-4">
                <Dashboard />
                <DatabaseCodeEditor />
                <DatabaseManager />
                <TableManager />
                <RelationshipManager />
              </div>
            </div>
          </main>
        </div>
        <DataImportDialog />
        <NewDatabaseDialog />
        <BasicDatabaseDialog />
        <SupabaseSyncControls />
      </div>
    </FuturisticThemeProvider>
  )
}
