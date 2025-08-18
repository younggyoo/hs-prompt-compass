import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface DatabasePrompt {
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
  copy_count: number
  comments: any[]
  created_at: string
}

// 프롬프트 테이블 초기화
export const initializePromptsTable = async () => {
  const { error } = await supabase.rpc('create_prompts_table_if_not_exists')
  if (error && !error.message.includes('already exists')) {
    console.error('Error creating prompts table:', error)
  }
}

// 프롬프트 저장
export const savePrompt = async (prompt: any) => {
  const { data, error } = await supabase
    .from('prompts')
    .insert([{
      id: prompt.id,
      title: prompt.title,
      role: prompt.role,
      type: prompt.type,
      description: prompt.description,
      content: prompt.content,
      result: prompt.result,
      tool: prompt.tool,
      author: prompt.author,
      password: prompt.password,
      likes: prompt.likes,
      views: prompt.views,
      copy_count: prompt.copyCount || 0,
      comments: prompt.comments || [],
      created_at: prompt.createdAt.toISOString()
    }])
    .select()

  if (error) {
    console.error('Error saving prompt:', error)
    throw error
  }
  return data
}

// 프롬프트 업데이트
export const updatePrompt = async (prompt: any) => {
  const { data, error } = await supabase
    .from('prompts')
    .update({
      title: prompt.title,
      role: prompt.role,
      type: prompt.type,
      description: prompt.description,
      content: prompt.content,
      result: prompt.result,
      tool: prompt.tool,
      author: prompt.author,
      password: prompt.password,
      likes: prompt.likes,
      views: prompt.views,
      copy_count: prompt.copyCount || 0,
      comments: prompt.comments || []
    })
    .eq('id', prompt.id)
    .select()

  if (error) {
    console.error('Error updating prompt:', error)
    throw error
  }
  return data
}

// 프롬프트 삭제
export const deletePrompt = async (promptId: string) => {
  const { error } = await supabase
    .from('prompts')
    .delete()
    .eq('id', promptId)

  if (error) {
    console.error('Error deleting prompt:', error)
    throw error
  }
}

// 모든 프롬프트 조회
export const getAllPrompts = async () => {
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching prompts:', error)
    throw error
  }

  return data?.map((p: DatabasePrompt) => ({
    id: p.id,
    title: p.title,
    role: p.role,
    type: p.type,
    description: p.description,
    content: p.content,
    result: p.result,
    tool: p.tool,
    author: p.author,
    password: p.password,
    likes: p.likes,
    views: p.views,
    copyCount: p.copy_count,
    comments: p.comments || [],
    createdAt: new Date(p.created_at)
  })) || []
}