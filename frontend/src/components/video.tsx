export default function YouTubeApp() {
	return (
		<div className="h-full flex flex-col">
			<div className="text-center mb-4">
				<h2 className="text-2xl font-bold text-blue-400">
					Project Demo
				</h2>
				<p className="text-white/70 mb-4">
					Watch an explanation of this website
				</p>
			</div>

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
