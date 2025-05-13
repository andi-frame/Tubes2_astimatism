export default function RickApp() {
	return (
		<div className="h-full flex flex-col">
			<div className="flex-grow relative">
				<iframe
					className="absolute inset-0 w-full h-full rounded-lg"
					src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1"
					title="Recipe Visualizer Demo"
					frameBorder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
				></iframe>
			</div>
		</div>
	);
}
