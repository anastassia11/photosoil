import AuthorsPageComponent from '@/components/pages-components/AuthorsPage';
import { useTranslation } from '@/i18n';

export async function generateMetadata({ params: { locale } }) {
    const { t } = await useTranslation(locale, 'seo');
    return {
        title: t(`AuthorsPage-title`),
        description: t(`AuthorsPage-description`)
    };
}

export default function AuthorsPage() {
    return <AuthorsPageComponent />
}