import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  AlignmentType, 
  HeadingLevel, 
  PageBreak, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  BorderStyle,
  convertInchesToTwip,
  Header,
  Footer,
  PageNumber,
  TableOfContents
} from "docx";
import { FullDocument, GeneratedContent } from "../types";

// Helper to save file natively in browser without external dependencies
const saveBlob = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Helper to clean Markdown and convert to TextRuns
const parseMarkdownToParagraphs = (text: string): Paragraph[] => {
  if (!text) return [];
  const lines = text.split('\n');
  const paragraphs: Paragraph[] = [];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    let level = 0; // 0 = normal, 1 = bullet
    let content = trimmed;

    // Detect List Items
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('+ ')) {
      level = 1;
      content = trimmed.substring(2);
    }

    // Split by bold markers **text**
    const parts = content.split(/(\*\*.*?\*\*)/g);
    const children = parts.map(part => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return new TextRun({
          text: part.slice(2, -2),
          bold: true,
          size: 28, // 14pt
          font: "Times New Roman"
        });
      }
      return new TextRun({
        text: part,
        size: 28, // 14pt
        font: "Times New Roman"
      });
    });

    paragraphs.push(new Paragraph({
      children: children,
      bullet: level > 0 ? { level: 0 } : undefined,
      spacing: { line: 360, after: 120 }, // 1.5 line spacing (240 * 1.5 = 360)
      alignment: AlignmentType.JUSTIFIED,
      indent: level === 0 ? { firstLine: convertInchesToTwip(0.5) } : undefined // Indent first line of paragraphs
    }));
  });

  return paragraphs;
};

