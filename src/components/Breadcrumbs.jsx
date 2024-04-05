'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect } from 'react'

export default function Breadcrumbs({ homeElement }) {
    const paths = usePathname()
    const pathNames = paths.split('/').filter(path => path)

    const linkTexts = {
        'soils': {
            title: 'Поиск по коду',
            isRef: true,
        },
        'soil': {
            title: 'Почвенный объект',
            isRef: true,
        },
        'dynamics': {
            title: 'Динамика почв',
            isRef: true,
        },
        'morphological': {
            title: 'Почвенные морфологические элементы',
            isRef: true,
        },
        'profiles': {
            title: 'Почвенные профили',
            isRef: true,
        },
        'authors': {
            title: 'Авторы',
            isRef: true,
        },
        'author': {
            title: 'Профиль автора',
            isRef: true,
        },
        'news': {
            title: 'Новости',
            isRef: true,
        },
        'publications': {
            title: 'Публикации',
            isRef: true,
        },
        'ecosystems': {
            title: 'Экосистемы',
            isRef: true,
        },
        'objects': {
            title: 'Почвенные объекты',
            isRef: true,
        },
        'taxonomy': {
            title: 'Таксономия',
            isRef: false,
        },
        'dictionary': {
            title: 'Словари',
            isRef: true,
        },
        'users': {
            title: 'Пользователи',
            isRef: true,
        },
        'content': {
            title: 'Содержимое',
            isRef: false,
        },
        'admin': {
            title: 'Панель управления',
            isRef: true
        },
        'create': {
            title: 'Создание',
            isRef: true
        },
        'edit': {
            title: 'Редактирование',
            isRef: true
        },
    };

    const separator =
        <span className="mx-3 text-zinc-500 rtl:-scale-x-100" >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
        </span>


    const breadcrumbs = pathNames.map((link, index) => {
        let itemTitle
        let href = `/${pathNames.slice(0, index + 1).join('/')}`;
        let isRef = linkTexts[link] ? linkTexts[link].isRef : false;
        if (index === 1 && (pathNames[0] === 'soils' || pathNames[0] === 'profiles' ||
            pathNames[0] === 'dynamics' || pathNames[0] === 'morphological')) {
            itemTitle = linkTexts['soil'].title;
        } else if (index === 1 && pathNames[0] === 'authors') {
            itemTitle = linkTexts['author'].title;
        } else {
            itemTitle = linkTexts[link] ? linkTexts[link].title : null;
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
        <ul className='flex items-center py-4 whitespace-nowrap' >
            {breadcrumbs.map(({ href, itemTitle, isRef }, index) =>
                <li key={href} className='flex flex-row'>
                    <div className={`${breadcrumbs.length === index + 1 ? 'text-blue-600' : ''}
                    ${isRef ? 'hover:underdivne' : ''}`}>
                        {isRef ? <Link href={href}>{itemTitle}</Link> : itemTitle}
                    </div>
                    {breadcrumbs.length !== index + 1 && separator}
                </li>)}
        </ul>
    )
}
