'use client'

import { useParams } from 'next/navigation'
import {
	forwardRef,
	memo,
	useCallback,
	useEffect,
	useImperativeHandle,
	useState
} from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import uuid from 'react-uuid'

import { openAlert } from '@/store/slices/alertSlice'
import { setDirty } from '@/store/slices/formSlice'
import { closeModal, openModal } from '@/store/slices/modalSlice'
import modalThunkActions from '@/store/thunks/modalThunk'

import { useConstants } from '@/hooks/useConstants'

import { getAuthors } from '@/api/author/get_authors'
import { getClassifications } from '@/api/classification/get_classifications'
import { getBaseEcosystems } from '@/api/ecosystem/get_base_ecosystems'
import { deletePhotoById } from '@/api/photo/delete_photo'
import { sendPhoto } from '@/api/photo/send_photo'
import { getBasePublications } from '@/api/publication/get_base_publications'
import { getBaseSoils } from '@/api/soil/get_base_soils'

import MapSelect from '../map/MapSelect'
import Filter from '../soils/Filter'

import TextEditor from './TextEditor'
import DragAndDrop from './ui-kit/DragAndDrop'
import Input from './ui-kit/Input'
import LangTabs from './ui-kit/LangTabs'
import PhotoCard from './ui-kit/PhotoCard'
import Textarea from './ui-kit/Textarea'
import { getTranslation } from '@/i18n/client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'

