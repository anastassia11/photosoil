import { getAuthors } from '@/api/author/get_authors'
import { useQuery } from '@tanstack/react-query'
import { useParams, useSearchParams } from 'next/navigation'

export default function useAuthors() {
    const searchParams = useSearchParams()
    const { locale } = useParams()

    const { data: authors = [], isLoading: authorsIsLoading } = useQuery({
        queryKey: ['authors'],
        queryFn: getAuthors,
        select: res => {
            let data = [...res.data]

            const filterName = searchParams.get('search')

            data = data.filter(author => {
                const translation = locale === 'en'
                    ? author.dataEng : author.dataRu

                const matchesSearch = !filterName || (
                    translation?.name.toLowerCase().includes(filterName.toLowerCase()) ||
                    translation?.code?.toLowerCase().includes(filterName.toLowerCase())
                )

                return matchesSearch
            }).sort((a, b) => {
                const fieldA = locale === 'en' ? a.dataEng.name : a.dataRu.name
                const fieldB = locale === 'en' ? b.dataEng.name : b.dataRu.name
                return fieldA?.toString()?.localeCompare(fieldB)
            }).sort((a, b) => {
                return a.authorType - b.authorType
            })

            return data
        }
    })

    return { authors, authorsIsLoading }
}
