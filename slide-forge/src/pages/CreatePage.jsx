import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import {
  Sparkles, ArrowLeft, Send, Loader2, RefreshCw,
  Download, ChevronLeft, ChevronRight, Palette,
  Layout, FileText, RotateCcw, Check, Wand2,
  Layers, Clock
} from 'lucide-react'
import './CreatePage.css'

gsap.registerPlugin(useGSAP)

const STYLE_PRESETS = [
  { id: 'tech', label: '科技感', emoji: '🔬', gradient: 'linear-gradient(135deg, #1a1a2e, #16213e)' },
  { id: 'minimal', label: '极简', emoji: '✨', gradient: 'linear-gradient(135deg, #f5f5f5, #e0e0e0)' },
  { id: 'business', label: '商务', emoji: '💼', gradient: 'linear-gradient(135deg, #1a237e, #0d47a1)' },
  { id: 'creative', label: '创意', emoji: '🎨', gradient: 'linear-gradient(135deg, #ff6b6b, #feca57)' },
  { id: 'nature', label: '自然', emoji: '🌿', gradient: 'linear-gradient(135deg, #134e5e, #71b280)' },
  { id: 'dark', label: '暗黑', emoji: '🌙', gradient: 'linear-gradient(135deg, #0f0c29, #302b63)' },
]

const MOCK_SLIDES = [
  { id: 1, type: 'cover', title: '封面页', status: 'done' },
  { id: 2, type: 'toc', title: '目录页', status: 'done' },
  { id: 3, type: 'content', title: '市场概述', status: 'done' },
  { id: 4, type: 'content', title: '竞争格局', status: 'generating' },
  { id: 5, type: 'data', title: '数据分析', status: 'pending' },
  { id: 6, type: 'content', title: '技术趋势', status: 'pending' },
  { id: 7, type: 'content', title: '案例研究', status: 'pending' },
  { id: 8, type: 'ending', title: '总结与展望', status: 'pending' },
]

// Simulated gradient thumbnails for demo
function SlideThumb({ slide, index }) {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  ]

  return (
    <div className="slide-thumb-visual" style={{ background: gradients[index % gradients.length] }}>
      {slide.status === 'generating' && (
        <div className="generating-overlay">
          <Loader2 size={24} className="spin" />
          <span>生成中...</span>
        </div>
      )}
      {slide.status === 'pending' && (
        <div className="pending-overlay">
          <Clock size={20} />
          <span>等待中</span>
        </div>
      )}
      {slide.status === 'done' && (
        <div className="done-badge">
          <Check size={14} />
        </div>
      )}
      <div className="slide-type-label">{slide.title}</div>
    </div>
  )
}

