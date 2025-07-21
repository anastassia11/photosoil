import { getEcosystems } from '@/api/ecosystem/get_ecosystems'
import { useQuery } from '@tanstack/react-query'
import { useParams, useSearchParams } from 'next/navigation'

export default function useEcosystems() {
    const searchParams = useSearchParams()
    const { locale } = useParams()

    const _isEng = locale === 'en'

    const { data, isLoading } = useQuery({
        queryKey: ['ecosystems'],
        queryFn: getEcosystems,
        select: res => {
            let data = [...res.data]

            const selectedAuthors = searchParams.get('authors')?.split(',').map(Number) ?? []
            const filterName = searchParams.get('search')
            const draftIsVisible = searchParams.get('draft')

            data = data.filter(ecosystem => {
                const translation = ecosystem.translations?.find(
                    transl => transl.isEnglish === (_isEng)
                )
                const matchesSearch = !filterName || (
                    translation?.name.toLowerCase().includes(filterName.toLowerCase()) ||
                    translation?.code?.toLowerCase().includes(filterName.toLowerCase())
                )

                const matchesAuthor = selectedAuthors.length === 0 ||
                    selectedAuthors.some(selectedAuthor =>
                        ecosystem.authors?.some(author => author === selectedAuthor)
                    )

                const matchesDraft = draftIsVisible && draftIsVisible == 1 || translation?.isVisible

                return translation
                    && matchesSearch
                    && matchesAuthor
                    && matchesDraft
            }).sort((a, b) => {
                return b.createdDate - a.createdDate
            }).map(item => ({ ...item, _type: 'ecosystem' }))

            return data
        }
    })

    return { data, isLoading }
}
