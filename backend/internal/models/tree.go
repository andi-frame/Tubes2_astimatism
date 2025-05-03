package models

type TreeNode struct {
	Element   string     `json:"element"`
	Children  []*TreeNode `json:"children,omitempty"`
}