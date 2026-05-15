/**
 * SVG line-art illustrations for showcase cards.
 * Minimalist, elegant stroke-only designs that look like PPT slide content.
 */

/* Shared style props */
const S = {
  stroke: 'rgba(255,255,255,0.35)',
  strokeWidth: 1.2,
  fill: 'none',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}
const Sh = { ...S, stroke: 'rgba(255,255,255,0.18)' }  // lighter helper lines
const Sa = { ...S, stroke: 'rgba(255,255,255,0.5)' }    // accent lines

/** 01 — 科技发布会: circuit board + podium */
export function TechLaunchSVG() {
  return (
    <svg viewBox="0 0 800 450" className="card-illustration">
      {/* Grid dots */}
      {Array.from({ length: 8 }, (_, r) =>
        Array.from({ length: 14 }, (_, c) => (
          <circle key={`${r}-${c}`} cx={60 + c * 50} cy={60 + r * 45} r="1.2" fill="rgba(255,255,255,0.08)" />
        ))
      )}
      {/* Circuit lines */}
      <polyline points="160,150 260,150 260,200 360,200" {...S} />
      <polyline points="360,200 360,150 460,150 460,240" {...S} />
      <polyline points="460,240 560,240 560,180" {...S} />
      <circle cx="260" cy="200" r="4" {...Sa} />
      <circle cx="360" cy="200" r="4" {...Sa} />
      <circle cx="460" cy="240" r="4" {...Sa} />
      <circle cx="560" cy="180" r="4" {...Sa} />
      {/* Chip outline */}
      <rect x="290" y="100" width="80" height="60" rx="6" {...Sa} />
      <line x1="290" y1="115" x2="270" y2="115" {...Sh} />
      <line x1="290" y1="130" x2="270" y2="130" {...Sh} />
      <line x1="290" y1="145" x2="270" y2="145" {...Sh} />
      <line x1="370" y1="115" x2="390" y2="115" {...Sh} />
      <line x1="370" y1="130" x2="390" y2="130" {...Sh} />
      <line x1="370" y1="145" x2="390" y2="145" {...Sh} />
      {/* Title placeholder lines */}
      <rect x="80" y="300" width="240" height="8" rx="4" fill="rgba(255,255,255,0.12)" />
      <rect x="80" y="320" width="160" height="6" rx="3" fill="rgba(255,255,255,0.06)" />
      {/* Decorative wave */}
      <path d="M500,300 Q540,270 580,300 Q620,330 660,300 Q700,270 740,300" {...Sh} />
    </svg>
  )
}

/** 02 — 年度报告: bar chart + line graph + pie */
export function AnnualReportSVG() {
  return (
    <svg viewBox="0 0 800 450" className="card-illustration">
      {/* Bar chart */}
      <line x1="100" y1="320" x2="380" y2="320" {...Sh} />
      <line x1="100" y1="320" x2="100" y2="100" {...Sh} />
      {[140, 190, 240, 290, 340].map((x, i) => {
        const h = [120, 180, 90, 200, 150][i]
        return <rect key={i} x={x} y={320 - h} width="30" height={h} rx="3" 
          fill={`rgba(255,255,255,${0.06 + i * 0.02})`} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      })}
      {/* Y-axis labels */}
      {[0, 1, 2, 3, 4].map(i => (
        <line key={i} x1="95" y1={320 - i * 55} x2="380" y2={320 - i * 55} {...{ ...Sh, stroke: 'rgba(255,255,255,0.04)' }} />
      ))}
      {/* Line graph trend */}
      <polyline points="140,200 190,140 240,230 290,120 340,170" {...Sa} />
      <circle cx="290" cy="120" r="4" {...Sa} />
      {/* Pie chart */}
      <circle cx="560" cy="180" r="70" {...Sh} />
      <path d="M560,180 L560,110 A70,70 0 0,1 620,145 Z" fill="rgba(255,255,255,0.06)" {...S} />
      <path d="M560,180 L620,145 A70,70 0 0,1 600,245 Z" fill="rgba(255,255,255,0.04)" {...S} />
      {/* Legend */}
      <rect x="480" y="290" width="12" height="4" rx="2" fill="rgba(255,255,255,0.2)" />
      <rect x="500" y="288" width="60" height="6" rx="3" fill="rgba(255,255,255,0.08)" />
      <rect x="480" y="308" width="12" height="4" rx="2" fill="rgba(255,255,255,0.12)" />
      <rect x="500" y="306" width="50" height="6" rx="3" fill="rgba(255,255,255,0.08)" />
      {/* Title area */}
      <rect x="480" y="100" width="180" height="8" rx="4" fill="rgba(255,255,255,0.1)" />
      <rect x="480" y="118" width="120" height="5" rx="2.5" fill="rgba(255,255,255,0.05)" />
    </svg>
  )
}

