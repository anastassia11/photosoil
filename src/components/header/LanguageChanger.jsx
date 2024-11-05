'use client'

import { useParams, usePathname, useRouter } from 'next/navigation';
import Dropdown from '../admin-panel/ui-kit/Dropdown';
import { useEffect, useRef } from 'react';

export default function LanguageChanger({ isTransparent }) {
    const { locale } = useParams();
    const pathname = usePathname();
    const pathnameRef = useRef(pathname);

    useEffect(() => {
        pathnameRef.current = pathname;
    }, [pathname]);

    const router = useRouter();
    const LANGUAGES = {
        ru: 'RU',
        en: 'EN'
    }

    const handleLanguageChange = (lang) => {
        const newPathname = redirectedPathname(lang);
        router.push(newPathname);
    };

    const redirectedPathname = (locale) => {
        const segments = pathnameRef.current.split("/");
        segments[1] = locale;
        return segments.join("/");
    };

    return (
        <div className='sm:w-[80px] w-full h-full flex justify-center items-center -mt-1'>
            <Dropdown value={locale} items={LANGUAGES} isTransparent={isTransparent}
                onCategotyChange={handleLanguageChange} dropdownKey='languageChanger' />
        </div>
    );
}