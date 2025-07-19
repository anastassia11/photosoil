'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { useDispatch } from 'react-redux'

import ObjectsView from '@/components/admin-panel/ObjectsView'

import { closeModal, openModal } from '@/store/slices/modalSlice'
import modalThunkActions from '@/store/thunks/modalThunk'

import { getTranslation } from '@/i18n/client'
import useAdminNews from '@/hooks/data/forAdmin/useAdminNews'

export default function NewsAdminComponent() {
	const dispatch = useDispatch()
	const { news, newsIsLoading,
		deleteNews,
		visibleChange,
	} = useAdminNews()
	const { locale } = useParams()
	const { t } = getTranslation(locale)
	const [selectedObjects, setSelectedObjects] = useState([])

	const handleDeleteClick = async ({ id, isMulti }) => {
		dispatch(
			openModal({
				title: t('warning'),
				message: isMulti ? t('delete_manyNews') : t('delete_news'),
				buttonText: t('delete'),
				type: 'delete'
			})
		)

		const isConfirm = await dispatch(modalThunkActions.open())
		if (isConfirm.payload) {
			deleteNews(id)
			setSelectedObjects([])
		}
		dispatch(closeModal())
	}

	const handleVisibleClick = async ({ id, isVisible, isMulti }) => {
		dispatch(
			openModal({
				title: t('warning'),
				message: !isVisible
					? isMulti
						? t('rem_published_manyNews')
						: t('rem_published_news')
					: isMulti
						? t('published_manyNews')
						: t('published_news'),
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
				<h1 className='sm:text-2xl text-xl font-semibold'>{t('news')}</h1>
				<Link
					href={`/${locale}/admin/news/create`}
					prefetch={false}
					className='w-fit sm:px-8 px-2 py-2 font-medium text-center text-white transition-colors duration-300 
                transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none active:bg-blue-600'
				>
					{t('create_news')}
				</Link>
			</div>
			<ObjectsView
				objects={news}
				onDeleteClick={handleDeleteClick}
				objectType='news'
				visibilityControl={true}
				languageChanger={true}
				onVisibleChange={handleVisibleClick}
				isLoading={newsIsLoading}
				selectedObjects={selectedObjects}
				setSelectedObjects={setSelectedObjects}
			/>
		</div>
	)
}
