import React, { useEffect, useState } from 'react'
import { Oval } from 'react-loader-spinner';

export default function DictionaryForm({ dictionary, onDictionaryChange, onFormSubmit, isLoading }) {

    const handleNameChange = (e) => {
        const updatedData = { ...dictionary, name: e.target.value };
        onDictionaryChange(updatedData);
    }

    const handleTermsChange = (e, index) => {
        const updatedData = {
            ...dictionary,
            terms: dictionary.terms.map((term, idx) => idx === index ? e.target.value : term)
        }
        onDictionaryChange(updatedData)
    }

    const handleAddTerm = () => {
        const updatedData = {
            ...dictionary,
            terms: [...dictionary.terms, '']
        }
        onDictionaryChange(updatedData)
    }

    const handleDeleteTerm = (index) => {
        const updatedTerms = [...item.terms];
        updatedTerms.splice(index, 1);
        const updatedData = {
            ...dictionary,
            terms: updatedTerms
        }
        onDictionaryChange(updatedData)
    }

    return (
        <form
            onSubmit={onFormSubmit}
            className="flex flex-col w-[50%] h-fit space-y-3 items-start">
            <div className='w-full'>
                <label className="font-medium">
                    Название
                </label>
                <input
                    value={dictionary.name}
                    onChange={handleNameChange}
                    type="text"
                    className="bg-white w-full mt-1 p-2 outline-none border focus:border-blue-600 shadow-sm rounded-md"
                />
            </div>

            <div className='flex flex-col w-full'>
                <p className="font-medium">
                    Термины
                </p>
                <ul>
                    {dictionary.terms?.map((term, index) => <li className='flex flex-row' key=''>
                        <input
                            value={dictionary.terms[index] || ''}
                            onChange={(e) => handleTermsChange(e, index)}
                            type="text"
                            className="bg-white w-full mt-1 p-2 outline-none border focus:border-blue-600 shadow-sm rounded-md"
                        />
                        <button type='button'
                            className='p-2'
                            onClick={() => handleDeleteTerm(index)}>
                            <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className='w-[10px] h-[10px]'>
                                <g id="Menu / Close_LG">
                                    <path id="Vector" d="M21 21L12 12M12 12L3 3M12 12L21.0001 3M12 12L3 21.0001" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                </g>
                            </svg>
                        </button>
                    </li>
                    )}
                </ul>
                <button type='button' className='font-medium text-blue-600 w-fit mt-2'
                    onClick={handleAddTerm}>
                    <span className='text-2xl pr-2'>+</span>
                    Добавить термин
                </button>
            </div>
            <button
                type='submit'
                disabled={isLoading}
                className="min-w-[200px] mt-4 min-h-[40px] w-fit flex items-center justify-center self-end px-8 py-2 font-medium text-center text-white transition-colors duration-300 
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
                    : 'Создать словарь'}
            </button>
        </form>
    )
}
