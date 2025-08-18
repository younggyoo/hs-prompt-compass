import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { 
  getAllPrompts, 
  savePrompt, 
  updatePrompt as updatePromptDB, 
  deletePrompt as deletePromptDB,
  initializePromptsTable 
} from '@/lib/supabase'

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

export const usePrompts = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // 데이터베이스에서 프롬프트 로드
  const loadPrompts = async () => {
    try {
      setLoading(true)
      await initializePromptsTable()
      const data = await getAllPrompts()
      setPrompts(data)
      
      // localStorage에서 마이그레이션 (한 번만 실행)
      const migrated = localStorage.getItem('hs-migrated-to-db')
      if (!migrated && data.length === 0) {
        await migrateFromLocalStorage()
        localStorage.setItem('hs-migrated-to-db', 'true')
      }
    } catch (error) {
      console.error('Error loading prompts:', error)
      // 데이터베이스 연결 실패 시 localStorage 사용
      await loadFromLocalStorage()
    } finally {
      setLoading(false)
    }
  }

  // localStorage에서 마이그레이션
  const migrateFromLocalStorage = async () => {
    try {
      const allKeys = Object.keys(localStorage)
      const promptKeys = allKeys.filter(key => 
        key.includes('prompt') || key.includes('hs-')
      )
      
      let allPrompts: any[] = []
      
      promptKeys.forEach(key => {
        try {
          const data = localStorage.getItem(key)
          if (data) {
            const parsed = JSON.parse(data)
            if (Array.isArray(parsed)) {
              allPrompts = [...allPrompts, ...parsed]
            }
          }
        } catch (error) {
          console.error(`Error parsing ${key}:`, error)
        }
      })

      if (allPrompts.length > 0) {
        const uniquePrompts = allPrompts
          .filter((prompt, index, arr) => 
            arr.findIndex(p => p.id === prompt.id) === index
          )
          .filter((p: any) => 
            !['김기획', '이R&D', '박기획', '최생산', '김영업', '이공통', '박품질', '정공통', '한번역', '차R&D', '김프로젝트', '이구매', '박SCM', '정품질', '신안전', '강교육', '조환경', '윤법무', '장IT', '고HR'].includes(p.author) &&
            parseInt(p.id) > 20
          )

        // 데이터베이스에 저장
        for (const prompt of uniquePrompts) {
          try {
            await savePrompt({
              ...prompt,
              createdAt: new Date(prompt.createdAt)
            })
          } catch (error) {
            console.error('Error migrating prompt:', error)
          }
        }

        // 마이그레이션 후 다시 로드
        const data = await getAllPrompts()
        setPrompts(data)
        
        toast({
          title: `${uniquePrompts.length}개의 프롬프트를 데이터베이스로 마이그레이션했습니다!`,
          description: "이제 Publish된 사이트에서도 프롬프트가 유지됩니다."
        })
      }
    } catch (error) {
      console.error('Migration error:', error)
    }
  }

  // localStorage에서 로드 (fallback)
  const loadFromLocalStorage = () => {
    const allKeys = Object.keys(localStorage)
    const promptKeys = allKeys.filter(key => 
      key.includes('prompt') || key.includes('hs-')
    )
    
    let allPrompts: any[] = []
    
    promptKeys.forEach(key => {
      try {
        const data = localStorage.getItem(key)
        if (data) {
          const parsed = JSON.parse(data)
          if (Array.isArray(parsed)) {
            allPrompts = [...allPrompts, ...parsed]
          }
        }
      } catch (error) {
        console.error(`Error parsing ${key}:`, error)
      }
    })

    if (allPrompts.length > 0) {
      const uniquePrompts = allPrompts
        .filter((prompt, index, arr) => 
          arr.findIndex(p => p.id === prompt.id) === index
        )
        .filter((p: any) => 
          !['김기획', '이R&D', '박기획', '최생산', '김영업', '이공통', '박품질', '정공통', '한번역', '차R&D', '김프로젝트', '이구매', '박SCM', '정품질', '신안전', '강교육', '조환경', '윤법무', '장IT', '고HR'].includes(p.author) &&
          parseInt(p.id) > 20
        )
        .map((p: any) => ({
          ...p,
          copyCount: p.copyCount || 0,
          createdAt: new Date(p.createdAt),
          comments: p.comments?.map((c: any) => ({
            ...c,
            createdAt: new Date(c.createdAt)
          })) || []
        }))

      setPrompts(uniquePrompts)
    }
  }

  // 프롬프트 추가
  const addPrompt = async (newPromptData: Omit<Prompt, 'id' | 'createdAt' | 'likes' | 'views' | 'comments' | 'copyCount'>) => {
    try {
      const newPrompt: Prompt = {
        ...newPromptData,
        id: Date.now().toString(),
        likes: 0,
        views: 0,
        copyCount: 0,
        comments: [],
        createdAt: new Date(),
      }

      await savePrompt(newPrompt)
      setPrompts(prev => [newPrompt, ...prev])
      
      // localStorage에도 백업 저장
      localStorage.setItem('hs-prompts-backup', JSON.stringify([newPrompt, ...prompts]))
      
      toast({
        title: "프롬프트가 등록되었습니다!",
        description: "데이터베이스에 안전하게 저장되었습니다."
      })
    } catch (error) {
      console.error('Error adding prompt:', error)
      // 데이터베이스 저장 실패 시 localStorage에만 저장
      const newPrompt: Prompt = {
        ...newPromptData,
        id: Date.now().toString(),
        likes: 0,
        views: 0,
        copyCount: 0,
        comments: [],
        createdAt: new Date(),
      }
      setPrompts(prev => [newPrompt, ...prev])
      localStorage.setItem('hs-prompts-backup', JSON.stringify([newPrompt, ...prompts]))
      
      toast({
        title: "프롬프트가 등록되었습니다!",
        description: "현재 로컬에만 저장되었습니다."
      })
    }
  }

  // 프롬프트 업데이트
  const updatePrompt = async (updatedPromptData: Omit<Prompt, 'id' | 'createdAt' | 'likes' | 'views' | 'comments' | 'copyCount'>, promptId: string) => {
    try {
      const existingPrompt = prompts.find(p => p.id === promptId)
      if (!existingPrompt) return

      const updatedPrompt = { ...existingPrompt, ...updatedPromptData }
      await updatePromptDB(updatedPrompt)
      
      setPrompts(prevPrompts => 
        prevPrompts.map(prompt =>
          prompt.id === promptId 
            ? updatedPrompt
            : prompt
        )
      )
    } catch (error) {
      console.error('Error updating prompt:', error)
      // 로컬에서만 업데이트
      setPrompts(prevPrompts => 
        prevPrompts.map(prompt =>
          prompt.id === promptId 
            ? { ...prompt, ...updatedPromptData }
            : prompt
        )
      )
    }
  }

  // 프롬프트 삭제
  const deletePrompt = async (promptId: string) => {
    try {
      await deletePromptDB(promptId)
      setPrompts(prev => prev.filter(p => p.id !== promptId))
    } catch (error) {
      console.error('Error deleting prompt:', error)
      // 로컬에서만 삭제
      setPrompts(prev => prev.filter(p => p.id !== promptId))
    }
  }

  // 프롬프트 상태 업데이트 (좋아요, 조회수 등)
  const updatePromptStats = async (promptId: string, updates: Partial<Prompt>) => {
    try {
      const updatedPrompts = prompts.map(prompt =>
        prompt.id === promptId 
          ? { ...prompt, ...updates }
          : prompt
      )
      setPrompts(updatedPrompts)

      // 데이터베이스 업데이트
      const promptToUpdate = updatedPrompts.find(p => p.id === promptId)
      if (promptToUpdate) {
        await updatePromptDB(promptToUpdate)
      }
    } catch (error) {
      console.error('Error updating prompt stats:', error)
    }
  }

  useEffect(() => {
    loadPrompts()
  }, [])

  return {
    prompts,
    loading,
    addPrompt,
    updatePrompt,
    deletePrompt,
    updatePromptStats,
    loadPrompts
  }
}