import AuthorCreateComponent from '@/components/pages-components/admin/AuthorCreate';
import { getTranslation } from '@/i18n';

export async function generateMetadata({ params: { locale } }) {
    const { t } = await getTranslation(locale);

    return {
        title: `${t('creation_author')} | ${t('dashboard')} | PhotoSOIL`,
    };
}

export default function AuthorCreatePage() {
    return <AuthorCreateComponent />
}
