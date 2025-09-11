'use client'

import React from 'react'
import { Clock, BookOpen } from 'lucide-react'

interface BlogContentProps {
  content: string
  readTime: string
}

export function BlogContent({ content, readTime }: BlogContentProps) {
  // Extract headings for table of contents
  const extractHeadings = (htmlContent: string) => {
    const headings: Array<{id: string, text: string, level: number}> = []
    
    // Only run on client side
    if (typeof window === 'undefined') return headings
    
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlContent, 'text/html')
    
    doc.querySelectorAll('h1, h2, h3, h4').forEach((heading, index) => {
      const text = heading.textContent || ''
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      heading.id = id
      headings.push({
        id,
        text,
        level: parseInt(heading.tagName.charAt(1))
      })
    })
    
    return headings
  }

  const [headings, setHeadings] = React.useState<Array<{id: string, text: string, level: number}>>([])
  
  React.useEffect(() => {
    setHeadings(extractHeadings(content))
  }, [content])
  
  // Process content to add IDs to headings
  const [processedContent, setProcessedContent] = React.useState(content)
  
  React.useEffect(() => {
    let processed = content
    headings.forEach(heading => {
      const headingRegex = new RegExp(`(<h${heading.level}[^>]*>)(${heading.text})(</h${heading.level}>)`, 'i')
      processed = processed.replace(headingRegex, `$1<a id="${heading.id}"></a>$2$3`)
    })
    setProcessedContent(processed)
  }, [content, headings])

  const scrollToHeading = (id: string) => {
    if (typeof window === 'undefined') return
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Table of Contents - Fixed on desktop */}
      {headings.length > 3 && (
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="toc bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border">
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-4 mt-0">
                <BookOpen className="h-5 w-5" />
                Table of Contents
              </h3>
              <ul className="space-y-2 mb-0">
                {headings.map((heading, index) => (
                  <li key={index} className={`${heading.level > 2 ? 'ml-4' : ''}`}>
                    <button
                      onClick={() => scrollToHeading(heading.id)}
                      className="text-left text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors text-sm leading-relaxed"
                    >
                      {heading.text}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{readTime}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={headings.length > 3 ? 'lg:col-span-3' : 'lg:col-span-4'}>
        <div 
          className="prose prose-lg prose-gray dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />
      </div>
    </div>
  )
}