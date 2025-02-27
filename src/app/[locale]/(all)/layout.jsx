'use client'

import { usePathname } from 'next/navigation'
import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
	resetAuthor,
	resetCategory,
	resetTags,
	resetTerm
} from '@/store/slices/dataSlice'
import { setDropdown } from '@/store/slices/generalSlice'

export default function AllLayout({ children }) {
	const dispatch = useDispatch()
	const pathname = usePathname()

	const handleClickOutside = useCallback(
		e => {
			if (
				!e.target.closest(
					'.user, .dropdown, .soils, .category, .language, .languageChanger, .filter_dropdown, .in_page, .rang, .heading, .linkModal, .tag-form, .modal'
				)
			) {
				dispatch(setDropdown({ isActive: false, key: null }))
			}
		},
		[dispatch]
	)

	// useEffect(() => {
	// 	document.addEventListener('click', handleClickOutside)
	// 	return () => {
	// 		document.removeEventListener('click', handleClickOutside)
	// 	}
	// }, [])

	useEffect(() => {
		dispatch(resetAuthor())
		dispatch(resetCategory())
		dispatch(resetTerm())
		dispatch(resetTags())
	}, [pathname, dispatch])

	return <>{children}</>
}
