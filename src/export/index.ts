import JSZip from 'jszip'
import type { ProjectFiles } from '../codegen/types'

export async function zipProject(files: ProjectFiles): Promise<Blob> {
  const zip = new JSZip()
  for (const [filePath, content] of Object.entries(files)) {
    zip.file(filePath, content)
  }
  return zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })
}

export function downloadProject(blob: Blob, storeName: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = storeName.toLowerCase().replace(/\s+/g, '-') + '-hydrogen.zip'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
