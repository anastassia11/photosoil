'use client'

import { getClassifications } from '@/api/classification/get_classifications';
import { updateOrderClassification } from '@/api/classification/update_order_classification';
import SubmitBtn from '@/components/admin-panel/ui-kit/SubmitBtn';
import Item from '@/components/sortable-list/Item';
import { getTranslation } from '@/i18n/client';
import { openAlert } from '@/store/slices/alertSlice';
import { setDirty } from '@/store/slices/formSlice';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';

export default function DictionaryOrderComponent() {
    const dispatch = useDispatch();
    const { handleSubmit, setValue, watch, control, formState: { isSubmitting, isDirty } } = useForm({
        defaultValues: {
            disconaries: []
        }, mode: 'onChange'
    });
    const { locale } = useParams();
    const { t } = getTranslation(locale);
    const router = useRouter();
    const disconaries = watch('disconaries');

    const _isEng = locale === 'en';

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchDisconaries()
    }, [])

    useEffect(() => {
        dispatch(setDirty(isDirty));
    }, [isDirty]);

    const fetchDisconaries = async () => {
        const result = await getClassifications()
        if (result.success) {
            setValue('disconaries', result.data.sort((a, b) => a.order - b.order))
        }
    }

    function handleDragEnd(e, field) {
        const { active, over } = e;
        if (over && active.id !== over.id) {
            const oldIndex = disconaries.findIndex((item) => item.id === active.id);
            const newIndex = disconaries.findIndex((item) => item.id === over.id);
            field.onChange(arrayMove(disconaries, oldIndex, newIndex));
        }
    }

    const submitForm = async (formData) => {
        const updatedData = formData.disconaries.map((data, index) => ({ id: data.id, order: index + 1 }));
        const result = await updateOrderClassification(updatedData)
        if (result.success) {
            router.push(`/${locale}/admin/dictionary`);
            dispatch(setDirty(false));
            dispatch(openAlert({ title: t('success'), message: t('success_edit'), type: 'success' }));
        } else {
            dispatch(openAlert({ title: t('error'), message: t('error_edit'), type: 'error' }));
        }
    }

    return (
        <form onSubmit={handleSubmit(submitForm)} className="flex flex-col w-full flex-1 pb-[150px]" >
            <div
                className='mb-2 flex md:flex-row flex-col md:items-end md:justify-between space-y-1 md:space-y-0'>
                <h1 className='sm:text-2xl text-xl font-semibold mb-2 md:mb-0'>
                    {t('setting_order')}
                </h1>
                <div className='md:min-w-[220px] md:max-w-[220px] md:w-fit'>
                    <SubmitBtn isSubmitting={isSubmitting} btnText={t('save')} />
                </div>
            </div>
            <div className='flex flex-col gap-2 pb-16 mt-4'>
                <Controller control={control}
                    name='disconaries'
                    render={({ field }) =>
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={e => handleDragEnd(e, field)}
                            modifiers={[restrictToVerticalAxis]}>
                            <SortableContext
                                items={field.value}
                                strategy={verticalListSortingStrategy}>
                                {field.value.map(({ id, nameRu, nameEng }) => (
                                    <Item key={id} id={id} name={_isEng ? (nameEng || nameRu) : (nameRu || nameEng)} />
                                ))}
                            </SortableContext>
                        </DndContext>
                    } />
            </div>
        </form>
    );
}


