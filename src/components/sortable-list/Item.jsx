import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { useRef } from 'react'

export default function Item({ id, name }) {
    const { attributes, listeners, isDragging, setNodeRef, transform, transition } =
        useSortable({ id });

    const style = {
        zIndex: isDragging ? 1000 : undefined,
        color: isDragging && '#1d4ed8',
        touchAction: 'none',
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className='bg-white border p-3 min-h-[50px] flex items-center rounded-md flex-1'>
            <div>
                <h3 className='font-medium'>{name}</h3>
            </div>
        </div>
    );
}
