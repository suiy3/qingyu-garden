/**
 * 今日对话卡生成引擎
 * 根据情绪和学习数据，生成个性化、可直接使用的对话建议
 */

import { MoodRecord, StudyRecord, MoodType, SubjectType, TriggerType } from '@/types';
import { MOOD_CONFIG, SUBJECT_CONFIG, TRIGGER_CONFIG } from '@/utils/constants';
import { formatDate, getPastDays, getDayOfWeek } from '@/utils/date';

export interface DialogCard {
  id: string;
  date: string;
  cardType: 'mood' | 'study' | 'mixed' | 'positive';
  title: string;
  subtitle: string;
  background: string;
  accentColor: string;
  openingLines: string[];
  dontSay: string[];
  tip: string;
  reason: string;
  dataSource: string;
}

const CARD_BACKGROUNDS: Record<string, string> = {
  mood: 'from-purple-500 via-pink-500 to-rose-500',
  study: 'from-blue-500 via-cyan-500 to-teal-500',
  mixed: 'from-amber-500 via-orange-500 to-rose-500',
  positive: 'from-emerald-500 via-green-500 to-teal-500',
};

const MOOD_OPENING_LINES: Record<MoodType, (subject?: string, trigger?: TriggerType) => string[]> = {
  anxious: (subject, trigger) => [
    `我注意到最近${subject ? `学${subject}的时候` : ''}你好像有点紧，是怕哪块没把握吗？`,
    `这周${trigger === 'study' ? '学习压力' : '事情'}是不是有点多？愿意跟我说说吗？`,
    `如果感觉焦虑的话，要不要一起想想能做点什么让它好一点？`,
  ],
  sad: (subject, trigger) => [
    `你最近看起来有点不开心，发生什么事了吗？`,
    `我注意到你这几天话不多，是有什么心事吗？`,
    `难过的时候，想不想找个人聊聊？我在这呢。`,
  ],
  angry: (subject, trigger) => [
    `我看你今天好像有点火气，是什么事情让你这么生气？`,
    `感觉你心里憋着股劲儿，愿意跟我说说吗？`,
    `生气是正常的，我不会说"别生气"，你可以跟我说说发生了什么。`,
  ],
  tired: (subject, trigger) => [
    `看你好像有点累，今天要不要早点休息？`,
    `最近是不是太累了？给自己放会儿假吧。`,
    `累了就歇会儿，天塌不下来。需要我帮你做点什么吗？`,
  ],
  happy: (subject, trigger) => [
    `看你今天心情不错，有什么好事吗？说出来让我也开心开心。`,
    `我注意到你最近状态不错，是有什么开心的事吗？`,
    `跟我分享分享，最近有什么好玩的事？`,
  ],
  calm: (subject, trigger) => [
    `今天感觉怎么样？有没有什么想聊的？`,
    `最近有没有遇到什么有趣的事？`,
    `想聊点什么？我听着呢。`,
  ],
};

const DONT_SAY_LINES: Record<MoodType, string[]> = {
  anxious: [
    '"这有什么好焦虑的，想多了吧"',
    '"你就是平时不努力，现在知道急了？"',
    '"别想那么多，好好学习就行"',
  ],
  sad: [
    '"这点小事至于吗"',
    '"你就是太脆弱了"',
    '"哭什么哭，坚强一点"',
  ],
  angry: [
    '"你发什么脾气！"',
    '"我是为你好"',
    '"你再说一遍试试！"',
  ],
  tired: [
    '"你就是懒，一天到晚喊累"',
    '"别人家孩子也学习，怎么就你累"',
    '"累什么累，快去写作业"',
  ],
  happy: [
    '"别光开心，赶紧去学习"',
    '"骄傲使人退步"',
    '"这有什么好高兴的"',
  ],
  calm: [
    '"你怎么一点上进心都没有"',
    '"别人都在努力，你怎么还这么闲"',
    '"一天到晚就知道玩"',
  ],
};

