package logic

import (
	"time"
	"github.com/andi-frame/Tubes2_astimatism/backend/internal/models"
)

func BuildLimitedDFSTree(
	targetId int,
	recipeGraph map[int][]models.PairElement,
	metaMap map[int]models.ElementMeta,
	limit int,
) models.ResultType {
	start := time.Now()

	var accessed uint64 = 0
	var tree *models.TreeNode
	done := make(chan *models.TreeNode, 1)

	go func() {
		tree = buildLimitedDFSTreeHelper(targetId, recipeGraph, metaMap, limit, nil, &accessed)
		done <- tree
	}()
	<-done

	duration := time.Since(start)

	return models.ResultType{
		Tree:          tree,
		AccessedNodes: accessed,
		Time:          uint64(duration.Nanoseconds()),
	}
}

func buildLimitedDFSTreeHelper(
	targetId int,
	recipeGraph map[int][]models.PairElement,
	metaMap map[int]models.ElementMeta,
	remainingLimit int,
	parent *models.TreeNode,
	accessed *uint64,
) *models.TreeNode {
	*accessed++

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
		if remainingLimit <= 0 {
			break
		}

		tier1 := metaMap[pair.Element1].Tier
		tier2 := metaMap[pair.Element2].Tier
		if tier1 >= tierTarget || tier2 >= tierTarget {
			continue
		}

		left := buildLimitedDFSTreeHelper(pair.Element1, recipeGraph, metaMap, remainingLimit, node, accessed)
		remaining := (remainingLimit + left.PossibleRecipes - 1) / left.PossibleRecipes
		right := buildLimitedDFSTreeHelper(pair.Element2, recipeGraph, metaMap, remaining, node, accessed)

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
