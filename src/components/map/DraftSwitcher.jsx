import { memo, useEffect, useState } from 'react'
import { Checkbox } from '../ui/checkbox'

const DraftSwitcher = memo(
	function DraftSwitcher({ draftIsVisible, setDraftIsVisible, label, type }) {
		const [token, setToken] = useState(null)

		useEffect(() => {
			setToken(JSON.parse(localStorage.getItem('tokenData'))?.token)
		}, [])

		return (
			<div className={`items-top space-x-2 flex-row cursor-pointer max-w-fit
				${!token ? 'hidden h-0 my-0' : 'flex'}`}>
				<Checkbox id={`draftIsVisible-${type}`}
					checked={draftIsVisible}
					onCheckedChange={() => setDraftIsVisible(!draftIsVisible)} />
				<label
					style={{
						fontWeight: '400',
					}}
					htmlFor={`draftIsVisible-${type}`}
					className="select-none pt-[2px] text-base cursor-pointer leading-none"
				>
					{label}
				</label>
			</div>
		)
	},
	(prevProps, nextProps) => {
		return prevProps.draftIsVisible === nextProps.draftIsVisible
			&& prevProps.label === nextProps.label
	}
)
export default DraftSwitcher