/** 03 — 产品介绍: phone mockup + feature callouts */
export function ProductIntroSVG() {
  return (
    <svg viewBox="0 0 800 450" className="card-illustration">
      {/* Phone outline */}
      <rect x="320" y="60" width="160" height="300" rx="20" {...Sa} />
      <rect x="336" y="80" width="128" height="260" rx="4" fill="rgba(255,255,255,0.03)" />
      <circle cx="400" cy="370" r="4" {...Sh} />
      <rect x="375" y="68" width="50" height="4" rx="2" fill="rgba(255,255,255,0.1)" />
      {/* Screen content lines */}
      <rect x="350" y="100" width="100" height="6" rx="3" fill="rgba(255,255,255,0.1)" />
      <rect x="350" y="115" width="80" height="4" rx="2" fill="rgba(255,255,255,0.05)" />
      <rect x="346" y="135" width="108" height="60" rx="6" fill="rgba(255,255,255,0.04)" />
      <rect x="350" y="210" width="100" height="4" rx="2" fill="rgba(255,255,255,0.06)" />
      <rect x="350" y="222" width="80" height="4" rx="2" fill="rgba(255,255,255,0.04)" />
      <rect x="350" y="234" width="90" height="4" rx="2" fill="rgba(255,255,255,0.04)" />
      {/* Feature callout lines - left */}
      <line x1="310" y1="120" x2="200" y2="100" {...Sh} />
      <circle cx="200" cy="100" r="3" {...Sa} />
      <rect x="100" y="92" width="90" height="6" rx="3" fill="rgba(255,255,255,0.08)" />
      <rect x="110" y="104" width="65" height="4" rx="2" fill="rgba(255,255,255,0.04)" />
      <line x1="310" y1="200" x2="200" y2="200" {...Sh} />
      <circle cx="200" cy="200" r="3" {...Sa} />
      <rect x="100" y="192" width="90" height="6" rx="3" fill="rgba(255,255,255,0.08)" />
      <rect x="110" y="204" width="70" height="4" rx="2" fill="rgba(255,255,255,0.04)" />
      {/* Feature callout lines - right */}
      <line x1="490" y1="140" x2="580" y2="120" {...Sh} />
      <circle cx="580" cy="120" r="3" {...Sa} />
      <rect x="590" y="112" width="90" height="6" rx="3" fill="rgba(255,255,255,0.08)" />
      <rect x="595" y="124" width="60" height="4" rx="2" fill="rgba(255,255,255,0.04)" />
      <line x1="490" y1="230" x2="580" y2="230" {...Sh} />
      <circle cx="580" cy="230" r="3" {...Sa} />
      <rect x="590" y="222" width="80" height="6" rx="3" fill="rgba(255,255,255,0.08)" />
      <rect x="595" y="234" width="55" height="4" rx="2" fill="rgba(255,255,255,0.04)" />
    </svg>
  )
}

