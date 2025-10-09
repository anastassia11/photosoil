'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { memo, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { setDirty } from '@/store/slices/formSlice'
import { getTranslation } from '@/i18n/client'

const LanguageChanger = memo(function LanguageChanger({
	locale,
	isTransparent
}) {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const pathnameRef = useRef(pathname)
	const dispatch = useDispatch()
	const isDirty = useSelector(state => state.form.isDirty)
	const { t } = getTranslation(locale)

	useEffect(() => {
		pathnameRef.current = pathname
	}, [pathname])

	const LANGUAGES = {
		ru: 'RU',
		en: 'EN'
	}

	const handleLanguageChange = lang => {
		if (isDirty) {
			const confirmLeave = window.confirm(t('form_confirm'))
			if (!confirmLeave) {
				return
			}
			dispatch(setDirty(false))
		}

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
