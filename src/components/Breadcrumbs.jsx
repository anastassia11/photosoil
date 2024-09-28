'use client'

import { getTranslation } from '@/i18n/client';
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import React, { useEffect } from 'react'

export default function Breadcrumbs() {
    const paths = usePathname();
    const pathNames = paths.split('/').filter(path => path)
    const { locale } = useParams();
    const { t } = getTranslation(locale);

    const linkTexts = {
        'soils': {
            title: t('search_all'),
            isRef: true,
        },
        'soil': {
            title: t('soil'),
            isRef: false,
        },
        'dynamics': {
            title: t('dynamics'),
            isRef: true,
        },
        'morphological': {
            title: t('morphological'),
            isRef: true,
        },
        'profiles': {
            title: t('profiles'),
            isRef: true,
        },
        'authors': {
            title: t('authors'),
            isRef: true,
        },
        'author': {
            title: t('author_page'),
            isRef: false,
        },
        'news': {
            title: t('news'),
            isRef: true,
        },
        'publications': {
            title: t('publications'),
            isRef: true,
        },
        'ecosystems': {
            title: t('ecosystems'),
            isRef: true,
        },
        'objects': {
            title: t('soils'),
            isRef: true,
        },
        'taxonomy': {
            title: t('taxonomy'),
            isRef: false,
        },
        'dictionary': {
            title: t('dictionaries'),
            isRef: true,
        },
        'users': {
            title: t('users'),
            isRef: true,
        },
        'content': {
            title: t('content'),
            isRef: false,
        },
        'admin': {
            title: t('dashboard'),
            isRef: true
        },
        'create': {
            title: t('create'),
            isRef: true
        },
        'edit': {
            title: t('edit'),
            isRef: false
        },
        'view': {
            title: t('user_page'),
            isRef: false
        },
        'policy': {
            title: t('rules'),
            isRef: true
        },
        'ecosystem': {
            title: t('ecosystem'),
            isRef: false
        },
        'publication': {
            title: t('publication'),
            isRef: false
        },
        'news_one': {
            title: t('news_one'),
            isRef: false
        },

    };

    const separator =
        <span className="sm:mx-2 mx-1 text-zinc-500 rtl:-scale-x-100" >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
        </span>

    const titleMapping = {
        soils: 'soil',
        profiles: 'soil',
        dynamics: 'soil',
        morphological: 'soil',
        ecosystems: 'ecosystem',
        publications: 'publication',
        authors: 'author',
        news: 'news_one',
        users: 'view'
    };

    const breadcrumbs = pathNames.map((link, index) => {
        let itemTitle
        let href = `/${pathNames.slice(0, index + 1).join('/')}`;
        let isRef = linkTexts[link] ? linkTexts[link].isRef : false;

        if (linkTexts[link]) {
            itemTitle = linkTexts[link].title
        } else {
            if (index === 2) {
                const mappedKey = titleMapping[pathNames[1]];
                itemTitle = mappedKey ? linkTexts[mappedKey].title : null;
            } else {
                itemTitle = linkTexts[link] ? linkTexts[link].title : null;
            }
        }

        return (
            {
                href,
                isRef,
                itemTitle
            }
        )
    }).filter(({ itemTitle }) => itemTitle !== null)

    return (
        <ul className='flex items-center py-4 whitespace-nowrap flex-wrap w-full'>
            <li className='hover:underline mb-1 2xl:mb-0 flex flex-row items-center '>
                <Link href={`/${locale}`}
                    prefetch={false}>PhotoSOIL</Link>
                {separator}
            </li>

            {breadcrumbs.map(({ href, itemTitle, isRef }, index) =>
                <li key={href} className='flex flex-row items-center mb-1 2xl:mb-0'>
                    <div className={`${breadcrumbs.length === index + 1 ? 'text-blue-600' : ''}
                    ${isRef ? 'hover:underline' : ''}`}>
                        {isRef ? <Link href={href} prefetch={false}>{itemTitle}</Link> : itemTitle}
                    </div>
                    {breadcrumbs.length !== index + 1 && separator}
                </li>)}
        </ul>
    )
}
