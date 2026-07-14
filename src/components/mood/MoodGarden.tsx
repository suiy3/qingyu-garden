import { useState, useMemo, useCallback } from 'react';
import type { MoodRecord, StudyRecord } from '../../types';

const MOOD_PLANT: Record<string, { emoji: string; name: string; language: string }> = {
  happy:    { emoji: '🌻', name: '向日葵', language: '你总朝着光生长，保持这份明亮。' },
  calm:     { emoji: '🤍', name: '洋甘菊', language: '平静是你最好的土壤，根扎得稳才能长得高。' },
  sad:      { emoji: '💙', name: '蓝铃花', language: '允许自己低落一会儿，花也会在雨后重开。' },
  anxious:  { emoji: '💜', name: '银莲花', language: '风一吹你就颤，你在意的事很多——但别让风声盖过自己。' },
  angry:    { emoji: '🌷', name: '红郁金香', language: '怒火是能量，烧完记得浇水，明天还会开。' },
  tired:    { emoji: '🌸', name: '睡莲', language: '你不是枯萎了，你只是需要在水面歇一歇。' },
};

interface FlowerCell {
  record: MoodRecord;
  moodKey: string;
  vitality: number;
  isWilted: boolean;
  stage: 'seed' | 'sprout' | 'bud' | 'bloom';
  sizeScale: number;
  dateStr: string;
  studyMin: number;
}

