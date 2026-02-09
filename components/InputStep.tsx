import React, { useState } from 'react';

interface InputStepProps {
  onNext: (topic: string, author: string, school: string) => void;
  isProcessing: boolean;
}

const InputStep: React.FC<InputStepProps> = ({ onNext, isProcessing }) => {
  const [topic, setTopic] = useState('');
  const [author, setAuthor] = useState('');
  const [school, setSchool] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onNext(topic, author, school);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 transform transition-all hover:scale-[1.005] neon-border">
        <div className="mb-6 text-center">
          {/* Yellow Icon Background and Shadow */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-50 text-secondary mb-4 shadow-[0_0_20px_rgba(251,191,36,0.5)] border border-yellow-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Bắt đầu viết sáng kiến</h2>
          <p className="text-gray-500">Nhập tên đề tài của bạn, AI sẽ giúp bạn xây dựng khung ý tưởng và viết nội dung chi tiết.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
              Tên đề tài Sáng kiến kinh nghiệm <span className="text-red-500">*</span>
            </label>
            <textarea
              id="topic"
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary focus:border-transparent focus:shadow-[0_0_15px_rgba(251,191,36,0.4)] transition-all resize-none"
              placeholder="Ví dụ: Một số biện pháp ứng dụng công nghệ thông tin và AI vào giảng dạy môn Âm nhạc lớp 4"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
              disabled={isProcessing}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                Tác giả (Tuỳ chọn)
              </label>
              <input
                type="text"
                id="author"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary focus:border-transparent focus:shadow-[0_0_15px_rgba(251,191,36,0.4)] transition-all"
                placeholder="Nguyễn Văn A"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                disabled={isProcessing}
              />
            </div>
            <div>
              <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-1">
                Đơn vị công tác (Tuỳ chọn)
              </label>
              <input
                type="text"
                id="school"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary focus:border-transparent focus:shadow-[0_0_15px_rgba(251,191,36,0.4)] transition-all"
                placeholder="Trường THCS..."
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                disabled={isProcessing}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!topic.trim() || isProcessing}
            className={`w-full flex items-center justify-center py-3 px-6 rounded-lg text-white font-semibold text-lg transition-all shadow-md relative overflow-hidden group
              ${!topic.trim() || isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-purple-700 hover:shadow-[0_0_20px_rgba(251,191,36,0.8)] border border-yellow-500/50'}`}
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang phân tích đề tài...
              </>
            ) : (
              <>
                Lập dàn ý chi tiết
                {/* Shine effect */}
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-yellow-200 opacity-30 group-hover:animate-shine" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InputStep;