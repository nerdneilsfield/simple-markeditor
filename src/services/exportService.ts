// Export service for multiple format support (PDF, ePub, etc.)
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export interface ExportOptions {
  format?: 'pdf' | 'epub' | 'docx' | 'print'
  quality?: 'high' | 'medium' | 'low'
  pageSize?: 'A4' | 'A3' | 'Letter' | 'Legal'
  orientation?: 'portrait' | 'landscape'
  margins?: {
    top: number
    right: number
    bottom: number
    left: number
  }
  includeTOC?: boolean
  filename?: string
}

export interface ExportResult {
  success: boolean
  message: string
  downloadUrl?: string
}

class ExportService {
  private getIframeContent(): Document | null {
    const iframe = document.querySelector('iframe') as HTMLIFrameElement
    if (!iframe) return null

    return iframe.contentDocument || iframe.contentWindow?.document || null
  }

  private getPageSizeDimensions(pageSize: string, orientation: string) {
    // Return dimensions in mm
    const sizes = {
      A4: orientation === 'portrait' ? [210, 297] : [297, 210],
      A3: orientation === 'portrait' ? [297, 420] : [420, 297],
      Letter: orientation === 'portrait' ? [216, 279] : [279, 216],
      Legal: orientation === 'portrait' ? [216, 356] : [356, 216],
    }
    return sizes[pageSize as keyof typeof sizes] || sizes.A4
  }

  private mmToPx(mm: number, dpi: number = 96): number {
    // Convert mm to pixels: 1 inch = 25.4 mm, 1 inch = dpi pixels
    return (mm * dpi) / 25.4
  }

  private resizeContentForPDF(
    contentElement: HTMLElement,
    pageWidthMm: number,
    _pageHeightMm: number,
    margins: { top: number; right: number; bottom: number; left: number }
  ) {
    const originalStyles = {
      width: contentElement.style.width,
      padding: contentElement.style.padding,
      fontSize: contentElement.style.fontSize,
      lineHeight: contentElement.style.lineHeight,
      transform: contentElement.style.transform,
    }

    // Convert mm to pixels for calculations (use 96 DPI as standard)
    const dpi = 96
    const pageWidthPx = this.mmToPx(pageWidthMm, dpi)
    const marginsLeftRightPx = this.mmToPx(margins.left + margins.right, dpi)
    const availableWidthPx = pageWidthPx - marginsLeftRightPx

    // Get current content width
    const currentContentWidth = contentElement.scrollWidth || contentElement.clientWidth

    // Calculate scale factor to fit content in available width
    const scaleFactor = Math.min(availableWidthPx / currentContentWidth, 1.0)

    // Apply scaling and size adjustments
    contentElement.style.transform = `scale(${scaleFactor})`
    contentElement.style.transformOrigin = 'top left'
    contentElement.style.width = `${availableWidthPx}px`
    contentElement.style.maxWidth = `${availableWidthPx}px`

    // Adjust typography for better PDF rendering
    contentElement.style.fontSize = '14px'
    contentElement.style.lineHeight = '1.6'
    contentElement.style.overflow = 'visible'

    return originalStyles
  }

  private restoreContentStyles(
    contentElement: HTMLElement,
    originalStyles: { 
      width: string; 
      padding: string; 
      fontSize: string; 
      lineHeight: string;
      transform: string;
    }
  ) {
    contentElement.style.width = originalStyles.width
    contentElement.style.padding = originalStyles.padding
    contentElement.style.fontSize = originalStyles.fontSize
    contentElement.style.lineHeight = originalStyles.lineHeight
    contentElement.style.transform = originalStyles.transform
    contentElement.style.maxWidth = ''
    contentElement.style.overflow = ''
  }

