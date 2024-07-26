import React, { useEffect, useState } from 'react'
import { Oval } from 'react-loader-spinner';
import Dropdown from './Dropdown';
import { useConstants } from '@/hooks/useConstants';
import { useTranslation } from 'react-i18next';

export default function DictionaryForm({ _dictionary, onFormSubmit, isLoading, isEdit, btnTitle }) {
    const { t } = useTranslation();
    const [dictionary, setDictionary] = useState({
        nameRu: '',
        nameEng: '',
        terms: [],
        translationMode: 0
    });

    const { TRANSLATION_ENUM } = useConstants();

    useEffect(() => {
        _dictionary && setDictionary(_dictionary)
    }, [_dictionary]);

    const handleNameChange = (e) => {
        const { name, value } = e.target;
        setDictionary(prev => ({ ...prev, [name]: value }));
    }

    const handleTermsChange = (e, id) => {
        const { name, value } = e.target;
        setDictionary(prev => ({
            ...prev,
            terms: prev.terms.map((term) => {
                if (term.id ? (term.id === id) : (prev.terms.indexOf(term) === id)) {
                    return { ...term, [name]: value };
                }
            })
        }));
    }

    const handleAddTerm = () => {
        setDictionary(prev => ({
            ...prev,
            terms: [...prev.terms, { nameRu: '', nameEng: '' }]
        }));
    }

    const handleDeleteTerm = (id) => {
        setDictionary(prev => ({
            ...prev,
            terms: prev.terms.filter((term, index) => (
                (isEdit && term.id !== id) || (!isEdit && index !== id)
            ))
        }));
    }

    const handleModeChange = (mode) => {
        setDictionary(prev => ({ ...prev, translationMode: mode }));
    }

    const handleFormSubmit = (e) => {
        e.preventDefault();
        onFormSubmit(dictionary);
    }

    return (
        <form
            onSubmit={e => handleFormSubmit(e)}
            className="flex flex-col h-fit items-start">
            <div className='xl:w-[50%] w-full'>
                <Dropdown name='Язык' value={dictionary.translationMode} items={TRANSLATION_ENUM}
                    onCategotyChange={handleModeChange} dropdownKey='language' />
            </div>

            <div className='flex xl:flex-row flex-col w-full mt-8'>
                {dictionary.translationMode == 0 || dictionary.translationMode == 2 ? <ul className={`space-y-3 
                    ${dictionary.translationMode == 0 ? 'xl:w-[50%] xl:pr-6 xl:border-r' : 'w-full'}`}>
                    <p className='text-blue-700 font-semibold'>Русская версия</p>
                    <div className='w-full'>
                        <label className="font-medium">
                            {t('classification')}
                        </label>
                        <input
                            value={dictionary.nameRu}
                            name='nameRu'
                            onChange={handleNameChange}
                            type="text"
                            className="bg-white w-full mt-1 p-2 outline-none border focus:border-blue-600 shadow-sm rounded-md"
                        />
                    </div>
                    {dictionary.terms.length ? <div className='flex flex-col w-full'>
                        <p className="font-medium">
                            {t('terms')}
                        </p>
                        <ul>
                            {dictionary.terms?.map((term, index) => <li className='flex flex-row' key={`term-${term.id || index}`}>
                                <input
                                    value={term.nameRu}
                                    onChange={(e) => handleTermsChange(e, term.id || index)}
                                    type="text"
                                    name='nameRu'
                                    className="bg-white w-full mt-1 p-2 outline-none border focus:border-blue-600 shadow-sm rounded-md"
                                />
                                <button type='button'
                                    className='p-2'
                                    onClick={() => handleDeleteTerm(term.id || index)}>
                                    <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className='w-[10px] h-[10px]'>
                                        <g id="Menu / Close_LG">
                                            <path id="Vector" d="M21 21L12 12M12 12L3 3M12 12L21.0001 3M12 12L3 21.0001" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                        </g>
                                    </svg>
                                </button>
                            </li>
                            )}
                        </ul>
                    </div> : ''}
                </ul> : ''}

                {dictionary.translationMode == 0 || dictionary.translationMode == 1 ? <ul className={`space-y-3 
                    ${dictionary.translationMode == 0 ? 'xl:w-[50%] xl:pl-6' : 'w-full'}`}>
                    <p className='text-blue-700 font-semibold'>English version</p>
                    <div className='w-full'>
                        <label className="font-medium">
                            {`${t('classification')} (EN)`}
                        </label>
                        <input
                            value={dictionary.nameEng}
                            name='nameEng'
                            onChange={handleNameChange}
                            type="text"
                            className="bg-white w-full mt-1 p-2 outline-none border focus:border-blue-600 shadow-sm rounded-md"
                        />
                    </div>
                    {dictionary.terms.length ? <div className='flex flex-col w-full'>
                        <p className="font-medium">
                            {`${t('terms')} (EN)`}
                        </p>
                        <ul>
                            {dictionary.terms?.map((term, index) => <li className='flex flex-row' key={`term-${term.id || index}`}>
                                <input
                                    value={term.nameEng}
                                    onChange={(e) => handleTermsChange(e, term.id || index)}
                                    type="text"
                                    name='nameEng'
                                    className="bg-white w-full mt-1 p-2 outline-none border focus:border-blue-600 shadow-sm rounded-md"
                                />
                                <button type='button'
                                    className='p-2'
                                    onClick={() => handleDeleteTerm(term.id || index)}>
                                    <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className='w-[10px] h-[10px]'>
                                        <g id="Menu / Close_LG">
                                            <path id="Vector" d="M21 21L12 12M12 12L3 3M12 12L21.0001 3M12 12L3 21.0001" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                        </g>
                                    </svg>
                                </button>
                            </li>
                            )}
                        </ul>
                    </div> : ''}
                </ul> : ''}
            </div>
            <div className='flex flex-col w-full'>
                <button type='button' className='font-medium text-blue-600 w-fit mt-2'
                    onClick={handleAddTerm}>
                    <span className='text-2xl pr-2'>+</span>
                    {t('add_term')}
                </button>
            </div>
            <button
                type='submit'
                disabled={isLoading}
                className="min-w-[250px] mt-4 min-h-[40px] w-fit flex items-center justify-center self-end px-8 py-2 font-medium text-center text-white transition-colors duration-300 
                transform bg-blue-600 disabled:bg-blue-600/70 rounded-lg hover:bg-blue-500 focus:outline-none active:bg-blue-600 align-bottom">
                {isLoading ?
                    <Oval
                        height={20}
                        width={20}
                        color="#FFFFFF"
                        visible={true}
                        ariaLabel='oval-loading'
                        secondaryColor="#FFFFFF"
                        strokeWidth={4}
                        strokeWidthSecondary={4} />
                    : btnTitle}
            </button>
        </form>
    )
}