const STUDY_OPENING_LINES: Record<SubjectType, (minutes: number, isTrend: 'up' | 'down' | 'same') => string[]> = {
  chinese: (minutes, trend) => [
    `最近花了${minutes}分钟学语文，感觉怎么样？有没有遇到什么有意思的文章？`,
    `我看你最近语文花了不少时间，是在准备什么吗？`,
    `语文学习中，你最喜欢哪部分？是阅读还是写作？`,
  ],
  math: (minutes, trend) => [
    `最近数学学得怎么样？有没有哪块觉得特别难的？`,
    `这星期你在数学上花了${minutes}分钟，感觉进步大吗？`,
    `数学里，你觉得最有趣的是什么？最头疼的又是什么？`,
  ],
  english: (minutes, trend) => [
    `最近英语学得怎么样？有没有遇到什么好玩的单词或句子？`,
    `我注意到你最近英语学习挺认真的，感觉有进步吗？`,
    `英语听说读写，你最喜欢哪一项？`,
  ],
  physics: (minutes, trend) => [
    `最近物理在学什么？有没有什么有意思的实验？`,
    `物理这块，你觉得最有意思的是什么？最绕的又是什么？`,
    `学物理的时候，有没有什么"哦原来是这样"的瞬间？`,
  ],
  chemistry: (minutes, trend) => [
    `化学最近在学什么？有没有什么有趣的实验？`,
    `元素周期表背到哪了？有没有什么好记的小技巧？`,
    `化学里，你觉得最神奇的是什么反应？`,
  ],
  other: (minutes, trend) => [
    `最近在学什么呀？感觉有意思吗？`,
    `最近你花时间最多的是什么？跟我分享分享？`,
    `学习中，你最感兴趣的是什么？`,
  ],
};

const STUDY_DONT_SAY: Record<SubjectType, string[]> = {
  chinese: ['"语文有什么难的，背背就行了"', '"你就是懒，不肯背书"'],
  math: ['"数学不好就是笨"', '"这么简单的题都不会，上课听什么了？"'],
  english: ['"英语有什么难的，多背不就完了"', '"你就是不肯开口"'],
  physics: ['"物理有什么难的，理解了就行"', '"女生就是学不好物理"'],
  chemistry: ['"化学不就是背方程式吗"', '"这都记不住，脑子装什么了？"'],
  other: ['"学这些没用的干什么"', '"有时间多看看主科"'],
};

const POSITIVE_REINFORCEMENT = [
  {
    opening: [
      '看你最近状态不错，我特别开心。你是怎么做到的？',
      '我发现你最近______特别好，能跟我分享分享吗？',
      '你最近的进步我都看到了，为你骄傲。',
    ],
    dontSay: [
      '"别骄傲，还差得远呢"',
      '"这有什么，别人比你强多了"',
      '"继续保持，下次考不好看我怎么说你"',
    ],
    tip: '表扬要具体，要真诚，不要总加个"但是"来转折。',
  },
];

const GENERAL_TIPS = [
  '先听再讲，听比说重要。孩子说的时候，别急着给建议。',
  '用"我"开头表达关心，不用"你"开头指责。',
  '如果孩子说"没事"，不要追问，说"好吧，想说的时候随时找我"就够了。',
  '吃饭的时候聊点轻松的，别一上桌就问成绩。',
  '沟通不是为了"赢"，而是为了"懂"。',
  '孩子愿意跟你说废话，才是真的信任你。',
];

/**
 * 分析最近7天数据，生成今日对话卡
 */
