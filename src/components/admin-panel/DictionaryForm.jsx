'use client'

import { useParams } from 'next/navigation'
import React, { useEffect } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'

import { setDirty } from '@/store/slices/formSlice'

import { useConstants } from '@/hooks/useConstants'

import ArrayInput from './ui-kit/ArrayInput'
import Input from './ui-kit/Input'
import SubmitBtn from './ui-kit/SubmitBtn'
import { getTranslation } from '@/i18n/client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'

export default function DictionaryForm({
	_dictionary,
	title,
	onFormSubmit,
	btnTitle
}) {
	const dispatch = useDispatch()
	const { locale } = useParams()
	const { t } = getTranslation(locale)
	const defaultValues = {
		translationMode: 0,
		isAlphabeticallOrder: true,
		nameEng: '',
		nameRu: '',
		terms: []
	}
	const {
		register,
		handleSubmit,
		reset,
		control,
		watch,
		formState: { errors, isSubmitting, isDirty }
	} = useForm({
		defaultValues,
		mode: 'onChange'
	})
	const {
		fields: termsFields,
		append: appendTerms,
		remove: removeTerms,
		move: moveTerms
	} = useFieldArray({
		control,
		name: 'terms'
	})

	const translationMode = watch('translationMode')
	const sortByAlpha = watch('isAlphabeticallOrder')
	const { TRANSLATION_ENUM } = useConstants()

	useEffect(() => {
		_dictionary &&
			reset({
				...defaultValues,
				..._dictionary
			})
	}, [_dictionary])

	useEffect(() => {
		dispatch(setDirty(isDirty))
	}, [isDirty])

	const submitForm = async dictionary => {
		await onFormSubmit({
			...dictionary,
			terms: dictionary.terms.map((term, index) => ({
				...term,
				order: index + 1
			}))
		})
	}

	return (
		<form
			onSubmit={handleSubmit(submitForm)}
			className='flex flex-col w-full flex-1 pb-[150px]'
		>
			<div className='mb-2 flex md:flex-row flex-col md:items-end md:justify-between space-y-1 md:space-y-0'>
				<h1 className='sm:text-2xl text-xl font-semibold mb-2 md:mb-0'>
					{title}
				</h1>
				<div className='md:min-w-[220px] md:max-w-[220px] md:w-fit'>
					<SubmitBtn
						isSubmitting={isSubmitting}
						btnText={btnTitle}
					/>
				</div>
			</div>

			<div className='flex flex-col h-fit items-start pb-16 mt-4'>
				<div className='xl:w-[50%] w-full flex flex-col space-y-1'>
					<Label htmlFor="translationMode"
						className='text-base'>{t('language')}</Label>
					<Controller
						control={control}
						name='translationMode'
						render={({ field: { onChange, value } }) => (
							<Select
								id="translationMode"
								value={value.toString()}
								onValueChange={lang => onChange(Number(lang))}>
								<SelectTrigger className="text-base">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{Object.entries(TRANSLATION_ENUM).map(([value, title]) =>
										<SelectItem key={value} value={value.toString()}
											className='text-base'>{title}</SelectItem>)}
								</SelectContent>
							</Select>
						)}
					/>
				</div>

				<div className={`ml-1 mt-3 flex flex-row items-center space-x-2`}>
					<Controller
						control={control}
						name='isAlphabeticallOrder'
						render={({ field: { onChange, value } }) => (
							<Checkbox id='isAlphabeticallOrder' checked={value} onCheckedChange={onChange} />
						)}
					/>
					<Label htmlFor="isAlphabeticallOrder" className='cursor-pointer text-base'>{t('sortByAlpha')}</Label>
				</div>

				<div className='flex xl:flex-row flex-col w-full mt-8'>
					{translationMode == 0 || translationMode == 2 ? (
						<ul
							className={`space-y-3 
                    ${translationMode == 0 ? `${locale === 'ru' ? 'order-1 xl:pr-6 xl:border-r' : 'order-2 xl:pl-6'} xl:w-[50%]` : 'w-full'}`}
						>
							<p className='text-blue-700 font-semibold'>Русская версия</p>
							<div className='w-full'>
								<Input
									required={translationMode == 0 || translationMode == 2}
									error={errors.nameRu}
									label={t('classification')}
									{...register(`nameRu`, {
										required:
											translationMode == 0 || translationMode == 2
												? t('required')
												: false
									})}
								/>
							</div>
							<ArrayInput
								title={t('terms')}
								name='terms'
								subName='nameRu'
								fields={termsFields}
								sortable={sortByAlpha}
								onRemove={removeTerms}
								onAppend={() => appendTerms({ nameRu: '', nameEng: '' })}
								onMove={moveTerms}
								register={register}
							/>
						</ul>
					) : (
						''
					)}

					{translationMode == 0 || translationMode == 1 ? (
						<ul
							className={`space-y-3 xl:mt-0 mt-6 
                    ${translationMode == 0 ? `${locale === 'en' ? 'order-1 xl:pr-6 xl:border-r' : 'order-2 xl:pl-6'} xl:w-[50%]` : 'w-full'}`}
						>
							<p className='text-blue-700 font-semibold'>English version</p>
							<div className='w-full'>
								<Input
									required={translationMode == 0 || translationMode == 1}
									error={errors.nameEng}
									label={t('classification')}
									isEng={true}
									{...register(`nameEng`, {
										required:
											translationMode == 0 || translationMode == 1
												? t('required')
												: false
									})}
								/>
							</div>
							<ArrayInput
								title={t('terms')}
								name='terms'
								subName='nameEng'
								fields={termsFields}
								sortable={sortByAlpha}
								onRemove={removeTerms}
								onAppend={() => appendTerms({ nameRu: '', nameEng: '' })}
								onMove={moveTerms}
								register={register}
							/>
						</ul>
					) : (
						''
					)}
				</div>
			</div>
		</form>
	)
}
