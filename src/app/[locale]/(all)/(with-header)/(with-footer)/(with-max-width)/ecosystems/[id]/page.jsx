import EcosystemPageComponent from '@/components/pages-components/EcosystemPage';
import { BASE_SERVER_URL } from '@/utils/constants';
import axios from 'axios';

export async function generateMetadata({ params: { id, locale } }) {
    let title, description;

    const result = await axios.get(`${BASE_SERVER_URL}/api/Ecosystem/GetById?Id=${id}`);
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

export default function EcosystemPage({ params: { id, locale } }) {
    return <EcosystemPageComponent id={id} locale={locale} />
}