export function generateDialogCard(
  moodRecords: MoodRecord[],
  studyRecords: StudyRecord[]
): DialogCard {
  const today = formatDate(new Date());
  const past7Days = getPastDays(7);

  // 筛选最近7天的数据
  const recentMoods = moodRecords.filter((m) =>
    past7Days.includes(formatDate(m.createdAt))
  );
  const recentStudies = studyRecords.filter((s) =>
    past7Days.includes(formatDate(s.createdAt))
  );

  // 如果数据很少，返回通用入门卡
  if (recentMoods.length < 2 && recentStudies.length < 2) {
    return {
      id: `card-${today}-starter`,
      date: today,
      cardType: 'positive',
      title: '开启对话的第一步',
      subtitle: '从一个轻松的问题开始',
      background: CARD_BACKGROUNDS.positive,
      accentColor: '#10B981',
      openingLines: [
        '今天在学校有没有什么好玩的事？',
        '你最近在追什么剧/听什么歌？跟我安利安利？',
        '如果可以有一整天的自由时间，你想做什么？',
      ],
      dontSay: [
        '"今天考试了吗？考多少分？"',
        '"作业写完了吗就玩？"',
        '"一天到晚就知道玩手机"',
      ],
      tip: '第一次开启对话，选一个轻松的话题。不要一开口就问学习，先让孩子习惯跟你聊天。',
      reason: '这是你们的第一张对话卡，从轻松的话题开始建立沟通习惯。',
      dataSource: '基于初始数据',
    };
  }

  // 分析情绪状态
  const negativeMoods = recentMoods.filter((m) =>
    ['anxious', 'sad', 'angry', 'tired'].includes(m.moodType) && m.intensity >= 5
  );
  const hasNegative = negativeMoods.length > 0;

  // 找到最强的负面情绪
  let dominantNegative: MoodType | null = null;
  let dominantTrigger: TriggerType | null = null;
  let maxIntensity = 0;

  negativeMoods.forEach((m) => {
    if (m.intensity > maxIntensity) {
      maxIntensity = m.intensity;
      dominantNegative = m.moodType;
      dominantTrigger = m.triggers[0] || null;
    }
  });

  // 分析学习数据 - 找学习时长最多的科目
  const subjectMinutes: Record<string, number> = {};
  recentStudies.forEach((s) => {
    subjectMinutes[s.subject] = (subjectMinutes[s.subject] || 0) + s.duration;
  });

  const topSubject = Object.entries(subjectMinutes)
    .sort((a, b) => b[1] - a[1])[0];

  // 找情绪最差的那天对应的学习科目
  let negativeDaySubject: SubjectType | null = null;
  if (dominantNegative) {
    const worstMoodDay = negativeMoods.reduce((worst, m) =>
      m.intensity > worst.intensity ? m : worst
    );
    const worstDay = formatDate(worstMoodDay.createdAt);
    const dayStudies = recentStudies.filter(
      (s) => formatDate(s.createdAt) === worstDay
    );
    if (dayStudies.length > 0) {
      negativeDaySubject = dayStudies[0].subject;
    }
  }

  // 判断卡片类型
  let cardType: DialogCard['cardType'] = 'positive';
  if (hasNegative && topSubject) {
    cardType = 'mixed';
  } else if (hasNegative) {
    cardType = 'mood';
  } else if (topSubject) {
    cardType = 'study';
  }

  // 生成卡片内容
  if (cardType === 'mixed' && dominantNegative && topSubject) {
    const subjectLabel = SUBJECT_CONFIG[topSubject[0] as SubjectType].label;
    const moodConfig = MOOD_CONFIG[dominantNegative];
    const openings = MOOD_OPENING_LINES[dominantNegative](subjectLabel, dominantTrigger || undefined);
    const dontSays = DONT_SAY_LINES[dominantNegative];

    return {
      id: `card-${today}-mixed`,
      date: today,
      cardType: 'mixed',
      title: `从${subjectLabel}切入聊聊`,
      subtitle: `最近${moodConfig.label}情绪偏多`,
      background: CARD_BACKGROUNDS.mixed,
      accentColor: '#F97316',
      openingLines: openings,
      dontSay: dontSays,
      tip: `从学习切入，但重点是关心人，不是关心分数。先问感受，再问具体困难。`,
      reason: `近7天有${negativeMoods.length}天${moodConfig.label}情绪，同时${subjectLabel}学习时长最多，可能是压力来源之一。`,
      dataSource: `情绪记录${recentMoods.length}条 + 学习记录${recentStudies.length}条`,
    };
  }

  if (cardType === 'mood' && dominantNegative) {
    const moodConfig = MOOD_CONFIG[dominantNegative];
    const openings = MOOD_OPENING_LINES[dominantNegative](undefined, dominantTrigger || undefined);
    const dontSays = DONT_SAY_LINES[dominantNegative];

    return {
      id: `card-${today}-mood`,
      date: today,
      cardType: 'mood',
      title: `关心一下${moodConfig.label}的你`,
      subtitle: `最近${moodConfig.label}情绪出现了${negativeMoods.length}次`,
      background: CARD_BACKGROUNDS.mood,
      accentColor: '#EC4899',
      openingLines: openings,
      dontSay: dontSays,
      tip: '不要急着"解决问题"，先接住情绪。很多时候，孩子只是需要一个倾听的人。',
      reason: `近7天${moodConfig.label}情绪出现了${negativeMoods.length}次，其中最高强度${maxIntensity}/10。`,
      dataSource: `情绪记录${recentMoods.length}条`,
    };
  }

  if (cardType === 'study' && topSubject) {
    const subject = topSubject[0] as SubjectType;
    const minutes = Math.round(topSubject[1]);
    const openings = STUDY_OPENING_LINES[subject](minutes, 'same');
    const dontSays = STUDY_DONT_SAY[subject];

    return {
      id: `card-${today}-study`,
      date: today,
      cardType: 'study',
      title: `聊聊${SUBJECT_CONFIG[subject].label}`,
      subtitle: `本周花了约${minutes}分钟在这上面`,
      background: CARD_BACKGROUNDS.study,
      accentColor: '#06B6D4',
      openingLines: openings,
      dontSay: dontSays,
      tip: '从兴趣入手，而不是从成绩入手。先问"你觉得哪里有意思"，再问"有没有困难"。',
      reason: `${SUBJECT_CONFIG[subject].label}是近7天学习时长最多的科目，约${minutes}分钟。`,
      dataSource: `学习记录${recentStudies.length}条`,
    };
  }

  // 积极状态卡
  const positiveMoods = recentMoods.filter(
    (m) => m.moodType === 'happy' || m.moodType === 'calm'
  );
  const positiveRate =
    recentMoods.length > 0 ? positiveMoods.length / recentMoods.length : 0;

  if (positiveRate >= 0.6) {
    const reinforcement = POSITIVE_REINFORCEMENT[0];
    return {
      id: `card-${today}-positive`,
      date: today,
      cardType: 'positive',
      title: '肯定一下孩子',
      subtitle: `最近状态不错，积极情绪占${Math.round(positiveRate * 100)}%`,
      background: CARD_BACKGROUNDS.positive,
      accentColor: '#10B981',
      openingLines: reinforcement.opening,
      dontSay: reinforcement.dontSay,
      tip: reinforcement.tip,
      reason: `近7天积极情绪占比${Math.round(positiveRate * 100)}%，整体状态不错，这时候表达肯定效果最好。`,
      dataSource: `情绪记录${recentMoods.length}条`,
    };
  }

  // 默认返回通用卡
  const randomTip = GENERAL_TIPS[Math.floor(Math.random() * GENERAL_TIPS.length)];
  return {
    id: `card-${today}-general`,
    date: today,
    cardType: 'positive',
    title: '今天的沟通练习',
    subtitle: '从一个好问题开始',
    background: CARD_BACKGROUNDS.positive,
    accentColor: '#10B981',
    openingLines: [
      '今天过得怎么样？有没有什么想聊的？',
      '最近有没有遇到什么让你眼前一亮的事？',
      '如果让你用一个词形容今天，会是什么？',
    ],
    dontSay: [
      '"作业写了吗？"',
      '"今天考试了吗？"',
      '"别玩了快去学习"',
    ],
    tip: randomTip,
    reason: '选择一个轻松的开场，让孩子习惯跟你聊天。',
    dataSource: `情绪记录${recentMoods.length}条 + 学习记录${recentStudies.length}条`,
  };
}

/**
 * 生成历史对话卡（最近7天）
 */
export function generateHistoryCards(
  moodRecords: MoodRecord[],
  studyRecords: StudyRecord[],
  days = 7
): DialogCard[] {
  const cards: DialogCard[] = [];
  const pastDays = getPastDays(days);

  // 简单处理：只生成"今天"的详细卡，其余天返回精简版
  // 实际应用中可以为每天生成独立的卡
  const todayCard = generateDialogCard(moodRecords, studyRecords);
  cards.push(todayCard);

  return cards;
}
