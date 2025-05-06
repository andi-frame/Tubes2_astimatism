package models

type ElementType string

const (
	Starting ElementType = "Starting"
	Tier1    ElementType = "Tier1"
	Tier2    ElementType = "Tier2"
	Tier3    ElementType = "Tier3"
	Tier4    ElementType = "Tier4"
	Tier5    ElementType = "Tier5"
	Tier6    ElementType = "Tier6"
	Tier7    ElementType = "Tier7"
	Tier8    ElementType = "Tier8"
	Tier9    ElementType = "Tier9"
	Tier10   ElementType = "Tier10"
	Tier11   ElementType = "Tier11"
	Tier12   ElementType = "Tier12"
	Tier13   ElementType = "Tier13"
	Tier14   ElementType = "Tier14"
	Tier15   ElementType = "Tier15"
)

// TODO: this will be implemented to each element resulted, for its metadata
type RecipeType struct {
	Element     string
	ImgUrl1     string
	ImgUrl2     string
	Ingredient1 string
	Ingredient2 string
	Type        ElementType
}

// TODO: implement to graph for tree
type RecipeEdgeType struct {
	Element     string
	Ingredient1 string
	Ingredient2 string
}
