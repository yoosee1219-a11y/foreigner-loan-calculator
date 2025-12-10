/**
 * 외국인 대출 계산기
 * 웰컴저축은행 & 전북은행 수수료 및 이자 계산
 */

// ============================================================================
// 타입 정의
// ============================================================================

export type BankType = 'welcome' | 'jeonbuk';

export interface WelcomeRateOption {
  discount: number;        // 금리 인하폭 (0%, 1%, 2%, 3%)
  feeMultiplier: number;   // 수수료 배율 (100%, 90%, 80%, 70%)
  label: string;
}

export interface LoanInput {
  amount: number;          // 대출 금액 (원)
  months: number;          // 상환 기간 (개월)
  bank: BankType;
  baseRate?: number;       // 기본 금리 (%)
  rateDiscount?: number;   // 웰컴: 금리 인하 (0~3)
  lgUplus?: boolean;       // 전북: LG U+ 우대 (-0.5%)
}

export interface LoanResult {
  bank: BankType;
  bankName: string;

  // 수수료
  baseFee: number;         // 기본 수수료
  finalFee: number;        // 최종 수수료 (할인 적용 후)
  feeDiscount: number;     // 수수료 할인액
  feeRate: string;         // 수수료율 표시

  // 금액
  receivedAmount: number;  // 실수령액

  // 금리
  baseRate: number;        // 기본 금리
  appliedRate: number;     // 적용 금리

  // 월 납입
  monthlyPayment: number;  // 월 납입액

  // 총액
  totalInterest: number;   // 총 이자
  totalPayment: number;    // 총 상환액
  totalCost: number;       // 총 비용 (수수료 + 이자)

  // 추가 수수료
  earlyPaymentFee?: number; // 중도상환수수료

  // 전북은행 6개월 이내 중도상환 환수액 (일수별)
  earlyRepaymentClawback?: {
    days30: number;   // 30일 사용 후 전액 상환 시
    days60: number;   // 60일 사용 후 전액 상환 시
    days90: number;   // 90일 사용 후 전액 상환 시
    days120: number;  // 120일 사용 후 전액 상환 시
    days150: number;  // 150일 사용 후 전액 상환 시
    days180: number;  // 180일 사용 후 전액 상환 시
  };

  // 경고
  warnings: string[];
}

export interface ComparisonResult {
  welcome: LoanResult;
  jeonbuk: LoanResult;
  recommendation: 'welcome' | 'jeonbuk';
  savings: number;          // 절약액
}

// ============================================================================
// 상수
// ============================================================================

// 웰컴저축은행 금리 인하 옵션
export const WELCOME_RATE_OPTIONS: WelcomeRateOption[] = [
  { discount: 0, feeMultiplier: 1.0, label: '기본 (인하 없음)' },
  { discount: 1, feeMultiplier: 0.9, label: '1% 인하 (수수료 90%)' },
  { discount: 2, feeMultiplier: 0.8, label: '2% 인하 (수수료 80%)' },
  { discount: 3, feeMultiplier: 0.7, label: '3% 인하 (수수료 70%)' },
];

// 전북은행 중개 수수료 테이블 (슬라이딩 방식)
const JEONBUK_BROKER_FEE_TABLE = [
  { maxMonths: 6, rate: 0.003 },   // 6개월 미만: 0.3%
  { maxMonths: 12, rate: 0.005 },  // 12개월 미만: 0.5%
  { maxMonths: 15, rate: 0.01 },   // 15개월 미만: 1.0%
  { maxMonths: 18, rate: 0.015 },  // 18개월 미만: 1.5%
  { maxMonths: 21, rate: 0.017 },  // 21개월 미만: 1.7%
  { maxMonths: 24, rate: 0.019 },  // 24개월 미만: 1.9%
  { maxMonths: 27, rate: 0.021 },  // 27개월 미만: 2.1%
  { maxMonths: 30, rate: 0.023 },  // 30개월 미만: 2.3%
  { maxMonths: 999, rate: 0.025 }, // 30개월 이상: 2.5%
];

// 기본 금리 (가정)
const DEFAULT_WELCOME_RATE = 16.9;
const DEFAULT_JEONBUK_RATE = 14.5;

// ============================================================================
// 웰컴저축은행 계산
// ============================================================================

/**
 * 웰컴저축은행 중개 수수료 계산
 * - 500만원 이하: 3.0%
 * - 500만원 초과: 500만원까지 3.0% + 초과분 2.25% + 15만원
 */
export function calculateWelcomeBrokerFee(amount: number): number {
  if (amount <= 5000000) {
    return Math.round(amount * 0.03); // 3%
  } else {
    // 500만원까지 3% + 초과분 2.25% + 15만원
    const first5M = 5000000 * 0.03;
    const over5M = (amount - 5000000) * 0.0225;
    return Math.round(first5M + over5M + 150000);
  }
}

