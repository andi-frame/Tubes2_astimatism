package handlers


func DFSTree(ctx *gin.Context) {
	hasScraped, err := ctx.Cookie("scraped")
	if err != nil || hasScraped != "true" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "You must scrape the data first"})
		return
	}

	fileBytes, err := os.ReadFile("data/recipes.json")
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read recipes file"})
		return
	}

	var recipes []models.RecipeType
	if err := json.Unmarshal(fileBytes, &recipes); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unmarshal recipes"})
		return
	}

	// Build graph dan metadata
	graph := logic.BuildGraphDFS(recipes)
	metaMap := logic.BuildElementMetaMap(recipes)

	// Get target
	targetIdStr := ctx.DefaultQuery("target", "")
	targetId, err := strconv.Atoi(targetIdStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Target must be integer (element id)"})
		return
	}

	tree := logic.BuildDFSTree(targetId, graph, metaMap)

	ctx.JSON(http.StatusOK, gin.H{
		"tree": tree,
	})
}


func LimitedDFSTree(ctx *gin.Context) {
	hasScraped, err := ctx.Cookie("scraped")
	if err != nil || hasScraped != "true" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "You must scrape the data first"})
		return
	}

	fileBytes, err := os.ReadFile("data/recipes.json")
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read recipes file"})
		return
	}

	var recipes []models.RecipeType
	if err := json.Unmarshal(fileBytes, &recipes); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unmarshal recipes"})
		return
	}

	// Build graph dan metadata
	graph := logic.BuildGraphDFS(recipes)
	metaMap := logic.BuildElementMetaMap(recipes)

	// Get target and limit
	targetIdStr := ctx.DefaultQuery("target", "")
	targetId, err := strconv.Atoi(targetIdStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Target must be integer (element id)"})
		return
	}

	limit, err := strconv.Atoi(ctx.DefaultQuery("limit", ""))
	if err != nil || limit <= 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Limit must be a positive integer"})
		return
	}

	trees := logic.BuildLimitedDFSTree(targetId, graph, metaMap, limit)

	ctx.JSON(http.StatusOK, gin.H{
		"trees": trees,
	})
}
