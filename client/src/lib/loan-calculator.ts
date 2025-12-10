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

// 전북은행 수수료 테이블 (신용대출 기준)
const JEONBUK_FEE_TABLE = [
  { maxMonths: 6, rate: 0.0024 },   // 6개월 미만: 0.24%
  { maxMonths: 12, rate: 0.004 },   // 6개월~12개월: 0.4%
  { maxMonths: 15, rate: 0.008 },   // 12개월~15개월: 0.8%
  { maxMonths: 18, rate: 0.012 },   // 15개월~18개월: 1.2%
  { maxMonths: 21, rate: 0.0136 },  // 18개월~21개월: 1.36%
  { maxMonths: 24, rate: 0.0152 },  // 21개월~24개월: 1.52%
  { maxMonths: 27, rate: 0.0168 },  // 24개월~27개월: 1.68%
  { maxMonths: 30, rate: 0.0184 },  // 27개월~30개월: 1.84%
  { maxMonths: 999, rate: 0.02 },   // 30개월 이상: 2.0%
];

// 기본 금리 (가정)
const DEFAULT_WELCOME_RATE = 16.9;
const DEFAULT_JEONBUK_RATE = 14.5;

// ============================================================================
// 웰컴저축은행 계산
// ============================================================================

export function calculateWelcomeFee(amount: number): number {
  if (amount <= 5000000) {
    return amount * 0.03; // 3%
  } else {
    return amount * 0.0225 + 150000; // 2.25% + 15만원
  }
}

export function calculateWelcomeLoan(
  amount: number,
  months: number,
  rateDiscount: number = 0,
  baseRate: number = DEFAULT_WELCOME_RATE
): LoanResult {
  // 1. 기본 수수료 계산
  const baseFee = calculateWelcomeFee(amount);

  // 2. 금리 인하 옵션 적용
  const option = WELCOME_RATE_OPTIONS.find(opt => opt.discount === rateDiscount);
  if (!option) {
    throw new Error(`Invalid rate discount: ${rateDiscount}`);
  }

  // 3. 최종 수수료 (할인 적용)
  const finalFee = Math.round(baseFee * option.feeMultiplier);
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
  if (months <= 3) {
    warnings.push('⚠️ 3개월 이내 중도상환 시 수수료 100% 환수');
  } else if (months < 12) {
    warnings.push('⚠️ 12개월 미만 중도상환 시 수수료 50% 환수');
  }

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
  for (const bracket of JEONBUK_FEE_TABLE) {
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

  // 7. 경고 메시지
  const warnings: string[] = [];
  warnings.push('🔴 대출 실행 후 1회차 연체 시 수수료 100% 환수');
  warnings.push('🔴 대출 실행 후 2회차 연체 시 수수료 50% 환수');
  if (months <= 6) {
    const clawbackAmount = Math.round(finalFee - (finalFee * 30 / 183)); // 예시: 30일 사용 가정
    warnings.push(`🟠 6개월 이내 중도상환 시 환수 (예: 30일 사용 기준 약 ${clawbackAmount.toLocaleString()}원)`);
  }
  warnings.push(`⚠️ 14일 이내 대출 취소/철회 시 수수료 100% 환수`);

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
