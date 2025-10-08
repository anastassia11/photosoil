'use client'

import { useParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { getTranslation } from '@/i18n/client'

export default function CollapsibleHtml({ html, collapsedHeight = 170, className = '' }) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [isOverflowing, setIsOverflowing] = useState(false)
    const contentRef = useRef(null)
    const containerRef = useRef(null)
    const buttonRef = useRef(null)
    const { locale } = useParams()
    const { t } = getTranslation(locale)

    useEffect(() => {
        const measure = () => {
            if (!contentRef.current) return
            const el = contentRef.current
            // scrollHeight reflects full content height regardless of maxHeight
            const fullHeight = el.scrollHeight
            setIsOverflowing(fullHeight > collapsedHeight)
        }

        measure()

        const onResize = () => measure()
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [html, collapsedHeight])
    const toggle = () => {
        if (isExpanded) {
            // Only adjust scroll when collapsing
            const beforeTop = buttonRef.current?.getBoundingClientRect().top || 0
            setIsExpanded(false)
            requestAnimationFrame(() => {
                const afterTop = buttonRef.current?.getBoundingClientRect().top || 0
                const delta = afterTop - beforeTop
                if (delta !== 0) {
                    window.scrollBy({ top: delta, behavior: 'auto' })
                }
            })
        } else {
            // Expanding: do not change scroll position
            setIsExpanded(true)
        }
    }

    return (
        <div ref={containerRef} className="w-full relative">
            <div
                ref={contentRef}
                className={className}
                style={{
                    maxHeight: isExpanded ? 'none' : collapsedHeight,
                    overflow: isExpanded ? 'visible' : 'hidden'
                }}
                dangerouslySetInnerHTML={{ __html: html || '' }}
            />
            {/* removed visual overflow indicator */}
            {isOverflowing && (
                <button
                    type="button"
                    onClick={toggle}
                    className="text-blue-600 hover:underline"
                    ref={buttonRef}
                >
                    {isExpanded ? t('collapse') : t('expand')}
                </button>
            )}
        </div>
    )
}


