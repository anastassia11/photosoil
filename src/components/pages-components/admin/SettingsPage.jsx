'use client'

import { changePassword } from '@/api/account/change_password'
import { resetPassword } from '@/api/account/reset_password'
import Input from '@/components/admin-panel/ui-kit/Input'
import SubmitBtn from '@/components/admin-panel/ui-kit/SubmitBtn'
import { getTranslation } from '@/i18n/client'
import { openAlert } from '@/store/slices/alertSlice'
import { setDirty } from '@/store/slices/formSlice'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useDispatch } from 'react-redux'

export default function SettingsPage() {
    const { locale } = useParams()
    const { t } = getTranslation(locale)
    const dispatch = useDispatch()

    const {
        register,
        control,
        reset,
        handleSubmit,
        formState: { errors, isSubmitting, isDirty }
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            confirmPassword: "",
            currentPassword: "",
            newPassword: ""
        }
    })

    const newPassword = useWatch({ control, name: "newPassword" })

    useEffect(() => {
        dispatch(setDirty(isDirty))
    }, [isDirty])

    const handleFormSubmit = async userData => {
        const result = await changePassword(userData)
        if (result.success) {
            dispatch(setDirty(false))
            reset()
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

    return (
        <div className='flex flex-col w-full space-y-4'>
            <div className='flex flex-row justify-between items-center'>
                <h1 className='sm:text-2xl text-xl font-semibold'>
                    {t('user_preferences')}
                </h1>
            </div>
            <form
                onSubmit={handleSubmit(handleFormSubmit)}
                className='space-y-5 mt-8 flex flex-col w-full md:max-w-lg'
            >
                <Input
                    required={true}
                    error={errors.currentPassword}
                    label={t('currentPassword')}
                    {...register('currentPassword', {
                        required: t('required'),
                        minLength: {
                            value: 8,
                            message: t('password_check')
                        }
                    })}
                />
                <Input
                    required={true}
                    error={errors.newPassword}
                    label={t('newPassword')}
                    {...register('newPassword', {
                        required: t('required'),
                        minLength: {
                            value: 8,
                            message: t('password_check')
                        }
                    })}
                />
                <Input
                    required={true}
                    error={errors.confirmPassword}
                    label={t('confirmPassword')}
                    {...register('confirmPassword', {
                        required: t('required'),
                        minLength: {
                            value: 8,
                            message: t('password_check')
                        },
                        validate: (value) =>
                            value === newPassword || t('validatePassword')
                    })}
                />
                <div className='w-48'>
                    <SubmitBtn
                        isSubmitting={isSubmitting}
                        btnText={t('changePassword')}
                    />
                </div>
            </form>
        </div>
    )
}
