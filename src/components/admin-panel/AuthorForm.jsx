'use client'

import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { Oval } from 'react-loader-spinner'
import { useDispatch } from 'react-redux'

import { openAlert } from '@/store/slices/alertSlice'
import { setDirty } from '@/store/slices/formSlice'
import { closeModal, openModal } from '@/store/slices/modalSlice'
import modalThunkActions from '@/store/thunks/modalThunk'

import { useConstants } from '@/hooks/useConstants'

import { BASE_SERVER_URL } from '@/utils/constants'

import { sendPhoto } from '@/api/photo/send_photo'

import TextEditor from './TextEditor'
import ArrayInput from './ui-kit/ArrayInput'
import DragAndDrop from './ui-kit/DragAndDrop'
import Input from './ui-kit/Input'
import SubmitBtn from './ui-kit/SubmitBtn'
import Textarea from './ui-kit/Textarea'
import { getTranslation } from '@/i18n/client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Label } from '../ui/label'

export default function AuthorForm({
	_author,
	purpose,
	title,
	onFormSubmit,
	btnText
}) {
	const dispatch = useDispatch()
	const [photoLoading, setPhotoLoading] = useState(false)

	const defaultValues = {
		authorType: 3,
		photo: {},
		dataEng: {
			degree: '',
			description: '',
			name: '',
			organization: '',
			position: '',
			specialization: ''
		},
		dataRu: {
			degree: '',
			description: '',
			name: '',
			organization: '',
			position: '',
			specialization: ''
		},
		contacts: [],
		otherProfiles: []
	}
	const {
		register,
		handleSubmit,
		reset,
		control,
		watch,
		setValue,
		formState: { errors, isSubmitting, isDirty }
	} = useForm({
		defaultValues,
		mode: 'onChange'
	})
	const {
		fields: contactFields,
		append: appendContact,
		remove: removeContact,
		move: moveContact
	} = useFieldArray({
		control,
		name: 'contacts'
	})
	const {
		fields: profileFields,
		append: appendProfile,
		remove: removeProfile,
		move: moveProfile
	} = useFieldArray({
		control,
		name: 'otherProfiles'
	})
	const [role, setRole] = useState(null)
	const { locale } = useParams()
	const { t } = getTranslation(locale)
	const { AUTHOR_INFO, RANK_ENUM } = useConstants()

	useEffect(() => {
		localStorage.getItem('tokenData') &&
			setRole(JSON.parse(localStorage.getItem('tokenData'))?.role)
	}, [])

	useEffect(() => {
		if (_author) {
			reset({
				...defaultValues,
				..._author
			})
		}
	}, [_author])

	useEffect(() => {
		dispatch(setDirty(isDirty))
	}, [isDirty])

	const onCreateAuthor = async author => {
		await onFormSubmit(author)
	}

	const handlePhotoDelete = async field => {
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
			if (purpose === 'create') {
				await deletePhotoById(field.value.id)
			}
			field.onChange({})
			setValue('photoId', '')
		}
		dispatch(closeModal())
	}

	const fetchSendPhoto = async (file, field) => {
		setPhotoLoading(true)
		const result = await sendPhoto(file)
		if (result.success) {
			field.onChange(result.data)
			setValue('photoId', result.data.id)
		} else {
			dispatch(
				openAlert({
					title: t('error'),
					message: t('error_photo'),
					type: 'error'
				})
			)
		}
		setPhotoLoading(false)
	}

	return (
		<form
			onSubmit={handleSubmit(onCreateAuthor)}
			className='flex flex-col w-full flex-1'
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
			<div className='flex flex-col items-start pb-16'>
				<div className='flex sm:flex-row flex-col w-full 3xl:w-[50%]'>
					<div className='mt-4'>
						<div className=''>
							<p className='font-medium mb-1'>
								{t('photo')}
								<span className='text-orange-500'>*</span>
							</p>
							<Controller
								control={control}
								name='photo'
								rules={{ required: t('required') }}
								render={({ field, fieldState }) => (
									<div className='p-0.5 relative max-h-[370px] min-h-[370px] aspect-[3/4] rounded-md overflow-hidden'>
										{photoLoading ? (
											<span className='w-full h-full bg-black/10 rounded-md flex items-center justify-center'>
												<Oval
													height={30}
													width={30}
													color='#FFFFFF'
													visible={true}
													ariaLabel='oval-loading'
													secondaryColor='#FFFFFF'
													strokeWidth={4}
													strokeWidthSecondary={4}
												/>
											</span>
										) : (
											<>
												{field.value && field.value.path ? (
													<div className='relative max-h-full rounded-md overflow-hidden'>
														<button
															type='button'
															className='overflow-hidden rounded-tr-md rounded-bl-md p-[6px] text-sm font-medium z-10 absolute top-0 right-0 
                                backdrop-blur-md bg-black bg-opacity-40 text-zinc-200 hover:text-white duration-300'
															onClick={() => handlePhotoDelete(field)}
														>
															<svg
																width='800px'
																height='800px'
																viewBox='0 0 24 24'
																fill='none'
																xmlns='http://www.w3.org/2000/svg'
																className='w-4 h-4'
															>
																<g id='Menu / Close_LG'>
																	<path
																		id='Vector'
																		d='M21 21L12 12M12 12L3 3M12 12L21.0001 3M12 12L3 21.0001'
																		stroke='currentColor'
																		strokeWidth='3'
																		strokeLinecap='round'
																		strokeLinejoin='round'
																	/>
																</g>
															</svg>
														</button>
														<Image
															src={`${BASE_SERVER_URL}${field.value.pathResize.length ? field.value.pathResize : field.value.path}`}
															height={500}
															width={500}
															alt='author photo'
															className='bg-black/10 object-cover rounded-md max-h-[370px] min-h-[370px] aspect-[3/4] overflow-hidden'
														/>
													</div>
												) : (
													<DragAndDrop
														id='author-photo'
														error={fieldState.error}
														onLoadClick={file => fetchSendPhoto(file, field)}
														isMultiple={false}
														accept='img'
													/>
												)}
											</>
										)}
									</div>
								)}
							/>
						</div>
					</div>
					<ul className='sm:pl-6 w-full space-y-4'>
						{role === 'Admin' && (
							<li
								key='rang'
								className='w-[285px] mt-4 flex flex-col space-y-1'
							>
								<Label htmlFor="authorType"
									className='text-base'>{t('rank')}</Label>
								<Controller
									control={control}
									name='authorType'
									render={({ field: { onChange, value } }) => (
										<Select
											id="authorType"
											defaultValue={value}
											value={value.toString()}
											onValueChange={rank => onChange(Number(rank))}>
											<SelectTrigger className="text-base">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{Object.entries(RANK_ENUM).map(([value, title]) =>
													<SelectItem key={value} value={value.toString()}
														className='text-base'>{title}</SelectItem>)}
											</SelectContent>
										</Select>
									)}
								/>
							</li>
						)}

						<ArrayInput
							title={t('contacts')}
							name='contacts'
							fields={contactFields}
							onRemove={removeContact}
							onAppend={() => appendContact('')}
							onMove={moveContact}
							register={register}
						/>
						<ArrayInput
							title={t('otherProfiles')}
							name='otherProfiles'
							fields={profileFields}
							onRemove={removeProfile}
							onAppend={() => appendProfile('')}
							onMove={moveProfile}
							register={register}
						/>
					</ul>
				</div>

				<div className='flex xl:flex-row flex-col w-full mt-8'>
					<ul className='space-y-3 xl:w-[50%] xl:pr-6 xl:border-r'>
						<p className='text-blue-700 font-semibold'>Русская версия</p>
						{AUTHOR_INFO.map(({ name, isArray, title }) => (
							<li key={name}>
								{!isArray &&
									(name === 'description' ? (
										<Controller
											control={control}
											name={`dataRu.${name}`}
											render={({ field: { onChange, value } }) => (
												<div className='mt-4 flex flex-col'>
													<label className='font-medium min-h-fit'>
														{title}
													</label>
													<div className={`w-full relative`}>
														<TextEditor
															type={`about-ru`}
															content={value}
															setContent={html => onChange(html)}
														/>
													</div>
												</div>
											)}
										/>
									) : (
										// <Textarea
										//     required={false}
										//     {...register(`dataRu.${name}`)}
										//     label={title}
										//     placeholder='' />
										<Input
											required={name === 'name'}
											error={errors.dataRu?.[name]}
											label={title}
											{...register(`dataRu.${name}`, {
												required: name === 'name' ? t('required') : false
											})}
										/>
									))}
							</li>
						))}
					</ul>
					<ul className='space-y-3 xl:w-[50%] xl:pl-6 xl:mt-0 mt-6'>
						<p className='text-blue-700 font-semibold'>English version</p>
						{AUTHOR_INFO.map(({ name, isArray, title }) => (
							<li key={name}>
								{!isArray &&
									(name === 'description' ? (
										<Controller
											control={control}
											name={`dataEng.${name}`}
											render={({ field: { onChange, value } }) => (
												<div className='mt-4 flex flex-col'>
													<label className='font-medium min-h-fit'>
														{title}
													</label>
													<div className={`w-full relative`}>
														<TextEditor
															type={`about-en`}
															content={value}
															setContent={html => onChange(html)}
														/>
													</div>
												</div>
											)}
										/>
									) : (
										// <Textarea
										//     required={false}
										//     {...register(`dataEng.${name}`)}
										//     label={title}
										//     placeholder='' />
										<Input
											required={name === 'name'}
											error={errors.dataEng?.[name]}
											label={title}
											{...register(`dataEng.${name}`, {
												required: name === 'name' ? t('required') : false
											})}
										/>
									))}
							</li>
						))}
					</ul>
				</div>
			</div>
		</form>
	)
}
