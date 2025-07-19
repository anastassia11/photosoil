import { getAccounts } from '@/api/account/get_accounts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, useSearchParams } from 'next/navigation'
import { createAccount } from '@/api/account/create_account'
import { deleteAccount } from '@/api/account/delete_account'
import { changeRole } from '@/api/account/change_Role'
import { useDispatch } from 'react-redux'
import { getTranslation } from '@/i18n/client'
import { openAlert } from '@/store/slices/alertSlice'

export default function useAccounts() {
    const queryClient = useQueryClient()
    const searchParams = useSearchParams()
    const { locale } = useParams()
    const dispatch = useDispatch()
    const { t } = getTranslation(locale)

    const _isEng = locale === 'en'

    const { data: accounts = [], isLoading: accountsIsLoading } = useQuery({
        queryKey: ['admin accounts'],
        queryFn: getAccounts,
        select: res => {
            let data = [...res.data]

            const filterName = searchParams.get('search')
            const sortBy = searchParams.get('sortBy')

            // 1 = по возрастанию 
            // 0 = по убыванию
            const sortType = searchParams.get('sortType')

            data = data.filter(account => {
                const matchesSearch = !filterName || (
                    account.name?.toLowerCase().includes(filterName.toLowerCase()) ||
                    account.email?.toLowerCase().includes(filterName.toLowerCase())
                )

                return matchesSearch
            }).sort((a, b) => {
                return a.role?.toString()?.localeCompare(b.role)
            }).sort((a, b) => {
                let fieldA, fieldB

                fieldA = a[sortBy]
                fieldB = b[sortBy]

                return sortType == 1
                    ? fieldA?.toString()?.localeCompare(fieldB)
                    : fieldB?.toString()?.localeCompare(fieldA)
            })

            return data
        }
    })

    const { mutate: fetchDeleteAccount, isPending: deleteIsPending } = useMutation({
        mutationKey: ['delete account'],
        mutationFn: deleteAccount,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin accounts'] })
    })

    const { mutate: fetchCreateAccount, isPending: createIsPending } = useMutation({
        mutationKey: ['create account'],
        mutationFn: createAccount,
        onSuccess: () => {
            dispatch(
                openAlert({
                    title: t('success'),
                    message: t('created_account'),
                    type: 'success'
                })
            )
            queryClient.invalidateQueries({ queryKey: ['admin accounts'] })
        },
        onError: () => {
            dispatch(
                openAlert({
                    title: t('error'),
                    message: t('error_account'),
                    type: 'error'
                })
            )
        }
    })

    const { mutate: fetchChangeRole, isPending: changeIsPending } = useMutation({
        mutationKey: ['change account'],
        mutationFn: data => changeRole(data.userId, data.isAdmin),
        onSuccess: data => {
            dispatch(
                openAlert({
                    title: t('success'),
                    message: data.data.role === 'Admin' ? t('is_admin') : t('is_moderator'),
                    type: 'success'
                })
            )
            queryClient.invalidateQueries({ queryKey: ['admin accounts'] })
        },
        onError: () => {
            dispatch(
                openAlert({
                    title: t('error'),
                    message: t('error_rights'),
                    type: 'error'
                })
            )
        }
    })

    return {
        accounts, accountsIsLoading,
        fetchDeleteAccount, deleteIsPending,
        fetchCreateAccount, createIsPending,
        fetchChangeRole, changeIsPending
    }
}
