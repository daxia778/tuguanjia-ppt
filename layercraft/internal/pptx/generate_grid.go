package pptx

import (
	"archive/zip"
	"fmt"
	"os"

	"layercraft/internal/grid"
)

// GenerateFromGrid creates a PPTX from grid-cut elements, arranged nicely on a slide
func GenerateFromGrid(outPath string, cells []grid.Cell, slideWidth, slideHeight int) error {
	f, err := os.Create(outPath)
	if err != nil {
		return err
	}
	defer f.Close()

	zw := zip.NewWriter(f)
	defer zw.Close()

	// Standard 16:9 slide
	slideW := int64(12192000) // 13.33 inches
	slideH := int64(6858000)  // 7.5 inches

	// Write media
	for i, cell := range cells {
		data, err := os.ReadFile(cell.File)
		if err != nil {
			return fmt.Errorf("读取元素 %d: %w", i+1, err)
		}
		w, _ := zw.Create(fmt.Sprintf("ppt/media/element_%d.png", i+1))
		w.Write(data)
	}

	// Calculate layout: scale cells to fit slide proportionally
	scaleX := float64(slideW) / float64(slideWidth)
	scaleY := float64(slideH) / float64(slideHeight)
	scale := scaleX
	if scaleY < scaleX {
		scale = scaleY
	}

	var shapeXML string
	for i, cell := range cells {
		x := int64(float64(cell.X) * scale)
		y := int64(float64(cell.Y) * scale)
		w := int64(float64(cell.W) * scale)
		h := int64(float64(cell.H) * scale)
		rId := fmt.Sprintf("rId%d", i+2)
		shapeXML += spTreePicXML(rId, fmt.Sprintf("元素_%d", i+1), x, y, w, h, i+2)
	}

	slideXML := slideHeader(slideW, slideH) + shapeXML + slideFooter()
	writeFile(zw, "ppt/slides/slide1.xml", slideXML)

	// Slide 1 rels
	slideRels := `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>`
	for i := range cells {
		slideRels += fmt.Sprintf(`
<Relationship Id="rId%d" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/element_%d.png"/>`, i+2, i+1)
	}
	slideRels += "\n</Relationships>"
	writeFile(zw, "ppt/slides/_rels/slide1.xml.rels", slideRels)

	// Boilerplate
	writeFile(zw, "ppt/presentation.xml", presentationXML(slideW, slideH))
	writeFile(zw, "ppt/_rels/presentation.xml.rels", presentationRelsXML())
	writeFile(zw, "ppt/theme/theme1.xml", minimalThemeXML())
	writeFile(zw, "ppt/slideLayouts/slideLayout1.xml", minimalSlideLayoutXML())
	writeFile(zw, "ppt/slideLayouts/_rels/slideLayout1.xml.rels", slideLayoutRelsXML())
	writeFile(zw, "ppt/slideMasters/slideMaster1.xml", minimalSlideMasterXML(slideW, slideH))
	writeFile(zw, "ppt/slideMasters/_rels/slideMaster1.xml.rels", slideMasterRelsXML())
	writeFile(zw, "[Content_Types].xml", contentTypesXML(0))
	writeFile(zw, "_rels/.rels", rootRelsXML())

	return nil
}