export const generateWordDocument = async (docData: FullDocument) => {
  // 1. Cover Page Elements
  const coverTitle1 = new Paragraph({
    text: "UỶ BAN NHÂN DÂN..................",
    heading: HeadingLevel.HEADING_3,
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    run: { font: "Times New Roman", size: 28, bold: true }
  });

  const coverTitle2 = new Paragraph({
    text: `TRƯỜNG ${docData.school ? docData.school.toUpperCase() : '........................'}`,
    heading: HeadingLevel.HEADING_3,
    alignment: AlignmentType.CENTER,
    spacing: { after: 2000 }, // Big gap
    run: { font: "Times New Roman", size: 28, bold: true }
  });

  const mainTitle = new Paragraph({
    text: "SÁNG KIẾN KINH NGHIỆM",
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
    run: { font: "Times New Roman", size: 48, bold: true, color: "008000" } // Green color like UI
  });

  // Topic Box
  const topicTable = new Table({
    width: { size: 90, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                text: docData.topic.toUpperCase(),
                alignment: AlignmentType.CENTER,
                run: { font: "Times New Roman", size: 32, bold: true, color: "FF0000" } // Red color
              })
            ],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
              left: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
            },
            verticalAlign: "center",
            margins: { top: 400, bottom: 400, left: 200, right: 200 }
          })
        ],
      })
    ],
    alignment: AlignmentType.CENTER,
  });

  // Author Info
  const infoText = [
    `LĨNH VỰC/MÔN: ....................................`,
    `TÊN TÁC GIẢ: ${docData.author ? docData.author.toUpperCase() : '.......................'}`,
    `CHỨC VỤ: GIÁO VIÊN`,
    `ĐƠN VỊ CÔNG TÁC: ${docData.school || '.......................'}`
  ];

  const infoParagraphs = infoText.map(text => new Paragraph({
    text: text,
    alignment: AlignmentType.LEFT,
    spacing: { before: 200 },
    indent: { left: convertInchesToTwip(1.5) }, // Indent author info
    run: { font: "Times New Roman", size: 28 }
  }));

  const yearParagraph = new Paragraph({
    text: `Năm học ${docData.year}`,
    alignment: AlignmentType.CENTER,
    spacing: { before: 2000 },
    run: { font: "Times New Roman", size: 28 }
  });

  const pageBreak = new Paragraph({ children: [new PageBreak()] });

  // 2. Table of Contents
  const tocHeader = new Paragraph({
    text: "MỤC LỤC",
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    run: { font: "Times New Roman", size: 32, bold: true }
  });

  const toc = new TableOfContents("Mục lục", {
      hyperlink: true,
      headingStyleRange: "1-3",
  });

  const tocPageBreak = new Paragraph({ children: [new PageBreak()] });

  // 3. Content Sections
  const contentParagraphs: Paragraph[] = [];
  
  // Header for content
  // Note: We use simple text formatting instead of HeadingLevel here 
  // so it doesn't appear in the Table of Contents as a duplicate root item.
  contentParagraphs.push(new Paragraph({
    text: "NỘI DUNG SÁNG KIẾN",
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
    run: { font: "Times New Roman", size: 32, bold: true }
  }));

  docData.content.forEach((section: GeneratedContent) => {
    // Determine Heading Level based on ID or Title content
    const isMainHeading = section.title.match(/^[A-C]\./); // A., B., C.
    const isSubHeading = section.title.match(/^[I,V,X]+\./); // I., II., III.
    
    // Add Title
    contentParagraphs.push(new Paragraph({
      text: section.title,
      heading: isMainHeading ? HeadingLevel.HEADING_1 : (isSubHeading ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3),
      spacing: { before: 400, after: 200 },
      alignment: isMainHeading ? AlignmentType.CENTER : AlignmentType.LEFT,
      run: { 
        font: "Times New Roman", 
        size: isMainHeading ? 32 : 28, // 16pt for main, 14pt for others
        bold: true,
        color: isMainHeading ? "1e40af" : "000000" // Blue for main sections
      }
    }));

    // Add Body Content
    if (section.content) {
      const parsed = parseMarkdownToParagraphs(section.content);
      contentParagraphs.push(...parsed);
    }
  });

  // 4. Signature
  const signature = [
     new Paragraph({
         text: `........., ngày .... tháng .... năm 2025`,
         alignment: AlignmentType.RIGHT,
         spacing: { before: 800 },
         run: { font: "Times New Roman", size: 28, italics: true }
     }),
     new Paragraph({
         text: "Người viết sáng kiến",
         alignment: AlignmentType.RIGHT,
         run: { font: "Times New Roman", size: 28, bold: true },
         indent: { right: convertInchesToTwip(0.5) }
     }),
     new Paragraph({ text: "", spacing: { after: 2000 } }), // Space for signature
     new Paragraph({
         text: docData.author || "Tên tác giả",
         alignment: AlignmentType.RIGHT,
         run: { font: "Times New Roman", size: 28, bold: true },
         indent: { right: convertInchesToTwip(0.5) }
     })
  ];

  // Assemble Document
  const doc = new Document({
    sections: [{
      properties: {
        page: {
            margin: {
                top: convertInchesToTwip(0.79), // 2cm
                bottom: convertInchesToTwip(0.79), // 2cm
                left: convertInchesToTwip(1.18), // 3cm
                right: convertInchesToTwip(0.79), // 2cm
            }
        }
      },
      headers: {
        default: new Header({
            children: [], // Empty header
        }),
      },
      footers: {
        default: new Footer({
            children: [
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                         new TextRun({
                             children: [PageNumber.CURRENT],
                         }),
                    ],
                }),
            ],
        }),
      },
      children: [
        coverTitle1,
        coverTitle2,
        mainTitle,
        new Paragraph({ text: "", spacing: { after: 200 } }), // Spacer
        topicTable,
        new Paragraph({ text: "", spacing: { after: 800 } }), // Spacer
        ...infoParagraphs,
        yearParagraph,
        pageBreak,
        tocHeader,
        toc,
        tocPageBreak,
        ...contentParagraphs,
        ...signature
      ],
    }],
  });

  // Generate and Save using native browser method
  const blob = await Packer.toBlob(doc);
  const safeFilename = docData.topic.substring(0, 50).replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s-]/gi, '_');
  saveBlob(blob, `SKKN - ${safeFilename}.docx`);
};
