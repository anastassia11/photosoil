'use client'

import Dropdown from '../admin-panel/ui-kit/Dropdown';
import { getTranslation } from '@/i18n/client';

export default function LanguageChanger({ isTransparent, locale }) {
    const currentLocale = locale;
    const { i18n } = getTranslation(locale);
    const LANGUAGES = {
        ru: 'RU',
        en: 'EN'
    }

    const handleLanguageChange = (lang) => {
        i18n.changeLanguage(lang); // меняет язык без перезагрузки
    };

    return (
        <div className='sm:w-[80px] w-full h-full flex justify-center items-center -mt-1'>
            <Dropdown value={currentLocale} items={LANGUAGES} isTransparent={isTransparent}
                onCategotyChange={handleLanguageChange} dropdownKey='languageChanger' />
        </div>
    );
}