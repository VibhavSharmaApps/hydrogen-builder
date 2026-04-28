import { useState } from 'react'

export interface ProductDetailProps {
  layout: 'stacked' | 'side-by-side'
  showReviewsPlaceholder: boolean
  showRelated: boolean
}

export const defaultProps: ProductDetailProps = {
  layout: 'side-by-side',
  showReviewsPlaceholder: true,
  showRelated: true,
}

const MOCK_PRODUCT = {
  title: 'Cashmere Wrap Coat',
  price: '£2,450',
  description: 'Crafted in double-faced cashmere, this wrap coat exemplifies considered construction. The belt is removable; the silhouette, permanent.',
  images: [
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800',
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800',
  ],
  sizes: ['XS', 'S', 'M', 'L'],
}

const RELATED = [
  { title: 'Wool Midi Skirt', price: '£680', imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400', handle: 'wool-midi-skirt' },
  { title: 'Silk Blouse', price: '£420', imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400', handle: 'silk-blouse' },
]

export default function ProductDetail({ layout, showReviewsPlaceholder, showRelated }: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState(0)

  const wrapperClass = layout === 'side-by-side'
    ? 'flex flex-col md:flex-row gap-8 md:gap-16'
    : 'flex flex-col gap-10'

  const mainImage = MOCK_PRODUCT.images[activeImage] ?? MOCK_PRODUCT.images[0]

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className={wrapperClass}>
        {/* Images */}
        <div className="w-full md:w-1/2">
          <div className="aspect-[3/4] overflow-hidden bg-neutral-100">
            <img src={mainImage} alt={MOCK_PRODUCT.title} className="w-full h-full object-cover" />
          </div>
          <div className="mt-3 flex gap-2">
            {MOCK_PRODUCT.images.map((img, i) => (
              <button key={img} onClick={() => setActiveImage(i)} className={`w-16 h-20 overflow-hidden border-2 transition-colors ${activeImage === i ? 'border-neutral-950' : 'border-transparent'}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="w-full md:w-1/2 flex flex-col gap-6 md:pt-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-thin text-neutral-950 tracking-tight">{MOCK_PRODUCT.title}</h1>
            <p className="mt-2 text-sm text-zinc-400">{MOCK_PRODUCT.price}</p>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-xs tracking-widest uppercase text-zinc-400">Select Size</p>
            <div className="flex flex-wrap gap-2">
              {MOCK_PRODUCT.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-10 h-10 flex items-center justify-center text-xs tracking-wide border transition-colors ${selectedSize === size ? 'border-neutral-950 bg-neutral-950 text-white' : 'border-neutral-200 text-neutral-950 hover:border-neutral-950'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          <button className="w-full md:max-w-xs border border-neutral-950 bg-neutral-950 text-white py-4 text-xs tracking-widest uppercase hover:bg-white hover:text-neutral-950 transition-colors duration-300">
            Add to Bag
          </button>
          <p className="text-sm font-light text-zinc-500 leading-relaxed max-w-md">{MOCK_PRODUCT.description}</p>
        </div>
      </div>

      {showReviewsPlaceholder && (
        <div className="mt-16 pt-12 border-t border-neutral-100">
          <p className="text-xs tracking-widest uppercase text-zinc-400 mb-6">Reviews</p>
          <div className="flex flex-col gap-4 max-w-lg">
            <div className="bg-neutral-100 h-4 rounded w-3/4" />
            <div className="bg-neutral-100 h-4 rounded w-full" />
            <div className="bg-neutral-100 h-4 rounded w-2/3" />
          </div>
        </div>
      )}

      {showRelated && (
        <div className="mt-16 pt-12 border-t border-neutral-100">
          <p className="text-xs tracking-widest uppercase text-zinc-400 mb-8">You May Also Like</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {RELATED.map((item) => (
              <a key={item.handle} href={`/products/${item.handle}`} className="group">
                <div className="aspect-[3/4] overflow-hidden bg-neutral-100">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <p className="mt-3 text-xs tracking-wide text-neutral-950">{item.title}</p>
                <p className="mt-1 text-xs text-zinc-400">{item.price}</p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
