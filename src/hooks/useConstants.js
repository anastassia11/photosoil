import { getTranslation } from '@/i18n/client';
import { useParams } from 'next/navigation';

export const useConstants = () => {
    const { locale } = useParams();
    const { t } = getTranslation(locale);

    const AUTHOR_INFO = [
        { name: 'name', title: t('full_name'), },
        { name: 'organization', title: t('organization') },
        { name: 'position', title: t('post') },
        { name: 'specialization', title: t('specialization') },
        { name: 'degree', title: t('degree') },
        { name: 'contacts', title: t('contacts'), isArray: true },
        { name: 'otherProfiles', title: t('otherProfiles'), isArray: true },
        { name: 'description', title: t('author_about') }
    ];

    const SOIL_INFO = [
        { name: 'objectType', title: t('objectType') },
        { name: 'geographicLocation', title: t('geographicLocation') },
        { name: 'reliefLocation', title: t('reliefLocation') },
        { name: 'plantCommunity', title: t('plantCommunity') },
        { name: 'soilFeatures', title: t('soilFeatures') },
        { name: 'comments', title: t('comments') },
    ];

    const ECOSYSTEM_INFO = [
        { name: 'description', title: t('features') },
        { name: 'comments', title: t('comments') },
    ];

    const PUBLICATION_INFO = [
        { name: 'name', title: t('title') },
        { name: 'authors', title: t('authors') },
        { name: 'edition', title: t('info_journal') },
        { name: 'type', title: t('publ_type') },
        { name: 'doi', title: 'DOI' },
        { name: 'description', title: t('annotation') },
    ];

    const MODERATOR_INFO = [
        { name: 'name', title: t('fio') },
        { name: 'email', title: 'Email' },
    ];

    const RANK_ENUM = {
        "0": t('main_editor'),
        "1": t('executive_editor'),
        "2": t('editor'),
        "3": t('author'),
    };

    const SOIL_ENUM = {
        "0": t('dynamics'),
        "1": t('profiles'),
        "2": t('morphological')
    };

    const TRANSLATION_ENUM = {
        "0": t('any_lang'),
        "1": t('only_en'),
        "2": t('only_ru')
    };

    const PUBLICATION_ENUM = {
        "0": t('thesis'),
        "1": t('article'),
        "3": t('monographs'),
        "4": t('other'),
    }

    return {
        AUTHOR_INFO,
        SOIL_INFO,
        ECOSYSTEM_INFO,
        PUBLICATION_INFO,
        MODERATOR_INFO,
        SOIL_ENUM,
        RANK_ENUM,
        TRANSLATION_ENUM,
        PUBLICATION_ENUM,
    };
};