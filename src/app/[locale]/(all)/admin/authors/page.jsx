import AuthorsAdminPageComponent from '@/components/pages-components/admin/AuthorsPage';
import { getTranslation } from '@/i18n';

export async function generateMetadata({ params: { locale } }) {
    const { t } = await getTranslation(locale);

    return {
        title: `${t('photo_authors')} | ${t('dashboard')} | PhotoSOIL`,
    };
}

export default function AuthorsAdminPage() {
    return <AuthorsAdminPageComponent />
}
