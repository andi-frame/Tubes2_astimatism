import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import p5Types from "p5";
import { fetchBFSSearch } from "@/lib/api/bfs_search";
import { useMetaMapStore } from "@/lib/store/map_store";
import { fetchDFSSearch } from "@/lib/api/dfs_search";

const Sketch = dynamic(() => import("react-p5").then((mod) => mod.default), {
	ssr: false,
});

const imageCache: { [key: string]: p5Types.Image } = {};


// Tree type
export interface TreeNode {
    element: number;
    children?: PairNode[];
}

export interface PairNode {
    element1: TreeNode;
    element2: TreeNode;
}

const emptyTree = {
    element: 0,   
}

// Tree settings
const nodeWidth = 60;
const nodeHeight = 40;
const outerPadding = 50;
const verticalSpacing = 100;
const horizontalSpacing = 50;

interface RecipeTreeProps {
    targetElement: string;
    limit: number;
    isMultiple: boolean;
    algorithm: string;
}

const RecipeTree: React.FC<RecipeTreeProps> = ({targetElement, limit = 1, isMultiple, algorithm }) => {
	const imagesLoaded = useRef<{ [key: string]: boolean }>({});
	const p5Instance = useRef<p5Types | null>(null);
    const [tree, setTree] = useState<TreeNode>(emptyTree);

    const metaMap = useMetaMapStore((state) => state.metaMap)

    useEffect(() => {
        const getTree = async () => {
            try{
                if (isMultiple && limit == 1){
                    console.log("Error: limit should be more than one for multiple")
                    return
                }

                if (algorithm == "bfs") {
                    const res = await fetchBFSSearch(metaMap?.NameIdMap[targetElement] || 0, limit)
                    setTree(res.data.Tree)
                } else {
                    const res = await fetchDFSSearch(metaMap?.NameIdMap[targetElement] || 0, limit)
                    setTree(res.data.Tree)
                }
            } catch (err) {
                console.error("Error fetching BFS search");
                console.error(err);
            }
        }

        getTree()
    }, [algorithm, isMultiple, limit, metaMap?.NameIdMap, targetElement])

	const getTreeDimension = (tree: TreeNode) => {
		const breadthByLevel: number[] = [];

		const countNodesAtLevel = (node: TreeNode, depth = 0) => {
			if (!node) return;

			if (breadthByLevel.length <= depth) {
				breadthByLevel[depth] = 0;
			}

			breadthByLevel[depth]++;

			if (node.children) {
				for (const child of node.children) {
					countNodesAtLevel(child.element1, depth + 1);
					countNodesAtLevel(child.element2, depth + 1);
				}
			}
		};

		countNodesAtLevel(tree);

		const maxBreadthCount = Math.max(...breadthByLevel);

		return {
			maxBreadth: maxBreadthCount,
			maxDepth: breadthByLevel.length - 1,
			breadthByLevel,
		};
	};

	const dimension = getTreeDimension(tree);
	const canvasWidth =
		nodeWidth * dimension.maxBreadth +
		(dimension.maxBreadth - 1) * horizontalSpacing +
		outerPadding * 2;
	const canvasHeight =
		nodeHeight * (dimension.maxDepth + 1) +
		verticalSpacing * dimension.maxDepth +
		outerPadding * 2;

	const setup = (p5: p5Types, canvasParentRef: Element) => {
		p5Instance.current = p5;
		p5.createCanvas(canvasWidth, canvasHeight).parent(canvasParentRef);
		p5.textAlign(p5.CENTER, p5.CENTER);
		p5.strokeWeight(2);
		p5.imageMode(p5.CENTER);
	};

	const draw = (p5: p5Types) => {
		p5.background(26, 56, 66);

		const drawNode = (p5: p5Types, node: TreeNode, x: number, y: number) => {
			p5.fill(255);
			p5.stroke(0);
			p5.rect(
				x - nodeWidth / 2,
				y - nodeHeight / 2,
				nodeWidth,
				nodeHeight,
				8
			);

			const iconSize = Math.floor(nodeHeight * 0.7);
			const iconY = y - iconSize / 4;

			// Draw Icon
            const iconUrl = metaMap?.IdImgMap[node.element];
			if (iconUrl) {
				if (!imageCache[iconUrl]) {
					if (!imagesLoaded.current[iconUrl]) {
						imagesLoaded.current[iconUrl] = true;
						imageCache[iconUrl] = p5.loadImage(
							iconUrl,
							() => {
								if (p5Instance.current)
									p5Instance.current.redraw();
							},
							() => {
								console.error(
									`Failed to load image: ${iconUrl}`
								);
							}
						);
					}
				} else {
					p5.image(
						imageCache[iconUrl],
						x - iconSize / 2,
						iconY - iconSize / 2,
						iconSize,
						iconSize
					);
				}
			} else {
				p5.fill(0);
				p5.noStroke();
				p5.textSize(16);
				p5.text(node.element || 0, x, iconY);
			}

			// Draw Name
            const iconName = metaMap?.IdNameMap[node.element]
			if (iconName) {
				p5.fill(0);
				p5.noStroke();
				p5.textSize(12);
				p5.text(iconName, x, y + nodeHeight / 2 - 10);
			} else {
				p5.fill(0);
				p5.noStroke();
				p5.textSize(12);
				p5.text(`#${node.element || 0}`, x, y + nodeHeight / 2 - 10);
			}
		};

		const nodeMap = new Map();

		const assignPositions = (node: TreeNode) => {
			if (!node) return;

			const nodesByLevel: TreeNode[][] = [];
			const collectNodesByLevel = (node: TreeNode, depth = 0) => {
				if (!node) return;

				if (!nodesByLevel[depth]) nodesByLevel[depth] = [];
				nodesByLevel[depth].push(node);

				if (node.children) {
					for (const child of node.children) {
						collectNodesByLevel(child.element1, depth + 1);
						collectNodesByLevel(child.element2, depth + 1);
					}
				}
			};

			collectNodesByLevel(tree);

			for (let level = 0; level < nodesByLevel.length; level++) {
				const nodes = nodesByLevel[level];
				const levelWidth =
					nodes.length * (nodeWidth + horizontalSpacing) -
					horizontalSpacing;
				const startX = (canvasWidth - levelWidth) / 2;

				nodes.forEach((node, index) => {
					const xPosition =
						startX + index * (nodeWidth + horizontalSpacing);
					nodeMap.set(node, {
						x: xPosition + nodeWidth / 2,
						y: outerPadding + level * verticalSpacing,
					});
				});
			}
		};

		assignPositions(tree);

		const drawTree = (node: TreeNode) => {
			if (!node) return;

			const pos = nodeMap.get(node);
			drawNode(p5, node, pos.x, pos.y);

			if (node.children) {
				for (const child of node.children) {
					const childPos1 = nodeMap.get(child.element1);
					const childPos2 = nodeMap.get(child.element2);
					const midPairPointX = (childPos1.x + childPos2.x) / 2;

					p5.stroke(0);
					p5.line(
						pos.x,
						pos.y + nodeHeight / 2,
						midPairPointX,
						pos.y + verticalSpacing * 0.75
					);

					p5.stroke(0);
					p5.line(
						midPairPointX,
						pos.y + verticalSpacing * 0.75,
						midPairPointX,
						childPos2.y
					);

					p5.stroke(0);
					p5.line(
						childPos1.x + nodeWidth / 2,
						childPos1.y,
						childPos2.x - nodeWidth / 2,
						childPos2.y
					);

					drawTree(child.element1);
					drawTree(child.element2);
				}
			}
		};

		drawTree(tree);
	};

	return (
		<div className="flex justify-center items-center w-full h-full">
			<Sketch setup={setup} draw={draw} />
		</div>
	);
};

export default RecipeTree;
