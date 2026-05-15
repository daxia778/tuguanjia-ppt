import { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Lenis from 'lenis'
import {
  Sparkles, Zap, Layers, ArrowRight, Wand2,
  FileDown, Eye, ChevronDown, ArrowUpRight
} from 'lucide-react'
import ILLUSTRATIONS from '../components/CardIllustrations'
import './LandingPage.css'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/* ─── Data ─── */
const FEATURES = [
  {
    icon: <Wand2 size={28} />,
    title: '自然语言驱动',
    desc: '输入任意主题，AI 自动理解意图，智能拆分为多页 PPT 结构，从模糊描述到清晰大纲',
    color: '#6366f1',
    tag: '核心引擎',
  },
  {
    icon: <Layers size={28} />,
    title: '逐页精准生图',
    desc: '基于 GPT Image-2 为每一页生成精美的全画幅视觉设计，2K 分辨率旗舰品质',
    color: '#ec4899',
    tag: '视觉生成',
  },
  {
    icon: <Eye size={28} />,
    title: '实时预览微调',
    desc: '逐页预览生成结果，不满意可单独重新生成或修改提示词，精确到每一页',
    color: '#06b6d4',
    tag: '交互编辑',
  },
  {
    icon: <FileDown size={28} />,
    title: '一键导出 PPTX',
    desc: '所有页面确认后，一键打包下载标准 .pptx 格式文件，直接用于演示',
    color: '#10b981',
    tag: '输出交付',
  },
]

const SHOWCASE_ITEMS = [
  { title: '科技发布会', sub: '深色科技主题 · 8页', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { title: '年度报告', sub: '数据驱动 · 12页', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
  { title: '产品介绍', sub: '简约商务 · 10页', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
  { title: '市场分析', sub: '趋势洞察 · 8页', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
  { title: '商业计划', sub: '路演级别 · 15页', gradient: 'linear-gradient(135deg, #fa709a, #fee140)' },
]

export default function LandingPage() {
  const containerRef = useRef(null)
  const navigate = useNavigate()

  /* ─── Lenis smooth scroll, synced with GSAP ticker ─── */
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    // Sync Lenis with GSAP ticker for frame-perfect animation
    const onRaf = (time) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(onRaf)
    gsap.ticker.lagSmoothing(0)

    // Tell ScrollTrigger to use Lenis's scroll position
    lenis.on('scroll', ScrollTrigger.update)

    // Handle resize
    const onResize = () => {
      ScrollTrigger.refresh()
    }
    window.addEventListener('resize', onResize)

    return () => {
      gsap.ticker.remove(onRaf)
      window.removeEventListener('resize', onResize)
      lenis.destroy()
    }
  }, [])

  /* ─── GSAP ScrollTrigger animations ─── */
  useGSAP(() => {
    /* ── Hero entrance ── */
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    heroTl
      .fromTo('.hero-badge', { y: 30, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.6 })
      .fromTo('.hero-title-line', { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.15 }, '-=0.3')
      .fromTo('.hero-subtitle', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.4')
      .fromTo('.hero-cta-group', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.2')
      .fromTo('.hero-stats .stat-item', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.1 }, '-=0.2')
      .fromTo('.scroll-hint', { opacity: 0 }, { opacity: 1, duration: 0.5 }, '-=0.1')

    // Floating scroll indicator
    gsap.to('.scroll-hint-icon', {
      y: 8, duration: 1.2, repeat: -1, yoyo: true, ease: 'sine.inOut',
    })

    /* ── Hero parallax fade out on scroll ── */
    gsap.to('.hero-content', {
      y: -100,
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: '60% top',
        scrub: 1,
      }
    })

    /* ── Ambient orb floating ── */
    gsap.to('.bg-orb-1', { x: 40, y: 30, duration: 8, repeat: -1, yoyo: true, ease: 'sine.inOut' })
    gsap.to('.bg-orb-2', { x: -30, y: -40, duration: 10, repeat: -1, yoyo: true, ease: 'sine.inOut' })
    gsap.to('.bg-orb-3', { x: 25, y: -20, duration: 12, repeat: -1, yoyo: true, ease: 'sine.inOut' })

    /* ── Showcase cards — page-flip style (slide up + fade out) ── */
    const cards = gsap.utils.toArray('.showcase-card')
    const totalCards = cards.length

    // Pin the showcase section for the entire flip sequence
    ScrollTrigger.create({
      trigger: '.showcase-section',
      start: 'top top',
      end: () => `+=${totalCards * 100}vh`,
      pin: '.showcase-pin',
      pinSpacing: true,
    })

    // Hide ALL cards except the first one using display
    cards.forEach((card, i) => {
      gsap.set(card, {
        display: i === 0 ? 'block' : 'none',
        opacity: i === 0 ? 1 : 0,
        yPercent: 0,
      })
    })

    // For each transition: fade out current card, fade in next card
    cards.forEach((card, i) => {
      if (i < totalCards - 1) {
        const nextCard = cards[i + 1]
        const segStart = i / totalCards
        const segEnd = (i + 1) / totalCards

        ScrollTrigger.create({
          trigger: '.showcase-section',
          start: () => `${segStart * 100}% top`,
          end: () => `${segEnd * 100}% top`,
          scrub: 0.3,
          onUpdate: (self) => {
            const p = self.progress

            if (p <= 0.5) {
              // Phase 1: Current card slides up and fades out
              const exitP = p / 0.5 // 0→1 during first half
              gsap.set(card, {
                display: 'block',
                yPercent: -exitP * 30,
                opacity: 1 - exitP,
                scale: 1 - exitP * 0.03,
              })
              // Next card stays hidden
              gsap.set(nextCard, { display: 'none', opacity: 0 })
            } else {
              // Phase 2: Current card is gone, next card fades in
              const enterP = (p - 0.5) / 0.5 // 0→1 during second half
              gsap.set(card, { display: 'none', opacity: 0 })
              gsap.set(nextCard, {
                display: 'block',
                opacity: enterP,
                scale: 0.97 + enterP * 0.03,
                yPercent: (1 - enterP) * 10,
              })
            }
          }
        })
      }
    })

    /* ── Feature cards stagger reveal on scroll ── */
    gsap.utils.toArray('.feature-card').forEach((card, i) => {
      gsap.fromTo(card,
        { y: 80, opacity: 0, scale: 0.92 },
        {
          y: 0, opacity: 1, scale: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            end: 'top 60%',
            toggleActions: 'play none none reverse',
          },
          delay: i * 0.05,
        }
      )
    })

    /* ── Workflow steps — reveal with connector animation ── */
    gsap.utils.toArray('.wf-step').forEach((step) => {
      gsap.fromTo(step,
        { x: -60, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
          scrollTrigger: {
            trigger: step,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          }
        }
      )
    })

    // Connector lines grow on scroll
    gsap.utils.toArray('.wf-connector-line').forEach((line) => {
      gsap.fromTo(line,
        { scaleY: 0 },
        {
          scaleY: 1, duration: 0.5, ease: 'power2.out',
          scrollTrigger: {
            trigger: line,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          }
        }
      )
    })

    /* ── CTA section reveal ── */
    gsap.fromTo('.cta-card', {
      y: 60, opacity: 0, scale: 0.95,
    }, {
      y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out',
      scrollTrigger: {
        trigger: '.cta-section',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      }
    })

  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="landing-page">
      {/* ===== Navigation ===== */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-brand">
            <div className="nav-logo"><Sparkles size={18} /></div>
            <span className="nav-name">SlideForge</span>
          </div>
          <div className="nav-links">
            <a href="#showcase">案例</a>
            <a href="#features">功能</a>
            <a href="#workflow">流程</a>
            <button className="nav-cta" onClick={() => navigate('/create')}>
              开始创作 <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* ===== Hero ===== */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Zap size={14} />
            <span>GPT Image-2 · 2K Resolution · Agentic Reasoning</span>
          </div>

          <h1 className="hero-title">
            <span className="hero-title-line">用一句话</span>
            <span className="hero-title-line hero-title-gradient">创造整份演示文稿</span>
          </h1>

          <p className="hero-subtitle">
            输入你的想法，AI 自动理解、拆页、设计、出图<br />
            从灵感到成品 PPT，只需一杯咖啡的时间
          </p>

          <div className="hero-cta-group">
            <button className="btn-primary" onClick={() => navigate('/create')}>
              <Sparkles size={18} />
              立即体验
            </button>
            <a href="#showcase" className="btn-ghost">
              查看案例 <ArrowUpRight size={16} />
            </a>
          </div>

          <div className="hero-stats">
            {[
              { val: '5s', label: '单页生成' },
              { val: '¥0.3', label: '单份成本' },
              { val: '2K', label: '输出分辨率' },
              { val: '20+', label: '风格模板' },
            ].map((s, i) => (
              <div key={i} className="stat-item">
                <span className="stat-val">{s.val}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="scroll-hint">
          <span>向下探索</span>
          <ChevronDown size={16} className="scroll-hint-icon" />
        </div>
      </section>

      {/* ===== Showcase — Stacked Cards ===== */}
      <section id="showcase" className="showcase-section">
        <div className="showcase-pin">
          <div className="showcase-header">
            <span className="section-tag">精选案例</span>
            <h2>AI 生成的 <span className="gradient-text">真实 PPT 效果</span></h2>
          </div>
          <div className="showcase-stack">
            {SHOWCASE_ITEMS.map((item, i) => {
              const Illustration = ILLUSTRATIONS[i]
              return (
                <div key={i} className="showcase-card" style={{ '--card-gradient': item.gradient }}>
                  <div className="showcase-card-bg" style={{ background: item.gradient }} />
                  <div className="showcase-card-illustration">
                    <Illustration />
                  </div>
                  <div className="showcase-card-content">
                    <span className="showcase-card-num">0{i + 1}</span>
                    <h3>{item.title}</h3>
                    <div className="showcase-card-meta">
                      <span>{item.sub}</span>
                      <span className="showcase-card-badge">AI 生成</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== Features ===== */}
      <section id="features" className="features-section">
        <div className="section-header">
          <span className="section-tag">核心能力</span>
          <h2>重新定义 <span className="gradient-text">PPT 创作方式</span></h2>
          <p>从 prompt 到 .pptx，全链路 AI 驱动</p>
        </div>

        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-card-glow" style={{ '--glow-color': f.color }} />
              <div className="feature-card-inner">
                <div className="feature-top">
                  <div className="feature-icon" style={{ '--ic': f.color }}>
                    {f.icon}
                  </div>
                  <span className="feature-tag" style={{ '--tc': f.color }}>{f.tag}</span>
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Workflow ===== */}
      <section id="workflow" className="workflow-section">
        <div className="section-header">
          <span className="section-tag">工作流程</span>
          <h2>三步完成 <span className="gradient-text">专业级演示</span></h2>
        </div>

        <div className="workflow-timeline">
          {/* Step 1 */}
          <div className="wf-step">
            <div className="wf-num">01</div>
            <div className="wf-body">
              <h3>描述你的主题</h3>
              <p>用自然语言输入 PPT 主题、风格和页数。可以很详细，也可以非常简单。</p>
              <div className="wf-example">
                <code>"帮我做一份10页的新能源汽车市场分析报告，科技感风格，深色主题"</code>
              </div>
            </div>
          </div>

          <div className="wf-connector">
            <div className="wf-connector-line" />
            <div className="wf-connector-dot" />
          </div>

          {/* Step 2 */}
          <div className="wf-step">
            <div className="wf-num">02</div>
            <div className="wf-body">
              <h3>AI 智能拆解 & 生图</h3>
              <p>AI 自动规划每一页的标题、内容、布局，然后调用 GPT Image-2 为每页生成精美视觉设计。</p>
              <div className="wf-tags">
                {['封面页', '目录页', '内容页 ×6', '数据页', '结尾页'].map((t, i) => (
                  <span key={i} className="wf-tag">{t}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="wf-connector">
            <div className="wf-connector-line" />
            <div className="wf-connector-dot" />
          </div>

          {/* Step 3 */}
          <div className="wf-step">
            <div className="wf-num">03</div>
            <div className="wf-body">
              <h3>预览、微调、下载</h3>
              <p>逐页预览所有生成结果，不满意的页面可以单独重新生成。最后一键导出标准 .pptx 文件。</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="cta-section">
        <div className="cta-card">
          <div className="cta-glow" />
          <h2>准备好让 AI 帮你做 PPT 了吗？</h2>
          <p>团队内部工具，无需注册，即开即用</p>
          <button className="btn-primary btn-lg" onClick={() => navigate('/create')}>
            <Sparkles size={20} /> 开始创作第一份 PPT
          </button>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <Sparkles size={14} /> <span>SlideForge</span>
          </div>
          <span className="footer-copy">AI-Powered Presentation Designer · Internal Tool</span>
        </div>
      </footer>
    </div>
  )
}