/** 04 — 市场分析: trend line + data annotations + map dots */
export function MarketAnalysisSVG() {
  return (
    <svg viewBox="0 0 800 450" className="card-illustration">
      {/* Axis */}
      <line x1="80" y1="340" x2="720" y2="340" {...Sh} />
      <line x1="80" y1="340" x2="80" y2="80" {...Sh} />
      {/* Grid lines */}
      {[0, 1, 2, 3, 4, 5].map(i => (
        <line key={i} x1="80" y1={340 - i * 52} x2="720" y2={340 - i * 52}
          stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
      ))}
      {/* Main trend line */}
      <polyline points="100,300 180,280 260,250 340,190 420,210 500,140 580,120 660,90"
        {...Sa} strokeWidth="1.8" />
      {/* Area fill */}
      <path d="M100,300 L180,280 L260,250 L340,190 L420,210 L500,140 L580,120 L660,90 L660,340 L100,340 Z"
        fill="rgba(255,255,255,0.03)" />
      {/* Data points */}
      {[[100,300],[180,280],[260,250],[340,190],[420,210],[500,140],[580,120],[660,90]].map(([x,y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
      ))}
      {/* Annotation callout */}
      <line x1="500" y1="140" x2="540" y2="100" {...S} />
      <rect x="545" y="88" width="70" height="24" rx="6" fill="rgba(255,255,255,0.06)" {...S} />
      <rect x="555" y="96" width="50" height="4" rx="2" fill="rgba(255,255,255,0.15)" />
      {/* Secondary dashed line */}
      <polyline points="100,310 180,300 260,290 340,260 420,270 500,240 580,220 660,200"
        stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 4" fill="none" />
      {/* Legend */}
      <line x1="110" y1="370" x2="140" y2="370" {...Sa} />
      <rect x="148" y="367" width="50" height="5" rx="2.5" fill="rgba(255,255,255,0.08)" />
      <line x1="220" y1="370" x2="250" y2="370" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 4" />
      <rect x="258" y="367" width="50" height="5" rx="2.5" fill="rgba(255,255,255,0.08)" />
    </svg>
  )
}

/** 05 — 商业计划: flowchart + milestone timeline */
export function BusinessPlanSVG() {
  return (
    <svg viewBox="0 0 800 450" className="card-illustration">
      {/* Flowchart */}
      <rect x="300" y="60" width="120" height="50" rx="8" {...Sa} />
      <rect x="315" y="76" width="90" height="5" rx="2.5" fill="rgba(255,255,255,0.1)" />
      <line x1="360" y1="110" x2="360" y2="140" {...S} />
      {/* Diamond decision */}
      <polygon points="360,140 400,170 360,200 320,170" {...Sa} />
      <rect x="340" y="162" width="40" height="4" rx="2" fill="rgba(255,255,255,0.08)" />
      {/* Branches */}
      <line x1="320" y1="170" x2="200" y2="170" {...S} />
      <line x1="200" y1="170" x2="200" y2="220" {...S} />
      <rect x="150" y="220" width="100" height="45" rx="8" {...Sh} />
      <rect x="165" y="236" width="70" height="4" rx="2" fill="rgba(255,255,255,0.06)" />
      <line x1="400" y1="170" x2="520" y2="170" {...S} />
      <line x1="520" y1="170" x2="520" y2="220" {...S} />
      <rect x="470" y="220" width="100" height="45" rx="8" {...Sh} />
      <rect x="485" y="236" width="70" height="4" rx="2" fill="rgba(255,255,255,0.06)" />
      <line x1="360" y1="200" x2="360" y2="240" {...S} />
      <rect x="310" y="240" width="100" height="45" rx="8" {...S} />
      <rect x="325" y="256" width="70" height="4" rx="2" fill="rgba(255,255,255,0.08)" />
      {/* Timeline at bottom */}
      <line x1="100" y1="360" x2="700" y2="360" {...Sh} />
      {[160, 280, 400, 520, 640].map((x, i) => (
        <g key={i}>
          <circle cx={x} cy="360" r="5" fill={i < 3 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)'}
            stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <rect x={x - 20} y="374" width="40" height="4" rx="2" fill="rgba(255,255,255,0.06)" />
        </g>
      ))}
      {/* Arrow heads */}
      <polygon points="700,357 708,360 700,363" fill="rgba(255,255,255,0.15)" />
    </svg>
  )
}

/** 06 — 教育课件: book + lightbulb + formula + tree */
export function EducationSVG() {
  return (
    <svg viewBox="0 0 800 450" className="card-illustration">
      {/* Open book */}
      <path d="M300,280 Q300,240 340,220 L400,200 L460,220 Q500,240 500,280" {...Sa} />
      <line x1="400" y1="200" x2="400" y2="290" {...S} />
      {/* Book pages - left */}
      <line x1="320" y1="240" x2="390" y2="218" {...Sh} />
      <line x1="315" y1="255" x2="388" y2="234" {...Sh} />
      <line x1="312" y1="270" x2="392" y2="250" {...Sh} />
      {/* Book pages - right */}
      <line x1="480" y1="240" x2="412" y2="218" {...Sh} />
      <line x1="485" y1="255" x2="414" y2="234" {...Sh} />
      <line x1="488" y1="270" x2="410" y2="250" {...Sh} />
      {/* Lightbulb - top left */}
      <circle cx="160" cy="130" r="28" {...Sa} />
      <line x1="148" y1="160" x2="172" y2="160" {...S} />
      <line x1="150" y1="168" x2="170" y2="168" {...S} />
      <path d="M152,130 Q160,110 168,130" {...S} />
      {/* Rays */}
      <line x1="160" y1="94" x2="160" y2="82" {...Sh} />
      <line x1="130" y1="105" x2="122" y2="96" {...Sh} />
      <line x1="190" y1="105" x2="198" y2="96" {...Sh} />
      <line x1="125" y1="130" x2="115" y2="130" {...Sh} />
      <line x1="195" y1="130" x2="205" y2="130" {...Sh} />
      {/* Formula area - top right */}
      <rect x="530" y="90" width="180" height="70" rx="10" fill="rgba(255,255,255,0.02)" {...Sh} />
      <text x="560" y="120" fill="rgba(255,255,255,0.15)" fontSize="14" fontFamily="serif" fontStyle="italic">E = mc²</text>
      <text x="560" y="142" fill="rgba(255,255,255,0.08)" fontSize="10" fontFamily="serif">∫ f(x)dx = F(b) - F(a)</text>
      {/* Small tree - right */}
      <line x1="640" y1="340" x2="640" y2="260" {...S} />
      <circle cx="640" cy="240" r="25" {...Sh} />
      <circle cx="620" cy="255" r="18" {...Sh} />
      <circle cx="660" cy="260" r="16" {...Sh} />
      {/* Small person silhouette - left */}
      <circle cx="120" cy="290" r="10" {...Sh} />
      <line x1="120" y1="300" x2="120" y2="340" {...Sh} />
      <line x1="120" y1="310" x2="105" y2="325" {...Sh} />
      <line x1="120" y1="310" x2="135" y2="325" {...Sh} />
      <line x1="120" y1="340" x2="108" y2="360" {...Sh} />
      <line x1="120" y1="340" x2="132" y2="360" {...Sh} />
      {/* Graduation cap */}
      <polygon points="400,100 440,115 400,130 360,115" fill="rgba(255,255,255,0.06)" {...S} />
      <line x1="400" y1="100" x2="400" y2="88" {...S} />
      <line x1="440" y1="115" x2="440" y2="135" {...Sh} />
      <path d="M375,120 Q400,140 425,120" {...Sh} />
    </svg>
  )
}

const ILLUSTRATIONS = [
  TechLaunchSVG,
  AnnualReportSVG,
  ProductIntroSVG,
  MarketAnalysisSVG,
  BusinessPlanSVG,
  EducationSVG,
]

export default ILLUSTRATIONS
