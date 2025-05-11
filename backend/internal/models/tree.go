package models

// Top-Down Version: (DFS)
type DFSNode struct {
	ElementId     int              
	RecipeIndex   int		// indeks resep yang digunakan (dari 0 sampai RecipeCount-1)
	RecipeCount   int       // total jumlah resep untuk elemen ini              
	LeftChild     *DFSNode         
	RightChild    *DFSNode         
}

type TreeNode struct {
	Elements []*RecipeNode `json:"elements"`
	Children []*TreeNode   `json:"children"`
}

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