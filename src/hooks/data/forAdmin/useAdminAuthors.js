import { deleteAuthor } from '@/api/author/delete_author'
import { getAuthorsForAdmin } from '@/api/author/get_authors_forAdmin'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, useSearchParams } from 'next/navigation'

export default function useAdminAuthors() {
    const queryClient = useQueryClient()
    const searchParams = useSearchParams()
    const { locale } = useParams()

    const _isEng = locale === 'en'

    const { data: authors = [], isLoading: authorsIsLoading } = useQuery({
        queryKey: ['admin authors'],
        queryFn: getAuthorsForAdmin,
        select: res => {
            let data = [...res.data]

            const filterName = searchParams.get('search')
            const sortBy = searchParams.get('sortBy')

            // 1 = по возрастанию 
            // 0 = по убыванию
            const sortType = searchParams.get('sortType')

            data = data.filter(author => {
                const matchesSearch = !filterName || (
                    author?.dataEng?.name?.toLowerCase().includes(filterName.toLowerCase()) ||
                    author?.dataRu?.name?.toLowerCase().includes(filterName.toLowerCase())
                )

                return matchesSearch
            }).sort((a, b) => {
                let fieldA, fieldB

                if (sortBy === 'name') {
                    fieldA = a[_isEng ? 'dataEng' : 'dataRu'][sortBy]
                    fieldB = b[_isEng ? 'dataEng' : 'dataRu'][sortBy]
                } else {
                    fieldA = a[sortBy]
                    fieldB = b[sortBy]
                }

                return sortType == 1
                    ? fieldA?.toString()?.localeCompare(fieldB)
                    : fieldB?.toString()?.localeCompare(fieldA)

            })

            return data
        }
    })

    const { mutate: fetchDeleteAuthor, isPending: deleteIsPending } = useMutation({
        mutationKey: ['delete author'],
        mutationFn: deleteAuthor,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin authors'] })
    })

    return {
        authors, authorsIsLoading,
        fetchDeleteAuthor, deleteIsPending
    }
}
