import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { setDirty } from '@/store/slices/formSlice'

import { getTranslation } from '@/i18n/client'

export default function GlobalFormWarning() {
	const dispatch = useDispatch()
	const { isDirty } = useSelector(state => state.form)
	const { locale } = useParams()
	const { t } = getTranslation(locale)

	useEffect(() => {
		window.addEventListener('beforeunload', handleBeforeUnload)
		window.addEventListener('popstate', handlePopState)
		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload)
			window.removeEventListener('popstate', handlePopState)
		}
	}, [isDirty])

	const handleBeforeUnload = event => {
		if (isDirty) {
			const message = t('form_confirm')
			event.preventDefault() // Для современных браузеров
			event.returnValue = message // Для старых браузеров
			return message // Для других браузеров
		}
	}

	const handlePopState = event => {
		if (isDirty) {
			const message = t('form_confirm')
			if (!window.confirm(message)) {
				// Отменяем переход
				event.preventDefault()
			} else {
				dispatch(setDirty(false))
			}
		}
	}

	return null
}
