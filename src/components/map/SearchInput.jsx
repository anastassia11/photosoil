import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'

const { memo, useEffect, useRef } = require('react')

const SearchInput = memo(function SearchInput({
	changeFilterName,
	placeholder,
	name = 'search',
	variant = 'rounded'
}) {

	const searchParams = useSearchParams()

	const {
		register,
		setValue,
		watch,
	} = useForm({
		mode: 'onChange'
	})
	const isInitialized = useRef(false)
	const watchedFilterName = watch('filterName')

	useEffect(() => {
		const filterName = searchParams.get(name) || ''
		setValue('filterName', filterName)
		isInitialized.current = true
	}, [setValue, name])

	useEffect(() => {
		if (!isInitialized.current) return

		let debounceTimer

		const handler = () => {
			// Очищаем предыдущий таймер
			clearTimeout(debounceTimer)
			// Устанавливаем новый таймер
			debounceTimer = setTimeout(() => {
				const currentFromUrl = searchParams.get(name) || ''
				if (watchedFilterName !== currentFromUrl) {
					changeFilterName(watchedFilterName)
				}
			}, 1000)
		}

		handler()

		return () => {
			clearTimeout(debounceTimer)
		}
	}, [watchedFilterName, name, searchParams])

	return (
		<>
			<svg
				xmlns='http://www.w3.org/2000/svg'
				className={`absolute top-0 bottom-0 w-6 h-6 my-auto text-zinc-400 ${variant === 'line' ? 'left-1' : 'left-3'}`}
				fill='none'
				viewBox='0 0 24 24'
				stroke='currentColor'
			>
				<path
					strokeLinecap='round'
					strokeLinejoin='round'
					strokeWidth={2}
					d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
				/>
			</svg>
			<input
				{...register('filterName')}
				type='text'
				autoComplete="off"
				placeholder={placeholder}
				className={`w-full h-[40px] outline-none bg-white focus:border-blue-600 px-8 sm:px-10
						${variant === 'line' ? 'rounded-none border-b' : 'rounded-md border'}`}
			/>

			<button
				className={`sideBar absolute top-0 bottom-0 w-6 h-6 my-auto text-zinc-400 hover:text-zinc-600 duration-300 
					${variant === 'line' ? 'right-1' : 'right-2'}`}
				onClick={() => {
					setValue('filterName', '')
					changeFilterName('')
				}}
			>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					fill='none'
					viewBox='0 0 24 24'
					strokeWidth={1.5}
					stroke='currentColor'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						d='M6 18 18 6M6 6l12 12'
					/>
				</svg>
			</button>
		</>
	)
})

export default SearchInput
