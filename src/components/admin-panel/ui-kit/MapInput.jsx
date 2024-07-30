import React from 'react'

export default function MapInput({ value, onChange, name, label, id }) {
    return <input
        value={value}
        onChange={onChange}
        name={name}
        type="text"
        placeholder={label}
        id={id}
        className="h-[40px] bg-white w-full p-2 outline-none border focus:border-blue-600 shadow-sm rounded-md"
    />
}
