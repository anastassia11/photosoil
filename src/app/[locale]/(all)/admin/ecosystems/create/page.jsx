'use client'

import { createEcosystem } from '@/api/ecosystem/create_ecosystem'
import CreateObject from '@/components/admin-panel/CreateObject'
import { useTranslation } from 'react-i18next';

export default function CreateEcosystemPage() {
    const { t } = useTranslation();

    const fetchCreateEcosystem = async (data) => {
        const result = await createEcosystem(data)
        if (result.success) {
            return { success: true }
        } else return { success: false }
    }

    return (
        <CreateObject title={t('creation_ecosystems')} onCreate={fetchCreateEcosystem} type='ecosystem' />
    )
}