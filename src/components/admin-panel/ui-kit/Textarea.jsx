import React, { forwardRef } from 'react'

function Textarea(
	{ label, isEng, required, placeholder, error, ...props },
	ref
) {
	return (
		<div className=''>
			<label className='font-medium'>
				{label}
				{isEng ? ' (EN) ' : ''}
				<span className='text-orange-500'>{required ? '*' : ''}</span>
			</label>
			<textarea
				ref={ref}
				{...props}
				type='text'
				placeholder={placeholder || ''}
				className={`scroll min-h-[100px] bg-white w-full mt-1 p-2 outline-none border 
                 ${error ? 'focus:border-red-600' : 'focus:border-blue-600'}
                  shadow-sm rounded-md`}
			/>
			{error && (
				<p className='text-red-500 text-sm mt-[2px]'>{error.message}</p>
			)}
		</div>
	)
}

export default forwardRef(Textarea)
