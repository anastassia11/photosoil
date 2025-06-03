'use client'

import { useParams } from 'next/navigation';
import { getTranslation } from '@/i18n/client';
import Input from '../admin-panel/ui-kit/Input';
import { useForm, useWatch } from 'react-hook-form';
import SubmitBtn from '../admin-panel/ui-kit/SubmitBtn';
import { resetPassword } from '@/api/account/reset_password';
import { useEffect, useState } from 'react';

export default function ForgotPasswordPageComponent() {
    const {
        register,
        control,
        handleSubmit,
        setError,
        clearErrors,
        formState: { errors, isSubmitting }
    } = useForm({
        mode: 'onChange'
    })

    const email = useWatch({ control, name: 'email' })
    const [submitting, setSubmitting] = useState(false)
    const { locale } = useParams()
    const { t } = getTranslation(locale)

    useEffect(() => {
        clearErrors('server')
    }, [email, clearErrors])

    const handleFormSubmit = async userData => {
        const result = await resetPassword(userData)
        if (result.success) {
            setSubmitting(true)
        } else {
            setError('server', { type: 'manual', message: result.message })
        }
    }

    return (
        <div className='sm:space-y-6 sm:max-w-md m-auto sm:mt-24 w-full p-4 sm:p-6'>
            {!submitting ? <div className=''>
                <div className='mt-5 space-y-2'>
                    <h3 className='sm:text-2xl text-xl font-semibold'>
                        {t('forgot-password-title')}
                    </h3>
                    <p>
                        {t('forgot-password-description1')}
                    </p>
                    <p>
                        {t('forgot-password-description2')}
                    </p>
                    <p>
                        {t('forgot-password-description3')}
                    </p>
                </div>
                <form
                    onSubmit={handleSubmit(handleFormSubmit)}
                    className='space-y-5 mt-8'
                >
                    <Input
                        required={true}
                        error={errors.email}
                        {...register('email', {
                            required: t('required'),
                            pattern: {
                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                message: t('invalid_email')
                            }
                        })}
                    />
                    {errors.server && (
                        <p className='text-red-500 text-sm mt-[2px]'>
                            {errors.server.message}
                        </p>
                    )}
                    <div className='w-48'>
                        <SubmitBtn
                            isSubmitting={isSubmitting}
                            btnText={t('reset_password')}
                        />
                    </div>
                </form>
            </div> : <div className='mt-5 space-y-2'>
                <h3 className='sm:text-2xl text-xl font-semibold'>
                    {t('check_mail')}
                </h3>
                <p>
                    {`${t('forgot-password-description4')} ${email}.`}
                </p>
                <p>
                    {t('forgot-password-description3')}
                </p>
            </div>}
        </div >
    )
}
