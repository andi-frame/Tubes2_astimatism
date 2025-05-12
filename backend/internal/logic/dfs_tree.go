package logic

import (
	"github.com/andi-frame/Tubes2_astimatism/backend/internal/models"
	"fmt"
	"time"
)

func BuildLimitedDFSTree(
	targetId int,
	recipeGraph map[int][]models.PairElement,
	metaMap map[int]models.ElementMeta,
	limit int,
) *models.TreeNode {
	start := time.Now()

	result := buildLimitedDFSTreeHelper(targetId, recipeGraph, metaMap, limit, nil)

	duration := time.Since(start)
	fmt.Printf("DFS tree construction took %s\n", duration)

	return result
}

func buildLimitedDFSTreeHelper(
	targetId int,
	recipeGraph map[int][]models.PairElement,
	metaMap map[int]models.ElementMeta,
	remainingLimit int,
	parent *models.TreeNode,
) *models.TreeNode {
	fmt.Printf("-> Enter DFS: Element %d | remainingLimit: %d\n", targetId, remainingLimit)

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
		if (remainingLimit <= 0) {
			break;
		}

		tier1 := metaMap[pair.Element1].Tier
		tier2 := metaMap[pair.Element2].Tier

		if tier1 >= tierTarget || tier2 >= tierTarget {
			continue
		}

		left := buildLimitedDFSTreeHelper(pair.Element1, recipeGraph, metaMap, remainingLimit, node)
		remaining := (remainingLimit + left.PossibleRecipes - 1) / left.PossibleRecipes
		right := buildLimitedDFSTreeHelper(pair.Element2, recipeGraph, metaMap, remaining, node)

		leftCount := left.PossibleRecipes
		rightCount := right.PossibleRecipes
		newComb := leftCount * rightCount

		remainingLimit -= newComb
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
