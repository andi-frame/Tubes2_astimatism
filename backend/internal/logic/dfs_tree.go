package logic

import "github.com/andi-frame/Tubes2_astimatism/backend/internal/models"

func BuildDFSTree(targetId int, recipeGraph map[int][]models.PairElement, metaMap map[int]models.ElementMeta) *models.DFSNode {
	pairs, exists := recipeGraph[targetId]
	if !exists || len(pairs) == 0 {
		return &models.DFSNode{
			ElementId:   targetId,
			RecipeIndex: -1,
			RecipeCount: 0,
			NodeCount:   1,
		}
	}

	tierTarget := metaMap[targetId].Tier

	for i, pair := range pairs {
		tier1 := metaMap[pair.Element1].Tier
		tier2 := metaMap[pair.Element2].Tier

		if tier1 < tierTarget && tier2 < tierTarget {
			left := BuildDFSTree(pair.Element1, recipeGraph, metaMap)
			right := BuildDFSTree(pair.Element2, recipeGraph, metaMap)

			return &models.DFSNode{
				ElementId:   targetId,
				RecipeIndex: i,
				RecipeCount: len(pairs),
				LeftChild:   left,
				RightChild:  right,
				NodeCount:   1 + left.NodeCount + right.NodeCount,
			}
		}
	}

	return &models.DFSNode{
		ElementId:   targetId,
		RecipeIndex: -1,
		RecipeCount: len(pairs),
		NodeCount:   1,
	}
}


func BuildLimitedDFSTree(targetId int, recipeGraph map[int][]models.PairElement, metaMap map[int]models.ElementMeta, limit int) []*models.DFSNode {
	pairs, exists := recipeGraph[targetId]
	if !exists || len(pairs) == 0 {
		return []*models.DFSNode{
			{
				ElementId:   targetId,
				RecipeIndex: -1,
				RecipeCount: 0,
				NodeCount:   1,
			},
		}
	}

	var trees []*models.DFSNode
	tierTarget := metaMap[targetId].Tier

	for i, pair := range pairs {
		if len(trees) >= limit {
			break
		}

		tier1 := metaMap[pair.Element1].Tier
		tier2 := metaMap[pair.Element2].Tier

		if tier1 < tierTarget && tier2 < tierTarget {
			left := BuildDFSTree(pair.Element1, recipeGraph, metaMap)
			right := BuildDFSTree(pair.Element2, recipeGraph, metaMap)

			node := &models.DFSNode{
				ElementId:   targetId,
				RecipeIndex: i,
				RecipeCount: len(pairs),
				LeftChild:   left,
				RightChild:  right,
				NodeCount:   1 + left.NodeCount + right.NodeCount,
			}
			trees = append(trees, node)
		}
	}

	if len(trees) == 0 {
		return []*models.DFSNode{
			{
				ElementId:   targetId,
				RecipeIndex: -1,
				RecipeCount: len(pairs),
				NodeCount:   1,
			},
		}
	}

	return trees
}
