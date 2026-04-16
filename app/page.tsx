"use client"

// Text input version for free deletion support
import { useState, useCallback, useEffect } from "react"
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-light.css'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus, Copy, Check, Download, Grid2X2, Maximize2, MoreVertical, BarChart3, Settings2 } from "lucide-react"

interface Column {
  id: string
  width: number
}

export default function TableGenerator() {
  const [columns, setColumns] = useState<Column[]>([
    { id: "1", width: 320 },
    { id: "2", width: 320 },
  ])
  const [useGutter, setUseGutter] = useState(true)
  const [gutterWidth, setGutterWidth] = useState(10)
  const [gutterInputValue, setGutterInputValue] = useState("10")
  const [columnInputValues, setColumnInputValues] = useState<Record<string, string>>({
    "1": "320",
    "2": "320",
  })
  const [copied, setCopied] = useState(false)
  const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set())

  const DEFAULT_COLUMNS: Column[] = [
    { id: "1", width: 320 },
    { id: "2", width: 320 },
  ]

  // Sync input values when state changes (from slider)
  useEffect(() => {
    setGutterInputValue(String(gutterWidth))
  }, [gutterWidth])

  const resetToDefault = useCallback(() => {
    setColumns(DEFAULT_COLUMNS)
    setUseGutter(true)
    setGutterWidth(10)
    setGutterInputValue("10")
    setColumnInputValues({
      "1": "320",
      "2": "320",
    })
  }, [])

  const addColumn = useCallback(() => {
    const newId = Date.now().toString()
    const newColumn: Column = {
      id: newId,
      width: 200,
    }
    setColumns((prev) => [...prev, newColumn])
    setColumnInputValues(prev => ({
      ...prev,
      [newId]: "200"
    }))
    setAnimatingIds(prev => new Set(prev).add(newId))
    setTimeout(() => {
      setAnimatingIds(prev => {
        const next = new Set(prev)
        next.delete(newId)
        return next
      })
    }, 300)
  }, [])

  const removeColumn = useCallback((id: string) => {
    setAnimatingIds(prev => new Set(prev).add(id))
    setTimeout(() => {
      setColumns((prev) => prev.filter((col) => col.id !== id))
      setColumnInputValues(prev => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      setAnimatingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }, 150)
  }, [])

  const updateColumnWidth = useCallback((id: string, width: number) => {
    setColumns((prev) =>
      prev.map((col) => (col.id === id ? { ...col, width } : col))
    )
    setColumnInputValues(prev => ({
      ...prev,
      [id]: String(width)
    }))
  }, [])

  const generateCode = useCallback(() => {
    if (columns.length === 0) return "<!-- Add columns to generate code -->"

    let innerContent = ""

    columns.forEach((column, index) => {
      const isFirst = index === 0
      const isLast = index === columns.length - 1
      const align = isLast ? "right" : "left"
      const float = isLast ? "right" : "left"

      // Column table
      innerContent += `<table role="presentation" class="sd-mobile-full-width" width="${column.width}" align="${align}" style="width:${column.width}px;float:${float};" cellspacing="0" cellpadding="0">
        <tr>
          <td><!-- Column ${index + 1} content --></td>
        </tr>
      </table>`

      // After each column (except last), add separator/gutter section
      if (!isLast) {
        if (useGutter) {
          // With gutter: opening MSO comment + gutter table + closing MSO comment
          innerContent += `
      
      <!--[if mso]>
          </td>
          <td valign="top">
      <![endif]-->`

          innerContent += `
      
      <table role="presentation" class="sd-mobile-full-width" width="${gutterWidth}" align="left" style="width:${gutterWidth}px;float:left;" cellspacing="0" cellpadding="0">
        <tr>
          <td style="font-size:1px; line-height: 1px; height: ${gutterWidth}px;" height="${gutterWidth}">&nbsp;</td>
        </tr>
      </table>`

          innerContent += `
      
      <!--[if mso]>
          </td>
          <td valign="top">
      <![endif]--> 
      
      `
        } else {
          // Without gutter: just single MSO comment between columns
          innerContent += `
      
      <!--[if mso]>
          </td>
          <td valign="top">
      <![endif]-->
      
      `
        }
      }
    })

    return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
  <tr>
    <td>${innerContent}</td>
  </tr>
</table>`
  }, [columns, useGutter, gutterWidth])

  const copyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(generateCode())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [generateCode])

  const downloadCode = useCallback(() => {
    const code = generateCode()
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(code))
    element.setAttribute('download', 'table-layout.html')
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }, [generateCode])

  const code = generateCode()

  const totalColumnWidth = columns.reduce((sum, col) => sum + col.width, 0)
  const totalGutterWidth = useGutter ? gutterWidth * Math.max(0, columns.length - 1) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-950 dark:to-zinc-900">
      {/* Sticky Header */}
      <header className="text-white shadow-lg p-4 md:p-6 sticky top-0 z-50" style={{backgroundColor: 'rgb(33, 41, 44)'}}>
        <div className="mx-auto max-w-6xl flex items-center gap-3 md:gap-4">
          <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center hover:opacity-80 transition-opacity">
            <img 
              alt="Floating Table Generator Logo" 
              className="h-8 md:h-12 w-auto" 
              src="/placeholder-logo.svg"
            />
          </a>
          <div>
            <h1 className="text-lg md:text-2xl font-bold">Floating Table Generator</h1>
            <p className="text-xs md:text-sm text-gray-300">Generate responsive HTML email tables with floating layouts</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-3 p-2 sm:p-4">
        {/* Main Content */}

        {/* Visual Preview */}
        <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <CardContent className="p-4">
            <div className="overflow-x-auto rounded-lg border-2 border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800 p-2">
              <div className="flex flex-nowrap">
                {columns.map((column, index) => (
                  <div key={column.id} className="flex shrink-0">
                    <div
                      className={`flex flex-col items-center justify-center border-2 border-blue-400 bg-blue-50 dark:bg-blue-950 text-xs font-medium text-blue-700 dark:text-blue-300 transition-all duration-300 ${
                        animatingIds.has(column.id) ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
                      }`}
                      style={{
                        width: column.width,
                        minHeight: 100,
                      }}
                    >
                      <span>Column {index + 1}</span>
                      <span className="mt-1 text-sm font-semibold">{column.width}px</span>
                    </div>
                    {useGutter && index < columns.length - 1 && (
                      <div
                        className="flex items-center justify-center bg-amber-100 dark:bg-amber-950 text-[10px] font-medium text-amber-700 dark:text-amber-300"
                        style={{
                          width: gutterWidth,
                          minHeight: 100,
                        }}
                      >
                        {gutterWidth}
                      </div>
                    )}
                  </div>
                ))}
                {columns.length === 0 && (
                  <div className="flex h-24 w-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                    Add columns to see preview
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls - Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Gutter Settings Card */}
          <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <MoreVertical className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Gutter</h3>
              </div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="use-gutter" className="text-sm font-medium text-slate-700 dark:text-slate-300">Enable Gutter</Label>
                <Switch
                  id="use-gutter"
                  checked={useGutter}
                  onCheckedChange={setUseGutter}
                />
              </div>
              {useGutter && (
                <div className="rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 px-3 py-2 flex items-center gap-2 w-full">
                  <Label htmlFor="gutter-width" className="text-xs font-medium text-slate-600 dark:text-slate-400 min-w-fit">Width (px)</Label>
                  <Input
                    type="text"
                    value={gutterInputValue}
                    onChange={(e) => setGutterInputValue(e.target.value)}
                    onBlur={(e) => {
                      if (e.target.value === "") {
                        return
                      }
                      const val = parseInt(e.target.value)
                      if (!isNaN(val) && val >= 1 && val <= 100) {
                        setGutterWidth(val)
                      } else {
                        setGutterInputValue(String(gutterWidth))
                      }
                    }}
                    placeholder="10"
                    className="h-8 flex-1 text-xs"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400 min-w-fit">px</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Columns Management Card */}
          <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Grid2X2 className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Columns</h3>
              </div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">{columns.length} {columns.length === 1 ? 'column' : 'columns'}</span>
                <Button size="sm" variant="outline" onClick={addColumn} className="h-6 text-xs px-2">
                  <Plus className="mr-0.5 h-3 w-3" />
                  <span className="hidden sm:inline">Add</span>
                </Button>
              </div>
              {columns.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No columns added
                </p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {columns.map((column, index) => (
                    <div
                      key={column.id}
                      className={`flex items-center gap-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 px-3 py-2 transition-all duration-150 w-full ${
                        animatingIds.has(column.id) ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
                      }`}
                    >
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400 min-w-fit">
                        Column {index + 1}
                      </span>
                      <Input
                        type="text"
                        value={columnInputValues[column.id] || column.width}
                        onChange={(e) => {
                          setColumnInputValues(prev => ({
                            ...prev,
                            [column.id]: e.target.value
                          }))
                        }}
                        onBlur={(e) => {
                          if (e.target.value === "") {
                            return
                          }
                          const val = parseInt(e.target.value)
                          if (!isNaN(val) && val >= 10 && val <= 1000) {
                            updateColumnWidth(column.id, val)
                          } else {
                            setColumnInputValues(prev => ({
                              ...prev,
                              [column.id]: String(column.width)
                            }))
                          }
                        }}
                        placeholder={String(column.width)}
                        className="h-8 flex-1 text-xs"
                      />
                      <span className="text-xs text-slate-600 dark:text-slate-400 min-w-fit">px</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeColumn(column.id)}
                        className="h-8 w-8 text-slate-600 dark:text-slate-400 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove column</span>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Information on Widths */}
          {columns.length > 0 && (
            <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 gap-2">
                  <div className="rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Grid2X2 className="h-4 w-4 text-blue-500" />
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Columns</p>
                    </div>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{columns.length}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Maximize2 className="h-4 w-4 text-green-500" />
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Column Width</p>
                    </div>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{totalColumnWidth}</p>
                  </div>
                  {useGutter && columns.length > 1 && (
                    <div className="rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 p-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <MoreVertical className="h-4 w-4 text-amber-500" />
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Gutter Width</p>
                      </div>
                      <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{totalGutterWidth}px</p>
                    </div>
                  )}
                  <div className="rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <BarChart3 className="h-4 w-4 text-purple-500" />
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Total</p>
                    </div>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{totalColumnWidth + totalGutterWidth}px</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Generated Code - Full Width */}
        <Card className="overflow-hidden border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900">
          <CardHeader className="border-b border-slate-200 dark:border-zinc-800 p-4 bg-slate-100 dark:bg-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-slate-400 dark:bg-slate-600 flex items-center justify-center text-white text-xs font-bold">H</div>
                <CardTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">table.html</CardTitle>
              </div>
              <div className="flex gap-1">
                <Button
                  id="copy-btn"
                  size="sm"
                  variant="outline"
                  onClick={copyToClipboard}
                  disabled={columns.length === 0}
                  className="h-7 text-xs px-2"
                >
                  {copied ? (
                    <>
                      <Check className="mr-1.5 h-3.5 w-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1.5 h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadCode}
                  disabled={columns.length === 0}
                  className="h-7 text-xs px-2"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto max-h-96 bg-slate-50 dark:bg-slate-950">
              <pre className="p-0 text-xs leading-relaxed font-mono bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-words">
                <code 
                  className="hljs language-html"
                  dangerouslySetInnerHTML={{
                    __html: hljs.highlight(code, { language: 'html' }).value
                  }}
                />
              </pre>
            </div>
          </CardContent>
        </Card>


      </div>
    </div>
  )
}