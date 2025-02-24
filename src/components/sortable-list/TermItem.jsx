import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function TermItem({ id, sortable, children }) {
	const {
		attributes,
		listeners,
		isDragging,
		setNodeRef,
		setActivatorNodeRef,
		transform,
		transition
	} = useSortable({ id })

	const style = {
		zIndex: isDragging ? 1000 : undefined,
		color: isDragging && '#1d4ed8',
		touchAction: 'none',
		transform: CSS.Translate.toString(transform),
		transition
	}

	return (
		<div
			className='flex flex-row items-center mb-1'
			ref={setNodeRef}
			style={style}
		>
			<button
				type='button'
				disabled={sortable}
				ref={setActivatorNodeRef}
				{...attributes}
				{...listeners}
				className='pr-2 pt-1 cursor-move disabled:opacity-50 disabled:cursor-default disabled:pointer-events-none'
			>
				<svg
					viewBox='0 0 20 20'
					width='12'
				>
					<path d='M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z'></path>
				</svg>
			</button>
			{children}
		</div>
	)
}
