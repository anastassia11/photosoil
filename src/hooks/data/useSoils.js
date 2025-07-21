import { getSoils } from '@/api/soil/get_soils'
import { useQuery } from '@tanstack/react-query'
import { useParams, useSearchParams } from 'next/navigation'

export default function useSoils(type) {
    const searchParams = useSearchParams()
    const { locale } = useParams()

    const _isEng = locale === 'en'

    const { data: soils, isLoading: soilsIsLoading } = useQuery({
        queryKey: ['soils'],
        queryFn: getSoils,
        select: res => {
            let data = [...res.data]

            data =
                type === 'profiles'
                    ? data.filter(soil => soil.objectType === 1)
                    : type === 'dynamics'
                        ? data.filter(soil => soil.objectType === 0)
                        : type === 'morphological'
                            ? data.filter(soil => soil.objectType === 2)
                            : data

            const selectedCategories = searchParams.get('category')?.split(',').map(Number) ?? []
            const selectedTerms = searchParams.get('terms')?.split(',').map(Number) ?? []
            const selectedAuthors = searchParams.get('authors')?.split(',').map(Number) ?? []
            const filterName = searchParams.get('search')
            const draftIsVisible = searchParams.get('draft')

            data = data.filter(soil => {
                const translation = soil.translations?.find(
                    transl => transl.isEnglish === (_isEng)
                )
                const matchesSearch = !filterName || (
                    translation?.name.toLowerCase().includes(filterName.toLowerCase()) ||
                    translation?.code?.toLowerCase().includes(filterName.toLowerCase())
                )

                const matchesCategory = selectedCategories.length === 0 ||
                    selectedCategories.includes(soil.objectType)

                const matchesAuthor = selectedAuthors.length === 0 ||
                    selectedAuthors.some(selectedAuthor =>
                        soil.authors?.some(author => author === selectedAuthor)
                    )

                const matchesTerm = selectedTerms.length === 0 ||
                    selectedTerms.some(selectedTerm =>
                        soil.terms.some(term => term === selectedTerm)
                    )

                const matchesDraft = draftIsVisible && draftIsVisible == 1 || translation?.isVisible

                return translation
                    && matchesSearch
                    && matchesCategory
                    && matchesAuthor
                    && matchesTerm
                    && matchesDraft
            }).sort((a, b) => {
                return b.createdDate - a.createdDate
            }).map(item => ({ ...item, _type: 'soil' }))

            return data
        },
    })

    return {
        soils, soilsIsLoading,
    }
}
