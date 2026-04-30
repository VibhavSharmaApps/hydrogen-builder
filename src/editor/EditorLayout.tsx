import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import type { ComponentType } from '../codegen/types'
import type { Viewport } from './types'
import { VIEWPORT_WIDTHS } from './types'
import { useEditorState } from './useEditorState'
import { Sidebar } from './Sidebar'
import { Canvas } from './Canvas'
import { PropsPanel } from './PropsPanel'
import { COMPONENT_META } from './defaults'
import { generateProject } from '../codegen'
import { zipProject, downloadProject } from '../export'

// ── Viewport toggle icons ─────────────────────────────────────────────────────

function DesktopIcon() {
  return (
    <svg width="14" height="12" viewBox="0 0 14 12" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round">
      <rect x="1" y="1" width="12" height="8" rx="1" />
      <path d="M5 11h4M7 9v2" />
    </svg>
  )
}
function TabletIcon() {
  return (
    <svg width="9" height="12" viewBox="0 0 9 12" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round">
      <rect x="0.625" y="0.625" width="7.75" height="10.75" rx="1.375" />
      <circle cx="4.5" cy="9.25" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}
function MobileIcon() {
  return (
    <svg width="7" height="12" viewBox="0 0 7 12" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round">
      <rect x="0.625" y="0.625" width="5.75" height="10.75" rx="1.375" />
      <circle cx="3.5" cy="9.25" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}

const VIEWPORT_TABS: { id: Viewport; icon: JSX.Element; title: string }[] = [
  { id: 'desktop', icon: <DesktopIcon />, title: 'Desktop · 1280px' },
  { id: 'tablet',  icon: <TabletIcon />,  title: 'Tablet · 768px'   },
  { id: 'mobile',  icon: <MobileIcon />,  title: 'Mobile · 375px'   },
]

// ── Drag overlay ──────────────────────────────────────────────────────────────

function DragOverlayCard({ type }: { type: ComponentType }) {
  const meta = COMPONENT_META[type]
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-[6px] bg-[#1f1f1f] shadow-2xl border border-white/10 w-52 cursor-grabbing">
      <div className="w-6 h-6 rounded-[4px] bg-neutral-700 flex items-center justify-center flex-shrink-0">
        <span className="text-[9px] font-semibold text-neutral-300 tracking-wide">{meta.abbr}</span>
      </div>
      <p className="text-[12px] font-medium text-neutral-200">{meta.label}</p>
    </div>
  )
}

// ── Main layout ───────────────────────────────────────────────────────────────

export function EditorLayout() {
  const { state, addItem, removeItem, reorderItems, updateProp, setSelected, setStoreName } =
    useEditorState()
  const [activeType, setActiveType]   = useState<ComponentType | null>(null)
  const [viewport, setViewport]       = useState<Viewport>('desktop')
  const [exporting, setExporting]     = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const selectedItem =
    state.selectedId ? (state.items.find(i => i.id === state.selectedId) ?? null) : null

  function onDragStart(event: DragStartEvent) {
    const data = event.active.data.current as { source: string; type?: ComponentType }
    if (data.source === 'palette' && data.type) setActiveType(data.type)
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveType(null)
    if (!over) return
    const activeData = active.data.current as { source: 'palette' | 'canvas'; type?: ComponentType }
    if (activeData.source === 'palette' && activeData.type) {
      const overId = over.id as string
      if (overId === 'canvas-drop-zone') {
        addItem(activeData.type)
      } else {
        const overIndex = state.items.findIndex(i => i.id === overId)
        addItem(activeData.type, overIndex >= 0 ? overIndex + 1 : undefined)
      }
    } else if (activeData.source === 'canvas' && active.id !== over.id) {
      if ((over.id as string) !== 'canvas-drop-zone') {
        reorderItems(active.id as string, over.id as string)
      }
    }
  }

  async function handleExport() {
    setExporting(true)
    try {
      const files = generateProject({
        storeName: state.storeName,
        pages: [{ path: '/', components: state.items.map(({ type, props }) => ({ type, props })) }],
      })
      const blob = await zipProject(files)
      downloadProject(blob, state.storeName)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#0f0f0f] text-white overflow-hidden">

      {/* ── Header (three equal columns so toggle sits dead-centre) ── */}
      <header className="grid grid-cols-3 items-center px-4 h-11 border-b border-white/[0.07] flex-shrink-0">

        {/* Left — logo + store name */}
        <div className="flex items-center gap-2.5">
          <div className="w-[18px] h-[18px] rounded-[4px] bg-white flex items-center justify-center flex-shrink-0">
            <span className="text-[9px] font-black text-neutral-950 leading-none">H</span>
          </div>
          <span className="text-[11px] font-medium text-neutral-600 select-none tracking-wide">
            Hydrogen Builder
          </span>
          <span className="w-px h-3 bg-white/10 mx-0.5" />
          <input
            type="text"
            value={state.storeName}
            onChange={e => setStoreName(e.target.value)}
            className="text-[12px] text-neutral-300 bg-transparent focus:outline-none py-0.5 px-1.5 -mx-1.5 rounded-[4px] hover:bg-white/[0.05] focus:bg-white/[0.05] transition-colors w-36"
            aria-label="Store name"
          />
        </div>

        {/* Centre — viewport toggle */}
        <div className="flex flex-col items-center gap-[3px]">
          <div className="flex items-center bg-white/[0.05] rounded-[6px] p-[3px] gap-[2px]">
            {VIEWPORT_TABS.map(({ id, icon, title }) => (
              <button
                key={id}
                onClick={() => setViewport(id)}
                title={title}
                className={`h-[22px] w-8 rounded-[4px] flex items-center justify-center transition-colors ${
                  viewport === id
                    ? 'bg-white/[0.12] text-white'
                    : 'text-neutral-600 hover:text-neutral-300'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
          <span className="text-[9px] font-mono text-neutral-700 leading-none tabular-nums">
            {VIEWPORT_WIDTHS[viewport]}px
          </span>
        </div>

        {/* Right — layers count + export */}
        <div className="flex items-center gap-3 justify-end">
          <span className="text-[11px] text-neutral-700 tabular-nums select-none">
            {state.items.length} {state.items.length === 1 ? 'layer' : 'layers'}
          </span>
          <span className="w-px h-3 bg-white/10" />
          <button
            onClick={handleExport}
            disabled={state.items.length === 0 || exporting}
            className="h-7 px-3 rounded-[5px] text-[11px] font-semibold bg-white text-neutral-950 hover:bg-neutral-200 disabled:opacity-20 disabled:cursor-not-allowed transition-colors tracking-wide"
          >
            {exporting ? 'Exporting…' : 'Export'}
          </button>
        </div>
      </header>

      {/* ── Three-panel body ── */}
      <div className="flex flex-1 overflow-hidden">
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <Sidebar />
          <Canvas
            items={state.items}
            selectedId={state.selectedId}
            viewport={viewport}
            onSelect={setSelected}
            onDeselect={() => setSelected(null)}
            onRemove={removeItem}
          />
          <DragOverlay dropAnimation={null}>
            {activeType ? <DragOverlayCard type={activeType} /> : null}
          </DragOverlay>
        </DndContext>
        <PropsPanel
          selectedItem={selectedItem}
          onUpdateProp={(key, value) =>
            state.selectedId && updateProp(state.selectedId, key, value)
          }
        />
      </div>
    </div>
  )
}
