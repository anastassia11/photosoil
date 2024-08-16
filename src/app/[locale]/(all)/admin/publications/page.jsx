import PublicationsAdminComponent from '@/components/pages-components/admin/PublicationsPage';
import { getTranslation } from '@/i18n';

export async function generateMetadata({ params: { locale } }) {
    const { t } = await getTranslation(locale);

    return {
        title: `${t('publications')} | ${t('dashboard')} | PhotoSOIL`,
    };
}

export default function PublicationsAdminPage() {
    return <PublicationsAdminComponent />
}
