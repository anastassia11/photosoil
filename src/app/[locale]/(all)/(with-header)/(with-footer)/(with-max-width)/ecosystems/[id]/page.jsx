'use client'

import { getEcosystem } from '@/api/ecosystem/get_ecosystem';
import SoilObject from '@/components/soils/SoilObject';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function EcosystemPage({ params: { id } }) {
    const [ecosystem, setEcosystem] = useState({});
    const { t } = useTranslation();
    const { locale } = useParams();
    let _isEng = locale === 'en';

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
        <SoilObject object={ecosystem} type='ecosystem'>
            <ul className='flex flex-col space-y-2 '>
                {ecosystem?.translations?.find(({ isEnglish }) => isEnglish === _isEng)?.description ?
                    <li key='ecosystem-description'
                        className='flex lg:flex-row flex-col w-full lg:space-x-4 space-x-0'>
                        <span className='lg:w-[40%] w-full text-zinc-500 font-semibold'>
                            {t('description')}
                        </span>
                        <span className={`lg:w-[60%] w-full }`}>
                            {ecosystem?.translations?.find(({ isEnglish }) => isEnglish === _isEng)?.description}
                        </span>
                    </li> : ''}

                {ecosystem.authors?.length ? <li key='authors'
                    className='flex lg:flex-row flex-col w-full lg:space-x-4 space-x-0'>
                    <span className='lg:w-[40%] w-full text-zinc-500 font-semibold'>
                        {t('authors')}
                    </span>
                    <ul className={`lg:w-[60%] w-full flex flex-row`}>
                        {ecosystem.authors?.map(({ id, name }, index) =>
                            <li key={`author-${index}`} className='mr-2'>
                                <Link href={`/authors/${id}`}
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
