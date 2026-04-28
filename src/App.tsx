import AnnouncementBar, { defaultProps as ab } from './templates/AnnouncementBar'
import Navigation, { defaultProps as nav } from './templates/Navigation'
import HeroSection, { defaultProps as hero } from './templates/HeroSection'
import FeatureSection, { defaultProps as feat } from './templates/FeatureSection'
import ProductGrid, { defaultProps as grid } from './templates/ProductGrid'
import CTABlock, { defaultProps as cta } from './templates/CTABlock'
import ProductDetail, { defaultProps as detail } from './templates/ProductDetail'
import Footer, { defaultProps as footer } from './templates/Footer'

export default function App() {
  return (
    <div className="min-h-screen">
      <AnnouncementBar {...ab} />
      <Navigation {...nav} />
      <HeroSection {...hero} />
      <FeatureSection {...feat} />
      <ProductGrid {...grid} />
      <CTABlock {...cta} />
      <ProductDetail {...detail} />
      <Footer {...footer} />
    </div>
  )
}
