import { deleteAuthor } from '@/api/author/delete_author'
import { getAuthorsForAdmin } from '@/api/author/get_authors_forAdmin'
import { adminSortsStore } from '@/store/valtioStore/adminSortsStore'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, useSearchParams } from 'next/navigation'
import { useSnapshot } from 'valtio'

export default function useAdminAuthors() {
    const queryClient = useQueryClient()
    const searchParams = useSearchParams()
    const { locale } = useParams()
    const { sortBy, sortType } = useSnapshot(adminSortsStore)

    const _isEng = locale === 'en'

    const { data: authors = [], isLoading: authorsIsLoading } = useQuery({
        queryKey: ['admin authors'],
        queryFn: getAuthorsForAdmin,
        select: res => {
            let data = [...res.data]

            const filterName = searchParams.get('search')

            data = data.filter(author => {
                const matchesSearch = !filterName || (
                    author?.dataEng?.name?.toLowerCase().includes(filterName.toLowerCase()) ||
                    author?.dataRu?.name?.toLowerCase().includes(filterName.toLowerCase())
                )

                return matchesSearch
            }).sort((a, b) => {
                const fieldA = _isEng ? a.dataEng.name : a.dataRu.name
                const fieldB = _isEng ? b.dataEng.name : b.dataRu.name
                return fieldA?.toString()?.localeCompare(fieldB)
            }).sort((a, b) => {
                return sortType == 1
                    ? b.authorType - a.authorType
                    : a.authorType - b.authorType
            }).sort((a, b) => {
                let fieldA, fieldB

                if (sortBy === 'name') {
                    fieldA = a[_isEng ? 'dataEng' : 'dataRu'][sortBy]
                    fieldB = b[_isEng ? 'dataEng' : 'dataRu'][sortBy]
                } else {
                    fieldA = a[sortBy]
                    fieldB = b[sortBy]
                }
                if (sortBy === 'authorType') {
                    return sortType == 1
                        ? a.authorType - b.authorType
                        : b.authorType - a.authorType
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
