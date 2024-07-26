'use client'

import EditObject from '@/components/admin-panel/EditObject';
import { useTranslation } from 'react-i18next';

export default function EcosystemEditPage({ params: { id } }) {
    const { t } = useTranslation();

    return (
        <EditObject id={id} type='ecosystem' title={t('edit_ecosystem')} />
    )
}
