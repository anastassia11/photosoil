import PublicationEditComponent from '@/components/pages-components/admin/PublicationEdit';
import { getTranslation } from '@/i18n';

export async function generateMetadata({ params: { locale } }) {
    const { t } = await getTranslation(locale);
    return {
        title: `${t('edit_publication')} | ${t('dashboard')} | PhotoSOIL`,
    };
}

export default function PublicationEditPage({ params: { id } }) {
    return <PublicationEditComponent id={id} />
}
