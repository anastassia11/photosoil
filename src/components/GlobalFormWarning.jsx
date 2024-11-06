import { getTranslation } from '@/i18n/client';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

export default function GlobalFormWarning() {
    const { isDirty } = useSelector(state => state.form);
    const { locale } = useParams();
    const { t } = getTranslation(locale);

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (isDirty) {
                const message = t('form_confirm');
                event.preventDefault(); // Для современных браузеров
                event.returnValue = message; // Для старых браузеров
                return message; // Для других браузеров
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isDirty]);

    return null;
}
