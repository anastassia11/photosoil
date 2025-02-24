import Footer from '@/components/footer/Footer'

export default function FooterLayout({ params: { locale }, children }) {
	return (
		<div className='text-zinc-800 2xl:pb-[230px] sm:pb-[320px] pb-[420px] w-full flex justify-center'>
			{children}
			<Footer locale={locale} />
		</div>
	)
}
