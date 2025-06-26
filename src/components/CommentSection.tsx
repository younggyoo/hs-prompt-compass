
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Trash2 } from 'lucide-react';
import PasswordDialog from './PasswordDialog';

interface Comment {
  id: string;
  author: string;
  content: string;
  password?: string;
  createdAt: Date;
}

interface CommentSectionProps {
  promptId: string;
  comments: Comment[];
  onAddComment: (promptId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  onEditComment?: (promptId: string, commentId: string, content: string) => void;
  onDeleteComment?: (promptId: string, commentId: string) => void;
}

const CommentSection = ({ 
  promptId, 
  comments, 
  onAddComment, 
  onEditComment, 
  onDeleteComment 
}: CommentSectionProps) => {
  const [newComment, setNewComment] = useState('');
  const [author, setAuthor] = useState('');
  const [password, setPassword] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !author.trim() || !password.trim()) return;
    
    onAddComment(promptId, {
      author: author.trim(),
      content: newComment.trim(),
      password: password.trim(),
    });
    
    setNewComment('');
    setAuthor('');
    setPassword('');
  };

  const handleEdit = (comment: Comment) => {
    setPasswordDialog({
      isOpen: true,
      title: '댓글 수정',
      description: '댓글을 수정하려면 비밀번호를 입력해주세요.',
      onConfirm: (inputPassword) => {
        if (inputPassword === comment.password) {
          setEditingComment(comment.id);
          setEditContent(comment.content);
          setPasswordDialog(prev => ({ ...prev, isOpen: false }));
        } else {
          alert('비밀번호가 일치하지 않습니다.');
        }
      }
    });
  };

  const handleDelete = (comment: Comment) => {
    setPasswordDialog({
      isOpen: true,
      title: '댓글 삭제',
      description: '댓글을 삭제하려면 비밀번호를 입력해주세요.',
      onConfirm: (inputPassword) => {
        if (inputPassword === comment.password) {
          onDeleteComment?.(promptId, comment.id);
          setPasswordDialog(prev => ({ ...prev, isOpen: false }));
        } else {
          alert('비밀번호가 일치하지 않습니다.');
        }
      }
    });
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editingComment) {
      onEditComment?.(promptId, editingComment, editContent.trim());
      setEditingComment(null);
      setEditContent('');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 dark:text-white">💬 댓글 ({comments.length})</h3>
      
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm text-[#A50034]">{comment.author}</span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(comment)}
                  className="h-6 px-2 text-blue-600 hover:bg-blue-50"
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(comment)}
                  className="h-6 px-2 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
            {editingComment === comment.id ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveEdit}>저장</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingComment(null)}>취소</Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {comment.content}
              </p>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
              {comment.createdAt.toLocaleDateString('ko-KR')} {comment.createdAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 border-t pt-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="comment-author" className="text-sm">작성자</Label>
            <Input
              id="comment-author"
              placeholder="이름을 입력하세요"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="comment-password" className="text-sm">비밀번호</Label>
            <Input
              id="comment-password"
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="comment-content" className="text-sm">댓글 내용</Label>
          <Textarea
            id="comment-content"
            placeholder="댓글을 입력하세요..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px]"
            required
          />
        </div>
        <Button type="submit" size="sm">댓글 작성</Button>
      </form>

      <PasswordDialog
        isOpen={passwordDialog.isOpen}
        onClose={() => setPasswordDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={passwordDialog.onConfirm}
        title={passwordDialog.title}
        description={passwordDialog.description}
      />
    </div>
  );
};

export default CommentSection;
