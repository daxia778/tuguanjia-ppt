package pptx

import (
	"archive/zip"
	"bytes"
	"fmt"
	"image"
	"image/png"
	"os"

	"layercraft/internal/segment"
)

// EMU = English Metric Units (914400 EMU = 1 inch)
const emuPerInch = 914400

// Generate creates a PPTX file where each layer is an independently
// selectable/movable image element on a single slide.
func Generate(outPath string, layers []segment.Layer, docW, docH int, originalPath string) error {
	f, err := os.Create(outPath)
	if err != nil {
		return err
	}
	defer f.Close()

	zw := zip.NewWriter(f)
	defer zw.Close()

	// Slide dimensions in inches (fit to 13.33" wide or 7.5" tall)
	aspect := float64(docW) / float64(docH)
	var slideWInch, slideHInch float64
	if aspect >= 1 {
		slideWInch = 13.33
		slideHInch = slideWInch / aspect
	} else {
		slideHInch = 7.5
		slideWInch = slideHInch * aspect
	}

	slideW := int64(slideWInch * emuPerInch) // EMU
	slideH := int64(slideHInch * emuPerInch)

	// Scale factor: image pixels → EMU
	scaleX := float64(slideW) / float64(docW)
	scaleY := float64(slideH) / float64(docH)
	scale := scaleX
	if scaleY < scaleX {
		scale = scaleY
	}

	// Center offset
	offX := (float64(slideW) - float64(docW)*scale) / 2
	offY := (float64(slideH) - float64(docH)*scale) / 2

	// Encode all layer images to PNG bytes
	type imgEntry struct {
		name string
		data []byte
	}
	var images []imgEntry

	// Load and add original image first
	origData, err := os.ReadFile(originalPath)
	if err == nil {
		images = append(images, imgEntry{name: "original.png", data: origData})
	}

	for i, layer := range layers {
		buf := &bytes.Buffer{}
		if err := png.Encode(buf, layer.Image); err != nil {
			return fmt.Errorf("编码图层 %d: %w", i, err)
		}
		images = append(images, imgEntry{
			name: fmt.Sprintf("layer_%d.png", i+1),
			data: buf.Bytes(),
		})
	}

	// Write media files
	for _, img := range images {
		w, err := zw.Create("ppt/media/" + img.name)
		if err != nil {
			return err
		}
		w.Write(img.data)
	}

	// Build slide XML with each layer as independent image
	var shapeXML string

	// Layer images (1-indexed, offset by 1 for original)
	for i, layer := range layers {
		b := layer.Bounds
		x := int64(offX + float64(b.X)*scale)
		y := int64(offY + float64(b.Y)*scale)
		w := int64(float64(b.W) * scale)
		h := int64(float64(b.H) * scale)

		rId := fmt.Sprintf("rId%d", i+2) // +2 because rId1 is slide layout
		shapeXML += spTreePicXML(rId, layer.Name, x, y, w, h, i+2)
	}

	// Write slide1.xml
	slideXML := slideHeader(slideW, slideH) + shapeXML + slideFooter()
	writeFile(zw, "ppt/slides/slide1.xml", slideXML)

	// Write slide1.xml.rels
	slideRels := `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>`
	for i := range layers {
		slideRels += fmt.Sprintf(`
<Relationship Id="rId%d" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/layer_%d.png"/>`, i+2, i+1)
	}
	slideRels += "\n</Relationships>"
	writeFile(zw, "ppt/slides/_rels/slide1.xml.rels", slideRels)

	// Write slide2.xml (original image reference)
	origSlideXML := slideHeader(slideW, slideH) +
		spTreePicXML("rId2", "原图参考", 0, 0, slideW, slideH, 2) +
		slideFooter()
	writeFile(zw, "ppt/slides/slide2.xml", origSlideXML)
	writeFile(zw, "ppt/slides/_rels/slide2.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/original.png"/>
</Relationships>`)

	// Write presentation.xml
	writeFile(zw, "ppt/presentation.xml", presentationXML(slideW, slideH))
	writeFile(zw, "ppt/_rels/presentation.xml.rels", presentationRelsXML())

	// Write theme, layout, master (minimal)
	writeFile(zw, "ppt/theme/theme1.xml", minimalThemeXML())
	writeFile(zw, "ppt/slideLayouts/slideLayout1.xml", minimalSlideLayoutXML())
	writeFile(zw, "ppt/slideLayouts/_rels/slideLayout1.xml.rels", slideLayoutRelsXML())
	writeFile(zw, "ppt/slideMasters/slideMaster1.xml", minimalSlideMasterXML(slideW, slideH))
	writeFile(zw, "ppt/slideMasters/_rels/slideMaster1.xml.rels", slideMasterRelsXML())

	// Write [Content_Types].xml
	writeFile(zw, "[Content_Types].xml", contentTypesXML(len(layers)))

	// Write _rels/.rels
	writeFile(zw, "_rels/.rels", rootRelsXML())

	return nil
}

func writeFile(zw *zip.Writer, name, content string) {
	w, _ := zw.Create(name)
	w.Write([]byte(content))
}

func getImageSize(data []byte) (int, int) {
	img, err := png.Decode(bytes.NewReader(data))
	if err != nil {
		return 100, 100
	}
	b := img.Bounds()
	return b.Dx(), b.Dy()
}

// Ignore unused
var _ = image.Rect

func slideHeader(slideW, slideH int64) string {
	return fmt.Sprintf(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
       xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
       xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
<p:cSld>
<p:bg><p:bgPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>
<p:spTree>
<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
<p:grpSpPr>
<a:xfrm><a:off x="0" y="0"/><a:ext cx="%d" cy="%d"/><a:chOff x="0" y="0"/><a:chExt cx="%d" cy="%d"/></a:xfrm>
</p:grpSpPr>`, slideW, slideH, slideW, slideH)
}

