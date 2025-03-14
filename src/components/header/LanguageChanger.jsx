'use client'

import { usePathname, useRouter } from 'next/navigation'
import { memo, useEffect, useRef } from 'react'

import Dropdown from '../admin-panel/ui-kit/Dropdown'

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
			<Dropdown
				value={locale}
				items={LANGUAGES}
				isTransparent={isTransparent}
				onCategotyChange={handleLanguageChange}
				dropdownKey='languageChanger'
			/>
		</div>
	)
})
export default LanguageChanger
