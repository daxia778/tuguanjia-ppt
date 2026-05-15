#!/usr/bin/env python3
"""
Multi-Element Extraction from Complex AI Scene
Crops individual element regions → sends each to 鲜艺AI抠图 (RMBG) → transparent PNG

Strategy: Since RMBG is a binary foreground/background model,
we crop tight regions around each element so it becomes the "main subject",
then RMBG can cleanly separate it from whatever background remains.
"""

import io
import os
import sys
import json
import struct
import zlib
import urllib.request

RMBG_URL = "http://localhost:30092/rmbg"
SOURCE_IMG = "/Users/admin/.gemini/antigravity/brain/a6795a42-0ca6-4dc6-a0bc-e190f211da8d/media__1777652760052.jpg"
OUTPUT_DIR = "/Users/admin/Desktop/项目_AI-PPT/AI PPT 后台管理系统/assets/extracted_elements"

# Image is 1024 x 819
# Define crop regions for each element (x, y, width, height)
# Coordinates estimated from visual inspection of the birthday card
ELEMENTS = [
    {
        "id": "balloons_left",
        "crop": (0, 20, 330, 550),       # Left side balloon cluster
        "description": "左侧彩色气球群",
        "usage": "角落装饰，放置在页面左侧",
        "tags": ["balloons", "decoration", "corner"]
    },
    {
        "id": "birthday_cake",
        "crop": (100, 250, 450, 570),     # Cake with candles
        "description": "生日蛋糕带蜡烛，含托盘",
        "usage": "核心视觉元素，放置在页面左侧或中央",
        "tags": ["cake", "candles", "centerpiece"]
    },
    {
        "id": "bunting_flags",
        "crop": (80, 0, 600, 150),        # Top bunting flags
        "description": "顶部三角旗帜横幅",
        "usage": "页面顶部装饰横幅",
        "tags": ["bunting", "flags", "header", "top"]
    },
    {
        "id": "gift_boxes",
        "crop": (620, 450, 400, 370),     # Right side gift boxes
        "description": "右下角礼盒组合（粉色+蓝色）",
        "usage": "页面右下角装饰",
        "tags": ["gifts", "presents", "corner"]
    },
    {
        "id": "roses_bottom_left",
        "crop": (30, 600, 300, 220),      # Bottom left flowers
        "description": "底部左侧玫瑰花束",
        "usage": "页面底部角落花卉装饰",
        "tags": ["roses", "flowers", "bottom"]
    },
    {
        "id": "happy_birthday_text",
        "crop": (300, 30, 680, 280),      # "Happy Birthday!" text
        "description": "Happy Birthday! 艺术字标题",
        "usage": "标题装饰文字，覆盖在页面上方",
        "tags": ["text", "title", "artistic"]
    },
    {
        "id": "hearts_scatter",
        "crop": (700, 100, 300, 250),     # Heart decorations right side
        "description": "散落的爱心装饰",
        "usage": "气氛装饰，散布在页面各处",
        "tags": ["hearts", "decoration", "scatter"]
    },
    {
        "id": "roses_bottom_right",
        "crop": (700, 650, 320, 170),     # Bottom right flowers near gifts
        "description": "底部右侧花卉装饰",
        "usage": "页面底部角落花卉装饰",
        "tags": ["roses", "flowers", "bottom", "corner"]
    },
]


def read_jpeg(path):
    """Read image file as bytes."""
    with open(path, "rb") as f:
        return f.read()


def crop_jpeg_via_raw(img_bytes, x, y, w, h):
    """
    Decode JPEG manually is complex; instead we'll use the system's
    sips command (built into macOS) to crop.
    Returns path to cropped temp file.
    """
    import subprocess
    import tempfile

    # Save source to temp
    src_tmp = tempfile.mktemp(suffix=".jpg")
    with open(src_tmp, "wb") as f:
        f.write(img_bytes)

    dst_tmp = tempfile.mktemp(suffix=".png")

    # Use sips to crop: sips needs cropOffset (y, x) and crop size (h, w)
    # First copy, then crop
    subprocess.run(["cp", src_tmp, dst_tmp.replace(".png", ".jpg")], check=True)
    crop_src = dst_tmp.replace(".png", ".jpg")

    # sips --cropOffset y x --crop h w
    subprocess.run([
        "sips",
        "--cropOffset", str(y), str(x),
        "-c", str(h), str(w),  # -c crops to height width
        crop_src,
        "--out", dst_tmp,
        "-s", "format", "png"
    ], check=True, capture_output=True)

    with open(dst_tmp, "rb") as f:
        result = f.read()

    # Cleanup
    try:
        os.unlink(src_tmp)
        os.unlink(crop_src)
        os.unlink(dst_tmp)
    except:
        pass

    return result


def call_rmbg(image_bytes):
    """Send image to 鲜艺AI抠图 local API, return transparent PNG bytes."""
    req = urllib.request.Request(
        RMBG_URL,
        data=image_bytes,
        headers={"Content-Type": "image/png"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.read()
    except Exception as e:
        print(f"   ❌ RMBG API error: {e}")
        return None


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print(f"🎂 Multi-Element Extraction from Birthday Card")
    print(f"📐 Source: {SOURCE_IMG}")
    print(f"📦 Elements to extract: {len(ELEMENTS)}")
    print(f"📁 Output: {OUTPUT_DIR}")
    print("=" * 60)

    img_bytes = read_jpeg(SOURCE_IMG)
    results = []

    for i, elem in enumerate(ELEMENTS, 1):
        eid = elem["id"]
        x, y, w, h = elem["crop"]
        print(f"\n[{i}/{len(ELEMENTS)}] 🔍 {eid}")
        print(f"   Crop: ({x},{y}) {w}×{h}")

        # Step 1: Crop the region
        try:
            cropped = crop_jpeg_via_raw(img_bytes, x, y, w, h)
            print(f"   ✅ Cropped: {len(cropped)//1024}KB")
        except Exception as e:
            print(f"   ❌ Crop failed: {e}")
            results.append({"id": eid, "status": "crop_failed", "error": str(e)})
            continue

        # Save cropped (for reference)
        crop_path = os.path.join(OUTPUT_DIR, f"{eid}_cropped.png")
        with open(crop_path, "wb") as f:
            f.write(cropped)

        # Step 2: Send to RMBG for background removal
        print(f"   🎨 Sending to RMBG...")
        transparent = call_rmbg(cropped)

        if transparent and len(transparent) > 500:
            out_path = os.path.join(OUTPUT_DIR, f"{eid}.png")
            with open(out_path, "wb") as f:
                f.write(transparent)
            size_kb = len(transparent) / 1024
            print(f"   ✅ Transparent: {size_kb:.0f}KB → {out_path}")
            results.append({
                "id": eid,
                "status": "success",
                "filename": f"{eid}.png",
                "size_kb": round(size_kb, 1),
                "crop_region": {"x": x, "y": y, "w": w, "h": h},
                "description": elem["description"],
                "usage": elem["usage"],
                "tags": elem["tags"]
            })
        else:
            print(f"   ❌ RMBG returned empty/error")
            results.append({"id": eid, "status": "rmbg_failed"})

    # Summary
    print("\n" + "=" * 60)
    success = [r for r in results if r.get("status") == "success"]
    print(f"✅ Success: {len(success)} / {len(ELEMENTS)}")

    # Save manifest
    manifest = {
        "source": "birthday_card_complex_scene",
        "extraction_method": "crop_region + RMBG-1.4",
        "elements": results
    }
    manifest_path = os.path.join(OUTPUT_DIR, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print(f"📋 Manifest → {manifest_path}")


if __name__ == "__main__":
    main()