func slideFooter() string {
	return `</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>`
}

// spTreePicXML creates a picture shape element positioned at exact coordinates
func spTreePicXML(rId, name string, x, y, w, h int64, shapeId int) string {
	return fmt.Sprintf(`
<p:pic>
<p:nvPicPr>
<p:cNvPr id="%d" name="%s" descr="%s"/>
<p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr>
<p:nvPr/>
</p:nvPicPr>
<p:blipFill>
<a:blip r:embed="%s"/>
<a:stretch><a:fillRect/></a:stretch>
</p:blipFill>
<p:spPr>
<a:xfrm>
<a:off x="%d" y="%d"/>
<a:ext cx="%d" cy="%d"/>
</a:xfrm>
<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
</p:spPr>
</p:pic>`, shapeId, name, name, rId, x, y, w, h)
}

func presentationXML(slideW, slideH int64) string {
	return fmt.Sprintf(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
                xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
                xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
<p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>
<p:sldIdLst>
<p:sldId id="256" r:id="rId2"/>
<p:sldId id="257" r:id="rId3"/>
</p:sldIdLst>
<p:sldSz cx="%d" cy="%d"/>
<p:notesSz cx="%d" cy="%d"/>
</p:presentation>`, slideW, slideH, slideW, slideH)
}

func presentationRelsXML() string {
	return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide2.xml"/>
<Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>
</Relationships>`
}

func contentTypesXML(layerCount int) string {
	s := `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Default Extension="png" ContentType="image/png"/>
<Default Extension="jpeg" ContentType="image/jpeg"/>
<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
<Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
<Override PartName="/ppt/slides/slide2.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
</Types>`
	return s
}

func rootRelsXML() string {
	return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`
}

func minimalThemeXML() string {
	return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="LayerCraft">
<a:themeElements>
<a:clrScheme name="Office">
<a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1>
<a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1>
<a:dk2><a:srgbClr val="1F497D"/></a:dk2>
<a:lt2><a:srgbClr val="EEECE1"/></a:lt2>
<a:accent1><a:srgbClr val="4F81BD"/></a:accent1>
<a:accent2><a:srgbClr val="C0504D"/></a:accent2>
<a:accent3><a:srgbClr val="9BBB59"/></a:accent3>
<a:accent4><a:srgbClr val="8064A2"/></a:accent4>
<a:accent5><a:srgbClr val="4BACC6"/></a:accent5>
<a:accent6><a:srgbClr val="F79646"/></a:accent6>
<a:hlink><a:srgbClr val="0000FF"/></a:hlink>
<a:folHlink><a:srgbClr val="800080"/></a:folHlink>
</a:clrScheme>
<a:fontScheme name="Office">
<a:majorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont>
<a:minorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont>
</a:fontScheme>
<a:fmtScheme name="Office">
<a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst>
<a:lnStyleLst><a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="25400"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="38100"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst>
<a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst>
<a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst>
</a:fmtScheme>
</a:themeElements>
</a:theme>`
}

func minimalSlideLayoutXML() string {
	return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
             xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
             xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank">
<p:cSld><p:spTree>
<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
<p:grpSpPr/>
</p:spTree></p:cSld>
</p:sldLayout>`
}

func slideLayoutRelsXML() string {
	return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>`
}

func minimalSlideMasterXML(slideW, slideH int64) string {
	return fmt.Sprintf(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
             xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
             xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
<p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>
<p:spTree>
<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
<p:grpSpPr>
<a:xfrm><a:off x="0" y="0"/><a:ext cx="%d" cy="%d"/><a:chOff x="0" y="0"/><a:chExt cx="%d" cy="%d"/></a:xfrm>
</p:grpSpPr>
</p:spTree></p:cSld>
<p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
<p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>
</p:sldMaster>`, slideW, slideH, slideW, slideH)
}

func slideMasterRelsXML() string {
	return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>`
}
