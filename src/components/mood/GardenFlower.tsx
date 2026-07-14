import type { MoodType } from '@/types';

interface GardenFlowerProps {
  moodType: MoodType;
  vitality: number;
  isWilt: boolean;
  size?: number;
  swayDelay?: number;
}

export default function GardenFlower({
  moodType,
  vitality,
  isWilt,
  size = 56,
  swayDelay = 0,
}: GardenFlowerProps) {
  const droopAngle = isWilt ? 25 : 0;
  const petalOpacity = isWilt ? 0.5 : 1;
  const vibrancy = 0.55 + vitality * 0.45;

  const stemColor = isWilt ? '#8a7e6a' : '#5a7a3a';
  const stemColor2 = isWilt ? '#6b5f4a' : '#4a6a2a';
  const leafColor = isWilt ? '#9a8a6a' : '#7a9a4a';
  const leafColor2 = isWilt ? '#7a6a5a' : '#5a8a3a';

  const baseStyle: React.CSSProperties = {
    display: 'block',
    transformOrigin: '50% 100%',
    filter: `drop-shadow(1px 2px 2px rgba(60,50,40,0.25)) saturate(${0.85 + vibrancy * 0.3})`,
  };

  switch (moodType) {
    case 'happy':
      return <CornPoppy size={size} droopAngle={droopAngle} petalOpacity={petalOpacity} vibrancy={vibrancy} stemColor={stemColor} stemColor2={stemColor2} leafColor={leafColor} leafColor2={leafColor2} swayDelay={swayDelay} style={baseStyle} />;
    case 'calm':
      return <Chamomile size={size} droopAngle={droopAngle} petalOpacity={petalOpacity} vibrancy={vibrancy} stemColor={stemColor} stemColor2={stemColor2} leafColor={leafColor} leafColor2={leafColor2} swayDelay={swayDelay} style={baseStyle} />;
    case 'anxious':
      return <Lavender size={size} droopAngle={droopAngle} petalOpacity={petalOpacity} vibrancy={vibrancy} stemColor={stemColor} stemColor2={stemColor2} leafColor={leafColor} leafColor2={leafColor2} swayDelay={swayDelay} style={baseStyle} />;
    case 'sad':
      return <Daisy size={size} droopAngle={droopAngle + 12} petalOpacity={petalOpacity} vibrancy={vibrancy} stemColor={stemColor} stemColor2={stemColor2} leafColor={leafColor} leafColor2={leafColor2} swayDelay={swayDelay} style={baseStyle} />;
    case 'angry':
      return <Thistle size={size} droopAngle={droopAngle} petalOpacity={petalOpacity} vibrancy={vibrancy} stemColor={stemColor} stemColor2={stemColor2} leafColor={leafColor} leafColor2={leafColor2} swayDelay={swayDelay} style={baseStyle} />;
    case 'tired':
      return <Dandelion size={size} droopAngle={droopAngle + 8} petalOpacity={petalOpacity} vibrancy={vibrancy} stemColor={stemColor} stemColor2={stemColor2} leafColor={leafColor} leafColor2={leafColor2} swayDelay={swayDelay} style={baseStyle} />;
    default:
      return null;
  }
}

interface WildFlowerProps {
  size: number;
  droopAngle: number;
  petalOpacity: number;
  vibrancy: number;
  stemColor: string;
  stemColor2: string;
  leafColor: string;
  leafColor2: string;
  swayDelay: number;
  style: React.CSSProperties;
}

