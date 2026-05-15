package grid

import (
	"fmt"
	"image"
	"image/color"
	"image/png"
	"os"
	"path/filepath"
)

// Cell represents a detected grid cell
type Cell struct {
	Index int
	File  string
	X, Y  int
	W, H  int
}

// CutGrid detects grid lines and cuts an image into cells
func CutGrid(imagePath, outputDir string, rows, cols int) ([]Cell, int, int, error) {
	f, err := os.Open(imagePath)
	if err != nil {
		return nil, 0, 0, err
	}
	defer f.Close()

	img, _, err := image.Decode(f)
	if err != nil {
		return nil, 0, 0, fmt.Errorf("decode: %w", err)
	}

	bounds := img.Bounds()
	imgW, imgH := bounds.Max.X, bounds.Max.Y

	// Find grid dividers by scanning for light separator lines
	xCuts := findCuts(img, imgW, imgH, true, cols-1)
	yCuts := findCuts(img, imgW, imgH, false, rows-1)

	// Build cell boundaries
	xEdges := append([]int{0}, xCuts...)
	xEdges = append(xEdges, imgW)
	yEdges := append([]int{0}, yCuts...)
	yEdges = append(yEdges, imgH)

	os.MkdirAll(outputDir, 0755)

	var cells []Cell
	idx := 0
	for r := 0; r < len(yEdges)-1; r++ {
		for c := 0; c < len(xEdges)-1; c++ {
			idx++
			x1, y1 := xEdges[c], yEdges[r]
			x2, y2 := xEdges[c+1], yEdges[r+1]

			// Trim 2px border on each side to remove grid lines
			x1 = min(x1+2, x2)
			y1 = min(y1+2, y2)
			x2 = max(x2-2, x1)
			y2 = max(y2-2, y1)

			cellImg := image.NewRGBA(image.Rect(0, 0, x2-x1, y2-y1))
			for py := y1; py < y2; py++ {
				for px := x1; px < x2; px++ {
					cellImg.Set(px-x1, py-y1, img.At(px, py))
				}
			}

			fname := fmt.Sprintf("element_%d.png", idx)
			outPath := filepath.Join(outputDir, fname)
			of, err := os.Create(outPath)
			if err != nil {
				return nil, 0, 0, err
			}
			png.Encode(of, cellImg)
			of.Close()

			cells = append(cells, Cell{
				Index: idx,
				File:  outPath,
				X:     x1, Y: y1,
				W: x2 - x1, H: y2 - y1,
			})
		}
	}

	return cells, imgW, imgH, nil
}

// findCuts scans for separator lines (brightest strips)
func findCuts(img image.Image, imgW, imgH int, vertical bool, count int) []int {
	length := imgW
	span := imgH
	if vertical {
		length = imgW
		span = imgH
	} else {
		length = imgH
		span = imgW
	}

	// Calculate brightness along each line
	brightness := make([]float64, length)
	for i := 0; i < length; i++ {
		var sum float64
		for j := 0; j < span; j++ {
			var r, g, b uint32
			if vertical {
				r, g, b, _ = img.At(i, j).RGBA()
			} else {
				r, g, b, _ = img.At(j, i).RGBA()
			}
			lum := float64(r+g+b) / 3.0 / 256.0
			sum += lum
		}
		brightness[i] = sum / float64(span)
	}

	// Find peaks (brightest strips = separators)
	cellSize := length / (count + 1)
	var cuts []int
	for k := 1; k <= count; k++ {
		searchCenter := k * cellSize
		searchStart := max(searchCenter-cellSize/4, 0)
		searchEnd := min(searchCenter+cellSize/4, length)

		bestPos := searchCenter
		bestVal := 0.0
		for i := searchStart; i < searchEnd; i++ {
			if brightness[i] > bestVal {
				bestVal = brightness[i]
				bestPos = i
			}
		}
		cuts = append(cuts, bestPos)
	}

	return cuts
}

func isLightColor(c color.Color) bool {
	r, g, b, _ := c.RGBA()
	lum := (float64(r) + float64(g) + float64(b)) / 3.0 / 256.0
	return lum > 200
}
