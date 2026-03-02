"use client"

import { FileText, Download, CheckCircle2, AlertCircle, Loader2, Shuffle } from "lucide-react"

interface StatsBarProps {
  total: number
  uniqueCount: number
  downloaded: number
  failed: number
  checking: boolean
  bruteFound?: number
  isBruteForce?: boolean
}

export function StatsBar({
  total,
  uniqueCount,
  downloaded,
  failed,
  checking,
  bruteFound = 0,
  isBruteForce = false,
}: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-info/15 text-info">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{"Строк в CSV"}</p>
          <p className="text-xl font-semibold text-foreground">{total}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{"К скачиванию"}</p>
          <p className="text-xl font-semibold text-foreground">{uniqueCount}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-success/15 text-success">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{"Скачано"}</p>
          <p className="text-xl font-semibold text-foreground">{downloaded}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-destructive/15 text-destructive">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{"Ошибки"}</p>
          <p className="text-xl font-semibold text-foreground">{failed}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent/15 text-accent">
          <Shuffle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{"Перебор (0-9)"}</p>
          <p className="text-xl font-semibold text-foreground">{bruteFound}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
          {checking ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Download className="h-5 w-5" />
          )}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{"Статус"}</p>
          <p className="text-sm font-medium text-foreground">
            {checking
              ? isBruteForce
                ? "Перебор..."
                : "Загрузка..."
              : "Готов"}
          </p>
        </div>
      </div>
    </div>
  )
}
