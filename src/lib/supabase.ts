import { createClient } from '@supabase/supabase-js'

// Supabase credentials will be automatically injected by Lovable's Supabase integration
const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types
export interface DatabaseComment {
  id: string
  prompt_id: string
  author: string
  content: string
  password?: string
  created_at: string
}

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
  created_at: string
}

// Transform functions to convert between local and database formats
export const transformPromptToDb = (prompt: any): Omit<DatabasePrompt, 'id' | 'created_at'> => ({
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
})

export const transformPromptFromDb = (dbPrompt: DatabasePrompt & { comments?: DatabaseComment[] }): any => ({
  id: dbPrompt.id,
  title: dbPrompt.title,
  role: dbPrompt.role,
  type: dbPrompt.type,
  description: dbPrompt.description,
  content: dbPrompt.content,
  result: dbPrompt.result,
  tool: dbPrompt.tool,
  author: dbPrompt.author,
  password: dbPrompt.password,
  likes: dbPrompt.likes,
  views: dbPrompt.views,
  copyCount: dbPrompt.copy_count,
  createdAt: new Date(dbPrompt.created_at),
  comments: dbPrompt.comments?.map(comment => ({
    id: comment.id,
    author: comment.author,
    content: comment.content,
    password: comment.password,
    createdAt: new Date(comment.created_at),
  })) || []
})

export const transformCommentToDb = (comment: any, promptId: string): Omit<DatabaseComment, 'id' | 'created_at'> => ({
  prompt_id: promptId,
  author: comment.author,
  content: comment.content,
  password: comment.password,
})

export const transformCommentFromDb = (dbComment: DatabaseComment): any => ({
  id: dbComment.id,
  author: dbComment.author,
  content: dbComment.content,
  password: dbComment.password,
  createdAt: new Date(dbComment.created_at),
})