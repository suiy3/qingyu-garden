/**
 * 晴语对话引擎
 * 基于关键词匹配 + 情绪数据驱动的规则引擎
 * 模拟 AI 对话陪伴
 */

import { MoodRecord, StudyRecord, MoodType } from '@/types';
import { MOOD_CONFIG, SUBJECT_CONFIG } from '@/utils/constants';
import { formatDate, getPastDays } from '@/utils/date';

const MOOD_SCORE: Record<MoodType, number> = {
  happy: 5, calm: 4, tired: 2.5, anxious: 2, sad: 1.5, angry: 1,
};

export interface ChatMessage {
  id: string;
  role: 'user' | 'qingyu';
  content: string;
  timestamp: number;
  suggestion?: string; // 附带行动建议
  suggestionLink?: string;
}

// 关键词分类
const KEYWORDS = {
  sad: ['难过', '伤心', '不开心', '哭', '想哭', '悲伤', '心碎', '低落', 'emo', '抑郁', '郁闷'],
  anxious: ['焦虑', '紧张', '害怕', '担心', '怕', '恐惧', '不安', '慌', '压力', '烦躁', '烦'],
  angry: ['生气', '气死', '愤怒', '讨厌', '烦死', '讨厌', '可恶', '气'],
  tired: ['累', '疲惫', '困', '没力气', '撑不住', '精疲力尽', '好累', '太累了', '乏'],
  happy: ['开心', '高兴', '快乐', '兴奋', '棒', '好耶', '哈哈', '笑死', '太好了'],
  study: ['学习', '考试', '作业', '成绩', '复习', '预习', '做题', '写作业', '看书', '上课', '听不懂', '考砸'],
  sleep: ['睡不着', '失眠', '熬夜', '梦', '噩梦'],
  friend: ['朋友', '同学', '闺蜜', '兄弟', '吵架', '孤立', '没人理'],
  family: ['妈妈', '爸爸', '父母', '家里', '吵架', '骂', '打', '不理解'],
  self: ['我', '自己', '没用', '废物', '笨', '蠢', '不如别人', '自卑', '丑', '胖'],
};

// 快速回复选项
export const QUICK_REPLIES = [
  '我今天好累',
  '考试压力好大',
  '和朋友吵架了',
  '我也不知道怎么了',
  '今天还挺开心的',
];

function detectCategory(input: string): string[] {
  const categories: string[] = [];
  for (const [cat, words] of Object.entries(KEYWORDS)) {
    if (words.some((w) => input.includes(w))) {
      categories.push(cat);
    }
  }
  return categories;
}

function getRecentMoodContext(moodRecords: MoodRecord[]): {
  latest?: MoodRecord;
  avgScore: number;
  trend: 'up' | 'down' | 'stable';
  negativeStreak: number;
} {
  if (moodRecords.length === 0) {
    return { avgScore: 0, trend: 'stable', negativeStreak: 0 };
  }

  const sorted = [...moodRecords].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const latest = sorted[0];

  const past7Days = getPastDays(7);
  const recentRecords = moodRecords.filter((r) =>
    past7Days.includes(formatDate(r.createdAt))
  );
  const avgScore =
    recentRecords.length > 0
      ? recentRecords.reduce((s, r) => s + MOOD_SCORE[r.moodType], 0) / recentRecords.length
      : MOOD_SCORE[latest.moodType];

  const firstHalf = past7Days.slice(0, 3);
  const lastHalf = past7Days.slice(4);
  const firstAvg =
    firstHalf.reduce((s, d) => {
      const r = recentRecords.filter((rec) => formatDate(rec.createdAt) === d);
      return s + (r.length > 0 ? Math.min(...r.map((x) => MOOD_SCORE[x.moodType])) : 0);
    }, 0) / 3;
  const lastAvg =
    lastHalf.reduce((s, d) => {
      const r = recentRecords.filter((rec) => formatDate(rec.createdAt) === d);
      return s + (r.length > 0 ? Math.min(...r.map((x) => MOOD_SCORE[x.moodType])) : 0);
    }, 0) / 3;

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (lastAvg - firstAvg > 0.5) trend = 'up';
  else if (lastAvg - firstAvg < -0.5) trend = 'down';

  let negativeStreak = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (MOOD_SCORE[sorted[i].moodType] < 3) negativeStreak++;
    else break;
  }

  return { latest, avgScore, trend, negativeStreak };
}

