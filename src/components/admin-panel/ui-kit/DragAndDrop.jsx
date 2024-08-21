'use client'

import { getTranslation } from '@/i18n/client';
import { openAlert } from '@/store/slices/alertSlice';
import { useParams } from 'next/navigation';
import { useState } from 'react'
import { useDispatch } from 'react-redux';

export default function DragAndDrop({ id, onLoadClick, isMultiple, accept }) {
    const dispatch = useDispatch();
    const [drag, setDrag] = useState(false);
    const { locale } = useParams();
    const { t } = getTranslation(locale);

    const handleChange = (e) => {
        e.preventDefault();
        const type = accept === 'img' ? 'image/' : accept === 'pdf' ? 'application/pdf'
            : ''
        let files = [...e.target.files];
        files.forEach((file, index) => {
            if (file.type.startsWith(type)) {
                onLoadClick(file, index)
            } else {
                dispatch(openAlert({
                    title: t('warning'), message: `${t('error_file')} (.${accept})}`, type: 'warning'
                }))
            }
        });
    }

    const handleDragStart = (e) => {
        e.preventDefault();
        setDrag(true);
    }

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDrag(false);
    }

    const handleDrop = (e) => {
        e.preventDefault();
        const type = accept === 'img' ? 'image/' : accept === 'pdf' ? 'application/pdf' : '';
        let files = [...e.dataTransfer.files];

        files.forEach((file, index) => {
            if (file.type.startsWith(type)) {
                onLoadClick(file, index)
            } else {
                dispatch(openAlert({ title: t('warning'), message: `${t('error_file')} (.${accept})`, type: 'warning' }))
            }
        });
        setDrag(false);
    }

    return (
        <div className='min-h-full min-w-full flex flex-1'>
            {drag
                ? <div className="flex flex-col justify-center items-center rounded border-black/80 bg-black/45
                        border-dashed border-[1.5px] duration-300 flex-1 text-center"
                    onDragStart={e => handleDragStart(e)}
                    onDragLeave={e => handleDragLeave(e)}
                    onDragOver={e => handleDragStart(e)}
                    onDrop={e => handleDrop(e)}>
                    <p className='text-white'>
                        {t('release_files')}
                    </p>
                </div>
                : <label htmlFor={id}
                    className="px-4 flex flex-col justify-center items-center space-y-2 
                     hover:border-zinc-600 flex-1 rounded border-dashed border-[1px] 
                    border-zinc-400 duration-300 cursor-pointer w-full"
                    onDragStart={e => handleDragStart(e)}
                    onDragLeave={e => handleDragLeave(e)}
                    onDragOver={e => handleDragStart(e)}>

                    <p className='text-center'><span className='font-semibold'>{t('click_download')}</span> {t('drag_files')}</p>

                    <input type="file" multiple={isMultiple} id={id} className="w-0 h-0"
                        accept={`${accept === 'img' ? "image/*" : accept === 'pdf' ? '.pdf' : ''} `}
                        onChange={handleChange} />
                </label>}
        </div>
    )
}
