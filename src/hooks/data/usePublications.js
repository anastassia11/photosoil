import { getPublications } from '@/api/publication/get_publications'
import { useQuery } from '@tanstack/react-query'
import { useParams, useSearchParams } from 'next/navigation'

export default function usePublications() {
    const searchParams = useSearchParams()
    const { locale } = useParams()

    const _isEng = locale === 'en'

    const { data, isLoading } = useQuery({
        queryKey: ['publications'],
        queryFn: getPublications,
        select: res => {
            let data = [...res.data]

            const filterName = searchParams.get('search')
            const draftIsVisible = searchParams.get('draft')

            data = data.filter(publication => {
                const translation = publication.translations?.find(
                    transl => transl.isEnglish === (_isEng)
                )

                const matchesSearch = !filterName || (
                    translation?.name.toLowerCase().includes(filterName.toLowerCase())
                )

                const matchesDraft = draftIsVisible && draftIsVisible == 1 || translation?.isVisible

                return translation
                    && matchesSearch
                    && matchesDraft
            }).sort((a, b) => {
                return b.createdDate - a.createdDate
            }).map(item => ({ ...item, _type: 'publication' }))

            return data
        }
    })

    return { data, isLoading }
}
