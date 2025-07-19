'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useDispatch } from 'react-redux'

import ObjectsView from '@/components/admin-panel/ObjectsView'

import { closeModal, openModal } from '@/store/slices/modalSlice'
import modalThunkActions from '@/store/thunks/modalThunk'

import { getTranslation } from '@/i18n/client'
import useAdminEcosystems from '@/hooks/data/forAdmin/useAdminEcosystems'
import { useState } from 'react'

export default function EcosystemsAdminComponent() {
	const dispatch = useDispatch()
	const { ecosystems, ecosystemsIsLoading,
		deleteEcosystem,
		visibleChange,
	} = useAdminEcosystems()

	const [selectedObjects, setSelectedObjects] = useState([])

	const { locale } = useParams()
	const { t } = getTranslation(locale)

	const handleDeleteClick = async ({ id, isMulti }) => {
		dispatch(
			openModal({
				title: t('warning'),
				message: isMulti ? t('delete_ecosystems') : t('delete_ecosystem'),
				buttonText: t('delete'),
				type: 'delete'
			})
		)

		const isConfirm = await dispatch(modalThunkActions.open())
		if (isConfirm.payload) {
			deleteEcosystem(id)
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
						? t('rem_published_ecosystems')
						: t('rem_published_ecosystem')
					: isMulti
						? t('published_ecosystems')
						: t('published_ecosystem '),
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
				<h1 className='sm:text-2xl text-xl font-semibold'>{t('ecosystems')}</h1>
				<Link
					href={`/${locale}/admin/ecosystems/create`}
					prefetch={false}
					className='w-fit sm:px-8 px-2 py-2 font-medium text-center text-white transition-colors duration-300 
                transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none active:bg-blue-600'
				>
					{t('create_ecosystems')}
				</Link>
			</div>
			<ObjectsView
				objects={ecosystems}
				onDeleteClick={handleDeleteClick}
				objectType='ecosystems'
				visibilityControl={true}
				languageChanger={true}
				isLoading={ecosystemsIsLoading}
				onVisibleChange={handleVisibleChange}
				selectedObjects={selectedObjects}
				setSelectedObjects={setSelectedObjects}
			/>
		</div>
	)
}