export function generateResponse(
  input: string,
  moodRecords: MoodRecord[],
  studyRecords: StudyRecord[]
): ChatMessage {
  const id = `msg-${Date.now()}`;
  const timestamp = Date.now();
  const categories = detectCategory(input);
  const ctx = getRecentMoodContext(moodRecords);

  const content = generateContent(input, categories, ctx, moodRecords, studyRecords);
  const suggestion = generateSuggestion(categories, ctx);

  return {
    id,
    role: 'qingyu',
    content: content.content,
    timestamp,
    suggestion: suggestion.text,
    suggestionLink: suggestion.link,
  };
}

function generateContent(
  input: string,
  categories: string[],
  ctx: ReturnType<typeof getRecentMoodContext>,
  moodRecords: MoodRecord[],
  studyRecords: StudyRecord[]
): { content: string } {
  // 危机关键词检测
  if (input.includes('不想活') || input.includes('活着没意思') || input.includes('想死') || input.includes('自杀')) {
    return {
      content: '听到你说这些，我很担心你。你愿意跟我说说是什么让你这么难受吗？\n\n如果你想找专业的人聊聊，可以随时拨打 24小时心理援助热线 400-161-9995，他们很专业，也很温柔。\n\n你不是一个人，我在这里陪着你。',
    };
  }

  // 有明确的情绪类别
  if (categories.includes('sad')) {
    const responses = [
      `难过的时候不用急着好起来，允许自己低落一会儿也没关系。\n\n你说的这些我能感受到——那种说不清但就是堵得慌的感觉。${ctx.latest ? `今天你记录的心情是「${MOOD_CONFIG[ctx.latest.moodType].label}」，` : ''}这和你现在说的对得上。`,
      `嗯，我在听。难过不需要理由，也不需要立刻解决。\n\n${ctx.negativeStreak >= 2 ? `这已经是你最近第 ${ctx.negativeStreak} 天情绪不太好了，我们慢慢来，不着急。` : '有时候，说出来本身就是一种释放。'}`,
      `我听到了。那种难过像被什么压着，说不太清但就是沉甸甸的。\n\n你不用解释为什么会难过，我在这里就好。`,
    ];
    return { content: responses[Math.floor(Math.random() * responses.length)] };
  }

  if (categories.includes('anxious')) {
    const responses = [
      `焦虑的时候，呼吸会变浅，肩膀会紧。你现在能试着深吸一口气吗？\n\n${ctx.avgScore < 3 ? '最近你的情绪一直偏紧绷，这不是你的错，是身体在提醒你该歇歇了。' : '紧张说明你在乎，这没什么不好。但如果它让你不舒服了，我们一起想办法。'}`,
      `焦虑像脑子里开了太多标签页，每个都在转。\n\n不用全关掉，我们先关一个试试？告诉我，现在最让你紧张的那件事是什么？`,
      `担心的时候，身体比脑子先知道。你有没有觉得胸口紧、手心出汗？\n\n这些都是正常的应激反应，不是你不够坚强。`,
    ];
    return { content: responses[Math.floor(Math.random() * responses.length)] };
  }

  if (categories.includes('tired')) {
    const todayStudy = studyRecords.filter(
      (s) => formatDate(s.createdAt) === formatDate(new Date())
    );
    const totalMin = todayStudy.reduce((s, r) => s + r.duration, 0);

    if (totalMin > 120) {
      return {
        content: `今天你学了 ${totalMin} 分钟，难怪这么累。\n\n累不是懒，是身体在说话。大脑连续工作超过2小时，效率其实已经掉下来了。再撑着也是在自我消耗。\n\n要不要先放下，休息10分钟？就10分钟。`,
      };
    }
    return {
      content: `累的时候就别硬撑了。\n\n${ctx.trend === 'down' ? '最近几天你的状态一直在往下走，可能不是单纯的累，是积攒的疲惫到期了。' : '人的精力像手机电量，用到20%就该充了，别等关机。'}\n\n休息不是偷懒，是给自己充电。`,
    };
  }

  if (categories.includes('angry')) {
    return {
      content: `生气是边界在说话——有什么让你觉得被冒犯、被忽视、或者不公平了对吧？\n\n愤怒不是坏情绪，它在告诉你：这件事对你很重要。\n\n不用压下去，跟我说说，具体是什么让你生气？`,
    };
  }

  if (categories.includes('happy')) {
    return {
      content: `听到你开心，我也跟着亮了一下 ☀️\n\n${ctx.trend === 'up' ? '而且你不是今天才开心的，最近几天你的状态一直在变好，这个趋势很棒。' : '把这份好心情记下来吧，低落的时候回头看看，它会提醒你：好时光一直都在。'}\n\n是什么让你开心呀？`,
    };
  }

  if (categories.includes('study')) {
    const recentStudy = studyRecords.filter((s) => {
      const days = (Date.now() - new Date(s.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return days <= 7;
    });
    const totalMin = recentStudy.reduce((s, r) => s + r.duration, 0);

    if (input.includes('考砸') || input.includes('成绩')) {
      return {
        content: `考砸了的感觉确实不好受，尤其如果之前努力过。\n\n但一次成绩定义不了你。${recentStudy.length > 0 ? `这周你学了 ${totalMin} 分钟，这些努力不会白费，只是还没到兑现的时候。` : ''}\n\n考完了就先不想它，跟我说说，是哪科让你最不舒服？`,
      };
    }
    if (input.includes('听不懂') || input.includes('不会做')) {
      return {
        content: `听不懂的时候，容易觉得自己笨——但那不是笨，是节奏没对上。\n\n每个人的理解方式不一样，老师讲的不一定适合你。换个方式试试？比如找视频教程、问同学、或者拆成更小的步骤。\n\n是哪科让你头疼？`,
      };
    }
    return {
      content: `学习这件事，${ctx.avgScore < 3 ? '最近你学的时候情绪偏低，可能不只是学科难，是状态在拖后腿。' : '你一直在认真对待，这本身就很棒。'}\n\n不用和别人比进度，找到自己的节奏最重要。\n\n今天学习感觉怎么样？`,
    };
  }

  if (categories.includes('friend')) {
    return {
      content: `和朋友之间的事，往往最影响心情——因为你在乎。\n\n${ctx.latest && ctx.latest.moodType === 'sad' ? '你今天记的心情是难过，如果和这件事有关，说明它对你真的很重要。' : '吵架不可怕，怕的是冷战和误解越积越深。'}\n\n你愿意说说，是因为什么吵起来的吗？`,
    };
  }

  if (categories.includes('family')) {
    return {
      content: `家里的事有时候最让人无奈，因为你没法选择，也没法逃避。\n\n${input.includes('不理解') ? '被最亲近的人误解，那种委屈比外人给的还重。' : '父母也有他们的局限，他们不是不爱你，只是不知道怎么表达。'}\n\n你不用一个人扛，跟我说说，他们做了什么让你不舒服？`,
    };
  }

  if (categories.includes('self')) {
    return {
      content: `等等，先别这么说自己。\n\n我看了你最近的记录，${moodRecords.length > 5 ? `你已经坚持记录了 ${new Set(moodRecords.map((m) => formatDate(m.createdAt))).size} 天，` : ''}这说明你在认真对待自己——光这一点，就很了不起。\n\n那些「我没用」「我笨」的声音，是情绪在骗你，不是真的。你愿意告诉我，是什么让你这么想吗？`,
    };
  }

  if (categories.includes('sleep')) {
    return {
      content: `睡不好真的很折磨人，第二天整个人的状态都会差一截。\n\n${ctx.trend === 'down' ? '你最近情绪确实在往下走，可能和睡眠也有关系——身心是连着的。' : '偶尔失眠很正常，但如果连续好几天，可能身体在提醒你什么。'}\n\n睡前有没有想很多事？`,
    };
  }

  // 没有匹配到明确类别，基于数据主动引导
  if (ctx.latest) {
    const moodLabel = MOOD_CONFIG[ctx.latest.moodType].label;
    if (ctx.trend === 'down') {
      return {
        content: `你来了。我看了你最近的记录，情绪好像在往下走——最近几天都偏「${moodLabel}」。\n\n不用硬撑着，跟我说说，最近是不是有什么事压在心里？`,
      };
    }
    if (ctx.trend === 'up') {
      return {
        content: `你来了 ☀️ 我看了你的记录，最近状态在变好呢，这个趋势我很喜欢。\n\n今天怎么样？有什么想聊的吗？`,
      };
    }
    return {
      content: `你来了。今天你记的心情是「${moodLabel}」，${ctx.latest.note ? `你说「${ctx.latest.note}」` : '没有写具体原因'}。\n\n愿意多说说吗？`,
    };
  }

  // 完全没有数据
  return {
    content: `你好呀，我是晴语 🌱\n\n我会在这里听你说，不评判、不急着给建议。\n\n你可以聊聊今天发生了什么，或者记录一下现在的心情——说出来了，心里会轻一点。`,
  };
}

function generateSuggestion(
  categories: string[],
  ctx: ReturnType<typeof getRecentMoodContext>
): { text: string; link: string } {
  if (categories.includes('anxious')) {
    return { text: '试试 3 分钟 478 呼吸法', link: '/action/breathing-478' };
  }
  if (categories.includes('sad')) {
    return { text: '试试 3 分钟安全岛想象', link: '/action/firstaid-safeplace' };
  }
  if (categories.includes('tired')) {
    return { text: '试试 3 分钟身体扫描', link: '/action/mindfulness-body' };
  }
  if (categories.includes('angry')) {
    return { text: '试试 3 分钟 5-4-3-2-1 接地法', link: '/action/firstaid-54321' };
  }
  if (categories.includes('study')) {
    return { text: '记录一下今天的学习', link: '/study' };
  }
  if (categories.includes('sleep')) {
    return { text: '试试 3 分钟渐进式肌肉放松', link: '/action/relax-pmr' };
  }
  if (categories.includes('self')) {
    return { text: '试试 3 分钟积极自我对话', link: '/action/cognitive-positive' };
  }
  if (ctx.negativeStreak >= 3) {
    return { text: '试试微行动，让自己好一点', link: '/actions' };
  }
  return { text: '', link: '' };
}

// 生成开场白
export function getGreeting(moodRecords: MoodRecord[]): string {
  const hour = new Date().getHours();
  let timeGreeting = '';
  if (hour < 6) timeGreeting = '夜深了';
  else if (hour < 12) timeGreeting = '早上好';
  else if (hour < 18) timeGreeting = '下午好';
  else timeGreeting = '晚上好';

  if (moodRecords.length === 0) {
    return `${timeGreeting}，我是晴语 🌱\n\n我会在这里听你说，不评判、不急着给建议。聊什么都行——今天发生了什么、心情怎么样、或者随便说说。\n\n你可以从下面的话题开始，也可以直接打字告诉我。`;
  }

  const ctx = getRecentMoodContext(moodRecords);
  if (ctx.latest) {
    const moodLabel = MOOD_CONFIG[ctx.latest.moodType].label;
    const emoji = MOOD_CONFIG[ctx.latest.moodType].emoji;
    if (ctx.trend === 'down') {
      return `${timeGreeting}，你来了。\n\n我注意到你最近的情绪在走低，今天记的是 ${emoji}「${moodLabel}」。\n\n不用假装没事，我在这里。想聊聊吗？`;
    }
    return `${timeGreeting}，你来了 ☀️\n\n今天你的心情是 ${emoji}「${moodLabel}」，${ctx.latest.note ? `你说「${ctx.latest.note}」` : '感觉怎么样？'}\n\n有什么想聊的吗？`;
  }

  return `${timeGreeting}，我是晴语 🌱\n\n今天还没记录心情呢。不急，先聊聊也行。`;
}
