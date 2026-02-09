import { OutlineSection } from "./types";

// This structure mirrors the PDF provided: Introduction -> Content -> Conclusion
export const INITIAL_STRUCTURE_TEMPLATE = (topic: string): OutlineSection[] => [
  {
    id: 'A',
    title: 'A. PHẦN MỞ ĐẦU',
    description: '',
    isHeading: true
  },
  {
    id: 'A-I',
    title: 'I. Lý do chọn đề tài',
    description: `Viết chi tiết về tầm quan trọng của ${topic}. Nêu rõ cơ sở lý luận (vai trò của môn học/lĩnh vực), cơ sở thực tiễn (thực trạng hiện nay), và tính cấp thiết của đề tài.`,
    isHeading: false
  },
  {
    id: 'A-II',
    title: 'II. Mục đích nghiên cứu',
    description: 'Nêu rõ mục tiêu cần đạt được khi thực hiện sáng kiến này (ví dụ: nâng cao chất lượng, tạo hứng thú, giải quyết khó khăn cụ thể).',
    isHeading: false
  },
  {
    id: 'A-III',
    title: 'III. Đối tượng và phạm vi nghiên cứu',
    description: 'Xác định đối tượng học sinh (lớp, khối), giáo viên, và phạm vi nội dung chương trình áp dụng.',
    isHeading: false
  },
  {
    id: 'A-IV',
    title: 'IV. Phương pháp nghiên cứu',
    description: 'Liệt kê các phương pháp như: Phương pháp điều tra, khảo sát, thực nghiệm, thống kê, phân tích tổng hợp...',
    isHeading: false
  },
  {
    id: 'A-V',
    title: 'V. Điểm mới trong sáng kiến kinh nghiệm',
    description: 'Nêu bật những điểm sáng tạo, khác biệt so với phương pháp truyền thống. Những đóng góp mới của đề tài.',
    isHeading: false
  },
  {
    id: 'B',
    title: 'B. NỘI DUNG NGHIÊN CỨU',
    description: '',
    isHeading: true
  },
  {
    id: 'B-I',
    title: 'I. Cơ sở lý luận của vấn đề',
    description: 'Trình bày các khái niệm, quan điểm chỉ đạo, văn bản hướng dẫn liên quan đến đề tài.',
    isHeading: false
  },
  {
    id: 'B-II',
    title: 'II. Thực trạng vấn đề',
    description: 'Phân tích tình hình trước khi áp dụng sáng kiến. Nêu rõ Thuận lợi và Khó khăn (của giáo viên, học sinh, cơ sở vật chất). Số liệu khảo sát đầu năm (nếu có giả định).',
    isHeading: false
  },
  {
    id: 'B-III',
    title: 'III. Các biện pháp thực hiện',
    description: `Đây là phần quan trọng nhất. Hãy đề xuất 4-5 biện pháp cụ thể, chi tiết, có tính ứng dụng cao để giải quyết vấn đề của ${topic}. Mỗi biện pháp cần có tên rõ ràng, cách thức thực hiện, ví dụ minh họa.`,
    isHeading: false
  },
  {
    id: 'B-IV',
    title: 'IV. Hiệu quả của sáng kiến kinh nghiệm',
    description: 'Đánh giá kết quả sau khi áp dụng. So sánh đối chứng trước và sau. Sự chuyển biến về nhận thức, kết quả học tập của học sinh.',
    isHeading: false
  },
  {
    id: 'C',
    title: 'C. KẾT LUẬN VÀ KIẾN NGHỊ',
    description: '',
    isHeading: true
  },
  {
    id: 'C-I',
    title: '1. Kết luận',
    description: 'Tóm tắt lại ý nghĩa, giá trị của sáng kiến. Khẳng định tính khả thi.',
    isHeading: false
  },
  {
    id: 'C-II',
    title: '2. Kiến nghị',
    description: 'Đề xuất với tổ chuyên môn, nhà trường, phòng giáo dục để sáng kiến được nhân rộng và hiệu quả hơn.',
    isHeading: false
  }
];
