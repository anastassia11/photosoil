import React from 'react'

export default function Input({ label, name, type, value, required, onChange, isEng }) {

    return (
        <div className='w-full'>
            {label ? <label className="font-medium flex flex-row">
                {label}{isEng ? ' (EN) ' : ''}<span className='text-orange-500'>{required ? '*' : ''}</span>
            </label> : ''}
            <input
                autoComplete="off"
                required={required}
                value={value}
                onChange={onChange}
                name={name}
                type={type || 'text'}
                className="h-[40px] bg-white w-full mt-1 p-2 outline-none border focus:border-blue-600 shadow-sm rounded-md"
            />
        </div>
    )
}
