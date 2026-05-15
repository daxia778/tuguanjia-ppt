package api

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
)

// Client wraps chatgpt2api calls
type Client struct {
	BaseURL string
	APIKey  string
	Model   string
}

func NewClient(baseURL, apiKey, model string) *Client {
	return &Client{BaseURL: baseURL, APIKey: apiKey, Model: model}
}

type imageResponse struct {
	Data []struct {
		B64JSON string `json:"b64_json"`
		URL     string `json:"url"`
	} `json:"data"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error"`
}

// GenerateColormap sends the image to /v1/images/edits and saves the colormap
func (c *Client) GenerateColormap(imagePath string) (string, error) {
	imgFile, err := os.Open(imagePath)
	if err != nil {
		return "", fmt.Errorf("打开图片失败: %w", err)
	}
	defer imgFile.Close()

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	part, err := writer.CreateFormFile("image", filepath.Base(imagePath))
	if err != nil {
		return "", err
	}
	if _, err = io.Copy(part, imgFile); err != nil {
		return "", err
	}

	writer.WriteField("model", c.Model)
	writer.WriteField("n", "1")
	writer.WriteField("response_format", "b64_json")
	writer.WriteField("quality", "high")
	writer.WriteField("size", "1536x1536")
	writer.WriteField("prompt", `请将这张图像中的所有可视元素替换为纯色色块分割图（segmentation map）。

具体要求：
- 识别画面中每一个独立的视觉元素（人物、文字、装饰、物体、背景等）
- 将每个元素的区域填充为一个独特的纯色（flat solid color）
- 色块必须完全遵循原图中元素的轮廓和位置
- 使用硬边缘（hard edges），不要有渐变、阴影或抗锯齿
- 相邻元素的颜色差异必须足够大（色相间隔至少 60°）
- 背景区域也要用一个独立的纯色填充
- 输出图像尺寸和原图保持一致`)
	writer.Close()

	req, err := http.NewRequest("POST", c.BaseURL+"/v1/images/edits", body)
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+c.APIKey)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{Timeout: 0}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("API 请求失败: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	if resp.StatusCode != 200 {
		limit := len(respBody)
		if limit > 300 {
			limit = 300
		}
		return "", fmt.Errorf("API 返回 %d: %s", resp.StatusCode, string(respBody[:limit]))
	}

	var result imageResponse
	if err := json.Unmarshal(respBody, &result); err != nil {
		return "", fmt.Errorf("解析响应失败: %w", err)
	}

	if result.Error != nil {
		return "", fmt.Errorf("API 错误: %s", result.Error.Message)
	}

	if len(result.Data) == 0 {
		return "", fmt.Errorf("API 未返回图像数据")
	}

	b64Data := result.Data[0].B64JSON
	if b64Data == "" && result.Data[0].URL != "" {
		dlResp, err := http.Get(result.Data[0].URL)
		if err != nil {
			return "", fmt.Errorf("下载图片失败: %w", err)
		}
		defer dlResp.Body.Close()
		imgData, _ := io.ReadAll(dlResp.Body)
		outPath := filepath.Join(filepath.Dir(imagePath), "colormap.png")
		return outPath, os.WriteFile(outPath, imgData, 0644)
	}

	if b64Data == "" {
		return "", fmt.Errorf("响应中无图像数据")
	}

	imgData, err := base64.StdEncoding.DecodeString(b64Data)
	if err != nil {
		return "", fmt.Errorf("base64 解码失败: %w", err)
	}

	outPath := filepath.Join(filepath.Dir(imagePath), "colormap.png")
	return outPath, os.WriteFile(outPath, imgData, 0644)
}
