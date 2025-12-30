import { FC, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Reply, 
  Edit, 
  Trash2,
  Send,
  MoreHorizontal 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt?: Date;
  likes: number;
  isLiked?: boolean;
  replies?: Comment[];
}

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onLike?: () => void;
  onReply?: (content: string) => void;
  onEdit?: (content: string) => void;
  onDelete?: () => void;
  depth?: number;
}

export const CommentItem: FC<CommentItemProps> = ({
  comment,
  currentUserId,
  onLike,
  onReply,
  onEdit,
  onDelete,
  depth = 0,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment.content);

  const isOwner = currentUserId === comment.author.id;
  const maxDepth = 3;

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply?.(replyContent);
      setReplyContent('');
      setIsReplying(false);
    }
  };

  const handleEdit = () => {
    if (editContent.trim()) {
      onEdit?.(editContent);
      setIsEditing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-3', depth > 0 && 'ml-8 mt-3')}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
        <AvatarFallback className="text-xs">
          {comment.author.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{comment.author.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(comment.createdAt, { addSuffix: true, locale: ptBR })}
              </span>
              {comment.updatedAt && (
                <Badge variant="outline" className="text-xs">editado</Badge>
              )}
            </div>

            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit size={14} className="mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    <Trash2 size={14} className="mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="min-h-[60px]"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleEdit}>Salvar</Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm">{comment.content}</p>
          )}
        </div>

        <div className="flex items-center gap-4 mt-1 ml-1">
          <button
            onClick={onLike}
            className={cn(
              'flex items-center gap-1 text-xs transition-colors',
              comment.isLiked ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <ThumbsUp size={12} className={comment.isLiked ? 'fill-current' : ''} />
            {comment.likes > 0 && comment.likes}
          </button>

          {depth < maxDepth && (
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Reply size={12} />
              Responder
            </button>
          )}
        </div>

        <AnimatePresence>
          {isReplying && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2"
            >
              <div className="flex gap-2">
                <Input
                  value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                  placeholder="Escreva uma resposta..."
                  onKeyDown={e => e.key === 'Enter' && handleReply()}
                />
                <Button size="icon" onClick={handleReply}>
                  <Send size={14} />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                currentUserId={currentUserId}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

interface CommentSectionProps {
  comments: Comment[];
  currentUserId?: string;
  onAddComment?: (content: string) => void;
  onLike?: (comment: Comment) => void;
  onReply?: (comment: Comment, content: string) => void;
  onEdit?: (comment: Comment, content: string) => void;
  onDelete?: (comment: Comment) => void;
  className?: string;
}

export const CommentSection: FC<CommentSectionProps> = ({
  comments,
  currentUserId,
  onAddComment,
  onLike,
  onReply,
  onEdit,
  onDelete,
  className,
}) => {
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment?.(newComment);
      setNewComment('');
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare size={18} />
        <h3 className="font-semibold">Comentários ({comments.length})</h3>
      </div>

      {onAddComment && (
        <div className="flex gap-2">
          <Textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Adicione um comentário..."
            className="min-h-[60px]"
          />
          <Button onClick={handleAddComment} className="shrink-0">
            <Send size={14} />
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {comments.map(comment => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUserId={currentUserId}
            onLike={() => onLike?.(comment)}
            onReply={content => onReply?.(comment, content)}
            onEdit={content => onEdit?.(comment, content)}
            onDelete={() => onDelete?.(comment)}
          />
        ))}
      </div>
    </div>
  );
};
