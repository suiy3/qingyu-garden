import { useNavigate } from 'react-router-dom';
import {
  Phone,
  AlertTriangle,
  Stethoscope,
  ChevronRight,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/common/Card';

const hotlines = [
  {
    name: '全国心理援助热线',
    number: '400-161-9995',
    description: '24小时免费心理危机干预服务',
  },
  {
    name: '北京心理危机研究与干预中心',
    number: '010-82951332',
    description: '专业心理危机干预机构',
  },
  {
    name: '青少年服务热线',
    number: '12355',
    description: '青少年心理咨询与法律援助',
  },
  {
    name: '希望24热线',
    number: '400-161-9995',
    description: '生命教育与危机干预热线',
  },
];

const warningSigns = [
  '长期情绪低落、哭泣，对以往喜欢的事情失去兴趣',
  '明显的睡眠障碍（失眠或嗜睡）',
  '食欲明显改变，体重骤增或骤减',
  '回避社交，与家人朋友疏远',
  '学习成绩大幅下滑，注意力难以集中',
  '经常表达无助、无望感，说"活着没意义"之类的话',
  '将珍贵物品送人，或与亲友反常道别',
  '出现自伤行为或谈论自杀计划',
  '情绪突然反常地平静（可能已做出决定）',
];

const whenToSeekHelp = [
  '孩子持续两周以上情绪低落，影响正常学习生活',
  '出现自伤行为或自杀念头',
  '睡眠、饮食出现严重问题',
  '人际关系严重受损，无法正常上学',
  '家族中有精神疾病史',
];

const helpChannels = [
  { name: '学校心理老师', desc: '最便捷的求助途径，可提供初步心理支持' },
  { name: '医院心理科/精神科', desc: '可进行专业诊断和治疗，必要时配合药物' },
  { name: '专业心理咨询机构', desc: '提供长期系统的心理咨询服务' },
  { name: '心理援助热线', desc: '24小时可用，适合紧急情况' },
];

export default function ParentCrisis() {
  const navigate = useNavigate();

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <PageContainer title="危机引导" showBack>
      <div className="px-4 py-4 space-y-4 pb-8">
        {/* 紧急热线 - 红色突出 */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-red-600" />
            <h3 className="text-base font-semibold text-red-800">紧急求助热线</h3>
          </div>
          <p className="text-sm text-red-700/80 mb-4">
            如果孩子出现自伤或自杀念头，请立即拨打以下热线
          </p>
          <div className="space-y-2">
            {hotlines.slice(0, 3).map((hotline, index) => (
              <button
                key={index}
                onClick={() => handleCall(hotline.number)}
                className="w-full bg-white border border-red-100 rounded-lg p-3 flex items-center gap-3 hover:bg-red-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Phone size={16} className="text-red-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm text-gray-900">{hotline.name}</p>
                  <p className="text-xs text-gray-500">{hotline.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">{hotline.number}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 危险信号识别 */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-amber-600" />
            <h3 className="text-base font-semibold text-gray-900">危险信号识别</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            如果孩子出现以下情况，请提高警惕：
          </p>
          <div className="space-y-2">
            {warningSigns.map((sign, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-sm"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                <span className="text-gray-700">{sign}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* 何时寻求专业帮助 */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Stethoscope size={18} className="text-blue-600" />
            <h3 className="text-base font-semibold text-gray-900">何时寻求专业帮助</h3>
          </div>
          <div className="space-y-2">
            {whenToSeekHelp.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-sm"
              >
                <ChevronRight size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* 求助途径 */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <ExternalLink size={18} className="text-slate-600" />
            <h3 className="text-base font-semibold text-gray-900">建议的求助途径</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {helpChannels.map((channel, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 rounded-lg"
              >
                <h5 className="font-medium text-gray-800 text-sm mb-1">
                  {channel.name}
                </h5>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {channel.desc}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* 全部热线 */}
        <Card className="p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">全部求助热线</h3>
          <div className="space-y-0">
            {hotlines.map((hotline, index) => (
              <button
                key={index}
                onClick={() => handleCall(hotline.number)}
                className="w-full flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-4 px-4 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{hotline.name}</p>
                  <p className="text-xs text-gray-500">{hotline.description}</p>
                </div>
                <div className="flex items-center gap-1 text-blue-600">
                  <span className="text-sm font-medium">{hotline.number}</span>
                  <Phone size={14} />
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* 底部提醒 */}
        <div className="text-center py-4">
          <p className="text-sm text-gray-600 font-medium">每一个生命都值得被重视</p>
          <p className="text-xs text-gray-400 mt-1">您的关心和及时行动，是孩子最好的保护</p>
        </div>
      </div>
    </PageContainer>
  );
}
