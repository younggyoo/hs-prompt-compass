import { useState, useEffect } from 'react'
import { supabase, transformPromptToDb, transformPromptFromDb, transformCommentToDb, transformCommentFromDb } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export interface Comment {
  id: string
  author: string
  content: string
  password?: string
  createdAt: Date
}

export interface Prompt {
  id: string
  title: string
  role: string
  type: string
  description: string
  content: string
  result?: string
  tool?: string
  author: string
  password?: string
  likes: number
  views: number
  copyCount: number
  comments: Comment[]
  createdAt: Date
}

export const usePrompts = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // 프롬프트 목록 로드
  const loadPrompts = async () => {
    try {
      setLoading(true)
      const { data: promptsData, error: promptsError } = await supabase
        .from('prompts')
        .select('*')
        .order('created_at', { ascending: false })

      if (promptsError) throw promptsError

      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: true })

      if (commentsError) throw commentsError

      // 프롬프트와 댓글을 결합
      const promptsWithComments = promptsData.map(prompt => {
        const promptComments = commentsData.filter(comment => comment.prompt_id === prompt.id)
        return transformPromptFromDb({ ...prompt, comments: promptComments })
      })

      setPrompts(promptsWithComments)
    } catch (error) {
      console.error('Error loading prompts:', error)
      // localStorage에서 백업 데이터 로드 시도
      await migrateLocalStorageData()
    } finally {
      setLoading(false)
    }
  }

  // localStorage 데이터를 Supabase로 마이그레이션
  const migrateLocalStorageData = async () => {
    try {
      const localPrompts = localStorage.getItem('hs-prompts')
      if (!localPrompts) return

      const parsedPrompts = JSON.parse(localPrompts)
      if (!Array.isArray(parsedPrompts) || parsedPrompts.length === 0) return

      // 기존 데이터가 있는지 확인
      const { data: existingData } = await supabase
        .from('prompts')
        .select('id')
        .limit(1)

      if (existingData && existingData.length > 0) {
        // 이미 데이터가 있으면 로컬 데이터만 표시
        const promptsWithDates = parsedPrompts.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          comments: p.comments?.map((c: any) => ({
            ...c,
            createdAt: new Date(c.createdAt)
          })) || []
        }))
        setPrompts(promptsWithDates)
        return
      }

      // 프롬프트 마이그레이션
      for (const prompt of parsedPrompts) {
        const promptData = transformPromptToDb(prompt)
        const { data: insertedPrompt, error: promptError } = await supabase
          .from('prompts')
          .insert(promptData)
          .select()
          .single()

        if (promptError) {
          console.error('Error inserting prompt:', promptError)
          continue
        }

        // 댓글 마이그레이션
        if (prompt.comments && prompt.comments.length > 0) {
          const commentsData = prompt.comments.map((comment: any) => 
            transformCommentToDb(comment, insertedPrompt.id)
          )
          
          const { error: commentsError } = await supabase
            .from('comments')
            .insert(commentsData)

          if (commentsError) {
            console.error('Error inserting comments:', commentsError)
          }
        }
      }

      toast({
        title: "로컬 데이터가 성공적으로 마이그레이션되었습니다.",
      })

      // 마이그레이션 후 다시 로드
      await loadPrompts()
    } catch (error) {
      console.error('Migration error:', error)
      // 마이그레이션 실패 시 로컬 데이터 사용
      const localPrompts = localStorage.getItem('hs-prompts')
      if (localPrompts) {
        const parsedPrompts = JSON.parse(localPrompts)
        const promptsWithDates = parsedPrompts.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          comments: p.comments?.map((c: any) => ({
            ...c,
            createdAt: new Date(c.createdAt)
          })) || []
        }))
        setPrompts(promptsWithDates)
      }
    }
  }

  // 프롬프트 추가
  const addPrompt = async (promptData: Omit<Prompt, 'id' | 'createdAt' | 'likes' | 'views' | 'comments' | 'copyCount'>) => {
    try {
      const dbPromptData = transformPromptToDb({
        ...promptData,
        likes: 0,
        views: 0,
        copyCount: 0,
      })

      const { data, error } = await supabase
        .from('prompts')
        .insert(dbPromptData)
        .select()
        .single()

      if (error) throw error

      const newPrompt = transformPromptFromDb(data)
      setPrompts(prev => [newPrompt, ...prev])

      toast({
        title: "프롬프트가 등록되었습니다.",
      })

      return newPrompt
    } catch (error) {
      console.error('Error adding prompt:', error)
      toast({
        title: "프롬프트 등록에 실패했습니다.",
        variant: "destructive",
      })
      throw error
    }
  }

  // 프롬프트 업데이트
  const updatePrompt = async (id: string, updates: Partial<Prompt>) => {
    try {
      const dbUpdates = transformPromptToDb(updates)
      const { data, error } = await supabase
        .from('prompts')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setPrompts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))

      toast({
        title: "프롬프트가 수정되었습니다.",
      })
    } catch (error) {
      console.error('Error updating prompt:', error)
      toast({
        title: "프롬프트 수정에 실패했습니다.",
        variant: "destructive",
      })
      throw error
    }
  }

  // 프롬프트 삭제
  const deletePrompt = async (id: string) => {
    try {
      // 댓글 먼저 삭제
      await supabase
        .from('comments')
        .delete()
        .eq('prompt_id', id)

      // 프롬프트 삭제
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id)

      if (error) throw error

      setPrompts(prev => prev.filter(p => p.id !== id))

      toast({
        title: "프롬프트가 삭제되었습니다.",
      })
    } catch (error) {
      console.error('Error deleting prompt:', error)
      toast({
        title: "프롬프트 삭제에 실패했습니다.",
        variant: "destructive",
      })
      throw error
    }
  }

  // 조회수 증가
  const incrementViews = async (id: string) => {
    try {
      // 현재 값을 가져와서 증가시키기
      const prompt = prompts.find(p => p.id === id)
      if (!prompt) return

      const { error } = await supabase
        .from('prompts')
        .update({ views: prompt.views + 1 })
        .eq('id', id)

      if (error) throw error

      setPrompts(prev => prev.map(p => 
        p.id === id ? { ...p, views: p.views + 1 } : p
      ))
    } catch (error) {
      console.error('Error incrementing views:', error)
    }
  }

  // 복사수 증가
  const incrementCopyCount = async (id: string) => {
    try {
      // 현재 값을 가져와서 증가시키기
      const prompt = prompts.find(p => p.id === id)
      if (!prompt) return

      const { error } = await supabase
        .from('prompts')
        .update({ copy_count: prompt.copyCount + 1 })
        .eq('id', id)

      if (error) throw error

      setPrompts(prev => prev.map(p => 
        p.id === id ? { ...p, copyCount: p.copyCount + 1 } : p
      ))
    } catch (error) {
      console.error('Error incrementing copy count:', error)
    }
  }

  // 좋아요 토글
  const toggleLike = async (id: string, increment: boolean) => {
    try {
      // 현재 값을 가져와서 증가/감소시키기
      const prompt = prompts.find(p => p.id === id)
      if (!prompt) return

      const newLikes = increment ? prompt.likes + 1 : Math.max(0, prompt.likes - 1)
      const { error } = await supabase
        .from('prompts')
        .update({ likes: newLikes })
        .eq('id', id)

      if (error) throw error

      setPrompts(prev => prev.map(p => 
        p.id === id 
          ? { ...p, likes: newLikes }
          : p
      ))
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  // 댓글 추가
  const addComment = async (promptId: string, commentData: Omit<Comment, 'id' | 'createdAt'>) => {
    try {
      const dbCommentData = transformCommentToDb(commentData, promptId)
      const { data, error } = await supabase
        .from('comments')
        .insert(dbCommentData)
        .select()
        .single()

      if (error) throw error

      const newComment = transformCommentFromDb(data)
      setPrompts(prev => prev.map(p => 
        p.id === promptId 
          ? { ...p, comments: [...p.comments, newComment] }
          : p
      ))

      return newComment
    } catch (error) {
      console.error('Error adding comment:', error)
      throw error
    }
  }

  // 댓글 수정
  const updateComment = async (commentId: string, content: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ content })
        .eq('id', commentId)

      if (error) throw error

      setPrompts(prev => prev.map(p => ({
        ...p,
        comments: p.comments.map(c => 
          c.id === commentId ? { ...c, content } : c
        )
      })))
    } catch (error) {
      console.error('Error updating comment:', error)
      throw error
    }
  }

  // 댓글 삭제
  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error

      setPrompts(prev => prev.map(p => ({
        ...p,
        comments: p.comments.filter(c => c.id !== commentId)
      })))
    } catch (error) {
      console.error('Error deleting comment:', error)
      throw error
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
    incrementViews,
    incrementCopyCount,
    toggleLike,
    addComment,
    updateComment,
    deleteComment,
    refreshPrompts: loadPrompts
  }
}