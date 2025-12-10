/**
 * 스키마 마크업 생성 유틸 함수
 */

/**
 * 마크다운 콘텐츠에서 HowTo 스키마 생성
 * 마크다운의 헤딩(##)과 번호 목록(1. 2. 3.)을 추출하여 HowTo 스키마 생성
 */
export function generateHowToSchema(content: string, title: string, description?: string) {
  // 헤딩(##)과 번호 목록을 추출
  const lines = content.split('\n');
  const steps: Array<{ name: string; text: string }> = [];
  
  let currentStep: { name?: string; text: string } | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 헤딩 (## 또는 ###) 감지
    if (line.startsWith('##') && !line.startsWith('###')) {
      // 이전 단계가 있으면 저장
      if (currentStep && currentStep.text) {
        steps.push({
          name: currentStep.name || currentStep.text.substring(0, 100),
          text: currentStep.text.trim()
        });
      }
      
      // 새 단계 시작
      const stepName = line.replace(/^#+\s*/, '').trim();
      currentStep = { name: stepName, text: '' };
    }
    // 번호 목록 (1. 2. 3. 또는 -) 감지
    else if (line.match(/^\d+\.\s/) || line.startsWith('- ')) {
      if (!currentStep) {
        currentStep = { text: '' };
      }
      
      const stepText = line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim();
      if (stepText) {
        if (currentStep.text) {
          currentStep.text += ' ' + stepText;
        } else {
          currentStep.text = stepText;
        }
      }
    }
    // 일반 텍스트 (단계 설명의 일부)
    else if (line && !line.startsWith('#') && currentStep) {
      if (currentStep.text) {
        currentStep.text += ' ' + line;
      } else {
        currentStep.text = line;
      }
    }
  }
  
  // 마지막 단계 저장
  if (currentStep && currentStep.text) {
    steps.push({
      name: currentStep.name || currentStep.text.substring(0, 100),
      text: currentStep.text.trim()
    });
  }
  
  // 단계가 2개 이상 있을 때만 HowTo 스키마 생성
  if (steps.length < 2) {
    return null;
  }
  
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": title,
    "description": description || title,
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text
    }))
  };
}

/**
 * 마크다운 콘텐츠에서 FAQ 자동 추출
 * Q: 또는 Q. 패턴으로 질문, A: 또는 A. 패턴으로 답변 추출
 */
export function extractFAQsFromContent(content: string): Array<{ question: string; answer: string }> {
  const faqs: Array<{ question: string; answer: string }> = [];
  const lines = content.split('\n');
  
  let currentQuestion: string | null = null;
  let currentAnswer: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 질문 패턴 감지 (Q:, Q., Q： 등)
    if (line.match(/^Q[：:\.]\s*(.+)/i)) {
      // 이전 FAQ 저장
      if (currentQuestion && currentAnswer.length > 0) {
        faqs.push({
          question: currentQuestion,
          answer: currentAnswer.join(' ').trim()
        });
      }
      
      // 새 질문 시작
      currentQuestion = line.replace(/^Q[：:\.]\s*/i, '').trim();
      currentAnswer = [];
    }
    // 답변 패턴 감지 (A:, A., A： 등)
    else if (line.match(/^A[：:\.]\s*(.+)/i)) {
      const answerText = line.replace(/^A[：:\.]\s*/i, '').trim();
      if (answerText) {
        currentAnswer.push(answerText);
      }
    }
    // 답변 계속 (빈 줄이 아니고 질문/답변 패턴이 아닌 경우)
    else if (currentQuestion && line && !line.match(/^Q[：:\.]/i) && !line.match(/^A[：:\.]/i)) {
      // 헤딩이 아닌 경우만 답변에 추가
      if (!line.startsWith('#')) {
        currentAnswer.push(line);
      }
    }
  }
  
  // 마지막 FAQ 저장
  if (currentQuestion && currentAnswer.length > 0) {
    faqs.push({
      question: currentQuestion,
      answer: currentAnswer.join(' ').trim()
    });
  }
  
  return faqs;
}

/**
 * FAQ 스키마 생성
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  if (!faqs || faqs.length === 0) {
    return null;
  }
  
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

/**
 * Review 스키마 생성 (요금제 평점 및 리뷰)
 */
export function generateReviewSchema(
  productName: string,
  rating: number,
  reviewCount: number,
  bestRating: number = 5,
  worstRating: number = 1
) {
  if (!rating || rating === 0) {
    return null;
  }
  
  return {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    "itemReviewed": {
      "@type": "Product",
      "name": productName
    },
    "ratingValue": rating.toString(),
    "bestRating": bestRating.toString(),
    "worstRating": worstRating.toString(),
    "ratingCount": reviewCount.toString()
  };
}

/**
 * Product with Review 스키마 생성 (요금제 상세 페이지용)
 */
export function generateProductWithReviewSchema(
  productName: string,
  description: string,
  price: number,
  rating?: number,
  reviewCount?: number
) {
  const productSchema: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": productName,
    "description": description,
    "offers": {
      "@type": "Offer",
      "price": price,
      "priceCurrency": "KRW"
    }
  };
  
  if (rating && reviewCount && reviewCount > 0) {
    productSchema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": rating.toString(),
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": reviewCount.toString()
    };
  }
  
  return productSchema;
}

/**
 * 마크다운 콘텐츠에서 목차(TOC) 자동 생성
 * 헤딩(##, ###)을 추출하여 목차 생성
 */
export interface TOCItem {
  id: string;
  level: number;
  text: string;
}

export function generateTOC(content: string): TOCItem[] {
  const toc: TOCItem[] = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    // 헤딩 감지 (##, ###, #### 등)
    const match = line.match(/^(#{2,4})\s+(.+)$/);
    if (match) {
      const level = match[1].length; // ## = 2, ### = 3, #### = 4
      const text = match[2].trim();
      
      // ID 생성 (한글, 영문, 숫자, 하이픈만 허용)
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-가-힣]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      toc.push({ id, level, text });
    }
  }
  
  return toc;
}

