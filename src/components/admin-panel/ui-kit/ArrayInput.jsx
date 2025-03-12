import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'

import TermItem from '@/components/sortable-list/TermItem'

import { getTranslation } from '@/i18n/client'

export default function ArrayInput(
	{
		title,
		name,
		fields,
		sortable,
		onRemove,
		onAppend,
		onMove,
		register,
		subName,
		isEng,
		required
	},
	ref
) {
	const { locale } = useParams()
	const { t } = getTranslation(locale)

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates
		})
	)

	function handleDragEnd(e) {
		const { active, over } = e
		if (over && active.id !== over.id) {
			const oldIndex = fields.findIndex(item => item.id === active.id)
			const newIndex = fields.findIndex(item => item.id === over.id)
			onMove(oldIndex, newIndex)
		}
	}

	return (
		<div className='flex flex-col w-full '>
			<p className='font-medium'>
				{!!title &&
					<label className='font-medium flex flex-row'>
						{title}
						{isEng ? ' (EN) ' : ''}
						<span className='text-orange-500'>{required ? '*' : ''}</span>
					</label>}
			</p>
			<ul>
				<DndContext
					sensors={sensors}
					onDragEnd={handleDragEnd}
					collisionDetection={closestCenter}
					modifiers={[restrictToVerticalAxis]}
				>
					<SortableContext
						items={fields}
						strategy={verticalListSortingStrategy}
					>
						{fields.map((field, index) => (
							<TermItem
								sortable={sortable}
								key={field.id}
								id={field.id}
							>
								<input
									ref={ref}
									{...register(
										`${name}.${index}${!!subName ? `.${subName}` : ''}`
									)}
									type='text'
									className='bg-white w-full mt-1 p-2 outline-none border focus:border-blue-600 shadow-sm rounded-md'
								/>
								<button
									type='button'
									className='p-2'
									onClick={() => onRemove(index)}
								>
									<svg
										width='800px'
										height='800px'
										viewBox='0 0 24 24'
										fill='none'
										xmlns='http://www.w3.org/2000/svg'
										className='w-[10px] h-[10px]'
									>
										<g id='Menu / Close_LG'>
											<path
												id='Vector'
												d='M21 21L12 12M12 12L3 3M12 12L21.0001 3M12 12L3 21.0001'
												stroke='currentColor'
												strokeWidth='3'
												strokeLinecap='round'
												strokeLinejoin='round'
											/>
										</g>
									</svg>
								</button>
							</TermItem>
						))}
					</SortableContext>
				</DndContext>
			</ul>

			{/* TODO: добавлять nameRu nameEng в зав-ти от translationMode */}
			<button
				type='button'
				className='font-medium text-blue-600 w-fit'
				onClick={onAppend}
			>
				<span className='text-2xl pr-2'>+</span>
				{t('add')}
			</button>
		</div>
	)
}
