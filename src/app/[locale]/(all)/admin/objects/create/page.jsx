'use client'

import { createSoil } from '@/api/soil/create_soil';
import CreateObject from '@/components/admin-panel/CreateObject';
import { useTranslation } from '@/i18n/client';
import { useParams } from 'next/navigation';


export default function CreateSoilPage() {
    const { locale } = useParams();
    const { t } = useTranslation(locale);

    const fetchCreateSoil = async (data) => {
        const result = await createSoil(data)
        if (result.success) {
            return { success: true }
        } else return { success: false, status: result.status }
    }

    return (
        <CreateObject title={t('creation_soils')} onCreate={fetchCreateSoil} type='soil' />
    )
}
