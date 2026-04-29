import type { ProductItem } from '~/components/types'
import { theme } from '~/config/theme'

export interface ProductGridProps {
  columns: 2 | 3 | 4
  productsPerPage: number
  collectionHandle: string
  products?: ProductItem[]
}

export const defaultProps: ProductGridProps = {
  columns: 3,
  productsPerPage: 6,
  collectionHandle: 'new-arrivals',
}

const MOCK_PRODUCTS: ProductItem[] = [
  { title: 'Slip Dress No. 3', price: '£890', imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600', handle: 'slip-dress-no-3' },
  { title: 'Wide-Leg Trouser', price: '£650', imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600', handle: 'wide-leg-trouser' },
  { title: 'Cashmere Turtleneck', price: '£520', imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600', handle: 'cashmere-turtleneck' },
  { title: 'Structured Blazer', price: '£1,200', imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600', handle: 'structured-blazer' },
  { title: 'Linen Shirt Dress', price: '£480', imageUrl: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600', handle: 'linen-shirt-dress' },
  { title: 'Merino Knit', price: '£395', imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600', handle: 'merino-knit' },
]

const COL_CLASSES: Record<2 | 3 | 4, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-4',
}

function ProductCard({ product }: { product: ProductItem }) {
  return (
    <a href={`/products/${product.handle}`} className="group cursor-pointer">
      <div className={`relative overflow-hidden aspect-[3/4] ${theme.bg.light}`}>
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="mt-3 flex flex-col gap-1">
        <p className={`text-xs tracking-wide ${theme.text.primary}`}>{product.title}</p>
        <p className={`text-xs ${theme.text.accent}`}>{product.price}</p>
      </div>
    </a>
  )
}

export default function ProductGrid({ columns, productsPerPage, collectionHandle, products }: ProductGridProps) {
  const visibleProducts = (products ?? MOCK_PRODUCTS).slice(0, productsPerPage)

  return (
    <section className="w-full max-w-7xl mx-auto px-4 md:px-6 py-12" data-collection={collectionHandle}>
      <div className={`grid ${COL_CLASSES[columns]} gap-4 md:gap-6`}>
        {visibleProducts.map((product) => (
          <ProductCard key={product.handle} product={product} />
        ))}
      </div>
    </section>
  )
}
