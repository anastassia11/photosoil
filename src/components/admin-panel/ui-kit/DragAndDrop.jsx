'use client'

import { useParams } from 'next/navigation'
import { memo, useState } from 'react'
import { useDispatch } from 'react-redux'

import { openAlert } from '@/store/slices/alertSlice'

import { getTranslation } from '@/i18n/client'
import uuid from 'react-uuid'

const DragAndDrop = memo(function DragAndDrop({
	id,
	onLoadClick,
	isMultiple,
	accept,
	error
}) {
	const dispatch = useDispatch()
	const [drag, setDrag] = useState(false)
	const { locale } = useParams()
	const { t } = getTranslation(locale)

	const handleChange = e => {
		e.preventDefault()
		const type =
			accept === 'img' ? 'image/' : accept === 'pdf' ? 'application/pdf' : ''
		let files = [...e.target.files]
		files.forEach((file) => {
			if (file.type.startsWith(type)) {
				const id = uuid()
				onLoadClick(file, id)
			} else {
				dispatch(
					openAlert({
						title: t('warning'),
						message: `${t('error_file')} (.${accept})}`,
						type: 'warning'
					})
				)
			}
		})
	}

	const handleDragStart = e => {
		e.preventDefault()
		setDrag(true)
	}

	const handleDragLeave = e => {
		e.preventDefault()
		setDrag(false)
	}

	const handleDrop = e => {
		e.preventDefault()
		const type =
			accept === 'img' ? 'image/' : accept === 'pdf' ? 'application/pdf' : ''
		let files = [...e.dataTransfer.files]

		files.forEach((file) => {
			if (file.type.startsWith(type)) {
				const id = uuid()
				onLoadClick(file, id)
			} else {
				dispatch(
					openAlert({
						title: t('warning'),
						message: `${t('error_file')} (.${accept})`,
						type: 'warning'
					})
				)
			}
		})
		setDrag(false)
	}

	return (
		<div className='min-h-full min-w-full flex flex-1 flex-col'>
			{drag ? (
				<div
					className='flex flex-col justify-center items-center rounded border-black/80 bg-black/45
                        border-dashed border-[1.5px] duration-300 flex-1 text-center'
					onDragStart={e => handleDragStart(e)}
					onDragLeave={e => handleDragLeave(e)}
					onDragOver={e => handleDragStart(e)}
					onDrop={e => handleDrop(e)}
				>
					<p className='text-white'>{t('release_files')}</p>
				</div>
			) : (
				<label
					htmlFor={id}
					className={`px-4 flex flex-col justify-center items-center space-y-2 
                     flex-1 rounded border-dashed border-[1px] 
                     ${error ? 'border-red-600 bg-red-50/30' : 'border-zinc-400 hover:border-zinc-600'}
                     duration-300 cursor-pointer w-full`}
					onDragStart={e => handleDragStart(e)}
					onDragLeave={e => handleDragLeave(e)}
					onDragOver={e => handleDragStart(e)}
				>
					<p className='text-center'>
						<span className='font-semibold'>{t('click_download')}</span>{' '}
						{t('drag_files')}
					</p>

					<input
						type='file'
						multiple={isMultiple}
						id={id}
						className='w-0 h-0'
						accept={`${accept === 'img' ? 'image/*' : accept === 'pdf' ? '.pdf' : ''} `}
						onChange={handleChange}
					/>
				</label>
			)}
			{error && (
				<p className='text-red-500 text-sm mt-[2px]'>{error.message}</p>
			)}
		</div>
	)
})
export default DragAndDrop
