'use client'

import { useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';
import '@/styles/pagination.css';

export default function Pagination({ itemsPerPage, items, updateCurrentItems }) {
    const [pageCount, setPageCount] = useState(0);
    const [itemOffset, setItemOffset] = useState(0);
    const [pageRangeDisplayed, setPageRangeDisplayed] = useState(0);
    const [marginPagesDisplayed, setMarginPagesDisplayed] = useState(0);

    useEffect(() => {
        if (window.innerWidth < 640) {
            setPageRangeDisplayed(1);
            setMarginPagesDisplayed(0);
        } else {
            setPageRangeDisplayed(2);
            setMarginPagesDisplayed(2);
        }
    }, []);

    useEffect(() => {
        const endOffset = itemOffset + Number(itemsPerPage);
        updateCurrentItems(items.slice(itemOffset, endOffset));
        setPageCount(Math.ceil(items.length / itemsPerPage));
    }, [itemOffset, itemsPerPage, items]);

    const handlePageClick = (event) => {
        const newOffset = event.selected * itemsPerPage % items.length;
        setItemOffset(newOffset);
    };

    return (
        <>
            <ReactPaginate
                className='flex self-end'
                nextLabel={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>}
                onPageChange={handlePageClick}
                pageRangeDisplayed={pageRangeDisplayed}
                marginPagesDisplayed={marginPagesDisplayed}
                pageCount={pageCount}
                previousLabel={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>}
                pageClassName="page-item"
                pageLinkClassName="page-link"
                previousClassName="page-item"
                previousLinkClassName="page-link"
                nextClassName="page-item"
                nextLinkClassName="page-link"
                breakLabel="..."
                breakClassName="page-item"
                breakLinkClassName="page-link"
                containerClassName="pagination"
                activeLinkClassName="active-link"
                disabledLinkClassName='disabled-link'
                renderOnZeroPageCount={null}
            />
        </>
    )
}
