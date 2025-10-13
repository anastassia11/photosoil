'use client'

import { useEffect, useRef, useState } from 'react'
import ReactPaginate from 'react-paginate'

import '@/styles/pagination.css'

export default function Pagination({
	itemsPerPage,
	currPage,
	setCurrPage,
	items,
	updateCurrentItems
}) {
	const paginationRef = useRef(null)
	const [pageCount, setPageCount] = useState(Math.ceil(items.length / itemsPerPage))
	// const [itemOffset, setItemOffset] = useState(0)
	const [pageRangeDisplayed, setPageRangeDisplayed] = useState(0)
	const [marginPagesDisplayed, setMarginPagesDisplayed] = useState(0)
	const [prevItemsLength, setPrevItemsLength] = useState()

	useEffect(() => {
		const updatePaginationSettings = () => {
			if (window.innerWidth < 640) {
				// На мобильных: только первая и последняя страницы + текущая
				setPageRangeDisplayed(0)
				setMarginPagesDisplayed(1)
			} else if (window.innerWidth < 768) {
				// На планшетах: текущая страница + 1 соседняя + первая и последняя
				setPageRangeDisplayed(1)
				setMarginPagesDisplayed(1)
			} else {
				// На десктопе: текущая страница + 2 соседние + первая и последняя
				setPageRangeDisplayed(2)
				setMarginPagesDisplayed(2)
			}
		}

		updatePaginationSettings()

		// Обновляем при изменении размера окна
		const handleResize = () => {
			updatePaginationSettings()
		}

		window.addEventListener('resize', handleResize)

		return () => {
			window.removeEventListener('resize', handleResize)
		}
	}, [])

	useEffect(() => {
		const newOffset = (currPage * itemsPerPage) % items.length

		const endOffset = newOffset + itemsPerPage
		const currentItems = items.slice(newOffset, endOffset)

		updateCurrentItems(currentItems)
		setPageCount(Math.ceil(items.length / itemsPerPage))

		// setPrevItemsLength(currentItems.length)
	}, [currPage, itemsPerPage, items, updateCurrentItems])

	const handlePageClick = event => {
		setCurrPage(event.selected)

		const newOffset = (event.selected * itemsPerPage) % items.length

		const endOffset = newOffset + itemsPerPage
		const currentItems = items.slice(newOffset, endOffset)
		setPrevItemsLength(currentItems.length)
	}

	return (
		<div ref={paginationRef} className='flex self-end' id='pagination'>
			<ReactPaginate
				className='flex'
				initialPage={currPage}
				nextLabel={
					<svg
						xmlns='http://www.w3.org/2000/svg'
						className='w-5 h-5'
						viewBox='0 0 20 20'
						fill='currentColor'
					>
						<path
							fillRule='evenodd'
							d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
							clipRule='evenodd'
						/>
					</svg>
				}

				onPageChange={handlePageClick}
				pageRangeDisplayed={pageRangeDisplayed}
				marginPagesDisplayed={marginPagesDisplayed}
				pageCount={pageCount}
				previousLabel={
					<svg
						xmlns='http://www.w3.org/2000/svg'
						className='w-5 h-5'
						viewBox='0 0 20 20'
						fill='currentColor'
					>
						<path
							fillRule='evenodd'
							d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z'
							clipRule='evenodd'
						/>
					</svg>
				}
				pageClassName='page-item'
				pageLinkClassName='page-link'
				previousClassName='page-item'
				previousLinkClassName='page-link'
				nextClassName='page-item'
				nextLinkClassName='page-link'
				breakClassName='break-item'
				containerClassName='pagination'
				activeLinkClassName='active-link'
				disabledLinkClassName='disabled-link'
				renderOnZeroPageCount={null}
			/>
		</div>
	)
}
