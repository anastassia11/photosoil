import { memo, useEffect, useState } from 'react'

const DraftSwitcher = memo(function DraftSwitcher({ draftIsVisible, setDraftIsVisible, label }) {
    const [token, setToken] = useState(null)

    useEffect(() => {
        setToken(JSON.parse(localStorage.getItem('tokenData'))?.token)
    }, [])

    return (
        <label
            htmlFor='draftIsVisible'
            className={`flex-row cursor-pointer max-w-fit
            ${!token ? 'hidden h-0 my-0' : 'flex'}`}
        >
            <input
                type='checkbox'
                id='draftIsVisible'
                checked={draftIsVisible}
                onChange={() => setDraftIsVisible(!draftIsVisible)}
                className='min-w-5 w-5 min-h-5 h-5 mr-2 rounded border-gray-300 '
            />
            <span className='select-none'>{label}</span>
        </label>
    )
}, (prevProps, nextProps) => {
    return prevProps.draftIsVisible === nextProps.draftIsVisible
})
export default DraftSwitcher
