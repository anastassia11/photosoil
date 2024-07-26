export default function FullScreen({ onClick }) {
    return (
        <button type="button" id='fullScreenButton'
            onClick={onClick}
            className='duration-300 bg-white rounded-md p-2 shadow-md  text-zinc-600 
                hover:text-zinc-800 border-b'>
            <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className='w-6 h-6'>
                <path d="M4 2C2.89543 2 2 2.89543 2 4V8C2 8.55228 2.44772 9 3 9C3.55228 9 4 8.55228 4 8V4H8C8.55228 4 9 3.55228 9 3C9 2.44772 8.55228 2 8 2H4Z" fill="currentColor" />
                <path d="M20 2C21.1046 2 22 2.89543 22 4V8C22 8.55228 21.5523 9 21 9C20.4477 9 20 8.55228 20 8V4H16C15.4477 4 15 3.55228 15 3C15 2.44772 15.4477 2 16 2H20Z" fill="currentColor" />
                <path d="M20 22C21.1046 22 22 21.1046 22 20V16C22 15.4477 21.5523 15 21 15C20.4477 15 20 15.4477 20 16V20H16C15.4477 20 15 20.4477 15 21C15 21.5523 15.4477 22 16 22H20Z" fill="currentColor" />
                <path d="M2 20C2 21.1046 2.89543 22 4 22H8C8.55228 22 9 21.5523 9 21C9 20.4477 8.55228 20 8 20H4V16C4 15.4477 3.55228 15 3 15C2.44772 15 2 15.4477 2 16V20Z" fill="currentColor" />
            </svg>
        </button>
    )
}
