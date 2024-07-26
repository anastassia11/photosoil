'use client'

import { createSoil } from '@/api/soil/create_soil';
import CreateObject from '@/components/admin-panel/CreateObject';
import { useTranslation } from 'react-i18next';


export default function CreateSoilPage() {
    const { t } = useTranslation();

    const fetchCreateSoil = async (data) => {
        const result = await createSoil(data)
        if (result.success) {
            return { success: true }
        } else return { success: false }
    }

    return (
        <CreateObject title={t('creation_soils')} onCreate={fetchCreateSoil} type='soil' />
    )
}
