'use client';

import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import i18nConfig from '../../../i18nConfig';
import Dropdown from '../admin-panel/Dropdown';

export default function LanguageChanger({ isTransparent }) {
    const { i18n } = useTranslation();
    const currentLocale = i18n.language;
    const router = useRouter();
    const currentPathname = usePathname();

    const LANGUAGES = {
        ru: 'RU',
        en: 'EN'
    }

    const handleChange = (newLocale) => {
        // set cookie for next-i18n-router
        const days = 30;
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        const expires = date.toUTCString();
        document.cookie = `NEXT_LOCALE=${newLocale};expires=${expires};path=/`;

        // redirect to the new locale path
        if (
            currentLocale === i18nConfig.defaultLocale &&
            !i18nConfig.prefixDefault
        ) {
            router.push('/' + newLocale + currentPathname);
        } else {
            router.push(
                currentPathname.replace(`/${currentLocale}`, `/${newLocale}`)
            );
        }

        router.refresh();
    };

    return (
        <div className='sm:w-[80px] w-full h-full flex justify-center items-center -mt-1'>
            <Dropdown value={currentLocale} items={LANGUAGES} isTransparent={isTransparent}
                onCategotyChange={handleChange} dropdownKey='languageChanger' />
        </div>
    );
}