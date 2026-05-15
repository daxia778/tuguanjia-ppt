#!/usr/bin/env python3
"""
Birthday Theme Asset Generator
Calls chatgpt2api (gpt-image-2) to generate layered PPT assets.
Runs 3 concurrent requests max.
"""

import asyncio
import aiohttp
import base64
import json
import os
import sys
from datetime import datetime

API_BASE = "http://localhost:8200/v1"
API_KEY = "lc-image-2026"
MODEL = "gpt-image-2"
MAX_CONCURRENT = 3

# Output base
THEME_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "themes", "birthday"
)

# 10 assets: 3 backgrounds, 5 decorations, 2 title frames
ASSETS = [
    # === Backgrounds (16:9, full page) ===
    {
        "id": "bg_warm_watercolor",
        "category": "backgrounds",
        "filename": "bg_warm_watercolor.png",
        "prompt": "A warm watercolor birthday party background, 16:9 aspect ratio, soft pastel pink and gold tones, scattered confetti and tiny stars, large clear empty area in the center for text overlay, dreamy bokeh effect, no text, no people, no cake, clean professional presentation background",
        "size": "1536x1024",
        "usage": "全页背景",
        "placement": "铺满整页作为底层背景",
        "description": "暖色水彩生日背景，粉金色调，中央留白区域用于放置文字",
        "tags": ["background", "warm", "watercolor", "pastel", "birthday"]
    },
    {
        "id": "bg_festive_dark",
        "category": "backgrounds",
        "filename": "bg_festive_dark.png",
        "prompt": "An elegant dark navy blue birthday celebration background, 16:9 aspect ratio, gold glitter particles floating, subtle golden bokeh lights, large clear dark area in center-right for white text, luxury premium feel, no text, no objects, no people, presentation slide background",
        "size": "1536x1024",
        "usage": "全页背景",
        "placement": "铺满整页作为底层背景，适合白色/金色文字",
        "description": "深蓝金箔生日背景，奢华感，适合正式场合生日PPT",
        "tags": ["background", "dark", "elegant", "gold", "luxury", "birthday"]
    },
    {
        "id": "bg_cute_cartoon",
        "category": "backgrounds",
        "filename": "bg_cute_cartoon.png",
        "prompt": "A cute kawaii cartoon birthday background, 16:9 aspect ratio, light yellow and mint green, tiny hand-drawn balloons and bunting flags along the top edge only, large clean center area for text, flat illustration style, no text, no characters, children birthday party presentation background",
        "size": "1536x1024",
        "usage": "全页背景",
        "placement": "铺满整页作为底层背景，适合儿童/可爱风格",
        "description": "可爱卡通生日背景，薄荷绿黄色调，顶部有小旗帜和气球装饰",
        "tags": ["background", "cute", "cartoon", "kawaii", "children", "birthday"]
    },

    # === Decorations (transparent background, isolated elements) ===
    {
        "id": "deco_balloon_cluster",
        "category": "decorations",
        "filename": "deco_balloon_cluster.png",
        "prompt": "A cluster of 5 colorful birthday balloons with curly ribbons, watercolor illustration style, vibrant pink purple yellow blue colors, isolated on pure white background, no shadows on background, high resolution clipart style, single element only",
        "size": "1024x1024",
        "usage": "装饰元素",
        "placement": "左上角或右上角，作为页面点缀",
        "description": "一组彩色气球，带卷曲丝带，水彩风格",
        "tags": ["decoration", "balloons", "colorful", "corner", "birthday"]
    },
    {
        "id": "deco_birthday_cake",
        "category": "decorations",
        "filename": "deco_birthday_cake.png",
        "prompt": "A beautiful three-tier birthday cake with lit candles and cream frosting, decorated with fresh berries and sprinkles, watercolor painting style, isolated on pure white background, no plate, no table, single element clipart, high detail",
        "size": "1024x1024",
        "usage": "装饰元素",
        "placement": "页面左侧或右侧，作为视觉焦点",
        "description": "三层生日蛋糕，带蜡烛和浆果装饰，水彩风格",
        "tags": ["decoration", "cake", "candles", "centerpiece", "birthday"]
    },
    {
        "id": "deco_gift_boxes",
        "category": "decorations",
        "filename": "deco_gift_boxes.png",
        "prompt": "Three gift boxes with beautiful ribbon bows, one pink one blue one gold, stacked arrangement, watercolor illustration style, isolated on pure white background, no shadows, festive wrapping paper with subtle patterns, clipart style element",
        "size": "1024x1024",
        "usage": "装饰元素",
        "placement": "右下角或底部装饰",
        "description": "三个精美礼盒，粉蓝金配色，水彩风格",
        "tags": ["decoration", "gifts", "presents", "bottom", "birthday"]
    },
    {
        "id": "deco_confetti_scatter",
        "category": "decorations",
        "filename": "deco_confetti_scatter.png",
        "prompt": "Scattered colorful confetti and streamers floating in air, various shapes circles stars hearts, rainbow colors, watercolor style, isolated on pure white background, sparse arrangement with natural randomness, overlay decoration element",
        "size": "1536x1024",
        "usage": "装饰元素（叠加层）",
        "placement": "覆盖在整页上方作为氛围叠加层，需降低不透明度",
        "description": "散落的五彩纸屑和彩带，可作为叠加装饰层",
        "tags": ["decoration", "confetti", "overlay", "atmosphere", "birthday"]
    },
    {
        "id": "deco_bunting_flags",
        "category": "decorations",
        "filename": "deco_bunting_flags.png",
        "prompt": "A long horizontal string of colorful triangle bunting flags, party pennant banner, pastel colors pink blue yellow green, watercolor hand-painted style, isolated on pure white background, horizontal banner element, wide format, no text on flags",
        "size": "1536x1024",
        "usage": "装饰元素",
        "placement": "页面顶部横向放置，作为页眉装饰",
        "description": "彩色三角旗帜横幅，水彩手绘风格",
        "tags": ["decoration", "bunting", "flags", "top", "header", "birthday"]
    },

    # === Title Frames (text containers) ===
    {
        "id": "frame_ribbon_banner",
        "category": "title_frames",
        "filename": "frame_ribbon_banner.png",
        "prompt": "An elegant golden ribbon banner scroll, empty center area for text, ornate curled edges, watercolor and gold foil style, isolated on pure white background, horizontal banner shape suitable for title text, no text written on it, decorative frame element",
        "size": "1536x1024",
        "usage": "标题框",
        "placement": "页面顶部或中央，内部放置标题文字",
        "description": "金色绶带横幅标题框，中间空白区域放文字",
        "tags": ["frame", "title", "ribbon", "gold", "banner", "birthday"]
    },
    {
        "id": "frame_floral_wreath",
        "category": "title_frames",
        "filename": "frame_floral_wreath.png",
        "prompt": "A circular floral wreath frame made of watercolor roses, peonies and green leaves, soft pink and cream colors, empty center for text, botanical illustration style, isolated on pure white background, decorative border element, no text inside",
        "size": "1024x1024",
        "usage": "标题框",
        "placement": "页面中央，内部放置祝福语或标题",
        "description": "花卉花环圆形标题框，水彩玫瑰和牡丹，中间留白",
        "tags": ["frame", "title", "floral", "wreath", "circular", "birthday"]
    },
]


