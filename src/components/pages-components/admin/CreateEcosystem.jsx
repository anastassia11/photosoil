'use client'

import { createEcosystem } from '@/api/ecosystem/create_ecosystem'
import CreateObject from '@/components/admin-panel/CreateObject'
import { getTranslation } from '@/i18n/client';
import { useParams } from 'next/navigation';

export default function CreateEcosystemComponent() {
    const { locale } = useParams();
    const { t } = getTranslation(locale);

    const fetchCreateEcosystem = async (data) => {
        const result = await createEcosystem(data)
        if (result.success) {
            return { success: true }
        } else return { success: false, status: result.status }
    }

    return (
        <CreateObject title={t('creation_ecosystems')} onCreate={fetchCreateEcosystem} type='ecosystem' />
    )
}