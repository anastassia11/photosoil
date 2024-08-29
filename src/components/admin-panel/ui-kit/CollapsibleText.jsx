import { getTranslation } from '@/i18n/client';
import { useParams } from 'next/navigation';
import { useState } from 'react'

export default function CollapsibleText({ text, limit }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const { locale } = useParams();
    const { t } = getTranslation(locale);
    const isTextLong = text?.length > limit;

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <p>
            {isExpanded ? text : `${text?.substring(0, limit)}${isTextLong ? '... ' : ''}`}
            {isTextLong && (
                <button onClick={toggleExpand} className="text-blue-600">
                    {isExpanded ? t('collapse') : t('expand')}
                </button>
            )}
        </p>
    )
}
