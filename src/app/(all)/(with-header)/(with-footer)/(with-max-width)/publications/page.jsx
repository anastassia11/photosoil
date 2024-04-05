'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react'

export default function PublicationsPage() {
    const pathname = usePathname();
    const [publications, setPublications] = useState([]);
    const [filterName, setFilterName] = useState('');
    const [filteredPublications, setFilteredPublications] = useState([]);

    useEffect(() => {
        setPublications([
            {
                id: 1,
                type: "Статья",
                title: "Математическое моделирование взаимодействия одиночной сверхзвуковой струи с подвижной преградой",
                authors: "Kagenov, A.M., Kostyushin, K.V., Chervakova, A.V., Eremin, I.V.",
                journal: "Vestnik Tomskogo Gosudarstvennogo Universiteta, Matematika i Mekhanika, 2022, (78), страницы 49–59",

            }, {
                id: 2,
                type: "Статья",
                title: "Investigation of acoustic characteristics of a single supersonic jet flowing into a flooded space | Исследование акустических характеристик одиночной сверхзвуковой струи, истекающей в затопленное пространство",
                authors: "Kagenov, A.M., Kostyushin, K.V., Chervakova, A.V., Eremin, I.V.",
                journal: "Vestnik Tomskogo Gosudarstvennogo Universiteta, Matematika i Mekhanika, 2022, (78), страницы 49–59",

            }, {
                id: 3,
                type: "Статья",
                title: "Simulation of non-stationary gas dynamics of solid propellant rockets launch",
                authors: "Kagenov, A.M., Kostyushin, K.V., Chervakova, A.V., Eremin, I.V.",
                journal: "Vestnik Tomskogo Gosudarstvennogo Universiteta, Matematika i Mekhanika, 2022, (78), страницы 49–59",
            }
        ])
    }, [])

    useEffect(() => {
        setFilteredPublications(prev => publications.filter(publication =>
            publication.title.toLowerCase().includes(filterName.toLowerCase())))
    }, [filterName, publications])

    return (
        <div className='flex flex-col'>
            <h1 className='text-2xl font-semibold mb-4'>
                Публикации
            </h1>
            <div className='relative flex flex-row space-x-2 mb-4'>
                <div className="relative w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute top-0 bottom-0 w-6 h-6 my-auto text-zinc-400 left-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        type="text"
                        placeholder="Найти по названию"
                        className="w-full py-2 pl-12 pr-4 border rounded-md outline-none bg-white focus:border-blue-600"
                    />
                </div>
            </div>

            <section className="">
                <div className="mx-auto ">
                    <ul className="">
                        {
                            filteredPublications.map((item, idx) => (
                                <li key={idx} className="mt-4 border-b flex flex-row group">
                                    <Link href={`${pathname}/${item.id}`}
                                        className='justify-between items-start flex flex-row flex-1 mb-4 px-4 py-5 border border-transparent duration-300 cursor-pointer rounded-lg hover:bg-white'>
                                        <div className='space-y-3'>
                                            <div className="flex items-center gap-x-3">
                                                <div>
                                                    <span className="block text-sm text-indigo-600 font-medium">{item.type}</span>
                                                    <h3 className="text-base text-gray-800 font-semibold mt-1">{item.title}</h3>
                                                </div>
                                            </div>
                                            <p className="text-gray-600 sm:text-sm">
                                                {item.authors}
                                            </p>
                                            <div className="text-sm text-gray-600 flex items-center gap-6">
                                                <span className="flex items-center gap-2">

                                                    {item.journal}
                                                </span>
                                                <span className="flex items-center gap-2">


                                                    {item.location}
                                                </span>
                                            </div>
                                        </div>
                                        <button>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                className='w-6 h-6 text-zinc-500 hover:text-zinc-800 duration-300'>
                                                <path
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.5}
                                                    d="M3 15c0 2.828 0 4.243.879 5.121C4.757 21 6.172 21 9 21h6c2.828 0 4.243 0 5.121-.879C21 19.243 21 17.828 21 15M12 3v13m0 0 4-4.375M12 16l-4-4.375" />
                                            </svg>
                                        </button>
                                    </Link>

                                </li>
                            ))
                        }
                    </ul>
                </div>
            </section>
        </div>
    )
}