export function calculateWelcomeLoan(
  amount: number,
  months: number,
  rateDiscount: number = 0,
  baseRate: number = DEFAULT_WELCOME_RATE
): LoanResult {
  // 1. 기본 중개 수수료 계산
  const baseFee = calculateWelcomeBrokerFee(amount);

  // 2. 금리 인하 옵션 적용
  const option = WELCOME_RATE_OPTIONS.find(opt => opt.discount === rateDiscount);
  if (!option) {
    throw new Error(`Invalid rate discount: ${rateDiscount}`);
  }

  // 3. 최종 중개 수수료 (금리 인하에 따른 수수료 배율 적용)
  let finalFee = Math.round(baseFee * option.feeMultiplier);
  
  // 4. 대출기간 12개월 미만 시 정상지급액의 50%만 지급
  if (months < 12) {
    finalFee = Math.round(finalFee * 0.5);
  }
  
  const feeDiscount = baseFee - finalFee;

  // 4. 실수령액
  const receivedAmount = amount - finalFee;

  // 5. 적용 금리
  const appliedRate = baseRate - option.discount;

  // 6. 월 납입액 계산 (원리금균등분할)
  const monthlyPayment = calculateMonthlyPayment(amount, appliedRate, months);

  // 7. 총 이자 및 총 비용
  const totalPayment = monthlyPayment * months;
  const totalInterest = totalPayment - amount;
  const totalCost = finalFee + totalInterest;

  // 8. 경고 메시지  
  const warnings: string[] = [];
  
  if (months < 12) {
    warnings.push('📌 대출기간 12개월 미만: 정상지급액의 50%만 수수료 지급');
  }
  
  warnings.push('');
  warnings.push('🔴 환수 조건:');
  warnings.push('   • 3개월 이내 중도상환(완납) 시: 수수료 100% 환수');
  warnings.push('   • 3개월 이내 부분상환 시:');
  warnings.push('     - 3회차 약정 상환액 외 50만원 이상 상환 시');
  warnings.push('     - 부분 상환액만큼 미지급');

  // 수수료율 표시
  let feeRate = '';
  if (amount <= 5000000) {
    feeRate = '3.0%';
  } else {
    feeRate = '2.25% + 15만원';
  }
  if (option.discount > 0) {
    feeRate += ` → ${Math.round(option.feeMultiplier * 100)}% 적용`;
  }

  return {
    bank: 'welcome',
    bankName: '웰컴저축은행',
    baseFee,
    finalFee,
    feeDiscount,
    feeRate,
    receivedAmount,
    baseRate,
    appliedRate,
    monthlyPayment,
    totalInterest,
    totalPayment,
    totalCost,
    warnings,
  };
}

// ============================================================================
// 전북은행 계산
// ============================================================================

export function calculateJeonbukFee(amount: number, months: number): { fee: number; rate: number } {
  for (const bracket of JEONBUK_BROKER_FEE_TABLE) {
    if (months < bracket.maxMonths) {
      return {
        fee: Math.round(amount * bracket.rate),
        rate: bracket.rate,
      };
    }
  }

  // 기본값 (30개월 이상)
  return {
    fee: Math.round(amount * 0.025),
    rate: 0.025,
  };
}

export function calculateJeonbukLoan(
  amount: number,
  months: number,
  lgUplus: boolean = false,
  baseRate: number = DEFAULT_JEONBUK_RATE
): LoanResult {
  // 1. 수수료 계산
  const { fee: baseFee, rate } = calculateJeonbukFee(amount, months);
  const finalFee = baseFee;

  // 2. 실수령액
  const receivedAmount = amount - finalFee;

  // 3. 적용 금리 (LG U+ 우대 -0.5%)
  const appliedRate = lgUplus ? baseRate - 0.5 : baseRate;

  // 4. 월 납입액 계산
  const monthlyPayment = calculateMonthlyPayment(amount, appliedRate, months);

  // 5. 총 이자 및 총 비용
  const totalPayment = monthlyPayment * months;
  const totalInterest = totalPayment - amount;

  // 6. 총 비용 계산 (수수료는 제외 - 중개사 수익)
  const totalCost = totalInterest; // 고객 부담: 이자만

  // 7. 6개월 이내 중도상환 환수액 계산
  let earlyRepaymentClawback = undefined;
  if (months <= 6) {
    // 전액 상환 기준으로 일수별 환수액 계산
    earlyRepaymentClawback = {
      days30: calculateJeonbukEarlyRepaymentClawback(amount, rate, 30),
      days60: calculateJeonbukEarlyRepaymentClawback(amount, rate, 60),
      days90: calculateJeonbukEarlyRepaymentClawback(amount, rate, 90),
      days120: calculateJeonbukEarlyRepaymentClawback(amount, rate, 120),
      days150: calculateJeonbukEarlyRepaymentClawback(amount, rate, 150),
      days180: calculateJeonbukEarlyRepaymentClawback(amount, rate, 180),
    };
  }

  // 8. 경고 메시지
  const warnings: string[] = [];
  warnings.push('🔴 대출 실행 후 1회차 연체 시 수수료 100% 환수');
  warnings.push('🔴 대출 실행 후 2회차 연체 시 수수료 50% 환수');
  warnings.push('⚠️ 14일 이내 대출 취소/철회 시 수수료 100% 환수');
  
  if (months <= 6 && earlyRepaymentClawback) {
    warnings.push('');
    warnings.push('🟠 6개월 이내 중도상환 시 환수액 (전액 상환 기준):');
    warnings.push(`   • 30일 사용: ${earlyRepaymentClawback.days30.toLocaleString()}원`);
    warnings.push(`   • 60일 사용: ${earlyRepaymentClawback.days60.toLocaleString()}원`);
    warnings.push(`   • 90일 사용: ${earlyRepaymentClawback.days90.toLocaleString()}원`);
    warnings.push(`   • 120일 사용: ${earlyRepaymentClawback.days120.toLocaleString()}원`);
    warnings.push(`   • 150일 사용: ${earlyRepaymentClawback.days150.toLocaleString()}원`);
    warnings.push(`   • 180일 사용: ${earlyRepaymentClawback.days180.toLocaleString()}원`);
    warnings.push('   * 공식: 중도상환액 × 수수료율 - (중도상환액 × 수수료율 × 이용일수/183)');
    warnings.push('   * 정기상환 제외, 일부상환·완제·상환계획변경·회차선납 포함');
  }

  // 수수료율 표시
  const feeRate = `${(rate * 100).toFixed(2)}% (${months}개월 기준)`;

  return {
    bank: 'jeonbuk',
    bankName: '전북은행',
    baseFee,
    finalFee,
    feeDiscount: 0,
    feeRate,
    receivedAmount,
    baseRate,
    appliedRate,
    monthlyPayment,
    totalInterest,
    totalPayment,
    totalCost,
    earlyRepaymentClawback,
    warnings,
  };
}

