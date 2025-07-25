'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { useDispatch } from 'react-redux'

import ObjectsView from '@/components/admin-panel/ObjectsView'

import { closeModal, openModal } from '@/store/slices/modalSlice'
import modalThunkActions from '@/store/thunks/modalThunk'

import { getTranslation } from '@/i18n/client'
import useAdminDisconaries from '@/hooks/data/forAdmin/useAdminDisc'

export default function DictionaryAdminPageComponent() {
	const dispatch = useDispatch()
	const { disconaries, discIsLoading,
		fetchDeleteDisc } = useAdminDisconaries()
	const { locale } = useParams()
	const { t } = getTranslation(locale)
	const [selectedObjects, setSelectedObjects] = useState([])

	const _isEng = locale === 'en'

	const handleDeleteClick = async ({ id }) => {
		dispatch(
			openModal({
				title: t('warning'),
				message: t('delete_dictionary'),
				buttonText: t('delete'),
				type: 'delete'
			})
		)

		const isConfirm = await dispatch(modalThunkActions.open())
		if (isConfirm.payload) {
			fetchDeleteDisc(id)
			setSelectedObjects([])
		}
		dispatch(closeModal())
	}

	return (
		<div className='flex flex-col w-fill space-y-4'>
			<div className='flex flex-row justify-between items-center'>
				<h1 className='sm:text-2xl text-xl font-semibold'>
					{t('dictionaries')}
				</h1>
				<Link
					href={`/${locale}/admin/dictionary/create`}
					prefetch={false}
					className='w-fit sm:px-8 px-2 py-2 font-medium text-center text-white transition-colors duration-300 
                transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none active:bg-blue-600'
				>
					{t('add_dictionary')}
				</Link>
			</div>
			<Link
				prefetch={false}
				className='text-blue-700 cursor-pointer flex flex-row items-center hover:underline duration-300'
				href={{
					pathname: `/${locale}/admin/dictionary/order`,
					query: { lang: _isEng ? 'eng' : 'ru' }
				}}
			>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					fill='none'
					viewBox='0 0 24 24'
					strokeWidth='1.5'
					stroke='currentColor'
					className='size-5 mr-1'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						d='m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10'
					/>
				</svg>
				<p className=''>{t('setup_order')}</p>
			</Link>
			<ObjectsView
				objects={disconaries}
				onDeleteClick={handleDeleteClick}
				objectType='dictionary'
				visibilityControl={false}
				languageChanger={true}
				isLoading={discIsLoading}
				selectedObjects={selectedObjects}
				setSelectedObjects={setSelectedObjects}
			/>
		</div>
	)
}
