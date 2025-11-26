// src/app/sitemap.js

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://photosoil.tsu.ru'
const locales = ['ru', 'en']

// Конфигурация страниц с индивидуальными настройками приоритетов
const pagesConfig = [
    {
        path: '',              // главная
        priority: 1.0,         // максимальный приоритет
        changeFrequency: 'daily'
    },
    {
        path: 'about',         // о нас
        priority: 0.9,
        changeFrequency: 'monthly'
    },
    {
        path: 'soils',         // поиск по всем объектам
        priority: 0.8,
        changeFrequency: 'daily'
    },
    {
        path: 'profiles',      // почвенные профили
        priority: 0.7,
        changeFrequency: 'daily'
    },
    {
        path: 'dynamics',      // динамика почв
        priority: 0.7,
        changeFrequency: 'daily'
    },
    {
        path: 'morphological', // морфологические элементы
        priority: 0.7,
        changeFrequency: 'daily'
    },
    {
        path: 'ecosystems',    // экосистемы
        priority: 0.8,
        changeFrequency: 'daily'
    },
    {
        path: 'publications',  // публикации
        priority: 0.8,
        changeFrequency: 'daily'
    },
    {
        path: 'authors',       // авторы
        priority: 0.8,
        changeFrequency: 'daily'
    },
    {
        path: 'news',          // новости
        priority: 0.8,
        changeFrequency: 'daily'
    }
]

export default async function sitemap() {
    const staticUrls = []

    // Генерируем URL для всех статических страниц и локалей
    for (const locale of locales) {
        for (const page of pagesConfig) {
            staticUrls.push({
                url: `${BASE_URL}/${locale}${page.path ? `/${page.path}` : ''}`,
                lastModified: new Date(),
                changeFrequency: page.changeFrequency,
                priority: page.priority,
            })
        }
    }

    // Опционально: можно добавить динамические страницы
    // Например, если нужно включить конкретные объекты, публикации и т.д.
    // Это потребует запросов к API

    return staticUrls
}

