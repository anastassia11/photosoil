import JoinForm from '@/components/JoinForm'
import { getTranslation } from '@/i18n';

export async function generateMetadata({ params: { locale } }) {
    const { t } = await getTranslation(locale, 'seo');

    return {
        title: t('joinPage-title'),
        description: t('joinPage-description')
    };
}

export default function JoinPage() {
    return <JoinForm />
}
