import Header from '@/components/header/Header'
import { TooltipProvider } from '@/components/ui/tooltip'

export default function HeaderLayout({ params: { locale }, children }) {
	return (
		<div className='min-h-screen relative pt-16'>
			<Header locale={locale} />
			<TooltipProvider>
				{children}
			</TooltipProvider>
		</div>
	)
}
