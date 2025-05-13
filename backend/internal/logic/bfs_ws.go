package logic

import (
	"context"
	"encoding/json"
	"sync"
	"sync/atomic"
	"time"

	"github.com/andi-frame/Tubes2_astimatism/backend/internal/models"
	"github.com/coder/websocket"
)

func StreamLimitedBFSTree(ctx context.Context, conn *websocket.Conn, targetId int, elementsGraph map[int][]models.PairElement, tierMap map[int]int, limit uint64) {
	startTime := time.Now()
	var accessedNodes uint64 = 0

	root := treeNodePool.Get().(*models.TreeNode)
	*root = models.TreeNode{
		Element: targetId,
		Visited: &models.VisitedPath{Val: targetId, Prev: nil},
	}

	queue := []*models.TreeNode{root}
	var mu sync.Mutex

	for len(queue) > 0 && root.PossibleRecipes < limit {
		batchSize := min(len(queue), 10)
		batch := queue[:batchSize]
		queue = queue[batchSize:]

		var wg sync.WaitGroup
		newNodesChan := make(chan *models.TreeNode, 100)

		for _, curr := range batch {
			atomic.AddUint64(&accessedNodes, 1)
			if IsBaseElement(curr.Element) {
				continue
			}

			wg.Add(1)
			go func(currentNode *models.TreeNode) {
				defer wg.Done()

				var localNewNodes []*models.TreeNode

				recipes := elementsGraph[currentNode.Element]
				currTier := tierMap[currentNode.Element]

				for _, recipe := range recipes {
					if currTier <= tierMap[recipe.Element1] || currTier <= tierMap[recipe.Element2] {
						continue
					}

					if HasVisited(currentNode.Visited, recipe.Element1) ||
						HasVisited(currentNode.Visited, recipe.Element2) {
						continue
					}

					child1 := treeNodePool.Get().(*models.TreeNode)
					*child1 = models.TreeNode{
						Parent:  currentNode,
						Element: recipe.Element1,
						Visited: &models.VisitedPath{Val: recipe.Element1, Prev: currentNode.Visited},
					}
					if IsBaseElement(child1.Element) {
						child1.PossibleRecipes = 1
					}

					child2 := treeNodePool.Get().(*models.TreeNode)
					*child2 = models.TreeNode{
						Parent:  currentNode,
						Element: recipe.Element2,
						Visited: &models.VisitedPath{Val: recipe.Element2, Prev: currentNode.Visited},
					}
					if IsBaseElement(child2.Element) {
						child2.PossibleRecipes = 1
					}

					pairNode := pairNodePool.Get().(*models.PairNode)
					*pairNode = models.PairNode{
						Element1: child1,
						Element2: child2,
					}

					mu.Lock()
					originalLen := len(currentNode.Children)
					currentNode.Children = append(currentNode.Children, pairNode)
					mu.Unlock()

					if IsBaseElement(child1.Element) && IsBaseElement(child2.Element) {
						mu.Lock()
						success := calculatePossibleRecipes(currentNode, limit)
						if !success {
							currentNode.Children = currentNode.Children[:originalLen]
							calculatePossibleRecipes(currentNode, limit)
						}
						mu.Unlock()
					} else {
						if !IsBaseElement(child1.Element) {
							localNewNodes = append(localNewNodes, child1)
						}
						if !IsBaseElement(child2.Element) {
							localNewNodes = append(localNewNodes, child2)
						}
					}
				}

				for _, node := range localNewNodes {
					newNodesChan <- node
				}
			}(curr)
		}

		go func() {
			wg.Wait()
			close(newNodesChan)
		}()

		var newNodes []*models.TreeNode
		for node := range newNodesChan {
			newNodes = append(newNodes, node)
		}

		// Send partial result update
		elapsed := time.Since(startTime).Milliseconds()
		result := models.ResultType{
			Tree:          root,
			AccessedNodes: accessedNodes,
			Time:          uint64(elapsed),
		}
		payload, _ := json.Marshal(result)
		conn.Write(ctx, websocket.MessageText, payload)

		mu.Lock()
		queue = append(queue, newNodes...)
		mu.Unlock()
	}

	PruneTree(root)

	// Send final result
	elapsed := time.Since(startTime).Milliseconds()
	result := models.ResultType{
		Tree:          root,
		AccessedNodes: accessedNodes,
		Time:          uint64(elapsed),
	}
	payload, _ := json.Marshal(result)
	conn.Write(ctx, websocket.MessageText, payload)
}
