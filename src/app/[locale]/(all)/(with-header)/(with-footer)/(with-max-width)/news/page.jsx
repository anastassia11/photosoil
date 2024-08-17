
import NewsPageComponent from '@/components/pages-components/NewsPage';
import { getTranslation } from '@/i18n';
import { Suspense } from 'react';

export async function generateMetadata({ params: { locale } }) {
    const { t } = await getTranslation(locale, 'seo');
    return {
        title: t(`newsPage-title`),
        description: t(`newsPage-description`)
    };
}

export default function NewsPage() {
    return <Suspense>
        <NewsPageComponent />
    </Suspense>
}
