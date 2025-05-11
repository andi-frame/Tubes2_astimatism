package utils

import (
	"encoding/json"
	"fmt"
)

// helper to marshal to JSON
func ToJSON(data any) []byte {
	jsonData, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		fmt.Println("JSON Marshal Error:", err)
		return []byte("[]")
	}
	return jsonData
}
