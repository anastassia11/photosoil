import Publications from '@/components/Publications';
import { useTranslation } from '@/i18n';

export async function generateMetadata({ params: { locale } }) {
    const { t } = await useTranslation(locale, 'seo');
    return {
        title: t(`publicationsPage-title`),
        description: t(`publicationsPage-description`)
    };
}

export default async function PublicationsPage({ params: { locale } }) {
    const { t } = await useTranslation(locale);

    return (
        <div className='flex flex-col'>
            <h1 className='sm:text-2xl text-xl font-semibold mb-4'>
                {t('publications')}
            </h1>
            <Publications />
        </div>
    )
}
