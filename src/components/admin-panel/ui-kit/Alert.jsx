'use client'

import { useDispatch } from 'react-redux'

import { closeAlert } from '@/store/slices/alertSlice'

export default function Alert({ isOpen, type, message, title }) {
	const dispatch = useDispatch()

	return (
		<div
			className={`duration-300 fixed self-center mt-6 z-[100] border ${
				type === 'success'
					? 'border-green-500 bg-green-50'
					: type === 'error'
						? 'border-red-500 bg-red-50'
						: 'border-amber-500 bg-orange-50'
			} px-2 rounded-md bg-green-50 md:max-w-2xl sm:mx-auto md:px-8 mx-4
        ${isOpen ? 'top-0' : '-top-32'}`}
		>
			<div className='flex justify-between py-3'>
				<div className='flex'>
					<div>
						{type === 'success' ? (
							<svg
								xmlns='http://www.w3.org/2000/svg'
								fill='currentColor'
								className='h-6 w-6 rounded-full text-green-500'
								viewBox='0 0 20 20'
							>
								<path
									fillRule='evenodd'
									d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
									clipRule='evenodd'
								/>
							</svg>
						) : type === 'error' ? (
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-6 w-6 text-red-500'
								viewBox='0 0 20 20'
								fill='currentColor'
							>
								<path
									fillRule='evenodd'
									d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
									clipRule='evenodd'
								/>
							</svg>
						) : (
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-6 w-6 rounded-full text-amber-500'
								viewBox='0 0 20 20'
								fill='currentColor'
							>
								<path
									fillRule='evenodd'
									d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
									clipRule='evenodd'
								/>
							</svg>
						)}
					</div>
					<div
						className={`${
							type === 'success'
								? 'text-green-600'
								: type === 'error'
									? 'text-red-600'
									: 'text-amber-600'
						} self-center ml-3`}
					>
						<span className='font-semibold'>{title}</span>
						<p className='mt-1'>{message}</p>
					</div>
				</div>
				<button
					className={`self-start ml-4 ${
						type === 'success'
							? 'text-green-500'
							: type === 'error'
								? 'text-red-500'
								: 'text-amber-500'
					}`}
					onClick={() => dispatch(closeAlert())}
				>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						className='h-5 w-5'
						viewBox='0 0 20 20'
						fill='currentColor'
					>
						<path
							fillRule='evenodd'
							d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
							clipRule='evenodd'
						/>
					</svg>
				</button>
			</div>
		</div>
	)
}
