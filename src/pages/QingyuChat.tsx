import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Sparkles, ArrowRight } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import { useAppStore } from '@/store/useAppStore';
import {
  generateResponse,
  getGreeting,
  QUICK_REPLIES,
  ChatMessage,
} from '@/utils/chatEngine';
import { cn } from '@/lib/utils';

export default function QingyuChat() {
  const navigate = useNavigate();
  const { moodRecords, studyRecords } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  // 初始化开场白
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const greeting = getGreeting(moodRecords);
    setMessages([
      {
        id: 'greeting',
        role: 'qingyu',
        content: greeting,
        timestamp: Date.now(),
      },
    ]);
  }, [moodRecords]);

  // 自动滚动到底部
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isTyping]);

  const handleSend = (text?: string) => {
    const content = text ?? input.trim();
    if (!content) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // 模拟思考延迟
    setTimeout(() => {
      const response = generateResponse(content, moodRecords, studyRecords);
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  };

  return (
    <PageContainer title="晴语" showBack>
      <div className="flex flex-col h-screen pb-32">
        {/* 对话区域 */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-2.5 animate-fade-in',
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              {/* 头像 */}
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm',
                  msg.role === 'qingyu'
                    ? 'bg-gradient-to-br from-orange-100 to-amber-100'
                    : 'bg-gradient-to-br from-blue-100 to-cyan-100'
                )}
              >
                {msg.role === 'qingyu' ? '🌱' : '😊'}
              </div>

              {/* 消息气泡 */}
              <div
                className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-2.5',
                  msg.role === 'qingyu'
                    ? 'bg-white border border-warm-100 rounded-tl-md'
                    : 'bg-gradient-to-br from-primary-400 to-primary-500 text-white rounded-tr-md'
                )}
              >
                <p className="text-sm leading-relaxed whitespace-pre-line">
                  {msg.content}
                </p>

                {/* 附带建议 */}
                {msg.suggestion && msg.suggestionLink && (
                  <button
                    onClick={() => navigate(msg.suggestionLink!)}
                    className="mt-2.5 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors w-full"
                  >
                    <Sparkles size={14} className="text-amber-500 flex-shrink-0" />
                    <span className="text-xs text-amber-700 font-medium flex-1 text-left">
                      {msg.suggestion}
                    </span>
                    <ArrowRight size={12} className="text-amber-400" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* 打字动画 */}
          {isTyping && (
            <div className="flex gap-2.5 animate-fade-in">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm bg-gradient-to-br from-orange-100 to-amber-100">
                🌱
              </div>
              <div className="bg-white border border-warm-100 rounded-2xl rounded-tl-md px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 快速回复 */}
        {messages.length <= 1 && (
          <div className="px-4 py-2">
            <div className="flex flex-wrap gap-2">
              {QUICK_REPLIES.map((reply) => (
                <button
                  key={reply}
                  onClick={() => handleSend(reply)}
                  className="px-3 py-1.5 rounded-full bg-warm-50 hover:bg-warm-100 text-warm-700 text-xs font-medium border border-warm-100 transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 输入框 */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-sm border-t border-warm-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="跟晴语说说心里话..."
              className="flex-1 px-4 py-2.5 rounded-full bg-warm-50 border border-warm-100 text-sm focus:outline-none focus:border-primary-300 focus:bg-white transition-colors"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                input.trim() && !isTyping
                  ? 'bg-gradient-to-br from-primary-400 to-primary-500 text-white active:scale-95'
                  : 'bg-gray-100 text-gray-300'
              )}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
