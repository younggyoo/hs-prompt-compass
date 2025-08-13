import { useState, useEffect } from "react";
import PromptCard from "@/components/PromptCard";
import PromptRegistration from "@/components/PromptRegistration";
import PromptDialog from "@/components/PromptDialog";
import VisitorCounter from "@/components/VisitorCounter";
import AdminMode from "@/components/AdminMode";
import PasswordDialog from "@/components/PasswordDialog";
import LoginDialog from "@/components/LoginDialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/hooks/use-toast";
import { User, Heart, FileText, LogOut } from "lucide-react";

interface Comment {
  id: string;
  author: string;
  content: string;
  password?: string;
  createdAt: Date;
}

interface Prompt {
  id: string;
  title: string;
  role: string;
  type: string;
  description: string;
  content: string;
  result?: string;
  tool?: string;
  author: string;
  password?: string;
  likes: number;
  views: number;
  copyCount: number;
  comments: Comment[];
  createdAt: Date;
}

const Index = () => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("전체");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("likes");
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editPrompt, setEditPrompt] = useState<Prompt | null>(null);
  const [likedPrompts, setLikedPrompts] = useState<string[]>(() => {
    const saved = localStorage.getItem('hs-liked-prompts');
    return saved ? JSON.parse(saved) : [];
  });
  const [passwordDialog, setPasswordDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: (password: string) => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });
  
  // 새로 추가된 상태들
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('hs-current-user');
  });
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [viewFilter, setViewFilter] = useState<'all' | 'my' | 'liked'>('all');
  
  const { toast } = useToast();

  // 로컬 스토리지에서 프롬프트 불러오기
  const [prompts, setPrompts] = useState<Prompt[]>(() => {
    const savedPrompts = localStorage.getItem('hs-prompts');
    if (savedPrompts) {
      try {
        const parsed = JSON.parse(savedPrompts);
        return parsed.map((p: any) => ({
          ...p,
          copyCount: p.copyCount || 0,
          createdAt: new Date(p.createdAt),
          comments: p.comments?.map((c: any) => ({
            ...c,
            createdAt: new Date(c.createdAt)
          })) || []
        }));
      } catch (error) {
        console.error('Failed to parse saved prompts:', error);
      }
    }
    
    // 기본 예시 프롬프트 20개
    return [
      {
        id: "1",
        title: "📝 회의록 요약 프롬프트",
        role: "기획",
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
        author: "김기획",
        tool: "ChatGPT, Claude",
        password: "default123",
        likes: 45,
        views: 234,
        copyCount: 89,
        comments: [],
        createdAt: new Date('2024-01-15'),
      },
      {
        id: "2", 
        title: "📊 보고서 작성 프롬프트",
        role: "R&D",
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
        tool: "ChatGPT, Gemini",
        author: "이R&D",
        password: "default123",
        likes: 38,
        views: 189,
        copyCount: 62,
        comments: [],
        createdAt: new Date('2024-01-20'),
      },
      {
        id: "3",
        title: "💡 아이디어 발굴 브레인스토밍",
        role: "기획",
        type: "아이디어",
        description: "창의적인 아이디어를 체계적으로 발굴하고 정리하는 프롬프트",
        content: `주어진 주제에 대해 창의적인 아이디어를 발굴해주세요:

1. 현재 상황 분석
2. 문제점 및 개선 필요사항
3. 창의적 아이디어 10가지 (실현 가능성 고려)
4. 각 아이디어의 장단점 분석
5. 우선순위 및 실행 방안

주제: [여기에 브레인스토밍 주제 입력]`,
        tool: "Claude, ChatGPT",
        author: "박기획",
        likes: 32,
        views: 156,
        copyCount: 47,
        comments: [],
        createdAt: new Date('2024-01-25'),
      },
      {
        id: "4",
        title: "🔄 프로세스 개선 분석",
        role: "생산",
        type: "분석",
        description: "현재 프로세스를 분석하고 개선 방안을 도출하는 프롬프트",
        content: `현재 프로세스를 분석하고 개선 방안을 제시해주세요:

## 현황 분석
- 현재 프로세스 단계별 분석
- 소요 시간 및 자원 분석
- 병목 구간 식별

## 문제점 도출
- 비효율적인 구간
- 중복 작업
- 불필요한 단계

## 개선 방안
- 프로세스 간소화 방안
- 자동화 가능 영역
- 예상 효과 및 ROI

현재 프로세스: [여기에 프로세스 설명 입력]`,
        tool: "ChatGPT",
        author: "최생산",
        likes: 28,
        views: 98,
        copyCount: 39,
        comments: [],
        createdAt: new Date('2024-02-01'),
      },
      {
        id: "5",
        title: "📈 시장 조사 분석 템플릿",
        role: "영업/마케팅",
        type: "분석",
        description: "시장 조사 데이터를 체계적으로 분석하는 프롬프트",
        content: `다음 시장 조사 데이터를 분석해주세요:

## 시장 개요
- 시장 규모 및 성장률
- 주요 트렌드
- 성장 동력

## 경쟁사 분석
- 주요 경쟁사 현황
- 경쟁사 강점/약점
- 시장 점유율

## 기회 요인
- 시장 기회
- 진입 전략
- 예상 리스크

조사 데이터: [여기에 시장 조사 데이터 입력]`,
        tool: "ChatGPT, Gemini",
        author: "김영업",
        likes: 41,
        views: 203,
        copyCount: 55,
        comments: [],
        createdAt: new Date('2024-02-05'),
      },
      {
        id: "6",
        title: "🎯 목표 설정 및 KPI 수립",
        role: "공통",
        type: "작성",
        description: "SMART 기법을 활용한 목표 설정 및 KPI 수립 프롬프트",
        content: `SMART 기법을 활용하여 목표를 설정하고 KPI를 수립해주세요:

## 목표 설정 (SMART)
- Specific (구체적)
- Measurable (측정 가능)
- Achievable (달성 가능)
- Relevant (관련성)
- Time-bound (시한)

## KPI 설계
- 핵심 성과 지표 3-5개
- 측정 방법
- 목표 수치
- 모니터링 주기

## 실행 계획
- 세부 액션 플랜
- 담당자 및 일정
- 리스크 관리 방안

현재 상황 및 목표: [여기에 입력]`,
        tool: "ChatGPT",
        author: "이공통",
        likes: 35,
        views: 167,
        copyCount: 44,
        comments: [],
        createdAt: new Date('2024-02-10'),
      },
      {
        id: "7",
        title: "🔍 품질 이슈 근본 원인 분석",
        role: "품질",
        type: "분석",
        description: "5 Why 기법을 활용한 품질 이슈 근본 원인 분석 프롬프트",
        content: `5 Why 기법을 사용하여 품질 이슈의 근본 원인을 분석해주세요:

## 문제 정의
- 발생한 품질 이슈 명확히 정의
- 영향 범위 및 심각도

## 5 Why 분석
- Why 1: 첫 번째 원인
- Why 2: 더 깊은 원인
- Why 3: 시스템적 원인
- Why 4: 구조적 원인  
- Why 5: 근본 원인

## 해결 방안
- 단기 대응책
- 중장기 개선 방안
- 재발 방지 대책

품질 이슈: [여기에 품질 이슈 상황 입력]`,
        tool: "Claude, ChatGPT",
        author: "박품질",
        likes: 29,
        views: 134,
        copyCount: 38,
        comments: [],
        createdAt: new Date('2024-02-15'),
      },
      {
        id: "8",
        title: "📋 체크리스트 작성 가이드",
        role: "공통",
        type: "작성",
        description: "업무별 체크리스트를 체계적으로 작성하는 프롬프트",
        content: `다음 업무에 대한 체크리스트를 작성해주세요:

## 사전 준비 사항
- [ ] 필요 자료 준비
- [ ] 관련자 사전 협의
- [ ] 일정 및 장소 확정

## 실행 단계별 체크리스트
- [ ] 1단계 작업 항목들
- [ ] 2단계 작업 항목들
- [ ] 3단계 작업 항목들

## 완료 후 확인사항
- [ ] 결과물 품질 점검
- [ ] 이해관계자 승인
- [ ] 문서화 및 보고

업무 내용: [여기에 체크리스트가 필요한 업무 입력]`,
        tool: "ChatGPT",
        author: "정공통",
        likes: 33,
        views: 145,
        copyCount: 41,
        comments: [],
        createdAt: new Date('2024-02-20'),
      },
      {
        id: "9",
        title: "🌐 번역 및 현지화 가이드",
        role: "공통",
        type: "번역",
        description: "문서를 정확하고 자연스럽게 번역하는 프롬프트",
        content: `다음 문서를 {목표 언어}로 번역해주세요:

## 번역 가이드라인
- 원문의 의미를 정확히 전달
- 자연스러운 {목표 언어} 표현 사용
- 업계 전문 용어 적절히 활용
- 문화적 맥락 고려

## 번역 결과
[번역된 내용]

## 주요 용어 설명
- 전문 용어 1: 설명
- 전문 용어 2: 설명

원문: [여기에 번역할 문서 입력]
목표 언어: [여기에 목표 언어 입력]`,
        tool: "ChatGPT, DeepL, Gemini",
        author: "한번역",
        likes: 27,
        views: 112,
        copyCount: 29,
        comments: [],
        createdAt: new Date('2024-02-25'),
      },
      {
        id: "10",
        title: "📊 데이터 시각화 기획",
        role: "R&D",
        type: "작성",
        description: "효과적인 데이터 시각화 방안을 기획하는 프롬프트",
        content: `다음 데이터에 대한 시각화 방안을 기획해주세요:

## 데이터 분석
- 데이터 유형 및 특성
- 핵심 메시지
- 타겟 오디언스

## 시각화 방안
- 적합한 차트 유형 (막대, 선, 파이 등)
- 색상 및 디자인 가이드
- 레이아웃 구성

## 스토리텔링
- 데이터가 전달하는 핵심 인사이트
- 논리적 구성 순서
- 액션 아이템

데이터 설명: [여기에 시각화할 데이터 설명 입력]`,
        tool: "ChatGPT, Claude",
        author: "차R&D",
        likes: 31,
        views: 178,
        copyCount: 36,
        comments: [],
        createdAt: new Date('2024-03-01'),
      },
      {
        id: "11",
        title: "🚀 프로젝트 킥오프 준비",
        role: "기획",
        type: "작성",
        description: "프로젝트 시작을 위한 킥오프 미팅 준비 프롬프트",
        content: `프로젝트 킥오프 미팅을 위한 준비사항을 정리해주세요:

## 프로젝트 개요
- 프로젝트 목적 및 목표
- 범위 및 제약사항
- 성공 기준

## 팀 구성 및 역할
- 프로젝트 매니저
- 핵심 팀원 및 역할
- 의사결정 체계

## 일정 및 마일스톤
- 주요 단계별 일정
- 중요 마일스톤
- 리스크 요인

## 커뮤니케이션 계획
- 보고 체계
- 회의 일정
- 협업 도구

프로젝트 정보: [여기에 프로젝트 기본 정보 입력]`,
        tool: "ChatGPT",
        author: "김프로젝트",
        likes: 39,
        views: 198,
        copyCount: 42,
        comments: [],
        createdAt: new Date('2024-03-05'),
      },
      {
        id: "12",
        title: "💰 예산 계획 수립 가이드",
        role: "구매",
        type: "작성",
        description: "체계적인 예산 계획 수립을 위한 프롬프트",
        content: `다음 프로젝트/부서의 예산 계획을 수립해주세요:

## 예산 항목 분류
- 인건비
- 재료비/구매비
- 운영비
- 기타 비용

## 항목별 상세 계획
- 각 항목별 산출 근거
- 월별/분기별 배분
- 예상 변동 요인

## 예산 관리 방안
- 모니터링 체계
- 승인 프로세스
- 위험 관리

## 대안 시나리오
- 예산 증액/삭감 시나리오
- 우선순위 조정 방안

예산 대상: [여기에 예산이 필요한 프로젝트/부서 정보 입력]`,
        tool: "ChatGPT, Excel GPT",
        author: "이구매",
        likes: 26,
        views: 89,
        copyCount: 21,
        comments: [],
        createdAt: new Date('2024-03-10'),
      },
      {
        id: "13",
        title: "🔗 공급망 리스크 분석",
        role: "SCM",
        type: "분석",
        description: "공급망의 잠재적 리스크를 분석하고 대응방안을 수립하는 프롬프트",
        content: `공급망 리스크를 분석하고 대응방안을 수립해주세요:

## 리스크 식별
- 공급업체 관련 리스크
- 운송/물류 리스크
- 시장 환경 리스크
- 자연재해/불가항력 리스크

## 리스크 평가
- 발생 가능성 (1-5점)
- 영향도 (1-5점)
- 리스크 매트릭스

## 대응 전략
- 예방 조치
- 완화 방안
- 비상 계획
- 대체 공급망 확보

## 모니터링 체계
- 조기 경보 시스템
- 정기 점검 항목
- 성과 지표

현재 공급망 구조: [여기에 공급망 정보 입력]`,
        tool: "ChatGPT, Claude",
        author: "최SCM",
        likes: 24,
        views: 76,
        copyCount: 18,
        comments: [],
        createdAt: new Date('2024-03-15'),
      },
      {
        id: "14",
        title: "📞 고객 응대 스크립트",
        role: "영업/마케팅",
        type: "작성",
        description: "효과적인 고객 응대를 위한 스크립트 작성 프롬프트",
        content: `다음 상황에 맞는 고객 응대 스크립트를 작성해주세요:

## 기본 응대 프로세스
1. 인사 및 신원 확인
2. 고객 니즈 파악
3. 솔루션 제시
4. 이의제기 대응
5. 마무리 및 후속 조치

## 상황별 스크립트
- 신규 고객 접촉
- 기존 고객 관리
- 불만 처리
- 계약 체결

## 핵심 메시지
- 우리 제품/서비스의 차별점
- 고객 혜택 강조 포인트
- 자주 나오는 질문 대응

## 주의사항
- 금지 표현
- 필수 확인 사항
- 에스컬레이션 기준

응대 상황: [여기에 구체적인 응대 상황 입력]`,
        tool: "ChatGPT",
        author: "박영업",
        likes: 37,
        views: 143,
        copyCount: 40,
        comments: [],
        createdAt: new Date('2024-03-20'),
      },
      {
        id: "15",
        title: "🧪 실험 설계 및 분석",
        role: "R&D",
        type: "분석",
        description: "과학적 실험 설계와 결과 분석을 위한 프롬프트",
        content: `다음 실험을 설계하고 결과를 분석해주세요:

## 실험 설계
- 가설 설정
- 변수 정의 (독립/종속/통제변수)
- 실험군/대조군 구성
- 샘플 크기 결정

## 실험 절차
- 단계별 실험 방법
- 측정 도구 및 방법
- 데이터 수집 계획
- 품질 관리 방안

## 결과 분석
- 기술통계 분석
- 가설 검정
- 통계적 유의성 판단
- 실용적 의미 해석

## 결론 및 제언
- 가설 채택/기각 결론
- 한계점 및 개선사항
- 후속 연구 방향

실험 주제: [여기에 실험 주제 및 목적 입력]`,
        tool: "ChatGPT, Claude, R-GPT",
        author: "연R&D",
        likes: 22,
        views: 67,
        copyCount: 15,
        comments: [],
        createdAt: new Date('2024-03-25'),
      },
      {
        id: "16",
        title: "📝 표준 작업 지시서 작성",
        role: "생산",
        type: "작성",
        description: "명확하고 실행 가능한 표준 작업 지시서 작성 프롬프트",
        content: `다음 작업에 대한 표준 작업 지시서를 작성해주세요:

## 작업 개요
- 작업명 및 목적
- 적용 범위
- 관련 문서

## 사전 준비사항
- 필요 도구/장비
- 안전 장비
- 작업 환경 조건

## 작업 순서
1. 1단계: 구체적 작업 내용 및 주의사항
2. 2단계: 구체적 작업 내용 및 주의사항
3. 3단계: 구체적 작업 내용 및 주의사항
...

## 품질 기준
- 완료 기준
- 검사 항목
- 불량 판정 기준

## 안전 수칙
- 위험 요소
- 안전 조치
- 응급 상황 대응

작업 내용: [여기에 지시서가 필요한 작업 설명 입력]`,
        tool: "ChatGPT",
        author: "김생산",
        likes: 30,
        views: 121,
        copyCount: 33,
        comments: [],
        createdAt: new Date('2024-03-30'),
      },
      {
        id: "17",
        title: "🎨 창의적 네이밍 아이디어",
        role: "영업/마케팅",
        type: "아이디어",
        description: "제품/서비스명 등 창의적 네이밍 아이디어 발굴 프롬프트",
        content: `다음 제품/서비스의 창의적인 이름을 제안해주세요:

## 네이밍 전략
- 타겟 고객층
- 브랜드 포지셔닝
- 전달하고자 하는 메시지
- 차별화 포인트

## 네이밍 옵션 (각 카테고리별 5개씩)
### 직관적 네이밍
1. 기능/특징 기반 이름
2. 혜택 중심 이름
...

### 창의적 네이밍
1. 조합/변형 이름
2. 은유/상징 이름
...

### 브랜드 네이밍
1. 감성 어필 이름
2. 프리미엄 느낌 이름
...

## 각 이름별 평가
- 기억하기 쉬운 정도
- 발음하기 쉬운 정도
- 브랜드 적합성
- 상표 등록 가능성

제품/서비스 설명: [여기에 네이밍 대상 설명 입력]`,
        tool: "ChatGPT, Claude",
        author: "홍마케팅",
        likes: 43,
        views: 176,
        copyCount: 48,
        comments: [],
        createdAt: new Date('2024-04-01'),
      },
      {
        id: "18",
        title: "⚡ 문제 해결 프레임워크",
        role: "공통",
        type: "분석",
        description: "체계적인 문제 해결을 위한 프레임워크 적용 프롬프트",
        content: `다음 문제를 체계적으로 해결해주세요:

## 1단계: 문제 정의
- 문제 상황 명확화
- 이상과 현실의 차이
- 문제의 범위와 영향도

## 2단계: 원인 분석
- 직접 원인
- 간접 원인  
- 근본 원인 (fishbone diagram 활용)

## 3단계: 해결 방안 도출
- 브레인스토밍 (최소 10개 아이디어)
- 실현 가능성 평가
- 비용 대비 효과 분석

## 4단계: 최적 방안 선택
- 평가 기준 설정
- 방안별 점수화
- 최종 추천 방안

## 5단계: 실행 계획
- 세부 실행 단계
- 일정 및 담당자
- 성과 측정 방법

문제 상황: [여기에 해결이 필요한 문제 상황 입력]`,
        tool: "ChatGPT, Claude",
        author: "서문제해결",
        likes: 36,
        views: 152,
        copyCount: 41,
        comments: [],
        createdAt: new Date('2024-04-05'),
      },
      {
        id: "19",
        title: "📊 성과 평가 시스템 설계",
        role: "공통",
        type: "작성",
        description: "공정하고 효과적인 성과 평가 시스템 설계 프롬프트",
        content: `성과 평가 시스템을 설계해주세요:

## 평가 체계 설계
- 평가 대상 및 주기
- 평가자 구성
- 평가 방식 (360도, 상향평가 등)

## 평가 지표 설정
### 정량적 지표 (60%)
- 업무 성과 지표
- 목표 달성도
- 생산성 지표

### 정성적 지표 (40%)
- 역량 평가
- 협업 및 소통
- 개발 노력

## 평가 프로세스
1. 목표 설정 (연초)
2. 중간 점검 (분기별)
3. 최종 평가 (연말)
4. 피드백 및 개발계획 수립

## 공정성 확보 방안
- 평가 기준 투명성
- 이의제기 절차
- 보정 시스템

평가 대상: [여기에 평가 대상 조직/직무 정보 입력]`,
        tool: "ChatGPT",
        author: "성평가담당",
        likes: 28,
        views: 94,
        copyCount: 22,
        comments: [],
        createdAt: new Date('2024-04-10'),
      },
      {
        id: "20",
        title: "🔒 정보보안 점검 체크리스트",
        role: "공통",
        type: "작성",
        description: "조직의 정보보안 수준을 점검하는 체크리스트 작성 프롬프트",
        content: `정보보안 점검 체크리스트를 작성해주세요:

## 물리적 보안
- [ ] 출입 통제 시스템 운영
- [ ] CCTV 및 보안 시설 점검
- [ ] 중요 자료 보관 상태
- [ ] 외부인 방문 관리

## 네트워크 보안
- [ ] 방화벽 설정 상태
- [ ] 백신 프로그램 최신 업데이트
- [ ] 무선 네트워크 보안 설정
- [ ] VPN 접속 관리

## 데이터 보안
- [ ] 중요 데이터 암호화
- [ ] 정기 백업 실시
- [ ] 접근 권한 관리
- [ ] 데이터 폐기 절차

## 사용자 보안
- [ ] 비밀번호 정책 준수
- [ ] 보안 교육 이수
- [ ] 개인정보 처리 규정 준수
- [ ] 보안 사고 대응 절차 숙지

## 정기 점검 사항
- 월간 점검 항목
- 분기별 심화 점검
- 연간 종합 평가

점검 대상: [여기에 점검할 조직/시스템 정보 입력]`,
        tool: "ChatGPT, Claude",
        author: "보안담당",
        likes: 34,
        views: 138,
        copyCount: 37,
        comments: [],
        createdAt: new Date('2024-04-15'),
      },
    ];
  });

  // 프롬프트와 좋아요 목록이 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem('hs-prompts', JSON.stringify(prompts));
  }, [prompts]);

  useEffect(() => {
    localStorage.setItem('hs-liked-prompts', JSON.stringify(likedPrompts));
  }, [likedPrompts]);

  // 사용자 로그인 처리
  const handleLogin = (username: string) => {
    setCurrentUser(username);
    localStorage.setItem('hs-current-user', username);
  };

  // 사용자 로그아웃 처리
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('hs-current-user');
    setViewFilter('all');
    toast({
      title: "로그아웃되었습니다.",
    });
  };

  const handleCopy = (content: string, title: string) => {
    navigator.clipboard.writeText(content);
    
    // 복사수 증가
    setPrompts(prevPrompts => 
      prevPrompts.map(prompt =>
        prompt.title === title 
          ? { ...prompt, copyCount: (prompt.copyCount || 0) + 1 }
          : prompt
      )
    );
    
    toast({
      title: `${title} 내용이 복사되었습니다.`,
    });
  };

  const handleLike = (promptId: string) => {
    const isCurrentlyLiked = likedPrompts.includes(promptId);
    
    if (isCurrentlyLiked) {
      // 좋아요 취소
      setLikedPrompts(prev => prev.filter(id => id !== promptId));
      setPrompts(prevPrompts => 
        prevPrompts.map(prompt =>
          prompt.id === promptId 
            ? { ...prompt, likes: Math.max(0, prompt.likes - 1) }
            : prompt
        )
      );
    } else {
      // 좋아요 추가
      setLikedPrompts(prev => [...prev, promptId]);
      setPrompts(prevPrompts => 
        prevPrompts.map(prompt =>
          prompt.id === promptId 
            ? { ...prompt, likes: prompt.likes + 1 }
            : prompt
        )
      );
    }

    // 다이얼로그가 열려있고 현재 프롬프트가 좋아요 된 프롬프트라면 업데이트
    if (selectedPrompt && selectedPrompt.id === promptId) {
      const newLikes = isCurrentlyLiked ? Math.max(0, selectedPrompt.likes - 1) : selectedPrompt.likes + 1;
      setSelectedPrompt(prev => prev ? { ...prev, likes: newLikes } : null);
    }
  };

  const addPrompt = (newPromptData: Omit<Prompt, 'id' | 'createdAt' | 'likes' | 'views' | 'comments' | 'copyCount'>) => {
    const newPrompt: Prompt = {
      ...newPromptData,
      id: Date.now().toString(),
      likes: 0,
      views: 0,
      copyCount: 0,
      comments: [],
      createdAt: new Date(),
    };
    setPrompts(prev => [newPrompt, ...prev]);
  };

  // 프롬프트 등록 시 로그인 체크 제거
  const addPromptWithUser = (newPromptData: Omit<Prompt, 'id' | 'createdAt' | 'likes' | 'views' | 'comments' | 'copyCount'>) => {
    const newPrompt: Prompt = {
      ...newPromptData,
      id: Date.now().toString(),
      author: currentUser || "익명", // 로그인하지 않은 경우 "익명"으로 처리
      likes: 0,
      views: 0,
      copyCount: 0,
      comments: [],
      createdAt: new Date(),
    };
    setPrompts(prev => [newPrompt, ...prev]);
  };

  const updatePrompt = (updatedPromptData: Omit<Prompt, 'id' | 'createdAt' | 'likes' | 'views' | 'comments' | 'copyCount'>) => {
    if (!editPrompt) return;
    
    setPrompts(prevPrompts => 
      prevPrompts.map(prompt =>
        prompt.id === editPrompt.id 
          ? { ...prompt, ...updatedPromptData }
          : prompt
      )
    );
    setEditPrompt(null);
  };

  const handleViewContent = (prompt: Prompt) => {
    // 조회수 증가
    setPrompts(prevPrompts => 
      prevPrompts.map(p =>
        p.id === prompt.id 
          ? { ...p, views: p.views + 1 }
          : p
      )
    );
    
    setSelectedPrompt({ ...prompt, views: prompt.views + 1 });
    setIsDialogOpen(true);
  };

  const handleAddComment = (promptId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => {
    const newComment: Comment = {
      ...comment,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    setPrompts(prevPrompts => 
      prevPrompts.map(prompt =>
        prompt.id === promptId 
          ? { ...prompt, comments: [...prompt.comments, newComment] }
          : prompt
      )
    );

    // 다이얼로그가 열려있다면 업데이트
    if (selectedPrompt && selectedPrompt.id === promptId) {
      setSelectedPrompt(prev => prev ? { ...prev, comments: [...prev.comments, newComment] } : null);
    }
  };

  const handleEditComment = (promptId: string, commentId: string, content: string) => {
    setPrompts(prevPrompts => 
      prevPrompts.map(prompt =>
        prompt.id === promptId 
          ? { 
              ...prompt, 
              comments: prompt.comments.map(comment =>
                comment.id === commentId ? { ...comment, content } : comment
              )
            }
          : prompt
      )
    );

    if (selectedPrompt && selectedPrompt.id === promptId) {
      setSelectedPrompt(prev => prev ? {
        ...prev,
        comments: prev.comments.map(comment =>
          comment.id === commentId ? { ...comment, content } : comment
        )
      } : null);
    }
  };

  const handleDeleteComment = (promptId: string, commentId: string) => {
    setPrompts(prevPrompts => 
      prevPrompts.map(prompt =>
        prompt.id === promptId 
          ? { 
              ...prompt, 
              comments: prompt.comments.filter(comment => comment.id !== commentId)
            }
          : prompt
      )
    );

    if (selectedPrompt && selectedPrompt.id === promptId) {
      setSelectedPrompt(prev => prev ? {
        ...prev,
        comments: prev.comments.filter(comment => comment.id !== commentId)
      } : null);
    }
  };

  const handleEditPrompt = (prompt: Prompt) => {
    if (isAdmin) {
      // 관리자는 바로 수정 가능
      setEditPrompt(prompt);
      setIsRegistrationOpen(true);
    } else {
      // 일반 사용자는 비밀번호 확인 필요
      setPasswordDialog({
        isOpen: true,
        title: '프롬프트 수정',
        description: '프롬프트를 수정하려면 비밀번호를 입력해주세요.',
        onConfirm: (password) => {
          if (password === prompt.password) {
            setEditPrompt(prompt);
            setIsRegistrationOpen(true);
            setPasswordDialog(prev => ({ ...prev, isOpen: false }));
          } else {
            toast({
              title: "비밀번호가 틀렸습니다.",
              variant: "destructive",
            });
          }
        }
      });
    }
  };

  const handleDeletePrompt = (promptId: string) => {
    const prompt = prompts.find(p => p.id === promptId);
    if (!prompt) return;

    if (isAdmin) {
      // 관리자는 바로 삭제 가능
      if (confirm('정말로 이 프롬프트를 삭제하시겠습니까?')) {
        setPrompts(prev => prev.filter(p => p.id !== promptId));
        toast({
          title: "프롬프트가 삭제되었습니다.",
        });
      }
    } else {
      // 일반 사용자는 비밀번호 확인 필요
      setPasswordDialog({
        isOpen: true,
        title: '프롬프트 삭제',
        description: '프롬프트를 삭제하려면 비밀번호를 입력해주세요.',
        onConfirm: (password) => {
          if (password === prompt.password) {
            setPrompts(prev => prev.filter(p => p.id !== promptId));
            setPasswordDialog(prev => ({ ...prev, isOpen: false }));
            toast({
              title: "프롬프트가 삭제되었습니다.",
            });
          } else {
            toast({
              title: "비밀번호가 틀렸습니다.",
              variant: "destructive",
            });
          }
        }
      });
    }
  };

  const roles = ["전체", "공통", "상품기획", "R&D", "품질", "구매", "SCM", "생산", "영업/마케팅"];

  const filteredAndSortedPrompts = prompts
    .filter(prompt => {
      const searchRegex = new RegExp(searchQuery, 'i');
      const matchesSearch = searchRegex.test(prompt.title) || searchRegex.test(prompt.description) || searchRegex.test(prompt.content);
      const matchesRole = selectedRole === "전체" || prompt.role === selectedRole;
      const matchesType = selectedType ? prompt.type === selectedType : true;
      const matchesTool = selectedTool ? prompt.tool?.includes(selectedTool) : true;
      
      // 새로운 필터 조건 추가
      let matchesViewFilter = true;
      if (viewFilter === 'my' && currentUser) {
        matchesViewFilter = prompt.author === currentUser;
      } else if (viewFilter === 'liked') {
        matchesViewFilter = likedPrompts.includes(prompt.id);
      }
      
      return matchesSearch && matchesRole && matchesType && matchesTool && matchesViewFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "likes":
          return b.likes - a.likes;
        case "views":
          return b.views - a.views;
        case "copyCount":
          return (b.copyCount || 0) - (a.copyCount || 0);
        case "createdAt":
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <header className="container mx-auto p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#A50034]" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {currentUser}님
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-500"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLoginOpen(true)}
                className="flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                로그인
              </Button>
            )}
          </div>
          <VisitorCounter />
        </div>
        
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mt-4">
          🏢 HS본부 프롬프트 라이브러리
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mt-2 max-w-2xl mx-auto">
          💡 업무에 바로 사용 가능한 프롬프트를 검색하고 복사하여 빠르고 쉽게 사용하세요,<br />
          ✨ 검증된 프롬프트를 찾아보고, 자신의 프롬프트도 공유해 보세요.
        </p>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 flex-1">
              <Input
                type="search"
                placeholder="🔍 프롬프트 검색..."
                className="w-full md:w-64 lg:w-80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <Select onValueChange={setSortBy} defaultValue="likes">
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="📈 정렬 기준" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="likes">👍 좋아요순</SelectItem>
                  <SelectItem value="createdAt">🕐 생성일순</SelectItem>
                  <SelectItem value="views">👁️ 조회수순</SelectItem>
                  <SelectItem value="copyCount">📋 복사순</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={value => setSelectedType(value === "all" ? null : value)}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="🏷️ 타입 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 타입</SelectItem>
                  <SelectItem value="문서 작성">문서 작성</SelectItem>
                  <SelectItem value="요약/정리">요약/정리</SelectItem>
                  <SelectItem value="번역">번역</SelectItem>
                  <SelectItem value="검토/리뷰">검토/리뷰</SelectItem>
                  <SelectItem value="자동화">자동화</SelectItem>
                  <SelectItem value="질문/응답">질문/응답</SelectItem>
                  <SelectItem value="양식화">양식화</SelectItem>
                  <SelectItem value="분류/분석">분류/분석</SelectItem>
                  <SelectItem value="아이디어">아이디어</SelectItem>
                  <SelectItem value="코드 생성/리뷰">코드 생성/리뷰</SelectItem>
                  <SelectItem value="기타">기타</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={value => setSelectedTool(value === "all" ? null : value)}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="🛠️ Tool 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 Tool</SelectItem>
                  <SelectItem value="엘지니 AI">엘지니 AI</SelectItem>
                  <SelectItem value="Chat EXAONE">Chat EXAONE</SelectItem>
                  <SelectItem value="CHATDA">CHATDA</SelectItem>
                  <SelectItem value="METIS">METIS</SelectItem>
                  <SelectItem value="MS Copilot">MS Copilot</SelectItem>
                  <SelectItem value="외부 Tool (ChatGPT, Claude, Gemini 등)">외부 Tool</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => {
                  setEditPrompt(null);
                  setIsRegistrationOpen(true);
                }}
                className="bg-gradient-to-r from-[#A50034] via-[#B8003D] to-[#8B002B] hover:from-[#8B002B] hover:via-[#A50034] hover:to-[#730024] text-white shadow-xl hover:shadow-2xl"
              >
                ➕ 새 프롬프트 등록
              </Button>
              
              {currentUser && (
                <div className="flex gap-2">
                  <Button
                    variant={viewFilter === 'my' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewFilter(viewFilter === 'my' ? 'all' : 'my')}
                    className="flex items-center gap-1"
                  >
                    <FileText className="w-4 h-4" />
                    내가 올린 프롬프트
                  </Button>
                  
                  <Button
                    variant={viewFilter === 'liked' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewFilter(viewFilter === 'liked' ? 'all' : 'liked')}
                    className="flex items-center gap-1"
                  >
                    <Heart className="w-4 h-4" />
                    좋아요한 프롬프트
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <ToggleGroup 
              type="single" 
              value={selectedRole} 
              onValueChange={(value) => setSelectedRole(value || "전체")}
              className="justify-start flex-wrap gap-2"
            >
              {roles.map((role) => (
                <ToggleGroupItem
                  key={role}
                  value={role}
                  aria-label={`${role} 선택`}
                  className={`
                    border-2 rounded-full px-3 py-1 h-auto font-medium transition-all duration-200 text-base
                    ${selectedRole === role 
                      ? 'bg-gradient-to-r from-[#A50034] to-[#8B002B] text-white border-[#A50034] shadow-lg opacity-100 [&>*]:!text-white [text-shadow:1px_1px_2px_rgba(255,255,255,0.8)]' 
                      : 'bg-transparent text-black border-[#A50034] hover:bg-[#A50034]/10 dark:text-white'
                    }
                  `}
                >
                  {role}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filteredAndSortedPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onCopy={handleCopy}
              onLike={handleLike}
              onViewContent={handleViewContent}
              onEdit={handleEditPrompt}
              onDelete={handleDeletePrompt}
              isAdmin={isAdmin}
              currentUser={currentUser}
              likedPrompts={likedPrompts}
            />
          ))}
        </div>

        {filteredAndSortedPrompts.length === 0 && (
          <div className="text-center mt-8">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              😔 {viewFilter === 'my' ? '등록한 프롬프트가' : viewFilter === 'liked' ? '좋아요한 프롬프트가' : '검색 결과가'} 없습니다.
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {viewFilter === 'my' ? '새 프롬프트를 등록해보세요.' : viewFilter === 'liked' ? '마음에 드는 프롬프트에 좋아요를 눌러보세요.' : '다른 검색어를 사용하거나 필터를 조정해보세요.'}
            </p>
          </div>
        )}
      </main>

      {/* 관리자 모드 버튼을 하단에 배치 */}
      <div className="fixed bottom-4 left-4">
        <AdminMode isAdmin={isAdmin} onAdminToggle={setIsAdmin} prompts={prompts} />
      </div>

      <PromptRegistration
        isOpen={isRegistrationOpen}
        onClose={() => {
          setIsRegistrationOpen(false);
          setEditPrompt(null);
        }}
        onSubmit={editPrompt ? updatePrompt : addPromptWithUser}
        editPrompt={editPrompt}
      />

      <PromptDialog
        prompt={selectedPrompt}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onCopy={handleCopy}
        onLike={handleLike}
        onAddComment={handleAddComment}
        onEditComment={handleEditComment}
        onDeleteComment={handleDeleteComment}
        onEdit={handleEditPrompt}
        onDelete={handleDeletePrompt}
        isAdmin={isAdmin}
        currentUser={currentUser}
        likedPrompts={likedPrompts}
      />

      <PasswordDialog
        isOpen={passwordDialog.isOpen}
        onClose={() => setPasswordDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={passwordDialog.onConfirm}
        title={passwordDialog.title}
        description={passwordDialog.description}
      />

      <LoginDialog
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
};

export default Index;
