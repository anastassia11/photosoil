'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { memo, useEffect, useRef } from 'react'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

const LanguageChanger = memo(function LanguageChanger({
	locale,
	isTransparent
}) {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const pathnameRef = useRef(pathname)

	useEffect(() => {
		pathnameRef.current = pathname
	}, [pathname])

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
		return `${segments.join('/')}?${searchParams.toString()}`
	}

	return (
		<div className='w-full h-full flex justify-center items-center'>
			<Select
				value={locale}
				onValueChange={handleLanguageChange}>
				<SelectTrigger className={`text-base border-none ${isTransparent ? 'bg-transparent hover:bg-transparent' : 'bg-transparent font-medium hover:bg-zinc-100 hover:text-accent-foreground data-[state=open]:bg-zinc-100'} gap-1`}>
					<SelectValue />
				</SelectTrigger>
				<SelectContent className='min-w-0'>
					{Object.entries(LANGUAGES).map(([value, title]) =>
						<SelectItem key={value} value={value}
							className='text-base cursor-pointer'>{title}</SelectItem>)}
				</SelectContent>
			</Select>
		</div>
	)
})
export default LanguageChanger
