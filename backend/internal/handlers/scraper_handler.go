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
	mainURL := "https://little-alchemy.fandom.com/wiki/Elements_(Little_Alchemy_2)"
	mythsURL := "https://little-alchemy.fandom.com/wiki/Elements_(Myths_and_Monsters)"
	
	var recipes []models.RecipeType
	mapTier := make(map[string]int)
	mapId := make(map[string]int)
	mapImgUrl := make(map[string]string)
	mapMythMonster := make(map[string]bool)
	
	elementCounter := 0
	recipeCounter := 0

	// Scrape Myths and Monsters
	fmt.Println("Step 1: Scraping Myths and Monsters elements...")
	
	mythCollector := colly.NewCollector(colly.AllowedDomains("little-alchemy.fandom.com"))
	
	mythCollector.OnHTML("table.list-table", func(table *colly.HTMLElement) {
		// each element
		table.ForEach("tbody tr", func(_ int, h *colly.HTMLElement) {
			element := strings.TrimSpace(h.ChildText("td:first-of-type a"))
			if element == "" {
				return
			}

			mapMythMonster[element] = true
			// fmt.Printf("Found Myth/Monster element: %s\n", element)
		})
	})

	mythCollector.OnRequest(func(r *colly.Request) {
		fmt.Print("Visiting ", r.URL)
	})

	mythCollector.OnError(func(r *colly.Response, e error) {
		fmt.Println("Error:", e.Error())
	})

	if err := mythCollector.Visit(mythsURL); err != nil {
		fmt.Printf("Error scraping Myths and Monsters: %s\n", err.Error())
	}
		
	// Scrape main elements, ignore Myths and Monsters
	mainCollector := colly.NewCollector(colly.AllowedDomains("little-alchemy.fandom.com"))
	tableIndex := 0

	// each table (starting and tiers)
	mainCollector.OnHTML("table.list-table", func(table *colly.HTMLElement) {
		tableIndex++
		tier := getTier(tableIndex)
		if tier < 0 || tier > 17 {
			return
		}

		// each element generated
		table.ForEach("tbody tr", func(_ int, h *colly.HTMLElement) {
			element := strings.TrimSpace(h.ChildText("td:first-of-type a"))
			if element == "" || element == "Time" || element == "Ruins" || element == "Archeologist" {
				return
			}

			// Skip Myths and Monsters
			if mapMythMonster[element] {
				// fmt.Printf("Skipping Myth/Monster element: %s\n", element)
				return
			}

			elementImgUrl := ""
			if imgTag := h.DOM.Find("td:first-of-type span img"); imgTag.Length() > 0 {
				elementImgUrl, _ = imgTag.Attr("data-src")
			}

			elementCounter++
			mapTier[element] = tier
			mapId[element] = elementCounter
			mapImgUrl[element] = elementImgUrl
			// fmt.Printf("\nElement[%v]: %-10s | %v\n", elementCounter, element, tier)

			if element == "Earth" {
				r := models.RecipeType{
					ElementId: elementCounter,
					Element:   element,
					ImgUrl:    elementImgUrl,
					Tier:      tier,
				}
				recipes = append(recipes, r)
				return
			}

			// each recipe to the element generated
			h.ForEach("td:nth-of-type(2) li", func(_ int, li *colly.HTMLElement) {
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

				// Skip Myths and Monsters
				if mapMythMonster[ingredient1] || mapMythMonster[ingredient2] {
					fmt.Printf("Skipping recipe with Myth/Monster ingredients: %s + %s\n", ingredient1, ingredient2)
					return
				}

				recipeCounter++
				
				ingId1 := mapId[ingredient1]
				ingId2 := mapId[ingredient2]
				ing1 := ingredient1
				ing2 := ingredient2
				img1 := imgUrl1
				img2 := imgUrl2

				if ingId1 > ingId2 {
					ingId1, ingId2 = ingId2, ingId1
					ing1, ing2 = ing2, ing1
					img1, img2 = img2, img1
				}

				r := models.RecipeType{
					ElementId:     elementCounter,
					Element:       element,
					ImgUrl:        mapImgUrl[element],
					ImgUrl1:       img1,
					ImgUrl2:       img2,
					IngredientId1: ingId1,
					Ingredient1:   ing1,
					IngredientId2: ingId2,
					Ingredient2:   ing2,
					Tier:          tier,
				}
				recipes = append(recipes, r)

				// Testing
				// fmt.Printf("Recipe[%v]: %s + %s\n", recipeCounter, r.Ingredient1, r.Ingredient2)
				// fmt.Printf("ImgUrl: %s\n", r.ImgUrl)
				// fmt.Printf("ImgUrl1: %s\n", r.ImgUrl1)
				// fmt.Printf("ImgUrl2: %s\n", r.ImgUrl2)
			})
		})
	})

	mainCollector.OnRequest(func(r *colly.Request) {
		fmt.Print("Visiting ", r.URL)
	})

	mainCollector.OnError(func(r *colly.Response, e error) {
		fmt.Println("Error:", e.Error())
	})

	if err := mainCollector.Visit(mainURL); err != nil {
		fmt.Print("Error scraping main URL: ", err.Error())
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scrape main URL"})
		return
	}

	// Fix missing ingredient IDs
	fmt.Println("\nStep 3: Fixing missing ingredient IDs...")
	
	for i := range recipes {
		// Check IngredientId1
		if recipes[i].IngredientId1 == 0 && recipes[i].Ingredient1 != "" {
			if id, exists := mapId[recipes[i].Ingredient1]; exists {
				recipes[i].IngredientId1 = id
				fmt.Printf("Fixed missing ID for ingredient: %s = %d\n", recipes[i].Ingredient1, id)
			} else {
				elementCounter++
				mapId[recipes[i].Ingredient1] = elementCounter
				recipes[i].IngredientId1 = elementCounter
				fmt.Printf("Assigned new ID for ingredient: %s = %d\n", recipes[i].Ingredient1, elementCounter)
			}
		}
		
		// Check IngredientId2
		if recipes[i].IngredientId2 == 0 && recipes[i].Ingredient2 != "" {
			if id, exists := mapId[recipes[i].Ingredient2]; exists {
				recipes[i].IngredientId2 = id
				fmt.Printf("Fixed missing ID for ingredient: %s = %d\n", recipes[i].Ingredient2, id)
			} else {
				elementCounter++
				mapId[recipes[i].Ingredient2] = elementCounter
				recipes[i].IngredientId2 = elementCounter
				fmt.Printf("Assigned new ID for ingredient: %s = %d\n", recipes[i].Ingredient2, elementCounter)
			}
		}
	}

	// Save to JSON file	
	if err := os.MkdirAll("data", 0755); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create data directory"})
		return
	}

	filePath := "data/recipes.json"
	if err := os.WriteFile(filePath, utils.ToJSON(recipes), 0644); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save recipes"})
		return
	}

	// Set cookie for 1 day
	ctx.SetCookie("scraped", "true", 86400, "/", "localhost", false, true)

	// Return recipes data
	ctx.JSON(http.StatusOK, gin.H{
		"data": recipes,
		"stats": gin.H{
			"totalElements": elementCounter,
			"totalRecipes":  len(recipes),
			"mythsFiltered": len(mapMythMonster),
		},
	})
}