export default function MoodGarden({
  records = [],
  studyRecords = [],
  days = 9,
  showDaySwitcher,
  onDaysChange,
  onExploreInsight,
}: {
  records: MoodRecord[];
  studyRecords?: StudyRecord[];
  days?: number;
  showDaySwitcher?: boolean;
  onDaysChange?: (days: number) => void;
  onExploreInsight?: () => void;
}) {
  const [selected, setSelected] = useState<MoodRecord | null>(null);

  const sortedRecords = useMemo(() => {
    return [...records].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [records]);

  const displayRecords = useMemo(() => {
    return sortedRecords.slice(-days);
  }, [sortedRecords, days]);

  const streak = useMemo(() => Math.min(records.length, days), [records.length, days]);

  const prosperity = useMemo(() => {
    if (streak >= 7) return 'lush';
    if (streak >= 4) return 'growing';
    if (streak >= 1) return 'sprouting';
    return 'empty';
  }, [streak]);

  const flowers: FlowerCell[] = useMemo(() => {
    return displayRecords.map((record) => {
      const moodKey = (record.moodType || 'calm').toLowerCase();
      const recordDate = record.createdAt.split('T')[0];
      const dayStudy = studyRecords.filter(
        (s) => s.createdAt.split('T')[0] === recordDate
      );
      const studyMin = dayStudy.reduce((sum, s) => sum + (s.duration || 0), 0);

      let vit = (record.intensity ?? 3) / 5;
      if (studyMin > 120) vit -= 0.35;
      if (studyMin > 90 && (record.intensity ?? 3) <= 2) vit -= 0.2;
      vit = Math.max(0, Math.min(1, vit));

      const isWilted = vit < 0.45;
      const recIdx = displayRecords.indexOf(record);
      const totalRecs = displayRecords.length;
      const age = totalRecs > 1 ? recIdx / (totalRecs - 1) : 0;
      let stage: FlowerCell['stage'];
      if (age < 0.15) stage = 'seed';
      else if (age < 0.4) stage = 'sprout';
      else if (age < 0.65) stage = 'bud';
      else stage = 'bloom';

      const sizeScale = 0.85 + age * 0.25 + (recIdx % 3) * 0.03;

      return {
        record,
        moodKey,
        vitality: vit,
        isWilted,
        stage,
        sizeScale,
        dateStr: recordDate.slice(5),
        studyMin,
      };
    });
  }, [displayRecords, studyRecords]);

  const selFlower = selected
    ? flowers.find((f) => f.record.id === selected.id)
    : null;

  const observe = useCallback((intensity: number, studyMin: number) => {
    if (intensity >= 4 && studyMin > 60) return '今天情绪比较强烈，学习也投入了不少时间。记得给自己留点放松的空隙，紧绷太久弦会断。';
    if (intensity <= 2 && studyMin > 90) return '学习时间很长，但情绪偏低落。是不是学得有点累了？效率比时长更重要，起来走两步吧。';
    if (intensity >= 4 && studyMin < 30) return '情绪很饱满，这股能量可以用在感兴趣的事情上！试试把这份热情投入到一件小事中。';
    if (intensity <= 2 && studyMin < 30) return '今天情绪比较平静/低落，也没有学习记录。没关系，给自己一个允许放空的日子。';
    if (studyMin > 120) return '今天学习超过2小时了，注意劳逸结合哦。大脑也需要休息才能更好地吸收知识。';
    return '今天状态还不错，继续保持这种平衡就好。';
  }, []);

  const handleExplore = useCallback(() => {
    setSelected(null);
    onExploreInsight?.();
  }, [onExploreInsight]);

  const emptyCells = Math.max(0, days - flowers.length);

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        @keyframes farm-sway {
          0%, 100% { transform: rotate(-1.5deg); }
          50% { transform: rotate(1.5deg); }
        }
        @keyframes farm-sway-slow {
          0%, 100% { transform: rotate(-1deg) translateY(0); }
          50% { transform: rotate(1deg) translateY(-1px); }
        }
        @keyframes farm-grow {
          0% { transform: scale(0) translateY(20px); opacity: 0; }
          60% { transform: scale(1.1) translateY(-3px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes farm-bloom {
          0% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
          50% { transform: scale(1.15) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes farm-wilt {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(18deg); filter: saturate(0.5) brightness(0.8); }
        }
        @keyframes farm-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.15); }
        }
        @keyframes farm-particle {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          15% { opacity: 0.8; }
          100% { transform: translateY(60px) translateX(20px); opacity: 0; }
        }
        @keyframes farm-sprout {
          0% { transform: translateY(10px) scaleY(0); opacity: 0; }
          100% { transform: translateY(0) scaleY(1); opacity: 1; }
        }
        .farm-cell {
          position: relative;
          aspect-ratio: 1;
          border-radius: 14px;
          cursor: pointer;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .farm-cell:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 8px 25px rgba(120,80,20,0.25);
        }
        .farm-flower-svg {
          animation: farm-sway 4s ease-in-out infinite;
          transform-origin: bottom center;
        }
        .farm-flower-wilted .farm-flower-svg {
          animation: farm-wilt 1.5s ease-out forwards;
        }
        .farm-flower-healthy .farm-flower-svg {
          animation: farm-sway 4s ease-in-out infinite;
        }
        .farm-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          position: relative;
          z-index: 10;
        }
        @media (max-width: 400px) {
          .farm-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      {/* 顶部栏 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 10, padding: '0 4px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>🌿</span>
          <span style={{ fontWeight: 700, fontSize: 17, color: '#4a3520', letterSpacing: 0.5 }}>
            晴语农场
          </span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'linear-gradient(135deg, #f5e6c8, #e8d4a8)',
          padding: '6px 14px',
          borderRadius: 20,
          fontSize: 13,
          fontWeight: 600,
          color: '#6a4a20',
          boxShadow: '0 2px 8px rgba(180,140,60,0.2)',
        }}>
          <span>🌱</span>
          <span>连续 {streak} 天</span>
          {prosperity === 'lush' && <span style={{ marginLeft: 4 }}>· 🌳 茂盛</span>}
          {prosperity === 'growing' && <span style={{ marginLeft: 4 }}>· 🌿 成长中</span>}
        </div>
      </div>

      {/* 农场容器 */}
      <div style={{
        position: 'relative',
        borderRadius: 18,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #b8d8e8 0%, #d4e8c8 25%, #c8dba0 45%, #8aaa60 70%, #6a8a48 100%)',
        padding: '12px',
        boxShadow: 'inset 0 0 60px rgba(100,120,60,0.15), 0 4px 20px rgba(0,0,0,0.1)',
      }}>
        {/* 天空太阳 */}
        <div style={{
          position: 'absolute', top: 8, right: 20,
          width: 40, height: 40, borderRadius: '50%',
          background: 'radial-gradient(circle, #fff5c0 0%, #f5d870 40%, rgba(255,220,100,0) 70%)',
          zIndex: 1, opacity: 0.8,
        }} />

        {/* 粒子光斑 */}
        {(prosperity === 'lush' || prosperity === 'growing') && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: 4 + (i % 3) * 2,
                  height: 4 + (i % 3) * 2,
                  borderRadius: '50%',
                  background: 'rgba(255,240,180,0.7)',
                  left: `${10 + i * 12}%`,
                  top: `${5 + (i % 4) * 8}%`,
                  animation: `farm-particle ${6 + i * 0.8}s ease-in-out infinite`,
                  animationDelay: `${i * 0.7}s`,
                  boxShadow: '0 0 6px rgba(255,230,120,0.5)',
                }}
              />
            ))}
          </div>
        )}

        {/* 远处草坡 SVG */}
        <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '40%', zIndex: 1, opacity: 0.6 }} preserveAspectRatio="none" viewBox="0 0 400 100">
          <path d="M0 100 Q50 40 120 55 Q200 25 280 50 Q350 35 400 60 L400 100 Z" fill="#7a9a50" />
          <path d="M0 100 Q80 55 160 70 Q240 45 320 65 Q370 55 400 75 L400 100 Z" fill="#6a8a45" />
        </svg>

        {/* 农田网格 */}
        <div className="farm-grid">
          {/* 花朵格子 */}
          {flowers.map((f, i) => (
            <FarmCell key={f.record.id || i} flower={f} onClick={() => setSelected(f.record)} />
          ))}
          {/* 空格子（未种植） */}
          {Array.from({ length: emptyCells }).map((_, i) => (
            <EmptyCell key={`empty-${i}`} />
          ))}
        </div>

        {/* 暖色叠层 */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 30%, rgba(255,240,200,0.15) 0%, transparent 60%)',
          pointerEvents: 'none', zIndex: 20,
        }} />

        {/* 暗角 */}
        <div style={{
          position: 'absolute', inset: 0,
          boxShadow: 'inset 0 0 80px rgba(80,50,20,0.15)',
          borderRadius: 18, pointerEvents: 'none', zIndex: 21,
        }} />
      </div>

      {/* 底部提示 */}
      <div style={{
        textAlign: 'center', marginTop: 10,
        fontSize: 12, color: '#8a7a60', opacity: 0.7,
      }}>
        点击每块田地查看那天的故事 ↓
      </div>

      {/* 详情抽屉 */}
      {selected && selFlower && (
        <>
          <div
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
              zIndex: 100, backdropFilter: 'blur(2px)',
            }}
            onClick={() => setSelected(null)}
          />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: '#fffaf0',
            borderRadius: '20px 20px 0 0',
            zIndex: 101,
            padding: '20px 20px 30px',
            maxHeight: '70vh', overflowY: 'auto',
            boxShadow: '0 -4px 30px rgba(0,0,0,0.15)',
            animation: 'farm-grow 0.3s ease-out',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 28 }}>{MOOD_PLANT[selFlower.moodKey]?.emoji}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#3a2a10' }}>
                    {selFlower.dateStr} 的{MOOD_PLANT[selFlower.moodKey]?.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#a08a60', marginTop: 2 }}>
                    {selFlower.isWilted ? '⚠️ 这天需要更多关照' : '✨ 状态良好'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: 'none', border: 'none', fontSize: 20,
                  cursor: 'pointer', color: '#b0a090', padding: 8,
                }}
              >✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div style={{
                padding: '12px 14px', borderRadius: 14,
                background: 'linear-gradient(135deg, #fef0f5, #fff0fa)',
                border: '1px solid #f0d8e8',
              }}>
                <div style={{ fontSize: 11, color: '#a07888', marginBottom: 4 }}>💗 心情</div>
                <div style={{ fontSize: 17, fontWeight: 600, color: '#4a2030', marginBottom: 2 }}>
                  {selFlower.record.moodType || '未知'}
                </div>
                <div style={{ fontSize: 12, color: '#886878' }}>强度 {selFlower.record.intensity}/5</div>
                {selFlower.record.note && (
                  <div style={{ fontSize: 11, color: '#a08090', marginTop: 4, fontStyle: 'italic' }}>
                    "{selFlower.record.note}"
                  </div>
                )}
              </div>
              <div style={{
                padding: '12px 14px', borderRadius: 14,
                background: 'linear-gradient(135deg, #eef4ff, #e8f0fe)',
                border: '1px solid #d8e2f0',
              }}>
                <div style={{ fontSize: 11, color: '#7888a0', marginBottom: 4 }}>📚 学习</div>
                <div style={{ fontSize: 17, fontWeight: 600, color: '#203050', marginBottom: 2 }}>
                  {selFlower.studyMin > 0 ? `${selFlower.studyMin} 分钟` : '无记录'}
                </div>
                {selFlower.studyMin > 0 && (
                  <div style={{ fontSize: 12, color: '#687898' }}>
                    {selFlower.studyMin > 120 ? '🔴 超过2小时' : selFlower.studyMin > 60 ? '🟡 超过1小时' : '🟢 适量'}
                  </div>
                )}
              </div>
            </div>

            <div style={{
              padding: '12px 14px', borderRadius: 14,
              background: 'linear-gradient(135deg, #fef9e7, #fff8d0)',
              border: '1px solid #f0e0a0', marginBottom: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 13 }}>💡</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#8a6d00' }}>晴语观察</span>
              </div>
              <p style={{ fontSize: 13, color: '#5a4a00', lineHeight: 1.6, margin: 0 }}>
                {observe(selFlower.record.intensity ?? 3, selFlower.studyMin)}
              </p>
            </div>

            <div style={{
              padding: '12px 14px', borderRadius: 14,
              background: 'linear-gradient(135deg, #f0f8e8, #e8f5d8)',
              border: '1px solid #c8e0a8',
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#3a6a2a', marginBottom: 4 }}>
                🌿 {MOOD_PLANT[selFlower.moodKey]?.name}的花语
              </div>
              <p style={{ fontSize: 13, color: '#2d5a1a', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>
                {MOOD_PLANT[selFlower.moodKey]?.language}
              </p>
            </div>

            {selFlower.isWilted && onExploreInsight && (
              <button
                onClick={handleExplore}
                style={{
                  marginTop: 12, width: '100%', padding: '12px',
                  borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #ff9800, #f57c00)',
                  color: '#fff', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 3px 10px rgba(255,152,0,0.35)',
                }}
              >
                🌿 看看晴语发现了什么规律 →
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════ 田格子组件 ═══════ */
function FarmCell({ flower, onClick }: { flower: FlowerCell; onClick: () => void }) {
  const healthClass = flower.isWilted ? 'farm-flower-wilted' : 'farm-flower-healthy';
  const plantInfo = MOOD_PLANT[flower.moodKey] || MOOD_PLANT.calm;

  return (
    <div className="farm-cell" onClick={onClick} title={`${plantInfo.name} · ${flower.dateStr}`}>
      <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id={`dirt-${flower.record.id || 0}`} cx="50%" cy="35%" rx="60%" ry="55%">
            <stop offset="0%" stopColor="#a07848" />
            <stop offset="50%" stopColor="#8a6238" />
            <stop offset="100%" stopColor="#6a4828" />
          </radialGradient>
          <linearGradient id={`dirt-edge-${flower.record.id || 0}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b89060" />
            <stop offset="100%" stopColor="#7a5a38" />
          </linearGradient>
          <filter id={`soil-texture-${flower.record.id || 0}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feDiffuseLighting in="noise" lightingColor="#fff" surfaceScale="1.5" diffuseConstant="0.8" result="light">
              <feDistantLight azimuth="45" elevation="55" />
            </feDiffuseLighting>
            <feComposite in="SourceGraphic" in2="light" operator="arithmetic" k1="0.8" k2="0.3" k3="0" k4="0" />
          </filter>
        </defs>

        {/* 田垄泥土主体 */}
        <rect x="4" y="4" width="112" height="112" rx="12" fill={`url(#dirt-${flower.record.id || 0})`} />
        {/* 泥土边缘隆起 */}
        <rect x="4" y="4" width="112" height="8" rx="12" fill={`url(#dirt-edge-${flower.record.id || 0})`} opacity="0.6" />

        {/* 犁沟纹理 */}
        {[0, 1, 2, 3, 4, 5].map((row) => (
          <g key={row}>
            <line x1="12" y1={20 + row * 15} x2="108" y2={18 + row * 15} stroke="#5a3a20" strokeWidth="0.8" opacity="0.25" strokeLinecap="round" />
            <line x1="14" y1={24 + row * 15} x2="106" y2={22 + row * 15} stroke="#9a7850" strokeWidth="0.5" opacity="0.2" strokeLinecap="round" />
          </g>
        ))}

        {/* 泥土颗粒 */}
        {Array.from({ length: 8 }).map((_, i) => (
          <circle
            key={i}
            cx={15 + ((i * 13) % 90)}
            cy={20 + ((i * 17) % 80)}
            r={0.8 + (i % 3) * 0.5}
            fill={i % 2 === 0 ? '#5a3a20' : '#b89060'}
            opacity={0.2 + (i % 3) * 0.1}
          />
        ))}

        {/* 田垄边框阴影 */}
        <rect x="4" y="4" width="112" height="112" rx="12" fill="none" stroke="rgba(50,30,10,0.3)" strokeWidth="1.5" />

        {/* 植物生长点 - 土洞 */}
        <ellipse cx="60" cy="90" rx="10" ry="4" fill="#4a2e15" opacity="0.5" />
        <ellipse cx="60" cy="89" rx="8" ry="3" fill="#3a1e0a" opacity="0.4" />
      </svg>

      {/* 日期标签 */}
      <div style={{
        position: 'absolute', top: 8, left: 10,
        background: 'rgba(60,40,20,0.65)',
        color: '#f5e0c0', fontSize: 12, fontWeight: 700,
        padding: '2px 8px', borderRadius: 8,
        fontFamily: 'monospace', zIndex: 5,
        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
      }}>
        {flower.dateStr}
      </div>

      {/* ⚠️ 标记 */}
      {flower.isWilted && flower.stage === 'bloom' && (
        <div style={{
          position: 'absolute', top: 6, right: 6, fontSize: 16, zIndex: 5,
          filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))',
        }}>⚠️</div>
      )}

      {/* 花朵层 */}
      <div className={healthClass} style={{
        position: 'absolute', bottom: '18%', left: '50%',
        transform: 'translateX(-50%)',
        width: `${55 * flower.sizeScale}px`,
        height: `${75 * flower.sizeScale}px`,
        zIndex: 3,
      }}>
        <div style={{
          width: '100%', height: '100%',
          animation: flower.stage === 'bloom' ? 'farm-sway 4s ease-in-out infinite' :
                     flower.stage === 'bud' ? 'farm-sway-slow 5s ease-in-out infinite' : 'none',
          transformOrigin: 'bottom center',
        }}>
          {flower.stage === 'seed' && <SeedSVG />}
          {flower.stage === 'sprout' && <SproutSVG wilted={flower.isWilted} />}
          {flower.stage === 'bud' && <BudSVG moodKey={flower.moodKey} wilted={flower.isWilted} />}
          {flower.stage === 'bloom' && <FlowerSVG moodKey={flower.moodKey} wilted={flower.isWilted} vitality={flower.vitality} />}
        </div>

        {/* 健康花光晕 */}
        {!flower.isWilted && flower.stage === 'bloom' && (
          <div style={{
            position: 'absolute', top: '-10%', left: '-20%',
            width: '140%', height: '60%', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,230,150,0.35) 0%, transparent 70%)',
            animation: 'farm-glow 3s ease-in-out infinite',
            pointerEvents: 'none', zIndex: -1,
          }} />
        )}
      </div>
    </div>
  );
}

/* ═══════ 空格子 ═══════ */
function EmptyCell() {
  return (
    <div style={{
      position: 'relative', aspectRatio: '1', borderRadius: 14,
      background: 'linear-gradient(180deg, rgba(160,120,70,0.4) 0%, rgba(120,90,50,0.5) 100%)',
      border: '2px dashed rgba(100,70,40,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, opacity: 0.5 }}>
        {[0, 1, 2, 3, 4].map((row) => (
          <line key={row} x1="15" y1={25 + row * 17} x2="105" y2={23 + row * 17} stroke="#6a4a28" strokeWidth="0.6" opacity="0.3" strokeLinecap="round" />
        ))}
      </svg>
      <span style={{ fontSize: 22, opacity: 0.3 }}>🌱</span>
    </div>
  );
}

/* ═══════ 4个成长阶段 SVG ═══════ */
function SeedSVG() {
  return (
    <svg viewBox="0 0 55 75" width="100%" height="100%" style={{ animation: 'farm-sprout 0.6s ease-out both' }}>
      <path d="M27.5 75 Q27.5 60 27.5 50" stroke="#5a8a3a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <ellipse cx="22" cy="48" rx="8" ry="5" fill="#6aaa4a" transform="rotate(-30 22 48)" />
      <ellipse cx="33" cy="48" rx="8" ry="5" fill="#5a9a3a" transform="rotate(30 33 48)" />
      <ellipse cx="22" cy="46" rx="5" ry="2.5" fill="#7aba5a" transform="rotate(-30 22 46)" opacity="0.6" />
      <ellipse cx="33" cy="46" rx="5" ry="2.5" fill="#6aaa4a" transform="rotate(30 33 46)" opacity="0.6" />
    </svg>
  );
}

function SproutSVG({ wilted }: { wilted: boolean }) {
  const stemColor = wilted ? '#9a9070' : '#4a8a2a';
  const leafColor = wilted ? '#8a9060' : '#5aaa3a';
  return (
    <svg viewBox="0 0 55 75" width="100%" height="100%" style={{ animation: 'farm-sprout 0.7s ease-out both' }}>
      <path d="M27.5 75 Q26 55 28 35" stroke={stemColor} strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="20" cy="45" rx="10" ry="5" fill={leafColor} transform="rotate(-35 20 45)" />
      <ellipse cx="35" cy="38" rx="9" ry="4.5" fill={wilted ? '#7a8050' : '#4a9a2a'} transform="rotate(30 35 38)" />
      <path d="M20 45 Q28 43 35 38" stroke={wilted ? '#7a8050' : '#3a8a2a'} strokeWidth="0.6" fill="none" opacity="0.5" />
      <ellipse cx="27" cy="30" rx="3" ry="4" fill={wilted ? '#7a8050' : '#6aba4a'} opacity="0.7" />
    </svg>
  );
}

function BudSVG({ moodKey, wilted }: { moodKey: string; wilted: boolean }) {
  const getBudColor = () => {
    switch (moodKey) {
      case 'happy': return wilted ? '#a08030' : '#e8c020';
      case 'calm': return wilted ? '#909070' : '#f0e8b0';
      case 'sad': return wilted ? '#707090' : '#8090c0';
      case 'anxious': return wilted ? '#807090' : '#a080c0';
      case 'angry': return wilted ? '#804030' : '#c03030';
      case 'tired': return wilted ? '#908080' : '#e0a0b0';
      default: return '#90b060';
    }
  };
  const stemColor = wilted ? '#8a8a60' : '#4a8a30';
  return (
    <svg viewBox="0 0 55 75" width="100%" height="100%" style={{ animation: 'farm-grow 0.8s cubic-bezier(.34,1.56,.64,1) both' }}>
      <path d="M27.5 75 Q27 50 27.5 22" stroke={stemColor} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <ellipse cx="20" cy="50" rx="8" ry="4" fill={wilted ? '#7a8050' : '#5aaa3a'} transform="rotate(-30 20 50)" />
      <ellipse cx="35" cy="42" rx="7" ry="3.5" fill={wilted ? '#6a7040' : '#4a9a2a'} transform="rotate(25 35 42)" />
      <ellipse cx="27.5" cy="18" rx="6" ry="10" fill={getBudColor()} />
      <ellipse cx="27.5" cy="15" rx="4.5" ry="7" fill={getBudColor()} opacity="0.7" />
      <path d="M23 15 Q27.5 10 32 15" stroke={wilted ? '#6a6040' : (moodKey === 'happy' ? '#c0a010' : '#709030')} strokeWidth="1" fill="none" opacity="0.4" />
    </svg>
  );
}

/* ═══════ 6种花 SVG ═══════ */
function FlowerSVG({ moodKey, wilted, vitality }: { moodKey: string; wilted: boolean; vitality: number }) {
  const opacity = wilted ? 0.6 : 1;
  const sat = wilted ? 0.5 : (0.7 + vitality * 0.4);
  const style: React.CSSProperties = {
    animation: 'farm-bloom 0.7s cubic-bezier(.34,1.56,.64,1) both',
    filter: `saturate(${sat})`,
  };
  switch (moodKey) {
    case 'happy': return <Sunflower wilted={wilted} opacity={opacity} style={style} />;
    case 'calm': return <Chamomile wilted={wilted} opacity={opacity} style={style} />;
    case 'sad': return <Bluebell wilted={wilted} opacity={opacity} style={style} />;
    case 'anxious': return <Anemone wilted={wilted} opacity={opacity} style={style} />;
    case 'angry': return <Tulip wilted={wilted} opacity={opacity} style={style} />;
    case 'tired': return <WaterLily wilted={wilted} opacity={opacity} style={style} />;
    default: return <Sunflower wilted={wilted} opacity={opacity} style={style} />;
  }
}

/* 向日葵 */
function Sunflower({ wilted, opacity, style }: { wilted: boolean; opacity: number; style: React.CSSProperties }) {
  const pc = wilted ? '#5a4020' : '#5a3010';
  const pl = wilted ? '#4a3015' : '#4a2508';
  const petalMain = wilted ? '#b09030' : '#f0c020';
  const petalLight = wilted ? '#a08028' : '#f8d840';
  const petalDark = wilted ? '#907020' : '#d8a010';
  const stem = wilted ? '#808050' : '#4a8a2a';
  const leaf = wilted ? '#707840' : '#5aaa3a';
  return (
    <svg viewBox="0 0 55 75" width="100%" height="100%" style={style}>
      <g opacity={opacity}>
        <path d="M27.5 75 Q26 55 28 25" stroke={stem} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M27.5 75 Q29 58 27 40" stroke={wilted ? '#707045' : '#3a7a20'} strokeWidth="1" fill="none" opacity="0.4" />
        <ellipse cx="18" cy="50" rx="12" ry="6" fill={leaf} transform="rotate(-40 18 50)" />
        <ellipse cx="37" cy="42" rx="10" ry="5" fill={wilted ? '#606835' : '#4a9a2a'} transform="rotate(30 37 42)" />
        <path d="M18 50 Q27 46 37 42" stroke={wilted ? '#5a6030' : '#3a8020'} strokeWidth="0.8" fill="none" opacity="0.3" />
        <g transform="translate(27.5 18)">
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i * 360) / 16;
            const isAlt = i % 2 === 0;
            return (
              <g key={i} transform={`rotate(${angle})`}>
                <ellipse cx="0" cy={-14} rx={isAlt ? 4 : 3.5} ry={isAlt ? 10 : 9} fill={isAlt ? petalMain : petalDark} />
                <ellipse cx={isAlt ? 0.8 : -0.5} cy={-14} rx={isAlt ? 2.5 : 2} ry={isAlt ? 8 : 7} fill={petalLight} opacity="0.5" />
              </g>
            );
          })}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 360) / 12 + 15;
            return <ellipse key={`inner-${i}`} cx="0" cy={-10} rx={2.5} ry={6} fill={petalDark} opacity="0.4" transform={`rotate(${angle})`} />;
          })}
          <circle cx="0" cy="0" r="8" fill={pc} />
          <circle cx="0" cy="-1" r="6.5" fill={pl} />
          {Array.from({ length: 20 }).map((_, i) => {
            const a = (i * 45) % 360;
            const r = 2 + (i % 4);
            return <circle key={i} cx={Math.cos(a * Math.PI / 180) * r} cy={Math.sin(a * Math.PI / 180) * r - 0.5} r="0.7" fill="#2a1505" opacity="0.6" />;
          })}
        </g>
      </g>
    </svg>
  );
}

