<template>
  <div class="home-page">
    
    <!-- Hero Section -->
    <section class="hero" ref="heroSection">
      <!-- Subtle dot pattern background -->
      <div class="hero-grid-bg"></div>
      <div class="hero-bg-glow"></div>
      
      <div class="container hero-content" ref="heroContent">
        <div class="hero-badge badge badge-brand" ref="heroBadge">
          <span>全新 AI 引擎 v2.0 发布</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </div>
        <h1 class="hero-title" ref="heroTitle">
          定义下一代演示文稿<br/>
          <span class="text-gradient">AI 生产力标准</span>
        </h1>
        <p class="hero-desc" ref="heroDesc">
          AIPPT 将生成式 AI 的极致速度与顶尖商业设计系统完美融合。<br/>
          输入核心思想，30 秒即可生成具备专业排版的原生 PPTX 文稿。
        </p>
        <div class="hero-actions" ref="heroActions">
          <router-link to="/generate" class="btn btn-primary btn-lg">
            免费开始创建
          </router-link>
          <a href="#features" class="btn btn-secondary btn-lg">
            探索核心功能
          </a>
        </div>
        
        <!-- Hero Visual Mockup -->
        <div class="hero-visual-wrapper" ref="heroVisual">
          <div class="hero-visual-mock modern-card">
            <div class="mock-topbar">
              <div class="mock-dots">
                <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
              </div>
              <div class="mock-tabs">
                <div class="mock-tab active">AIPPT Workspace</div>
                <div class="mock-tab">Preview</div>
              </div>
            </div>
            <div class="mock-workspace">
              <div class="mock-sidebar">
                <div class="mock-line short"></div>
                <div class="mock-line"></div>
                <div class="mock-line"></div>
                <div class="mock-line"></div>
              </div>
              <div class="mock-main-area">
                <div class="mock-slide-lg">
                  <div class="mock-slide-title">2026 AI 行业发展趋势</div>
                  <div class="mock-slide-chart">
                    <div class="bar bar-1"></div>
                    <div class="bar bar-2"></div>
                    <div class="bar bar-3"></div>
                    <div class="bar bar-4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Decorative floating elements -->
          <div class="float-element float-1" ref="float1">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <div class="float-element float-2" ref="float2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-item" v-for="(stat, i) in stats" :key="i">
            <div class="stat-number text-gradient">{{ stat.num }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Clean Features Grid -->
    <section class="features-section" id="features">
      <div class="container">
        <div class="section-header" ref="featuresHeader">
          <h2 class="section-title">专为现代职场打造</h2>
          <p class="section-sub">告别繁琐的排版和找图，把时间留给真正有价值的思考。</p>
        </div>
        
        <div class="features-grid">
          <div class="feature-card modern-card" v-for="(f, i) in features" :key="i" ref="featureCards">
            <div class="feature-icon">
              <div v-html="f.icon"></div>
            </div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Workflow Section -->
    <section class="workflow-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">灵感到交付，只需三步</h2>
          <p class="section-sub">极简的工作流，让你随时随地捕捉一闪而过的商业灵感。</p>
        </div>
        <div class="workflow-steps">
          <div class="step-item" v-for="(step, i) in steps" :key="i">
            <div class="step-number">{{ i + 1 }}</div>
            <h3>{{ step.title }}</h3>
            <p>{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Seamless Integration / Showcase -->
    <section class="integration-section">
      <div class="container">
        <div class="integration-box modern-card" ref="integrationBox">
          <div class="integration-content">
            <h2>原生 PPTX 无缝导出</h2>
            <p>拒绝被封闭生态绑架。你生成的所有文稿均可直接下载为标准的 PowerPoint 格式。完美保留矢量形状、可编辑文本和原始排版，满足深度的二次编辑需求。</p>
            <ul class="integration-list">
              <li><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand-orange)" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg> 100% 原生矢量图表解析</li>
              <li><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand-orange)" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg> 字体与文字层完全可编辑</li>
              <li><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand-orange)" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg> 完美兼容 Office / WPS 生态</li>
            </ul>
          </div>
          <div class="integration-visual">
            <div class="mock-ui">
              <div class="mock-header">
                <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
                <span class="mock-title">presentation_vfinal.pptx</span>
              </div>
              <div class="mock-body">
                <div class="mock-slide animate-pulse-slow"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="testimonials-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">被顶尖团队所信赖</h2>
        </div>
        <div class="testimonials-grid">
          <div class="testimonial-card modern-card" v-for="(t, i) in testimonials" :key="i">
            <div class="stars">★★★★★</div>
            <p class="quote">"{{ t.quote }}"</p>
            <div class="author">
              <div class="author-avatar">{{ t.name.charAt(0) }}</div>
              <div class="author-info">
                <h4>{{ t.name }}</h4>
                <span>{{ t.role }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-wrap" ref="ctaWrap">
          <h2>准备好节省 80% 的工作时间了吗？</h2>
          <p>加入数万名专业人士的行列，体验下一代演示文稿的创作方式。</p>
          <component :is="userStore.isLoggedIn ? 'router-link' : 'a'" :to="userStore.isLoggedIn ? '/generate' : undefined" :href="userStore.isLoggedIn ? undefined : '/admin/login?from=user&action=register&redirect=/generate'" class="btn btn-primary btn-lg">
            {{ userStore.isLoggedIn ? '进入工作台' : '注册即领 30 免费积分' }}
          </component>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/store/user'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const userStore = useUserStore()

const stats = [
  { num: '30s', label: '平均生成速度' },
  { num: '10W+', label: '月活跃专业用户' },
  { num: '500+', label: '内置专业级版式' },
  { num: '100%', label: '原生格式兼容' }
]

const features = [
  { title: '智能语义排版引擎', desc: '系统能够深入理解你的大纲结构，自动计算视觉层级，并在每一页幻灯片上实现像素级的完美对齐。', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>' },
  { title: '上下文感知插图', desc: 'AIPPT 不仅生成文本，更会根据当前的商业语境，自动从海量优质矢量库中为你匹配最具表现力的插图。', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' },
  { title: '商业级色彩科学', desc: '抛弃过时的模板。我们内置了符合现代色彩理论的色板与阶梯式排版规范，确保最终呈现出顶尖咨询公司般的质感。', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>' }
]

const steps = [
  { title: '输入核心主题', desc: '用一句话或一段文字描述你想要的 PPT 内容，AI 将立刻构建完整的逻辑大纲。' },
  { title: '选择设计风格', desc: '从极简商务、赛博科技到深邃暗黑，挑选最契合你品牌或演讲场景的视觉主题。' },
  { title: '一键生成与导出', desc: '等待不到一分钟，即可下载包含精美排版和文字的 .pptx 源文件，随时进行最后微调。' }
]

const testimonials = [
  { quote: "这是我用过最接近人工排版水准的 AI 工具。生成的幻灯片结构清晰，颜色搭配非常克制、高级，完全可以直接拿去给客户提案。", name: "王先生", role: "某知名咨询公司 高级顾问" },
  { quote: "以前每周要花十几个小时在对齐文本框和找配图上。现在只需输入大纲，剩下的脏活累活全交给 AIPPT，极大地释放了我的生产力。", name: "林女士", role: "科技公司 产品总监" },
  { quote: "最让我惊喜的是它导出的 PPTX 格式是完全原生的。文字没有转曲，形状可以随意更换颜色，这对于需要后期二次编辑的我来说太友好了。", name: "张先生", role: "独立讲师 / 培训师" }
]

// Refs for GSAP
const heroSection = ref(null); const heroContent = ref(null)
const heroBadge = ref(null); const heroTitle = ref(null); const heroDesc = ref(null); const heroActions = ref(null)
const heroVisual = ref(null); const float1 = ref(null); const float2 = ref(null)
const featuresHeader = ref(null); const featureCards = ref([])
const integrationBox = ref(null)
const ctaWrap = ref(null)

let ctx: gsap.Context

onMounted(() => {
  ctx = gsap.context(() => {
    // Hero Entrance
    const tl = gsap.timeline()
    
    tl.from(heroBadge.value, { y: 20, opacity: 0, duration: 0.8, ease: 'power3.out' })
      .from(heroTitle.value, { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' }, "-=0.6")
      .from(heroDesc.value, { y: 20, opacity: 0, duration: 0.8, ease: 'power3.out' }, "-=0.6")
      .from(heroActions.value, { y: 20, opacity: 0, duration: 0.8, ease: 'power3.out' }, "-=0.6")
      
      // Hero Visual Entrance (slight upward reveal with 3D tilt effect)
      .from(heroVisual.value, { 
        y: 80, 
        opacity: 0, 
        rotationX: 10,
        scale: 0.95,
        transformPerspective: 1000,
        duration: 1.2, 
        ease: 'power3.out' 
      }, "-=0.6")

    // Subtle continuous floating animation for the mock UI
    gsap.to(heroVisual.value, {
      y: -10,
      duration: 3,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    })

    // Decorative floats
    gsap.to(float1.value, {
      y: -15, rotation: 5, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.5
    })
    gsap.to(float2.value, {
      y: 15, x: 5, duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1
    })

    // Stats Reveal
    gsap.from('.stat-item', {
      y: 30, opacity: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.stats-section', start: 'top 85%' }
    })

    // Features Reveal
    gsap.from(featuresHeader.value, {
      y: 30, opacity: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: featuresHeader.value, start: 'top 85%' }
    })
    
    gsap.from(featureCards.value, {
      y: 40, opacity: 0,
      duration: 0.8, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.features-grid', start: 'top 80%' }
    })
    
    // Workflow Reveal
    gsap.from('.step-item', {
      x: -20, opacity: 0, stagger: 0.15, duration: 0.6, ease: 'power2.out',
      scrollTrigger: { trigger: '.workflow-section', start: 'top 80%' }
    })

    // Integration Box
    gsap.from(integrationBox.value, {
      y: 50, opacity: 0, scale: 0.98,
      duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: integrationBox.value, start: 'top 85%' }
    })
    
    // Testimonials
    gsap.from('.testimonial-card', {
      y: 40, opacity: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.testimonials-section', start: 'top 80%' }
    })

    // CTA
    gsap.from(ctaWrap.value, {
      y: 40, opacity: 0,
      duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: ctaWrap.value, start: 'top 85%' }
    })
  })
})

onUnmounted(() => { ctx?.revert() })
</script>

<style scoped>
.home-page {
  background: var(--bg-primary);
}

/* Hero Section */
.hero {
  position: relative;
  /* Reduced top padding significantly to move content up */
  padding: calc(var(--space-6) + var(--header-height)) 0 0; 
  text-align: center;
  overflow: hidden;
}

/* Subtle dot grid for background texture to fill empty space */
.hero-grid-bg {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: radial-gradient(var(--border-color) 1px, transparent 1px);
  background-size: 24px 24px;
  opacity: 0.5;
  pointer-events: none;
  z-index: 0;
  mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%);
  -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%);
}

.hero-bg-glow {
  position: absolute;
  top: 0%;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 600px;
  background: var(--gradient-brave);
  filter: blur(150px);
  opacity: 0.08;
  z-index: 0;
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-badge {
  margin-bottom: var(--space-8);
  font-family: var(--font-sans);
}

.hero-title {
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -1.5px;
  margin-bottom: var(--space-6);
  color: var(--text-primary);
}

.hero-desc {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  line-height: 1.8;
  max-width: 680px;
  margin-bottom: var(--space-10);
}

.hero-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  margin-bottom: var(--space-16); /* Add margin before visual */
}

/* Hero Visual Mockup */
.hero-visual-wrapper {
  position: relative;
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  /* Push visual down so it sits on the edge of the section */
  transform: translateY(0);
}

.hero-visual-mock {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.02);
  border-radius: var(--radius-lg);
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom: none;
  overflow: hidden;
  height: 400px; /* Cut off at bottom */
  display: flex;
  flex-direction: column;
}

