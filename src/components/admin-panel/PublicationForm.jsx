'use client'

import { useParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'

import { openAlert } from '@/store/slices/alertSlice'
import { setDirty } from '@/store/slices/formSlice'
import { closeModal, openModal } from '@/store/slices/modalSlice'
import modalThunkActions from '@/store/thunks/modalThunk'

import { useConstants } from '@/hooks/useConstants'

import { getBaseEcosystems } from '@/api/ecosystem/get_base_ecosystems'
import { deletePhotoById } from '@/api/photo/delete_photo'
import { sendPhoto } from '@/api/photo/send_photo'
import { getBaseSoils } from '@/api/soil/get_base_soils'

import MapArraySelect from '../map/MapArraySelect'
import Filter from '../soils/Filter'

import DragAndDrop from './ui-kit/DragAndDrop'
import FileCard from './ui-kit/FileCard'
import Input from './ui-kit/Input'
import LangTabs from './ui-kit/LangTabs'
import MapInput from './ui-kit/MapInput'
import SubmitBtn from './ui-kit/SubmitBtn'
import Textarea from './ui-kit/Textarea'
import { getTranslation } from '@/i18n/client'
import TextEditor from './TextEditor'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Label } from '../ui/label'

export default function PublicationForm({
	_publication,
	pathname,
	onPublicationSubmit,
	btnText,
	title,
	oldTwoLang,
	oldIsEng
}) {
	const { locale } = useParams()
	const {
		register,
		reset,
		control,
		watch,
		trigger,
		setValue,
		getValues,
		setFocus,
		formState: { errors, isSubmitting, isDirty }
	} = useForm({
		mode: 'onChange',
		defaultValues: {
			type: 1,
			doi: '',
			translations: [
				{
					isEnglish: locale === 'en',
					authors: '',
					description: '',
					edition: '',
					name: ''
				}
			],
			file: {},
			soilObjects: [],
			ecoSystems: [],
			coordinates: []
		}
	})
	const { fields: translationsFields, append: appendTranslation } =
		useFieldArray({
			control,
			name: 'translations'
		})

	const coordinates = watch('coordinates')
	const file = useWatch({ control, name: 'file' })

	const [isEng, setIsEng] = useState(locale === 'en')
	const [createTwoLang, setCreateTwoLang] = useState(false)
	const [ecosystems, setEcosystems] = useState([])
	const [soils, setSoils] = useState([])
	const [currentCoord, setCurrentCoord] = useState({
		latitude: '',
		longtitude: ''
	})

	const dispatch = useDispatch()

	const mapRef = useRef(null)
	const { t } = getTranslation(locale)
	const { PUBLICATION_INFO, PUBLICATION_ENUM } = useConstants()

	useEffect(() => {
		fetchEcosystems()
		fetchSoils()
	}, [])

	useEffect(() => {
		dispatch(setDirty(isDirty))
	}, [isDirty])

	useEffect(() => {
		if (_publication) {
			reset({
				...getValues(),
				..._publication,
				soilObjects: _publication.soilObjects?.map(({ id }) => id),
				ecoSystems: _publication.ecoSystems?.map(({ id }) => id),
				coordinates: _publication.coordinates
					? JSON.parse(_publication.coordinates)
					: []
			})
			setIsEng(oldIsEng)
			setCreateTwoLang(_publication.translations?.length > 1)
		}
	}, [_publication])

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

	const handleFileLoad = async (file, field) => {
		field.onChange({ isLoading: true, name: file.name })
		const result = await sendPhoto(file)
		if (result.success) {
			field.onChange({ ...result.data, isLoading: false })
		} else {
			dispatch(
				openAlert({
					title: t('error'),
					message: t('error_file'),
					type: 'error'
				})
			)
		}
	}

	const handleFileDelete = async (e, field) => {
		e.stopPropagation()
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
				await deletePhotoById(field.value.id)
			}
			field.onChange({})
		}
		dispatch(closeModal())
	}

	const handleTwoLangChange = checked => {
		const translations = getValues('translations')
		if (pathname === 'edit') {
			if (checked) {
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
		setCreateTwoLang(checked)
	}

	const handleLangChange = value => {
		setIsEng(value)
	}

	const handleCoordChange = ({ latitude, longtitude }) => {
		setCurrentCoord({ latitude, longtitude })
	}

	const handleCoordInputChange = e => {
		const { value, name } = e.target
		setCurrentCoord(prev => {
			const _prev = { ...prev, [name]: Number(value) }
			mapRef.current.currentCoordChange([
				Number(_prev.longtitude),
				Number(_prev.latitude)
			])
			return _prev
		})
	}

	const handleCoordArrayChange = newCoordArray => {
		setValue('coordinates', newCoordArray)
	}

	const handleCoordDelete = e => {
		e.stopPropagation()
		mapRef.current.deleteCurrentPoint()
		setValue(
			'coordinates',
			coordinates.filter(
				({ latitude, longtitude }) =>
					latitude !== currentCoord.latitude &&
					longtitude !== currentCoord.longtitude
			)
		)
		setCurrentCoord({
			latitude: '',
			longtitude: ''
		})
	}

	const formSubmit = async e => {
		e.preventDefault()
		const result = await trigger()
		if (result) {
			const data = getValues()
			const updatedPublication = {
				...data,
				coordinates: JSON.stringify(data.coordinates),
				fileId: data.file.id
			}
			await onPublicationSubmit({ createTwoLang, isEng, updatedPublication })
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
			className='flex flex-col w-full flex-1 pb-[150px]'
		>
			<div className='mb-2 flex md:flex-row flex-col md:items-end md:justify-between space-y-1 md:space-y-0'>
				<h1 className='sm:text-2xl text-xl font-semibold mb-2 md:mb-0'>
					{title}
				</h1>
				<div className='md:min-w-[220px] md:max-w-[220px] md:w-fit'>
					<SubmitBtn
						isDisabled={file.isLoading}
						isSubmitting={isSubmitting}
						btnText={btnText}
					/>
				</div>
			</div>
			<div className='flex flex-col w-full h-fit pb-16'>
				<div className='flex flex-col w-full h-full pb-16'>
					<div className='grid md:grid-cols-2 grid-cols-1 gap-4 w-full'>
						<LangTabs
							isEng={isEng}
							oldIsEng={oldIsEng}
							createTwoLang={createTwoLang}
							oldTwoLang={oldTwoLang}
							isEdit={pathname === 'edit'}
							onLangChange={handleLangChange}
							onTwoLangChange={handleTwoLangChange}
						/>
						<ul className='flex flex-col w-full'>
							{PUBLICATION_INFO.map(({ name, title }, idx) => {
								return (
									<li
										key={name}
										className={`${idx && 'mt-3'}`}
									>
										{name === 'type' ? (
											<div className='flex flex-col space-y-1'>
												<Label htmlFor="type"
													className='text-base'>{title}</Label>
												<Controller
													control={control}
													name='type'
													render={({ field: { onChange, value } }) => (
														<Select
															id="type"
															value={value.toString()}
															onValueChange={type => onChange(Number(type))}>
															<SelectTrigger className="text-base">
																<SelectValue />
															</SelectTrigger>
															<SelectContent>
																{Object.entries(PUBLICATION_ENUM).map(([value, title]) =>
																	<SelectItem key={value} value={value.toString()}
																		className='text-base'>{title}</SelectItem>)}
															</SelectContent>
														</Select>
													)}
												/>
											</div>
										) : name === 'doi' ? (
											<Input
												required={false}
												label={title}
												{...register(`doi`, { required: false })}
											/>
										) : (
											translationsFields.map((field, index) => (
												<div
													key={field.id}
													className={`${field.isEnglish === isEng ? 'visible' : 'hidden'}`}
												>
													{name === 'description' ? (
														<Textarea
															required={false}
															{...register(`translations.${index}.${name}`)}
															label={title}
															isEng={isEng}
															placeholder=''
														/>
													) : name === 'comments' ? <>
														<p className='font-medium'>{`${t('comments')} ${isEng ? '(EN)' : ''}`}</p>
														<div
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

													</> : (
														<Input
															required={name === 'name'}
															error={errors.translations?.[index]?.[name]}
															label={title}
															isEng={isEng}
															{...register(`translations.${index}.${name}`, {
																required:
																	name === 'name' ? t('required') : false
															})}
														/>
													)}
												</div>
											))
										)}
									</li>
								)
							})}
						</ul>
						<div className='flex flex-col w-full xl:h-[528px] md:h-[500px] h-[400px]'>
							<label className='font-medium'>{t('in_map')}</label>
							<div className='flex flex-row space-x-2 pr-2'>
								<MapInput
									name='latitude'
									label='Latitude'
									value={currentCoord.latitude}
									onChange={handleCoordInputChange}
								/>
								<MapInput
									name='longtitude'
									label='Longtitude'
									value={currentCoord.longtitude}
									onChange={handleCoordInputChange}
								/>
								<button
									onClick={handleCoordDelete}
									type='button'
									className='text-gray-500 hover:text-red-700 duration-300'
								>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										fill='none'
										viewBox='0 0 24 24'
										strokeWidth={1.5}
										stroke='currentColor'
										className='size-5'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											d='m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0'
										/>
									</svg>
								</button>
							</div>

							<div
								id='map-section'
								className='border rounded-lg overflow-hidden mt-2 w-full h-full'
							>
								<MapArraySelect
									ref={mapRef}
									coordinates={coordinates}
									onInputChange={handleCoordChange}
									onCoordinatesChange={handleCoordArrayChange}
								/>
							</div>
						</div>
					</div>

					<p className='font-medium mt-3 w-full'>{t('file')}</p>
					<Controller
						control={control}
						name='file'
						render={({ field, fieldState }) => (
							<>
								{!!Object.keys(field.value).length ? (
									<div className='md:w-[50%] w-full pr-2'>
										<FileCard
											{...field.value}
											onDelete={e => handleFileDelete(e, field)}
										/>
									</div>
								) : (
									<div className='md:w-[50%] w-full h-[150px] pr-2 mt-1'>
										<DragAndDrop
											id='publ-files'
											error={fieldState.error}
											onLoadClick={file => handleFileLoad(file, field)}
											isMultiple={false}
										// accept='pdf'
										/>
									</div>
								)}
							</>
						)}
					/>

					<p className='font-medium mt-5'>{t('connection')}</p>
					<div className='md:w-[50%] w-full mt-1 flex flex-col space-y-4 pr-2'>
						<Controller
							control={control}
							name='soilObjects'
							render={({ field: { value, onChange } }) => (
								<Filter
									locale={locale}
									name={t('soils')}
									items={soils}
									type='soil'
									selectedItems={value}
									addItem={newItem =>
										value.includes(newItem)
											? onChange(value.filter(item => item !== newItem))
											: onChange([...value, newItem])
									}
									resetItems={() => onChange([])}
								/>
							)}
						/>
						<Controller
							control={control}
							name='ecoSystems'
							render={({ field: { value, onChange } }) => (
								<Filter
									locale={locale}
									name={t('ecosystems')}
									items={ecosystems}
									type='ecosystem'
									selectedItems={value}
									addItem={newItem =>
										value.includes(newItem)
											? onChange(value.filter(item => item !== newItem))
											: onChange([...value, newItem])
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
