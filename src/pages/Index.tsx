
import { useState, useEffect } from "react";
import { Search, Plus, Filter, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import PromptCard from "@/components/PromptCard";
import PromptRegistration from "@/components/PromptRegistration";
import FilterDropdown from "@/components/FilterDropdown";

interface Prompt {
  id: string;
  title: string;
  role: string;
  type: string;
  description: string;
  content: string;
  createdAt: Date;
}

const SAMPLE_PROMPTS: Prompt[] = [
  {
    id: "1",
    title: "회의록 작성 도우미",
    role: "기획자",
    type: "작성",
    description: "회의 내용을 체계적이고 명확한 회의록으로 정리해주는 프롬프트",
    content: "다음 회의 내용을 바탕으로 체계적인 회의록을 작성해주세요.\n\n[회의 정보]\n- 회의명: \n- 일시: \n- 참석자: \n- 안건: \n\n[회의 내용]\n(여기에 회의 내용 입력)\n\n다음 형식으로 정리해주세요:\n1. 주요 논의사항\n2. 결정사항\n3. 액션 아이템 (담당자, 마감일 포함)\n4. 다음 회의 일정",
    createdAt: new Date()
  },
  {
    id: "2", 
    title: "데이터 분석 보고서 요약",
    role: "분석가",
    type: "요약",
    description: "복잡한 데이터 분석 결과를 핵심 인사이트 중심으로 요약하는 프롬프트",
    content: "다음 데이터 분석 결과를 경영진이 이해하기 쉽도록 요약해주세요.\n\n[분석 데이터]\n(여기에 분석 데이터 입력)\n\n다음 구조로 요약해주세요:\n1. 핵심 인사이트 (3가지 이내)\n2. 주요 수치 및 트렌드\n3. 비즈니스 임팩트\n4. 권장 액션\n\n• 전문 용어는 쉽게 풀어서 설명\n• 시각적 요소(차트, 그래프) 활용 제안\n• 1페이지 분량으로 간결하게 작성",
    createdAt: new Date()
  },
  {
    id: "3",
    title: "고객 피드백 분석",
    role: "마케터",
    type: "분석",
    description: "고객 피드백을 체계적으로 분류하고 개선 방안을 도출하는 프롬프트",
    content: "다음 고객 피드백을 분석하여 개선 방안을 제시해주세요.\n\n[고객 피드백 데이터]\n(여기에 피드백 내용 입력)\n\n분석 요청사항:\n1. 피드백 카테고리별 분류 (서비스, 제품, 가격, 지원 등)\n2. 긍정/부정 피드백 비율\n3. 주요 불만사항 TOP 5\n4. 개선 우선순위 및 구체적 액션 플랜\n5. 긍정적 피드백에서 발견한 강점\n\n결과는 표 형태로 정리하고, 각 개선방안에 대한 예상 효과와 소요 리소스를 포함해주세요.",
    createdAt: new Date()
  }
];

const Index = () => {
  const [prompts, setPrompts] = useState<Prompt[]>(SAMPLE_PROMPTS);
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>(SAMPLE_PROMPTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("전체");
  const [selectedType, setSelectedType] = useState("전체");
  const [showRegistration, setShowRegistration] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { toast } = useToast();

  // 다크모드 토글
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // 검색 및 필터링
  useEffect(() => {
    let filtered = prompts;

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(prompt => 
        prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 역할 필터링
    if (selectedRole !== "전체") {
      filtered = filtered.filter(prompt => prompt.role === selectedRole);
    }

    // 유형 필터링
    if (selectedType !== "전체") {
      filtered = filtered.filter(prompt => prompt.type === selectedType);
    }

    setFilteredPrompts(filtered);
  }, [prompts, searchTerm, selectedRole, selectedType]);

  const handlePromptCopy = (content: string, title: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "프롬프트 복사됨!",
      description: `"${title}" 프롬프트가 클립보드에 복사되었습니다.`,
      duration: 2000,
    });
  };

  const handlePromptSubmit = (newPrompt: Omit<Prompt, 'id' | 'createdAt'>) => {
    const prompt: Prompt = {
      ...newPrompt,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setPrompts(prev => [prompt, ...prev]);
    setShowRegistration(false);
    toast({
      title: "프롬프트 등록 완료!",
      description: "새로운 프롬프트가 성공적으로 등록되었습니다.",
      duration: 2000,
    });
  };

  const roles = ["전체", ...Array.from(new Set(prompts.map(p => p.role)))];
  const types = ["전체", ...Array.from(new Set(prompts.map(p => p.type)))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              HS본부 프롬프트 라이브러리
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              검증된 프롬프트를 빠르게 찾고 복사해 바로 활용하세요
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button 
              onClick={() => setShowRegistration(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              프롬프트 등록
            </Button>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="프롬프트 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 dark:border-gray-600"
              />
            </div>
            <div className="flex gap-3">
              <FilterDropdown
                label="역할"
                options={roles}
                value={selectedRole}
                onChange={setSelectedRole}
              />
              <FilterDropdown
                label="유형"
                options={types}
                value={selectedType}
                onChange={setSelectedType}
              />
            </div>
          </div>
        </div>

        {/* 프롬프트 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onCopy={handlePromptCopy}
            />
          ))}
        </div>

        {filteredPrompts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 dark:text-gray-500 text-lg mb-4">
              검색 조건에 맞는 프롬프트가 없습니다
            </div>
            <Button 
              onClick={() => setShowRegistration(true)}
              variant="outline"
            >
              새 프롬프트 등록하기
            </Button>
          </div>
        )}

        {/* 프롬프트 등록 사이드패널 */}
        <Sheet open={showRegistration} onOpenChange={setShowRegistration}>
          <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>새 프롬프트 등록</SheetTitle>
              <SheetDescription>
                팀에서 공유할 프롬프트를 등록해주세요
              </SheetDescription>
            </SheetHeader>
            <PromptRegistration
              onSubmit={handlePromptSubmit}
              onClose={() => setShowRegistration(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default Index;