.mock-topbar {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: rgba(241, 245, 249, 0.8);
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.mock-dots {
  display: flex;
  gap: 6px;
  margin-right: 16px;
}
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot.red { background: #ef4444; }
.dot.yellow { background: #eab308; }
.dot.green { background: #22c55e; }

.mock-tabs {
  display: flex;
  gap: 8px;
}
.mock-tab {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  padding: 4px 12px;
  border-radius: var(--radius-sm);
}
.mock-tab.active {
  background: white;
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
}

.mock-workspace {
  display: flex;
  flex: 1;
  background: #f8fafc;
}

.mock-sidebar {
  width: 200px;
  border-right: 1px solid rgba(0,0,0,0.05);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(255,255,255,0.5);
}

.mock-line {
  height: 8px;
  border-radius: 4px;
  background: #e2e8f0;
  width: 100%;
}
.mock-line.short { width: 60%; margin-bottom: 12px; background: #cbd5e1;}

.mock-main-area {
  flex: 1;
  padding: 32px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.mock-slide-lg {
  width: 100%;
  max-width: 500px;
  aspect-ratio: 16/9;
  background: white;
  border-radius: 6px;
  box-shadow: var(--shadow-md);
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.mock-slide-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 24px;
  color: var(--text-primary);
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 8px;
  display: inline-block;
  align-self: flex-start;
}

.mock-slide-chart {
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: 16px;
  padding: 0 20px;
}

.bar {
  flex: 1;
  border-radius: 4px 4px 0 0;
  background: linear-gradient(to top, rgba(251, 84, 43, 0.2), rgba(251, 84, 43, 0.8));
}
.bar-1 { height: 40%; }
.bar-2 { height: 70%; }
.bar-3 { height: 50%; }
.bar-4 { height: 90%; background: var(--gradient-brave); }

/* Decorative Floats */
.float-element {
  position: absolute;
  width: 48px; height: 48px;
  border-radius: 12px;
  background: white;
  box-shadow: var(--shadow-lg);
  display: flex; align-items: center; justify-content: center;
  color: var(--brand-orange);
  z-index: 2;
}
.float-1 { top: -20px; left: -20px; transform: rotate(-10deg); }
.float-2 { bottom: 40px; right: -15px; color: #3b82f6; }


/* Stats Section */
.stats-section {
  padding: var(--space-12) 0;
  border-bottom: var(--border-subtle);
  background: var(--bg-primary);
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-8);
  text-align: center;
}
.stat-number {
  font-family: var(--font-display);
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 4px;
}
.stat-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: 500;
}

/* Features Section */
.features-section {
  padding: var(--space-24) 0 var(--space-12);
  background: var(--bg-primary);
}

.section-header {
  text-align: center;
  margin-bottom: var(--space-16);
}

.section-title {
  font-size: var(--text-4xl);
  font-weight: 800;
  letter-spacing: -1px;
}

.section-sub {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  margin-top: var(--space-3);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--space-8);
}

.feature-card {
  padding: var(--space-8);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.feature-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: rgba(251, 84, 43, 0.1);
  color: var(--brand-orange);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-6);
}

.feature-card h3 {
  font-size: var(--text-xl);
  font-weight: 700;
  margin-bottom: var(--space-3);
}

.feature-card p {
  color: var(--text-secondary);
  line-height: 1.6;
}

/* Workflow Section */
.workflow-section {
  padding: var(--space-12) 0;
  background: var(--bg-secondary);
}
.workflow-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-8);
}
.step-item {
  display: flex;
  flex-direction: column;
}
.step-number {
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--text-primary); color: white;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-weight: 700; font-size: var(--text-xl);
  margin-bottom: var(--space-4);
}
.step-item h3 { font-size: var(--text-xl); font-weight: 700; margin-bottom: var(--space-2); }
.step-item p { color: var(--text-secondary); line-height: 1.6; }