  private async captureContentInSections(
    contentElement: HTMLElement,
    pageContentHeight: number,
    pageWidthPx: number,
    margins: { top: number; right: number; bottom: number; left: number }
  ): Promise<HTMLCanvasElement[]> {
    const sections: HTMLCanvasElement[] = []
    let currentY = 0
    const totalHeight = contentElement.scrollHeight

    // Ensure content is ready and visible
    if (!contentElement || totalHeight === 0) {
      throw new Error('Unable to find element in cloned iframe')
    }

    // Convert margin values to pixels for calculations
    const dpi = 96
    const marginsLeftRightPx = this.mmToPx(margins.left + margins.right, dpi)
    const availableWidthPx = pageWidthPx - marginsLeftRightPx

    while (currentY < totalHeight) {
      // Create a clipping mask for the current section
      const clipHeight = Math.min(pageContentHeight, totalHeight - currentY)
      
      try {
        // Capture the current section using viewport clipping
        const canvas = await html2canvas(contentElement, {
          allowTaint: true,
          useCORS: true,
          scale: 1.5, // Reduced scale for better performance
          logging: false,
          backgroundColor: '#ffffff',
          y: currentY,
          height: clipHeight,
          width: availableWidthPx,
          windowHeight: clipHeight,
          removeContainer: false,
          onclone: (clonedDoc) => {
            try {
              const clonedBody = clonedDoc.body
              if (clonedBody) {
                clonedBody.style.padding = '0'
                clonedBody.style.margin = '0'
                clonedBody.style.width = `${availableWidthPx}px`
                clonedBody.style.overflow = 'visible'
                
                // Ensure all content is visible
                const allElements = clonedBody.querySelectorAll('*')
                allElements.forEach(el => {
                  const htmlEl = el as HTMLElement
                  if (htmlEl.style.display === 'none') {
                    htmlEl.style.display = 'block'
                  }
                })
              }
            } catch (err) {
              console.warn('Error in onclone callback:', err)
            }
          }
        })
        
        sections.push(canvas)
      } catch (error) {
        console.error(`Error capturing section at y=${currentY}:`, error)
        // Create a fallback canvas with error message
        const fallbackCanvas = document.createElement('canvas')
        fallbackCanvas.width = availableWidthPx
        fallbackCanvas.height = clipHeight
        const ctx = fallbackCanvas.getContext('2d')
        if (ctx) {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, fallbackCanvas.width, fallbackCanvas.height)
          ctx.fillStyle = '#000000'
          ctx.font = '16px Arial'
          ctx.fillText('Error rendering this section', 20, 40)
        }
        sections.push(fallbackCanvas)
      }
      
      currentY += clipHeight
    }

