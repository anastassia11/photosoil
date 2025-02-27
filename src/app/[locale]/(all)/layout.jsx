'use client'

import { usePathname } from 'next/navigation'
import { useCallback, useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { setDropdown } from '@/store/slices/generalSlice'
import { filtersStore } from '@/store/valtioStore/filtersStore'

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
		filtersStore.selectedAuthors = []
		filtersStore.selectedCategories = []
		filtersStore.selectedTerms = []
		filtersStore.selectedTags = []
	}, [pathname])

	return <>{children}</>
}
