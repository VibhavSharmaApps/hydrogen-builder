import type { CanvasItem, PropFieldDef } from './types'
import { propSchemaMap, COMPONENT_META } from './defaults'

const inputClass =
  'w-full text-[12px] bg-white/[0.04] border border-white/[0.1] rounded-[5px] px-2.5 py-[6px] text-neutral-200 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-colors placeholder:text-neutral-700'

const labelClass = 'block text-[10px] uppercase tracking-[0.1em] text-neutral-600 font-semibold mb-1.5'

interface PropFieldProps {
  fieldKey: string
  field: PropFieldDef
  value: unknown
  onChange: (key: string, value: unknown) => void
}

function PropField({ fieldKey, field, value, onChange }: PropFieldProps) {
  if (field.kind === 'string') {
    return (
      <div>
        <label className={labelClass}>{field.label}</label>
        <input
          type="text"
          value={(value as string) ?? ''}
          onChange={e => onChange(fieldKey, e.target.value)}
          className={inputClass}
        />
      </div>
    )
  }

  if (field.kind === 'boolean') {
    return (
      <div className="flex items-center justify-between py-0.5">
        <label className={`${labelClass} mb-0`}>{field.label}</label>
        <button
          onClick={() => onChange(fieldKey, !value)}
          role="switch"
          aria-checked={!!value}
          className={`relative w-8 h-[18px] rounded-full transition-colors flex-shrink-0 ${
            value ? 'bg-blue-500' : 'bg-white/[0.12]'
          }`}
        >
          <span
            className={`absolute top-[2px] w-[14px] h-[14px] bg-white rounded-full shadow-sm transition-transform ${
              value ? 'translate-x-[18px]' : 'translate-x-[2px]'
            }`}
          />
        </button>
      </div>
    )
  }

  if (field.kind === 'number') {
    return (
      <div>
        <label className={labelClass}>{field.label}</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={(value as number) ?? 0}
            min={field.min}
            max={field.max}
            step={field.step}
            onChange={e => onChange(fieldKey, parseFloat(e.target.value))}
            className={inputClass}
          />
          {field.max !== undefined && (
            <span className="text-[10px] text-neutral-700 flex-shrink-0 whitespace-nowrap">
              {field.min}–{field.max}
            </span>
          )}
        </div>
      </div>
    )
  }

  if (field.kind === 'select') {
    return (
      <div>
        <label className={labelClass}>{field.label}</label>
        <select
          value={(value as string) ?? field.options[0]}
          onChange={e => {
            const raw = e.target.value
            onChange(fieldKey, fieldKey === 'columns' ? parseInt(raw, 10) : raw)
          }}
          className={inputClass}
        >
          {field.options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    )
  }

  if (field.kind === 'array') {
    return (
      <div>
        <label className={labelClass}>{field.label}</label>
        <div className="flex items-center gap-2 px-2.5 py-[6px] rounded-[5px] bg-white/[0.02] border border-white/[0.06]">
          <svg className="w-3 h-3 text-neutral-700 flex-shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 3h10M1 6h7M1 9h8" strokeLinecap="round" />
          </svg>
          <span className="text-[11px] text-neutral-600">{field.hint}</span>
        </div>
      </div>
    )
  }

  return null
}

// Divider between field groups
function Divider() {
  return <div className="h-px bg-white/[0.05] -mx-4" />
}

interface PropsPanelProps {
  selectedItem: CanvasItem | null
  onUpdateProp: (key: string, value: unknown) => void
}

export function PropsPanel({ selectedItem, onUpdateProp }: PropsPanelProps) {
  if (!selectedItem) {
    return (
      <aside className="w-[240px] bg-[#111111] border-l border-white/[0.07] flex flex-col flex-shrink-0">
        <div className="px-4 pt-4 pb-2 flex-shrink-0">
          <p className="text-[10px] uppercase tracking-[0.12em] text-neutral-600 font-semibold px-1">
            Properties
          </p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
            <svg className="w-4 h-4 text-neutral-700" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 5h12M2 8h8M2 11h10" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-[11px] text-neutral-700 text-center leading-relaxed">
            Select a component<br />to inspect properties
          </p>
        </div>
      </aside>
    )
  }

  const schema = propSchemaMap[selectedItem.type]
  const meta = COMPONENT_META[selectedItem.type]
  const entries = Object.entries(schema)

  return (
    <aside className="w-[240px] bg-[#111111] border-l border-white/[0.07] flex flex-col flex-shrink-0 overflow-y-auto">
      {/* Component header */}
      <div className="px-4 py-3.5 border-b border-white/[0.07] flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-[5px] bg-white/[0.07] flex items-center justify-center flex-shrink-0 border border-white/[0.08]">
            <span className="text-[9px] font-bold text-neutral-500 tracking-wide">{meta.abbr}</span>
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-neutral-200 leading-none">{meta.label}</p>
            <p className="text-[10px] text-neutral-600 mt-0.5 truncate">{meta.description}</p>
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="flex flex-col p-4 gap-4">
        {entries.map(([key, field], i) => (
          <div key={key}>
            <PropField
              fieldKey={key}
              field={field}
              value={selectedItem.props[key]}
              onChange={onUpdateProp}
            />
            {i < entries.length - 1 && field.kind !== 'boolean' && entries[i + 1]?.[1].kind === 'boolean' && (
              <Divider />
            )}
          </div>
        ))}
      </div>
    </aside>
  )
}
