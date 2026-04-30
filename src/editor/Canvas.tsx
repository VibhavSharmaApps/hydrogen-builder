import { useDroppable } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { CanvasItem } from './types'
import type { Viewport } from './types'
import { VIEWPORT_WIDTHS } from './types'
import { CanvasPreview } from './CanvasPreview'
import { COMPONENT_META } from './defaults'

// ── Sortable canvas item ──────────────────────────────────────────────────────

interface SortableItemProps {
  item: CanvasItem
  isSelected: boolean
  onSelect: () => void
  onRemove: () => void
}

function SortableCanvasItem({ item, isSelected, onSelect, onRemove }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    data: { source: 'canvas' },
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 }}
      className={`relative group cursor-pointer transition-all duration-100 ${
        isSelected
          ? 'ring-[1.5px] ring-blue-500 ring-offset-[3px] ring-offset-white'
          : 'ring-[1.5px] ring-transparent hover:ring-black/10 hover:ring-offset-[3px] hover:ring-offset-white'
      }`}
      onClick={onSelect}
    >
      {/* Drag handle — appears above on hover */}
      <div
        {...listeners}
        {...attributes}
        onClick={e => e.stopPropagation()}
        className="absolute -top-px left-1/2 -translate-x-1/2 z-20 hidden group-hover:flex cursor-grab active:cursor-grabbing items-center gap-1.5 px-2.5 py-[5px] bg-neutral-900 border border-white/[0.12] rounded-b-md shadow-lg"
        title="Drag to reorder"
      >
        <svg className="w-2.5 h-2.5 text-neutral-500" viewBox="0 0 10 6" fill="currentColor">
          <rect x="0" y="0" width="10" height="1.5" rx="0.75" />
          <rect x="0" y="4.5" width="10" height="1.5" rx="0.75" />
        </svg>
        <span className="text-[10px] text-neutral-500 font-medium tracking-wide">
          {COMPONENT_META[item.type].abbr}
        </span>
      </div>

      {/* Selected label */}
      {isSelected && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/25 rounded-[4px] px-1.5 py-[3px] pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
          <span className="text-[10px] text-blue-400 font-medium tracking-wide">
            {COMPONENT_META[item.type].label}
          </span>
        </div>
      )}

      {/* Remove button */}
      <button
        onClick={e => { e.stopPropagation(); onRemove() }}
        className="absolute top-2 right-2 z-10 hidden group-hover:flex items-center justify-center w-[22px] h-[22px] rounded-[5px] bg-neutral-900 border border-white/[0.1] text-neutral-500 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-colors text-sm leading-none shadow-lg"
        aria-label={`Remove ${item.type}`}
      >
        ×
      </button>

      <div className="pointer-events-none overflow-hidden">
        <CanvasPreview item={item} />
      </div>
    </div>
  )
}

// ── Canvas ────────────────────────────────────────────────────────────────────

interface CanvasProps {
  items: CanvasItem[]
  selectedId: string | null
  viewport: Viewport
  onSelect: (id: string | null) => void
  onDeselect: () => void
  onRemove: (id: string) => void
}

export function Canvas({ items, selectedId, viewport, onSelect, onDeselect, onRemove }: CanvasProps) {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-drop-zone' })
  const frameWidth = VIEWPORT_WIDTHS[viewport]

  return (
    <main
      ref={setNodeRef}
      onClick={onDeselect}
      style={{
        backgroundImage: isOver
          ? 'none'
          : 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
      className={`flex-1 overflow-y-auto transition-colors duration-150 ${
        isOver ? 'bg-blue-950/20' : 'bg-[#1a1a1a]'
      }`}
    >
      {/* Outer padding — click to deselect */}
      <div className="flex flex-col items-center py-8 min-h-full">

        {/* Viewport frame — white page surface */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: frameWidth,
            transition: 'max-width 280ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          className="bg-white shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.5)] overflow-hidden flex-shrink-0 mx-4"
        >
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col">
              {items.map(item => (
                <SortableCanvasItem
                  key={item.id}
                  item={item}
                  isSelected={selectedId === item.id}
                  onSelect={() => onSelect(item.id)}
                  onRemove={() => onRemove(item.id)}
                />
              ))}
            </div>
          </SortableContext>

          {/* Empty state — inside the frame when items exist, else show standalone */}
          {items.length === 0 && (
            <div className={`flex flex-col items-center justify-center h-[340px] m-6 rounded-xl border border-dashed transition-all ${
              isOver ? 'border-blue-500/40 bg-blue-50' : 'border-neutral-200'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center mb-4">
                <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="12" height="12" rx="2" />
                  <path d="M8 5v6M5 8h6" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-[13px] font-medium text-neutral-500">
                {isOver ? 'Release to add' : 'Drop a component here'}
              </p>
              <p className="text-[11px] text-neutral-400 mt-1.5">
                Drag from the sidebar to build your page
              </p>
            </div>
          )}
        </div>

        {/* Viewport label below the frame */}
        {items.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <div className="h-px w-8 bg-white/[0.08]" />
            <span className="text-[10px] text-neutral-700 font-mono tabular-nums">{frameWidth}px</span>
            <div className="h-px w-8 bg-white/[0.08]" />
          </div>
        )}
      </div>
    </main>
  )
}
