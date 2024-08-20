'use client'

import { getNewsById } from '@/api/news/get_news';
import PdfGallery from '@/components/soils/PdfGallery';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import '@/styles/editor.css';
import NewGallery from '@/components/soils/NewGallery';
import Link from 'next/link';
import moment from 'moment';
import { getTranslation } from '@/i18n/client';

export default function NewsItemPageComponent({ id }) {
    const [news, setNews] = useState({});
    const [tokenData, setTokenData] = useState({});
    const { locale } = useParams();
    const { t } = getTranslation(locale);

    const parser = new DOMParser();

    let _isEng = locale === 'en';

    const currentTransl = news?.translations?.find(({ isEnglish }) => isEnglish === _isEng);

    useEffect(() => {
        localStorage.getItem('tokenData') && setTokenData(JSON.parse(localStorage.getItem('tokenData')));
        document.documentElement.style.setProperty('--product-view-height', '600px');
        fetchNews();
    }, [])

    useEffect(() => {
        if (typeof document !== 'undefined' && currentTransl) {
            const title = currentTransl.title
            if (title) {
                document.title = `${title} | PhotoSOIL`;
            }
        }
    }, [currentTransl]);

    const fetchNews = async () => {
        const result = await getNewsById(id)
        if (result.success) {
            setNews(result.data)
        }
    }

    const handleScrollToSection = (sectionId) => {
        const section = document.getElementById(sectionId);
        section.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className='flex flex-col'>
            <div className='flex flex-col sm:flex-row mb-2 justify-between sm:items-center'>
                <h1 className='sm:text-2xl text-xl font-semibold'>
                    {currentTransl?.title}
                </h1>
                {tokenData.role === 'Admin' || (tokenData.name === news.user?.name) ? <Link target="_blank"
                    className='text-blue-700 cursor-pointer flex flex-row items-center hover:underline duration-300'
                    href={{
                        pathname: `/${locale}/admin/news/edit/${news.id}`,
                        query: { lang: _isEng ? 'eng' : 'ru' }
                    }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-5 mr-1">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                    <p className='pt-[3px]'>
                        {t('edit_go')}
                    </p>
                </Link> : ''}
            </div>
            <div className='flex flex-row w-full border-b-2'>
                <button className={`y-2 w-fit font-semibold border-b-2 translate-y-[2px]
                hover:border-blue-600 text-blue-600 mr-10 py-2
                ${!news.objectPhoto?.length && 'hidden'}`}
                    onClick={() => handleScrollToSection('gallery-section')}>
                    {t('gallery')} ({news.objectPhoto?.length})
                </button>
                <button className={`y-2 w-fit font-semibold border-b-2 translate-y-[2px]
                hover:border-blue-600 text-blue-600 mr-10 py-2
                ${!news.files?.length && 'hidden'}`}
                    onClick={() => handleScrollToSection('files-section')}>
                    {t('files')} ({news.files?.length})
                </button>
            </div>
            <div className='flex sm:flex-row flex-col justify-between mt-4'>
                <p className='text-gray-500 font-medium'>{moment(currentTransl?.lastUpdated).format('DD.MM.YYYY HH:mm') || ''}</p>
                <ul className="flex items-center flex-row">
                    {news?.tags?.map(({ id, nameRu, nameEng }, index) =>
                        <li key={`tag-${id}`} className='mr-2 min-w-fit h-fit'>
                            <Link href={`/${locale}/news?tags=${id}`}
                                className='text-blue-600 hover:underline'>
                                {_isEng ? (nameEng || '') : (nameRu || '')}{news?.tags?.length > 1 && index + 1 < news?.tags?.length && ','}
                            </Link>
                        </li>)}
                </ul>
            </div>
            <div className='tiptap mt-8'
                dangerouslySetInnerHTML={{ __html: parser.parseFromString(currentTransl?.content || '', 'text/html').body.innerHTML }}>
            </div>
            <div id='gallery-section' className='mt-8 self-center'>
                <NewGallery objectPhoto={news?.objectPhoto} />
            </div>

            {news.files?.length ? <div id='files-section' className='mt-8 flex flex-col'>
                <label className="font-medium min-h-fit mb-2">
                    {`${t('files')}`}
                </label>
                <ul className={`mt-1 flex flex-col space-y-2`}>
                    {news.files.map(file => <li key={file.id}>
                        <PdfGallery path={file?.path} title={file?.fileName} />
                    </li>)}
                </ul>
            </div> : ''}
        </div >
    )
}
