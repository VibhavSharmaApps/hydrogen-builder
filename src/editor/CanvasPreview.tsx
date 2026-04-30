import type { CanvasItem } from './types'
import type { ComponentType } from '../codegen/types'

function PreviewAnnouncementBar({ props }: { props: Record<string, unknown> }) {
  const bg = (props.backgroundColor as string) || 'bg-neutral-950'
  return (
    <div className={`w-full py-2.5 px-4 flex items-center justify-center relative ${bg}`}>
      <p className="text-xs tracking-widest uppercase text-neutral-100 truncate max-w-lg">
        {(props.text as string) || 'Announcement text'}
      </p>
      {!!(props.dismissible) && <span className="absolute right-4 text-neutral-400 text-sm">×</span>}
    </div>
  )
}

function PreviewNavigation({ props }: { props: Record<string, unknown> }) {
  return (
    <div className="w-full bg-white border-b border-neutral-100 px-6 h-14 flex items-center justify-between">
      <span className="text-xs font-medium tracking-widest text-neutral-950">
        {(props.logo as string) || 'LOGO'}
      </span>
      <div className="flex gap-6">
        {['Women', 'Men', 'New Arrivals', 'Sale'].map(label => (
          <span key={label} className="text-xs tracking-widest text-neutral-600">{label}</span>
        ))}
      </div>
    </div>
  )
}

