'use client'

import { getEcosystem } from '@/api/get_ecosystem';
import SoilObject from '@/components/soils/SoilObject';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function EcosystemPage({ params: { id } }) {
    const [ecosystem, setEcosystem] = useState({});

    useEffect(() => {
        fetchEcosystem();
    }, [])

    const fetchEcosystem = async () => {
        const result = await getEcosystem(id)
        if (result.success) {
            setEcosystem(result.data)
        }
    }

    return (
        <SoilObject object={ecosystem}>
            <ul className='flex flex-col space-y-2 '>
                <li key='{name}'
                    className='flex flex-row w-full space-x-4'>
                    <span className='w-[40%] text-zinc-500 font-semibold'>
                        Описание
                    </span>
                    <span className={`w-[60%] }`}>
                        {ecosystem.description}
                    </span>
                </li>

                {ecosystem.authors?.length ? <li key='authors'
                    className='flex flex-row w-full space-x-4'>
                    <span className='w-[40%] text-zinc-500 font-semibold'>
                        Авторы
                    </span>
                    <ul className={`w-[60%] flex flex-row`}>
                        {ecosystem.authors?.map(({ id, name }, index) =>
                            <li key={id} className='mr-1'>
                                <Link href={`${BASE_URL}/authors/${id}`}
                                    className='text-blue-600 hover:underline'>
                                    {name}
                                </Link>
                                {ecosystem.authors.length > 1 && index + 1 < ecosystem.authors.length && ','}
                            </li>
                        )}
                    </ul>
                </li> : ''}
            </ul>
        </SoilObject>
    )
}