/* Integration Section */
.integration-section {
  padding: var(--space-24) 0;
}

.integration-box {
  display: flex;
  align-items: stretch;
  overflow: hidden;
  background: var(--bg-primary);
}

.integration-content {
  flex: 1;
  padding: var(--space-16);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.integration-content h2 {
  font-size: var(--text-3xl);
  font-weight: 800;
  letter-spacing: -0.5px;
  margin-bottom: var(--space-4);
}

.integration-content p {
  color: var(--text-secondary);
  font-size: var(--text-base);
  line-height: 1.7;
  margin-bottom: var(--space-8);
}

.integration-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.integration-list li {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-weight: 600;
  color: var(--text-primary);
}

.integration-visual {
  flex: 1;
  background: var(--bg-secondary);
  padding: var(--space-12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mock-ui {
  width: 100%;
  max-width: 440px;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.mock-header {
  height: 36px;
  background: #f1f5f9;
  border-bottom: var(--border-subtle);
  display: flex;
  align-items: center;
  padding: 0 var(--space-4);
  gap: 6px;
}

.mock-title { margin-left: auto; margin-right: auto; font-size: 11px; font-weight: 600; color: #94a3b8; }

.mock-body {
  padding: var(--space-6);
  background: #e2e8f0;
}

.mock-slide {
  width: 100%;
  aspect-ratio: 16/9;
  background: white;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
}

.animate-pulse-slow {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.85; }
}

/* Testimonials Section */
.testimonials-section {
  padding: var(--space-12) 0 var(--space-24);
}
.testimonials-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-6);
}
.testimonial-card {
  padding: var(--space-8); display: flex; flex-direction: column;
}
.stars { color: #eab308; margin-bottom: var(--space-4); letter-spacing: 2px; }
.quote { color: var(--text-primary); font-weight: 500; line-height: 1.7; flex: 1; margin-bottom: var(--space-6); }
.author { display: flex; align-items: center; gap: var(--space-3); }
.author-avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--brand-orange); }
.author-info h4 { font-size: var(--text-sm); margin-bottom: 2px; }
.author-info span { font-size: var(--text-xs); color: var(--text-secondary); }


/* CTA */
.cta-section {
  padding: var(--space-12) 0 var(--space-24);
  text-align: center;
}

.cta-wrap {
  max-width: 600px;
  margin: 0 auto;
}

.cta-wrap h2 {
  font-size: var(--text-4xl);
  font-weight: 800;
  letter-spacing: -1px;
  margin-bottom: var(--space-4);
}

.cta-wrap p {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  margin-bottom: var(--space-8);
}

@media (max-width: 1024px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-6); }
  .workflow-steps { grid-template-columns: 1fr; gap: var(--space-8); }
  .integration-box { flex-direction: column; }
  .integration-visual { padding: var(--space-8); }
  .testimonials-grid { grid-template-columns: 1fr; }
  .hero-visual-wrapper { padding: 0 var(--space-4); }
}
@media (max-width: 768px) {
  .hero-title { font-size: 2rem; }
  .mock-sidebar { display: none; }
}
</style>
