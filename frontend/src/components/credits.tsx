export default function CreditsApp() {
	return (
		<div className="h-full flex flex-col">
			<div className="text-center mb-6">
				<h2 className="text-2xl font-bold text-blue-400 mb-2">
					Credits
				</h2>
			</div>

			<div className="grid grid-cols-1 gap-6">
				<div className="bg-white/10 p-4 rounded-lg">
					<h3 className="text-xl font-semibold mb-2">
						Development Team
					</h3>
					<ul className="list-disc pl-5 space-y-1">
						<li>Rafael Marchel Darma Wijaya - 13523146</li>
						<li>Ahmad Syafiq - 13523135</li>
						<li>Andi Farhan Hidaya - 13523128</li>
					</ul>
				</div>

				<div className="bg-white/10 p-4 rounded-lg">
					<h3 className="text-xl font-semibold mb-2">Technologies</h3>
					<ul className="list-disc pl-5 space-y-1">
						<li>Next.js & React</li>
						<li>Tailwind CSS</li>
						<li>D3.js for Visualizations</li>
						<li>Zustand for State Management</li>
					</ul>
				</div>
			</div>

			<div className="mt-auto pt-6 text-center text-white/50 text-sm">
				Dibuat untuk Tugas Besar 2 Mata Kuliah Strategi Algoritma ITB ©
				2025
			</div>
		</div>
	);
}
