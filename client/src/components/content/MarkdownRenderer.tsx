import ReactMarkdown from "react-markdown";
import { Components } from "react-markdown";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  // 헤딩 ID 생성 함수
  const generateHeadingId = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-가-힣]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // 커스텀 컴포넌트 정의
  const components: Components = {
    // H2 스타일링 (빨간 배경, 흰색 텍스트)
    h2: ({ node, children, ...props }) => {
      const text = String(children);
      const id = generateHeadingId(text);
      
      return (
        <h2
          id={id}
          className={cn(
            "text-white text-xl font-bold bg-primary px-4 py-3 rounded-lg mt-8 mb-4",
            "first:mt-0"
          )}
          {...props}
        >
          {children}
        </h2>
      );
    },
    
    // H3 스타일링
    h3: ({ node, children, ...props }) => {
      const text = String(children);
      const id = generateHeadingId(text);
      
      return (
        <h3
          id={id}
          className="text-lg font-bold text-foreground mt-6 mb-3"
          {...props}
        >
          {children}
        </h3>
      );
    },
    
    // H4 스타일링
    h4: ({ node, children, ...props }) => {
      const text = String(children);
      const id = generateHeadingId(text);
      
      return (
        <h4
          id={id}
          className="text-base font-semibold text-foreground mt-4 mb-2"
          {...props}
        >
          {children}
        </h4>
      );
    },
    
    // 문단 스타일링
    p: ({ node, children, ...props }) => {
      return (
        <p className="text-base leading-relaxed mb-4 text-foreground" {...props}>
          {children}
        </p>
      );
    },
    
    // 리스트 스타일링
    ul: ({ node, children, ...props }) => {
      return (
        <ul className="list-disc list-inside space-y-2 mb-4 pl-4" {...props}>
          {children}
        </ul>
      );
    },
    
    ol: ({ node, children, ...props }) => {
      return (
        <ol className="list-decimal list-inside space-y-2 mb-4 pl-4" {...props}>
          {children}
        </ol>
      );
    },
    
    li: ({ node, children, ...props }) => {
      return (
        <li className="text-base leading-relaxed text-foreground" {...props}>
          {children}
        </li>
      );
    },
    
    // 강조 스타일링
    strong: ({ node, children, ...props }) => {
      return (
        <strong className="font-bold text-foreground" {...props}>
          {children}
        </strong>
      );
    },
    
    em: ({ node, children, ...props }) => {
      return (
        <em className="italic text-foreground" {...props}>
          {children}
        </em>
      );
    },
    
    // 링크 스타일링
    a: ({ node, children, ...props }) => {
      return (
        <a
          className="text-primary hover:underline font-medium"
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      );
    },
    
    // 코드 블록 스타일링
    code: ({ node, inline, children, ...props }) => {
      if (inline) {
        return (
          <code
            className="bg-secondary px-1.5 py-0.5 rounded text-sm font-mono text-foreground"
            {...props}
          >
            {children}
          </code>
        );
      }
      return (
        <code
          className="block bg-secondary p-4 rounded-lg overflow-x-auto text-sm font-mono text-foreground mb-4"
          {...props}
        >
          {children}
        </code>
      );
    },
    
    // 인용구 스타일링
    blockquote: ({ node, children, ...props }) => {
      return (
        <blockquote
          className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4"
          {...props}
        >
          {children}
        </blockquote>
      );
    },
  };

  return (
    <div className={cn("prose prose-lg dark:prose-invert max-w-none", className)}>
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}

