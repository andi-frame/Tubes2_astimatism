package models

// Top-Down Version:
type TreeNode struct {
	Parent          *TreeNode   `json:"-"`
	Element         int         `json:"element"`
	Visited         []int       `json:"-"`
	Children        []*PairNode `json:"children"`
	PossibleRecipes int         `json:"possible_recipes"`
}

type PairNode struct {
	Element1 *TreeNode `json:"element1"`
	Element2 *TreeNode `json:"element2"`
}

// Bottom-Up Version: (unfinished)
// type TreeNode struct {
// 	Elements []*RecipeNode `json:"elements"`
// 	Children []*TreeNode   `json:"children"`
// }

// type RecipeNode struct {
// 	Element     int         `json:"element"`
// 	Ingredient1 *RecipeNode `json:"ingredient1"`
// 	Ingredient2 *RecipeNode `json:"ingredient2"`
// }
