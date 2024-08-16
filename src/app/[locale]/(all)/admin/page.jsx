import AdminPageComponent from '@/components/pages-components/AdminPage'
import { getTranslation } from '@/i18n';

export async function generateMetadata({ params: { locale } }) {
    const { t } = await getTranslation(locale, 'seo');

    return {
        title: t('AdminPage-title'),
        description: t('AdminPage-description')
    };
}

export default function AdminPage() {
    return <AdminPageComponent />
}