/* 洋甘菊 */
function Chamomile({ wilted, opacity, style }: { wilted: boolean; opacity: number; style: React.CSSProperties }) {
  const center = wilted ? '#a09040' : '#e8c030';
  const centerDark = wilted ? '#807030' : '#c8a020';
  const petal = wilted ? '#c0c0a0' : '#fffcf0';
  const petalShadow = wilted ? '#b0b090' : '#f0ecd8';
  const stem = wilted ? '#808055' : '#5a9a3a';
  const leaf = wilted ? '#708045' : '#7aba5a';
  return (
    <svg viewBox="0 0 55 75" width="100%" height="100%" style={style}>
      <g opacity={opacity}>
        <path d="M27.5 75 Q28 55 27 22" stroke={stem} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M27 60 Q20 55 15 48" stroke={wilted ? '#707545' : '#4a8a2a'} strokeWidth="1" fill="none" />
        <path d="M28 52 Q36 47 40 40" stroke={wilted ? '#707545' : '#4a8a2a'} strokeWidth="1" fill="none" />
        <ellipse cx="17" cy="52" rx="6" ry="2.5" fill={leaf} transform="rotate(-45 17 52)" opacity="0.7" />
        <ellipse cx="38" cy="44" rx="5" ry="2" fill={wilted ? '#607038' : '#6aaa4a'} transform="rotate(35 38 44)" opacity="0.7" />
        <g transform="translate(27.5 16)">
          {Array.from({ length: 18 }).map((_, i) => {
            const angle = (i * 360) / 18;
            const len = 10 + (i % 3) * 1.2;
            return (
              <g key={i} transform={`rotate(${angle})`}>
                <ellipse cx="0" cy={-len} rx="2.5" ry={len} fill={petal} />
                <ellipse cx="0.5" cy={-len + 1} rx="1.5" ry={len - 2} fill={petalShadow} opacity="0.4" />
              </g>
            );
          })}
          <ellipse cx="0" cy="0" rx="6" ry="4.5" fill={center} />
          <ellipse cx="0" cy="-0.5" rx="4.5" ry="3" fill={centerDark} />
          {Array.from({ length: 14 }).map((_, i) => {
            const a = (i * 50) % 360;
            const r = 1.5 + (i % 3) * 1.2;
            return <circle key={i} cx={Math.cos(a * Math.PI / 180) * r * 0.7} cy={Math.sin(a * Math.PI / 180) * r * 0.5 - 0.3} r="0.5" fill={wilted ? '#605020' : '#a08010'} opacity="0.5" />;
          })}
        </g>
      </g>
    </svg>
  );
}

