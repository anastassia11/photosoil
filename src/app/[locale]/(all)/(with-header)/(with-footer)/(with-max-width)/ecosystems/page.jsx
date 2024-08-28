import Soils from '@/components/soils/Soils';
import { getTranslation } from '@/i18n';
import { Suspense } from 'react';

export async function generateMetadata({ params: { locale } }) {
    const { t } = await getTranslation(locale, 'seo');
    return {
        title: t(`ecosystemsPage-title`),
        description: t(`ecosystemsPage-description`)
    };
}

export default async function EcosystemsPage({ params: { locale } }) {
    const { t } = await getTranslation(locale);
    return (
        <div className='flex flex-col'>
            <h1 className='sm:text-2xl text-xl font-semibold mb-4'>
                {t('ecosystems')}
            </h1>
            <Suspense>
                <Soils type='ecosystems' isFilters={true} />
            </Suspense>
        </div>
    )
}
