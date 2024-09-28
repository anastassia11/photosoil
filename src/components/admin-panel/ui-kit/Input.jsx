import React, { forwardRef } from 'react'

function Input({ label, type, placeholder, isEng, required, error, ...props }, ref) {
    return (
        <div className='w-full'>
            {label ? <label className="font-medium flex flex-row">
                {label}{isEng ? ' (EN) ' : ''}<span className='text-orange-500'>{required ? '*' : ''}</span>
            </label> : ''}
            <input
                ref={ref}
                {...props}
                placeholder={placeholder || ''}
                autoComplete="off"
                type={type || 'text'}
                className={`h-[40px] bg-white w-full mt-1 p-2 outline-none border 
                    ${error ? 'focus:border-red-600' : 'focus:border-blue-600'}
                     shadow-sm rounded-md`} />
            {error && <p className='text-red-500 text-sm mt-[2px]'>{error.message}</p>}
        </div>
    )
}
export default forwardRef(Input)