/* 虞美人 — 开心（明艳热烈，薄瓣轻盈） */
function CornPoppy(props: WildFlowerProps) {
  const { size, droopAngle, petalOpacity, vibrancy, stemColor, stemColor2, leafColor, leafColor2, swayDelay, style } = props;
  const h = size * 1.35;
  return (
    <svg width={size} height={h} viewBox="0 0 60 82" style={{ ...style, animation: `wildSway 4.5s ease-in-out infinite`, animationDelay: `${swayDelay}s` }}>
      <g transform={`rotate(${droopAngle} 30 72)`}>
        {/* 细茎 + 细毛 */}
        <path d="M30 82 Q29 55 30 32" stroke={stemColor} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M30 70 L27 68 M30 62 L33 60 M30 54 L28 52 M30 45 L32 43" stroke={stemColor2} strokeWidth="0.6" opacity="0.6" />
        {/* 茎生叶（分裂状） */}
        <path d="M30 58 Q22 55 18 52 Q20 58 24 60 Z" fill={leafColor} opacity="0.8" />
        <path d="M30 50 Q38 48 42 45 Q40 51 36 52 Z" fill={leafColor2} opacity="0.7" />
        {/* 花蕾（未开的） */}
        <ellipse cx="30" cy="30" rx="5" ry="6" fill="#6a5a4a" opacity="0.7" />
        {/* 花瓣 - 4片大瓣，薄纸质感 */}
        <g transform="translate(30 20)">
          {/* 后瓣 */}
          <ellipse cx="-6" cy="-2" rx="10" ry="12" fill={`rgba(210,60,50,${petalOpacity * vibrancy})`} transform="rotate(-25)" />
          <ellipse cx="6" cy="-2" rx="10" ry="12" fill={`rgba(195,50,40,${petalOpacity * vibrancy})`} transform="rotate(25)" />
          {/* 前瓣 */}
          <ellipse cx="-3" cy="3" rx="9" ry="11" fill={`rgba(230,75,60,${petalOpacity * vibrancy})`} transform="rotate(-10)" />
          <ellipse cx="4" cy="4" rx="9" ry="11" fill={`rgba(215,65,50,${petalOpacity * vibrancy})`} transform="rotate(15)" />
          {/* 花瓣褶皱纹理 */}
          <path d="M-5 -6 Q-3 2 -5 8" stroke={`rgba(160,30,20,${petalOpacity * 0.3})`} strokeWidth="0.5" fill="none" />
          <path d="M4 -5 Q2 2 5 7" stroke={`rgba(160,30,20,${petalOpacity * 0.3})`} strokeWidth="0.5" fill="none" />
          {/* 花心 - 黑色带细毛 */}
          <circle cx="0" cy="2" r="4" fill="#2a1a10" />
          <circle cx="0" cy="2" r="2.5" fill="#3a2a1a" />
          {/* 雄蕊小点 */}
          {[0,45,90,135,180,225,270,315].map((a,i) => (
            <circle key={i} cx={Math.cos(a*Math.PI/180)*3.5} cy={2 + Math.sin(a*Math.PI/180)*3.5} r="0.6" fill="#1a0a05" opacity={petalOpacity * 0.8} />
          ))}
        </g>
      </g>
    </svg>
  );
}