/* 蓝铃花 */
function Bluebell({ wilted, opacity, style }: { wilted: boolean; opacity: number; style: React.CSSProperties }) {
  const bell = wilted ? '#707090' : '#7080c8';
  const bellLight = wilted ? '#606080' : '#90a0e0';
  const bellDark = wilted ? '#505070' : '#5060a8';
  const stem = wilted ? '#707850' : '#4a8a3a';
  const leaf = wilted ? '#607040' : '#5a9a40';
  return (
    <svg viewBox="0 0 55 75" width="100%" height="100%" style={style}>
      <g opacity={opacity}>
        <path d="M27.5 75 Q24 55 26 28" stroke={stem} strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M27.5 75 Q30 58 28 45" stroke={wilted ? '#606840' : '#3a7a2a'} strokeWidth="1.2" fill="none" opacity="0.4" />
        <path d="M27 50 Q18 44 12 42" stroke={stem} strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M28 42 Q36 36 42 34" stroke={stem} strokeWidth="1" fill="none" strokeLinecap="round" />
        <ellipse cx="15" cy="55" rx="14" ry="4" fill={leaf} transform="rotate(-25 15 55)" />
        <ellipse cx="38" cy="48" rx="10" ry="3" fill={wilted ? '#506035' : '#4a8a30'} transform="rotate(20 38 48)" />
        <g transform="translate(20 22) rotate(-20)">
          <path d="M0 0 Q-6 -3 -7 -10 Q-6 -16 0 -14 Q6 -16 7 -10 Q6 -3 0 0" fill={bell} />
          <path d="M-3 -2 Q-7 -8 -5 -14" stroke={bellDark} strokeWidth="0.5" fill="none" opacity="0.4" />
          <ellipse cx="-3" cy="-11" rx="1.5" ry="2" fill={bellLight} opacity="0.5" />
          <path d="M-7 -10 L-9 -12 M0 -14 L0 -17 M7 -10 L9 -12" stroke={bellDark} strokeWidth="0.6" fill="none" strokeLinecap="round" />
          <line x1="0" y1="0" x2="0" y2="5" stroke={stem} strokeWidth="1.2" />
        </g>
        <g transform="translate(28 28) rotate(-10)">
          <path d="M0 0 Q-4 -2 -5 -8 Q-4 -12 0 -10 Q4 -12 5 -8 Q4 -2 0 0" fill={bellDark} opacity="0.8" />
          <line x1="0" y1="0" x2="0" y2="4" stroke={stem} strokeWidth="1" />
        </g>
        <g transform="translate(38 26) rotate(15)">
          <path d="M0 0 Q-4 -2 -5 -8 Q-4 -11 0 -10 Q4 -11 5 -8 Q4 -2 0 0" fill={bellLight} opacity="0.7" />
          <line x1="0" y1="0" x2="0" y2="3" stroke={stem} strokeWidth="0.8" />
        </g>
      </g>
    </svg>
  );
}

