"use client";

import { useState } from "react";
import Image from "next/image";

interface DesktopIconProps {
	id: string;
	icon: string;
	label: string;
	onLaunch: (id: string) => void;
}

export default function DesktopIcon({
	id,
	icon,
	label,
	onLaunch,
}: DesktopIconProps) {
	const [isHovered, setIsHovered] = useState(false);
	const [lastClickTime, setLastClickTime] = useState(0);

	const handleClick = () => {
		const currentTime = new Date().getTime();
		// Double click detection (within 300ms)
		if (currentTime - lastClickTime < 300) {
			onLaunch(id);
		}
		setLastClickTime(currentTime);
	};

	return (
		<div
			className="desktop-icon flex flex-col items-center justify-center cursor-pointer select-none"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onClick={handleClick}
			style={{ width: "80px" }}
		>
			<div
				className={`p-2 rounded-lg transition-all duration-200 mb-1
          ${isHovered ? "bg-white/20" : "bg-transparent"}`}
			>
				<Image
					src={icon}
					alt={label}
					width={48}
					height={48}
					className="pointer-events-none"
				/>
			</div>
			<span
				className={`text-xs text-center px-1 py-0.5 rounded max-w-[80px] truncate
          ${isHovered ? "bg-black/40 backdrop-blur-sm" : ""}
          text-white font-medium`}
			>
				{label}
			</span>
		</div>
	);
}