export default function CreatePage() {
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  const [phase, setPhase] = useState('input') // 'input' | 'generating' | 'preview'
  const [prompt, setPrompt] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('tech')
  const [slideCount, setSlideCount] = useState(8)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState([])

  useGSAP(() => {
    // Page entrance
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.fromTo('.create-header',
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5 }
    )

    if (phase === 'input') {
      tl.fromTo('.input-section',
        { y: 40, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.7 },
        '-=0.3'
      )
      tl.fromTo('.style-option',
        { y: 20, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.4, stagger: 0.06 },
        '-=0.4'
      )
      tl.fromTo('.slide-count-section',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4 },
        '-=0.2'
      )
    }
  }, { scope: containerRef, dependencies: [phase] })

  // Animate phase transitions
  const startGeneration = useCallback(() => {
    if (!prompt.trim()) return

    // Animate out input
    const tl = gsap.timeline({
      onComplete: () => {
        setPhase('preview')
        setSlides(MOCK_SLIDES)

        // Animate in preview after state update
        requestAnimationFrame(() => {
          const tl2 = gsap.timeline({ defaults: { ease: 'power3.out' } })
          tl2.fromTo('.preview-container',
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6 }
          )
          tl2.fromTo('.slide-card',
            { y: 30, opacity: 0, scale: 0.95 },
            { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.08 },
            '-=0.3'
          )
          tl2.fromTo('.preview-actions',
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4 },
            '-=0.2'
          )
        })
      }
    })
    tl.to('.input-section', { y: -30, opacity: 0, duration: 0.4, ease: 'power2.in' })
    tl.to('.options-row', { y: -20, opacity: 0, duration: 0.3, ease: 'power2.in' }, '-=0.2')
  }, [prompt])

  const goBack = useCallback(() => {
    if (phase === 'preview') {
      const tl = gsap.timeline({
        onComplete: () => {
          setPhase('input')
          setSlides([])
        }
      })
      tl.to('.preview-container', { y: 30, opacity: 0, duration: 0.3, ease: 'power2.in' })
    } else {
      navigate('/')
    }
  }, [phase, navigate])

  const regenerateSlide = useCallback((index) => {
    // Animate the card
    const card = document.querySelectorAll('.slide-card')[index]
    if (card) {
      gsap.to(card, {
        scale: 0.95,
        opacity: 0.5,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
      })
    }
  }, [])

  return (
    <div ref={containerRef} className="create-page">
      {/* Header */}
      <header className="create-header glass">
        <button className="back-btn" onClick={goBack}>
          <ArrowLeft size={18} />
          <span>{phase === 'preview' ? '返回编辑' : '返回首页'}</span>
        </button>
        <div className="header-center">
          <Sparkles size={18} />
          <span>SlideForge</span>
        </div>
        <div className="header-right">
          {phase === 'preview' && (
            <button className="btn-primary btn-sm">
              <Download size={16} />
              导出 PPTX
            </button>
          )}
        </div>
      </header>

      {/* === Input Phase === */}
      {phase === 'input' && (
        <div className="input-phase">
          <div className="input-section">
            <div className="input-label">
              <Wand2 size={18} />
              <span>描述你想要的 PPT</span>
            </div>
            <div className="prompt-input-wrapper glass-strong">
              <textarea
                ref={inputRef}
                className="prompt-input"
                placeholder="例如：帮我做一份关于新能源汽车市场的分析报告，要有科技感，包含市场规模、竞争格局、技术趋势和未来展望..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
              />
              <div className="input-footer">
                <span className="char-count">{prompt.length} 字</span>
                <button
                  className="send-btn"
                  onClick={startGeneration}
                  disabled={!prompt.trim()}
                >
                  <Send size={18} />
                  <span>开始生成</span>
                </button>
              </div>
            </div>
          </div>

          <div className="options-row">
            {/* Style Presets */}
            <div className="option-group">
              <div className="option-label">
                <Palette size={16} />
                <span>风格选择</span>
              </div>
              <div className="style-options">
                {STYLE_PRESETS.map((s) => (
                  <button
                    key={s.id}
                    className={`style-option ${selectedStyle === s.id ? 'active' : ''}`}
                    onClick={() => setSelectedStyle(s.id)}
                  >
                    <div className="style-preview" style={{ background: s.gradient }} />
                    <span className="style-emoji">{s.emoji}</span>
                    <span className="style-name">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Slide Count */}
            <div className="option-group slide-count-section">
              <div className="option-label">
                <Layout size={16} />
                <span>页数设定</span>
              </div>
              <div className="count-control">
                <button
                  className="count-btn"
                  onClick={() => setSlideCount(Math.max(3, slideCount - 1))}
                >
                  −
                </button>
                <span className="count-value">{slideCount}</span>
                <button
                  className="count-btn"
                  onClick={() => setSlideCount(Math.min(20, slideCount + 1))}
                >
                  +
                </button>
                <span className="count-label">页</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === Preview Phase === */}
      {phase === 'preview' && (
        <div className="preview-phase">
          <div className="preview-container">
            {/* Main Preview */}
            <div className="main-preview">
              <div className="preview-slide glass">
                <SlideThumb slide={slides[currentSlide] || MOCK_SLIDES[0]} index={currentSlide} />
              </div>

              <div className="slide-nav">
                <button
                  className="slide-nav-btn"
                  onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                  disabled={currentSlide === 0}
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="slide-counter">
                  {currentSlide + 1} / {slides.length}
                </span>
                <button
                  className="slide-nav-btn"
                  onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                  disabled={currentSlide === slides.length - 1}
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="preview-actions">
                <button className="action-btn" onClick={() => regenerateSlide(currentSlide)}>
                  <RefreshCw size={16} />
                  重新生成此页
                </button>
                <button className="action-btn">
                  <FileText size={16} />
                  编辑 Prompt
                </button>
              </div>
            </div>

            {/* Slide Filmstrip */}
            <div className="filmstrip">
              <div className="filmstrip-header">
                <Layers size={16} />
                <span>全部页面</span>
              </div>
              <div className="filmstrip-list">
                {slides.map((slide, i) => (
                  <button
                    key={slide.id}
                    className={`slide-card ${currentSlide === i ? 'active' : ''}`}
                    onClick={() => setCurrentSlide(i)}
                  >
                    <div className="slide-card-thumb">
                      <SlideThumb slide={slide} index={i} />
                    </div>
                    <div className="slide-card-info">
                      <span className="slide-card-num">{i + 1}</span>
                      <span className="slide-card-title">{slide.title}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="filmstrip-actions">
                <button className="btn-primary btn-sm btn-full">
                  <Download size={16} />
                  导出 PPTX
                </button>
                <button className="action-btn btn-full" onClick={goBack}>
                  <RotateCcw size={16} />
                  重新开始
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
