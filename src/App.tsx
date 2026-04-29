import AnnouncementBar, { defaultProps as ab } from './templates/AnnouncementBar'
import Navigation, { defaultProps as nav } from './templates/Navigation'
import HeroSection, { defaultProps as hero } from './templates/HeroSection'
import FeatureSection, { defaultProps as feat } from './templates/FeatureSection'
import ProductGrid, { defaultProps as grid } from './templates/ProductGrid'
import CTABlock, { defaultProps as cta } from './templates/CTABlock'
import ProductDetail, { defaultProps as detail } from './templates/ProductDetail'
import Footer, { defaultProps as footer } from './templates/Footer'
import { generateProject } from './codegen'
import { zipProject, downloadProject } from './export'

async function testExport() {
  const files = generateProject({
    storeName: 'Maison',
    pages: [
      {
        path: '/',
        components: [
          { type: 'HeroSection', props: { ...hero } },
          { type: 'FeatureSection', props: { ...feat } },
          { type: 'ProductGrid', props: { ...grid } },
          { type: 'CTABlock', props: { ...cta } },
        ],
      },
    ],
  })
  console.log('Generated files:', Object.keys(files))
  const blob = await zipProject(files)
  downloadProject(blob, 'Maison')
}

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
      <div className="fixed bottom-6 right-6">
        <button
          onClick={testExport}
          className="bg-neutral-950 text-white text-xs tracking-widest uppercase px-6 py-3 hover:bg-neutral-700 transition-colors shadow-lg"
        >
          Export Project
        </button>
      </div>
    </div>
  )
}
