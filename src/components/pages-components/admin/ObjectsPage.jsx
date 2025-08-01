'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useDispatch } from 'react-redux'

import ObjectsView from '@/components/admin-panel/ObjectsView'

import { closeModal, openModal } from '@/store/slices/modalSlice'
import modalThunkActions from '@/store/thunks/modalThunk'

import { getTranslation } from '@/i18n/client'
import useAdminSoils from '@/hooks/data/forAdmin/useAdminSoils'
import { useState } from 'react'

export default function ObjectsPageComponent() {
	const dispatch = useDispatch()
	const { soils, soilsIsLoading,
		deleteSoil,
		visibleChange,
	} = useAdminSoils()
	const { locale } = useParams()
	const { t } = getTranslation(locale)
	const [selectedObjects, setSelectedObjects] = useState([])

	const handleDeleteClick = async ({ id, isMulti }) => {
		dispatch(
			openModal({
				title: t('warning'),
				message: isMulti ? t('delete_soils') : t('delete_soil'),
				buttonText: t('delete'),
				type: 'delete'
			})
		)

		const isConfirm = await dispatch(modalThunkActions.open())
		if (isConfirm.payload) {
			deleteSoil(id)
			setSelectedObjects([])
		}
		dispatch(closeModal())
	}

	const handleVisibleChange = async ({ id, isVisible, isMulti }) => {
		dispatch(
			openModal({
				title: t('warning'),
				message: !isVisible
					? isMulti
						? t('rem_published_soils')
						: t('rem_published_soil')
					: isMulti
						? t('published_soils')
						: t('published_soil'),
				buttonText: t('confirm')
			})
		)

		const isConfirm = await dispatch(modalThunkActions.open())
		if (isConfirm.payload) {
			visibleChange({ id, isVisible })
			setSelectedObjects([])
		}
		dispatch(closeModal())
	}

	return (
		<div className='flex flex-col w-fill space-y-4'>
			<div className='flex flex-row justify-between items-center'>
				<h1 className='sm:text-2xl text-lg font-semibold'>{t('soils')}</h1>
				<Link
					href={`/${locale}/admin/objects/create`}
					prefetch={false}
					className='w-fit sm:px-8 px-2 py-2 font-medium text-center text-white transition-colors duration-300 
                transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none active:bg-blue-600'
				>
					{t('create_objects')}
				</Link>
			</div>
			<ObjectsView
				objects={soils}
				onDeleteClick={handleDeleteClick}
				objectType='objects'
				visibilityControl={true}
				languageChanger={true}
				isLoading={soilsIsLoading}
				onVisibleChange={handleVisibleChange}
				selectedObjects={selectedObjects}
				setSelectedObjects={setSelectedObjects}
			/>
		</div>
	)
}
