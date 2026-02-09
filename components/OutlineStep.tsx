import React from 'react';
import { OutlineSection } from '../types';

interface OutlineStepProps {
  topic: string;
  outline: OutlineSection[];
  onBack: () => void;
  onGenerateFull: () => void;
  isProcessing: boolean;
}

const OutlineStep: React.FC<OutlineStepProps> = ({ topic, outline, onBack, onGenerateFull, isProcessing }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden neon-border">
          <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Dàn ý đề xuất cho đề tài:</h3>
              <p className="text-primary font-medium italic mt-1">"{topic}"</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onBack}
                disabled={isProcessing}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 font-medium transition-colors"
              >
                Quay lại
              </button>
              <button
                onClick={onGenerateFull}
                disabled={isProcessing}
                className="flex items-center px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold shadow-md transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(251,191,36,0.8)]"
              >
                {isProcessing ? 'Đang viết...' : 'Bắt đầu viết chi tiết'}
                {!isProcessing && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto bg-paper custom-scrollbar">
            <div className="space-y-4">
              {outline.map((section) => (
                <div 
                  key={section.id} 
                  className={`p-4 rounded-lg border transition-colors ${
                    section.isHeading 
                      ? 'bg-purple-50 border-purple-200' 
                      : 'bg-white border-gray-200 ml-4 hover:border-yellow-400 hover:shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <h4 className={`font-bold ${section.isHeading ? 'text-primary text-lg' : 'text-gray-800'}`}>
                      {section.title}
                    </h4>
                  </div>
                  {!section.isHeading && (
                    <p className="text-sm text-gray-500 mt-2 bg-gray-50 p-2 rounded border border-gray-100">
                      <span className="font-semibold text-gray-700">Hướng dẫn AI:</span> {section.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="text-center text-sm text-yellow-200 mt-4 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]">
          * Kiểm tra kỹ dàn ý trước khi nhấn "Bắt đầu viết". AI sẽ dựa vào các hướng dẫn trên để viết nội dung.
        </p>
      </div>
    </div>
  );
};

export default OutlineStep;