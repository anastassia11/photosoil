'use client'

import Pagination from '@/components/Pagination';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NewsPage() {
    const pathname = usePathname();
    const [news, setNews] = useState([]);
    const [filterName, setFilterName] = useState('');
    const [filteredNews, setFilteredNews] = useState([]);
    const [currentItems, setCurrentItems] = useState([]);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const OPTIONS = ['3', '10', '20', '30', '40', '50']

    useEffect(() => {
        setNews(_news);
    }, [])

    useEffect(() => {
        setFilteredNews(prev => news.filter(item =>
            item.title.toLowerCase().includes(filterName.toLowerCase())))
    }, [filterName, news])

    const _news = [
        {
            id: 1,
            title: 'Обзор по морфологии ветровальных нарушений в почвах',
            date: '09/06/2020',
            annotation: ' В новом российском журнале Russian Journal of Ecosystem Ecology напечатан обзор, посвященный морфологии ветровальных нарушений в лесных почвах',

        },
        {
            id: 2,
            title: 'Обзор по морфологии ветровальных нарушений в почвах',
            date: '09/06/2020',
            annotation: ' В новом российском журнале Russian Journal of Ecosystem Ecology напечатан обзор, посвященный морфологии ветровальных нарушений в лесных почвах',

        },
        {
            id: 3,
            title: 'Обзор по морфологии ветровальных нарушений в почвах',
            date: '09/06/2020',
            annotation: ' В новом российском журнале Russian Journal of Ecosystem Ecology напечатан обзор, посвященный морфологии ветровальных нарушений в лесных почвах',

        },
        {
            id: 4,
            title: 'Обзор по морфологии ветровальных нарушений в почвах',
            date: '09/06/2020',
            annotation: ' В новом российском журнале Russian Journal of Ecosystem Ecology напечатан обзор, посвященный морфологии ветровальных нарушений в лесных почвах',

        },
    ]

    const NewsCard = ({ id, date, title, annotation }) => {
        return <Link href={`${pathname}/${id}`}
            className="px-8 py-4 bg-white rounded-lg border hover:border-blue-600 duration-300 w-full h-full
            flex flex-col">
            <span className="text-sm font-light text-gray-600">{date}</span>

            <div className="mt-2">
                <h3 className="text-xl font-medium text-gray-700 hover:text-gray-600">{title}</h3>
                <p className="mt-2 text-gray-600 ">{annotation}</p>
            </div>

            <div className="flex items-center justify-between mt-4">
                <span className="text-blue-600 hover:underline duration-300">Подробнее</span>
            </div>
        </Link>
    }

    return (
        <div className='flex flex-col'>
            <h1 className='text-2xl font-semibold mb-4'>
                Новости
            </h1>

            <div className="relative w-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute top-0 bottom-0 w-6 h-6 my-auto text-zinc-400 left-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    type="text"
                    placeholder='Найти по заголовку'
                    className="w-full py-2 pl-12 pr-4 border rounded-md outline-none bg-white focus:border-blue-600"
                />
            </div>

            <div className='self-end flex-row items-center justify-center mb-4'>
                <span>На странице</span>
                <select value={itemsPerPage}
                    onChange={e => setItemsPerPage(e.target.value)}
                    className="ml-2 p-0 px-2 h-8 focus:outline-[0] border rounded-md outline-none">
                    {OPTIONS.map((item) => <option value={item} key={item}
                        className=''>{item}</option>)}
                </select >
            </div>

            <ul className='grid grid-cols-4 gap-[20px] mb-4'>
                {currentItems.map((item, idx) => <li key={`news_${idx}`} className='w-full h-full'>
                    <NewsCard {...item} />
                </li>)}
            </ul>

            <Pagination itemsPerPage={itemsPerPage} items={filteredNews}
                updateCurrentItems={(newCurrentItems) => setCurrentItems(newCurrentItems)} />
        </div>
    )
}
