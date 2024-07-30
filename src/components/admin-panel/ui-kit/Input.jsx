import React from 'react'

export default function Input({ label, name, value, required, onChange }) {
    return (
        <div>
            <label className="font-medium flex flex-row">
                {label}
            </label>
            <input
                required={required}
                value={value}
                onChange={onChange}
                name={name}
                type="text"
                className="h-[40px] bg-white w-full mt-1 p-2 outline-none border focus:border-blue-600 shadow-sm rounded-md"
            />
        </div>
    )
}
