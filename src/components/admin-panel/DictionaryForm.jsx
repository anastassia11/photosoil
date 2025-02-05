'use client'

import React, { useEffect } from 'react'
import Dropdown from './ui-kit/Dropdown';
import { useConstants } from '@/hooks/useConstants';
import Input from './ui-kit/Input';
import { useParams } from 'next/navigation';
import { getTranslation } from '@/i18n/client';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import SubmitBtn from './ui-kit/SubmitBtn';
import ArrayInput from './ui-kit/ArrayInput';
import { setDirty } from '@/store/slices/formSlice';
import { useDispatch } from 'react-redux';

export default function DictionaryForm({ _dictionary, title, onFormSubmit, btnTitle }) {
    const dispatch = useDispatch();
    const { locale } = useParams();
    const { t } = getTranslation(locale);
    const defaultValues = {
        translationMode: 0,
        isAlphabeticallOrder: true,
        nameEng: '',
        nameRu: '',
        terms: []
    };
    const { register, handleSubmit, reset, control, watch, formState: { errors, isSubmitting, isDirty } } = useForm({
        defaultValues, mode: 'onChange'
    });
    const { fields: termsFields, append: appendTerms, remove: removeTerms, move: moveTerms } = useFieldArray({
        control,
        name: 'terms'
    });

    const translationMode = watch('translationMode');
    const sortByAlpha = watch('isAlphabeticallOrder');
    const { TRANSLATION_ENUM } = useConstants();

    useEffect(() => {
        _dictionary && reset({
            ...defaultValues,
            ..._dictionary
        });
    }, [_dictionary])

    useEffect(() => {
        dispatch(setDirty(isDirty));
    }, [isDirty])

    const submitForm = async (dictionary) => {
        await onFormSubmit({
            ...dictionary,
            terms: dictionary.terms.map((term, index) => ({ ...term, order: index + 1 }))
        });
    }

    return (
        <form onSubmit={handleSubmit(submitForm)} className="flex flex-col w-full flex-1 pb-[150px]" >
            <div
                className='mb-2 flex md:flex-row flex-col md:items-end md:justify-between space-y-1 md:space-y-0'>
                <h1 className='sm:text-2xl text-xl font-semibold mb-2 md:mb-0'>
                    {title}
                </h1>
                <div className='md:min-w-[220px] md:max-w-[220px] md:w-fit'>
                    <SubmitBtn isSubmitting={isSubmitting} btnText={btnTitle} />
                </div>
            </div>

            <div className="flex flex-col h-fit items-start pb-16 mt-4">
                <div className='xl:w-[50%] w-full'>
                    <Controller control={control}
                        name='translationMode'
                        render={({ field: { onChange, value } }) =>
                            <Dropdown name={t('language')} value={value}
                                items={TRANSLATION_ENUM} onCategotyChange={(lang) => onChange(Number(lang))} dropdownKey='language' />
                        } />
                </div>

                <label htmlFor='isAlphabeticallOrder'
                    className={`ml-1 font-medium select-none mt-3 flex flex-row cursor-pointer items-center`}>
                    <input type="checkbox" id='isAlphabeticallOrder'
                        {...register(`isAlphabeticallOrder`)}
                        className="cursor-pointer min-w-5 w-5 min-h-5 h-5 mr-2 rounded border-gray-300 " />
                    <span>{t('sortByAlpha')}</span>
                </label>

                <div className='flex xl:flex-row flex-col w-full mt-8'>
                    {translationMode == 0 || translationMode == 2 ? <ul className={`space-y-3 
                    ${translationMode == 0 ? 'xl:w-[50%] xl:pr-6 xl:border-r' : 'w-full'}`}>
                        <p className='text-blue-700 font-semibold'>Русская версия</p>
                        <div className='w-full'>
                            <Input
                                required={translationMode == 0 || translationMode == 2}
                                error={errors.nameRu}
                                label={t('classification')}
                                {...register(`nameRu`,
                                    {
                                        required: translationMode == 0 || translationMode == 2
                                            ? t('required') : false
                                    })}
                            />
                        </div>
                        <ArrayInput title={t('terms')} name='terms' subName='nameRu' fields={termsFields}
                            sortable={sortByAlpha}
                            onRemove={removeTerms} onAppend={appendTerms}
                            onMove={moveTerms}
                            register={register} />
                    </ul> : ''}

                    {translationMode == 0 || translationMode == 1 ? <ul className={`space-y-3 xl:mt-0 mt-6
                    ${translationMode == 0 ? 'xl:w-[50%] xl:pl-6' : 'w-full'}`}>
                        <p className='text-blue-700 font-semibold'>English version</p>
                        <div className='w-full'>
                            <Input
                                required={translationMode == 0 || translationMode == 1}
                                error={errors.nameEng}
                                label={t('classification')}
                                isEng={true}
                                {...register(`nameEng`,
                                    {
                                        required: translationMode == 0 || translationMode == 1
                                            ? t('required') : false
                                    })}
                            />
                        </div>
                        <ArrayInput title={t('terms')} name='terms' subName='nameEng' fields={termsFields}
                            sortable={sortByAlpha}
                            onRemove={removeTerms} onAppend={appendTerms}
                            onMove={moveTerms}
                            register={register} />
                    </ul> : ''}
                </div>
            </div>
        </form >
    )
}
