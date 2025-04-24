'use client'

import { usePathname, useRouter } from 'next/navigation'
import { memo, useEffect, useRef } from 'react'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

const LanguageChanger = memo(function LanguageChanger({
	locale,
	isTransparent
}) {
	const pathname = usePathname()
	const pathnameRef = useRef(pathname)

	useEffect(() => {
		pathnameRef.current = pathname
	}, [pathname])

	const router = useRouter()
	const LANGUAGES = {
		ru: 'RU',
		en: 'EN'
	}

	const handleLanguageChange = lang => {
		const newPathname = redirectedPathname(lang)
		router.replace(newPathname)
	}

	const redirectedPathname = locale => {
		const segments = pathnameRef.current.split('/')
		segments[1] = locale
		return segments.join('/')
	}

	return (
		<div className='sm:w-[80px] w-full h-full flex justify-center items-center -mt-1'>
			<Select
				value={locale}
				onValueChange={handleLanguageChange}>
				<SelectTrigger className="text-base border-none bg-transparent">
					<SelectValue />
				</SelectTrigger>
				<SelectContent className='min-w-0'>
					{Object.entries(LANGUAGES).map(([value, title]) =>
						<SelectItem key={value} value={value}
							className='text-base'>{title}</SelectItem>)}
				</SelectContent>
			</Select>
		</div>
	)
})
export default LanguageChanger
