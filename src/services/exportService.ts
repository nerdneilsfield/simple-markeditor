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

  private async captureHighQualityContent(
    element: HTMLElement
  ): Promise<HTMLCanvasElement> {
    // High-quality HTML to canvas conversion
    return html2canvas(element, {
      allowTaint: true,
      useCORS: true,
      scale: 2, // Higher resolution
      logging: false,
      backgroundColor: '#ffffff',
      removeContainer: true,
      imageTimeout: 0,
      onclone: clonedDoc => {
        // Ensure all styles are applied correctly
        const clonedElement = clonedDoc.body
        clonedElement.style.padding = '20px'
        clonedElement.style.fontFamily = 'system-ui, -apple-system, sans-serif'
        clonedElement.style.lineHeight = '1.6'
        clonedElement.style.color = '#000000'

        // Fix any display issues
        const elements = clonedElement.querySelectorAll('*')
        elements.forEach(el => {
          const htmlEl = el as HTMLElement
          if (
            htmlEl.style.color === 'white' ||
            htmlEl.style.color === '#ffffff'
          ) {
            htmlEl.style.color = '#000000'
          }
        })
      },
    })
  }

  private getPageSizeDimensions(pageSize: string, orientation: string) {
    const sizes = {
      A4: orientation === 'portrait' ? [210, 297] : [297, 210],
      A3: orientation === 'portrait' ? [297, 420] : [420, 297],
      Letter: orientation === 'portrait' ? [216, 279] : [279, 216],
      Legal: orientation === 'portrait' ? [216, 356] : [356, 216],
    }
    return sizes[pageSize as keyof typeof sizes] || sizes.A4
  }

  async exportToPDF(options: ExportOptions = {}): Promise<ExportResult> {
    try {
      const iframeDoc = this.getIframeContent()
      if (!iframeDoc) {
        throw new Error('Preview content not available')
      }

      const {
        quality = 'high',
        pageSize = 'A4',
        orientation = 'portrait',
        margins = { top: 20, right: 20, bottom: 20, left: 20 },
        filename = 'document.pdf',
      } = options

      // Get page dimensions
      const [pageWidth, pageHeight] = this.getPageSizeDimensions(
        pageSize,
        orientation
      )

      // Create PDF document
      const pdf = new jsPDF({
        orientation: orientation as 'portrait' | 'landscape',
        unit: 'mm',
        format: pageSize.toLowerCase() as 'a4' | 'letter' | 'legal',
      })

      // Get content element
      const contentElement = iframeDoc.body
      if (!contentElement) {
        throw new Error('No content to export')
      }

      // Set up content for capture
      const originalWidth = contentElement.style.width
      const originalPadding = contentElement.style.padding

      // Temporarily adjust content for better PDF rendering
      contentElement.style.width = `${pageWidth - margins.left - margins.right}mm`
      contentElement.style.padding = '20px'
      contentElement.style.backgroundColor = '#ffffff'

      // Capture content as canvas
      const canvas = await this.captureHighQualityContent(contentElement)

      // Restore original styles
      contentElement.style.width = originalWidth
      contentElement.style.padding = originalPadding

      // Calculate dimensions for PDF
      const imgWidth = pageWidth - margins.left - margins.right
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      const pageContentHeight = pageHeight - margins.top - margins.bottom

      // Add content to PDF (handle multi-page if needed)
      let yPosition = margins.top
      let remainingHeight = imgHeight
      let sourceY = 0

      while (remainingHeight > 0) {
        const currentPageHeight = Math.min(remainingHeight, pageContentHeight)
        const currentSourceHeight =
          (currentPageHeight * canvas.height) / imgHeight

        // Create a temporary canvas for this page
        const pageCanvas = document.createElement('canvas')
        const pageCtx = pageCanvas.getContext('2d')!
        pageCanvas.width = canvas.width
        pageCanvas.height = currentSourceHeight

        // Draw the portion of the original canvas for this page
        pageCtx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          currentSourceHeight,
          0,
          0,
          canvas.width,
          currentSourceHeight
        )

        // Add image to PDF
        const pageDataUrl = pageCanvas.toDataURL(
          'image/jpeg',
          quality === 'high' ? 0.95 : quality === 'medium' ? 0.8 : 0.65
        )
        pdf.addImage(
          pageDataUrl,
          'JPEG',
          margins.left,
          yPosition,
          imgWidth,
          currentPageHeight
        )

        remainingHeight -= currentPageHeight
        sourceY += currentSourceHeight

        // Add new page if there's more content
        if (remainingHeight > 0) {
          pdf.addPage()
          yPosition = margins.top
        }
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
