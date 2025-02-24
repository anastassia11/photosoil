'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { auth } from '@/api/account/login'

import Input from '../admin-panel/ui-kit/Input'
import SubmitBtn from '../admin-panel/ui-kit/SubmitBtn'

import { getTranslation } from '@/i18n/client'

export default function LoginPageComponent() {
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting }
	} = useForm({
		mode: 'onChange'
	})
	const [isPasswordHidden, setPasswordHidden] = useState(true)

	const router = useRouter()
	const { locale } = useParams()
	const { t } = getTranslation(locale)

	const handleFormSubmit = async userData => {
		const result = await auth(userData)
		if (result.success) {
			localStorage.setItem('email', userData.email)
			router.push('/admin')
		} else {
			setError('server', { type: 'manual', message: result.message })
		}
	}

	return (
		<div className='sm:space-y-6 sm:max-w-md m-auto sm:mt-24 w-full'>
			<div className='text-center'>
				<div className='mt-5 space-y-2'>
					<h3 className='sm:text-2xl text-xl font-semibold'>
						{t('authorization')}
					</h3>
					<p className=''>
						{t('no_account')}{' '}
						<Link
							href={`/${locale}/join`}
							prefetch={false}
							className='text-blue-600 hover:underline duration-300'
						>
							{t('join')}
						</Link>
					</p>
				</div>
			</div>
			<div className='sm:bg-white sm:shadow p-4 py-6 sm:p-6 sm:rounded-lg'>
				<form
					onSubmit={handleSubmit(handleFormSubmit)}
					className='space-y-5'
				>
					<Input
						required={true}
						error={errors.email}
						label={t('_login')}
						{...register('email', {
							required: t('required'),
							pattern: {
								value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
								message: t('invalid_email')
							}
						})}
					/>

					<div className='relative'>
						<button
							type='button'
							className='text-gray-400 absolute right-3 top-9 my-auto active:text-gray-600'
							onClick={() => setPasswordHidden(!isPasswordHidden)}
						>
							{!isPasswordHidden ? (
								<svg
									className='w-6 h-6'
									xmlns='http://www.w3.org/2000/svg'
									fill='none'
									viewBox='0 0 24 24'
									strokeWidth={1.5}
									stroke='currentColor'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										d='M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z'
									/>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
									/>
								</svg>
							) : (
								<svg
									xmlns='http://www.w3.org/2000/svg'
									fill='none'
									viewBox='0 0 24 24'
									strokeWidth={1.5}
									stroke='currentColor'
									className='w-6 h-6'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										d='M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88'
									/>
								</svg>
							)}
						</button>
						<Input
							required={true}
							error={errors.password}
							label={t('password')}
							type={isPasswordHidden ? 'password' : 'text'}
							{...register('password', {
								required: t('required'),
								minLength: {
									value: 8,
									message: t('password_check')
								}
							})}
						/>
					</div>
					{errors.server && (
						<p className='text-red-500 text-sm mt-[2px]'>
							{errors.server.message}
						</p>
					)}
					<SubmitBtn
						isSubmitting={isSubmitting}
						btnText={t('login')}
					/>
				</form>
			</div>
		</div>
	)
}
