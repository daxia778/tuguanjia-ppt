package segment

import (
	"fmt"
	"image"
	"image/color"
	"image/draw"
	"image/png"
	"math"
	"os"
	"sort"

	_ "image/jpeg"
)

// Rect defines a bounding box
type Rect struct {
	X, Y, W, H int
}

// Region represents a segmented color region
type Region struct {
	Name       string
	Color      color.RGBA
	Mask       []byte // 0 or 255
	PixelCount int
	Bounds     Rect
}

// Layer is an extracted image element with position info
type Layer struct {
	Name   string
	Image  image.Image // Cropped image (just the element)
	Bounds Rect        // Position on original canvas
}

func (r *Region) HexColor() string {
	return fmt.Sprintf("#%02x%02x%02x", r.Color.R, r.Color.G, r.Color.B)
}

func colorDistance(a, b color.RGBA) float64 {
	dr := float64(a.R) - float64(b.R)
	dg := float64(a.G) - float64(b.G)
	db := float64(a.B) - float64(b.B)
	return math.Sqrt(dr*dr + dg*dg + db*db)
}

func loadImage(path string) (image.Image, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	img, _, err := image.Decode(f)
	return img, err
}

// SmartSegment performs flood-fill segmentation with color merging
func SmartSegment(colormapPath string, tolerance, minPixels int, mergeThreshold float64) ([]Region, int, int, error) {
	img, err := loadImage(colormapPath)
	if err != nil {
		return nil, 0, 0, fmt.Errorf("加载色块图失败: %w", err)
	}

	bounds := img.Bounds()
	w, h := bounds.Dx(), bounds.Dy()
	visited := make([]byte, w*h)
	tol := uint8(tolerance)

	// Get pixel RGBA fast
	rgba := image.NewRGBA(image.Rect(0, 0, w, h))
	draw.Draw(rgba, rgba.Bounds(), img, bounds.Min, draw.Src)
	pix := rgba.Pix

	getPixel := func(idx int) (uint8, uint8, uint8) {
		pi := idx * 4
		return pix[pi], pix[pi+1], pix[pi+2]
	}

	var rawRegions []Region

	// Phase 1: Flood fill
	for y := 0; y < h; y++ {
		for x := 0; x < w; x++ {
			idx := y*w + x
			if visited[idx] != 0 {
				continue
			}

			seedR, seedG, seedB := getPixel(idx)
			mask := make([]byte, w*h)
			queue := []int{idx}
			visited[idx] = 1
			mask[idx] = 255
			count := 0
			var sumR, sumG, sumB int64
			minX, minY, maxX, maxY := x, y, x, y

			for len(queue) > 0 {
				ci := queue[len(queue)-1]
				queue = queue[:len(queue)-1]
				count++
				pr, pg, pb := getPixel(ci)
				sumR += int64(pr)
				sumG += int64(pg)
				sumB += int64(pb)

				cx := ci % w
				cy := ci / w
				if cx < minX {
					minX = cx
				}
				if cx > maxX {
					maxX = cx
				}
				if cy < minY {
					minY = cy
				}
				if cy > maxY {
					maxY = cy
				}

				neighbors := [4]int{ci - 1, ci + 1, ci - w, ci + w}
				valid := [4]bool{cx > 0, cx < w-1, cy > 0, cy < h-1}

				for ni := 0; ni < 4; ni++ {
					if !valid[ni] {
						continue
					}
					n := neighbors[ni]
					if visited[n] != 0 {
						continue
					}
					nr, ng, nb := getPixel(n)
					if absDiff(nr, seedR) <= tol && absDiff(ng, seedG) <= tol && absDiff(nb, seedB) <= tol {
						visited[n] = 1
						mask[n] = 255
						queue = append(queue, n)
					}
				}
			}

			if count >= minPixels {
				rawRegions = append(rawRegions, Region{
					Color: color.RGBA{
						R: uint8(sumR / int64(count)),
						G: uint8(sumG / int64(count)),
						B: uint8(sumB / int64(count)),
						A: 255,
					},
					Mask:       mask,
					PixelCount: count,
					Bounds:     Rect{X: minX, Y: minY, W: maxX - minX + 1, H: maxY - minY + 1},
				})
			}
		}
	}

	// Phase 2: Sort by size (largest first) and merge similar colors
	sort.Slice(rawRegions, func(i, j int) bool {
		return rawRegions[i].PixelCount > rawRegions[j].PixelCount
	})

	used := make([]bool, len(rawRegions))
	var merged []Region

	for i := range rawRegions {
		if used[i] {
			continue
		}
		base := rawRegions[i]
		combinedMask := make([]byte, len(base.Mask))
		copy(combinedMask, base.Mask)
		totalPx := base.PixelCount
		minX, minY := base.Bounds.X, base.Bounds.Y
		maxX := base.Bounds.X + base.Bounds.W - 1
		maxY := base.Bounds.Y + base.Bounds.H - 1

		for j := i + 1; j < len(rawRegions); j++ {
			if used[j] {
				continue
			}
			if colorDistance(base.Color, rawRegions[j].Color) < mergeThreshold {
				for k, v := range rawRegions[j].Mask {
					if v == 255 {
						combinedMask[k] = 255
					}
				}
				totalPx += rawRegions[j].PixelCount
				b := rawRegions[j].Bounds
				if b.X < minX {
					minX = b.X
				}
				if b.Y < minY {
					minY = b.Y
				}
				if b.X+b.W-1 > maxX {
					maxX = b.X + b.W - 1
				}
				if b.Y+b.H-1 > maxY {
					maxY = b.Y + b.H - 1
				}
				used[j] = true
			}
		}
		used[i] = true

		merged = append(merged, Region{
			Color:      base.Color,
			Mask:       combinedMask,
			PixelCount: totalPx,
			Bounds:     Rect{X: minX, Y: minY, W: maxX - minX + 1, H: maxY - minY + 1},
		})
	}

	// Phase 3: Name regions
	for i := range merged {
		r := &merged[i]
		c := r.Color
		brightness := (int(c.R) + int(c.G) + int(c.B)) / 3

		// Find centroid
		var cx, cy, cnt int
		for y := 0; y < h; y++ {
			for x := 0; x < w; x++ {
				if r.Mask[y*w+x] == 255 {
					cx += x
					cy += y
					cnt++
				}
			}
		}
		if cnt > 0 {
			cx /= cnt
			cy /= cnt
		}

		switch {
		case c.R > 180 && c.G < 80 && c.B < 80:
			r.Name = "红色元素"
		case c.R < 50 && c.G < 80 && c.B > 120:
			r.Name = "蓝色元素"
		case c.R < 80 && c.G > 100 && c.B < 100:
			r.Name = "绿色元素"
		case c.R > 200 && c.G > 200 && c.B < 100:
			r.Name = "黄色元素"
		case brightness > 230:
			if cy < h/3 {
				r.Name = "高亮上部"
			} else {
				r.Name = "高亮元素"
			}
		case c.B > 150 && c.R < 180 && c.G > 150:
			r.Name = "天蓝元素"
		default:
			r.Name = fmt.Sprintf("元素_%d", i+1)
		}
	}

	return merged, w, h, nil
}

