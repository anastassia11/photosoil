import Soils from '@/components/soils/Soils';
import { useTranslation } from '@/i18n';

export async function generateMetadata({ params: { locale } }) {
    const { t } = await useTranslation(locale, 'seo');
    return {
        title: t(`EcosystemsPage-title`),
        description: t(`EcosystemsPage-description`)
    };
}

export default async function EcosystemsPage({ params: { locale } }) {
    const { t } = await useTranslation(locale);
    return (
        <div className='flex flex-col'>
            <h1 className='sm:text-2xl text-xl font-semibold mb-4'>
                {t('ecosystems')}
            </h1>
            <Soils type='ecosystems' isFilters={false} />
        </div>
    )
}