/* 银莲花 */
function Anemone({ wilted, opacity, style }: { wilted: boolean; opacity: number; style: React.CSSProperties }) {
  const petal = wilted ? '#807090' : '#9070c0';
  const petalLight = wilted ? '#706080' : '#b090e0';
  const anemoneInner = wilted ? '#605070' : '#7050a0';
  const center = wilted ? '#403040' : '#2a1530';
  const centerRing = wilted ? '#504050' : '#5a3068';
  const stem = wilted ? '#707550' : '#4a8030';
  const leaf = wilted ? '#607040' : '#5a9038';
  return (
    <svg viewBox="0 0 55 75" width="100%" height="100%" style={style}>
      <g opacity={opacity}>
        <path d="M27.5 75 Q28 55 27 20" stroke={stem} strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse cx="18" cy="52" rx="10" ry="5" fill={leaf} transform="rotate(-45 18 52)" />
        <ellipse cx="36" cy="44" rx="8" ry="4" fill={wilted ? '#506035' : '#4a8028'} transform="rotate(35 36 44)" />
        <g transform="translate(27.5 16)">
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 360) / 8;
            return (
              <g key={i} transform={`rotate(${angle})`}>
                <ellipse cx="0" cy="-12" rx="5" ry="11" fill={petal} />
                <ellipse cx="0" cy="-13" rx="3" ry="8" fill={petalLight} opacity="0.4" />
                <path d="M0 -3 Q-1 -12 0 -22" stroke={anemoneInner} strokeWidth="0.5" fill="none" opacity="0.3" />
              </g>
            );
          })}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 360) / 8 + 22.5;
            return <ellipse key={`in-${i}`} cx="0" cy="-8" rx="3.5" ry="7" fill={anemoneInner} opacity="0.3" transform={`rotate(${angle})`} />;
          })}
          <circle cx="0" cy="0" r="6" fill={centerRing} />
          <circle cx="0" cy="0" r="4.5" fill={center} />
          {Array.from({ length: 10 }).map((_, i) => {
            const a = (i * 36) % 360;
            return <circle key={i} cx={Math.cos(a * Math.PI / 180) * 2.5} cy={Math.sin(a * Math.PI / 180) * 2.5} r="0.8" fill={wilted ? '#807060' : '#c0a040'} opacity="0.8" />;
          })}
        </g>
      </g>
    </svg>
  );
}

