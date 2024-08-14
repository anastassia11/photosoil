import AuthorPageComponent from '@/components/pages-components/AutorPage';
import { BASE_SERVER_URL } from '@/utils/constants';
import axios from 'axios';

export async function generateMetadata({ params: { id, locale } }) {
    let title, description;

    const result = await axios.get(`${BASE_SERVER_URL}/api/Author/GetById?Id=${id}`);
    if (!result.data.error) {
        const data = result.data.response;
        title = locale === 'en' ? data.dataEng.name : data.dataRu.name
        //description = data.description || '';
    }

    return {
        title,
        description
    };
}

export default function AuthorPage({ params: { id } }) {
    return <AuthorPageComponent id={id} />
}