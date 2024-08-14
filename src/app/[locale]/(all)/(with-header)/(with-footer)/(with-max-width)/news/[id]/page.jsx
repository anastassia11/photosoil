import NewsItemPageComponent from '@/components/pages-components/NewsItemPage';
import { BASE_SERVER_URL } from '@/utils/constants';
import axios from 'axios';

export async function generateMetadata({ params: { id, locale } }) {
    let title, description;

    const result = await axios.get(`${BASE_SERVER_URL}/api/News/GetById?Id=${id}`);
    if (!result.data.error) {
        const data = result.data.response.translations.find(({ isEnglish }) => isEnglish === (locale === 'en'));
        title = data?.title;
        //description = data.description || '';
    }

    return {
        title,
        description
    };
}

export default function NewsItemPage({ params: { id } }) {
    return <NewsItemPageComponent id={id} />
}