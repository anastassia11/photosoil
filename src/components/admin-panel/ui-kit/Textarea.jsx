import React from 'react'

export default function Textarea({ name, label, value, onChange, required, placeholder }) {
    return <div className=''>
        <label className="font-medium">
            {label}
        </label>
        <textarea
            required={required}
            value={value}
            name={name}
            onChange={onChange}
            type="text"
            placeholder={placeholder || ''}
            className="scroll min-h-[100px] bg-white w-full mt-1 p-2 outline-none border focus:border-blue-600 shadow-sm rounded-md"
        />
    </div>
}
