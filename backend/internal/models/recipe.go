package models

// TODO: this will be implemented to each element resulted, for its metadata
type RecipeType struct {
	ElementId   int
	Element     string
	ImgUrl1     string
	ImgUrl2     string
	Ingredient1 string
	Ingredient2 string
	Tier        int
}

// TODO: implement to graph for tree
type RecipeEdgeType struct {
	Element     string
	Ingredient1 string
	Ingredient2 string
}

type PairElement struct {
	Element1 string
	Element2 string
}