// ============================================================================
// 공통 계산 함수
// ============================================================================

/**
 * 월 납입액 계산 (원리금균등분할)
 * PMT 함수: P × [r(1+r)^n] / [(1+r)^n - 1]
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  months: number
): number {
  const monthlyRate = annualRate / 12 / 100;

  if (monthlyRate === 0) {
    return Math.round(principal / months);
  }

  const payment = principal *
    (monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  return Math.round(payment);
}


/**
 * 전북은행 6개월 이내 중도상환 환수액 계산
 * 공식: 중도상환액 × 지급수수료율 - (중도상환액 × 지급수수료율 × 이용일수 / 183)
 * 
 * @param repaymentAmount 중도상환액
 * @param feeRate 지급수수료율
 * @param usageDays 이용일수
 * @returns 환수액
 */
export function calculateJeonbukEarlyRepaymentClawback(
  repaymentAmount: number,
  feeRate: number,
  usageDays: number
): number {
  // 환수액 = 중도상환액 × 지급수수료율 × (1 - 이용일수/183)
  const clawback = repaymentAmount * feeRate * (1 - usageDays / 183);
  return Math.round(clawback);
}

/**
 * 상환 스케줄 생성
 */
export interface PaymentScheduleItem {
  month: number;
  principal: number;      // 원금 상환액
  interest: number;       // 이자
  payment: number;        // 월 납입액
  balance: number;        // 잔액
}

export function generatePaymentSchedule(
  amount: number,
  annualRate: number,
  months: number
): PaymentScheduleItem[] {
  const schedule: PaymentScheduleItem[] = [];
  const monthlyRate = annualRate / 12 / 100;
  const monthlyPayment = calculateMonthlyPayment(amount, annualRate, months);

  let balance = amount;

  for (let month = 1; month <= months; month++) {
    const interest = Math.round(balance * monthlyRate);
    const principal = monthlyPayment - interest;
    balance = Math.max(0, balance - principal);

    schedule.push({
      month,
      principal,
      interest,
      payment: monthlyPayment,
      balance,
    });
  }

  return schedule;
}

// ============================================================================
// 비교 함수
// ============================================================================

export function compareLoanOptions(input: {
  amount: number;
  months: number;
  welcomeDiscount?: number;
  lgUplus?: boolean;
}): ComparisonResult {
  const welcomeResult = calculateWelcomeLoan(
    input.amount,
    input.months,
    input.welcomeDiscount || 0
  );

  const jeonbukResult = calculateJeonbukLoan(
    input.amount,
    input.months,
    input.lgUplus || false
  );

  const recommendation = welcomeResult.totalCost < jeonbukResult.totalCost
    ? 'welcome'
    : 'jeonbuk';

  const savings = Math.abs(welcomeResult.totalCost - jeonbukResult.totalCost);

  return {
    welcome: welcomeResult,
    jeonbuk: jeonbukResult,
    recommendation,
    savings,
  };
}

/**
 * 웰컴저축은행 전체 옵션 비교
 */
export function calculateAllWelcomeOptions(
  amount: number,
  months: number
): LoanResult[] {
  return [0, 1, 2, 3].map(discount =>
    calculateWelcomeLoan(amount, months, discount)
  );
}
