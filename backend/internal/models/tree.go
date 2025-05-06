package models

type TreeNode struct {
	Parent   *TreeNode   `json:"-"`
	Element  string      `json:"element"`
	Children []*TreeNode `json:"children,omitempty"`
}