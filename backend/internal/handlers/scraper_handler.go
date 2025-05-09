package handlers

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/andi-frame/Tubes2_astimatism/backend/internal/models"
	"github.com/andi-frame/Tubes2_astimatism/backend/internal/utils"
	"github.com/gin-gonic/gin"
	"github.com/gocolly/colly"
)

func getTier(index int) int {
	switch index {
	case 1:
		return 0
	case 2:
		// Skip (Ruins/Archeologist)
		return -1
	case 3:
		return 1
	case 4:
		return 2
	case 5:
		return 3
	case 6:
		return 4
	case 7:
		return 5
	case 8:
		return 6
	case 9:
		return 7
	case 10:
		return 8
	case 11:
		return 9
	case 12:
		return 10
	case 13:
		return 11
	case 14:
		return 12
	case 15:
		return 13
	case 16:
		return 14
	case 17:
		return 15
	default:
		return -1
	}
}

func ScrapeHandler(ctx *gin.Context) {
	url := "https://little-alchemy.fandom.com/wiki/Elements_(Little_Alchemy_2)"
	var recipes []models.RecipeType
	mapTier := make(map[string]int)

	c := colly.NewCollector(colly.AllowedDomains("little-alchemy.fandom.com"))
	tableIndex := 0
	elementCounter := 0
	recipeCounter := 0

	// each table (starting and tiers)
	c.OnHTML("table.list-table", func(table *colly.HTMLElement) {
		tableIndex++
		tier := getTier(tableIndex)
		if tier < 0 || tier > 17 {
			return
		}

		// // ? testing
		// if elementCounter >= 10 {
		// 	return
		// }

		// each element generated
		table.ForEach("tbody tr", func(_ int, h *colly.HTMLElement) {
			element := strings.TrimSpace(h.ChildText("td:first-of-type a"))
			if element == "" || element == "Time" || element == "Ruins" || element == "Archeologist" {
				return
			}

			elementCounter++
			mapTier[element] = tier
			fmt.Printf("\nElement[%v]: %-10s | %v\n", elementCounter, element, tier)

			if element == "Earth" {
				r := models.RecipeType{
					ElementId: elementCounter,
					Element:   element,
					Tier:      tier,
				}
				recipes = append(recipes, r)
				return
			}

			// each recipe to the element generated
			h.ForEach("td:nth-of-type(2) li", func(_ int, li *colly.HTMLElement) {
				recipeCounter++
				aTags := li.DOM.Find("a")

				if aTags.Length() < 2 {
					return
				}

				imgUrl1, _ := aTags.Eq(0).Find("img").Attr("data-src")
				imgUrl2, _ := aTags.Eq(2).Find("img").Attr("data-src")
				ingredient1 := strings.TrimSpace(aTags.Eq(1).Text())
				ingredient2 := strings.TrimSpace(aTags.Eq(3).Text())

				if ingredient1 == "Time" || ingredient2 == "Time" || ingredient1 == "Ruins" || ingredient2 == "Ruins" || ingredient1 == "Archeologist" || ingredient2 == "Archeologist" {
					return
				}

				r := models.RecipeType{
					ElementId:   elementCounter,
					Element:     element,
					ImgUrl1:     imgUrl1,
					ImgUrl2:     imgUrl2,
					Ingredient1: ingredient1,
					Ingredient2: ingredient2,
					Tier:        tier,
				}
				recipes = append(recipes, r)

				// Testing
				fmt.Printf("Recipe[%v]: %s + %s\n", recipeCounter, r.Ingredient1, r.Ingredient2)
				fmt.Printf("ImgUrl1: %s\n", r.ImgUrl1)
				fmt.Printf("ImgUrl2: %s\n", r.ImgUrl2)

			})
		})
	})

	c.OnRequest(func(r *colly.Request) {
		fmt.Print("Visiting ", r.URL)
	})

	c.OnError(func(r *colly.Response, e error) {
		fmt.Println("Error:", e.Error())
	})

	err := c.Visit(url)
	if err != nil {
		fmt.Print(err.Error())
	}

	// Filter tier
	filteredRecipes := make([]models.RecipeType, 0, len(recipes))
	for _, recipe := range recipes {
		if recipe.Ingredient1 == "" && recipe.Ingredient2 == "" {
			filteredRecipes = append(filteredRecipes, recipe)
			continue
		}

		tier1, ok1 := mapTier[recipe.Ingredient1]
		tier2, ok2 := mapTier[recipe.Ingredient2]

		if !ok1 || !ok2 {
			continue
		}
		if tier1 >= recipe.Tier || tier2 >= recipe.Tier {
			continue
		}
		filteredRecipes = append(filteredRecipes, recipe)
	}

	// Save to JSON file
	if err := os.MkdirAll("data", 0755); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create data directory"})
		return
	}

	filePath := "data/recipes.json"
	if err := os.WriteFile(filePath, utils.ToJSON(filteredRecipes), 0644); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save recipes"})
		return
	}

	// Set cookie for 1 day
	ctx.SetCookie("scraped", "true", 86400, "/", "localhost", false, true)

	// Return recipes data
	ctx.JSON(http.StatusOK, gin.H{"data": recipes})
}