function PreviewHeroSection({ props }: { props: Record<string, unknown> }) {
  if ((props.variant as string) === 'split') {
    return (
      <div className="w-full flex h-52">
        <div className="w-1/2 bg-neutral-800 relative overflow-hidden">
          {!!(props.backgroundImage) && (
            <img src={props.backgroundImage as string} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
          )}
        </div>
        <div className="w-1/2 bg-neutral-100 flex flex-col justify-center px-8 gap-3">
          <p className="text-xs tracking-widest uppercase text-zinc-400 truncate">{props.subheading as string}</p>
          <p className="text-xl font-thin text-neutral-950 leading-tight truncate">{props.heading as string}</p>
          <div className="self-start border border-neutral-950 px-5 py-2 text-xs tracking-widest text-neutral-950">
            {props.ctaText as string}
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="w-full h-52 bg-neutral-800 relative overflow-hidden">
      {!!(props.backgroundImage) && (
        <img src={props.backgroundImage as string} alt="" className="absolute inset-0 w-full h-full object-cover" />
      )}
      <div className="absolute inset-0 bg-neutral-950" style={{ opacity: (props.overlayOpacity as number) ?? 0.25 }} />
      <div className="absolute bottom-6 left-8 flex flex-col gap-2">
        <p className="text-xs tracking-widest uppercase text-neutral-300 truncate">{props.subheading as string}</p>
        <p className="text-2xl font-thin text-white leading-tight max-w-xs truncate">{props.heading as string}</p>
        <div className="self-start border border-white px-5 py-2 text-xs tracking-widest text-white">
          {props.ctaText as string}
        </div>
      </div>
    </div>
  )
}

function PreviewFeatureSection({ props }: { props: Record<string, unknown> }) {
  return (
    <div className="w-full bg-neutral-100 py-8 px-8">
      {!!(props.heading) && (
        <p className="text-xs tracking-widest uppercase text-zinc-400 mb-6">{props.heading as string}</p>
      )}
      <div className="grid grid-cols-4 gap-6">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="flex flex-col gap-2">
            <div className="w-5 h-5 bg-neutral-300 rounded-sm" />
            <div className="h-2 bg-neutral-300 rounded w-3/4" />
            <div className="h-2 bg-neutral-200 rounded w-full" />
            <div className="h-2 bg-neutral-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    </div>
  )
}

function PreviewProductGrid({ props }: { props: Record<string, unknown> }) {
  const cols = Number(props.columns) || 3
  const gridClass = cols === 2 ? 'grid-cols-2' : cols === 4 ? 'grid-cols-4' : 'grid-cols-3'
  const count = Math.min(Number(props.productsPerPage) || 3, cols)
  return (
    <div className="w-full py-8 px-8 bg-white">
      <div className={`grid ${gridClass} gap-4`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i}>
            <div className="bg-neutral-100 aspect-[3/4] rounded-sm" />
            <div className="mt-2 h-2 bg-neutral-200 rounded w-3/4" />
            <div className="mt-1 h-2 bg-neutral-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}

function PreviewCTABlock({ props }: { props: Record<string, unknown> }) {
  const bg = (props.backgroundColor as string) || 'bg-neutral-100'
  return (
    <div className={`w-full py-12 px-6 ${bg} flex flex-col items-center gap-4 text-center`}>
      <p className="text-xl font-thin text-neutral-950 max-w-xs truncate">{props.heading as string}</p>
      <p className="text-xs text-zinc-500 max-w-xs truncate">{props.body as string}</p>
      <div className="border border-neutral-950 px-6 py-2 text-xs tracking-widest uppercase text-neutral-950">
        {props.buttonText as string}
      </div>
    </div>
  )
}

function PreviewFooter() {
  return (
    <div className="w-full bg-neutral-950 py-8 px-8">
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="flex flex-col gap-2">
          <div className="h-2.5 bg-neutral-600 rounded w-14 mb-1" />
          <div className="h-2 bg-neutral-800 rounded w-5" />
          <div className="h-2 bg-neutral-800 rounded w-5" />
        </div>
        {[0, 1, 2].map(i => (
          <div key={i} className="flex flex-col gap-2">
            <div className="h-2 bg-neutral-600 rounded w-12 mb-1" />
            <div className="h-2 bg-neutral-800 rounded w-14" />
            <div className="h-2 bg-neutral-800 rounded w-10" />
            <div className="h-2 bg-neutral-800 rounded w-12" />
          </div>
        ))}
      </div>
      <div className="border-t border-neutral-800 pt-4 flex items-center gap-4">
        <div className="h-6 bg-neutral-800 rounded flex-1" />
        <div className="h-6 bg-neutral-700 rounded w-20 flex-shrink-0" />
      </div>
    </div>
  )
}

function PreviewProductDetail({ props }: { props: Record<string, unknown> }) {
  const isStack = (props.layout as string) === 'stacked'
  return (
    <div className={`w-full py-6 px-8 bg-white flex ${isStack ? 'flex-col' : 'flex-row'} gap-8`}>
      <div className={`${isStack ? 'w-full' : 'w-1/2'} bg-neutral-100 aspect-[3/4] rounded-sm flex-shrink-0`} />
      <div className={`${isStack ? 'w-full' : 'w-1/2'} flex flex-col gap-3 py-2`}>
        <div className="h-5 bg-neutral-200 rounded w-3/4" />
        <div className="h-3 bg-neutral-100 rounded w-1/4" />
        <div className="flex gap-2 mt-2">
          {['XS', 'S', 'M', 'L'].map(s => (
            <div key={s} className="w-8 h-8 border border-neutral-200 flex items-center justify-center text-xs text-neutral-400">{s}</div>
          ))}
        </div>
        <div className="h-10 bg-neutral-950 rounded-sm w-40 mt-1" />
      </div>
    </div>
  )
}

const PREVIEW_MAP: Record<ComponentType, (props: Record<string, unknown>) => JSX.Element> = {
  AnnouncementBar: p => <PreviewAnnouncementBar props={p} />,
  Navigation: p => <PreviewNavigation props={p} />,
  HeroSection: p => <PreviewHeroSection props={p} />,
  FeatureSection: p => <PreviewFeatureSection props={p} />,
  ProductGrid: p => <PreviewProductGrid props={p} />,
  CTABlock: p => <PreviewCTABlock props={p} />,
  Footer: () => <PreviewFooter />,
  ProductDetail: p => <PreviewProductDetail props={p} />,
}

export function CanvasPreview({ item }: { item: CanvasItem }) {
  const renderer = PREVIEW_MAP[item.type]
  return renderer
    ? renderer(item.props)
    : <div className="h-16 bg-neutral-100 flex items-center justify-center text-xs text-neutral-400">{item.type}</div>
}
