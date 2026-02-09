import React, { useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import Layout from './components/Layout';
import OutlineStep from './components/OutlineStep';
import ResultStep from './components/ResultStep';
import ProcessingOverlay from './components/ProcessingOverlay';
import { OutlineSection, FullDocument, GeneratedContent } from './types';
import { INITIAL_STRUCTURE_TEMPLATE } from './constants';
import { generateCustomizedOutline, generateSectionContent } from './services/geminiService';

enum MenuTab {
  TOPIC = 1,
  AUTHOR = 2,
  UNIT = 3,
  OUTLINE = 4,
  WRITE = 5,
  DOWNLOAD = 6,
  POLICY = 7,
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MenuTab>(MenuTab.TOPIC);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Data State
  const [topic, setTopic] = useState('');
  const [author, setAuthor] = useState('');
  const [school, setSchool] = useState('');
  const [outline, setOutline] = useState<OutlineSection[]>([]);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [customInstruction, setCustomInstruction] = useState('');
  
  // Writing Process State
  const [progress, setProgress] = useState(0);
  const [currentWritingSection, setCurrentWritingSection] = useState('');
  const [isWritingComplete, setIsWritingComplete] = useState(false);

  // --- Handlers ---

  const handleGenerateOutline = async () => {
    if (!topic.trim()) {
      alert("Vui lòng nhập tên đề tài trước!");
      setActiveTab(MenuTab.TOPIC);
      return;
    }
    
    setIsProcessing(true);
    // 1. Get Base Template
    const baseTemplate = INITIAL_STRUCTURE_TEMPLATE(topic);

    // 2. Customize it using AI
    try {
      const customOutline = await generateCustomizedOutline(topic, baseTemplate);
      setOutline(customOutline);
      setIsProcessing(false);
    } catch (error) {
      console.error("Failed to generate outline", error);
      alert("Có lỗi xảy ra khi tạo dàn ý. Vui lòng thử lại.");
      setIsProcessing(false);
    }
  };

  const handleStartWriting = useCallback(async () => {
    if (outline.length === 0) {
      alert("Vui lòng lập dàn ý trước (Mục 4)!");
      setActiveTab(MenuTab.OUTLINE);
      return;
    }

    setIsProcessing(true);
    setIsWritingComplete(false);
    setGeneratedContent([]);
    setProgress(0);
    
    const contents: GeneratedContent[] = [];
    const totalSections = outline.length;

    for (let i = 0; i < totalSections; i++) {
      const section = outline[i];
      setCurrentWritingSection(section.title);
      
      let contentText = "";
      
      if (!section.isHeading) {
        // Call AI for content
        contentText = await generateSectionContent(topic, section, customInstruction);
      }

      contents.push({
        sectionId: section.id,
        title: section.title,
        content: contentText
      });

      // Update State incrementally
      setGeneratedContent([...contents]);
      setProgress(((i + 1) / totalSections) * 100);
    }

    setIsProcessing(false);
    setIsWritingComplete(true);
    setActiveTab(MenuTab.DOWNLOAD); // Auto switch to download/preview when done
  }, [topic, outline, customInstruction]);

  const handleUpdateDocument = (newDoc: FullDocument) => {
    setGeneratedContent(newDoc.content);
  };

  const handleReset = () => {
    if(confirm("Bạn có chắc chắn muốn làm mới toàn bộ? Dữ liệu hiện tại sẽ mất.")) {
      setTopic('');
      setAuthor('');
      setSchool('');
      setOutline([]);
      setGeneratedContent([]);
      setIsWritingComplete(false);
      setCustomInstruction('');
      setActiveTab(MenuTab.TOPIC);
    }
  };

  const fullDocument: FullDocument = {
    topic,
    author,
    school,
    year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    content: generatedContent
  };

  // --- Render Helpers ---

  const renderMenuItem = (id: MenuTab, label: string, iconPath: string) => {
    const isActive = activeTab === id;
    // Disable tabs if prerequisites are not met
    const isDisabled = (id === MenuTab.OUTLINE && !topic) || 
                       (id === MenuTab.WRITE && outline.length === 0) ||
                       (id === MenuTab.DOWNLOAD && generatedContent.length === 0);

    return (
      <button
        onClick={() => !isDisabled && setActiveTab(id)}
        disabled={isDisabled}
        className={`w-full flex items-center p-4 transition-all duration-300 border-l-4 group relative overflow-hidden ${
          isActive 
            ? 'bg-purple-900/60 border-yellow-400 text-yellow-300 shadow-[inset_0_0_20px_rgba(251,191,36,0.1)]' 
            : isDisabled 
              ? 'border-transparent text-gray-500 cursor-not-allowed hover:bg-transparent'
              : 'border-transparent text-gray-300 hover:bg-white/5 hover:text-white'
        }`}
      >
        <div className={`mr-3 ${isActive ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]' : isDisabled ? 'text-gray-600' : 'text-gray-400 group-hover:text-white'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
          </svg>
        </div>
        <div className="text-left">
          <span className={`block text-sm font-bold ${isActive ? 'neon-text-gold' : ''}`}>{id <= MenuTab.DOWNLOAD ? `${id}. ${label}` : label}</span>
        </div>
        {isActive && (
           <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-yellow-500/10 to-transparent"></div>
        )}
      </button>
    );
  };

  const renderRightContent = () => {
    switch (activeTab) {
      case MenuTab.TOPIC:
        return (
          <div className="flex flex-col h-full justify-center items-center p-8 lg:p-16">
            <div className="w-full max-w-2xl bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 neon-border">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                 <span className="bg-yellow-100 text-yellow-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm border border-yellow-300">1</span>
                 Nhập Tên Đề Tài
              </h2>
              <label className="block text-gray-600 mb-2 font-medium">Tên sáng kiến kinh nghiệm:</label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary focus:border-transparent focus:shadow-[0_0_15px_rgba(251,191,36,0.4)] transition-all resize-none text-lg"
                placeholder="Ví dụ: Một số biện pháp giúp học sinh lớp 4 hứng thú học tập môn Tiếng Việt..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setActiveTab(MenuTab.AUTHOR)}
                  disabled={!topic.trim()}
                  className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 transition-all shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                >
                  Tiếp tục &rarr;
                </button>
              </div>
            </div>
          </div>
        );
      case MenuTab.AUTHOR:
        return (
          <div className="flex flex-col h-full justify-center items-center p-8 lg:p-16">
            <div className="w-full max-w-2xl bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 neon-border">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                 <span className="bg-yellow-100 text-yellow-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm border border-yellow-300">2</span>
                 Thông Tin Tác Giả
              </h2>
              <label className="block text-gray-600 mb-2 font-medium">Họ và tên giáo viên:</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary focus:border-transparent focus:shadow-[0_0_15px_rgba(251,191,36,0.4)] transition-all text-lg"
                placeholder="Nguyễn Văn A"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
              <div className="mt-6 flex justify-between">
                <button onClick={() => setActiveTab(MenuTab.TOPIC)} className="text-gray-500 hover:text-primary">Quay lại</button>
                <button
                  onClick={() => setActiveTab(MenuTab.UNIT)}
                  className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-purple-700 transition-all shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                >
                  Tiếp tục &rarr;
                </button>
              </div>
            </div>
          </div>
        );
      case MenuTab.UNIT:
        return (
          <div className="flex flex-col h-full justify-center items-center p-8 lg:p-16">
            <div className="w-full max-w-2xl bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 neon-border">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                 <span className="bg-yellow-100 text-yellow-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm border border-yellow-300">3</span>
                 Đơn Vị Công Tác
              </h2>
              <label className="block text-gray-600 mb-2 font-medium">Trường / Đơn vị:</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary focus:border-transparent focus:shadow-[0_0_15px_rgba(251,191,36,0.4)] transition-all text-lg"
                placeholder="Trường Tiểu học..."
                value={school}
                onChange={(e) => setSchool(e.target.value)}
              />
              <div className="mt-6 flex justify-between">
                 <button onClick={() => setActiveTab(MenuTab.AUTHOR)} className="text-gray-500 hover:text-primary">Quay lại</button>
                <button
                  onClick={() => setActiveTab(MenuTab.OUTLINE)}
                  className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-purple-700 transition-all shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                >
                  Đến phần Dàn Ý &rarr;
                </button>
              </div>
            </div>
          </div>
        );
      case MenuTab.OUTLINE:
        return (
          <div className="h-full overflow-y-auto custom-scrollbar p-4 lg:p-8">
            {outline.length === 0 && !isProcessing ? (
               <div className="flex flex-col items-center justify-center h-full text-white">
                  <div className="bg-white/10 p-8 rounded-2xl border border-white/20 backdrop-blur-md text-center max-w-lg neon-border">
                    <h3 className="text-xl font-bold mb-4 text-yellow-300">Sẵn sàng lập dàn ý</h3>
                    <p className="mb-6 text-gray-300">AI sẽ phân tích đề tài "{topic}" để đề xuất cấu trúc bài viết phù hợp nhất.</p>
                    <button 
                      onClick={handleGenerateOutline}
                      className="px-8 py-3 bg-secondary hover:bg-yellow-300 text-purple-900 font-bold rounded-full shadow-[0_0_20px_rgba(251,191,36,0.6)] transition-all transform hover:scale-105"
                    >
                      Tạo Dàn Ý Ngay
                    </button>
                  </div>
               </div>
            ) : isProcessing ? (
               <div className="flex flex-col items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400 mb-4 shadow-[0_0_15px_rgba(251,191,36,0.5)]"></div>
                  <p className="text-yellow-200 font-medium animate-pulse">Đang suy nghĩ và lập dàn ý...</p>
               </div>
            ) : (
              <OutlineStep 
                topic={topic}
                outline={outline}
                onBack={() => setOutline([])} // Clear outline to regenerate if needed
                onGenerateFull={() => setActiveTab(MenuTab.WRITE)}
                isProcessing={false}
              />
            )}
          </div>
        );
      case MenuTab.WRITE:
         return (
           <div className="h-full flex flex-col p-4 lg:p-8 relative">
             {isProcessing ? (
                // Embedded Processing View
                <div className="flex-1 flex items-center justify-center">
                    <ProcessingOverlay currentSection={currentWritingSection} progress={progress} />
                </div>
             ) : isWritingComplete ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.6)] animate-bounce">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Đã viết xong!</h2>
                    <p className="text-gray-300 mb-8">Nội dung sáng kiến kinh nghiệm đã hoàn tất.</p>
                    <button 
                      onClick={() => setActiveTab(MenuTab.DOWNLOAD)}
                      className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-bold rounded-xl shadow-lg transition-all transform hover:scale-105"
                    >
                      Xem Kết Quả & Tải Về
                    </button>
                </div>
             ) : (
                <div className="flex-1 flex flex-col items-center justify-center">
                   <div className="max-w-xl text-center w-full">
                      <h3 className="text-2xl font-bold text-white mb-4">Sẵn sàng viết chi tiết</h3>
                      <p className="text-gray-300 mb-8">
                        Dựa trên dàn ý đã chốt, AI sẽ viết nội dung chi tiết cho từng mục. 
                        Quá trình này có thể mất 1-2 phút.
                      </p>
                      
                      <div className="mb-6 w-full text-left">
                          <label htmlFor="custom-instruction" className="block text-sm font-medium text-gray-300 mb-2">
                              Yêu cầu bổ sung cho AI (Tuỳ chọn)
                          </label>
                          <textarea
                              id="custom-instruction"
                              rows={3}
                              className="w-full px-4 py-3 rounded-lg border border-gray-500 bg-gray-900/50 text-white focus:ring-2 focus:ring-secondary focus:border-transparent focus:shadow-[0_0_15px_rgba(251,191,36,0.4)] transition-all resize-none"
                              placeholder="Ví dụ: Viết ngắn gọn, tập trung vào các ví dụ thực tế. Không dùng câu quá phức tạp..."
                              value={customInstruction}
                              onChange={(e) => setCustomInstruction(e.target.value)}
                          />
                      </div>

                      <button 
                        onClick={handleStartWriting}
                        className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.5)] transition-all transform hover:scale-105"
                      >
                        Bắt đầu Viết
                      </button>
                   </div>
                </div>
             )}
           </div>
         );
      case MenuTab.DOWNLOAD:
        return (
          <ResultStep 
            document={fullDocument}
            onReset={handleReset}
            onUpdateDocument={handleUpdateDocument}
          />
        );
      case MenuTab.POLICY:
        return (
           <div className="flex flex-col h-full justify-center items-center p-8 lg:p-16">
            <div className="w-full max-w-3xl bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 neon-border h-full max-h-[80vh] overflow-y-auto custom-scrollbar">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                 </svg>
                 Chính sách & Quyền riêng tư
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p>Cập nhật lần cuối: 24/07/2024</p>
                <p>Cảm ơn bạn đã sử dụng Trợ lý Viết SKKN AI. Chúng tôi cam kết bảo vệ quyền riêng tư của bạn. Vui lòng đọc kỹ chính sách này để hiểu rõ cách chúng tôi xử lý thông tin.</p>

                <h4>1. Thông tin chúng tôi xử lý</h4>
                <p>Ứng dụng này <strong>KHÔNG</strong> thu thập, lưu trữ, hoặc chia sẻ bất kỳ thông tin cá nhân nào của bạn trên máy chủ của chúng tôi. Tất cả dữ liệu bạn nhập vào đều được xử lý trực tiếp trên trình duyệt của bạn.</p>
                <ul>
                  <li><strong>Tên đề tài, Tên tác giả, Đơn vị công tác:</strong> Những thông tin này bạn cung cấp để tạo ra tài liệu SKKN. Chúng chỉ được sử dụng trong phiên làm việc hiện tại của bạn và sẽ bị mất khi bạn làm mới ứng dụng.</li>
                  <li><strong>Nội dung được tạo ra:</strong> Toàn bộ nội dung SKKN được AI tạo ra cũng chỉ tồn tại trên trình duyệt của bạn trong phiên làm việc.</li>
                </ul>

                <h4>2. Cách chúng tôi sử dụng thông tin</h4>
                <p>Để cung cấp tính năng viết tự động, ứng dụng sẽ gửi các yêu cầu đến API của Google Gemini. Các dữ liệu được gửi đi bao gồm:</p>
                <ul>
                  <li>Tên đề tài của bạn.</li>
                  <li>Cấu trúc dàn ý và các hướng dẫn viết cho từng mục.</li>
                  <li>Nội dung văn bản khi bạn sử dụng chức năng soát lỗi.</li>
                </ul>
                <p>Chúng tôi không gửi thông tin cá nhân như tên tác giả hay tên trường học đến Google Gemini. Việc xử lý dữ liệu của Google tuân theo <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Chính sách Quyền riêng tư của Google</a>. Dữ liệu của bạn không được sử dụng để huấn luyện mô hình của họ.</p>
                
                <h4>3. Dịch vụ của bên thứ ba</h4>
                <p>Ứng dụng sử dụng API của Google Gemini để tạo nội dung. Chúng tôi không chịu trách nhiệm về chính sách quyền riêng tư hoặc thực tiễn của Google.</p>

                <h4>4. Thay đổi đối với Chính sách này</h4>
                <p>Chúng tôi có thể cập nhật chính sách này theo thời gian. Mọi thay đổi sẽ được đăng trên trang này.</p>
                
                <h4>5. Liên hệ</h4>
                <p>Nếu bạn có bất kỳ câu hỏi nào về chính sách này, vui lòng liên hệ với nhà phát triển.</p>
              </div>
               <div className="mt-8 text-right">
                <button
                  onClick={() => setActiveTab(MenuTab.TOPIC)}
                  className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-purple-700 transition-all shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      {/* LEFT SIDEBAR MENU */}
      <aside className="w-72 bg-[#1a0b2e]/95 border-r border-yellow-500/30 flex flex-col shadow-[5px_0_20px_rgba(0,0,0,0.5)] z-20 flex-shrink-0">
        <div className="p-6 border-b border-yellow-500/10">
           <h2 className="text-lg font-bold text-white neon-text-gold">MENU CHÍNH</h2>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          {renderMenuItem(MenuTab.TOPIC, "Tên Đề Tài", "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z")}
          {renderMenuItem(MenuTab.AUTHOR, "Tên Tác Giả", "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z")}
          {renderMenuItem(MenuTab.UNIT, "Đơn Vị Công Tác", "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4")}
          {renderMenuItem(MenuTab.OUTLINE, "Lập Dàn Ý", "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01")}
          {renderMenuItem(MenuTab.WRITE, "Viết Chi Tiết", "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z")}
          {renderMenuItem(MenuTab.DOWNLOAD, "Tải Về / Xem", "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4")}
          <div className="px-4 pt-4 pb-2">
            <div className="border-t border-yellow-500/10"></div>
          </div>
          {renderMenuItem(MenuTab.POLICY, "Chính sách & Quyền riêng tư", "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z")}
        </nav>

        <div className="p-4 border-t border-yellow-500/10 text-xs text-gray-500 text-center">
           Phiên bản v2.1 <br/> Giao diện Neon Gold
        </div>
      </aside>

      {/* RIGHT CONTENT PANE */}
      <div className="flex-1 relative bg-[#2e1065] flex flex-col h-full overflow-hidden">
         {/* Background pattern */}
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
         
         {/* Render Active View */}
         <div className="flex-1 overflow-hidden relative z-10">
            {renderRightContent()}
         </div>
      </div>
    </Layout>
  );
};

// Render logic
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');
const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

export default App;
