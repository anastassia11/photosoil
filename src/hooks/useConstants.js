import { useTranslation } from 'react-i18next';

export const useConstants = () => {
    const { t } = useTranslation();

    const AUTHOR_INFO = [
        { name: 'name', title: t('full_name'), },
        { name: 'organization', title: t('organization') },
        { name: 'position', title: t('post') },
        { name: 'specialization', title: t('specialization') },
        { name: 'degree', title: t('degree') },
        { name: 'contacts', title: t('contacts'), isArray: true },
        { name: 'otherProfiles', title: t('otherProfiles'), isArray: true },
    ];

    const SOIL_INFO = [
        { name: 'objectType', title: t('objectType') },
        { name: 'geographicLocation', title: t('geographicLocation') },
        { name: 'reliefLocation', title: t('reliefLocation') },
        { name: 'plantCommunity', title: t('plantCommunity') },
        { name: 'soilFeatures', title: t('soilFeatures') },
    ];

    const ECOSYSTEM_INFO = [
        { name: 'description', title: t('features') },
    ];

    const PUBLICATION_INFO = [
        { name: 'name', titleRu: t('title') },
        { name: 'authors', titleRu: t('authors') },
        { name: 'edition', titleRu: t('info_journal') },
        { name: 'type', titleRu: t('publ_type') },
        { name: 'doi', titleRu: 'DOI' },
        { name: 'description', titleRu: t('annotation') },
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
        PUBLICATION_ENUM
    };
};