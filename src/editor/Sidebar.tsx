import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { ComponentType } from '../codegen/types'
import { COMPONENT_META } from './defaults'

const COMPONENT_ORDER: ComponentType[] = [
  'AnnouncementBar',
  'Navigation',
  'HeroSection',
  'FeatureSection',
  'ProductGrid',
  'CTABlock',
  'Footer',
  'ProductDetail',
]

function PaletteCard({ type }: { type: ComponentType }) {
  const meta = COMPONENT_META[type]
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { source: 'palette', type },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.35 : 1,
      }}
      className="group flex items-center gap-2.5 px-2 py-[7px] rounded-[6px] cursor-grab active:cursor-grabbing hover:bg-white/[0.05] transition-colors select-none"
    >
      {/* Component type chip */}
      <div className="w-7 h-7 rounded-[5px] bg-white/[0.06] flex items-center justify-center flex-shrink-0 border border-white/[0.08] group-hover:border-white/[0.14] transition-colors">
        <span className="text-[9px] font-bold text-neutral-500 tracking-wide group-hover:text-neutral-400 transition-colors">
          {meta.abbr}
        </span>
      </div>

      {/* Labels */}
      <div className="min-w-0 flex-1">
        <p className="text-[12px] text-neutral-400 leading-none font-medium group-hover:text-neutral-200 transition-colors">
          {meta.label}
        </p>
        <p className="text-[10px] text-neutral-700 mt-[3px] truncate group-hover:text-neutral-600 transition-colors">
          {meta.description}
        </p>
      </div>

      {/* Drag affordance — visible on hover */}
      <svg
        className="w-3 h-3 text-neutral-700 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        viewBox="0 0 12 12"
        fill="currentColor"
      >
        <circle cx="4" cy="3" r="1" /><circle cx="8" cy="3" r="1" />
        <circle cx="4" cy="6" r="1" /><circle cx="8" cy="6" r="1" />
        <circle cx="4" cy="9" r="1" /><circle cx="8" cy="9" r="1" />
      </svg>
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="w-[220px] bg-[#111111] flex flex-col border-r border-white/[0.07] flex-shrink-0">
      {/* Section label */}
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <p className="text-[10px] uppercase tracking-[0.12em] text-neutral-600 font-semibold px-1">
          Components
        </p>
      </div>

      {/* Scrollable palette */}
      <div className="flex flex-col gap-px px-2 overflow-y-auto flex-1 pb-3">
        {COMPONENT_ORDER.map(type => (
          <PaletteCard key={type} type={type} />
        ))}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-3 border-t border-white/[0.05] flex-shrink-0">
        <p className="text-[10px] text-neutral-700 leading-relaxed px-1">
          Drag onto the canvas to add
        </p>
      </div>
    </aside>
  )
}
