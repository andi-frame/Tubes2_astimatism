package logic


import "github.com/andi-frame/Tubes2_astimatism/backend/internal/models"

// func BuildDFSTree(targetId int, recipeGraph map[int][]models.PairElement, metaMap map[int]models.ElementMeta) *models.DFSNode {
// 	pairs, exists := recipeGraph[targetId]
// 	if !exists || len(pairs) == 0 {
// 		return &models.DFSNode{
// 			ElementId:   targetId,
// 			RecipeIndex: -1,
// 			RecipeCount: 0,
// 			NodeCount:   1,
// 		}
// 	}

// 	tierTarget := metaMap[targetId].Tier

// 	for i, pair := range pairs {
// 		tier1 := metaMap[pair.Element1].Tier
// 		tier2 := metaMap[pair.Element2].Tier

// 		if tier1 < tierTarget && tier2 < tierTarget {
// 			left := BuildDFSTree(pair.Element1, recipeGraph, metaMap)
// 			right := BuildDFSTree(pair.Element2, recipeGraph, metaMap)

// 			return &models.DFSNode{
// 				ElementId:   targetId,
// 				RecipeIndex: i,
// 				RecipeCount: len(pairs),
// 				LeftChild:   left,
// 				RightChild:  right,
// 				NodeCount:   1 + left.NodeCount + right.NodeCount,
// 			}
// 		}
// 	}

// 	return &models.DFSNode{
// 		ElementId:   targetId,
// 		RecipeIndex: -1,
// 		RecipeCount: len(pairs),
// 		NodeCount:   1,
// 	}
// }


func BuildLimitedDFSTree(
	targetId int,
	recipeGraph map[int][]models.PairElement,
	metaMap map[int]models.ElementMeta,
	limit int,
) *models.TreeNode {
	return buildLimitedDFSTreeHelper(targetId, recipeGraph, metaMap, limit, nil)
}

func buildLimitedDFSTreeHelper(targetId int, recipeGraph map[int][]models.PairElement, 
	metaMap map[int]models.ElementMeta,remainingLimit int, parent *models.TreeNode) *models.TreeNode {
	node := &models.TreeNode{
		Element: targetId,
		Parent:  parent,
	}

	pairs, exists := recipeGraph[targetId]
	if !exists || len(pairs) == 0 || remainingLimit <= 0 {
		node.PossibleRecipes = 1
		return node
	}

	tierTarget := metaMap[targetId].Tier

	for _, pair := range pairs {
		if node.PossibleRecipes >= remainingLimit {
			break
		}

		tier1 := metaMap[pair.Element1].Tier
		tier2 := metaMap[pair.Element2].Tier

		if tier1 >= tierTarget || tier2 >= tierTarget {
			continue
		}

		left := buildLimitedDFSTreeHelper(pair.Element1, recipeGraph, metaMap, remainingLimit, node)
		right := buildLimitedDFSTreeHelper(pair.Element2, recipeGraph, metaMap, remainingLimit, node)

		count1 := left.PossibleRecipes
		if count1 == 0 {
			count1 = 1
		}
		count2 := right.PossibleRecipes
		if count2 == 0 {
			count2 = 1
		}
		newComb := count1 * count2

		if node.PossibleRecipes+newComb > remainingLimit {
			newComb = remainingLimit - node.PossibleRecipes
			if newComb <= 0 {
				break
			}
		}

		node.Children = append(node.Children, &models.PairNode{
			Element1: left,
			Element2: right,
		})
		node.PossibleRecipes += newComb
	}

	if len(node.Children) == 0 {
		node.PossibleRecipes = 1
	}

	return node
}
