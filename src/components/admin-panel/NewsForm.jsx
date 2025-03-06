'use client'

import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'

import { openAlert } from '@/store/slices/alertSlice'
import { setDirty } from '@/store/slices/formSlice'
import { closeModal, openModal } from '@/store/slices/modalSlice'
import modalThunkActions from '@/store/thunks/modalThunk'

import { useConstants } from '@/hooks/useConstants'

import { deletePhotoById } from '@/api/photo/delete_photo'
import { sendPhoto } from '@/api/photo/send_photo'
import { getTags } from '@/api/tags/get_tags'

import Filter from '../soils/Filter'

import TextEditor from './TextEditor'
import DragAndDrop from './ui-kit/DragAndDrop'
import FileCard from './ui-kit/FileCard'
import LangTabs from './ui-kit/LangTabs'
import PhotoCard from './ui-kit/PhotoCard'
import SubmitBtn from './ui-kit/SubmitBtn'
import Textarea from './ui-kit/Textarea'
import { getTranslation } from '@/i18n/client'

export default function NewsForm({
	_news,
	title,
	pathname,
	onNewsSubmit,
	btnText,
	oldTwoLang,
	oldIsEng
}) {
	const dispatch = useDispatch()
	const {
		register,
		reset,
		control,
		watch,
		trigger,
		getValues,
		setFocus,
		formState: { errors, isSubmitting, isDirty }
	} = useForm({
		mode: 'onChange',
		defaultValues: {
			translations: [
				{
					isEnglish: false,
					annotation: '',
					content: '',
					title: ''
				}
			],
			tags: [],
			objectPhoto: [],
			files: []
		}
	})
	const { fields: translationsFields, append: appendTranslation } =
		useFieldArray({
			control,
			name: 'translations'
		})
	const translations = watch('translations')
	const [localObjectPhoto, setLocalObjectPhoto] = useState([])
	const [localFiles, setLocalFiles] = useState([])
	const [tags, setTags] = useState([])

	const dropdown = useSelector(state => state.general.dropdown)
	const [isEng, setIsEng] = useState(false)
	const [createTwoLang, setCreateTwoLang] = useState(false)
	const { locale } = useParams()
	const { t } = getTranslation(locale)

	const { NEWS_INFO } = useConstants()

	useEffect(() => {
		if (_news) {
			reset({
				..._news,
				tags: _news.tags?.map(({ id }) => id)
			})
			setIsEng(oldIsEng)
			setLocalFiles(_news.files)
			setLocalObjectPhoto(_news.objectPhoto)
			setCreateTwoLang(_news.translations?.length > 1)
		}
	}, [_news])

	useEffect(() => {
		fetchTags()
	}, [])

	useEffect(() => {
		dispatch(setDirty(isDirty))
	}, [isDirty])

	const fetchTags = async () => {
		const result = await getTags()
		if (result.success) {
			setTags(result.data)
		}
	}

	const handleTwoLangChange = e => {
		const isChecked = e.target.checked
		if (pathname === 'edit') {
			if (isChecked) {
				if (translations?.length < 2) {
					appendTranslation({ isEnglish: !isEng })
				}
			} else {
				setIsEng(oldIsEng)
			}
		} else {
			if (translations?.length < 2) {
				appendTranslation({ isEnglish: !isEng })
			}
		}
		setCreateTwoLang(isChecked)
	}

	const handleLangChange = value => {
		setIsEng(value)
	}

	const handleNewsPhotoSend = async (field, file, index) => {
		setLocalObjectPhoto(prev => {
			const _prev = [...prev, { isLoading: true }]
			field.onChange(_prev)
			return _prev
		})

		const result = await sendPhoto(file)
		if (result.success) {
			setLocalObjectPhoto(prev => {
				const _prev = prev.map((photo, idx) =>
					idx === index + localObjectPhoto.length
						? { ...result.data, isLoading: false }
						: photo
				)
				field.onChange(_prev)
				return _prev
			})
		} else {
			dispatch(
				openAlert({
					title: t('error'),
					message: t('error_photo'),
					type: 'error'
				})
			)
		}
	}

	const handleFilesSend = async (file, index, field) => {
		setLocalFiles(prev => {
			const _prev = [...prev, { isLoading: true, name: file.name }]
			field.onChange(_prev)
			return _prev
		})

		const result = await sendPhoto(file)
		if (result.success) {
			setLocalFiles(prev => {
				const _prev = prev.map((file, idx) =>
					idx === index + localFiles.length
						? { ...result.data, isLoading: false }
						: file
				)
				field.onChange(_prev)
				return _prev
			})
		} else {
			dispatch(
				openAlert({
					title: t('error'),
					message: t('error_file'),
					type: 'error'
				})
			)
			setLocalFiles(prev => {
				const _prev = prev.filter((file, idx) => idx !== index)
				field.onChange(_prev)
				return _prev
			})
		}
	}

	const handleNewsPhotoDelete = async (id, field) => {
		dispatch(
			openModal({
				title: t('warning'),
				message: t('delete_photo'),
				buttonText: t('delete'),
				type: 'delete'
			})
		)

		const isConfirm = await dispatch(modalThunkActions.open())
		if (isConfirm.payload) {
			if (pathname !== 'edit') {
				await deletePhotoById(id)
			}
			setLocalObjectPhoto(prev => {
				const _prev = prev.filter(photo => photo.id !== id)
				field.onChange(_prev)
				return _prev
			})
		}
		dispatch(closeModal())
	}

	const handleFileDelete = async (id, field) => {
		dispatch(
			openModal({
				title: t('warning'),
				message: t('delete_file'),
				buttonText: t('delete'),
				type: 'delete'
			})
		)

		const isConfirm = await dispatch(modalThunkActions.open())
		if (isConfirm.payload) {
			if (pathname !== 'edit') {
				await deletePhotoById(id)
			}
			setLocalFiles(prev => {
				const _prev = prev.filter(file => file.id !== id)
				field.onChange(_prev)
				return _prev
			})
		}
		dispatch(closeModal())
	}

	const handleNewsPhotosChange = (e, id, field) => {
		setLocalObjectPhoto(prev => {
			const _prev = prev.map(photo =>
				photo.id === id
					? { ...photo, [isEng ? 'titleEng' : 'titleRu']: e.target.value }
					: photo
			)
			field.onChange(_prev)
			return _prev
		})
	}

	const formSubmit = async e => {
		e.preventDefault()
		const result = await trigger()
		if (result) {
			const data = getValues()
			const news = {
				...data,
				files: data.files.map(({ id }) => id),
				objectPhoto: data.objectPhoto.map(({ id }) => id)
			}
			const initialPhotos = _news?.objectPhoto?.map(({ id }) => id)
			const initialFiles = _news?.files?.map(({ id }) => id)
			await onNewsSubmit({
				createTwoLang,
				isEng,
				news,
				newsPhotos: data.objectPhoto,
				initialPhotos,
				initialFiles
			})
		} else {
			const firstErrorField = Object.keys(errors)[0]
			if (firstErrorField === 'translations') {
				for (const [index, transl] of errors.translations.entries()) {
					if (!!transl) {
						setIsEng(translations[index].isEnglish)
						const firstErrorField = Object.keys(transl)[0]
						await new Promise(resolve => setTimeout(resolve, 10))
						setFocus(`translations.${index}.${firstErrorField}`)
						break
					}
				}
			} else {
				setFocus(firstErrorField)
			}
		}
	}

	return (
		<form
			onSubmit={formSubmit}
			className='flex flex-col w-full flex-1 pb-[250px]'
		>
			<div className='mb-2 flex md:flex-row flex-col md:items-end md:justify-between space-y-1 md:space-y-0'>
				<h1 className='sm:text-2xl text-xl font-semibold mb-2 md:mb-0'>
					{title}
				</h1>
				<div className='md:min-w-[220px] md:max-w-[220px] md:w-fit'>
					<SubmitBtn
						isSubmitting={isSubmitting}
						btnText={btnText}
					/>
				</div>
			</div>

			<div className='flex flex-col w-full h-fit pb-16'>
				<div className='flex flex-col w-full h-full'>
					<LangTabs
						isEng={isEng}
						oldIsEng={oldIsEng}
						createTwoLang={createTwoLang}
						oldTwoLang={oldTwoLang}
						isEdit={pathname === 'edit'}
						onLangChange={handleLangChange}
						onTwoLangChange={handleTwoLangChange}
					/>
					<ul className='flex flex-col w-full mt-4'>
						{NEWS_INFO.map(({ name, title }, idx) => {
							return (
								<li
									key={name}
									className={`${idx && 'mt-3'}`}
								>
									{translationsFields.map((field, index) => (
										<div
											key={field.id}
											className={`${field.isEnglish === isEng ? 'visible' : 'hidden'}`}
										>
											{name === 'content' ? (
												<Controller
													control={control}
													name={`translations.${index}.${name}`}
													render={({ field: { onChange, value } }) => (
														<div className='mt-4 flex flex-col'>
															<label className='font-medium min-h-fit'>
																{`${t('news_text')} ${isEng ? '(EN)' : ''}`}
															</label>
															<div className={`w-full relative`}>
																<TextEditor
																	type={`news-${field.id}`}
																	content={value}
																	setContent={html => onChange(html)}
																/>
															</div>
														</div>
													)}
												/>
											) : (
												<Textarea
													required={name === 'title'}
													error={errors.translations?.[index]?.[name]}
													{...register(`translations.${index}.${name}`, {
														required:
															(createTwoLang
																? true
																: field.isEnglish === isEng) && name === 'title'
																? t('required')
																: false
													})}
													label={title}
													isEng={isEng}
													placeholder=''
												/>
											)}
										</div>
									))}
								</li>
							)
						})}
					</ul>

					<div className='mt-6 flex flex-col'>
						<label className='font-medium min-h-fit'>{`${t('gallery')}`}</label>
						<Controller
							control={control}
							name='objectPhoto'
							render={({ field, fieldState }) => (
								<ul className={`mt-1 grid md:grid-cols-2 grid-cols-1 gap-4 `}>
									{!!Object.keys(field.value).length &&
										field.value.map((photo, idx) => (
											<li key={`photo-${idx}`}>
												<PhotoCard
													{...photo}
													isEng={isEng}
													onDelete={id => handleNewsPhotoDelete(id, field)}
													onChange={(e, id) =>
														handleNewsPhotosChange(e, id, field)
													}
												/>
											</li>
										))}
									<div className='h-[150px]'>
										<DragAndDrop
											id='news-photos'
											error={fieldState.error}
											onLoadClick={(file, index) =>
												handleNewsPhotoSend(field, file, index)
											}
											isMultiple={true}
											accept='img'
										/>
									</div>
								</ul>
							)}
						/>
					</div>

					<div className='mt-8 flex flex-col'>
						<label className='font-medium min-h-fit'>{`${t('files')}`}</label>
						<Controller
							control={control}
							name='files'
							render={({ field, fieldState }) => (
								<ul
									className={`mt-1 flex flex-col w-full md:w-[50%] md:pr-2 pr-0`}
								>
									{!!Object.keys(field.value).length &&
										field.value.map((file, idx) => (
											<li key={`file-${idx}`}>
												<FileCard
													{...file}
													isEng={isEng}
													onDelete={() => handleFileDelete(file.id, field)}
												/>
											</li>
										))}
									<div
										className={`h-[150px] ${!!Object.keys(field.value).length && 'mt-4'}`}
									>
										<DragAndDrop
											id='news-files'
											error={fieldState.error}
											onLoadClick={(file, index) =>
												handleFilesSend(file, index, field)
											}
											isMultiple={true}
										/>
									</div>
								</ul>
							)}
						/>
					</div>

					<div className='mt-8 flex flex-col w-full md:w-1/2'>
						<Controller
							control={control}
							name='tags'
							render={({ field: { value, onChange } }) => (
								<Filter
									locale={locale}
									dropdown={dropdown}
									name={t('tags')}
									items={tags}
									type='tags'
									setTags={setTags}
									allSelectedItems={value}
									isEng={isEng}
									addItem={newItem => onChange([...value, newItem])}
									deleteItem={deletedItem =>
										onChange(value.filter(item => item !== deletedItem))
									}
									resetItems={() => onChange([])}
								/>
							)}
						/>
					</div>
				</div>
			</div>
		</form>
	)
}