/* 红郁金香 */
function Tulip({ wilted, opacity, style }: { wilted: boolean; opacity: number; style: React.CSSProperties }) {
  const petal = wilted ? '#803020' : '#d02020';
  const petalLight = wilted ? '#702818' : '#f04040';
  const tulipDark = wilted ? '#602010' : '#a01010';
  const stem = wilted ? '#707048' : '#4a8a2a';
  const leaf = wilted ? '#607038' : '#5aaa3a';
  const leafDark = wilted ? '#506028' : '#4a9028';
  return (
    <svg viewBox="0 0 55 75" width="100%" height="100%" style={style}>
      <g opacity={opacity}>
        <path d="M27.5 75 Q26 52 28 28" stroke={stem} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M15 35 Q8 48 22 62 Q18 50 26 42 Q20 40 15 35" fill={leaf} />
        <path d="M42 28 Q50 42 30 58 Q38 45 32 36 Q38 32 42 28" fill={leafDark} opacity="0.8" />
        <g transform="translate(27.5 12)">
          <path d="M0 0 Q-12 -5 -10 -16 Q-5 -22 0 -20 Q5 -22 10 -16 Q12 -5 0 0" fill={petal} />
          <path d="M-6 -2 Q-8 -12 -6 -20 Q-3 -16 0 -8 Q-3 -3 -6 -2" fill={tulipDark} opacity="0.5" />
          <path d="M6 -2 Q8 -12 6 -20 Q3 -16 0 -8 Q3 -3 6 -2" fill={petalLight} opacity="0.4" />
          <path d="M0 0 Q0 -10 -2 -20 M0 0 Q0 -10 2 -20" stroke={tulipDark} strokeWidth="0.6" fill="none" opacity="0.4" />
          <ellipse cx="0" cy="-16" rx="2.5" ry="3" fill={petalLight} opacity="0.3" />
        </g>
      </g>
    </svg>
  );
}

