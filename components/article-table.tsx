"use client"

import { useState, useCallback } from "react"
import {
  Download,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Loader2,
  Trash2,
  Pencil,
  Check,
  X,
} from "lucide-react"
import type { ShaftArticle } from "@/lib/walterscheid-data"
import { getPdfUrl } from "@/lib/walterscheid-data"
import { Button } from "@/components/ui/button"

export type DownloadStatus = "idle" | "downloading" | "done" | "error"

interface ArticleTableProps {
  articles: ShaftArticle[]
  statuses: Record<string, DownloadStatus>
  onDownload: (wpgCode: string) => void
  onUpdateArticle: (id: string, updates: Partial<Pick<ShaftArticle, "article" | "wpgCode" | "manufacturer">>) => void
  onDeleteArticle: (id: string) => void
  filter: string
}

function StatusBadge({ status }: { status: DownloadStatus }) {
  switch (status) {
    case "downloading":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-info/15 px-2.5 py-1 text-xs font-medium text-info">
          <Loader2 className="h-3 w-3 animate-spin" />
          {"Загрузка"}
        </span>
      )
    case "done":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">
          <CheckCircle2 className="h-3 w-3" />
          {"Готово"}
        </span>
      )
    case "error":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/15 px-2.5 py-1 text-xs font-medium text-destructive">
          <XCircle className="h-3 w-3" />
          {"Ошибка"}
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {"Ожидание"}
        </span>
      )
  }
}

function EditableRow({
  article,
  idx,
  status,
  onDownload,
  onUpdate,
  onDelete,
}: {
  article: ShaftArticle
  idx: number
  status: DownloadStatus
  onDownload: (wpgCode: string) => void
  onUpdate: (id: string, updates: Partial<Pick<ShaftArticle, "article" | "wpgCode" | "manufacturer">>) => void
  onDelete: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [editManufacturer, setEditManufacturer] = useState(article.manufacturer)
  const [editArticle, setEditArticle] = useState(article.article)
  const [editWpg, setEditWpg] = useState(article.wpgCode)

  const startEdit = useCallback(() => {
    setEditManufacturer(article.manufacturer)
    setEditArticle(article.article)
    setEditWpg(article.wpgCode)
    setEditing(true)
  }, [article])

  const saveEdit = useCallback(() => {
    if (!editWpg.trim()) return
    onUpdate(article.id, {
      manufacturer: editManufacturer.trim() || article.manufacturer,
      article: editArticle.trim(),
      wpgCode: editWpg.trim(),
    })
    setEditing(false)
  }, [article.id, article.manufacturer, editManufacturer, editArticle, editWpg, onUpdate])

  const cancelEdit = useCallback(() => {
    setEditing(false)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") saveEdit()
      if (e.key === "Escape") cancelEdit()
    },
    [saveEdit, cancelEdit]
  )

  const filename = `${article.article}_${article.wpgCode}`

  if (editing) {
    return (
      <tr className="border-b border-border/50 bg-secondary/20">
        <td className="px-4 py-2 text-sm text-muted-foreground">{idx + 1}</td>
        <td className="px-4 py-2">
          <input
            type="text"
            value={editManufacturer}
            onChange={(e) => setEditManufacturer(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 w-full rounded border border-border bg-input px-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="CLAAS"
          />
        </td>
        <td className="px-4 py-2">
          <input
            type="text"
            value={editArticle}
            onChange={(e) => setEditArticle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 w-full rounded border border-border bg-input px-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Вал карданный 0015996020"
          />
        </td>
        <td className="px-4 py-2">
          <input
            type="text"
            value={editWpg}
            onChange={(e) => setEditWpg(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 w-28 rounded border border-border bg-input px-2 text-xs font-mono text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="1600296"
          />
        </td>
        <td className="px-4 py-2 text-xs text-muted-foreground font-mono">
          {editArticle}_{editWpg}.pdf
        </td>
        <td className="px-4 py-2">
          <StatusBadge status={status} />
        </td>
        <td className="px-4 py-2">
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-success hover:text-success hover:bg-success/10"
              onClick={saveEdit}
              title="Сохранить"
            >
              <Check className="h-4 w-4" />
              <span className="sr-only">{"Сохранить"}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              onClick={cancelEdit}
              title="Отменить"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">{"Отменить"}</span>
            </Button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className="group border-b border-border/50 transition-colors hover:bg-secondary/30">
      <td className="px-4 py-3 text-sm text-muted-foreground">{idx + 1}</td>
      <td className="px-4 py-3">
        <span className="inline-flex rounded bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
          {article.manufacturer}
        </span>
      </td>
      <td className="max-w-xs px-4 py-3 text-sm text-foreground">
        <span className="line-clamp-2">{article.article}</span>
      </td>
      <td className="px-4 py-3">
        <code className="rounded bg-secondary px-2 py-1 text-xs font-mono text-primary">
          {article.wpgCode}
        </code>
      </td>
      <td className="max-w-[200px] px-4 py-3">
        <span
          className="block truncate text-xs text-muted-foreground font-mono"
          title={filename}
        >
          {filename}.pdf
        </span>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={status} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
            onClick={startEdit}
            title="Редактировать"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span className="sr-only">{"Редактировать"}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
            onClick={() => onDelete(article.id)}
            title="Удалить"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">{"Удалить"}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            onClick={() => window.open(getPdfUrl(article.wpgCode), "_blank")}
            title="Открыть PDF"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="sr-only">{"Открыть PDF"}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
            onClick={() => onDownload(article.wpgCode)}
            disabled={status === "downloading"}
            title="Скачать PDF"
          >
            {status === "downloading" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            <span className="sr-only">{"Скачать PDF"}</span>
          </Button>
        </div>
      </td>
    </tr>
  )
}

export function ArticleTable({
  articles,
  statuses,
  onDownload,
  onUpdateArticle,
  onDeleteArticle,
  filter,
}: ArticleTableProps) {
  const filtered = articles.filter((a) => {
    if (!filter) return true
    const q = filter.toLowerCase()
    return (
      a.manufacturer.toLowerCase().includes(q) ||
      a.article.toLowerCase().includes(q) ||
      a.wpgCode.includes(q)
    )
  })

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {"#"}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {"Производитель"}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {"Артикул / Модель"}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {"WPG код"}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {"Имя файла"}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {"Статус"}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {"Действия"}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((article, idx) => {
              const status = statuses[article.wpgCode] || "idle"
              return (
                <EditableRow
                  key={article.id}
                  article={article}
                  idx={idx}
                  status={status}
                  onDownload={onDownload}
                  onUpdate={onUpdateArticle}
                  onDelete={onDeleteArticle}
                />
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  {"Ничего не найдено"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
