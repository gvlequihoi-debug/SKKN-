import { GoogleGenAI, Type } from "@google/genai";
import { OutlineSection } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to clean JSON string if Markdown code blocks are present
const cleanJsonString = (str: string): string => {
  return str.replace(/```json/g, '').replace(/```/g, '').trim();
};

/**
 * 1. Enhance the Outline
 * We take the standard structure and ask Gemini to customize the DESCRIPTIONS based on the user's topic.
 * This ensures the content generation phase has specific context.
 */
export const generateCustomizedOutline = async (topic: string, baseTemplate: OutlineSection[]): Promise<OutlineSection[]> => {
  // We strictly keep the structure titles but enrich the "description" field which acts as the prompt for the next step.
  const prompt = `
    Bạn là một chuyên gia viết Sáng Kiến Kinh Nghiệm (SKKN) bậc thầy trong ngành giáo dục Việt Nam.
    Đề tài là: "${topic}".
    
    Tôi có một cấu trúc khung chuẩn cho SKKN. Nhiệm vụ của bạn là KHÔNG thay đổi tiêu đề các mục (Title), nhưng hãy viết lại phần "Mô tả hướng dẫn" (Description) cho từng mục.
    
    Phần mô tả này sẽ được dùng làm đề bài để AI viết nội dung chi tiết sau này.
    - Với phần "III. Các biện pháp thực hiện": Hãy liệt kê cụ thể 3-5 biện pháp sáng tạo, hiện đại, ứng dụng công nghệ (nếu phù hợp) dành riêng cho đề tài này. Đừng viết chung chung.
    - Với phần "Thực trạng": Hãy hình dung các khó khăn thực tế phù hợp với đề tài này.
    
    Trả về JSON với cấu trúc mảng các object: { "id": string, "title": string, "description": string, "isHeading": boolean }.
    Giữ nguyên ID và Title và isHeading của template gốc.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: JSON.stringify(baseTemplate) + "\n\n" + prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              isHeading: { type: Type.BOOLEAN },
            },
            required: ['id', 'title', 'description', 'isHeading']
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(cleanJsonString(text)) as OutlineSection[];
  } catch (error) {
    console.error("Error generating outline:", error);
    // Fallback to base template if AI fails
    return baseTemplate;
  }
};

/**
 * 2. Write Section Content
 * Generates detailed text for a specific section.
 */
export const generateSectionContent = async (topic: string, section: OutlineSection, customInstruction: string): Promise<string> => {
  const customInstructionBlock = (customInstruction && customInstruction.trim())
    ? `
    YÊU CẦU ĐẶC BIỆT TỪ NGƯỜI DÙNG (Cần tuân thủ nghiêm ngặt):
    ---
    ${customInstruction.trim()}
    ---
    `
    : '';

  const prompt = `
    Bạn đang viết một bản "Sáng kiến kinh nghiệm" hoàn chỉnh, chuyên nghiệp.
    Đề tài: "${topic}".
    
    Hãy viết nội dung cho mục: "${section.title}".
    
    Yêu cầu hướng dẫn chi tiết cho mục này:
    ${section.description}
    
    ${customInstructionBlock}

    Yêu cầu về văn phong và hình thức:
    - Viết tiếng Việt chuẩn mực, trang trọng, văn phong sư phạm/hành chính.
    - VIẾT RẤT CHI TIẾT, DÀI VÀ CỤ THỂ. KHÔNG viết sơ sài.
    - Nếu là phần "Biện pháp": Phải có tên biện pháp, cách tiến hành từng bước, ví dụ minh họa thực tế (ví dụ: tên bài hát, tên phần mềm, trích dẫn cụ thể...).
    - Sử dụng định dạng Markdown (in đậm **...**, danh sách - ..., xuống dòng).
    - KHÔNG viết lại tiêu đề mục (Vd: Không cần viết lại "I. Lý do chọn đề tài" ở đầu).
    - Chỉ viết nội dung.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Using flash for speed, but instructed to be detailed
      contents: prompt,
    });

    return response.text || "Không thể tạo nội dung.";
  } catch (error) {
    console.error(`Error writing section ${section.title}:`, error);
    return "Đã xảy ra lỗi khi viết phần này. Vui lòng thử lại.";
  }
};

/**
 * 3. Proofread Content
 * Checks for spelling and grammar errors.
 */
export const proofreadText = async (text: string): Promise<string> => {
  const prompt = `
    Bạn là một biên tập viên chuyên nghiệp. Nhiệm vụ của bạn là soát lỗi chính tả và ngữ pháp cho đoạn văn bản tiếng Việt dưới đây.
    
    Yêu cầu:
    - Chỉ sửa lỗi chính tả, lỗi gõ máy, và lỗi ngữ pháp nghiêm trọng.
    - Giữ nguyên văn phong và ý nghĩa gốc.
    - GIỮ NGUYÊN định dạng Markdown (in đậm, danh sách, tiêu đề).
    - Chỉ trả về nội dung đã sửa, không thêm lời dẫn.

    Văn bản cần soát:
    ${text}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || text;
  } catch (error) {
    console.error("Error proofreading text:", error);
    return text; // Return original if error
  }
};