/* 洋甘菊 — 平静（白瓣黄心，清新质朴） */
function Chamomile(props: WildFlowerProps) {
  const { size, droopAngle, petalOpacity, vibrancy, stemColor, stemColor2, leafColor, leafColor2, swayDelay, style } = props;
  const h = size * 1.3;
  const petalCount = 14;
  return (
    <svg width={size} height={h} viewBox="0 0 60 78" style={{ ...style, animation: `wildSway 5s ease-in-out infinite`, animationDelay: `${swayDelay}s` }}>
      <g transform={`rotate(${droopAngle} 30 68)`}>
        {/* 茎 - 分枝多 */}
        <path d="M30 78 Q31 58 30 35" stroke={stemColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M30 60 Q24 55 20 50" stroke={stemColor2} strokeWidth="1" fill="none" opacity="0.7" />
        <path d="M30 50 Q36 46 39 42" stroke={stemColor2} strokeWidth="1" fill="none" opacity="0.7" />
        {/* 羽状叶 */}
        <path d="M30 62 Q20 60 15 62 Q18 65 25 64 Q28 66 30 64" fill={leafColor} opacity="0.75" />
        <path d="M30 52 Q40 50 44 52 Q42 56 35 55 Q32 57 30 55" fill={leafColor2} opacity="0.7" />
        {/* 小侧花 */}
        <g transform="translate(20 48) scale(0.45)">
          <circle cx="0" cy="0" r="5" fill={`rgba(230,190,60,${petalOpacity * vibrancy})`} />
          {Array.from({length:10}).map((_,i) => {
            const a = (i * 360) / 10;
            return <ellipse key={i} cx="0" cy="-7" rx="1.5" ry="5" fill={`rgba(255,255,255,${petalOpacity * 0.9})`} transform={`rotate(${a})`} />;
          })}
        </g>
        {/* 主花头 */}
        <g transform="translate(30 28)">
          {/* 花瓣 - 白色带微粉尖 */}
          {Array.from({length: petalCount}).map((_, i) => {
            const angle = (i * 360) / petalCount;
            const len = 12 + (i % 3) * 1.5;
            return (
              <ellipse
                key={i}
                cx="0"
                cy={-len}
                rx="3.2"
                ry={len}
                fill={`rgba(255,253,248,${petalOpacity * 0.95})`}
                transform={`rotate(${angle})`}
                opacity={0.9 + (i % 3) * 0.03}
              />
            );
          })}
          {/* 花心 - 黄色圆锥 */}
          <ellipse cx="0" cy="0" rx="7" ry="5" fill={`rgba(210,170,50,${petalOpacity * vibrancy})`} />
          <ellipse cx="0" cy="-1" rx="5.5" ry="3.5" fill={`rgba(235,195,70,${petalOpacity * vibrancy})`} />
          {/* 花心颗粒 */}
          {Array.from({length:18}).map((_,i) => {
            const a = (i * 40) % 360;
            const r = 2 + (i % 4) * 1.2;
            return <circle key={i} cx={Math.cos(a*Math.PI/180)*r*0.8} cy={Math.sin(a*Math.PI/180)*r*0.5 - 0.5} r="0.7" fill={`rgba(160,120,20,${petalOpacity * 0.6})`} />;
          })}
        </g>
      </g>
    </svg>
  );
}

/* 薰衣草 — 焦虑（多穗小花，颤动不安） */
function Lavender(props: WildFlowerProps) {
  const { size, droopAngle, petalOpacity, vibrancy, stemColor, stemColor2, leafColor, leafColor2, swayDelay, style } = props;
  const h = size * 1.4;
  return (
    <svg width={size} height={h} viewBox="0 0 60 84" style={{ ...style, animation: `wildSway 3.5s ease-in-out infinite`, animationDelay: `${swayDelay}s` }}>
      <g transform={`rotate(${droopAngle} 30 76)`}>
        {/* 木质化基部 */}
        <path d="M30 84 L28 70 M30 84 L32 72 M30 84 L30 68" stroke={stemColor2} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8" />
        {/* 多根茎 */}
        <path d="M30 70 Q27 45 24 20" stroke={stemColor} strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M30 72 Q32 48 34 22" stroke={stemColor2} strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M30 68 Q30 44 30 16" stroke={stemColor} strokeWidth="1.2" fill="none" strokeLinecap="round" />
        {/* 线状叶（灰绿色） */}
        <path d="M24 50 L18 46" stroke="#8a9a7a" strokeWidth="1" strokeLinecap="round" />
        <path d="M28 55 L36 52" stroke="#7a8a6a" strokeWidth="1" strokeLinecap="round" />
        <path d="M30 60 L22 58" stroke="#8a9a7a" strokeWidth="1" strokeLinecap="round" />
        <path d="M32 48 L40 45" stroke="#7a8a6a" strokeWidth="1" strokeLinecap="round" />
        <path d="M26 62 L18 61" stroke="#7a8a6a" strokeWidth="1" strokeLinecap="round" />
        {/* 花穗 1 — 中间主穗 */}
        <g transform="translate(30 16)">
          {Array.from({length:10}).map((_, i) => {
            const yOff = i * 3.5;
            const scale = 1 - i * 0.06;
            return (
              <g key={i} transform={`translate(0 ${yOff}) scale(${scale})`}>
                <ellipse cx="-3" cy="0" rx="2.5" ry="3.5" fill={`rgba(150,120,180,${petalOpacity * vibrancy})`} transform="rotate(-20)" />
                <ellipse cx="3" cy="0" rx="2.5" ry="3.5" fill={`rgba(140,110,170,${petalOpacity * vibrancy})`} transform="rotate(20)" />
                <ellipse cx="0" cy="-1" rx="2.5" ry="3.5" fill={`rgba(160,130,190,${petalOpacity * vibrancy})`} />
              </g>
            );
          })}
          {/* 穗顶端 */}
          <ellipse cx="0" cy="-4" rx="2.5" ry="3.5" fill={`rgba(170,140,200,${petalOpacity * vibrancy})`} />
        </g>
        {/* 花穗 2 — 左侧 */}
        <g transform="translate(24 20) scale(0.75)">
          {Array.from({length:7}).map((_, i) => {
            const yOff = i * 3.2;
            return (
              <g key={i} transform={`translate(0 ${yOff})`}>
                <ellipse cx="-2" cy="0" rx="2" ry="3" fill={`rgba(145,115,175,${petalOpacity * vibrancy})`} transform="rotate(-25)" />
                <ellipse cx="2" cy="0" rx="2" ry="3" fill={`rgba(155,125,185,${petalOpacity * vibrancy})`} transform="rotate(25)" />
              </g>
            );
          })}
        </g>
        {/* 花穗 3 — 右侧 */}
        <g transform="translate(34 22) scale(0.7)">
          {Array.from({length:6}).map((_, i) => {
            const yOff = i * 3.2;
            return (
              <g key={i} transform={`translate(0 ${yOff})`}>
                <ellipse cx="-2" cy="0" rx="2" ry="3" fill={`rgba(155,125,185,${petalOpacity * vibrancy})`} transform="rotate(-20)" />
                <ellipse cx="2" cy="0" rx="2" ry="3" fill={`rgba(145,115,175,${petalOpacity * vibrancy})`} transform="rotate(20)" />
              </g>
            );
          })}
        </g>
      </g>
    </svg>
  );
}

/* 野雏菊 — 难过（低垂，淡白柔和） */
function Daisy(props: WildFlowerProps) {
  const { size, droopAngle, petalOpacity, vibrancy, stemColor, stemColor2, leafColor, leafColor2, swayDelay, style } = props;
  const h = size * 1.3;
  const petalCount = 16;
  return (
    <svg width={size} height={h} viewBox="0 0 60 78" style={{ ...style, animation: `wildSway 5.5s ease-in-out infinite`, animationDelay: `${swayDelay}s` }}>
      <g transform={`rotate(${droopAngle} 30 68)`}>
        {/* 单茎 */}
        <path d="M30 78 Q30 55 30 32" stroke={stemColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* 基生叶（莲座状） */}
        <ellipse cx="24" cy="70" rx="7" ry="3" fill={leafColor} transform="rotate(-15 24 70)" opacity="0.7" />
        <ellipse cx="36" cy="72" rx="6" ry="2.5" fill={leafColor2} transform="rotate(20 36 72)" opacity="0.7" />
        <ellipse cx="20" cy="74" rx="5" ry="2" fill={leafColor} transform="rotate(-25 20 74)" opacity="0.6" />
        <ellipse cx="38" cy="75" rx="5.5" ry="2" fill={leafColor2} transform="rotate(30 38 75)" opacity="0.6" />
        {/* 茎上小苞叶 */}
        <path d="M30 50 L25 48" stroke={stemColor2} strokeWidth="1" opacity="0.7" />
        <path d="M30 55 L35 53" stroke={stemColor2} strokeWidth="1" opacity="0.7" />
        {/* 花头 — 稍低垂 */}
        <g transform="translate(30 28)">
          {/* 总苞（背后绿色杯状） */}
          <ellipse cx="0" cy="3" rx="8" ry="4" fill="#5a7a4a" opacity={petalOpacity * 0.7} />
          {/* 花瓣 - 白色带淡紫 */}
          {Array.from({length: petalCount}).map((_, i) => {
            const angle = (i * 360) / petalCount;
            const len = 13 + (i % 4) * 1;
            const w = 2.8 + (i % 3) * 0.4;
            const tint = i % 2 === 0 ? '235,230,240' : '245,240,248';
            return (
              <ellipse
                key={i}
                cx="0"
                cy={-len}
                rx={w}
                ry={len}
                fill={`rgba(${tint},${petalOpacity * 0.9})`}
                transform={`rotate(${angle})`}
              />
            );
          })}
          {/* 花心 - 暖黄色碟状 */}
          <ellipse cx="0" cy="0" rx="6.5" ry="4.5" fill={`rgba(200,170,70,${petalOpacity * vibrancy})`} />
          <ellipse cx="0" cy="-0.5" rx="5" ry="3" fill={`rgba(220,190,90,${petalOpacity * vibrancy})`} />
          {/* 心花细节 */}
          {Array.from({length:14}).map((_,i) => {
            const a = (i * 50) % 360;
            const r = 1.5 + (i % 3) * 1.5;
            return <circle key={i} cx={Math.cos(a*Math.PI/180)*r*0.7} cy={Math.sin(a*Math.PI/180)*r*0.5} r="0.6" fill={`rgba(140,105,25,${petalOpacity * 0.7})`} />;
          })}
        </g>
      </g>
    </svg>
  );
}

/* 蓟花 — 生气（尖锐带刺，浓烈紫红色） */
function Thistle(props: WildFlowerProps) {
  const { size, droopAngle, petalOpacity, vibrancy, stemColor, stemColor2, leafColor, leafColor2, swayDelay, style } = props;
  const h = size * 1.35;
  return (
    <svg width={size} height={h} viewBox="0 0 60 82" style={{ ...style, animation: `wildSway 4s ease-in-out infinite`, animationDelay: `${swayDelay}s` }}>
      <g transform={`rotate(${droopAngle} 30 72)`}>
        {/* 粗壮带棱的茎 */}
        <path d="M30 82 Q31 52 30 28" stroke={stemColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M30 82 Q29 55 28 30" stroke={stemColor2} strokeWidth="1" fill="none" opacity="0.5" />
        {/* 带刺的叶 - 深裂尖锐 */}
        <path d="M30 62 L16 60 L18 56 L14 54 L18 52 L16 48 L22 50 L25 54 L30 56" fill={leafColor} opacity="0.8" />
        <path d="M30 50 L44 48 L42 44 L46 42 L42 40 L44 36 L38 38 L35 42 L30 44" fill={leafColor2} opacity="0.75" />
        <path d="M30 70 L20 70 L22 67 L18 65 L22 63 L30 65" fill={leafColor} opacity="0.7" />
        {/* 总苞 - 带刺的杯状 */}
        <g transform="translate(30 28)">
          {/* 外层苞片 */}
          {Array.from({length:10}).map((_, i) => {
            const angle = (i * 360) / 10;
            return (
              <path
                key={i}
                d="M0 0 L-2 -8 L0 -10 L2 -8 Z"
                fill="#4a6a3a"
                transform={`rotate(${angle})`}
                opacity={petalOpacity * 0.8}
              />
            );
          })}
          {/* 内层苞片 */}
          {Array.from({length:8}).map((_, i) => {
            const angle = (i * 360) / 8 + 22.5;
            return (
              <path
                key={`in-${i}`}
                d="M0 2 L-1.5 -5 L0 -7 L1.5 -5 Z"
                fill="#5a7a4a"
                transform={`rotate(${angle})`}
                opacity={petalOpacity * 0.7}
              />
            );
          })}
          {/* 花球 - 紫红色头状花序 */}
          <circle cx="0" cy="-6" r="9" fill={`rgba(180,50,100,${petalOpacity * vibrancy})`} />
          <circle cx="-2" cy="-7" r="7.5" fill={`rgba(200,70,120,${petalOpacity * vibrancy})`} />
          <circle cx="2" cy="-5" r="7" fill={`rgba(170,45,90,${petalOpacity * vibrancy})`} />
          {/* 小花顶端（伸出的细丝） */}
          {Array.from({length:16}).map((_, i) => {
            const a = (i * 360) / 16;
            const r = 6 + (i % 3) * 2;
            return (
              <line
                key={i}
                x1={Math.cos(a*Math.PI/180)*5}
                y1={-6 + Math.sin(a*Math.PI/180)*5}
                x2={Math.cos(a*Math.PI/180)*(r+3)}
                y2={-6 + Math.sin(a*Math.PI/180)*(r+3)}
                stroke={`rgba(220,100,150,${petalOpacity * vibrancy})`}
                strokeWidth="0.6"
              />
            );
          })}
          {/* 高光 */}
          <ellipse cx="-3" cy="-9" rx="2.5" ry="2" fill={`rgba(255,180,200,${petalOpacity * 0.4})`} />
        </g>
      </g>
    </svg>
  );
}

/* 蒲公英 — 疲惫（绒毛蓬松，低垂松散） */
function Dandelion(props: WildFlowerProps) {
  const { size, droopAngle, petalOpacity, vibrancy, stemColor, stemColor2, leafColor, leafColor2, swayDelay, style } = props;
  const h = size * 1.4;
  return (
    <svg width={size} height={h} viewBox="0 0 60 84" style={{ ...style, animation: `wildSway 6s ease-in-out infinite`, animationDelay: `${swayDelay}s` }}>
      <g transform={`rotate(${droopAngle} 30 76)`}>
        {/* 空心茎 - 稍弯 */}
        <path d="M30 84 Q31 58 28 30" stroke={stemColor} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M30 84 Q29 60 27 35" stroke={stemColor2} strokeWidth="0.7" fill="none" opacity="0.5" />
        {/* 基生叶 - 锯齿状，贴地 */}
        <path d="M30 80 Q20 78 12 80 Q16 76 22 74 Q20 72 28 72 Q30 70 32 72 Q40 72 44 76 Q40 78 30 80" fill={leafColor} opacity="0.65" />
        <path d="M26 78 Q18 76 14 78 Q18 74 24 73" fill={leafColor2} opacity="0.6" />
        {/* 绒毛球（果序） */}
        <g transform="translate(28 24)">
          {/* 中心 */}
          <circle cx="0" cy="0" r="3" fill={`rgba(200,180,140,${petalOpacity * vibrancy})`} />
          {/* 放射状绒毛 - 分多层 */}
          {Array.from({length:28}).map((_, i) => {
            const angle = (i * 360) / 28;
            const len = 12 + (i % 5) * 3;
            const w = 0.8 + (i % 3) * 0.3;
            return (
              <g key={i} transform={`rotate(${angle})`}>
                {/* 伞柄 */}
                <line x1="0" y1="0" x2="0" y2={-len} stroke={`rgba(220,200,160,${petalOpacity * 0.6})`} strokeWidth="0.4" />
                {/* 绒毛 */}
                <ellipse cx="0" cy={-len} rx={w} ry="3" fill={`rgba(255,252,240,${petalOpacity * 0.85})`} />
                <ellipse cx={-w*0.8} cy={-len+1} rx={w*0.7} ry="2" fill={`rgba(255,252,240,${petalOpacity * 0.7})`} />
                <ellipse cx={w*0.8} cy={-len+1} rx={w*0.7} ry="2" fill={`rgba(255,252,240,${petalOpacity * 0.7})`} />
              </g>
            );
          })}
          {/* 第二层绒毛，更短更密 */}
          {Array.from({length:20}).map((_, i) => {
            const angle = (i * 360) / 20 + 9;
            const len = 8 + (i % 3) * 2;
            return (
              <line
                key={`s-${i}`}
                x1="0"
                y1="0"
                x2={Math.cos((angle - 90) * Math.PI / 180) * len * 0.3}
                y2={Math.sin((angle - 90) * Math.PI / 180) * len - 2}
                stroke={`rgba(245,240,220,${petalOpacity * 0.6})`}
                strokeWidth="0.5"
                transform={`rotate(${angle})`}
              />
            );
          })}
          {/* 整体柔光 */}
          <circle cx="0" cy="0" r="14" fill={`rgba(255,250,230,${petalOpacity * 0.15})`} />
        </g>
        {/* 飘散的小绒毛 */}
        {petalOpacity > 0.6 && (
          <>
            <circle cx="14" cy="16" r="1.5" fill={`rgba(255,252,240,${petalOpacity * 0.4})`} />
            <circle cx="18" cy="22" r="1" fill={`rgba(255,252,240,${petalOpacity * 0.3})`} />
            <circle cx="42" cy="10" r="1.2" fill={`rgba(255,252,240,${petalOpacity * 0.35})`} />
          </>
        )}
      </g>
    </svg>
  );
}
