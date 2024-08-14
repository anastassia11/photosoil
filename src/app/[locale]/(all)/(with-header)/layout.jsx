import Header from '@/components/header/Header'

export default function HeaderLayout({ params: { locale }, children }) {
    return (
        <div className='min-h-screen relative pt-16'>
            <Header locale={locale} />
            {children}
        </div>
    )
}
