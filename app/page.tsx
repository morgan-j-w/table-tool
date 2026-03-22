"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Trash2, Plus, Copy, Check, Download, RotateCcw } from "lucide-react"

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
  const [maxWidth, setMaxWidth] = useState(1200)
  const [maxWidthInputValue, setMaxWidthInputValue] = useState("1200")
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

  useEffect(() => {
    setMaxWidthInputValue(String(maxWidth))
  }, [maxWidth])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        document.getElementById('copy-btn')?.click()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault()
        addColumn()
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'r') {
        e.preventDefault()
        resetToDefault()
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const resetToDefault = useCallback(() => {
    setColumns(DEFAULT_COLUMNS)
    setUseGutter(true)
    setGutterWidth(10)
    setGutterInputValue("10")
    setMaxWidth(1200)
    setMaxWidthInputValue("1200")
    setColumnInputValues({
      "1": "320",
      "2": "320",
    })
  }, [])

  const applyPreset = useCallback((preset: 'two-col' | 'three-col' | 'hero' | 'sidebar') => {
    let newColumns: Column[]
    switch (preset) {
      case 'two-col':
        newColumns = [
          { id: "1", width: 300 },
          { id: "2", width: 300 },
        ]
        setGutterWidth(20)
        setGutterInputValue("20")
        break
      case 'three-col':
        newColumns = [
          { id: "1", width: 200 },
          { id: "2", width: 200 },
          { id: "3", width: 200 },
        ]
        setGutterWidth(15)
        setGutterInputValue("15")
        break
      case 'hero':
        newColumns = [
          { id: "1", width: 600 },
        ]
        setUseGutter(false)
        break
      case 'sidebar':
        newColumns = [
          { id: "1", width: 180 },
          { id: "2", width: 420 },
        ]
        setGutterWidth(20)
        setGutterInputValue("20")
        break
    }
    const newInputValues: Record<string, string> = {}
    newColumns.forEach(col => {
      newInputValues[col.id] = String(col.width)
    })
    setColumnInputValues(newInputValues)
    setColumns(newColumns)
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
          <td><!-- ${isFirst ? "LEFT" : isLast ? "RIGHT" : `COLUMN ${index + 1}`} CONTENT --></td>
        </tr>
      </table>`

      // After each column (except last), add MSO comment + gutter + MSO comment
      if (!isLast) {
        const msoGutterWidth = useGutter ? gutterWidth * 2 : 0
        const nextColumn = columns[index + 1]
        
        // MSO comment before gutter
        innerContent += `
      
      <!--[if mso]>
          </td>
          <td width="${msoGutterWidth}" valign="top">
      <![endif]-->`

        // Gutter table (if enabled)
        if (useGutter) {
          innerContent += `
      
      <table role="presentation" class="sd-mobile-full-width" width="${gutterWidth}" align="left" style="width:${gutterWidth}px;float:left;" cellspacing="0" cellpadding="0">
        <tr>
          <td><!-- SPACER / GUTTER --></td>
        </tr>
      </table>`
        }

        // MSO comment before next column
        innerContent += `
      
      <!--[if mso]>
          </td>
          <td width="${nextColumn.width}" valign="top">
      <![endif]--> 
      
      <!-- ${index + 2 === columns.length ? "Right" : `Column ${index + 2}`} column -->
      
      `
      }
    })

    return `<!-- Parent wrapper -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
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
  const totalContentWidth = totalColumnWidth + totalGutterWidth

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-950 dark:to-zinc-900 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header with Title and Action Buttons */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                Floating Table Generator
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Generate responsive HTML email tables with floating layouts
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetToDefault}
                className="text-xs sm:text-sm"
                title="Cmd+Shift+R"
              >
                <RotateCcw className="mr-1.5 h-4 w-4" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Preset Templates */}
        <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">Quick Presets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset('hero')}
                className="text-xs"
              >
                Hero (Full-width)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset('two-col')}
                className="text-xs"
              >
                2 Columns
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset('three-col')}
                className="text-xs"
              >
                3 Columns
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset('sidebar')}
                className="text-xs"
              >
                Sidebar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Visual Preview */}
        <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">Visual Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border-2 border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800 p-4">
              <div className="flex flex-nowrap" style={{ maxWidth: maxWidth }}>
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
            {columns.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-zinc-800 rounded-lg border border-slate-200 dark:border-zinc-700">
                <div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Columns</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{columns.length}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Column Width</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{totalColumnWidth}px</p>
                </div>
                {useGutter && columns.length > 1 && (
                  <div>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Gutter Width</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{totalGutterWidth}px</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Total</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{totalContentWidth}px</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Controls - Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Gutter Settings */}
          <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <CardHeader className="pb-3 pt-4">
              <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">Gutter Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pb-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="use-gutter" className="text-xs text-slate-700 dark:text-slate-300">Enable Gutter</Label>
                <Switch
                  id="use-gutter"
                  checked={useGutter}
                  onCheckedChange={setUseGutter}
                />
              </div>
              {useGutter && (
                <div className="space-y-2">
                  <Label htmlFor="gutter-width" className="text-xs font-medium text-slate-700 dark:text-slate-300">Width</Label>
                  <div className="flex gap-2 items-center">
                    <Slider
                      id="gutter-width"
                      value={[gutterWidth]}
                      onValueChange={(val) => setGutterWidth(val[0])}
                      min={1}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={gutterInputValue}
                      onChange={(e) => setGutterInputValue(e.target.value)}
                      onBlur={(e) => {
                        if (e.target.value === "") {
                          // Allow empty values while prototyping
                          return
                        }
                        const val = parseInt(e.target.value)
                        if (!isNaN(val) && val >= 1 && val <= 100) {
                          setGutterWidth(val)
                        } else {
                          setGutterInputValue(String(gutterWidth))
                        }
                      }}
                      min={1}
                      max={100}
                      className="h-7 w-16 text-xs"
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400 w-7">px</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Max Width Settings */}
          <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <CardHeader className="pb-3 pt-4">
              <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">Max Width</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pb-4">
              <div className="space-y-2">
                <Label htmlFor="max-width" className="text-xs font-medium text-slate-700 dark:text-slate-300">Width</Label>
                <div className="flex gap-2 items-center">
                  <Slider
                    id="max-width"
                    value={[maxWidth]}
                    onValueChange={(val) => setMaxWidth(val[0])}
                    min={400}
                    max={2000}
                    step={10}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={maxWidthInputValue}
                    onChange={(e) => setMaxWidthInputValue(e.target.value)}
                    onBlur={(e) => {
                      if (e.target.value === "") {
                        // Allow empty values while prototyping
                        return
                      }
                      const val = parseInt(e.target.value)
                      if (!isNaN(val) && val >= 400 && val <= 2000) {
                        setMaxWidth(val)
                      } else {
                        setMaxWidthInputValue(String(maxWidth))
                      }
                    }}
                    min={400}
                    max={2000}
                    className="h-7 w-20 text-xs"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400 w-7">px</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Controls container max-width for preview
              </p>
            </CardContent>
          </Card>

          {/* Columns Management */}
          <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <CardHeader className="pb-2 pt-4">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Columns ({columns.length})
                </CardTitle>
                <Button size="sm" variant="default" onClick={addColumn} className="h-7 text-xs" title="Cmd+L">
                  <Plus className="mr-1 h-3 w-3" />
                  <span className="hidden sm:inline">Add</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              {columns.length === 0 ? (
                <p className="py-3 text-center text-xs text-slate-500 dark:text-slate-400">
                  No columns added
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {columns.map((column, index) => (
                    <div
                      key={column.id}
                      className={`flex items-center gap-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 px-3 py-2 transition-all duration-150 ${
                        animatingIds.has(column.id) ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
                      }`}
                    >
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 min-w-fit">
                        Col {index + 1}
                      </span>
                      <Slider
                        value={[column.width]}
                        onValueChange={(val) =>
                          updateColumnWidth(column.id, val[0])
                        }
                        min={10}
                        max={1000}
                        step={5}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={columnInputValues[column.id] || column.width}
                        onChange={(e) => {
                          setColumnInputValues(prev => ({
                            ...prev,
                            [column.id]: e.target.value
                          }))
                        }}
                        onBlur={(e) => {
                          if (e.target.value === "") {
                            // Allow empty values while prototyping
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
                        min={10}
                        max={1000}
                        className="h-7 w-16 text-xs"
                      />
                      <span className="text-xs text-slate-600 dark:text-slate-400 min-w-fit">px</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeColumn(column.id)}
                        className="h-7 w-7 text-slate-600 dark:text-slate-400 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Remove column</span>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Generated Code - Full Width */}
        <Card className="overflow-hidden border-slate-200 dark:border-zinc-800 bg-slate-950 dark:bg-zinc-950">
          <CardHeader className="border-b border-slate-800 dark:border-zinc-800 pb-3 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-medium text-slate-200 dark:text-slate-300">Generated HTML</CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">⌘+K to copy (Cmd+L to add column, Cmd+Shift+R to reset)</p>
              </div>
              <div className="flex gap-2">
                <Button
                  id="copy-btn"
                  size="sm"
                  variant="outline"
                  onClick={copyToClipboard}
                  disabled={columns.length === 0}
                  className="h-8 text-xs border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-slate-100"
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
                  className="h-8 text-xs border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-slate-100"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto max-h-96 bg-slate-950">
              <pre className="p-4 text-xs leading-relaxed font-mono">
                <code>
                  {code.split('\n').map((line, lineIndex) => (
                    <div key={lineIndex} className="flex">
                      <span className="inline-block w-8 select-none pr-4 text-right text-slate-600 dark:text-slate-700">
                        {lineIndex + 1}
                      </span>
                      <span className="flex-1">
                        {line.includes('<!--') ? (
                          <span className="text-slate-600 dark:text-slate-600 italic">{line}</span>
                        ) : (
                          <>
                            {line.split(/(<[^>]+>)/g).map((part, partIndex) => {
                              if (part.startsWith('<') && part.endsWith('>')) {
                                const isClosing = part.startsWith('</')
                                const tagMatch = part.match(/<\/?(\w+)/)
                                const tagName = tagMatch ? tagMatch[1] : ''
                                const afterTag = part.slice(isClosing ? 2 + tagName.length : 1 + tagName.length, -1)
                                
                                return (
                                  <span key={partIndex}>
                                    <span className="text-slate-600 dark:text-slate-600">{isClosing ? '</' : '<'}</span>
                                    <span className="text-rose-400 dark:text-rose-400">{tagName}</span>
                                    {afterTag.split(/(\w+="[^"]*")/g).map((attr, attrIndex) => {
                                      const attrMatch = attr.match(/^(\w+)="([^"]*)"$/)
                                      if (attrMatch) {
                                        return (
                                          <span key={attrIndex}>
                                            <span className="text-amber-300 dark:text-amber-300"> {attrMatch[1]}</span>
                                            <span className="text-slate-600 dark:text-slate-600">=</span>
                                            <span className="text-emerald-400 dark:text-emerald-400">"{attrMatch[2]}"</span>
                                          </span>
                                        )
                                      }
                                      return <span key={attrIndex} className="text-slate-400 dark:text-slate-500">{attr}</span>
                                    })}
                                    <span className="text-slate-600 dark:text-slate-600">{'>'}</span>
                                  </span>
                                )
                              }
                              return <span key={partIndex} className="text-slate-300 dark:text-slate-400">{part}</span>
                            })}
                          </>
                        )}
                      </span>
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Footer with Tips */}
        <Card className="border-slate-200 dark:border-zinc-800 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200">💡 Keyboard Shortcuts</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-blue-800 dark:text-blue-300">
                <li><kbd className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700">⌘ K</kbd> - Copy code</li>
                <li><kbd className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700">⌘ L</kbd> - Add column</li>
                <li><kbd className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700">⌘ ⇧ R</kbd> - Reset all</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
