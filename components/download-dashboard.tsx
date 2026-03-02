"use client"

import { useState, useCallback, useRef } from "react"
import {
  Download,
  Search,
  StopCircle,
  RotateCcw,
  Shuffle,
  Plus,
  Archive,
  FileUp,
} from "lucide-react"
import JSZip from "jszip"
import {
  type ShaftArticle,
  defaultArticles,
  getUniqueWpgCodes,
  getBruteForceVariations,
  getArticlesForCode,
  generateId,
  parseCsvToArticles,
} from "@/lib/walterscheid-data"
import { StatsBar } from "@/components/stats-bar"
import { ArticleTable, type DownloadStatus } from "@/components/article-table"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

type BruteForceResult = {
  code: string
  originalCode: string
  status: DownloadStatus
}

export function DownloadDashboard() {
  const [articles, setArticles] = useState<ShaftArticle[]>(defaultArticles)
  const [statuses, setStatuses] = useState<Record<string, DownloadStatus>>({})
  const [filter, setFilter] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState<"normal" | "bruteforce">("normal")
  const [zipPhase, setZipPhase] = useState(false)
  const abortRef = useRef(false)
  const csvInputRef = useRef<HTMLInputElement>(null)

  // Brute-force state
  const [bruteForceResults, setBruteForceResults] = useState<BruteForceResult[]>([])
  const [bruteProgress, setBruteProgress] = useState({ current: 0, total: 0 })
  const [bruteFoundCount, setBruteFoundCount] = useState(0)

  // Add new row form
  const [showAddForm, setShowAddForm] = useState(false)
  const [newManufacturer, setNewManufacturer] = useState("")
  const [newArticle, setNewArticle] = useState("")
  const [newWpg, setNewWpg] = useState("")

  const uniqueCodes = getUniqueWpgCodes(articles)

  const downloaded = Object.values(statuses).filter((s) => s === "done").length
  const failed = Object.values(statuses).filter((s) => s === "error").length
  const progress =
    uniqueCodes.length > 0 ? ((downloaded + failed) / uniqueCodes.length) * 100 : 0

  // --- Article CRUD ---
  const handleUpdateArticle = useCallback(
    (id: string, updates: Partial<Pick<ShaftArticle, "article" | "wpgCode" | "manufacturer">>) => {
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
      )
    },
    []
  )

  const handleDeleteArticle = useCallback((id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const handleAddArticle = useCallback(() => {
    if (!newWpg.trim()) return
    const newItem: ShaftArticle = {
      id: generateId(),
      manufacturer: newManufacturer.trim() || "N/A",
      article: newArticle.trim() || "Новый артикул",
      wpgCode: newWpg.trim(),
    }
    setArticles((prev) => [...prev, newItem])
    setNewManufacturer("")
    setNewArticle("")
    setNewWpg("")
    setShowAddForm(false)
  }, [newManufacturer, newArticle, newWpg])

  const handleCsvUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        const text = ev.target?.result as string
        const parsed = parseCsvToArticles(text)
        if (parsed.length > 0) {
          setArticles((prev) => [...prev, ...parsed])
        }
      }
      reader.readAsText(file)
      // reset so the same file can be re-uploaded
      e.target.value = ""
    },
    []
  )

  // --- Single download (no ZIP, just direct) ---
  const downloadSingle = useCallback(
    async (wpgCode: string) => {
      setStatuses((prev) => ({ ...prev, [wpgCode]: "downloading" }))
      try {
        const matchingArticles = getArticlesForCode(articles, wpgCode)
        const articleName =
          matchingArticles.length > 0
            ? `${matchingArticles[0].article}_${wpgCode}`
            : wpgCode

        const params = new URLSearchParams({ code: wpgCode, filename: articleName })
        const res = await fetch(`/api/download?${params}`)
        if (!res.ok) throw new Error("Download failed")

        const blob = await res.blob()
        saveBlob(blob, `${articleName}.pdf`)

        setStatuses((prev) => ({ ...prev, [wpgCode]: "done" }))
        return true
      } catch {
        setStatuses((prev) => ({ ...prev, [wpgCode]: "error" }))
        return false
      }
    },
    [articles]
  )

  // --- Download All -> ZIP (downloads ALL unique codes from the table) ---
  const downloadAll = useCallback(async () => {
    abortRef.current = false
    setIsRunning(true)
    setMode("normal")
    setZipPhase(false)

    // get fresh unique codes at the moment of click (includes brute-forced)
    const codesToDownload = getUniqueWpgCodes(articles)

    const zip = new JSZip()
    let downloadedCount = 0

    for (const code of codesToDownload) {
      if (abortRef.current) break

      setStatuses((prev) => ({ ...prev, [code]: "downloading" }))

      const matchingArticles = getArticlesForCode(articles, code)
      const articleName =
        matchingArticles.length > 0
          ? `${matchingArticles[0].article}_${code}`
          : code
      const safeName = articleName.replace(/[/\\?%*:|"<>]/g, "_")

      try {
        const params = new URLSearchParams({ code, filename: articleName })
        const res = await fetch(`/api/download?${params}`)
        if (!res.ok) throw new Error("Failed")

        const blob = await res.blob()
        const arrayBuffer = await blob.arrayBuffer()
        zip.file(`${safeName}.pdf`, arrayBuffer)
        downloadedCount++

        setStatuses((prev) => ({ ...prev, [code]: "done" }))
      } catch {
        setStatuses((prev) => ({ ...prev, [code]: "error" }))
      }

      await delay(800)
    }

    if (!abortRef.current && downloadedCount > 0) {
      setZipPhase(true)
      const zipBlob = await zip.generateAsync({ type: "blob" })
      const now = new Date()
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
      saveBlob(zipBlob, `WALTERSCHEID_чертежи_${dateStr}.zip`)
      setZipPhase(false)
    }

    setIsRunning(false)
  }, [articles])

  // --- Brute-force 0-9: only CHECK availability, add found codes to table ---
  const downloadBruteForce = useCallback(async () => {
    abortRef.current = false
    setIsRunning(true)
    setMode("bruteforce")
    setBruteForceResults([])
    setBruteFoundCount(0)

    // snapshot current codes so we know which are "new"
    const currentCodes = new Set(getUniqueWpgCodes(articles))
    const totalVariations = currentCodes.size * 10
    setBruteProgress({ current: 0, total: totalVariations })

    let found = 0
    let processed = 0
    const newArticlesBatch: ShaftArticle[] = []

    for (const originalCode of currentCodes) {
      if (abortRef.current) break

      const variations = getBruteForceVariations(originalCode)
      const matchingArticles = getArticlesForCode(articles, originalCode)
      const articlePrefix =
        matchingArticles.length > 0 ? matchingArticles[0].article : originalCode
      const manufacturer =
        matchingArticles.length > 0 ? matchingArticles[0].manufacturer : "N/A"

      for (const varCode of variations) {
        if (abortRef.current) break
        processed++
        setBruteProgress({ current: processed, total: totalVariations })

        // skip codes already in the table
        if (currentCodes.has(varCode)) {
          setBruteForceResults((prev) => [
            ...prev,
            { code: varCode, originalCode, status: "done" },
          ])
          continue
        }

        try {
          const checkRes = await fetch(`/api/check?code=${varCode}`)
          const checkData = await checkRes.json()

          if (checkData.available) {
            found++
            setBruteFoundCount(found)
            setBruteForceResults((prev) => [
              ...prev,
              { code: varCode, originalCode, status: "done" },
            ])

            // add discovered code to batch
            newArticlesBatch.push({
              id: generateId(),
              manufacturer,
              article: `${articlePrefix} (перебор)`,
              wpgCode: varCode,
            })

            // add to table in real-time
            setArticles((prev) => [
              ...prev,
              newArticlesBatch[newArticlesBatch.length - 1],
            ])
          } else {
            setBruteForceResults((prev) => [
              ...prev,
              { code: varCode, originalCode, status: "error" },
            ])
          }
        } catch {
          setBruteForceResults((prev) => [
            ...prev,
            { code: varCode, originalCode, status: "error" },
          ])
        }

        await delay(300)
      }
    }

    setIsRunning(false)
  }, [articles])

  const stopAll = useCallback(() => {
    abortRef.current = true
    setIsRunning(false)
  }, [])

  const resetAll = useCallback(() => {
    abortRef.current = true
    setIsRunning(false)
    setStatuses({})
    setBruteForceResults([])
    setBruteProgress({ current: 0, total: 0 })
    setBruteFoundCount(0)
    setZipPhase(false)
  }, [])

  const bruteProgressPercent =
    bruteProgress.total > 0
      ? (bruteProgress.current / bruteProgress.total) * 100
      : 0

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
              {"WALTERSCHEID PDF Downloader"}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {"Массовая загрузка чертежей карданных валов"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isRunning ? (
              <Button
                onClick={stopAll}
                variant="outline"
                className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <StopCircle className="h-4 w-4" />
                <span className="hidden md:inline">{"Остановить"}</span>
              </Button>
            ) : (
              <>
                <Button
                  onClick={resetAll}
                  variant="outline"
                  className="gap-2"
                  disabled={
                    Object.keys(statuses).length === 0 &&
                    bruteForceResults.length === 0
                  }
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="hidden md:inline">{"Сбросить"}</span>
                </Button>
                <Button
                  onClick={downloadBruteForce}
                  variant="outline"
                  className="gap-2 border-accent/50 text-accent hover:bg-accent/10 hover:text-accent"
                >
                  <Shuffle className="h-4 w-4" />
                  <span className="hidden md:inline">{"Перебор 0-9"}</span>
                  <span className="md:hidden">{"0-9"}</span>
                </Button>
                <Button
                  onClick={downloadAll}
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Archive className="h-4 w-4" />
                  <span className="hidden md:inline">{"Скачать все (ZIP)"}</span>
                  <span className="md:hidden">{"ZIP"}</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-6">
        <div className="flex flex-col gap-6">
          {/* Stats */}
          <StatsBar
            total={articles.length}
            uniqueCount={uniqueCodes.length}
            downloaded={downloaded}
            failed={failed}
            checking={isRunning}
            bruteFound={bruteFoundCount}
            isBruteForce={mode === "bruteforce" && isRunning}
          />

          {/* Progress bar during normal download */}
          {isRunning && mode === "normal" && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{zipPhase ? "Формирование ZIP-архива..." : "Загрузка PDF..."}</span>
                <span>{`${downloaded + failed} / ${uniqueCodes.length}`}</span>
              </div>
              <Progress value={progress} className="h-2" />
              {zipPhase && (
                <p className="text-sm text-primary animate-pulse">
                  {"Создание архива, подождите..."}
                </p>
              )}
            </div>
          )}

          {/* Brute-force progress */}
          {isRunning && mode === "bruteforce" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {zipPhase
                    ? "Формирование ZIP-архива..."
                    : "Перебор последней цифры (0-9) для каждого WPG кода"}
                </span>
                <span>{`${bruteProgress.current} / ${bruteProgress.total}`}</span>
              </div>
              <Progress value={bruteProgressPercent} className="h-2" />
              <p className="text-sm text-primary">
                {`Найдено: ${bruteFoundCount} PDF`}
              </p>
              {zipPhase && (
                <p className="text-sm text-primary animate-pulse">
                  {"Создание архива, подождите..."}
                </p>
              )}
            </div>
          )}

          {/* Brute-force results summary */}
          {bruteForceResults.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                {"Результаты перебора (0-9)"}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {bruteForceResults
                  .filter((r) => r.status === "done")
                  .map((r) => (
                    <span
                      key={r.code}
                      className="inline-flex rounded bg-primary/15 px-2 py-0.5 text-xs font-mono text-primary"
                    >
                      {r.code}
                    </span>
                  ))}
              </div>
              {bruteForceResults.filter((r) => r.status === "done").length ===
                0 &&
                !isRunning && (
                  <p className="text-sm text-muted-foreground">
                    {"Дополнительных PDF не найдено"}
                  </p>
                )}
            </div>
          )}

          {/* Flow info banner */}
          <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground">
            <p className="flex items-center gap-2">
              <Archive className="h-4 w-4 shrink-0 text-primary" />
              <span>
                <span className="font-semibold text-primary">{"Порядок работы:"}</span>
                {" 1) Загрузите CSV → 2) Нажмите \"Перебор 0-9\" — найденные коды добавятся в таблицу → 3) Нажмите \"Скачать все (ZIP)\" — все PDF (включая найденные перебором) скачаются в один архив."}
              </span>
            </p>
          </div>

          {/* Search + Add button */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Поиск по производителю, артикулу или WPG коду..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-input pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              variant="outline"
              className="gap-2 shrink-0"
            >
              <Plus className="h-4 w-4" />
              {"Добавить"}
            </Button>
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={handleCsvUpload}
            />
            <Button
              onClick={() => csvInputRef.current?.click()}
              variant="outline"
              className="gap-2 shrink-0"
            >
              <FileUp className="h-4 w-4" />
              {"Загрузить CSV"}
            </Button>
          </div>

          {/* Add new row form */}
          {showAddForm && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                {"Добавить новую запись"}
              </h3>
              <div className="flex flex-col gap-3 md:flex-row md:items-end">
                <div className="flex flex-col gap-1 md:flex-1">
                  <label className="text-xs text-muted-foreground">
                    {"Производитель"}
                  </label>
                  <input
                    type="text"
                    value={newManufacturer}
                    onChange={(e) => setNewManufacturer(e.target.value)}
                    placeholder="CLAAS"
                    className="h-9 w-full rounded border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex flex-col gap-1 md:flex-[2]">
                  <label className="text-xs text-muted-foreground">
                    {"Артикул / Модель"}
                  </label>
                  <input
                    type="text"
                    value={newArticle}
                    onChange={(e) => setNewArticle(e.target.value)}
                    placeholder="Вал карданный 0015996020"
                    className="h-9 w-full rounded border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex flex-col gap-1 md:w-40">
                  <label className="text-xs text-muted-foreground">
                    {"WPG код"}
                  </label>
                  <input
                    type="text"
                    value={newWpg}
                    onChange={(e) => setNewWpg(e.target.value)}
                    placeholder="1600296"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddArticle()
                    }}
                    className="h-9 w-full rounded border border-border bg-input px-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddArticle}
                    disabled={!newWpg.trim()}
                    className="h-9 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4" />
                    {"Добавить"}
                  </Button>
                  <Button
                    onClick={() => setShowAddForm(false)}
                    variant="outline"
                    className="h-9"
                  >
                    {"Отмена"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Edit hint */}
          <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            <p>
              {"Наведите на строку и нажмите "}
              <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 text-xs font-mono text-foreground">
                {"карандаш"}
              </kbd>
              {" чтобы изменить WPG код или артикул. "}
              <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 text-xs font-mono text-foreground">
                {"Enter"}
              </kbd>
              {" для сохранения."}
            </p>
          </div>

          {/* Table */}
          <ArticleTable
            articles={articles}
            statuses={statuses}
            onDownload={downloadSingle}
            onUpdateArticle={handleUpdateArticle}
            onDeleteArticle={handleDeleteArticle}
            filter={filter}
          />

          {/* Footer info */}
          <p className="text-center text-xs text-muted-foreground">
            {"Источник: walterscheid.com/out/pictures/media/ersatzteillisten/{WPG}.pdf"}
          </p>
        </div>
      </main>
    </div>
  )
}
