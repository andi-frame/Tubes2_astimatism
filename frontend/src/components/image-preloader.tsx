import { useEffect, useState } from "react";
import { useMetaMapStore } from "@/lib/store/map_store";
import * as d3 from "d3";

const svgPatternId = "element-patterns";

// bypass Wikia url
const transformWikiaUrl = (url: string) => {
	if (!url) return "";

	try {
		if (url.includes("wikia.nocookie.net")) {
			const baseUrlMatch = url.match(
				/(.*\/images\/[^\/]+\/[^\/]+\/[^\/]+)/
			);
			if (baseUrlMatch && baseUrlMatch[1]) {
				return baseUrlMatch[1];
			}
		}
	} catch (e) {
		console.error("Error transforming URL:", e);
	}

	return url;
};

export const useImagePreloader = () => {
	const [loaded, setLoaded] = useState(false);
	const [totalImages, setTotalImages] = useState(0);
	const [loadedImages, setLoadedImages] = useState(0);
	const metaMap = useMetaMapStore((state) => state.metaMap);

	const createFallbackPattern = (
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		defs: d3.Selection<any, unknown, null, undefined>,
		elementId: string | number
	) => {
		// Create colored fallback with element name
		const pattern = defs
			.append("pattern")
			.attr("id", `element-pattern-${elementId}`)
			.attr("width", 1)
			.attr("height", 1)
			.attr("patternUnits", "objectBoundingBox");

		// Generate a consistent color based on the element ID
		const hue = (parseInt(elementId.toString()) * 137.5) % 360;
		const color = `hsl(${hue}, 70%, 50%)`;

		// Add a colored rectangle with element text as fallback
		pattern
			.append("rect")
			.attr("width", 28)
			.attr("height", 28)
			.attr("fill", color);

		// Use first character or number for the icon
		const displayText = elementId.toString().substring(0, 2);

		pattern
			.append("text")
			.attr("x", 14)
			.attr("y", 16)
			.attr("text-anchor", "middle")
			.attr("alignment-baseline", "middle")
			.attr("fill", "white")
			.attr("font-size", "12px")
			.attr("font-weight", "bold")
			.text(displayText);
	};

	useEffect(() => {
		if (!metaMap) {
			return;
		}

		let patternSvg = document.getElementById(
			svgPatternId
		) as SVGSVGElement | null;

		if (!patternSvg) {
			patternSvg = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"svg"
			);
			patternSvg.id = svgPatternId;
			patternSvg.style.position = "absolute";
			patternSvg.style.width = "0";
			patternSvg.style.height = "0";
			patternSvg.style.overflow = "hidden";
			document.body.appendChild(patternSvg);
		}

		const defs = d3.select(patternSvg).select("defs").empty()
			? d3.select(patternSvg).append("defs")
			: d3.select(patternSvg).select("defs");

		const imageUrls = Object.entries(metaMap.IdImgMap);
		setTotalImages(imageUrls.length);

		if (imageUrls.length === 0) {
			setLoaded(true);
			return;
		}

		let completed = 0;

		imageUrls.forEach(([elementId, originalUrl]) => {
			if (!d3.select(`#element-pattern-${elementId}`).empty()) {
				completed++;
				setLoadedImages(completed);
				if (completed === imageUrls.length) {
					setLoaded(true);
				}
				return;
			}

			if (!originalUrl) {
				console.warn(`Missing image URL for element ID: ${elementId}`);

				// Create fallback immediately without trying to load
				createFallbackPattern(defs, elementId);

				completed++;
				setLoadedImages(completed);
				if (completed === imageUrls.length) {
					setLoaded(true);
				}
				return;
			}

			const transformedUrl = transformWikiaUrl(originalUrl);

			const img = new Image();

			img.onload = () => {
				const pattern = defs
					.append("pattern")
					.attr("id", `element-pattern-${elementId}`)
					.attr("width", 1)
					.attr("height", 1)
					.attr("patternUnits", "objectBoundingBox");

				pattern
					.append("image")
					.attr("href", transformedUrl)
					.attr("width", 28)
					.attr("height", 28)
					.attr("preserveAspectRatio", "xMidYMid slice");

				completed++;
				setLoadedImages(completed);

				if (completed === imageUrls.length) {
					setLoaded(true);
				}
			};

			img.onerror = () => {
				console.error(
					`Failed to load image (transformed): ${transformedUrl}`
				);

				if (elementId && typeof elementId === "string") {
					const pattern = defs
						.append("pattern")
						.attr("id", `element-pattern-${elementId}`)
						.attr("width", 1)
						.attr("height", 1)
						.attr("patternUnits", "objectBoundingBox");

					const hue = (parseInt(elementId) * 137.5) % 360;
					const color = `hsl(${hue}, 70%, 50%)`;

					pattern
						.append("rect")
						.attr("width", 28)
						.attr("height", 28)
						.attr("fill", color);

					const displayText = elementId.toString().substring(0, 2);

					pattern
						.append("text")
						.attr("x", 14)
						.attr("y", 16)
						.attr("text-anchor", "middle")
						.attr("alignment-baseline", "middle")
						.attr("fill", "white")
						.attr("font-size", "12px")
						.attr("font-weight", "bold")
						.text(displayText);
				}

				completed++;
				setLoadedImages(completed);

				if (completed === imageUrls.length) {
					setLoaded(true);
				}
			};

			img.src = transformedUrl;
		});

		return () => {};
	}, [metaMap]);

	return { loaded, progress: totalImages ? loadedImages / totalImages : 1 };
};
