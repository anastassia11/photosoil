import React from 'react'

export default function Zoom({ onClick }) {
    return (
        <div className='flex flex-col'>
            <button type="button" id='customZoomIn'
                onClick={() => onClick('customZoomIn')}
                className='customZoom 
                    duration-300 bg-white rounded-t-md p-1 shadow-md  text-zinc-600 hover:text-zinc-800 border-b'>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="currentColor">
                    <path d="M24 15h-7V8h-2v7H8v2h7v7h2v-7h7v-2z"></path>
                </svg>
            </button>
            <button type="button" id='customZoomOut'
                onClick={() => onClick('customZoomOut')}
                className='customZoom 
                    duration-300 bg-white rounded-b-md p-1 shadow-md  text-zinc-600 hover:text-zinc-800'>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" width="32" height="32">
                    <path d="M8 15h16v2H8z"></path>
                </svg>
            </button>
        </div>
    )
}
