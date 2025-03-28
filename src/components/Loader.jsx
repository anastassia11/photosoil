import ContentLoader from 'react-content-loader'

export default function Loader(props) {
	return (
		<ContentLoader
			backgroundColor='#f0f0f0'
			foregroundColor='#dedede'
			{...props}
		>
			<rect
				x='0'
				y='0'
				rx='10'
				ry='10'
				width='100%'
				height='100%'
			/>
		</ContentLoader>
	)
}
