'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import Input from './admin-panel/ui-kit/Input'
import SubmitBtn from './admin-panel/ui-kit/SubmitBtn'
import { getTranslation } from '@/i18n/client'
import { registerAuthor } from '@/api/account/post'

export default function JoinForm() {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting }
	} = useForm({
		mode: 'onChange'
	})
	const { locale } = useParams()
	const { t } = getTranslation(locale)
	const [submitting, setSubmitting] = useState(false)

	const handleFormSubmit = async userData => {
		const result = await registerAuthor(userData)
		if (result.success) {
			setSubmitting(true)
		} else {
			// setError('server', { type: 'manual', message: result.message })
		}
	}

	return (
		<div className='sm:space-y-6 sm:max-w-md m-auto sm:mt-16 w-full'>
			<div className='text-center'>
				<div className='mt-5 space-y-2'>
					<h3 className='sm:text-2xl text-xl font-semibold'>{t('join')}</h3>
					{!submitting && (
						<p className=''>
							{t('join_text')}
							<br />
							{t('account_exists')}{' '}
							<Link
								className='text-blue-600 hover:underline duration-300'
								href={`/${locale}/login`}
							>
								{t('login')}
							</Link>
						</p>
					)}
				</div>
			</div>
			{!submitting ? (
				<div className='sm:bg-white sm:shadow p-4 py-6 sm:p-6 sm:rounded-lg'>
					<form
						onSubmit={handleSubmit(handleFormSubmit)}
						className='space-y-5'
					>
						<Input
							required={true}
							error={errors.name}
							label={t('full_name')}
							{...register('name', {
								required: t('required'),
								pattern: {
									value: /^[A-Za-zА-Яа-яЁё\s]+$/,
									message: t('only_letters'),
								},
								minLength: {
									value: 5,
									message: t('min_length_5'),
								},
							}
							)}
						/>
						<Input
							required={false}
							error={errors.organization}
							label={t('organization')}
							{...register('organization')}
						/>
						<Input
							required={false}
							error={errors.post}
							label={t('post')}
							{...register('post')}
						/>
						<Input
							required={true}
							error={errors.email}
							label={t('email')}
							{...register('email', {
								required: t('required'),
								pattern: {
									value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
									message: t('invalid_email')
								}
							})}
						/>
						<SubmitBtn
							isSubmitting={isSubmitting}
							btnText={t('submit')}
						/>
					</form>
				</div>
			) : (
				<p className='text-center'>
					{t('application_accepted')}
				</p>
			)}
		</div>
	)
}
