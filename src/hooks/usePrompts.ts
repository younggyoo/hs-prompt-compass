import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
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
      
      // 실제 prompts 테이블에서 직접 데이터 가져오기 (password 필드 제외)
      const { data: promptsData, error: promptsError } = await supabase
        .from('prompts')
        .select('id, title, role, type, description, content, result, tool, author, likes, views, copy_count, created_at, updated_at')
        .order('created_at', { ascending: false })

      if (promptsError) throw promptsError

      // 댓글 데이터 가져오기 (password 필드 제외)
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('id, prompt_id, author, content, created_at, updated_at')
        .order('created_at', { ascending: true })

      if (commentsError) throw commentsError

      // 프롬프트와 댓글을 결합
      const promptsWithComments = promptsData.map(prompt => {
        const promptComments = commentsData.filter(comment => comment.prompt_id === prompt.id)
        return {
          id: prompt.id,
          title: prompt.title,
          role: prompt.role,
          type: prompt.type,
          description: prompt.description,
          content: prompt.content,
          result: prompt.result,
          tool: prompt.tool,
          author: prompt.author,
          password: undefined, // Never expose passwords
          likes: prompt.likes,
          views: prompt.views,
          copyCount: prompt.copy_count,
          createdAt: new Date(prompt.created_at),
          comments: promptComments.map(comment => ({
            id: comment.id,
            author: comment.author,
            content: comment.content,
            password: undefined, // Never expose passwords
            createdAt: new Date(comment.created_at)
          }))
        }
      })

      setPrompts(promptsWithComments)
    } catch (error) {
      console.error('Error loading prompts:', error)
      toast({
        title: "프롬프트 로드에 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // 프롬프트 추가
  const addPrompt = async (promptData: Omit<Prompt, 'id' | 'createdAt' | 'likes' | 'views' | 'comments' | 'copyCount'>) => {
    try {
      let hashedPassword = null
      
      // Hash password if provided using database function directly
      if (promptData.password && promptData.password.trim() !== '') {
        try {
          const { data, error } = await supabase.rpc('hash_password', {
            password_text: promptData.password
          })
          
          if (error) {
            console.error('Database password hashing error:', error)
            throw new Error(`Password hashing failed: ${error.message}`)
          }
          
          hashedPassword = data
        } catch (rpcError) {
          console.error('RPC password hashing failed:', rpcError)
          throw new Error('비밀번호 보안 처리에 실패했습니다.')
        }
      }

      const { data, error } = await supabase
        .from('prompts')
        .insert({
          title: promptData.title,
          role: promptData.role,
          type: promptData.type,
          description: promptData.description,
          content: promptData.content,
          result: promptData.result,
          tool: promptData.tool,
          author: promptData.author,
          password: hashedPassword,
          likes: 0,
          views: 0,
          copy_count: 0,
        })
        .select()
        .single()

      if (error) throw error

      const newPrompt: Prompt = {
        id: data.id,
        title: data.title,
        role: data.role,
        type: data.type,
        description: data.description,
        content: data.content,
        result: data.result,
        tool: data.tool,
        author: data.author,
        password: undefined, // Never expose password in frontend state
        likes: data.likes,
        views: data.views,
        copyCount: data.copy_count,
        comments: [],
        createdAt: new Date(data.created_at)
      }

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

  // 프롬프트 업데이트 (비밀번호 검증 필요한 경우)
  const updatePrompt = async (id: string, updates: Partial<Prompt>, password?: string) => {
    try {
      // If password is provided, use secure verification
      if (password) {
        const dbUpdates: any = {}
        if (updates.title !== undefined) dbUpdates.title = updates.title
        if (updates.role !== undefined) dbUpdates.role = updates.role
        if (updates.type !== undefined) dbUpdates.type = updates.type
        if (updates.description !== undefined) dbUpdates.description = updates.description
        if (updates.content !== undefined) dbUpdates.content = updates.content
        if (updates.result !== undefined) dbUpdates.result = updates.result
        if (updates.tool !== undefined) dbUpdates.tool = updates.tool
        if (updates.author !== undefined) dbUpdates.author = updates.author
        if (updates.likes !== undefined) dbUpdates.likes = updates.likes
        if (updates.views !== undefined) dbUpdates.views = updates.views
        if (updates.copyCount !== undefined) dbUpdates.copy_count = updates.copyCount

        const { data, error } = await supabase.functions.invoke('modify-with-password', {
          body: { 
            id, 
            password, 
            type: 'prompt', 
            operation: 'update',
            updates: dbUpdates
          }
        })
        
        if (error) {
          console.error('Secure update error:', error)
          throw new Error('Password verification failed')
        }
      } else {
        // Direct update for admin operations or password-free prompts
        const dbUpdates: any = {}
        if (updates.title !== undefined) dbUpdates.title = updates.title
        if (updates.role !== undefined) dbUpdates.role = updates.role
        if (updates.type !== undefined) dbUpdates.type = updates.type
        if (updates.description !== undefined) dbUpdates.description = updates.description
        if (updates.content !== undefined) dbUpdates.content = updates.content
        if (updates.result !== undefined) dbUpdates.result = updates.result
        if (updates.tool !== undefined) dbUpdates.tool = updates.tool
        if (updates.author !== undefined) dbUpdates.author = updates.author
        if (updates.likes !== undefined) dbUpdates.likes = updates.likes
        if (updates.views !== undefined) dbUpdates.views = updates.views
        if (updates.copyCount !== undefined) dbUpdates.copy_count = updates.copyCount

        const { error } = await supabase
          .from('prompts')
          .update(dbUpdates)
          .eq('id', id)

        if (error) throw error
      }

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

  // 프롬프트 삭제 (비밀번호 검증 필요한 경우)
  const deletePrompt = async (id: string, password?: string) => {
    try {
      // If password is provided, use secure verification
      if (password) {
        const { data, error } = await supabase.functions.invoke('modify-with-password', {
          body: { 
            id, 
            password, 
            type: 'prompt', 
            operation: 'delete'
          }
        })
        
        if (error) {
          console.error('Secure delete error:', error)
          throw new Error('Password verification failed')
        }
      } else {
        // Direct delete for admin operations or password-free prompts
        const { error } = await supabase
          .from('prompts')
          .delete()
          .eq('id', id)

        if (error) throw error
      }

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

  // 조회수 증가 (중복 방지)
  const incrementViews = async (id: string) => {
    try {
      const viewedKey = `viewed_${id}`
      const lastViewed = localStorage.getItem(viewedKey)
      const now = Date.now()
      
      // 같은 세션에서 이미 조회했다면 카운트하지 않음 (30분 이내)
      if (lastViewed && (now - parseInt(lastViewed)) < 30 * 60 * 1000) {
        return
      }

      // 직접 RPC 호출로 변경 (edge function 대신)
      const { data, error } = await supabase.rpc('increment_prompt_counter', {
        prompt_id: id,
        counter_field: 'views',
        increment_value: 1
      })

      if (error) {
        console.error('Database error:', error)
        throw error
      }

      // 조회 시간 기록
      localStorage.setItem(viewedKey, now.toString())

      // 로컬 상태 업데이트 (DB에서 반환된 새 값 사용)
      setPrompts(prev => prev.map(p => 
        p.id === id ? { ...p, views: data[0]?.new_value || p.views + 1 } : p
      ))
    } catch (error) {
      console.error('Error incrementing views:', error)
      toast({
        title: "조회수 업데이트에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  // 복사수 증가
  const incrementCopyCount = async (id: string) => {
    try {
      // 직접 RPC 호출로 변경 (edge function 대신)
      const { data, error } = await supabase.rpc('increment_prompt_counter', {
        prompt_id: id,
        counter_field: 'copy_count',
        increment_value: 1
      })

      if (error) {
        console.error('Database error:', error)
        throw error
      }

      // 로컬 상태 업데이트 (DB에서 반환된 새 값 사용)
      setPrompts(prev => prev.map(p => 
        p.id === id ? { ...p, copyCount: data[0]?.new_value || p.copyCount + 1 } : p
      ))
    } catch (error) {
      console.error('Error incrementing copy count:', error)
      toast({
        title: "복사수 업데이트에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  // 좋아요 토글 (사용자별 상태 추적)
  const toggleLike = async (id: string, isCurrentlyLiked: boolean) => {
    try {
      const likedKey = `liked_${id}`
      const hasLiked = localStorage.getItem(likedKey) === 'true'
      
      // 현재 상태와 localStorage가 다르면 동기화
      if (hasLiked !== isCurrentlyLiked) {
        isCurrentlyLiked = hasLiked
      }
      
      const increment = isCurrentlyLiked ? -1 : 1
      
      // 직접 RPC 호출로 변경 (edge function 대신)
      const { data, error } = await supabase.rpc('increment_prompt_counter', {
        prompt_id: id,
        counter_field: 'likes',
        increment_value: increment
      })

      if (error) {
        console.error('Database error:', error)
        throw error
      }

      // localStorage 상태 업데이트
      localStorage.setItem(likedKey, (!isCurrentlyLiked).toString())

      // 로컬 상태 업데이트 (DB에서 반환된 새 값 사용)
      setPrompts(prev => prev.map(p => 
        p.id === id 
          ? { ...p, likes: data[0]?.new_value || p.likes + increment }
          : p
      ))
    } catch (error) {
      console.error('Error toggling like:', error)
      toast({
        title: "좋아요 업데이트에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  // 좋아요 상태 확인 함수 추가
  const isLiked = (id: string): boolean => {
    return localStorage.getItem(`liked_${id}`) === 'true'
  }

  // 댓글 추가
  const addComment = async (promptId: string, commentData: Omit<Comment, 'id' | 'createdAt'>) => {
    try {
      let hashedPassword = null
      
      // Hash password if provided using database function directly
      if (commentData.password && commentData.password.trim() !== '') {
        try {
          const { data, error } = await supabase.rpc('hash_password', {
            password_text: commentData.password
          })
          
          if (error) {
            console.error('Database password hashing error:', error)
            throw new Error(`Password hashing failed: ${error.message}`)
          }
          
          hashedPassword = data
        } catch (rpcError) {
          console.error('RPC password hashing failed:', rpcError)
          throw new Error('비밀번호 보안 처리에 실패했습니다.')
        }
      }

      const { data, error } = await supabase
        .from('comments')
        .insert({
          prompt_id: promptId,
          author: commentData.author,
          content: commentData.content,
          password: hashedPassword,
        })
        .select()
        .single()

      if (error) throw error

      const newComment: Comment = {
        id: data.id,
        author: data.author,
        content: data.content,
        password: undefined, // Never expose password in frontend state
        createdAt: new Date(data.created_at)
      }

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

  // 댓글 수정 (비밀번호 검증 필요한 경우)
  const updateComment = async (commentId: string, content: string, password?: string) => {
    try {
      // If password is provided, use secure verification
      if (password) {
        const { data, error } = await supabase.functions.invoke('modify-with-password', {
          body: { 
            id: commentId, 
            password, 
            type: 'comment', 
            operation: 'update',
            updates: { content }
          }
        })
        
        if (error) {
          console.error('Secure comment update error:', error)
          throw new Error('Password verification failed')
        }
      } else {
        // Direct update for admin operations or password-free comments
        const { error } = await supabase
          .from('comments')
          .update({ content })
          .eq('id', commentId)

        if (error) throw error
      }

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

  // 댓글 삭제 (비밀번호 검증 필요한 경우)
  const deleteComment = async (commentId: string, password?: string) => {
    try {
      // If password is provided, use secure verification
      if (password) {
        const { data, error } = await supabase.functions.invoke('modify-with-password', {
          body: { 
            id: commentId, 
            password, 
            type: 'comment', 
            operation: 'delete'
          }
        })
        
        if (error) {
          console.error('Secure comment delete error:', error)
          throw new Error('Password verification failed')
        }
      } else {
        // Direct delete for admin operations or password-free comments
        const { error } = await supabase
          .from('comments')
          .delete()
          .eq('id', commentId)

        if (error) throw error
      }

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
    isLiked,
    addComment,
    updateComment,
    deleteComment,
    refreshPrompts: loadPrompts
  }
}