function ObjectForm({ id, oldTwoLang, oldIsEng, pathname, type, item, onMainPhotoSend, onOtherPhotoSend,
	onObjectPhotoDelete, onMainPhotoDelete, setBtnDisabled
}, ref) {
	const dispatch = useDispatch()
	const { locale } = useParams()
	const { t } = getTranslation(locale)

	const defaultValues = {
		translations: [locale === 'ru' ? { isEnglish: false } : { isEnglish: true }],
		createTwoLang: false,
		currentLang: locale === 'en',
		objectType: 1,
		latitude: '',
		longtitude: '',
		// externalSource: '',
		objectPhoto: [],
		authors: [],
		soilTerms: [],
		ecoSystems: [],
		publications: [],
		soilObjects: [],
		mainPhoto: {}
	}

	const {
		register,
		reset,
		control,
		watch,
		trigger,
		setValue,
		getValues,
		setFocus,
		formState: { errors, isDirty }
	} = useForm({ mode: 'onChange', defaultValues })

	const { fields: translationsFields, append: appendTranslation } =
		useFieldArray({
			control,
			name: 'translations'
		})

	const isExternal = watch('isExternal')

	const createTwoLang = useWatch({ control, name: 'createTwoLang' })
	const isEng = watch('currentLang')

	const mainPhoto = useWatch({ control, name: "mainPhoto" })
	const [localObjectPhoto, setLocalObjectPhoto] = useState([])

	const [classifications, setClassifications] = useState([])
	const [authors, setAuthors] = useState([])
	const [ecosystems, setEcosystems] = useState([])
	const [soils, setSoils] = useState([])
	const [publications, setPublications] = useState([])
	const { SOIL_INFO, ECOSYSTEM_INFO, SOIL_ENUM } = useConstants()

	const INFO =
		type === 'soil' ? SOIL_INFO : type === 'ecosystem' ? ECOSYSTEM_INFO : {}

	useImperativeHandle(ref, () => ({
		updateState,
		formCheck
	}))

	useEffect(() => {
		fetchAuthors()
		fetchPublications()
		if (type === 'soil') {
			fetchClassifications()
			fetchEcosystems()
		} else if (type === 'ecosystem') {
			fetchSoils()
		}
	}, [])

	useEffect(() => {
		if (item) {
			reset({
				...defaultValues,
				...item
			})
			item.objectPhoto
				? setLocalObjectPhoto(item.objectPhoto)
				: setLocalObjectPhoto([])
		}
	}, [item, reset])

	useEffect(() => {
		dispatch(setDirty(isDirty))
	}, [isDirty])

	useEffect(() => {
		if (setBtnDisabled) setBtnDisabled(mainPhoto.isLoading || localObjectPhoto?.some((photo) => photo.isLoading))
	}, [localObjectPhoto, mainPhoto])

	const fetchClassifications = async () => {
		const result = await getClassifications()
		if (result.success) {
			setClassifications(result.data.sort((a, b) => a.order - b.order))
		}
	}

	const fetchAuthors = async () => {
		const result = await getAuthors()
		if (result.success) {
			setAuthors(result.data)
		}
	}

	const fetchSoils = async () => {
		const result = await getBaseSoils()
		if (result.success) {
			setSoils(result.data)
		}
	}

	const fetchEcosystems = async () => {
		const result = await getBaseEcosystems()
		if (result.success) {
			setEcosystems(result.data)
		}
	}

	const fetchPublications = async () => {
		const result = await getBasePublications()
		if (result.success) {
			setPublications(result.data)
		}
	}

	const updateState = () => {
		return getValues()
	}

	const handleOtherPhotoSend = useCallback(
		async (file, field) => {
			if (pathname === 'edit') {
				const photoId = uuid()
				setLocalObjectPhoto(prev => {
					const _prev = [...prev, { id: photoId, isLoading: true, fileName: file.name }]
					field.onChange(_prev)
					return _prev
				})
				const result = await sendPhoto(file)
				if (result.success) {
					setLocalObjectPhoto(prev => {
						const _prev = prev.map(photo => photo.id === photoId
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
			} else {
				onOtherPhotoSend(file, id)
			}
		},
		[dispatch, t, id, onOtherPhotoSend, pathname]
	)

	const handleMainPhotoSend = useCallback(async (file, field) => {
		field.onChange({ isLoading: true, fileName: file.name })
		if (pathname === 'edit') {
			const result = await sendPhoto(file)
			if (result.success) {
				field.onChange({ ...result.data, isLoading: false })
			} else {
				field.onChange({})
				dispatch(
					openAlert({
						title: t('error'),
						message: t('error_photo'),
						type: 'error'
					})
				)
			}
		} else {
			onMainPhotoSend(file, id)
		}
	}, [onMainPhotoSend, id, dispatch, pathname, t])

	const handleCoordChange = useCallback(({ latitude, longtitude }) => {
		setValue('latitude', latitude)
		setValue('longtitude', longtitude)
	}, [])

	const handleOtherPhotosChange = useCallback(
		(e, id, field) => {
			setLocalObjectPhoto(prev => {
				const _prev = prev.map(photo =>
					photo.id === id
						? { ...photo, [isEng ? 'titleEng' : 'titleRu']: e.target.value }
						: photo
				)
				field.onChange(_prev)
				return _prev
			})
		},
		[isEng]
	)

	const handleMainPhotoDelete = useCallback(
		async (id, field) => {
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
				if (pathname === 'edit') {
					const newId = uuid()
					field.onChange({ id: newId })
				} else {
					onMainPhotoDelete(id)
				}
			}
			dispatch(closeModal())
		},
		[dispatch, t, onMainPhotoDelete, pathname]
	)

	const handleOtherPhotoDelete = useCallback(
		async (photoId, field) => {
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
				if (pathname === 'edit') {
					setLocalObjectPhoto(prev => {
						const _prev = prev.filter(photo => photo.id !== photoId)
						field.onChange(_prev)
						return _prev
					})
				} else {
					onObjectPhotoDelete(photoId, id)
				}
			}
			dispatch(closeModal())
		},
		[dispatch, t, id, onObjectPhotoDelete, pathname]
	)

	const handleTwoLangChange = useCallback(
		checked => {
			const translations = getValues('translations')
			if (pathname === 'edit') {
				if (checked) {
					if (translations?.length < 2) {
						appendTranslation({ isEnglish: !isEng })
					}
				} else {
					setValue('currentLang', oldIsEng)
				}
			} else {
				if (translations?.length < 2) {
					appendTranslation({ isEnglish: !isEng })
				}
			}
			setValue('createTwoLang', checked)
		},
		[pathname, getValues, appendTranslation, setValue, isEng, oldIsEng]
	)

	const handleLangChange = useCallback(
		value => {
			setValue('currentLang', value)
		},
		[setValue]
	)

	const formCheck = async () => {
		const result = await trigger()
		if (!result) {
			const firstErrorField = Object.keys(errors)[0]
			if (firstErrorField === 'translations') {
				for (const [index, transl] of errors.translations.entries()) {
					if (!!transl) {
						const translations = getValues('translations')
						setValue('currentLang', translations[index].isEnglish)
						const firstErrorField = Object.keys(transl)[0]
						await new Promise(resolve => setTimeout(resolve, 10))
						setFocus(`translations.${index}.${firstErrorField}`)
						break
					}
				}
			} else {
				setFocus(firstErrorField)
				const element = document.getElementById(firstErrorField)
				if (element) {
					element.scrollIntoView({ behavior: 'smooth', block: 'center' })
				}
			}
			return { valid: false }
		} else {
			return { valid: true }
		}
	}

	const Column = ({ items }) => (
		<div className='flex flex-col gap-4'>
			{items.map(item => (
				<div key={`classification-${item.id}`}>
					<Controller
						control={control}
						name='soilTerms'
						render={({ field: { value, onChange } }) => (
							<Filter
								locale={locale}
								name={isEng ? item.nameEng : item.nameRu}
								items={item.terms}
								itemId={item.id}
								selectedItems={item.terms
									.map(({ id }) => id)
									.filter(id => value?.includes(id))}
								type='classif'
								sortByOrder={!item.isAlphabeticallOrder}
								addItem={newItem => {
									value.includes(newItem)
										? onChange(value.filter(item => item !== newItem))
										: onChange([...value, newItem])
								}}
								resetItems={items =>
									onChange(value.filter(item => !items.includes(item)))
								}
								selectAll={() =>
									onChange([...value, ...item.terms.map(({ id }) => id).filter(id => !value?.includes(id))])
								}
							/>
						)}
					/>
				</div>
			))}
		</div>
	)

	const GridComponent = ({ classifications }) => {
		const _classifications = classifications.filter(
			item =>
				item.translationMode == 0 ||
				(isEng ? item.translationMode == 1 : item.translationMode == 2)
		)
		const midPoint = Math.ceil(_classifications.length / 2)
		const firstColumnItems = _classifications.slice(0, midPoint)
		const secondColumnItems = _classifications.slice(midPoint)

		return (
			<div className='grid md:grid-cols-2 grid-cols-1 gap-4 w-full mt-1'>
				<Column items={firstColumnItems} />
				<Column items={secondColumnItems} />
			</div>
		)
	}

	const ItemFilter = ({ name, items, title, type }) => {
		return (
			<Controller
				control={control}
				name={name}
				render={({ field: { value, onChange } }) => (
					<Filter
						locale={locale}
						name={title}
						items={items}
						selectedItems={value}
						type={type}
						addItem={newItem =>
							value.includes(newItem)
								? onChange(value.filter(item => item !== newItem))
								: onChange([...value, newItem])
						}
						resetItems={() => onChange([])}
					/>
				)}
			/>
		)
	}

	return (
		<form
			className={`flex flex-col w-full h-fit max-h-full ${pathname !== 'edit' ? 'pb-[200px]' : 'pb-16'}`}
		>
			<div className='flex flex-col w-full h-full'>
				<div className='grid md:grid-cols-2 grid-cols-1 gap-x-4 w-full'>
					<LangTabs
						isEng={isEng}
						oldIsEng={oldIsEng}
						createTwoLang={createTwoLang}
						oldTwoLang={oldTwoLang}
						isEdit={pathname === 'edit'}
						onLangChange={handleLangChange}
						onTwoLangChange={handleTwoLangChange}
					/>
					<div className='flex flex-col w-full mt-4'>
						{translationsFields.map((field, index) => (
							<div
								key={field.id}
								className={`${field.isEnglish === isEng ? 'visible' : 'hidden'}`}
							>
								<Input
									required={createTwoLang || field.isEnglish === isEng}
									error={errors.translations?.[index]?.name}
									label={t('title')}
									isEng={isEng}
									{...register(`translations.${index}.name`, {
										required:
											createTwoLang || field.isEnglish === isEng
												? t('required')
												: false
									})}
								/>
							</div>
						))}

						{type === 'soil' && (
							<div className='mt-3 flex flex-col space-y-1'>
								<Label htmlFor="objectType"
									className='text-base'>{t('objectType')}</Label>
								<Controller
									control={control}
									name='objectType'
									render={({ field: { onChange, value } }) => (
										<Select
											id="objectType"
											defaultValue={value}
											value={value.toString()}
											onValueChange={type => onChange(Number(type))}>
											<SelectTrigger className="text-base">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{Object.entries(SOIL_ENUM).map(([value, title]) =>
													<SelectItem key={value} value={value.toString()}
														className='text-base'>{title}</SelectItem>)}
											</SelectContent>
										</Select>
									)}
								/>
							</div>
						)}

						<ul className='flex flex-col w-full'>
							{INFO.map(
								({ name, title }) =>
									name !== 'objectType' &&
									name !== 'comments' && (
										<li
											key={name}
											className={`mt-3`}
										>
											{translationsFields.map((field, index) => (
												<div
													key={field.id}
													className={`${field.isEnglish === isEng ? 'visible' : 'hidden'}`}
												>
													{name === 'soilFeatures' || name === 'description' ? (
														<Textarea
															required={false}
															{...register(`translations.${index}.${name}`)}
															label={title}
															isEng={isEng}
															placeholder=''
														/>
													) : (
														<Input
															required={false}
															error={errors.translations?.[index]?.[name]}
															label={title}
															isEng={isEng}
															{...register(`translations.${index}.${name}`)}
														/>
													)}
												</div>
											))}
										</li>
									)
							)}

							<li
								key='authors'
								className={`mt-3 ${isExternal ? 'opacity-50 pointer-events-none' : ''}`}
							>
								<ItemFilter
									name='authors'
									items={authors}
									title={t('authors')}
									type='authors'
								/>
							</li>
							<div className={`mt-3 flex flex-row items-center space-x-2`}>

								<Controller
									control={control}
									name='isExternal'
									render={({ field: { onChange, value } }) => (
										<Checkbox id='isExternal' checked={value} onCheckedChange={onChange} />
									)}
								/>
								<Label htmlFor="isExternal" className='cursor-pointer text-base'>{`${t('isExternal')} ${isEng ? '(EN)' : ''}`}</Label>
							</div>
							<div
								className={`${isExternal ? 'visible' : 'invisible opacity-0 max-h-0 overflow-hidden'} duration-300
                            w-full relative mt-2 `}
							>
								{translationsFields.map((field, index) => (
									<div
										key={field.id}
										className={`${field.isEnglish === isEng ? 'visible' : 'hidden'}`}
									>
										<Controller
											control={control}
											name={`translations.${index}.externalSource`}
											render={({ field: { onChange, value } }) => (
												<TextEditor
													type={`externalSource`}
													content={value}
													isSoil={true}
													setContent={html => onChange(html)}
												/>
											)}
										/>
									</div>
								))}
							</div>
						</ul>
					</div>

					<div className='flex flex-col w-full xl:h-[528px] md:h-[500px] h-[400px] mt-4'>
						<label className='font-medium'>{t('in_map')}</label>
						<ul className='flex flex-row mb-2 w-full space-x-3'>
							{['latitude', 'longtitude'].map(param => (
								<li
									key={param}
									className='w-full'
								>
									<Input
										required={false}
										error={errors[param]}
										placeholder={param.charAt(0).toUpperCase() + param.slice(1)}
										isEng={isEng}
										type='number'
										{...register(param)}
									/>
								</li>
							))}
						</ul>

						<div
							id='map-section'
							className='border rounded-lg overflow-hidden mt-1 w-full h-full'
						>
							<MapSelect
								id={id}
								type={type}
								latitude={watch('latitude')}
								longtitude={watch('longtitude')}
								onCoordinateChange={handleCoordChange}
							/>
						</div>
					</div>

					<div className='md:col-span-2'>
						<>
							<p className='font-medium mt-8'>{`${t('comments')} ${isEng ? '(EN)' : ''}`}</p>
							{translationsFields.map((field, index) => (
								<div
									key={field.id}
									className={`${field.isEnglish === isEng ? 'visible' : 'hidden'}`}
								>
									<Controller
										control={control}
										name={`translations.${index}.comments`}
										render={({ field: { onChange, value } }) => (
											<div className={`w-full relative mt-1 mb-2`}>
												<TextEditor
													type={`comments-${field.id}`}
													content={value}
													isSoil={true}
													setContent={html => onChange(html)}
												/>
											</div>
										)}
									/>
								</div>
							))}
						</>

						<div>
							<p className='font-medium mt-8'>
								{t('main_photo')}
								<span className='text-orange-500'>*</span>
							</p>
							<Controller
								control={control}
								name='mainPhoto'
								rules={{
									required: t('required'),
									validate: {
										hasPath: value => (value?.path ? true : t('required'))
									}
								}}
								render={({ field, fieldState }) => (
									<div className='md:w-[50%] w-full pr-2 mt-1'>
										{field.value?.isLoading || field.value?.path ? (
											<PhotoCard
												{...field.value}
												isEng={isEng}
												onDelete={id => handleMainPhotoDelete(id, field)}
												onChange={e =>
													field.onChange({
														...field.value,
														[isEng ? 'titleEng' : 'titleRu']: e.target.value
													})
												}
											/>
										) : (
											<div className='h-[150px]'>
												<DragAndDrop
													id='mainPhoto'
													error={fieldState.error}
													onLoadClick={file => handleMainPhotoSend(file, field)}
													isMultiple={false}
													accept='img'
												/>
											</div>
										)}
									</div>
								)}
							/>
						</div>

						<div className='mt-8 flex flex-col'>
							<p className='font-medium'>{t('other_photos')}</p>

							<Controller
								control={control}
								name='objectPhoto'
								render={({ field, fieldState }) => (
									<ul className={`mt-1 grid md:grid-cols-2 grid-cols-1 gap-4 `}>
										{!!field.value.length &&
											field.value.map((photo, idx) => (
												<li key={`photo-${idx}`}>
													<PhotoCard
														{...photo}
														isEng={isEng}
														onDelete={id => handleOtherPhotoDelete(id, field)}
														onChange={(e, id) =>
															handleOtherPhotosChange(e, id, field)
														}
													/>
												</li>
											))}
										<div className='h-[150px]'>
											<DragAndDrop
												id='objectPhoto'
												error={fieldState.error}
												onLoadClick={(file) =>
													handleOtherPhotoSend(file, field)
												}
												isMultiple={true}
												accept='img'
											/>
										</div>
									</ul>
								)}
							/>
						</div>

						{type === 'soil' && (
							<>
								<p className='font-medium mt-8'>{t('classifications')}</p>
								<GridComponent classifications={classifications} />
							</>
						)}

						<p className='font-medium mt-8'>{t('connection')}</p>
						<div className='grid md:grid-cols-2 grid-cols-1 gap-4 w-full mt-1'>
							{type !== 'ecosystem' && (
								<ItemFilter
									name='ecoSystems'
									type='ecosystem'
									title={t('ecosystems')}
									items={ecosystems}
								/>
							)}

							{type !== 'soil' && (
								<ItemFilter
									name='soilObjects'
									type='soil'
									title={t('soils')}
									items={soils}
								/>
							)}
							<ItemFilter
								name='publications'
								type='publications'
								title={t('publications')}
								items={publications}
							/>
						</div>

						{translationsFields.map((field, index) => (
							<div
								key={field.id}
								className={`mt-8 md:w-[50%] w-full md:pr-2 pr-0
                                        ${field.isEnglish === isEng ? 'visible' : 'hidden'}`}
							>
								<Input
									required={false}
									error={errors.translations?.[index]?.code}
									label={t('code')}
									isEng={isEng}
									{...register(`translations.${index}.code`)}
								/>
							</div>
						))}
					</div>
				</div>
			</div>
		</form>
	)
}
export default memo(forwardRef(ObjectForm))
