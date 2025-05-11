package models

// Top-Down Version: (DFS)
type DFSNode struct {
	ElementId   int
	RecipeIndex int // indeks resep yang digunakan (dari 0 sampai RecipeCount-1)
	RecipeCount int // total jumlah resep untuk elemen ini
	LeftChild   *DFSNode
	RightChild  *DFSNode
	NodeCount   int
}

type TreeNode struct {
	Parent          *TreeNode   `json:"-"`
	Element         int         `json:"element"`
	Visited         []int       `json:"-"`
	Children        []*PairNode `json:"children,omitempty"`
	PossibleRecipes uint64      `json:"-"`
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

type RecipeNode struct {
	Element     int         `json:"element"`
	Ingredient1 *RecipeNode `json:"ingredient1"`
	Ingredient2 *RecipeNode `json:"ingredient2"`
}

type ElementMeta struct {
	Name   string
	ImgUrl string
	Tier   int
}

type TreeResult struct {
	Element  string
	ImgUrl   string
	Children []*PairResult
}

type PairResult struct {
	Element1 *TreeResult
	Element2 *TreeResult
}
