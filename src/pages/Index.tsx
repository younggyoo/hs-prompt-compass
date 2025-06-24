import { useState, useEffect } from "react";
import PromptCard from "@/components/PromptCard";
import PromptRegistration from "@/components/PromptRegistration";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Prompt {
  id: string;
  title: string;
  role: string;
  type: string;
  description: string;
  content: string;
  result?: string;
  likes: number;
  createdAt: Date;
}

const Index = () => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const { toast } = useToast();

  const [prompts, setPrompts] = useState<Prompt[]>([
    {
      id: "1",
      title: "회의록 요약 프롬프트",
      role: "기획자",
      type: "요약",
      description: "긴 회의록을 핵심 내용 중심으로 간결하게 요약해주는 프롬프트",
      content: `다음 회의록을 읽고 핵심 내용을 3개 섹션으로 요약해주세요:

1. 주요 결정사항
2. 액션 아이템 (담당자별)
3. 다음 회의 안건

회의록:
[여기에 회의록 붙여넣기]`,
      result: `주요 결정사항:
- 신제품 출시일을 3월 15일로 확정
- 마케팅 예산 20% 증액 승인

액션 아이템:
- 김과장: 제품 사양서 최종 검토 (2/28까지)  
- 이대리: 마케팅 캠페인 기획안 작성 (3/5까지)

다음 회의 안건:
- 제품 런칭 이벤트 계획 검토
- Q1 매출 목표 재설정`,
      likes: 12,
      createdAt: new Date('2024-01-15'),
    },
    {
      id: "2", 
      title: "보고서 작성 프롬프트",
      role: "분석가",
      type: "작성",
      description: "데이터를 바탕으로 체계적인 분석 보고서를 작성하는 프롬프트",
      content: `다음 구조로 분석 보고서를 작성해주세요:

## 개요
- 분석 목적
- 데이터 범위
- 주요 발견사항 요약

## 상세 분석
- 핵심 지표 분석
- 트렌드 분석
- 문제점 및 기회요인

## 결론 및 제언
- 핵심 인사이트
- 실행 가능한 제언사항

데이터: [여기에 분석할 데이터 붙여넣기]`,
      result: `## 개요
분석 목적: 고객 이탈률 감소 방안 도출
데이터 범위: 2023년 1-12월 고객 데이터
주요 발견사항: 신규 고객 이탈률 35% → 기존 고객 대비 3배 높음

## 상세 분석  
핵심 지표: 첫 구매 후 30일 이내 이탈률이 가장 높음
트렌드: 모바일 앱 사용자의 이탈률이 웹 사용자보다 낮음
기회요인: 개인화 추천 서비스 이용 고객의 재구매율 60% 향상

## 결론 및 제언
핵심 인사이트: 초기 고객 경험이 이탈률에 결정적 영향
제언사항: 신규 고객 온보딩 프로그램 및 개인화 서비스 확대`,
      likes: 8,
      createdAt: new Date('2024-01-20'),
    },
    {
      id: "3",
      title: "경쟁사 분석 프롬프트", 
      role: "마케터",
      type: "분석",
      description: "경쟁사의 마케팅 전략과 제품을 체계적으로 분석하는 프롬프트",
      content: `경쟁사 [회사명]에 대해 다음 항목별로 분석해주세요:

## 기업 개요
- 설립연도, 규모, 주요 사업영역
- 최근 3년 매출 및 성장률

## 제품/서비스 분석  
- 주력 제품/서비스 특징
- 가격 정책 및 포지셔닝
- 우리 제품과의 차별점

## 마케팅 전략
- 주요 마케팅 채널 및 메시지
- 타겟 고객층
- 최근 캠페인 성과

## SWOT 분석
- 강점/약점/기회/위협 요인

## 시사점
- 우리가 참고할 점
- 대응 전략 제안`,
      likes: 15,
      createdAt: new Date('2024-01-25'),
    },
  ]);

  const handleCopy = (content: string, title: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: `${title} 내용이 복사되었습니다.`,
    });
  };

  const handleLike = (promptId: string) => {
    setPrompts(prevPrompts => 
      prevPrompts.map(prompt =>
        prompt.id === promptId 
          ? { ...prompt, likes: prompt.likes + 1 }
          : prompt
      )
    );
  };

  const addPrompt = (newPromptData: Omit<Prompt, 'id' | 'createdAt' | 'likes'>) => {
    const newPrompt: Prompt = {
      ...newPromptData,
      id: Date.now().toString(),
      likes: 0,
      createdAt: new Date(),
    };
    setPrompts(prev => [newPrompt, ...prev]);
  };

  const filteredPrompts = prompts.filter(prompt => {
    const searchRegex = new RegExp(searchQuery, 'i');
    const matchesSearch = searchRegex.test(prompt.title) || searchRegex.test(prompt.description) || searchRegex.test(prompt.content);

    const matchesRole = selectedRole ? prompt.role === selectedRole : true;
    const matchesType = selectedType ? prompt.type === selectedType : true;

    return matchesSearch && matchesRole && matchesType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <header className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
          나만의 ChatGPT 프롬프트
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mt-2">
          나만의 ChatGPT 프롬프트를 만들고 공유하세요!
        </p>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <Input
              type="search"
              placeholder="프롬프트 검색..."
              className="w-full md:w-64 lg:w-80"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <Select onValueChange={value => setSelectedRole(value === "all" ? null : value)}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="역할 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 역할</SelectItem>
                <SelectItem value="기획자">기획자</SelectItem>
                <SelectItem value="마케터">마케터</SelectItem>
                <SelectItem value="개발자">개발자</SelectItem>
                <SelectItem value="디자이너">디자이너</SelectItem>
                <SelectItem value="분석가">분석가</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={value => setSelectedType(value === "all" ? null : value)}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="타입 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 타입</SelectItem>
                <SelectItem value="요약">요약</SelectItem>
                <SelectItem value="번역">번역</SelectItem>
                <SelectItem value="작성">작성</SelectItem>
                <SelectItem value="분석">분석</SelectItem>
                <SelectItem value="생성">생성</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={() => setIsRegistrationOpen(true)}>
            새 프롬프트 등록
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onCopy={handleCopy}
              onLike={handleLike}
            />
          ))}
        </div>

        {filteredPrompts.length === 0 && (
          <div className="text-center mt-8">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              검색 결과가 없습니다.
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              다른 검색어를 사용하거나 필터를 조정해보세요.
            </p>
          </div>
        )}
      </main>

      {isRegistrationOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                프롬프트 등록
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setIsRegistrationOpen(false)}>
                닫기
              </Button>
            </div>
            <PromptRegistration onSubmit={addPrompt} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
