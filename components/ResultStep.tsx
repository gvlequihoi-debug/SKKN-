import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { FullDocument, GeneratedContent } from '../types';
import { generateWordDocument } from '../services/wordGenerator';
import { proofreadText } from '../services/geminiService';
import ProcessingOverlay from './ProcessingOverlay';

interface ResultStepProps {
  document: FullDocument;
  onReset: () => void;
  onUpdateDocument: (newDoc: FullDocument) => void;
}

const ResultStep: React.FC<ResultStepProps> = ({ document, onReset, onUpdateDocument }) => {
  const [isGeneratingWord, setIsGeneratingWord] = useState(false);
  const [isProofreading, setIsProofreading] = useState(false);
  const [proofreadProgress, setProofreadProgress] = useState(0);
  const [currentProofreadSection, setCurrentProofreadSection] = useState('');

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadWord = async () => {
    try {
      setIsGeneratingWord(true);
      await generateWordDocument(document);
    } catch (error) {
      console.error("Error generating word doc:", error);
      alert("Có lỗi khi tạo file Word. Vui lòng thử lại.");
    } finally {
      setIsGeneratingWord(false);
    }
  };

  const handleCopy = () => {
    let text = `${document.topic}\n\n`;
    document.content.forEach(section => {
      text += `${section.title}\n\n${section.content}\n\n`;
    });
    navigator.clipboard.writeText(text);
    alert('Đã sao chép toàn bộ nội dung!');
  };

  const handleProofread = async () => {
    if (!confirm("AI sẽ rà soát toàn bộ văn bản để sửa lỗi chính tả và ngữ pháp. Quá trình này có thể mất 1-2 phút. Bạn có muốn tiếp tục?")) {
      return;
    }

    setIsProofreading(true);
    setProofreadProgress(0);
    
    const newContent: GeneratedContent[] = [];
    const total = document.content.length; 

    try {
      for (let i = 0; i < document.content.length; i++) {
        const section = document.content[i];
        setCurrentProofreadSection(section.title);

        let processedText = section.content;
        
        if (section.content && section.content.trim().length > 0) {
           processedText = await proofreadText(section.content);
        }

        newContent.push({
          ...section,
          content: processedText
        });

        setProofreadProgress(Math.round(((i + 1) / total) * 100));
      }

      onUpdateDocument({
        ...document,
        content: newContent
      });
      
      alert("Đã hoàn tất soát lỗi chính tả!");

    } catch (error) {
      console.error("Proofread error:", error);
      alert("Có lỗi xảy ra khi soát lỗi. Vui lòng thử lại.");
    } finally {
      setIsProofreading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {isProofreading && (
         <div className="absolute inset-0 z-50">
            <ProcessingOverlay currentSection={`Đang soát lỗi: ${currentProofreadSection}`} progress={proofreadProgress} />
         </div>
      )}

      {/* TOP TOOLBAR */}
      <div className="bg-white/5 backdrop-blur-md border-b border-white/10 p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-4">
              <h2 className="text-white font-bold text-lg hidden md:block">Xem Trước Tài Liệu</h2>
              <div className="h-6 w-[1px] bg-white/20 hidden md:block"></div>
              <button
                  onClick={handleProofread}
                  disabled={isProofreading || isGeneratingWord}
                  className="px-4 py-2 bg-purple-900/50 hover:bg-purple-800 text-yellow-300 text-sm font-bold rounded-lg border border-purple-500/30 transition-all flex items-center"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Soát lỗi AI
              </button>
              <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-all"
              >
                  Sao chép
              </button>
          </div>

          <div className="flex items-center space-x-3">
              <button
                  onClick={handlePrint}
                  className="px-4 py-2 text-gray-300 hover:text-white text-sm font-medium"
              >
                  In
              </button>
              <button
                  onClick={onReset}
                  className="px-4 py-2 text-red-400 hover:text-red-300 text-sm font-medium"
              >
                  Làm mới
              </button>
              <button
                  onClick={handleDownloadWord}
                  disabled={isGeneratingWord}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg transition-all flex items-center"
              >
                   {isGeneratingWord ? (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    )}
                  Tải về .DOCX
              </button>
          </div>
      </div>

      {/* PAPER PREVIEW */}
      <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar scroll-smooth bg-gray-900/20">
         <div className="max-w-[21cm] mx-auto transition-transform origin-top duration-300">
             
             {/* THE PAPER */}
             <div className="paper-view bg-white paper-shadow min-h-[29.7cm] p-[2.5cm] text-justify relative">
                 
                 {/* Title Page Mockup */}
                 <div id="cover-page" className="border-2 border-double border-gray-400 p-8 mb-12 text-center h-[25cm] flex flex-col justify-between">
                     <div>
                         <h3 className="uppercase text-lg font-semibold">UỶ BAN NHÂN DÂN..................</h3>
                         <h3 className="uppercase text-lg font-bold mb-12">TRƯỜNG {document.school.toUpperCase() || '........................'}</h3>
                         
                         <h1 className="text-4xl font-serif font-bold text-green-700 uppercase leading-snug mb-8">
                             SÁNG KIẾN
                         </h1>
                         
                         <div className="border border-green-700 rounded-xl p-6 my-8 inline-block w-full max-w-2xl bg-paper">
                             <h2 className="text-2xl font-bold text-red-600 uppercase leading-relaxed">
                                 {document.topic}
                             </h2>
                         </div>
                     </div>

                     <div className="w-full max-w-lg mx-auto text-left border border-red-500 p-4">
                         <p className="text-lg mb-2"><span className="font-bold">LĨNH VỰC/MÔN:</span> ....................................</p>
                         <p className="text-lg mb-2"><span className="font-bold">TÊN TÁC GIẢ:</span> {document.author.toUpperCase() || '.......................'}</p>
                         <p className="text-lg mb-2"><span className="font-bold">CHỨC VỤ:</span> GIÁO VIÊN</p>
                         <p className="text-lg"><span className="font-bold">ĐƠN VỊ CÔNG TÁC:</span> {document.school || '.......................'}</p>
                     </div>

                     <div className="text-center">
                         <p className="text-lg">Năm học {document.year || '2024-2025'}</p>
                     </div>
                 </div>
                 
                 <div className="page-break" />

                 {/* Table of Contents - Simplified */}
                 <div className="mb-12 print-only">
                     <h2 className="text-center font-bold text-2xl mb-8 uppercase">MỤC LỤC</h2>
                     <table className="w-full border-collapse border border-gray-400">
                         <thead>
                             <tr className="bg-gray-100">
                                 <th className="border border-gray-400 p-2 w-16">STT</th>
                                 <th className="border border-gray-400 p-2">Nội dung</th>
                             </tr>
                         </thead>
                         <tbody>
                             {document.content.map((section, idx) => (
                                 <tr key={idx}>
                                     <td className="border border-gray-400 p-2 text-center">{idx + 1}</td>
                                     <td className="border border-gray-400 p-2 font-semibold">{section.title}</td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>

                 <div className="page-break" />

                 {/* Content Body */}
                 <div className="font-serif leading-relaxed text-lg text-gray-900">
                 {document.content.map((item, index) => (
                     <div key={item.sectionId} id={item.sectionId} className="mb-8 scroll-mt-8">
                     {/* Render Title */}
                     <h3 className={`font-bold mb-4 uppercase ${item.title.match(/^[A-C]\./) ? 'text-2xl text-center mt-12 mb-8 text-primary' : 'text-xl'}`}>
                         {item.title}
                     </h3>
                     
                     {/* Render Content */}
                     {item.content && (
                         <div className="prose prose-lg max-w-none text-justify">
                         <ReactMarkdown 
                             components={{
                                 p: ({node, ...props}) => <p className="indent-8 mb-3" {...props} />,
                                 ul: ({node, ...props}) => <ul className="list-disc ml-10 mb-4" {...props} />,
                                 li: ({node, ...props}) => <li className="pl-1" {...props} />,
                                 strong: ({node, ...props}) => <span className="font-bold" {...props} />
                             }}
                         >
                             {item.content}
                         </ReactMarkdown>
                         </div>
                     )}
                     </div>
                 ))}
                 </div>
                 
                 {/* Signature Mockup */}
                 <div className="mt-16 flex justify-end no-break">
                     <div className="text-center w-64">
                         <p className="italic">........., ngày .... tháng .... năm 2025</p>
                         <p className="font-bold mt-2">Người viết sáng kiến</p>
                         <div className="h-24"></div>
                         <p className="font-bold">{document.author || 'Tên tác giả'}</p>
                     </div>
                 </div>

             </div>
         </div>
         
         {/* Space at bottom for aesthetics */}
         <div className="h-20"></div>
      </div>
    </div>
  );
};

export default ResultStep;