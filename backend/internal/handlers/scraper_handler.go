package handlers

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/andi-frame/Tubes2_astimatism/backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/gocolly/colly"
)

func getElementType(index int) models.ElementType {
	switch index {
	case 1:
		return models.Starting
	case 2:
		// Table[2] is special, we skip it (Ruins/Archeologist)
		return ""
	case 3:
		return models.Tier1
	case 4:
		return models.Tier2
	case 5:
		return models.Tier3
	case 6:
		return models.Tier4
	case 7:
		return models.Tier5
	case 8:
		return models.Tier6
	case 9:
		return models.Tier7
	case 10:
		return models.Tier8
	case 11:
		return models.Tier9
	case 12:
		return models.Tier10
	case 13:
		return models.Tier11
	case 14:
		return models.Tier12
	case 15:
		return models.Tier13
	case 16:
		return models.Tier14
	case 17:
		return models.Tier15
	default:
		return ""
	}
}

func ScrapeHandler(ctx *gin.Context) {
	url := "https://little-alchemy.fandom.com/wiki/Elements_(Little_Alchemy_2)"
	var recipes []models.RecipeType

	c := colly.NewCollector(colly.AllowedDomains("little-alchemy.fandom.com"))
	tableIndex := 0
	elementCounter := 0
	recipeCounter := 0

	// each table (starting and tiers)
	c.OnHTML("table.list-table", func(table *colly.HTMLElement) {
		tableIndex++
		elementType := getElementType(tableIndex)
		if elementType == "" {
			return
		}

		// each element generated
		table.ForEach("tbody tr", func(_ int, h *colly.HTMLElement) {
			element := strings.TrimSpace(h.ChildText("td:first-of-type a"))
			if element == "" || element == "Time" || element == "Ruins" || element == "Archeologist" {
				return
			}

			elementCounter++
			fmt.Printf("\nElement[%v]: %-10s | %s\n", elementCounter, element, elementType)

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
					Element:     element,
					ImgUrl1:     imgUrl1,
					ImgUrl2:     imgUrl2,
					Ingredient1: ingredient1,
					Ingredient2: ingredient2,
					Type:        elementType,
				}
				recipes = append(recipes, r)

				// Testing
				// fmt.Printf("Recipe[%v]: %s + %s\n", recipeCounter, r.Ingredient1, r.Ingredient2)
				// fmt.Printf("ImgUrl1: %s\n", r.ImgUrl1)
				// fmt.Printf("ImgUrl2: %s\n", r.ImgUrl2)

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

	ctx.JSON(http.StatusOK, gin.H{"data": recipes})
}
