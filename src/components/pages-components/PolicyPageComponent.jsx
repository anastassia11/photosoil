'use client'

import { getRules } from '@/api/rules/get_rules';
import { getTranslation } from '@/i18n/client';
import { BASE_SERVER_URL } from '@/utils/constants';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'

export default function PolicyPageComponent() {
    const { locale } = useParams();
    const { t } = getTranslation(locale);
    const [rules, setRules] = useState({});
    const [parser, setParser] = useState();

    let _isEng = locale === 'en';

    useEffect(() => {
        if (typeof document !== 'undefined') {
            setParser(new DOMParser());
        }
        fetchRules();
    }, [])

    const fetchRules = async () => {
        const result = await getRules();
        if (result.success) {
            setRules(result.data);
        }
    }

    return (
        <div className='flex flex-col'>
            <h1 className='sm:text-2xl text-xl font-semibold'>
                {t('rules_service')}
            </h1>
            {!!rules[_isEng ? 'contentEng' : 'contentRu'] && <div className='w-full bg-white md:pl-16 px-4 md:pr-32 md:pb-8 pb-4 md:mt-6 mt-2'>
                <div className='tiptap sm:mt-8 mt-4'
                    dangerouslySetInnerHTML={{ __html: parser?.parseFromString(rules[_isEng ? 'contentEng' : 'contentRu'] || '', 'text/html').body.innerHTML }}>
                </div>
            </div>}
            {!!rules.files?.length && <div id='files-section' className='mt-8 flex flex-col'>
                <label className="font-medium min-h-fit mb-2">
                    {`${t('files')}`}
                </label>
                <ul className={`mt-1 flex flex-col space-y-2`}>
                    {rules.files.map(file => <li key={file.id}>
                        <a className='flex flex-row text-blue-700 hover:underline duration-300 cursor-pointer'
                            href={`${BASE_SERVER_URL}${file?.path}`} download={true} target='_blank'
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="-4 0 40 40"
                                className='w-5 h-5 mr-1'>
                                <path
                                    fill="#EB5757"
                                    d="M25.669 26.096c-.488.144-1.203.16-1.97.049a9.392 9.392 0 0 1-2.49-.742c1.473-.214 2.615-.148 3.591.198.232.082.612.301.869.495Zm-8.214-1.35-.177.048c-.396.108-.782.213-1.153.306l-.501.127c-1.008.255-2.038.516-3.055.826.387-.932.746-1.875 1.098-2.797.26-.682.526-1.379.801-2.067.14.23.285.461.437.692a13.483 13.483 0 0 0 2.55 2.865Zm-2.562-10.513c.065 1.15-.183 2.257-.547 3.318-.449-1.312-.658-2.762-.097-3.932.144-.3.261-.46.338-.545.118.183.273.59.306 1.159Zm-5.26 14.572c-.252.451-.509.873-.772 1.272-.637.958-1.677 1.985-2.212 1.985-.052 0-.116-.008-.209-.107-.06-.062-.07-.107-.066-.169.018-.352.485-.98 1.161-1.562a11.44 11.44 0 0 1 2.098-1.419Zm17.738-2.659c-.082-1.174-2.059-1.927-2.078-1.934-.764-.271-1.594-.403-2.538-.403-1.01 0-2.098.146-3.497.473a12.17 12.17 0 0 1-3.122-3.209c-.354-.54-.673-1.079-.951-1.605.678-1.623 1.29-3.367 1.178-5.32-.09-1.566-.796-2.618-1.756-2.618-.659 0-1.226.488-1.688 1.451-.822 1.718-.606 3.915.643 6.537a91.473 91.473 0 0 0-1.272 3.213c-.504 1.319-1.023 2.68-1.607 3.973-1.64.65-2.987 1.436-4.109 2.402-.735.631-1.622 1.597-1.672 2.605-.025.474.138.91.468 1.258.352.37.793.566 1.279.566 1.603 0 3.146-2.202 3.439-2.644.589-.888 1.14-1.879 1.68-3.021 1.361-.492 2.811-.859 4.217-1.214l.503-.128a67.63 67.63 0 0 0 1.175-.313c.427-.115.867-.235 1.313-.349 1.443.918 2.995 1.517 4.51 1.737 1.274.185 2.406.078 3.173-.322.69-.36.728-.913.712-1.135Zm3.105 10.097c0 2.15-1.896 2.283-2.278 2.287H3.745c-2.143 0-2.272-1.908-2.276-2.287V3.756c0-2.152 1.899-2.283 2.276-2.287h16.518l.009.009v6.446c0 1.294.782 3.743 3.744 3.743h6.404l.055.055v24.52Zm-1.519-26.045h-4.94c-2.142 0-2.272-1.898-2.275-2.274v-4.97l7.215 7.244Zm2.988 26.045V11.116L21.742.87V.823h-.048L20.874 0H3.744C2.45 0 0 .785 0 3.757v32.486C0 37.543.783 40 3.745 40H28.2c1.295 0 3.745-.786 3.745-3.757Z"
                                />
                            </svg>
                            {file?.fileName}
                        </a>
                    </li>)}
                </ul>
            </div>}
        </div>
    )
}