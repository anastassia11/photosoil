import { useParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { getTranslation } from '@/i18n/client'

export default function CollapsibleText({ text, collapsedHeight = 170, className = '' }) {
	const [isExpanded, setIsExpanded] = useState(false)
	const [isOverflowing, setIsOverflowing] = useState(false)
	const { locale } = useParams()
	const { t } = getTranslation(locale)
	const contentRef = useRef(null)
	const buttonRef = useRef(null)

	useEffect(() => {
		const measure = () => {
			if (!contentRef.current) return
			const el = contentRef.current
			const fullHeight = el.scrollHeight
			setIsOverflowing(fullHeight > collapsedHeight)
		}
		measure()
		const onResize = () => measure()
		window.addEventListener('resize', onResize)
		return () => window.removeEventListener('resize', onResize)
	}, [text, collapsedHeight])

	const toggleExpand = () => {
		if (isExpanded) {
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
			setIsExpanded(true)
		}
	}

	return (
		<div className="w-full relative">
			<div
				ref={contentRef}
				className={className}
				style={{
					maxHeight: isExpanded ? 'none' : collapsedHeight,
					overflow: isExpanded ? 'visible' : 'hidden'
				}}
			>
				{text}
			</div>
			{/* removed visual overflow indicator */}
			{isOverflowing && (
				<button
					onClick={toggleExpand}
					className='text-blue-600 hover:underline'
					ref={buttonRef}
				>
					{isExpanded ? t('collapse') : t('expand')}
				</button>
			)}
		</div>
	)
}
