import type { Feature } from './types'

export interface FeatureSectionProps {
  heading: string
  features: Feature[]
}

export const defaultProps: FeatureSectionProps = {
  heading: 'Our Promise',
  features: [
    { icon: '→', title: 'Complimentary Shipping', description: 'On all orders over £350, worldwide.' },
    { icon: '○', title: 'Easy Returns', description: 'Thirty days, no questions asked.' },
    { icon: '◇', title: 'Sustainable Materials', description: 'Responsible sourcing throughout.' },
    { icon: '∞', title: 'Lifetime Care', description: 'Repair and restoration for all pieces.' },
  ],
}

function FeatureCard({ feature, isLast }: { feature: Feature; isLast: boolean }) {
  return (
    <div className={`flex flex-col gap-4 px-0 md:px-8 first:pl-0 ${isLast ? '' : 'border-b md:border-b-0 md:border-r border-neutral-200 pb-8 md:pb-0'}`}>
      <span className="text-2xl text-neutral-400">{feature.icon}</span>
      <p className="text-xs tracking-widest uppercase text-neutral-950">{feature.title}</p>
      <p className="text-sm font-light text-zinc-500 leading-relaxed">{feature.description}</p>
    </div>
  )
}

export default function FeatureSection({ heading, features }: FeatureSectionProps) {
  const gridCols = features.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'

  return (
    <section className="w-full bg-neutral-100 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {heading && (
          <p className="text-xs tracking-widest uppercase text-zinc-400 mb-12">{heading}</p>
        )}
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols} gap-8 md:gap-0`}>
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} isLast={index === features.length - 1} />
          ))}
        </div>
      </div>
    </section>
  )
}
