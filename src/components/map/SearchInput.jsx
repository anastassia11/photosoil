import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'

const { memo, useEffect, useRef } = require('react')

const SearchInput = memo(function SearchInput({
	changeFilterName,
	placeholder
}) {
	const didLogRef = useRef(true)

	const searchParams = useSearchParams()

	const {
		register,
		setValue,
		watch,
	} = useForm({
		mode: 'onChange'
	})

	const watchedFilterName = watch('filterName')

	useEffect(() => {
		if (didLogRef.current) return
		let debounceTimer

		const handler = () => {
			// Очищаем предыдущий таймер
			clearTimeout(debounceTimer)
			// Устанавливаем новый таймер
			debounceTimer = setTimeout(() => {
				changeFilterName(watchedFilterName)
			}, 1000)
		}

		handler()

		return () => {
			clearTimeout(debounceTimer)
		}
	}, [watchedFilterName])

	useEffect(() => {
		let timeoutId
		if (didLogRef.current) {
			timeoutId = setTimeout(() => {
				const filterName = searchParams.get('search')
				if (filterName) {
					setValue('filterName', filterName)
				}
				didLogRef.current = false
			}, 300)
		}
		return () => clearTimeout(timeoutId)
	}, [searchParams, setValue])

	return (
		<>
			<svg
				xmlns='http://www.w3.org/2000/svg'
				className='absolute top-0 bottom-0 w-6 h-6 my-auto text-zinc-400 left-1'
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
				className='w-full h-[40px] px-8 sm:px-10 border-b rounded-none outline-none bg-white focus:border-blue-600'
			/>

			<button
				className='sideBar absolute right-1 top-0 bottom-0 w-6 h-6 my-auto text-zinc-400 hover:text-zinc-600 duration-300'
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
