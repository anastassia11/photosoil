import JoinForm from '@/components/JoinForm'
import { useTranslation } from '@/i18n';

export async function generateMetadata({ params: { locale } }) {
    const { t } = await useTranslation(locale, 'seo');

    return {
        title: t('JoinPage-title'),
        description: t('JoinPage-description')
    };
}

export default function JoinPage() {
    return <JoinForm />
}
