// Adapted ProductDetail for generated Hydrogen projects.
// Changes from builder template:
//   - Added HydrogenProduct type + product? prop
//   - Theme import added; all hardcoded colours replaced with theme references
//   - "Add to Bag" button wrapped in CartForm for real cart integration
//   - Sizes/images/title/price read from live product data with mock fallbacks
//   - String concat used for dynamic classNames (no template literals)
export const ADAPTED_PRODUCT_DETAIL = `import { useState } from 'react'
import { CartForm } from '@shopify/hydrogen'
import { theme } from '~/config/theme'

interface HydrogenVariant {
  id: string
  title: string
  availableForSale: boolean
  selectedOptions: { name: string; value: string }[]
  price: { amount: string; currencyCode: string }
}

interface HydrogenImage {
  url: string
  altText: string | null
  width?: number
  height?: number
}

interface HydrogenProduct {
  id: string
  title: string
  descriptionHtml: string
  handle: string
  variants: { nodes: HydrogenVariant[] }
  images: { nodes: HydrogenImage[] }
  options: { name: string; values: string[] }[]
}

export interface ProductDetailProps {
  layout: 'stacked' | 'side-by-side'
  showReviewsPlaceholder: boolean
  showRelated: boolean
  product?: HydrogenProduct
}

export const defaultProps: ProductDetailProps = {
  layout: 'side-by-side',
  showReviewsPlaceholder: true,
  showRelated: true,
}

const MOCK_PRODUCT = {
  title: 'Cashmere Wrap Coat',
  price: 'From £2,450',
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

export default function ProductDetail({ layout, showReviewsPlaceholder, showRelated, product }: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState(0)

  const wrapperClass = layout === 'side-by-side'
    ? 'flex flex-col md:flex-row gap-8 md:gap-16'
    : 'flex flex-col gap-10'

  const images = product?.images.nodes ?? MOCK_PRODUCT.images.map((url) => ({ url, altText: null }))
  const mainImage = images[activeImage] ?? images[0]
  const title = product?.title ?? MOCK_PRODUCT.title
  const sizes = product?.options.find((o) => o.name === 'Size')?.values ?? MOCK_PRODUCT.sizes

  const selectedVariant = selectedSize
    ? product?.variants.nodes.find((v) => v.selectedOptions.some((o) => o.name === 'Size' && o.value === selectedSize))
    : product?.variants.nodes[0]

  const priceDisplay = selectedVariant
    ? selectedVariant.price.currencyCode + ' ' + selectedVariant.price.amount
    : MOCK_PRODUCT.price

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className={wrapperClass}>
        <div className="w-full md:w-1/2">
          <div className={'aspect-[3/4] overflow-hidden ' + theme.bg.light}>
            <img src={mainImage.url} alt={mainImage.altText ?? title} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((img, i) => (
                <button
                  key={img.url}
                  onClick={() => setActiveImage(i)}
                  className={'w-16 h-20 overflow-hidden border-2 transition-colors ' + (activeImage === i ? theme.border.primary : 'border-transparent')}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-full md:w-1/2 flex flex-col gap-6 md:pt-8">
          <div>
            <h1 className={'text-3xl md:text-4xl tracking-tight ' + theme.font.heading + ' ' + theme.text.primary}>{title}</h1>
            <p className={'mt-2 text-sm ' + theme.text.accent}>{priceDisplay}</p>
          </div>
          <div className="flex flex-col gap-3">
            <p className={'text-xs tracking-widest uppercase ' + theme.text.accent}>Select Size</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={'w-10 h-10 flex items-center justify-center text-xs tracking-wide border transition-colors ' + (selectedSize === size ? theme.border.primary + ' ' + theme.bg.dark + ' ' + theme.text.white : theme.border.subtle + ' ' + theme.text.primary + ' ' + theme.hover.borderPrimary)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          {product ? (
            <CartForm
              route="/cart"
              action={CartForm.ACTIONS.LinesAdd}
              inputs={{ lines: [{ merchandiseId: selectedVariant?.id ?? '', quantity: 1 }] }}
            >
              <button
                type="submit"
                disabled={selectedVariant ? !selectedVariant.availableForSale : false}
                className={'w-full md:max-w-xs border py-4 text-xs tracking-widest uppercase transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed ' + theme.border.primary + ' ' + theme.bg.dark + ' ' + theme.text.white + ' ' + theme.hover.bgWhite + ' ' + theme.hover.textPrimary}
              >
                {selectedVariant?.availableForSale === false ? 'Sold Out' : 'Add to Bag'}
              </button>
            </CartForm>
          ) : (
            <button className={'w-full md:max-w-xs border py-4 text-xs tracking-widest uppercase transition-colors duration-300 ' + theme.border.primary + ' ' + theme.bg.dark + ' ' + theme.text.white + ' ' + theme.hover.bgWhite + ' ' + theme.hover.textPrimary}>
              Add to Bag
            </button>
          )}
          {product ? (
            <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} className={'text-sm leading-relaxed max-w-md ' + theme.font.body + ' ' + theme.text.body} />
          ) : (
            <p className={'text-sm leading-relaxed max-w-md ' + theme.font.body + ' ' + theme.text.body}>{MOCK_PRODUCT.description}</p>
          )}
        </div>
      </div>

      {showReviewsPlaceholder && (
        <div className={'mt-16 pt-12 border-t ' + theme.border.light}>
          <p className={'text-xs tracking-widest uppercase mb-6 ' + theme.text.accent}>Reviews</p>
          <div className="flex flex-col gap-4 max-w-lg">
            <div className={'h-4 rounded w-3/4 ' + theme.bg.light} />
            <div className={'h-4 rounded w-full ' + theme.bg.light} />
            <div className={'h-4 rounded w-2/3 ' + theme.bg.light} />
          </div>
        </div>
      )}

      {showRelated && (
        <div className={'mt-16 pt-12 border-t ' + theme.border.light}>
          <p className={'text-xs tracking-widest uppercase mb-8 ' + theme.text.accent}>You May Also Like</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {RELATED.map((item) => (
              <a key={item.handle} href={'/products/' + item.handle} className="group">
                <div className={'aspect-[3/4] overflow-hidden ' + theme.bg.light}>
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <p className={'mt-3 text-xs tracking-wide ' + theme.text.primary}>{item.title}</p>
                <p className={'mt-1 text-xs ' + theme.text.accent}>{item.price}</p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
`
