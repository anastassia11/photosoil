'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

import ObjectsView from '@/components/admin-panel/ObjectsView'

import { openModal } from '@/store/slices/modalSlice'
import modalThunkActions from '@/store/thunks/modalThunk'

import { deleteAuthor } from '@/api/author/delete_author'
import { getAuthorsForAdmin } from '@/api/author/get_authors_forAdmin'

import { getTranslation } from '@/i18n/client'

export default function AuthorsAdminPageComponent() {
	const dispatch = useDispatch()
	const [authors, setAuthors] = useState([])
	const [isLoading, setIsLoading] = useState(true)
	const { locale } = useParams()
	const { t } = getTranslation(locale)

	useEffect(() => {
		fetchAuthors()
	}, [])

	const fetchAuthors = async () => {
		const result = await getAuthorsForAdmin()
		if (result.success) {
			setAuthors(result.data)
			setIsLoading(false)
		}
	}

	const fetchDeleteAuthor = async id => {
		const result = await deleteAuthor(id)
		if (result.success) {
			setAuthors(prevAuthors => prevAuthors.filter(author => author.id !== id))
		}
	}

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
			await fetchDeleteAuthor(id)
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
				_objects={authors}
				onDeleteClick={handleDeleteClick}
				objectType='authors'
				pathname=''
				visibilityControl={false}
				languageChanger={false}
				isLoading={isLoading}
			/>
		</div>
	)
}
