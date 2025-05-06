package utils

import "encoding/json"

// helper to marshal to JSON
func ToJSON(data interface{}) []byte {
	b, _ := json.MarshalIndent(data, "", "  ")
	return b
}
