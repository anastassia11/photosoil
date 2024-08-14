
import NewsPageComponent from '@/components/pages-components/NewsPage';
import { useTranslation } from '@/i18n';

export async function generateMetadata({ params: { locale } }) {
    const { t } = await useTranslation(locale, 'seo');
    return {
        title: t(`NewsPage-title`),
        description: t(`NewsPage-description`)
    };
}

export default function NewsPage() {
    return <NewsPageComponent />
}
