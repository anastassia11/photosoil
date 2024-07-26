'use client'

import EditObject from '@/components/admin-panel/EditObject';
import { useTranslation } from 'react-i18next';

export default function SoilEditPage({ params: { id } }) {
    const { t } = useTranslation();

    return (
        <EditObject id={id} type='soil' title={t('edit_soil')} />
    )
}
