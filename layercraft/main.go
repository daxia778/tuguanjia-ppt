package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"layercraft/internal/grid"
	"layercraft/internal/pptx"
)

func main() {
	imagePath := flag.String("image", "", "输入图片（网格元素图）")
	rows := flag.Int("rows", 2, "网格行数")
	cols := flag.Int("cols", 3, "网格列数")
	output := flag.String("out", "", "输出 PPTX 路径")
	flag.Parse()

	if *imagePath == "" {
		fmt.Println("LayerCraft - AI 图像元素 → 可编辑 PPTX")
		fmt.Println()
		fmt.Println("用法:")
		fmt.Println("  layercraft -image <网格元素图.png> [-rows 2] [-cols 3]")
		fmt.Println()
		fmt.Println("工作流: AI 生成网格排列的元素图 → 自动裁切 → 组装成可编辑 PPTX")
		fmt.Println()
		flag.PrintDefaults()
		os.Exit(0)
	}

	if _, err := os.Stat(*imagePath); os.IsNotExist(err) {
		log.Fatalf("❌ 文件不存在: %s", *imagePath)
	}

	if *output == "" {
		ext := filepath.Ext(*imagePath)
		base := (*imagePath)[:len(*imagePath)-len(ext)]
		*output = base + "_editable.pptx"
	}

	fmt.Println("╔═══════════════════════════════════╗")
	fmt.Println("║  LayerCraft - 元素网格 → PPTX      ║")
	fmt.Println("╚═══════════════════════════════════╝")
	fmt.Printf("\n输入: %s (%dx%d 网格)\n输出: %s\n", *imagePath, *rows, *cols, *output)

	totalStart := time.Now()

	// Step 1: Cut grid
	fmt.Printf("\n[Step 1] 裁切网格元素...\n")
	outputDir := filepath.Join(filepath.Dir(*imagePath), "grid_elements")
	cells, imgW, imgH, err := grid.CutGrid(*imagePath, outputDir, *rows, *cols)
	if err != nil {
		log.Fatalf("❌ 裁切失败: %v", err)
	}
	fmt.Printf("  ✅ 得到 %d 个元素\n", len(cells))
	for _, c := range cells {
		fmt.Printf("     [%d] %dx%d @ (%d,%d)\n", c.Index, c.W, c.H, c.X, c.Y)
	}

	// Step 2: Generate PPTX
	fmt.Printf("\n[Step 2] 生成可编辑 PPTX...\n")
	err = pptx.GenerateFromGrid(*output, cells, imgW, imgH)
	if err != nil {
		log.Fatalf("❌ PPTX 生成失败: %v", err)
	}
	fi, _ := os.Stat(*output)
	fmt.Printf("  ✅ 完成 → %s (%dKB)\n", *output, fi.Size()/1024)

	fmt.Printf("\n总耗时: %.1fs\n", time.Since(totalStart).Seconds())
	fmt.Println("✅ 每个元素可独立选中、拖动和编辑！")
}
