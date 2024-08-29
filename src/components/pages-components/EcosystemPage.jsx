'use client'

import { getEcosystem } from '@/api/ecosystem/get_ecosystem';
import SoilObject from '@/components/soils/SoilObject';
import { useConstants } from '@/hooks/useConstants';
import { getTranslation } from '@/i18n/client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EcosystemPageComponent({ id }) {
    const [ecosystem, setEcosystem] = useState({});
    const [parser, setParser] = useState();

    const { locale } = useParams();
    const { t } = getTranslation(locale);
    const { ECOSYSTEM_INFO } = useConstants();

    let _isEng = locale === 'en';

    const currentTransl = ecosystem?.translations?.find(({ isEnglish }) => isEnglish === _isEng);

    useEffect(() => {
        if (typeof document !== 'undefined') {
            setParser(new DOMParser());
        };
        fetchEcosystem();
    }, [])

    useEffect(() => {
        if (typeof document !== 'undefined' && currentTransl) {
            const title = currentTransl.name
            if (title) {
                document.title = `${title} | PhotoSOIL`;
            }
        }
    }, [currentTransl])

    const fetchEcosystem = async () => {
        const result = await getEcosystem(id)
        if (result.success) {
            setEcosystem(result.data)
        }
    }

    return (
        <SoilObject object={ecosystem} type='ecosystem'>
            <ul className='flex flex-col space-y-2 '>
                {ECOSYSTEM_INFO.map(({ name, title }) => {
                    return (currentTransl?.hasOwnProperty(name) && currentTransl[name].length && currentTransl[name] !== '<p></p>')
                        ? <li key={name}
                            className='flex xl:flex-row flex-col w-full xl:space-x-4 space-x-0'>
                            <span className='xl:w-[40%] w-full text-zinc-500 font-semibold'>
                                {title}
                            </span>
                            <div id={name} className='xl:w-[60%] w-full flex flex-col items-start'>
                                {name === 'comments' ? <div className='tiptap'
                                    dangerouslySetInnerHTML={{
                                        __html: parser?.parseFromString(currentTransl[name] || '', 'text/html').body.innerHTML
                                    }}>
                                </div>
                                    : currentTransl[name]}
                            </div>
                        </li> : ''
                })}

                {!ecosystem.isExternal && ecosystem.authors?.length ? <li key='authors'
                    className='flex lg:flex-row flex-col w-full lg:space-x-4 space-x-0'>
                    <span className='lg:w-[40%] w-full text-zinc-500 font-semibold'>
                        {t('authors')}
                    </span>
                    <ul className={`lg:w-[60%] w-full flex flex-row flex-wrap items-start justify-start h-fit`}>
                        {ecosystem.authors?.map(({ id, dataEng, dataRu }, index) =>
                            <li key={`author-${index}`} className='mr-2 min-w-fit h-fit'>
                                <Link href={`/${locale}/authors/${id}`}
                                    prefetch={false}
                                    className='text-blue-600 hover:underline'>
                                    {_isEng ? dataEng?.name : dataRu?.name}
                                </Link>
                                {ecosystem.authors.length > 1 && index + 1 < ecosystem.authors.length && ','}
                            </li>
                        )}
                    </ul>
                </li> : ''}

                {currentTransl?.code ? <div
                    className='flex xl:flex-row flex-col w-full xl:space-x-4 space-x-0'>
                    <span className='xl:w-[40%] w-full text-zinc-500 font-semibold'>
                        {t('code')}
                    </span>
                    <div className='xl:w-[60%] w-full flex flex-col items-start'>
                        {currentTransl.code}
                    </div>
                </div> : ''}
            </ul>
        </SoilObject>
    )
}
