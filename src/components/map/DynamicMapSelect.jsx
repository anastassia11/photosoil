import dynamic from 'next/dynamic'


const DynamicMapSelect = dynamic(() => import('./MapSelect'), { ssr: false })
export default DynamicMapSelect
