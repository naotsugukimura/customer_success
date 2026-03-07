"use client"

import { useState } from "react"
import { ChatContainer } from "@/components/ChatContainer"
import { AdminDashboard } from "@/components/admin/AdminDashboard"
import { MessageSquare, BarChart3 } from "lucide-react"

const TABS = [
  { id: "chat", label: "顧客チャット", icon: MessageSquare },
  { id: "admin", label: "カスタマーサクセス", icon: BarChart3 },
] as const

type TabId = (typeof TABS)[number]["id"]

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("chat")

  return (
    <div className="flex h-[100dvh] flex-col">
      {/* Tab Bar */}
      <div className="flex shrink-0 border-b bg-background">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="size-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "chat" && <ChatContainer />}
        {activeTab === "admin" && (
          <div className="h-full overflow-y-auto">
            <AdminDashboard />
          </div>
        )}
      </div>
    </div>
  )
}
