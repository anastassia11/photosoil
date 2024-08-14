import EditObject from '@/components/admin-panel/EditObject';
import { useTranslation } from '@/i18n';

export default function EcosystemEditPage({ params: { id, locale } }) {
    const { t } = useTranslation(locale);

    return (
        <EditObject id={id} type='ecosystem' title={t('edit_ecosystem')} />
    )
}