    return sections
  }

  async exportToPDF(options: ExportOptions = {}): Promise<ExportResult> {
    try {
      const iframeDoc = this.getIframeContent()
      if (!iframeDoc) {
        throw new Error('Preview content not available')
      }

      // Wait for iframe content to be fully loaded
      await new Promise(resolve => setTimeout(resolve, 1000))

      const {
        quality = 'high',
        pageSize = 'A4',
        orientation = 'portrait',
        margins = { top: 20, right: 20, bottom: 20, left: 20 },
        filename = 'document.pdf',
      } = options

      // Get page dimensions
      const [pageWidthMm, pageHeightMm] = this.getPageSizeDimensions(
        pageSize,
        orientation
      )

      // Convert mm to pixels for calculations (use 96 DPI as standard)
      const dpi = 96
      const pageWidthPx = this.mmToPx(pageWidthMm, dpi)
      const pageHeightPx = this.mmToPx(pageHeightMm, dpi)

      // Create PDF document
      const pdf = new jsPDF({
        orientation: orientation as 'portrait' | 'landscape',
        unit: 'mm',
        format: pageSize.toLowerCase() as 'a4' | 'letter' | 'legal',
      })

      // Get content element with better validation
      const contentElement = iframeDoc.body
      if (!contentElement) {
        throw new Error('No content to export')
      }

      // Ensure content is rendered and visible
      if (contentElement.scrollHeight === 0 || contentElement.clientHeight === 0) {
        throw new Error('Content not ready for export. Please wait for the preview to load completely.')
      }

      // Save original styles and resize content for PDF
      const originalStyles = this.resizeContentForPDF(
        contentElement,
        pageWidthMm,
        pageHeightMm,
        margins
      )

      // Wait a bit for styles to be applied
      await new Promise(resolve => setTimeout(resolve, 500))

      // Capture content in sections to avoid splitting elements
      const pageContentHeight = pageHeightPx - this.mmToPx(margins.top + margins.bottom, dpi)
      const sections = await this.captureContentInSections(
        contentElement,
        pageContentHeight,
        pageWidthPx,
        margins
      )

      // Restore original styles
      this.restoreContentStyles(contentElement, originalStyles)

      if (sections.length === 0) {
        throw new Error('Unable to capture content for PDF export')
      }

      // Add sections to PDF
      for (let i = 0; i < sections.length; i++) {
        if (i > 0) {
          pdf.addPage()
        }

        const canvas = sections[i]
        // Use mm units for PDF (jsPDF expects mm)
        const imgWidthMm = pageWidthMm - margins.left - margins.right
        const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width

        pdf.addImage(
          canvas.toDataURL('image/jpeg', quality === 'high' ? 0.95 : quality === 'medium' ? 0.8 : 0.65),
          'JPEG',
          margins.left,
          margins.top,
          imgWidthMm,
          imgHeightMm
        )
      }

      // Add metadata
      pdf.setProperties({
        title: filename.replace('.pdf', ''),
        subject: 'Exported from Simple Markdown Editor',
        author: 'Simple Markdown Editor',
        creator: 'Simple Markdown Editor',
      })

      // Save the PDF
      pdf.save(filename)

      return {
        success: true,
        message: 'PDF exported successfully',
      }
    } catch (error) {
      console.error('PDF export error:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'PDF export failed',
      }
    }
  }

  async exportForEReader(options: ExportOptions = {}): Promise<ExportResult> {
    // Optimized for e-readers (smaller file size, better text flow)
    return this.exportToPDF({
      ...options,
      pageSize: 'A4',
      orientation: 'portrait',
      quality: 'medium',
      margins: { top: 15, right: 15, bottom: 15, left: 15 },
    })
  }

  async exportForMobile(options: ExportOptions = {}): Promise<ExportResult> {
    // Optimized for mobile viewing
    return this.exportToPDF({
      ...options,
      pageSize: 'A4',
      orientation: 'portrait',
      quality: 'medium',
      margins: { top: 10, right: 10, bottom: 10, left: 10 },
    })
  }

  async exportForDesktop(options: ExportOptions = {}): Promise<ExportResult> {
    // High-quality desktop version
    return this.exportToPDF({
      ...options,
      pageSize: 'A4',
      orientation: 'portrait',
      quality: 'high',
      margins: { top: 25, right: 25, bottom: 25, left: 25 },
    })
  }

  async exportForPrint(): Promise<ExportResult> {
    try {
      const iframeDoc = this.getIframeContent()
      if (!iframeDoc) {
        throw new Error('Preview content not available')
      }

      // Create a new window for printing
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        throw new Error(
          'Unable to open print window. Please check your browser settings.'
        )
      }

      // Get the iframe's HTML content
      const iframeHTML = iframeDoc.documentElement.outerHTML

      // Enhance HTML with print-specific styles
      const enhancedHTML = iframeHTML.replace(
        '</head>',
        `
        <style>
          @media print {
            body { 
              margin: 0;
              padding: 20px;
              font-size: 12pt;
              line-height: 1.5;
              color: #000 !important;
              background: #fff !important;
            }
            * {
              color: #000 !important;
              background: #fff !important;
            }
            .mermaid-container {
              break-inside: avoid;
              page-break-inside: avoid;
            }
            h1, h2, h3, h4, h5, h6 {
              page-break-after: avoid;
              break-after: avoid;
            }
            pre, blockquote {
              page-break-inside: avoid;
              break-inside: avoid;
            }
          }
        </style>
        </head>`
      )

      // Write the content to the new window
      printWindow.document.write(enhancedHTML)
      printWindow.document.close()

      // Wait for content to load, then print
      printWindow.onload = () => {
        window.setTimeout(() => {
          printWindow.focus()
          printWindow.print()
          printWindow.close()
        }, 500)
      }

      return {
        success: true,
        message: 'Print dialog opened',
      }
    } catch (error) {
      console.error('Print error:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Print failed',
      }
    }
  }

  async exportWithFormat(
    format: ExportOptions['format'],
    options: ExportOptions = {}
  ): Promise<ExportResult> {
    switch (format) {
      case 'pdf':
        return this.exportForDesktop(options)
      case 'print':
        return this.exportForPrint()
      case 'epub':
        // Future implementation for ePub format
        return {
          success: false,
          message: 'ePub export coming soon',
        }
      case 'docx':
        // Future implementation for Word format
        return {
          success: false,
          message: 'Word export coming soon',
        }
      default:
        return {
          success: false,
          message: 'Unsupported export format',
        }
    }
  }
}

export const exportService = new ExportService()
