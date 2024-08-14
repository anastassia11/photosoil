import Soils from '@/components/soils/Soils';
import { useTranslation } from '@/i18n';

export default async function SoilsPageComponent({ type, locale }) {
    const { t } = await useTranslation(locale);

    return (
        <div className='flex flex-col' >
            <h1 className='sm:text-2xl text-xl font-semibold mb-4'>
                {type === 'soils' ? t('search_all') :
                    type === 'profiles' ? t('profiles') :
                        type === 'dynamics' ? t('dynamics') :
                            type === 'morphological' ? t('morphological') : ''}
            </h1>
            <Soils isAllSoils={type === 'soils'} type={type} isFilters={true} />
        </div >
    )
}
