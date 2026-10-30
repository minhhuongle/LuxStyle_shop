import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ShoppingBag,
  RotateCcw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { chatApi } from '../../services/api';
import { ChatMessage, ChatProductRecommendation } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';

const INITIAL_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    'Kính chào quý khách! Tôi là AI Stylist của LuxeStyle. Quý khách đang tìm kiếm trang phục dạ tiệc, phụ kiện da thủ công hay cần gợi ý phối đồ theo phong cách nào hôm nay?',
  timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
};

const SUGGESTION_PROMPTS = [
  'Gợi ý đầm dạ tiệc lụa sang trọng',
  'Tư vấn túi xách da bò thật',
  'Đồng hồ cơ automatic thanh lịch',
  'Chính sách giao hàng và đổi trả',
];

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addToCart } = useCart();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setLoading(true);

    try {
      // Backend POST /api/chat expects { message, history: [{ role, content }] }
      const historyPayload = newHistory
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const response = await chatApi.sendMessage(userMsg.content, historyPayload);

      const botMsg: ChatMessage = {
        role: 'assistant',
        content: response.reply,
        suggested_products: response.suggested_products,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content:
          'Xin lỗi quý khách, hệ thống AI đang nâng cấp kết nối hoặc quá tải. Quý khách vui lòng thử lại sau giây lát hoặc liên hệ hotline chăm sóc khách hàng.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetChat = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* 1. Floating Action Button (FAB) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 text-zinc-950 shadow-2xl shadow-amber-500/40 hover:scale-110 active:scale-95 transition-all duration-300"
          title="Tư vấn phong cách cùng AI Stylist"
        >
          {/* Subtle pulse ring */}
          <span className="absolute -inset-1 rounded-full bg-amber-400/30 animate-ping -z-10" />
          <Sparkles className="w-6 h-6 text-zinc-950 group-hover:rotate-12 transition-transform duration-300" />
          <span className="sr-only">Mở AI Chatbot</span>

          {/* Tooltip hint on hover */}
          <span className="absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-zinc-900/90 text-amber-300 border border-amber-500/20 text-xs font-medium whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            ✨ Tư vấn phong cách AI
          </span>
        </button>
      )}

      {/* 2. Chat Pop-up Box */}
      {isOpen && (
        <div className="flex flex-col w-[360px] sm:w-[420px] h-[580px] max-h-[85vh] rounded-3xl bg-zinc-900/95 border border-amber-500/30 shadow-2xl backdrop-blur-2xl overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-zinc-900 via-[#161722] to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-zinc-950 shadow-md">
                  <Bot className="w-5 h-5 text-zinc-950" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-900" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif font-bold text-sm text-zinc-100">AI Stylist Advisor</h3>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">Trợ lý thời trang & Phụ kiện cao cấp</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                title="Làm mới cuộc trò chuyện"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                title="Đóng chatbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role !== 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-amber-500 text-zinc-950 font-medium rounded-tr-sm'
                      : 'bg-zinc-800/90 text-zinc-200 border border-zinc-700/60 rounded-tl-sm'
                  }`}
                >
                  <p className="whitespace-pre-line text-[13px]">{msg.content}</p>

                  {/* Render Suggested Products from AI */}
                  {msg.suggested_products && msg.suggested_products.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-zinc-700/60 space-y-2">
                      <p className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Sản phẩm gợi ý cho bạn:</span>
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {msg.suggested_products.map((prod) => (
                          <div
                            key={prod.id}
                            className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/90 border border-zinc-700 hover:border-amber-500/40 transition-all text-left"
                          >
                            <img
                              src={
                                prod.image_url ||
                                'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80'
                              }
                              alt={prod.name}
                              className="w-12 h-12 rounded-lg object-cover shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-zinc-200 truncate text-xs">
                                {prod.name}
                              </p>
                              <p className="text-[11px] text-amber-400 font-bold">
                                {formatCurrency(prod.price)}
                              </p>
                            </div>
                            <Link
                              to={`/products/${prod.id}`}
                              onClick={() => setIsOpen(false)}
                              className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-amber-500 hover:text-black transition-colors"
                              title="Xem chi tiết"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {msg.timestamp && (
                    <span
                      className={`block text-[10px] mt-1 text-right ${
                        msg.role === 'user' ? 'text-zinc-800' : 'text-zinc-500'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center shrink-0 border border-zinc-700">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {/* AI Typing Indicator */}
            {loading && (
              <div className="flex gap-2.5 items-center">
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="bg-zinc-800/90 border border-zinc-700/60 rounded-2xl rounded-tl-sm px-4 py-2.5 text-zinc-400 flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] ml-1 text-zinc-400">Stylist đang phân tích...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Suggestions */}
          <div className="px-4 py-2 bg-zinc-950/40 border-t border-zinc-800/60 overflow-x-auto no-scrollbar flex gap-1.5">
            {SUGGESTION_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-amber-300 border border-zinc-700/80 transition-colors shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Field */}
          <div className="p-3 bg-zinc-900 border-t border-zinc-800">
            <div className="flex items-center gap-2 bg-zinc-950/80 border border-zinc-800 focus-within:border-amber-500/60 rounded-2xl px-3 py-2 transition-all">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi tư vấn phối đồ, phụ kiện..."
                disabled={loading}
                className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || loading}
                className={`p-2 rounded-xl transition-all ${
                  inputMessage.trim() && !loading
                    ? 'bg-amber-500 text-zinc-950 hover:bg-amber-400 active:scale-95'
                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                }`}
                title="Gửi tin nhắn"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
