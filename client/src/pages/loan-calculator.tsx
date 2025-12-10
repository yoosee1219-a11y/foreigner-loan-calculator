import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  calculateWelcomeLoan,
  calculateJeonbukLoan,
  compareLoanOptions,
  calculateAllWelcomeOptions,
  generatePaymentSchedule,
  WELCOME_RATE_OPTIONS,
  type LoanResult,
} from '@/lib/loan-calculator';
import { Calculator, Building2, TrendingDown, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';

export default function LoanCalculator() {
  // 입력 상태
  const [amount, setAmount] = useState(10000000); // 1000만원
  const [amountInput, setAmountInput] = useState('10000000'); // 직접 입력용
  const [months, setMonths] = useState(24); // 24개월
  const [selectedBank, setSelectedBank] = useState<'welcome' | 'jeonbuk' | 'compare'>('compare');
  const [welcomeDiscount, setWelcomeDiscount] = useState(2); // 2% 인하
  const [lgUplus, setLgUplus] = useState(false);

  // 금리 입력 (직접 설정 가능)
  const [welcomeBaseRate, setWelcomeBaseRate] = useState(16.9);
  const [jeonbukBaseRate, setJeonbukBaseRate] = useState(14.5);

  // 대출 금액 입력 처리
  const handleAmountInputChange = (value: string) => {
    setAmountInput(value);
    const numValue = parseInt(value.replace(/,/g, '')) || 0;
    if (numValue >= 1000000 && numValue <= 50000000) {
      setAmount(numValue);
    }
  };

  const handleAmountBlur = () => {
    const numValue = parseInt(amountInput.replace(/,/g, '')) || 10000000;
    const clampedValue = Math.max(1000000, Math.min(50000000, numValue));
    setAmount(clampedValue);
    setAmountInput(clampedValue.toString());
  };

  // 슬라이더 변경 시 입력 필드도 업데이트
  const handleSliderChange = (value: number[]) => {
    setAmount(value[0]);
    setAmountInput(value[0].toString());
  };

  // 계산 결과
  const welcomeResult = useMemo(
    () => calculateWelcomeLoan(amount, months, welcomeDiscount, welcomeBaseRate),
    [amount, months, welcomeDiscount, welcomeBaseRate]
  );

  const jeonbukResult = useMemo(
    () => calculateJeonbukLoan(amount, months, lgUplus, jeonbukBaseRate),
    [amount, months, lgUplus, jeonbukBaseRate]
  );

  const comparison = useMemo(
    () => compareLoanOptions({ amount, months, welcomeDiscount, lgUplus }),
    [amount, months, welcomeDiscount, lgUplus]
  );

  const allWelcomeOptions = useMemo(
    () => calculateAllWelcomeOptions(amount, months),
    [amount, months]
  );

  // 상환 스케줄 (양쪽)
  const [showSchedule, setShowSchedule] = useState(false);
  const welcomeSchedule = useMemo(
    () => generatePaymentSchedule(amount, welcomeResult.appliedRate, months),
    [amount, welcomeResult.appliedRate, months]
  );
  const jeonbukSchedule = useMemo(
    () => generatePaymentSchedule(amount, jeonbukResult.appliedRate, months),
    [amount, jeonbukResult.appliedRate, months]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Calculator className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">외국인 대출 비교 계산기</h1>
              <p className="text-sm text-gray-600 mt-1">웰컴저축은행 & 전북은행 수수료 및 이자 계산</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 입력 패널 */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  대출 정보 입력
                </CardTitle>
                <CardDescription>조건을 입력하고 계산하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 대출 금액 - 직접 입력 + 슬라이더 */}
                <div className="space-y-3">
                  <Label>대출 금액</Label>

                  {/* 직접 입력 필드 */}
                  <div className="relative">
                    <Input
                      type="text"
                      value={parseInt(amountInput).toLocaleString()}
                      onChange={(e) => handleAmountInputChange(e.target.value)}
                      onBlur={handleAmountBlur}
                      className="text-2xl font-bold text-primary pr-12 h-14"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">원</span>
                  </div>

                  {/* 슬라이더 */}
                  <Slider
                    value={[amount]}
                    onValueChange={handleSliderChange}
                    min={1000000}
                    max={50000000}
                    step={1000000}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>100만원</span>
                    <span>5,000만원</span>
                  </div>
                </div>

                <Separator />

                {/* 상환 기간 */}
                <div className="space-y-2">
                  <Label>상환 기간</Label>
                  <Select value={months.toString()} onValueChange={(v) => setMonths(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 6, 12, 15, 18, 21, 24, 27, 30, 36, 48].map((m) => (
                        <SelectItem key={m} value={m.toString()}>
                          {m}개월
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* 은행 선택 */}
                <div className="space-y-2">
                  <Label>은행 선택</Label>
                  <RadioGroup value={selectedBank} onValueChange={(v: any) => setSelectedBank(v)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="welcome" id="welcome" />
                      <Label htmlFor="welcome" className="font-normal cursor-pointer">
                        웰컴저축은행
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="jeonbuk" id="jeonbuk" />
                      <Label htmlFor="jeonbuk" className="font-normal cursor-pointer">
                        전북은행
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="compare" id="compare" />
                      <Label htmlFor="compare" className="font-normal cursor-pointer">
                        양쪽 비교
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* 웰컴저축은행 옵션 */}
                {(selectedBank === 'welcome' || selectedBank === 'compare') && (
                  <>
                    <Separator />
                    <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Label className="text-blue-900 font-semibold">💙 웰컴저축은행 옵션</Label>

                      {/* 기본 금리 입력 */}
                      <div className="space-y-2">
                        <Label className="text-sm">기본 금리 (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="1"
                          max="30"
                          value={welcomeBaseRate}
                          onChange={(e) => setWelcomeBaseRate(Number(e.target.value))}
                          className="h-10 bg-white"
                        />
                        <p className="text-xs text-blue-600">
                          평균 16.9% (직접 입력 가능)
                        </p>
                      </div>

                      {/* 금리 인하 옵션 */}
                      <div className="space-y-2">
                        <Label className="text-sm">금리 인하 옵션</Label>
                        <Select
                          value={welcomeDiscount.toString()}
                          onValueChange={(v) => setWelcomeDiscount(Number(v))}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {WELCOME_RATE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.discount} value={opt.discount.toString()}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-blue-600">
                          금리 인하 시 수수료 할인
                        </p>
                      </div>

                      {/* 최종 적용 금리 표시 */}
                      <div className="pt-2 border-t border-blue-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-blue-900">최종 적용 금리:</span>
                          <span className="text-lg font-bold text-blue-600">
                            {(welcomeBaseRate - welcomeDiscount).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* 전북은행 옵션 */}
                {(selectedBank === 'jeonbuk' || selectedBank === 'compare') && (
                  <>
                    <Separator />
                    <div className="space-y-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <Label className="text-green-900 font-semibold">💚 전북은행 옵션</Label>

                      {/* 기본 금리 입력 */}
                      <div className="space-y-2">
                        <Label className="text-sm">기본 금리 (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="1"
                          max="30"
                          value={jeonbukBaseRate}
                          onChange={(e) => setJeonbukBaseRate(Number(e.target.value))}
                          className="h-10 bg-white"
                        />
                        <p className="text-xs text-green-600">
                          평균 13-15% (직접 입력 가능)
                        </p>
                      </div>

                      {/* LG U+ 우대 */}
                      <div className="flex items-center justify-between p-2 bg-white rounded border border-green-100">
                        <Label htmlFor="lguplus" className="text-sm cursor-pointer">
                          LG U+ 유심 우대 (-0.5%)
                        </Label>
                        <Switch id="lguplus" checked={lgUplus} onCheckedChange={setLgUplus} />
                      </div>

                      {/* 최종 적용 금리 표시 */}
                      <div className="pt-2 border-t border-green-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-green-900">최종 적용 금리:</span>
                          <span className="text-lg font-bold text-green-600">
                            {(jeonbukBaseRate + (lgUplus ? -0.5 : 0)).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 결과 패널 */}
          <div className="lg:col-span-2">
            {selectedBank === 'compare' ? (
              <ComparisonView
                comparison={comparison}
                allOptions={allWelcomeOptions}
                welcomeSchedule={welcomeSchedule}
                jeonbukSchedule={jeonbukSchedule}
                months={months}
              />
            ) : selectedBank === 'welcome' ? (
              <SingleBankView
                result={welcomeResult}
                allOptions={allWelcomeOptions}
                schedule={welcomeSchedule}
                months={months}
              />
            ) : (
              <SingleBankView
                result={jeonbukResult}
                schedule={jeonbukSchedule}
                months={months}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 컴포넌트: 비교 뷰
// ============================================================================

function ComparisonView({
  comparison,
  allOptions,
  welcomeSchedule,
  jeonbukSchedule,
  months,
}: {
  comparison: ReturnType<typeof compareLoanOptions>;
  allOptions: LoanResult[];
  welcomeSchedule: ReturnType<typeof generatePaymentSchedule>;
  jeonbukSchedule: ReturnType<typeof generatePaymentSchedule>;
  months: number;
}) {
  const [showSchedule, setShowSchedule] = useState(false);

  return (
    <div className="space-y-6">
      {/* 추천 */}
      <Alert className={comparison.recommendation === 'jeonbuk' ? 'border-green-500 bg-green-50' : 'border-blue-500 bg-blue-50'}>
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>💡 추천: {comparison.recommendation === 'jeonbuk' ? '전북은행' : '웰컴저축은행'}</AlertTitle>
        <AlertDescription>
          총 비용이 <strong>{comparison.savings.toLocaleString()}원</strong> 더 저렴합니다
        </AlertDescription>
      </Alert>

      {/* 비교 카드 */}
      <div className="grid md:grid-cols-2 gap-6">
        <BankResultCard result={comparison.welcome} isRecommended={comparison.recommendation === 'welcome'} />
        <BankResultCard result={comparison.jeonbuk} isRecommended={comparison.recommendation === 'jeonbuk'} />
      </div>

      {/* 웰컴 전체 옵션 */}
      <Card>
        <CardHeader>
          <CardTitle>웰컴저축은행 금리 인하 옵션 비교</CardTitle>
          <CardDescription>금리를 낮출수록 고객 부담은 줄어들지만 수수료도 감소합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">옵션</th>
                  <th className="px-4 py-2 text-right">금리</th>
                  <th className="px-4 py-2 text-right">수수료</th>
                  <th className="px-4 py-2 text-right">월납입액</th>
                  <th className="px-4 py-2 text-right">총비용</th>
                  <th className="px-4 py-2 text-center">추천</th>
                </tr>
              </thead>
              <tbody>
                {allOptions.map((opt, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      {idx === 0 ? '기본' : `${idx}% 인하`}
                    </td>
                    <td className="px-4 py-2 text-right">{opt.appliedRate}%</td>
                    <td className="px-4 py-2 text-right">
                      {opt.finalFee.toLocaleString()}원
                    </td>
                    <td className="px-4 py-2 text-right">
                      {opt.monthlyPayment.toLocaleString()}원
                    </td>
                    <td className="px-4 py-2 text-right font-medium">
                      {opt.totalCost.toLocaleString()}원
                    </td>
                    <td className="px-4 py-2 text-center">
                      {idx === 0 && '💼 접수처'}
                      {idx === 1 && '⭐ 균형'}
                      {idx === 3 && '💚 고객'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 상환 스케줄 - 은행별 탭 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>상환 스케줄</CardTitle>
            <Button variant="outline" onClick={() => setShowSchedule(!showSchedule)}>
              {showSchedule ? '숨기기' : '펼치기'}
            </Button>
          </div>
        </CardHeader>
        {showSchedule && (
          <CardContent>
            <Tabs defaultValue="welcome" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="welcome">💙 웰컴저축은행</TabsTrigger>
                <TabsTrigger value="jeonbuk">💚 전북은행</TabsTrigger>
              </TabsList>
              <TabsContent value="welcome">
                <ScheduleTable schedule={welcomeSchedule} bank="welcome" months={months} />
              </TabsContent>
              <TabsContent value="jeonbuk">
                <ScheduleTable schedule={jeonbukSchedule} bank="jeonbuk" months={months} />
              </TabsContent>
            </Tabs>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// ============================================================================
// 컴포넌트: 단일 은행 뷰
// ============================================================================

function SingleBankView({
  result,
  allOptions,
  schedule,
  months,
}: {
  result: LoanResult;
  allOptions?: LoanResult[];
  schedule: ReturnType<typeof generatePaymentSchedule>;
  months: number;
}) {
  const [showSchedule, setShowSchedule] = useState(false);

  return (
    <div className="space-y-6">
      <BankResultCard result={result} isRecommended={true} />

      {/* 웰컴 전체 옵션 */}
      {allOptions && (
        <Card>
          <CardHeader>
            <CardTitle>금리 인하 옵션 비교</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div>
                    <div className="font-medium">
                      {idx === 0 ? '기본' : `${idx}% 인하`} - {opt.appliedRate}%
                    </div>
                    <div className="text-sm text-gray-600">
                      월 {opt.monthlyPayment.toLocaleString()}원
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {opt.totalCost.toLocaleString()}원
                    </div>
                    <div className="text-sm text-gray-600">
                      수수료 {opt.finalFee.toLocaleString()}원
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 상환 스케줄 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>상환 스케줄</CardTitle>
            <Button variant="outline" onClick={() => setShowSchedule(!showSchedule)}>
              {showSchedule ? '숨기기' : '펼치기'}
            </Button>
          </div>
        </CardHeader>
        {showSchedule && (
          <CardContent>
            <ScheduleTable schedule={schedule} bank={result.bank} months={months} />
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// ============================================================================
// 컴포넌트: 상환 스케줄 테이블
// ============================================================================

function ScheduleTable({
  schedule,
  bank,
  months,
}: {
  schedule: ReturnType<typeof generatePaymentSchedule>;
  bank: 'welcome' | 'jeonbuk';
  months: number;
}) {
  // 환수 기간 판단
  const isClawbackMonth = (month: number) => {
    if (bank === 'welcome') {
      // 웰컴: 3개월 이내(100%) 또는 12개월 미만(50%)
      return month <= 3 || month < 12;
    } else {
      // 전북: 6개월 이내
      return month <= 6;
    }
  };

  const getClawbackLabel = (month: number) => {
    if (bank === 'welcome') {
      if (month <= 3) return '100% 환수';
      if (month < 12) return '50% 환수';
    } else {
      if (month <= 6) return '환수 위험';
    }
    return null;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left">월</th>
            <th className="px-4 py-2 text-right">원금상환</th>
            <th className="px-4 py-2 text-right">이자</th>
            <th className="px-4 py-2 text-right">월납입액</th>
            <th className="px-4 py-2 text-right">잔액</th>
            <th className="px-4 py-2 text-center">환수</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((item) => {
            const isClawback = isClawbackMonth(item.month);
            const clawbackLabel = getClawbackLabel(item.month);

            return (
              <tr
                key={item.month}
                className={`border-b ${isClawback ? 'bg-red-50' : ''}`}
              >
                <td className={`px-4 py-2 ${isClawback ? 'font-bold text-red-600' : ''}`}>
                  {item.month}
                </td>
                <td className="px-4 py-2 text-right">
                  {item.principal.toLocaleString()}원
                </td>
                <td className="px-4 py-2 text-right">
                  {item.interest.toLocaleString()}원
                </td>
                <td className="px-4 py-2 text-right font-medium">
                  {item.payment.toLocaleString()}원
                </td>
                <td className="px-4 py-2 text-right text-gray-600">
                  {item.balance.toLocaleString()}원
                </td>
                <td className="px-4 py-2 text-center">
                  {clawbackLabel && (
                    <span className="text-xs font-bold text-red-600">
                      ⚠️ {clawbackLabel}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// 컴포넌트: 은행 결과 카드
// ============================================================================

function BankResultCard({
  result,
  isRecommended,
}: {
  result: LoanResult;
  isRecommended: boolean;
}) {
  return (
    <Card className={isRecommended ? 'border-2 border-primary' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {result.bankName}
          </CardTitle>
          {isRecommended && (
            <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
              추천
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 주요 정보 */}
        <div className="grid grid-cols-2 gap-4">
          <InfoItem label="대출 수수료" value={`${result.finalFee.toLocaleString()}원`} />
          <InfoItem label="수수료율" value={result.feeRate} />
          <InfoItem label="실수령액" value={`${result.receivedAmount.toLocaleString()}원`} />
          <InfoItem label="적용 금리" value={`${result.appliedRate}%`} />
          <InfoItem label="월 납입액" value={`${result.monthlyPayment.toLocaleString()}원`} highlight />
          <InfoItem label="총 이자" value={`${result.totalInterest.toLocaleString()}원`} />
        </div>

        <Separator />

        {/* 엔비코리아 중개 수수료 */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200">
          <div className="flex items-center justify-between">
            <span className="font-medium text-purple-900">💼 엔비코리아 중개 수수료 (2.5%)</span>
            <span className="text-xl font-bold text-purple-600">
              {Math.round((result.receivedAmount + result.finalFee) * 0.025).toLocaleString()}원
            </span>
          </div>
          <p className="text-xs text-purple-600 mt-1">대출 금액 기준 2.5%</p>
        </div>

        <Separator />

        {/* 총 비용 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium">💰 총 비용</span>
            <span className="text-2xl font-bold text-primary">
              {result.totalCost.toLocaleString()}원
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">수수료 + 이자 + 중도상환수수료</p>
        </div>

        {/* 경고 */}
        {result.warnings.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>주의사항</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {result.warnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// 컴포넌트: 정보 항목
// ============================================================================

function InfoItem({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <div className="text-sm text-gray-600">{label}</div>
      <div className={`font-medium ${highlight ? 'text-lg text-primary' : ''}`}>{value}</div>
    </div>
  );
}