// ExtractLayers extracts cropped layer images from the original
func ExtractLayers(originalPath string, regions []Region, cmWidth, cmHeight int) ([]Layer, error) {
	origImg, err := loadImage(originalPath)
	if err != nil {
		return nil, fmt.Errorf("加载原图失败: %w", err)
	}

	origBounds := origImg.Bounds()
	origW, origH := origBounds.Dx(), origBounds.Dy()

	// Convert original to RGBA
	var srcRGBA *image.RGBA
	if cmWidth != origW || cmHeight != origH {
		// Resize original to match colormap
		srcRGBA = resizeRGBA(origImg, cmWidth, cmHeight)
	} else {
		srcRGBA = image.NewRGBA(image.Rect(0, 0, origW, origH))
		draw.Draw(srcRGBA, srcRGBA.Bounds(), origImg, origBounds.Min, draw.Src)
	}

	var layers []Layer
	for _, region := range regions {
		b := region.Bounds
		// Create cropped transparent image
		cropped := image.NewRGBA(image.Rect(0, 0, b.W, b.H))

		for y := b.Y; y < b.Y+b.H; y++ {
			for x := b.X; x < b.X+b.W; x++ {
				idx := y*cmWidth + x
				if region.Mask[idx] == 255 {
					srcIdx := (y*cmWidth + x) * 4
					dstIdx := ((y-b.Y)*b.W + (x - b.X)) * 4
					cropped.Pix[dstIdx] = srcRGBA.Pix[srcIdx]
					cropped.Pix[dstIdx+1] = srcRGBA.Pix[srcIdx+1]
					cropped.Pix[dstIdx+2] = srcRGBA.Pix[srcIdx+2]
					cropped.Pix[dstIdx+3] = 255
				}
			}
		}

		layers = append(layers, Layer{
			Name:   region.Name,
			Image:  cropped,
			Bounds: b,
		})
	}

	return layers, nil
}

// SaveLayerPNG saves a layer to a PNG file
func SaveLayerPNG(layer Layer, path string) error {
	f, err := os.Create(path)
	if err != nil {
		return err
	}
	defer f.Close()
	return png.Encode(f, layer.Image)
}

func absDiff(a, b uint8) uint8 {
	if a > b {
		return a - b
	}
	return b - a
}

// Simple nearest-neighbor resize
func resizeRGBA(src image.Image, dstW, dstH int) *image.RGBA {
	srcBounds := src.Bounds()
	srcW := srcBounds.Dx()
	srcH := srcBounds.Dy()
	dst := image.NewRGBA(image.Rect(0, 0, dstW, dstH))

	for y := 0; y < dstH; y++ {
		srcY := y * srcH / dstH
		for x := 0; x < dstW; x++ {
			srcX := x * srcW / dstW
			r, g, b, a := src.At(srcBounds.Min.X+srcX, srcBounds.Min.Y+srcY).RGBA()
			idx := (y*dstW + x) * 4
			dst.Pix[idx] = uint8(r >> 8)
			dst.Pix[idx+1] = uint8(g >> 8)
			dst.Pix[idx+2] = uint8(b >> 8)
			dst.Pix[idx+3] = uint8(a >> 8)
		}
	}
	return dst
}
