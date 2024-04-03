'use client'

import { useState } from 'react'

export default function DragAndDrop({ onLoadClick, isMultiple }) {
    const [drag, setDrag] = useState(false);

    const handleChange = (e) => {
        e.preventDefault();
        console.log(e.target)
        let files = [...e.target.files];
        files.forEach(file => {
            onLoadClick(file)
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
        let files = [...e.dataTransfer.files];
        files.forEach(file => {
            onLoadClick(file)
        });
        setDrag(false);
    }

    return (
        <div className='h-full'>
            {drag
                ? <div className="flex flex-col justify-center items-center rounded border-black/80 bg-black/45
                        border-dashed border-[1.5px] duration-300 min-h-full text-center"
                    onDragStart={e => handleDragStart(e)}
                    onDragLeave={e => handleDragLeave(e)}
                    onDragOver={e => handleDragStart(e)}
                    onDrop={e => handleDrop(e)}>
                    <p className='text-white'>
                        Отпустите файлы
                    </p>
                </div>
                : <label htmlFor='geometry_file'
                    className="px-4 flex flex-col justify-center items-center space-y-2 
                     hover:border-zinc-600 h-full rounded border-dashed border-[1px] 
                    border-zinc-400 duration-300 cursor-pointer"
                    onDragStart={e => handleDragStart(e)}
                    onDragLeave={e => handleDragLeave(e)}
                    onDragOver={e => handleDragStart(e)}>

                    <p className='text-center'><span className='font-semibold'>Нажмите для загрузки</span> или перетащите файлы</p>

                    <input type="file" multiple={isMultiple} id='geometry_file' className="w-0 h-0"
                        onChange={handleChange} />
                </label>}
        </div>
    )
}
