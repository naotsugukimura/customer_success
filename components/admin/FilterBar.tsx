"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"

interface FilterBarProps {
  search: string
  onSearchChange: (v: string) => void
  statusFilter: string
  onStatusChange: (v: string) => void
  emotionFilter: string
  onEmotionChange: (v: string) => void
}

export function FilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  emotionFilter,
  onEmotionChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="フリーワード検索..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="解決状態" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">すべて</SelectItem>
          <SelectItem value="resolved">解決済み</SelectItem>
          <SelectItem value="unresolved">未解決</SelectItem>
        </SelectContent>
      </Select>

      <Select value={emotionFilter} onValueChange={onEmotionChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="感情" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">すべて</SelectItem>
          <SelectItem value="困った">困った</SelectItem>
          <SelectItem value="不安">不安</SelectItem>
          <SelectItem value="諦めた">諦めた</SelectItem>
          <SelectItem value="わからない">わからない</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
