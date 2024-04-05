'use client'

import { Oval } from 'react-loader-spinner'
import DragAndDrop from './ui-kit/DragAndDrop';

export default function AuthorForm({ author = [], onAuthorChange, onFormSubmit, isLoading }) {

    const INFO = [
        { title: 'ФИО', name: 'name' },
        { title: 'Организация', name: 'organization' },
        { title: 'Должность', name: 'position' },
        { title: 'Специальность', name: 'specialization' },
        { title: 'Ученая степень/звание', name: 'degree' },
        { title: 'Контакты', name: 'contacts', isArray: true },
        { title: 'Профили в других БД', name: 'otherPrifiles', isArray: true },
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const updatedData = { ...author, [name]: value };
        onAuthorChange(updatedData);
    }

    const handleFieldChange = (e, index) => {
        const { name, value } = e.target;
        const updatedData = { ...author, [name]: author[name].map((item, idx) => index === idx ? value : item) };
        onAuthorChange(updatedData);
    }

    const handleDeleteField = (name, index) => {
        const updatedArray = author[name] ? [...author[name]] : [];
        updatedArray.splice(index, 1);
        const updatedData = {
            ...author,
            [name]: updatedArray
        }
        onAuthorChange(updatedData)
    }

    const handleAddField = (name) => {
        const updatedData = {
            ...author,
            [name]: author[name] ? [...author[name], ''] : ['']
        }
        onAuthorChange(updatedData)
    }

    const handlePhotoLoad = (file) => {
        const updatedData = {
            ...author,
            'Photo.File': file
        }
        onAuthorChange(updatedData)
    }

    const Input = ({ title, name }) => {
        return <>
            <label className="font-medium">
                {title}
            </label >
            <input
                name={name}
                value={author[name]}
                onChange={handleInputChange}
                type="text"
                className="bg-white w-full mt-1 p-2 outline-none border focus:border-blue-600 shadow-sm rounded-md"
            />
        </>
    }

    const ArrayInput = ({ title, name }) => {
        console.log(author[name])
        return <div className='flex flex-col w-full mt-4'>
            <p className="font-medium">
                {title}
            </p>
            <ul>
                {author[name]?.map((item, index) => <li className='flex flex-row' key=''>
                    <input
                        value={author[name][index] || ''}
                        onChange={(e) => handleFieldChange(e, index)}
                        name={name}
                        type="text"
                        className="bg-white w-full mt-1 p-2 outline-none border focus:border-blue-600 shadow-sm rounded-md"
                    />
                    <button type='button'
                        className='p-2'
                        onClick={() => handleDeleteField(name, index)}>
                        <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className='w-[10px] h-[10px]'>
                            <g id="Menu / Close_LG">
                                <path id="Vector" d="M21 21L12 12M12 12L3 3M12 12L21.0001 3M12 12L3 21.0001" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </g>
                        </svg>
                    </button>
                </li>
                )}
            </ul>
            <button type='button' className='font-medium text-blue-600 w-fit'
                onClick={() => handleAddField(name)}>
                <span className='text-2xl pr-2'>+</span>
                Добавить
            </button>
        </div>
    }

    return (
        <form
            onSubmit={onFormSubmit}
            className="flex flex-col items-start">
            <div className='flex flex-row w-full gap-12'>
                <ul className='space-y-3 w-[60%] '>
                    {INFO.map(item => <li key={item.name}>
                        {item.isArray ? ArrayInput({ ...item }) : Input({ ...item })}
                    </li>)}
                </ul>
                <div className=''>
                    <p className="font-medium mb-1">Фото</p>
                    <div className='max-h-[370px] min-h-[370px]  aspect-[3/4]'>
                        <DragAndDrop onLoadClick={handlePhotoLoad} isMultiple={false} />
                    </div>

                </div>

            </div>

            <button
                type='submit'
                disabled={isLoading}
                className="min-w-[200px] mt-6 min-h-[40px] w-fit flex items-center justify-center px-8 py-2 font-medium text-center text-white transition-colors duration-300 
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
                    : 'Создать автора'}
            </button>
        </form>
    )
}
