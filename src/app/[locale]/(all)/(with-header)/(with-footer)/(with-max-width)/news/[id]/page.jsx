'use client'

import { getNewsById } from '@/api/news/get_news';
import PdfGallery from '@/components/soils/PdfGallery';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '@/styles/editor.css';
import NewGallery from '@/components/soils/NewGallery';
import { BASE_URL } from '@/utils/constants';
import Link from 'next/link';

export default function NewsItemPage({ params: { id } }) {
    const [news, setNews] = useState({});
    const { t } = useTranslation();
    const { locale } = useParams();
    const parser = new DOMParser();

    let _isEng = locale === 'en';

    const currentTransl = news?.translations?.find(({ isEnglish }) => isEnglish === _isEng);

    useEffect(() => {
        document.documentElement.style.setProperty('--product-view-height', '600px');
        fetchNews();
    }, [])

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
            <h1 className='sm:text-3xl text-2xl font-semibold mb-2'>
                {currentTransl?.title}
            </h1>
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
            <div className='flex flex-row justify-between mt-4'>
                <p className='text-gray-500 font-medium'>{currentTransl?.lastUpdated}</p>
                <ul className="flex items-center flex-row">
                    {news?.tags?.map(({ id, nameRu, nameEng }, index) =>
                        <li key={`tag-${id}`} className='mr-2 min-w-fit h-fit'>
                            <Link href={`${BASE_URL}/news?tags=${id}`}
                                className='text-blue-600 hover:underline'>
                                {_isEng ? (nameEng || '') : (nameRu || '')}{news?.tags?.length > 1 && index + 1 < news?.tags?.length && ','}
                            </Link>
                        </li>)}
                </ul>
            </div>
            <div className='tiptap mt-8'
                dangerouslySetInnerHTML={{ __html: parser.parseFromString(currentTransl?.content, 'text/html').body.innerHTML }}>
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
