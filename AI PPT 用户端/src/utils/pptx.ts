import PptxGenJS from 'pptxgenjs'

export interface SlideData {
  page: number
  title: string
  content: string[]
  notes?: string
  imageUrl?: string | null
}

export interface PptOutline {
  title: string
  style?: string
  slides: SlideData[]
}

/**
 * 将图片 URL 转为 base64 data URI（用于嵌入 PPTX）
 */
async function imageUrlToBase64(url: string): Promise<string> {
  const resp = await fetch(url)
  const blob = await resp.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// ── 风格配色方案（文字回退模式用）──
const THEMES: Record<string, {
  bg: string; titleColor: string; bodyColor: string; accent: string
  coverBg: string; coverText: string; endBg: string
}> = {
  modern: {
    bg: 'FFFFFF', titleColor: '1a1a2e', bodyColor: '4a4a68', accent: 'fb542b',
    coverBg: '1a1a2e', coverText: 'FFFFFF', endBg: '1a1a2e',
  },
  dark: {
    bg: '1e1e2e', titleColor: 'e0e0e0', bodyColor: 'b0b0c0', accent: 'ff6b6b',
    coverBg: '0d0d1a', coverText: 'FFFFFF', endBg: '0d0d1a',
  },
  vibrant: {
    bg: 'FFFFFF', titleColor: '111827', bodyColor: '374151', accent: 'fb542b',
    coverBg: 'fb542b', coverText: 'FFFFFF', endBg: 'ff151f',
  },
}

/**
 * 根据 AI 生成的大纲数据创建 PPTX 文件并下载
 * 优先使用 imageUrl（图片模式），无图片时回退到文字排版
 */
export async function generatePptx(outline: PptOutline, styleName = 'modern'): Promise<void> {
  const pptx = new PptxGenJS()
  const theme = THEMES[styleName] || THEMES.modern

  pptx.author = 'AIPPT'
  pptx.company = 'AIPPT Platform'
  pptx.title = outline.title
  pptx.subject = outline.title
  pptx.layout = 'LAYOUT_16x9'

  const slides = outline.slides
  const hasImages = slides.some(s => s.imageUrl)

  for (let idx = 0; idx < slides.length; idx++) {
    const s = slides[idx]
    const slide = pptx.addSlide()
    const isFirst = idx === 0
    const isLast = idx === slides.length - 1

    if (s.imageUrl) {
      // ═══ 图片模式：全幅铺满 ═══
      try {
        const dataUri = await imageUrlToBase64(s.imageUrl)
        slide.addImage({
          data: dataUri,
          x: 0, y: 0, w: '100%', h: '100%',
          sizing: { type: 'cover', w: 10, h: 5.625 },
        })
      } catch (err) {
        console.error(`[PPTX] 图片下载失败 (第${idx + 1}页):`, err)
        // 回退到文字模式
        addTextSlide(pptx, slide, s, theme, isFirst, isLast, idx)
      }
    } else {
      // ═══ 文字回退模式 ═══
      addTextSlide(pptx, slide, s, theme, isFirst, isLast, idx)
    }

    // 演讲者备注
    if (s.notes) {
      slide.addNotes(s.notes)
    }
  }

  // 导出下载
  const fileName = `${outline.title.replace(/[\/\\:*?"<>|]/g, '_')}.pptx`
  await pptx.writeFile({ fileName })
}

/**
 * 文字模式幻灯片（回退方案）
 */
function addTextSlide(
  pptx: PptxGenJS,
  slide: any,
  s: SlideData,
  theme: typeof THEMES.modern,
  isFirst: boolean,
  isLast: boolean,
  idx: number
) {
  if (isFirst) {
    slide.background = { color: theme.coverBg }
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.8, y: 2.0, w: 0.6, h: 0.06,
      fill: { color: theme.accent },
    })
    slide.addText(s.title, {
      x: 0.8, y: 2.2, w: 8.0, h: 1.2,
      fontSize: 36, fontFace: 'Microsoft YaHei',
      color: theme.coverText, bold: true,
    })
    if (s.content?.length) {
      slide.addText(s.content.join(' · '), {
        x: 0.8, y: 3.5, w: 8.0, h: 0.6,
        fontSize: 16, fontFace: 'Microsoft YaHei',
        color: theme.accent,
      })
    }
    slide.addText('AIPPT · AI 驱动的演示文稿', {
      x: 0.8, y: 4.8, w: 5.0, h: 0.4,
      fontSize: 11, fontFace: 'Microsoft YaHei', color: '888888',
    })
  } else if (isLast) {
    slide.background = { color: theme.endBg }
    slide.addText(s.title, {
      x: 1.0, y: 1.8, w: 8.0, h: 1.0,
      fontSize: 32, fontFace: 'Microsoft YaHei',
      color: theme.coverText, bold: true, align: 'center',
    })
    if (s.content?.length) {
      slide.addText(s.content.map(c => `• ${c}`).join('\n'), {
        x: 1.5, y: 3.2, w: 7.0, h: 1.5,
        fontSize: 14, fontFace: 'Microsoft YaHei',
        color: theme.bodyColor, lineSpacingMultiple: 1.5, align: 'center',
      })
    }
  } else {
    slide.background = { color: theme.bg }
    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: 0.08, h: '100%',
      fill: { color: theme.accent },
    })
    slide.addText(`${String(s.page).padStart(2, '0')}`, {
      x: 0.3, y: 0.3, w: 0.8, h: 0.4,
      fontSize: 12, fontFace: 'Microsoft YaHei',
      color: theme.accent, bold: true,
    })
    slide.addText(s.title, {
      x: 0.3, y: 0.8, w: 9.0, h: 0.7,
      fontSize: 26, fontFace: 'Microsoft YaHei',
      color: theme.titleColor, bold: true,
    })
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.3, y: 1.6, w: 1.2, h: 0.04,
      fill: { color: theme.accent },
    })
    if (s.content?.length) {
      const bulletText = s.content.map(c => ({
        text: c,
        options: {
          fontSize: 16, fontFace: 'Microsoft YaHei', color: theme.bodyColor,
          bullet: { code: '25CF', color: theme.accent },
          paraSpaceBefore: 8, paraSpaceAfter: 4,
        },
      }))
      slide.addText(bulletText as any, {
        x: 0.3, y: 1.9, w: 9.0, h: 3.0,
        valign: 'top', lineSpacingMultiple: 1.4,
      })
    }
  }
}
