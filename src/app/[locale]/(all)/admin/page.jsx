'use client'

import { getAuthor } from '@/api/author/get_author';
import { getAuthors } from '@/api/author/get_authors';
import { getAllNews } from '@/api/news/get_allNews';
import Modal from '@/components/admin-panel/Modal'
import { BASE_SERVER_URL, BASE_URL } from '@/utils/constants';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function AdminPage() {
    const { t } = useTranslation();
    const [news, setNews] = useState([]);
    const [authors, setAuthors] = useState([]);
    const { locale } = useParams();
    const _isEng = locale === 'en';

    useEffect(() => {
        fetchNews();
        fetchAuthors();
    }, [])

    useEffect(() => {
        authors.length && authors.forEach(({ id }) => fetchAuthor(id));
    }, [authors.length])

    const fetchNews = async () => {
        const result = await getAllNews();
        if (result.success) {
            const _news = result.data.slice(0, 8);
            setNews(_news);
        }
    }

    const fetchAuthors = async () => {
        const result = await getAuthors();
        if (result.success) {
            const _authors = result.data.slice(0, 8);
            setAuthors(_authors);
        }
    }

    const fetchAuthor = async (id) => {
        const result = await getAuthor(id);
        if (result.success) {
            const _author = result.data;
            setAuthors(prev => prev.map(author =>
                author.id === id ? {
                    ...author,
                    soilsLength: _author.soilObjects.length,
                    ecosystemsLength: _author.ecoSystems.length
                } : author))
        }
    }

    const NewsCard = ({ id, tags, translations }) => {
        const currentTransl = translations?.find(({ isEnglish }) => isEnglish === _isEng) || {};
        return <Link href={`${BASE_URL}/news/${id}`}
            className="px-8 py-4 bg-white rounded-md hover:ring ring-blue-700 ring-opacity-30 hover:scale-[1.006] transition-all duration-300
             w-full h-full flex flex-col justify-between">
            <div className='flex flex-col'>
                <span className="text-sm font-light text-gray-600">{currentTransl?.lastUpdated || ''}</span>

                <div className="mt-2">
                    <h3 className="text-xl font-medium text-gray-700 hover:text-gray-600">{currentTransl?.title || ''}</h3>
                    <p className="mt-2 text-gray-600 ">{currentTransl?.annotation || ''}</p>
                </div>
            </div>
            <ul className="flex flex-row flex-wrap mt-4 align-bottom">
                {tags.map(({ id, nameRu, nameEng }) => <li key={`tag-${id}`} className="text-blue-600 min-w-fit mr-4">
                    {_isEng ? (nameEng || '') : (nameRu || '')}
                </li>)}
            </ul>
        </Link>
    }

    const AuthorCard = ({ photo, dataEng, dataRu, authorType, id, soilsLength, ecosystemsLength }) => {
        const curData = _isEng ? dataEng : dataRu;

        return <Link href={`authors/${id}`}
            className='px-8 py-4 bg-white rounded-md hover:ring ring-blue-700 ring-opacity-30 hover:scale-[1.006] transition-all duration-300
             w-full h-full flex flex-col justify-start'>

            <div class="flex flex-col sm:-mx-4 sm:flex-row">
                {photo && <Image src={`${BASE_SERVER_URL}${photo?.path}`} width={500} height={500} alt='soil' className='aspect-square object-cover object-top rounded-full w-24 h-24 sm:mx-4 ring-4 ring-gray-300' />}

                <div class="mt-4 sm:mx-4 sm:mt-0">
                    <h1 class="text-xl font-semibold text-gray-700 capitalize md:text-2xl group-hover:text-white">{curData.name || ''}</h1>

                    <p class="mt-2 text-blue-700">{curData.organization || ''}</p>
                </div>
            </div>

            <p class="mt-4 text-gray-500">
                {curData.degree}, {curData.specialization}, {curData.position}.
            </p>
            <p class="text-gray-600 font-medium mt-1">
                Автор {soilsLength} почвенных объектов и {ecosystemsLength} экосистем.
            </p>

            <div class="flex mt-4 -mx-2 self-end">
                {authorType !== undefined && <div className="flex items-center gap-x-2">
                    {authorType == '0' ? <p className="px-4 py-1 text-sm text-red-600 rounded-full bg-red-100/70">{t('main_editor')}</p> :
                        authorType == '1' ? <p className="px-4 py-1 text-sm text-emerald-600 rounded-full bg-emerald-100/70">{t('executive_editor')}</p> :
                            authorType == '2' ? <p className="px-4 py-1 text-sm text-blue-600 rounded-full bg-blue-100/70">{t('editor')}</p> : ''}
                </div>}
            </div>
        </Link>
    }

    return (
        <div className='px-4 py-8 sm:px-6 md:py-8 lg:px-8'>
            <section className="max-w-screen-2xl mx-auto">

                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="sm:text-4xl text-3xl font-semibold text-center">Основная статистика платформы</h2>

                    <p className="mt-4 text-gray-500 sm:text-xl">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione dolores laborum labore
                        provident impedit esse recusandae facere libero harum sequi.
                    </p>
                </div>

                <div className="mt-8 sm:mt-12">
                    <dl className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
                        <div className="flex flex-col px-4 py-8 text-center">
                            <dt className="order-last text-lg font-medium text-gray-500">Почвенных объектов</dt>

                            <dd className="text-4xl font-extrabold text-blue-600 md:text-5xl">48</dd>
                        </div>

                        <div className="flex flex-col px-4 py-8 text-center">
                            <dt className="order-last text-lg font-medium text-gray-500">Экосистем</dt>

                            <dd className="text-4xl font-extrabold text-blue-600 md:text-5xl">24</dd>
                        </div>

                        <div className="flex flex-col px-4 py-8 text-center">
                            <dt className="order-last text-lg font-medium text-gray-500">Публикаций</dt>

                            <dd className="text-4xl font-extrabold text-blue-600 md:text-5xl">86</dd>
                        </div>
                        <div className="flex flex-col px-4 py-8 text-center">
                            <dt className="order-last text-lg font-medium text-gray-500">Авторов</dt>

                            <dd className="text-4xl font-extrabold text-blue-600 md:text-5xl">48</dd>
                        </div>
                    </dl>
                </div>
            </section>
            <section className='mt-12 max-w-[2000px] mx-auto w-full'>
                <h3 className="sm:text-3xl text-2xl font-semibold mb-8 text-center">Последние новости</h3>

                <ul className='w-full news-grid mb-4'>
                    {news.map((item, idx) => <li key={`news_${idx}`} className='w-full h-full'>
                        <NewsCard {...item} />
                    </li>)}
                </ul>
            </section>
            {/* <section className='mt-12  mx-auto w-full max-w-[2000px]'>
                <h3 className="sm:text-3xl text-2xl font-semibold mb-8 text-center">Эксперты платформы</h3>

                <ul className='w-full expert-grid mb-4'>
                    {authors.map(author => <li key={author.id}>
                        {AuthorCard({ ...author })}
                    </li>
                    )}
                </ul>
            </section> */}
        </div>
    )
}
