'use client'

import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'

import TextEditor from '@/components/admin-panel/TextEditor'
import DragAndDrop from '@/components/admin-panel/ui-kit/DragAndDrop'
import FileCard from '@/components/admin-panel/ui-kit/FileCard'
import LangTabs from '@/components/admin-panel/ui-kit/LangTabs'
import SubmitBtn from '@/components/admin-panel/ui-kit/SubmitBtn'

import { openAlert } from '@/store/slices/alertSlice'
import { setDirty } from '@/store/slices/formSlice'
import { closeModal, openModal } from '@/store/slices/modalSlice'
import modalThunkActions from '@/store/thunks/modalThunk'

import { deletePhotoById } from '@/api/photo/delete_photo'
import { sendPhoto } from '@/api/photo/send_photo'
import { getRules } from '@/api/rules/get_rules'
import { putRules } from '@/api/rules/put_rules'

import { getTranslation } from '@/i18n/client'
import uuid from 'react-uuid'

export default function PolicyAdminComponent() {
	const dispatch = useDispatch()
	const { locale } = useParams()
	const { t } = getTranslation(locale)
	const [isEng, setIsEng] = useState(locale === 'en')

	const {
		control,
		handleSubmit,
		reset,
		formState: { isSubmitting, isDirty }
	} = useForm({
		mode: 'onBlur',
		defaultValues: {
			contentRu: '',
			contentEng: '',
			files: []
		}
	})
	const [localFiles, setLocalFiles] = useState([])
	const [initialFilesIds, setInitialFilesIds] = useState([])

	const [btnDisabled, setBtnDisabled] = useState(false)

	useEffect(() => {
		fetchRules()
	}, [])

	useEffect(() => {
		setBtnDisabled(localFiles?.some((file) => file.isLoading))
	}, [localFiles])

	useEffect(() => {
		dispatch(setDirty(isDirty))
	}, [isDirty])

	const fetchRules = async () => {
		const result = await getRules()
		if (result.success) {
			reset(result.data)
			const _files = result.data.files ?? []
			setLocalFiles(_files)
			setInitialFilesIds(_files.map(({ id }) => id))
		}
	}

	const handleLangChange = value => {
		setIsEng(value)
	}

	const submitForm = async data => {
		const dataForSubmit = {
			...data,
			files: data.files.map(({ id }) => id)
		}
		const result = await putRules(dataForSubmit)
		if (result.success) {
			for (const id of initialFilesIds) {
				if (!dataForSubmit.files.includes(id)) {
					await deletePhotoById(id)
				}
			}
			dispatch(setDirty(false))
			dispatch(
				openAlert({
					title: t('success'),
					message: t('success_edit'),
					type: 'success'
				})
			)
		} else {
			dispatch(
				openAlert({
					title: t('error'),
					message: t('error_edit'),
					type: 'error'
				})
			)
		}
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
			field.onChange(field.value.filter(file => file.id !== id))
		}
		dispatch(closeModal())
	}

	const handleFilesSend = async (file, index, field) => {
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

	return (
		<form
			onSubmit={handleSubmit(submitForm)}
			className='flex flex-col w-fill space-y-4'
		>
			<div className='flex flex-row justify-between items-center'>
				<h1 className='sm:text-2xl text-xl font-semibold'>
					{t('rules_service')}
				</h1>
				<div className='md:min-w-[220px] md:max-w-[220px] md:w-fit'>
					<SubmitBtn
						isSubmitting={isSubmitting}
						btnText={t('save')}
						isDisabled={btnDisabled}
					/>
				</div>
			</div>
			<div className={`flex flex-col w-full h-fit max-h-full pb-16`}>
				<LangTabs
					isEng={isEng}
					createTwoLang={true}
					oldTwoLang={true}
					isEdit={true}
					onLangChange={handleLangChange}
				/>
				<ul>
					{['contentRu', 'contentEng'].map(item => (
						<li
							key={item}
							className={`${(item === 'contentEng') === isEng ? 'visible' : 'hidden'}`}
						>
							<Controller
								control={control}
								name={item}
								render={({ field: { onChange, value } }) => (
									<div className='mt-4 flex flex-col'>
										<div className={`w-full relative`}>
											<TextEditor
												type={item}
												content={value}
												setContent={html => onChange(html)}
											/>
										</div>
									</div>
								)}
							/>
						</li>
					))}
				</ul>
				<div className='mt-8 flex flex-col'>
					<label className='font-medium min-h-fit'>{`${t('files')}`}</label>
					<Controller
						control={control}
						name='files'
						render={({ field, fieldState }) => (
							<ul className={`mt-1 flex flex-col w-full`}>
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
									className={`h-[150px] md:w-[50%] w-full md:pr-2 pr-0 ${!!Object.keys(field.value).length && 'mt-4'}`}
								>
									<DragAndDrop
										id='policy-files'
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
			</div>
		</form>
	)
}
