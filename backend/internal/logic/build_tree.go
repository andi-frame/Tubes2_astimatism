package logic

import "github.com/andi-frame/Tubes2_astimatism/backend/internal/models"

func GraphRecipes(recipes []models.RecipeType) map[string][][2]string {
	result := make(map[string][][2]string)
	for _, r := range recipes {
		result[r.Element] = append(result[r.Element], [2]string{r.Ingredient1, r.Ingredient2})
	}
	return result
}

func IsBaseElement(name string) bool {
	base := map[string]bool{
		"Air": true, "Water": true, "Earth": true, "Fire": true,
	}
	return base[name]
}

func BuildBFSTree(target string, recipesGraph map[string][][2]string) *models.TreeNode {
	visited := make(map[string]bool)
	root := &models.TreeNode{Element: target}
	queue := []*models.TreeNode{root}

	for len(queue) > 0 {
		curr := queue[0]
		queue = queue[1:]

		if visited[curr.Element] {
			continue
		}
		visited[curr.Element] = true

		recipes := recipesGraph[curr.Element]
		for _, pair := range recipes {
			ingredient1 := &models.TreeNode{Element: pair[0]}
			ingredient2 := &models.TreeNode{Element: pair[1]}
			curr.Children = append(curr.Children, ingredient1, ingredient2)
			queue = append(queue, ingredient1, ingredient2)
		}
	}

	return root
}

func BuildDFSTree(target string, recipesGraph map[string][][2]string, visited map[string]bool) *models.TreeNode {
	if visited[target] {
		return nil
	}
	visited[target] = true

	node := &models.TreeNode{Element: target}

	for _, pair := range recipesGraph[target] {
		left := BuildDFSTree(pair[0], recipesGraph, visited)
		right := BuildDFSTree(pair[1], recipesGraph, visited)

		if left != nil {
			node.Children = append(node.Children, left)
		}
		if right != nil {
			node.Children = append(node.Children, right)
		}
	}

	return node
}
