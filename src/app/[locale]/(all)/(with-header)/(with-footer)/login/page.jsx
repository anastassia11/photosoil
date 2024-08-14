import LoginPageComponent from '@/components/pages-components/LoginPage';
import { useTranslation } from '@/i18n';

export async function generateMetadata({ params: { locale } }) {
    const { t } = await useTranslation(locale, 'seo');

    return {
        title: t('LoginPage-title'),
        description: t('LoginPage-description')
    };
}

export default function LoginPage() {
    return <LoginPageComponent />
}