async def generate_image(session, asset, semaphore):
    """Generate a single image asset via chatgpt2api."""
    async with semaphore:
        asset_id = asset["id"]
        print(f"🎨 [{asset_id}] Generating...")

        payload = {
            "model": MODEL,
            "prompt": asset["prompt"],
            "n": 1,
            "size": asset["size"],
            "response_format": "b64_json"
        }

        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        }

        try:
            async with session.post(
                f"{API_BASE}/images/generations",
                json=payload,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=120)
            ) as resp:
                if resp.status != 200:
                    error_text = await resp.text()
                    print(f"❌ [{asset_id}] API error {resp.status}: {error_text[:200]}")
                    return {"id": asset_id, "status": "failed", "error": error_text[:200]}

                result = await resp.json()
                b64_data = result["data"][0]["b64_json"]
                img_bytes = base64.b64decode(b64_data)

                # Save to appropriate category folder
                out_dir = os.path.join(THEME_DIR, asset["category"])
                os.makedirs(out_dir, exist_ok=True)
                out_path = os.path.join(out_dir, asset["filename"])

                with open(out_path, "wb") as f:
                    f.write(img_bytes)

                file_size_kb = len(img_bytes) / 1024
                print(f"✅ [{asset_id}] Saved → {out_path} ({file_size_kb:.0f} KB)")
                return {
                    "id": asset_id,
                    "status": "success",
                    "path": out_path,
                    "size_kb": round(file_size_kb, 1)
                }

        except asyncio.TimeoutError:
            print(f"⏰ [{asset_id}] Timeout after 120s")
            return {"id": asset_id, "status": "timeout"}
        except Exception as e:
            print(f"❌ [{asset_id}] Exception: {e}")
            return {"id": asset_id, "status": "error", "error": str(e)}


