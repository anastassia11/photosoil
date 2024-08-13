import SoilsPageComponent from '@/components/soils/SoilsPage';

export default function SoilsPage({ params: { type } }) {
    return <SoilsPageComponent type={type} />
}
