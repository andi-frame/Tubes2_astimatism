package models

type RecipeType struct {
	ElementId     int
	Element       string
	ImgUrl        string
	ImgUrl1       string
	ImgUrl2       string
	IngredientId1 int
	Ingredient1   string
	IngredientId2 int
	Ingredient2   string
	Tier          int
}

type PairElement struct {
	Element1 int
	Element2 int
}

type ResultType struct {
	Tree          *TreeNode `json:"Tree"`
	AccessedNodes uint64   `json:"AccessedNodes"`
	Time          uint64   `json:"Time"`
}