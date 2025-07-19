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
import uuid from 'react-uuid'

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
	const { locale } = useParams()
	const {
		register,
		reset,
		control,
		trigger,
		getValues,
		setFocus,
		formState: { errors, isSubmitting, isDirty }
	} = useForm({
		mode: 'onChange',
		defaultValues: {
			translations: [
				{
					isEnglish: locale === 'en',
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
	const [localObjectPhoto, setLocalObjectPhoto] = useState([])
	const [localFiles, setLocalFiles] = useState([])
	const [tags, setTags] = useState([])

	const [isEng, setIsEng] = useState(locale === 'en')
	const [createTwoLang, setCreateTwoLang] = useState(false)

	const { t } = getTranslation(locale)

	const { NEWS_INFO } = useConstants()

	const [btnDisabled, setBtnDisabled] = useState(false)

	useEffect(() => {
		if (_news) {
			reset({
				..._news,
				tags: _news.tags?.map(({ id }) => id)
			})
			setIsEng(oldIsEng)
			if (_news.files) setLocalFiles(_news.files)
			if (_news.objectPhoto) setLocalObjectPhoto(_news.objectPhoto)
			setCreateTwoLang(_news.translations?.length > 1)
		}
	}, [_news])

	useEffect(() => {
		setBtnDisabled(localObjectPhoto.some((photo) => photo.isLoading)
			|| localFiles?.some((file) => file.isLoading))
	}, [localObjectPhoto, localFiles])

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
		const translations = getValues('translations')
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

	const handleNewsPhotoSend = async (field, file) => {
		const photoId = uuid()
		setLocalObjectPhoto(prev => {
			const _prev = [...prev, { id: photoId, isLoading: true, fileName: file.name }]
			field.onChange(_prev)
			return _prev
		})

		const result = await sendPhoto(file)
		if (result.success) {
			setLocalObjectPhoto(prev => {
				const _prev = prev.map((photo) =>
					photo.id === photoId
						? { ...result.data, isLoading: false }
						: photo
				)
				field.onChange(_prev)
				return _prev
			})
		} else {
			setLocalObjectPhoto(prev => {
				const _prev = prev.filter(photo => photo.id !== photoId)
				field.onChange(_prev)
				return _prev
			})
			dispatch(
				openAlert({
					title: t('error'),
					message: t('error_photo'),
					type: 'error'
				})
			)
		}
	}

	const handleFilesSend = async (file, field) => {
		const fileId = uuid()
		setLocalFiles(prev => {
			const _prev = [...prev, { id: fileId, isLoading: true, name: file.name }]
			field.onChange(_prev)
			return _prev
		})

		const result = await sendPhoto(file)
		if (result.success) {
			setLocalFiles(prev => {
				const _prev = prev.map((file) =>
					file.id === fileId
						? { ...result.data, isLoading: false }
						: file
				)
				field.onChange(_prev)
				return _prev
			})
		} else {
			setLocalFiles(prev => {
				const _prev = prev.filter((file) => file.id !== fileId)
				field.onChange(_prev)
				return _prev
			})
			dispatch(
				openAlert({
					title: t('error'),
					message: t('error_file'),
					type: 'error'
				})
			)

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
			setLocalObjectPhoto(prev => {
				const _prev = prev.filter(photo => photo.id !== id)
				field.onChange(_prev)
				return _prev
			})
			if (pathname !== 'edit') {
				await deletePhotoById(id)
			}
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
			setLocalFiles(prev => {
				const _prev = prev.filter(file => file.id !== id)
				field.onChange(_prev)
				return _prev
			})
			if (pathname !== 'edit') {
				await deletePhotoById(id)
			}
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
						const translations = getValues('translations')
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
						isDisabled={btnDisabled}
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
									{!!field.value.length &&
										field.value.map((photo) => (
											<li key={`photo-${photo.id}`}>
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
											onLoadClick={(file) =>
												handleNewsPhotoSend(field, file)
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
											onLoadClick={(file) =>
												handleFilesSend(file, field)
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
									name={t('tags')}
									items={tags}

									type='tags'
									setTags={setTags}
									selectedItems={tags
										.map(({ id }) => id)
										.filter(id => value?.includes(id))}

									addItem={newItem => {
										value.includes(newItem)
											? onChange(value.filter(item => item !== newItem))
											: onChange([...value, newItem])
									}}
									resetItems={() => onChange([])}
									selectAll={() => onChange(tags.map(({ id }) => id))}
								/>
							)}
						/>
					</div>
				</div>
			</div>
		</form>
	)
}
