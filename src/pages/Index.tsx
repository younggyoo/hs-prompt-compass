import { useState, useEffect } from "react";
import PromptCard from "@/components/PromptCard";
import PromptRegistration from "@/components/PromptRegistration";
import PromptDialog from "@/components/PromptDialog";
import VisitorCounter from "@/components/VisitorCounter";
import AdminMode from "@/components/AdminMode";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  author: string;
  content: string;
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
  author: string;
  likes: number;
  views: number;
  comments: Comment[];
  createdAt: Date;
}

const Index = () => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("전체");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("likes");
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  const [prompts, setPrompts] = useState<Prompt[]>([
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
      likes: 12,
      views: 45,
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
      author: "이R&D",
      likes: 8,
      views: 32,
      comments: [],
      createdAt: new Date('2024-01-20'),
    },
    {
      id: "3",
      title: "🔍 경쟁사 분석 프롬프트", 
      role: "영업/마케팅",
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
      author: "이영업",
      likes: 15,
      views: 78,
      comments: [],
      createdAt: new Date('2024-01-25'),
    },
    {
      id: "4",
      title: "💡 아이디어 발굴 프롬프트",
      role: "기획",
      type: "아이디어",
      description: "새로운 비즈니스 아이디어나 제품 개선 방안을 도출하는 프롬프트",
      content: `주제: [아이디어가 필요한 분야]

다음 방법론을 사용하여 창의적인 아이디어를 제안해주세요:

1. 현재 상황 분석
2. 문제점 파악
3. 브레인스토밍 (최소 5개 아이디어)
4. 아이디어 평가 및 선별
5. 실행 방안 제시`,
      author: "이기획",
      likes: 23,
      views: 67,
      comments: [],
      createdAt: new Date('2024-01-30'),
    },
    {
      id: "5",
      title: "📋 체크리스트 생성 프롬프트",
      role: "품질",
      type: "작성",
      description: "업무 프로세스별 체크리스트를 체계적으로 생성하는 프롬프트",
      content: `업무: [체크리스트가 필요한 업무]

다음과 같은 구조로 체크리스트를 작성해주세요:

## 사전 준비사항
- [ ] 준비물 체크
- [ ] 관련 문서 확인

## 실행 단계
- [ ] 1단계: 
- [ ] 2단계:
- [ ] 3단계:

## 완료 후 검토
- [ ] 결과물 확인
- [ ] 품질 검증
- [ ] 후속 조치`,
      author: "이품질",
      likes: 19,
      views: 54,
      comments: [],
      createdAt: new Date('2024-02-01'),
    },
    {
      id: "6",
      title: "🌐 번역 프롬프트",
      role: "공통",
      type: "번역",
      description: "전문 용어가 포함된 문서를 정확하게 번역하는 프롬프트",
      content: `다음 텍스트를 [목표 언어]로 번역해주세요:

번역 시 주의사항:
1. 전문 용어는 정확한 의미 전달을 우선으로 합니다
2. 문맥을 고려하여 자연스럽게 번역합니다
3. 원문의 뉘앙스와 톤을 유지합니다
4. 번역이 어려운 부분은 원문과 함께 표기합니다

원문:
[여기에 번역할 텍스트 입력]`,
      author: "이공통",
      likes: 31,
      views: 89,
      comments: [],
      createdAt: new Date('2024-02-05'),
    },
    {
      id: "7",
      title: "📈 데이터 분석 프롬프트",
      role: "R&D",
      type: "분석",
      description: "복잡한 데이터를 체계적으로 분석하고 인사이트를 도출하는 프롬프트",
      content: `데이터: [분석할 데이터셋]

다음 단계에 따라 데이터를 분석해주세요:

1. 데이터 개요
   - 데이터 크기, 기간, 주요 변수

2. 기술통계 분석
   - 평균, 중앙값, 표준편차
   - 최대값, 최소값, 분포

3. 트렌드 분석
   - 시계열 패턴
   - 주요 변화점

4. 상관관계 분석
   - 변수 간 관계
   - 인과관계 추정

5. 결론 및 제언
   - 핵심 발견사항
   - 비즈니스 임플리케이션`,
      author: "이R&D",
      likes: 27,
      views: 76,
      comments: [],
      createdAt: new Date('2024-02-10'),
    },
    {
      id: "8",
      title: "🛒 구매 제안서 작성 프롬프트",
      role: "구매",
      type: "작성",
      description: "구매 제안서를 체계적으로 작성하는 프롬프트",
      content: `구매 품목: [제품/서비스명]

다음 구조로 구매 제안서를 작성해주세요:

## 구매 필요성
- 현재 상황 및 문제점
- 구매 목적 및 기대효과

## 제품/서비스 개요
- 주요 사양 및 특징
- 공급업체 정보

## 비용 분석
- 구매 비용 (단가, 총액)
- 운영 비용 (유지보수, 교육 등)
- ROI 분석

## 위험 관리
- 예상 리스크 및 대응방안
- 계약 조건 검토

## 추진 일정
- 구매 프로세스 및 일정
- 도입 계획`,
      author: "이구매",
      likes: 14,
      views: 42,
      comments: [],
      createdAt: new Date('2024-02-15'),
    },
    {
      id: "9",
      title: "🏭 생산 계획 수립 프롬프트",
      role: "생산",
      type: "작성",
      description: "효율적인 생산 계획을 수립하는 프롬프트",
      content: `제품: [생산 제품명]
기간: [계획 기간]

다음 항목을 포함하여 생산 계획을 수립해주세요:

## 수요 예측
- 시장 수요 분석
- 주문 현황 및 예상 물량

## 생산 능력 분석
- 현재 생산 능력
- 설비 가동률 및 효율성
- 인력 현황

## 생산 일정
- 월별/주별 생산 계획
- 제품별 생산 배분
- 납기 일정 관리

## 자원 계획
- 원자재 소요량 및 조달 계획
- 인력 배치 계획
- 설비 운영 계획

## 품질 관리
- 품질 기준 및 검사 계획
- 불량률 목표 설정`,
      author: "이생산",
      likes: 21,
      views: 58,
      comments: [],
      createdAt: new Date('2024-02-20'),
    },
    {
      id: "10",
      title: "🚚 공급망 최적화 프롬프트",
      role: "SCM",
      type: "분석",
      description: "공급망 효율성을 분석하고 최적화 방안을 제시하는 프롬프트",
      content: `공급망 현황: [현재 공급망 구조]

다음 관점에서 공급망을 분석하고 최적화 방안을 제시해주세요:

## 현황 분석
- 공급업체 현황 (수량, 지역, 신뢰도)
- 물류 경로 및 비용
- 재고 수준 및 회전율

## 문제점 식별
- 병목 구간 파악
- 비용 증가 요인
- 리스크 요소

## 최적화 방안
- 공급업체 다변화 전략
- 물류 경로 개선
- 재고 최적화

## 디지털화 방안
- SCM 시스템 도입
- 데이터 활용 방안
- 자동화 가능 영역

## 실행 계획
- 우선순위 및 일정
- 예상 효과 및 ROI`,
      author: "이SCM",
      likes: 18,
      views: 63,
      comments: [],
      createdAt: new Date('2024-02-25'),
    },
    {
      id: "11",
      title: "🔬 품질 개선 프롬프트",
      role: "품질",
      type: "분석",
      description: "제품 품질 문제를 분석하고 개선 방안을 도출하는 프롬프트",
      content: `품질 이슈: [구체적인 품질 문제]

다음 단계에 따라 품질 개선 방안을 도출해주세요:

## 문제 정의
- 현상 기술 (언제, 어디서, 무엇이)
- 영향도 평가 (고객, 비용, 일정)

## 원인 분석
- 5Why 분석
- 피쉬본 다이어그램
- 데이터 기반 원인 규명

## 개선 방안
- 단기 대응책 (응급 조치)
- 중장기 근본 해결책
- 예방 대책

## 실행 계획
- 개선 활동 일정
- 담당자 및 역할
- 진척 관리 방법

## 효과 검증
- 성과 지표 설정
- 모니터링 계획
- 표준화 방안`,
      author: "이품질",
      likes: 25,
      views: 71,
      comments: [],
      createdAt: new Date('2024-03-01'),
    },
    {
      id: "12",
      title: "💼 영업 전략 수립 프롬프트",
      role: "영업/마케팅",
      type: "작성",
      description: "효과적인 영업 전략을 수립하는 프롬프트",
      content: `제품/서비스: [영업 대상]
타겟 시장: [목표 시장]

다음 구조로 영업 전략을 수립해주세요:

## 시장 분석
- 시장 규모 및 성장률
- 경쟁사 현황 및 점유율
- 고객 니즈 분석

## 타겟 고객 설정
- 고객 세그먼테이션
- 페르소나 정의
- 구매 의사결정 과정

## 영업 전략
- 포지셔닝 전략
- 가격 전략
- 채널 전략

## 영업 프로세스
- 리드 생성 방법
- 영업 단계별 활동
- 클로징 전략

## 성과 관리
- KPI 설정
- 영업 목표 및 할당
- 성과 측정 방법`,
      author: "이영업",
      likes: 29,
      views: 84,
      comments: [],
      createdAt: new Date('2024-03-05'),
    },
    {
      id: "13",
      title: "📊 마케팅 캠페인 기획 프롬프트",
      role: "영업/마케팅",
      type: "아이디어",
      description: "창의적이고 효과적인 마케팅 캠페인을 기획하는 프롬프트",
      content: `제품/서비스: [마케팅 대상]
목표: [캠페인 목표]

다음 요소를 포함하여 마케팅 캠페인을 기획해주세요:

## 캠페인 개요
- 캠페인 목적 및 목표
- 타겟 오디언스
- 핵심 메시지

## 크리에이티브 컨셉
- 메인 아이디어
- 비주얼 컨셉
- 톤앤매너

## 채널 전략
- 주요 마케팅 채널
- 채널별 콘텐츠 계획
- 통합 마케팅 방안

## 실행 계획
- 캠페인 일정
- 제작물 리스트
- 예산 배分

## 성과 측정
- KPI 설정
- 측정 방법
- 성과 분석 계획`,
      author: "이영업",
      likes: 33,
      views: 92,
      comments: [],
      createdAt: new Date('2024-03-10'),
    },
    {
      id: "14",
      title: "🔧 프로세스 개선 프롬프트",
      role: "공통",
      type: "분석",
      description: "업무 프로세스를 분석하고 개선점을 도출하는 프롬프트",
      content: `프로세스명: [개선할 프로세스]

다음 단계에 따라 프로세스를 분석하고 개선하세요:

## 현재 프로세스 분석
- 프로세스 맵 작성
- 각 단계별 소요시간
- 투입 자원 및 비용

## 문제점 도출
- 비효율적인 구간 식별
- 병목 지점 파악
- 불필요한 단계 확인

## 개선 방안
- 프로세스 단순화
- 자동화 가능 영역
- 병렬 처리 방안

## 개선 효과 예측
- 시간 단축 효과
- 비용 절감 효과
- 품질 향상 효과

## 실행 계획
- 개선 우선순위
- 구현 일정
- 변화 관리 방안`,
      author: "이공통",
      likes: 22,
      views: 67,
      comments: [],
      createdAt: new Date('2024-03-15'),
    },
    {
      id: "15",
      title: "📝 교육 프로그램 설계 프롬프트",
      role: "공통",
      type: "작성",
      description: "효과적인 교육 프로그램을 설계하는 프롬프트",
      content: `교육 주제: [교육 내용]
대상: [교육 대상자]

다음 구조로 교육 프로그램을 설계해주세요:

## 교육 목표
- 학습 목표 (지식, 기술, 태도)
- 성취 기준
- 평가 방법

## 교육 내용
- 커리큘럼 구성
- 모듈별 학습 내용
- 실습/과제 계획

## 교육 방법
- 강의 방식 (대면/온라인/혼합)
- 교육 기법 및 도구
- 참여 유도 방안

## 교육 자료
- 교재 및 참고자료
- 시각 자료 (PPT, 동영상)
- 실습 도구

## 운영 계획
- 교육 일정 및 시간
- 강사 및 운영진
- 평가 및 피드백 계획`,
      author: "이공통",
      likes: 17,
      views: 49,
      comments: [],
      createdAt: new Date('2024-03-20'),
    },
    {
      id: "16",
      title: "💰 예산 계획 수립 프롬프트",
      role: "기획",
      type: "작성",
      description: "체계적인 예산 계획을 수립하는 프롬프트",
      content: `사업/프로젝트: [예산 대상]
기간: [예산 기간]

다음 항목을 포함하여 예산을 계획해주세요:

## 예산 개요
- 총 예산 규모
- 예산 편성 기준
- 주요 가정사항

## 수입 계획
- 매출 예상
- 기타 수입원
- 월별 수입 계획

## 지출 계획
- 고정비 (인건비, 임차료 등)
- 변동비 (재료비, 운영비 등)
- 투자비 (설비, 시스템 등)

## 현금흐름 분석
- 월별 현금흐름
- 자금 조달 계획
- 위험 요소 관리

## 성과 지표
- 손익분기점
- ROI/NPV 분석
- 민감도 분석`,
      author: "이기획",
      likes: 20,
      views: 55,
      comments: [],
      createdAt: new Date('2024-03-25'),
    },
    {
      id: "17",
      title: "🎯 목표 설정 및 관리 프롬프트",
      role: "공통",
      type: "작성",
      description: "SMART 기준에 따른 목표 설정과 관리 방안을 수립하는 프롬프트",
      content: `목표 영역: [목표 설정 분야]

SMART 기준에 따라 목표를 설정하고 관리 계획을 수립하세요:

## 목표 설정 (SMART)
- Specific (구체적): 명확한 목표 정의
- Measurable (측정가능): 정량적 지표
- Achievable (달성가능): 현실적 수준
- Relevant (관련성): 상위 목표와의 연계
- Time-bound (시한): 명확한 기한

## 실행 계획
- 주요 실행 과제
- 단계별 마일스톤
- 필요 자원 및 지원

## 관리 체계
- 진척 점검 주기
- 성과 측정 방법
- 보고 체계

## 위험 관리
- 예상 장애요인
- 대응 방안
- 플랜 B

## 동기 부여
- 성과 인센티브
- 중간 보상
- 팀 동기 부여 방안`,
      author: "이공통",
      likes: 24,
      views: 73,
      comments: [],
      createdAt: new Date('2024-03-30'),
    },
    {
      id: "18",
      title: "🔍 시장 조사 프롬프트",
      role: "영업/마케팅",
      type: "분석",
      description: "체계적인 시장 조사를 수행하는 프롬프트",
      content: `조사 대상 시장: [시장명]
조사 목적: [조사 목적]

다음 항목에 따라 시장 조사를 수행해주세요:

## 시장 개요
- 시장 정의 및 범위
- 시장 규모 및 성장률
- 시장 성숙도

## 고객 분석
- 타겟 고객 프로필
- 구매 행동 패턴
- 니즈 및 페인포인트

## 경쟁 환경
- 주요 경쟁사 분석
- 시장 점유율
- 경쟁 우위 요소

## 시장 트렌드
- 기술 트렌드
- 소비자 트렌드
- 규제 환경 변화

## 기회 및 위험
- 시장 기회 요인
- 위험 요소
- 진입 전략

## 조사 방법
- 1차 조사 (설문, 인터뷰)
- 2차 조사 (문헌, 통계)
- 데이터 분석 방법`,
      author: "이영업",
      likes: 26,
      views: 81,
      comments: [],
      createdAt: new Date('2024-04-05'),
    },
    {
      id: "19",
      title: "🤝 협상 전략 수립 프롬프트",
      role: "구매",
      type: "작성",
      description: "효과적인 협상 전략을 수립하는 프롬프트",
      content: `협상 대상: [협상 상대방]
협상 목표: [달성하고자 하는 목표]

다음 단계에 따라 협상 전략을 수립하세요:

## 사전 준비
- 상대방 정보 수집
- 시장 정보 파악
- 대안 시나리오 준비

## 협상 목표 설정
- 최대 목표 (Best case)
- 최소 목표 (Bottom line)
- BATNA (최적 대안) 준비

## 협상 전략
- 오프닝 전략
- 양보 계획
- 마감 전략

## 커뮤니케이션 계획
- 핵심 메시지
- 설득 논리
- 예상 반박 및 대응

## 협상 진행
- 단계별 협상 계획
- 중간 점검 포인트
- 합의 조건 정리

## 사후 관리
- 합의 내용 문서화
- 이행 점검 계획
- 관계 유지 방안`,
      author: "이구매",
      likes: 19,
      views: 62,
      comments: [],
      createdAt: new Date('2024-04-10'),
    },
    {
      id: "20",
      title: "📈 성과 평가 프롬프트",
      role: "공통",
      type: "분석",
      description: "객관적이고 공정한 성과 평가를 수행하는 프롬프트",
      content: `평가 대상: [개인/팀/프로젝트]
평가 기간: [평가 기간]

다음 구조로 성과 평가를 수행해주세요:

## 평가 기준
- 정량적 지표 (매출, 생산량 등)
- 정성적 지표 (리더십, 협업 등)
- 가중치 설정

## 목표 대비 성과
- 설정 목표 vs 실제 성과
- 달성률 계산
- 주요 성과 사례

## 강점 분석
- 우수한 성과 영역
- 성공 요인 분석
- 인정할 점

## 개선 영역
- 미흡한 성과 영역
- 원인 분석
- 개선 방안

## 종합 평가
- 전체적인 성과 수준
- 등급 부여 (S/A/B/C/D)
- 피드백 메시지

## 향후 계획
- 다음 기간 목표
- 개발 계획
- 지원 방안`,
      author: "이공통",
      likes: 21,
      views: 58,
      comments: [],
      createdAt: new Date('2024-04-15'),
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

  const addPrompt = (newPromptData: Omit<Prompt, 'id' | 'createdAt' | 'likes' | 'views' | 'comments'>) => {
    const newPrompt: Prompt = {
      ...newPromptData,
      id: Date.now().toString(),
      likes: 0,
      views: 0,
      comments: [],
      createdAt: new Date(),
    };
    setPrompts(prev => [newPrompt, ...prev]);
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

  const handleDeletePrompt = (promptId: string) => {
    if (confirm('정말로 이 프롬프트를 삭제하시겠습니까?')) {
      setPrompts(prev => prev.filter(p => p.id !== promptId));
      toast({
        title: "프롬프트가 삭제되었습니다.",
      });
    }
  };

  const roles = ["전체", "R&D", "기획", "구매", "생산", "SCM", "품질", "영업/마케팅", "공통"];

  const filteredAndSortedPrompts = prompts
    .filter(prompt => {
      const searchRegex = new RegExp(searchQuery, 'i');
      const matchesSearch = searchRegex.test(prompt.title) || searchRegex.test(prompt.description) || searchRegex.test(prompt.content);
      const matchesRole = selectedRole === "전체" || prompt.role === selectedRole;
      const matchesType = selectedType ? prompt.type === selectedType : true;
      return matchesSearch && matchesRole && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "likes":
          return b.likes - a.likes;
        case "views":
          return b.views - a.views;
        case "createdAt":
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <header className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <div></div>
          <AdminMode isAdmin={isAdmin} onAdminToggle={setIsAdmin} />
        </div>
        
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
          🏢 HS본부 프롬프트 라이브러리
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mt-2 max-w-2xl mx-auto">
          💡 업무에 바로 사용 가능한 프롬프트를 검색하고 복사하여 빠르고 쉽게 사용하세요,<br />
          ✨ 검증된 프롬프트를 찾아보고, 자신의 프롬프트도 공유해 보세요.
        </p>
        
        <VisitorCounter />
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
                </SelectContent>
              </Select>

              <Select onValueChange={value => setSelectedType(value === "all" ? null : value)}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="🏷️ 타입 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 타입</SelectItem>
                  <SelectItem value="요약">요약</SelectItem>
                  <SelectItem value="번역">번역</SelectItem>
                  <SelectItem value="작성">작성</SelectItem>
                  <SelectItem value="분석">분석</SelectItem>
                  <SelectItem value="아이디어">아이디어</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={() => setIsRegistrationOpen(true)}
              className="bg-gradient-to-r from-[#A50034] via-[#B8003D] to-[#8B002B] hover:from-[#8B002B] hover:via-[#A50034] hover:to-[#730024] text-white shadow-xl hover:shadow-2xl"
            >
              ➕ 새 프롬프트 등록
            </Button>
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
                  className="border border-gray-300 dark:border-gray-600 data-[state=on]:bg-gradient-to-r data-[state=on]:from-[#A50034] data-[state=on]:to-[#8B002B] data-[state=on]:text-white data-[state=on]:border-[#A50034] hover:bg-red-100 dark:hover:bg-red-900/20"
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
              onDelete={handleDeletePrompt}
              isAdmin={isAdmin}
            />
          ))}
        </div>

        {filteredAndSortedPrompts.length === 0 && (
          <div className="text-center mt-8">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              😔 검색 결과가 없습니다.
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              다른 검색어를 사용하거나 필터를 조정해보세요.
            </p>
          </div>
        )}
      </main>

      <PromptRegistration
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
        onSubmit={addPrompt}
      />

      <PromptDialog
        prompt={selectedPrompt}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onCopy={handleCopy}
        onLike={handleLike}
        onAddComment={handleAddComment}
      />
    </div>
  );
};

export default Index;
