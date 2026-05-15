package pptx

import (
	"archive/zip"
	"fmt"
	"os"

	"layercraft/internal/sam"
)

// GenerateFromSAM creates a PPTX from SAM segmentation results
func GenerateFromSAM(outPath string, samResult *sam.Result, originalPath string) error {
	f, err := os.Create(outPath)
	if err != nil {
		return err
	}
	defer f.Close()

	zw := zip.NewWriter(f)
	defer zw.Close()

	docW, docH := samResult.Width, samResult.Height
	aspect := float64(docW) / float64(docH)
	var slideWInch, slideHInch float64
	if aspect >= 1 {
		slideWInch = 13.33
		slideHInch = slideWInch / aspect
	} else {
		slideHInch = 7.5
		slideWInch = slideHInch * aspect
	}

	slideW := int64(slideWInch * emuPerInch)
	slideH := int64(slideHInch * emuPerInch)

	scaleX := float64(slideW) / float64(docW)
	scaleY := float64(slideH) / float64(docH)
	scale := scaleX
	if scaleY < scaleX {
		scale = scaleY
	}
	offX := (float64(slideW) - float64(docW)*scale) / 2
	offY := (float64(slideH) - float64(docH)*scale) / 2

	// Filter layers: only keep meaningful ones (area > 1% of total or top 20)
	totalPixels := docW * docH
	minAreaThreshold := totalPixels / 100 // 1% of image
	var layers []sam.LayerInfo
	for _, l := range samResult.Layers {
		if l.Area >= minAreaThreshold || len(layers) < 20 {
			layers = append(layers, l)
		}
	}

	// Write media files
	origData, err := os.ReadFile(originalPath)
	if err != nil {
		return fmt.Errorf("读取原图失败: %w", err)
	}
	w, _ := zw.Create("ppt/media/original.png")
	w.Write(origData)

	for i, layer := range layers {
		data, err := os.ReadFile(layer.File)
		if err != nil {
			return fmt.Errorf("读取图层 %d: %w", i+1, err)
		}
		w, _ := zw.Create(fmt.Sprintf("ppt/media/layer_%d.png", i+1))
		w.Write(data)
	}

	// Slide 1: All elements as independently selectable images
	var shapeXML string
	for i, layer := range layers {
		b := layer.Bbox
		x := int64(offX + float64(b.X)*scale)
		y := int64(offY + float64(b.Y)*scale)
		w := int64(float64(b.W) * scale)
		h := int64(float64(b.H) * scale)
		rId := fmt.Sprintf("rId%d", i+2)
		shapeXML += spTreePicXML(rId, fmt.Sprintf("元素_%d", i+1), x, y, w, h, i+2)
	}

	slideXML := slideHeader(slideW, slideH) + shapeXML + slideFooter()
	writeFile(zw, "ppt/slides/slide1.xml", slideXML)

	// Slide 1 rels
	slideRels := `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>`
	for i := range layers {
		slideRels += fmt.Sprintf(`
<Relationship Id="rId%d" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/layer_%d.png"/>`, i+2, i+1)
	}
	slideRels += "\n</Relationships>"
	writeFile(zw, "ppt/slides/_rels/slide1.xml.rels", slideRels)

	// Slide 2: Original reference
	origSlideXML := slideHeader(slideW, slideH) +
		spTreePicXML("rId2", "原图参考", 0, 0, slideW, slideH, 2) +
		slideFooter()
	writeFile(zw, "ppt/slides/slide2.xml", origSlideXML)
	writeFile(zw, "ppt/slides/_rels/slide2.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/original.png"/>
</Relationships>`)

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
