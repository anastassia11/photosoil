import { BASE_SERVER_URL } from '@/utils/constants'
import Image from 'next/image'
import React from 'react'
import { Oval } from 'react-loader-spinner'

export default function PhotoCard({ id, path, titleEng, titleRu, fileName, onDelete, onChange, isLoading, isEng }) {
    return <div className='flex flex-row space-x-4 h-[150px] mt-1'>
        <div className='bg-black/10 relative flex flex-col justify-center items-center min-w-[150px] aspect-[1/1] rounded-md overflow-hidden
                            shadow-lg'>
            {isLoading ? <Oval
                height={30}
                width={30}
                color="#FFFFFF"
                visible={true}
                ariaLabel='oval-loading'
                secondaryColor="#FFFFFF"
                strokeWidth={4}
                strokeWidthSecondary={4} />
                : <Image src={`${BASE_SERVER_URL}${path}`} height={150} width={150} alt={id}
                    className='object-cover w-[150px] aspect-[1/1]' />}
            {!isLoading && <p className='overflow-hidden whitespace-nowrap overflow-ellipsis py-1 px-2 text-sm font-medium z-10 absolute bottom-0 backdrop-blur-md bg-black bg-opacity-40 text-white w-full'>
                {fileName}
            </p>}
            {!isLoading && <button type='button' className='overflow-hidden p-[6px] text-sm font-medium z-10 absolute top-0 right-0 rounded-bl-md
                                backdrop-blur-md bg-black bg-opacity-40 text-zinc-200 hover:text-white duration-300'
                onClick={() => onDelete(id)}>
                <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className='w-4 h-4'>
                    <g id="Menu / Close_LG">
                        <path id="Vector" d="M21 21L12 12M12 12L3 3M12 12L21.0001 3M12 12L3 21.0001" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                </svg>
            </button>}
        </div>

        <div className='w-full flex flex-col justify-between'>
            <textarea
                value={isEng ? (titleEng || '') : (titleRu || '')}
                onChange={e => {
                    onChange(e, id)
                }}
                type="text"
                placeholder={`Текст к фото ${isEng ? '(EN)' : ''}`}
                className="bg-white w-full p-2 outline-none border focus:border-blue-600 shadow-sm rounded-md max-h-full"
            />
        </div>
    </div>
}