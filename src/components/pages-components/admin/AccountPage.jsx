'use client'

import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'

import ObjectsView from '@/components/admin-panel/ObjectsView'

import { closeModal, openModal } from '@/store/slices/modalSlice'
import modalThunkActions from '@/store/thunks/modalThunk'

import { getTranslation } from '@/i18n/client'
import useAccount from '@/hooks/data/forAdmin/useAccount'
import useAdminEcosystems from '@/hooks/data/forAdmin/useAdminEcosystems'
import useAdminPubl from '@/hooks/data/forAdmin/useAdminPubl'
import useAdminNews from '@/hooks/data/forAdmin/useAdminNews'
import useAdminSoils from '@/hooks/data/forAdmin/useAdminSoils'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

export default function AccountPageComponent({ id }) {
	const dispatch = useDispatch()
	const pathname = usePathname()
	const router = useRouter()
	const searchParams = useSearchParams()

	const { account, accountIsLoading } = useAccount(id)

	const { deleteSoil, visibleChange: soilVisibleChange } = useAdminSoils()
	const { deleteEcosystem, visibleChange: ecosystemVisibleChange } = useAdminEcosystems()
	const { deletePubl, visibleChange: publVisibleChange } = useAdminPubl()
	const { deleteNews, visibleChange: newsVisibleChange } = useAdminNews()

	const [selectedObjects, setSelectedObjects] = useState([])
	const [selectedFilters, setSelectedFilters] = useState(['objects', 'ecosystems', 'publications', 'news'])

	const { locale } = useParams()
	const { t } = getTranslation(locale)

	const FILTERS = [
		{ title: t('soils'), name: 'objects' },
		{ title: t('ecosystems'), name: 'ecosystems' },
		{ title: t('publications'), name: 'publications' },
		{ title: t('news'), name: 'news' }
	]

	useEffect(() => {
		if (typeof document !== 'undefined' && account.email) {
			document.title = `${account.email} | PhotoSOIL`
		}
	}, [account.email])

	useEffect(() => {
		const disabledTypes = searchParams.get('disabled')?.split(',')
		if (disabledTypes) {
			setSelectedFilters(FILTERS.map(({ name }) => name).filter(el => !disabledTypes.includes(el)))
		}
	}, [])

	const updateHistory = useCallback((key, updatedArray) => {
		const params = new URLSearchParams(searchParams.toString())
		if (updatedArray.length > 0) {
			params.set(key, updatedArray.join(','))
		} else {
			params.delete(key)
		}
		router.replace(`${pathname}?${params.toString()}`, { scroll: false })
	}, [pathname, router, searchParams])

	const handleFilterSelect = (name, checked) => {
		const newFilters = checked ? [...selectedFilters, name] : selectedFilters.filter(filterName => filterName !== name)
		setSelectedFilters(newFilters)

		updateHistory('disabled', FILTERS.map(({ name }) => name).filter(el => !newFilters.includes(el)))
	}

	const handleAllCheck = () => {
		const newFilters = selectedFilters.length === FILTERS.length ? [] : FILTERS.map(({ name }) => name)
		setSelectedFilters(newFilters)

		updateHistory('disabled', FILTERS.map(({ name }) => name).filter(el => !newFilters.includes(el)))
	}

	const handleDeleteClick = async ({ type, id, isMulti }) => {
		dispatch(
			openModal({
				title: t('warning'),
				message: isMulti ? t('delete_objects') : t('delete_object'),
				buttonText: t('delete'),
				type: 'delete'
			})
		)

		const isConfirm = await dispatch(modalThunkActions.open())
		if (isConfirm.payload) {
			if (type === 'objects') {
				deleteSoil(id)
			} else if (type === 'ecosystems') {
				deleteEcosystem(id)
			} else if (type === 'publications') {
				deletePubl(id)
			} else if (type === 'news') {
				deleteNews(id)
			}
			setSelectedObjects([])
		}
		dispatch(closeModal())
	}

	const handleVisibleChange = async ({ id, type, isVisible, isMulti }) => {
		dispatch(
			openModal({
				title: t('warning'),
				message: !isVisible
					? isMulti
						? t('rem_published_objects')
						: t('rem_published_object')
					: isMulti
						? t('published_objects')
						: t('published_object'),
				buttonText: t('confirm')
			})
		)

		const isConfirm = await dispatch(modalThunkActions.open())
		if (isConfirm.payload) {
			if (type === 'objects') {
				soilVisibleChange({ id, isVisible })
			} else if (type === 'ecosystems') {
				ecosystemVisibleChange({ id, isVisible })
			} else if (type === 'publications') {
				publVisibleChange({ id, isVisible })
			} else if (type === 'news') {
				newsVisibleChange({ id, isVisible })
			}
			setSelectedObjects([])
		}
		dispatch(closeModal())
	}

	return (
		<div className='flex flex-col w-full space-y-4 '>
			<div className='flex flex-row items-center justify-between mb-2'>
				<h1 className='sm:text-2xl text-xl font-semibold'>
					{t('user_objects')}{' '}
					<span className='text-blue-700'>{account.email}</span>{' '}
					{account.name && `(${account.name})`}
				</h1>
			</div>

			<button
				className='text-gray-900 underline underline-offset-4 w-fit'
				onClick={handleAllCheck}
			>
				{selectedFilters.length === FILTERS.length
					? t('reset_all')
					: t('select_all')}
			</button>

			<ul className='flex flex-row flex-wrap'>
				{FILTERS.map(({ title, name }) => (
					<li key={name} className='flex flex-row items-center space-x-2 mr-12 mb-4'>
						<Checkbox id={`Item${name}`} name={name} checked={selectedFilters.includes(name)}
							onCheckedChange={checked => handleFilterSelect(name, checked)} />
						<Label htmlFor={`Item${name}`} className='cursor-pointer text-base'>{title}</Label>
					</li>
				))}
			</ul>
			<ObjectsView
				objects={account.userObjects ?? []}
				onVisibleChange={handleVisibleChange}
				visibilityControl={true}
				languageChanger={true}
				onDeleteClick={handleDeleteClick}
				objectType='userPage'
				isLoading={accountIsLoading}
				selectedObjects={selectedObjects}
				setSelectedObjects={setSelectedObjects}
			/>
		</div>
	)
}
