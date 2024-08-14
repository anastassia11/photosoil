import EditObject from '@/components/admin-panel/EditObject';
import { useTranslation } from '@/i18n';

export default async function SoilEditPage({ params: { id, locale } }) {
    const { t } = await useTranslation(locale);

    return (
        <EditObject id={id} type='soil' title={t('edit_soil')} />
    )
}
