package models

// Top-Down Version: (unfinished)
// type TreeNode struct {
// 	Parent      *TreeNode   `json:"-"`
// 	Element     string      `json:"element"`
// 	Children    []*TreeNode `json:"children,omitempty"`
// 	Clear       bool        `json:"-"`
// 	IsGroupNode bool        `json:"-"`
// }

type TreeNode struct {
	Elements []*RecipeNode `json:"elements"`
	Children []*TreeNode   `json:"children"`
}

type RecipeNode struct {
	Element     int         `json:"element"`
	Ingredient1 *RecipeNode `json:"ingredient1"`
	Ingredient2 *RecipeNode `json:"ingredient2"`
}