async def main():
    print(f"🎂 Birthday Theme Asset Generator")
    print(f"📁 Output: {THEME_DIR}")
    print(f"🔄 Concurrency: {MAX_CONCURRENT}")
    print(f"📦 Total assets: {len(ASSETS)}")
    print(f"{'='*60}")

    semaphore = asyncio.Semaphore(MAX_CONCURRENT)

    async with aiohttp.ClientSession() as session:
        tasks = [generate_image(session, asset, semaphore) for asset in ASSETS]
        results = await asyncio.gather(*tasks)

    # Summary
    print(f"\n{'='*60}")
    success = [r for r in results if r["status"] == "success"]
    failed = [r for r in results if r["status"] != "success"]
    print(f"✅ Success: {len(success)} / {len(ASSETS)}")
    if failed:
        print(f"❌ Failed: {len(failed)}")
        for f in failed:
            print(f"   - {f['id']}: {f.get('error', f['status'])}")

    # Generate metadata.json
    metadata = {
        "theme_id": "birthday",
        "theme_name": "生日庆祝",
        "theme_name_en": "Birthday Celebration",
        "version": "1.0.0",
        "created_at": datetime.now().isoformat(),
        "style": "watercolor_illustration",
        "color_palette": {
            "primary": "#F48FB1",
            "secondary": "#FFD54F",
            "accent": "#4FC3F7",
            "background_light": "#FFF8E1",
            "background_dark": "#1A237E",
            "text_dark": "#37474F",
            "text_light": "#FFFFFF",
            "gold": "#D4AF37"
        },
        "recommended_fonts": {
            "title_cn": "站酷快乐体",
            "title_fallback": "Microsoft YaHei",
            "body_cn": "微软雅黑",
            "title_en": "Pacifico",
            "body_en": "Nunito"
        },
        "assets": []
    }

    for asset, result in zip(ASSETS, results):
        asset_entry = {
            "id": asset["id"],
            "category": asset["category"],
            "filename": asset["filename"],
            "usage": asset["usage"],
            "placement": asset["placement"],
            "description": asset["description"],
            "tags": asset["tags"],
            "size_spec": asset["size"],
            "status": result["status"]
        }
        if result["status"] == "success":
            asset_entry["size_kb"] = result["size_kb"]
            asset_entry["path"] = f"themes/birthday/{asset['category']}/{asset['filename']}"
        metadata["assets"].append(asset_entry)

    meta_path = os.path.join(THEME_DIR, "metadata.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    print(f"\n📋 Metadata saved → {meta_path}")

    return len(success)


if __name__ == "__main__":
    count = asyncio.run(main())
    sys.exit(0 if count > 0 else 1)