/* 睡莲 */
function WaterLily({ wilted, opacity, style }: { wilted: boolean; opacity: number; style: React.CSSProperties }) {
  const petal = wilted ? '#a08080' : '#f0b0c8';
  const petalInner = wilted ? '#907070' : '#f8d0e0';
  const petalDark = wilted ? '#806060' : '#d888a0';
  const center = wilted ? '#a09040' : '#f0d040';
  const lily = wilted ? '#506038' : '#4a8a30';
  const lilyLight = wilted ? '#607048' : '#5aaa40';
  const stem = wilted ? '#707850' : '#3a7a28';
  return (
    <svg viewBox="0 0 55 75" width="100%" height="100%" style={style}>
      <g opacity={opacity}>
        <path d="M27.5 75 Q27 60 27.5 45" stroke={stem} strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse cx="27.5" cy="55" rx="22" ry="8" fill={lily} />
        <ellipse cx="27.5" cy="53" rx="19" ry="6" fill={lilyLight} opacity="0.5" />
        <path d="M10 55 Q27 50 45 55" stroke={wilted ? '#405028' : '#3a7020'} strokeWidth="0.8" fill="none" opacity="0.3" />
        <g transform="translate(27.5 22)">
          {Array.from({ length: 10 }).map((_, i) => {
            const angle = (i * 360) / 10;
            const tilt = 10 + (i % 2) * 5;
            return (
              <g key={i} transform={`rotate(${angle})`}>
                <ellipse cx="0" cy="-10" rx="4" ry="10" fill={petal} transform={`rotate(${-tilt} 0 -5)`} />
              </g>
            );
          })}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 360) / 8 + 22.5;
            return (
              <g key={`in-${i}`} transform={`rotate(${angle})`}>
                <ellipse cx="0" cy="-7" rx="3" ry="7" fill={petalInner} opacity="0.8" transform={`rotate(-8 0 -3)`} />
              </g>
            );
          })}
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i * 360) / 6 + 15;
            return (
              <ellipse key={`core-${i}`} cx="0" cy="-4" rx="2" ry="4.5" fill={petalDark} opacity="0.5" transform={`rotate(${angle})`} />
            );
          })}
          <ellipse cx="0" cy="0" rx="4" ry="3" fill={center} />
          <ellipse cx="0" cy="-0.5" rx="2.5" ry="2" fill={wilted ? '#c0b050' : '#f8e060'} opacity="0.6" />
        </g>
      </g>
    </svg>
  );
}
