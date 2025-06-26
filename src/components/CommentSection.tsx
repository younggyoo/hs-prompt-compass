
import { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: Date;
}

interface CommentSectionProps {
  promptId: string;
  comments: Comment[];
  onAddComment: (promptId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
}

const CommentSection = ({ promptId, comments, onAddComment }: CommentSectionProps) => {
  const [newComment, setNewComment] = useState('');
  const [author, setAuthor] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !author.trim()) return;

    onAddComment(promptId, {
      author: author.trim(),
      content: newComment.trim()
    });

    setNewComment('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <MessageCircle className="w-4 h-4" />
        댓글 ({comments.length})
      </div>

      {comments.length > 0 && (
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#A50034]">{comment.author}</span>
                <span className="text-xs text-gray-500">
                  {comment.createdAt.toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          placeholder="작성자명"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="text-sm"
        />
        <div className="flex gap-2">
          <Textarea
            placeholder="댓글을 입력하세요..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px] resize-none text-sm"
          />
          <Button
            type="submit"
            size="sm"
            className="bg-gradient-to-r from-[#A50034] via-[#B8003D] to-[#8B002B] hover:from-[#8B002B] hover:via-[#A50034] hover:to-[#730024] text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;
