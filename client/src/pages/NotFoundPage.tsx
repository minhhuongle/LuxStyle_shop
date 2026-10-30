import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="py-24 max-w-md mx-auto text-center space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-xl">
        <Sparkles className="w-10 h-10" />
      </div>
      <div>
        <h1 className="font-serif text-4xl font-extrabold text-white">404</h1>
        <h2 className="font-serif text-xl font-bold text-zinc-200 mt-2">Trang Không Tồn Tại</h2>
        <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
          Đường dẫn quý khách truy cập không tồn tại hoặc đã được cập nhật sang địa chỉ mới.
        </p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors shadow-lg shadow-amber-500/20"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Về trang chủ LuxeStyle</span>
      </Link>
    </div>
  );
};
