import { getAllNews } from '@/api/news/get_allNews'
import { getTags } from '@/api/tags/get_tags'
import { useQuery } from '@tanstack/react-query'
import { useParams, useSearchParams } from 'next/navigation'

export default function useNews() {
    const searchParams = useSearchParams()
    const { locale } = useParams()

    const _isEng = locale === 'en'

    const { data: news = [], isLoading: newsIsLoading } = useQuery({
        queryKey: ['news'],
        queryFn: getAllNews,
        select: res => {
            let data = [...res.data]

            const draftIsVisible = searchParams.get('draft')
            const filterName = searchParams.get('search')
            const selectedTags = searchParams.get('tags')?.split(',').map(Number) ?? []

            data = data.filter(item => {
                const translation = item.translations?.find(
                    transl => transl.isEnglish === (_isEng)
                )
                const matchesSearch = !filterName || (
                    translation?.title.toLowerCase().includes(filterName.toLowerCase())
                )

                const matchesTags = selectedTags.length === 0 ||
                    selectedTags.some(selectedTag =>
                        item.tags?.some(({ id }) => id === selectedTag)
                    )

                const matchesDraft = draftIsVisible && draftIsVisible == 1 || translation?.isVisible

                return translation
                    && matchesSearch
                    && matchesTags
                    && matchesDraft
            }).sort((a, b) => {
                return b.createdDate - a.createdDate
            })
            return data
        }
    })

    const { data: tags, isLoading: tagsIsLoading } = useQuery({
        queryKey: ['tags'],
        queryFn: getTags,
        select: res => res.data
    })

    return {
        news, newsIsLoading,
        tags, tagsIsLoading
    }
}
