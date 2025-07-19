'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useDispatch } from 'react-redux'

import ObjectsView from '@/components/admin-panel/ObjectsView'

import { openModal } from '@/store/slices/modalSlice'
import modalThunkActions from '@/store/thunks/modalThunk'

import { getTranslation } from '@/i18n/client'
import useAdminAuthors from '@/hooks/data/forAdmin/useAdminAuthors'
import { useState } from 'react'

export default function AuthorsAdminPageComponent() {
	const dispatch = useDispatch()
	const { authors, authorsIsLoading,
		fetchDeleteAuthor } = useAdminAuthors()

	const { locale } = useParams()
	const { t } = getTranslation(locale)
	const [selectedObjects, setSelectedObjects] = useState([])

	const handleDeleteClick = async ({ id, isMulti }) => {
		dispatch(
			openModal({
				title: t('warning'),
				message: isMulti ? t('delete_authors') : t('delete_author'),
				buttonText: t('delete'),
				type: 'delete'
			})
		)

		const isConfirm = await dispatch(modalThunkActions.open())
		if (isConfirm.payload) {
			fetchDeleteAuthor(id)
			setSelectedObjects([])
		}
	}

	return (
		<div className='flex flex-col w-fill space-y-4'>
			<div className='flex flex-row justify-between items-center'>
				<h1 className='sm:text-2xl text-xl font-semibold'>
					{t('photo_authors')}
				</h1>
				<Link
					href={`/${locale}/admin/authors/create`}
					prefetch={false}
					className='w-fit px-8 py-2 font-medium text-center text-white transition-colors duration-300 
                transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none active:bg-blue-600'
				>
					{t('add_author')}
				</Link>
			</div>
			<ObjectsView
				objects={authors}
				onDeleteClick={handleDeleteClick}
				objectType='authors'
				visibilityControl={false}
				languageChanger={false}
				isLoading={authorsIsLoading}
				selectedObjects={selectedObjects}
				setSelectedObjects={setSelectedObjects}
			/>
		</div>
	)
}
