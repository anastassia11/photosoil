import PublicationPageComponent from '@/components/pages-components/PublicationPage';
import { BASE_SERVER_URL } from '@/utils/constants';
import axios from 'axios';

export async function generateMetadata({ params: { id, locale } }) {
    let title, description;

    const result = await axios.get(`${BASE_SERVER_URL}/api/Publication/GetById?Id=${id}`);
    if (!result.data.error) {
        const data = result.data.response.translations.find(({ isEnglish }) => isEnglish === (locale === 'en'));
        title = data.name;
        //description = data.description || '';
    }

    return {
        title,
        description
    };
}

export default function PublicationPage({ params: { id, locale } }) {
    return <PublicationPageComponent id={id} locale={locale} />
}
