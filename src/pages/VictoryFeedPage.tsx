import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { PageTransition, itemVariants } from "@/components/transitions/PageTransition";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useVictoryFeed } from "@/hooks/useVictoryFeed";
import { Trophy, Heart, MessageCircle, Send, PartyPopper, Star, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const REACTION_EMOJIS = ["🔥", "👏", "🎉", "💪", "❤️", "🏆"];

const EVENT_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  sale: { icon: Trophy, color: "text-rank-gold" },
  achievement: { icon: Star, color: "text-primary" },
  streak: { icon: PartyPopper, color: "text-status-success" },
  level_up: { icon: Star, color: "text-info" },
};

const VictoryFeedPage = () => {
  const { feedItems, isLoading, addReaction, addComment } = useVictoryFeed(50);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  const handleReaction = (feedItemId: string, reaction: string) => {
    addReaction.mutate({ feedItemId, salespersonId: "demo-user", reaction });
  };

  const handleComment = (feedItemId: string) => {
    const text = commentText[feedItemId]?.trim();
    if (!text) return;
    addComment.mutate({ feedItemId, salespersonId: "demo-user", content: text });
    setCommentText(prev => ({ ...prev, [feedItemId]: "" }));
  };

  return (
    <>
      <Helmet>
        <title>Feed de Vitórias | Promo Champions</title>
        <meta name="description" content="Celebre conquistas e vitórias da equipe de vendas." />
      </Helmet>
      <PageTransition>
        <div className="container max-w-2xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <motion.div variants={itemVariants}>
            <h1 className="text-page-title font-display">🏆 Feed de Vitórias</h1>
            <p className="text-sm text-muted-foreground mt-1">Celebrações e conquistas em tempo real</p>
          </motion.div>

          {isLoading ? (
            <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
          ) : !feedItems?.length ? (
            <Card className="p-8 text-center glass border-border/40">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-display font-semibold">Nenhuma vitória ainda</p>
              <p className="text-sm text-muted-foreground">As conquistas aparecerão aqui automaticamente!</p>
            </Card>
          ) : (
            <motion.div variants={itemVariants} className="space-y-4">
              {feedItems.map((item) => {
                const eventConfig = EVENT_ICONS[item.event_type] || EVENT_ICONS.sale;
                const Icon = eventConfig.icon;
                const reactions = item.feed_reactions || [];
                const comments = item.feed_comments || [];
                const isExpanded = expandedComments.has(item.id);

                return (
                  <Card key={item.id} className="glass border-border/40 overflow-hidden">
                    <div className="p-4 space-y-3">
                      {/* Header */}
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                            {item.salespeople?.name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p 
                            className="font-semibold text-sm cursor-pointer hover:text-primary transition-colors"
                            onClick={() => window.location.href = `/vendedor/${item.salesperson_id}`}
                          >
                            {item.salespeople?.name || "Vendedor"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ptBR })}
                          </p>
                        </div>
                        <div className={cn("p-2 rounded-lg bg-primary/10", eventConfig.color)}>
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>

                      {/* Content */}
                      <div>
                        <p className="font-display font-semibold">{item.title}</p>
                        {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
                        {(item.value ?? 0) > 0 && (
                          <Badge className="mt-2 text-xs bg-status-success/10 text-status-success border-status-success/30" variant="outline">
                            💰 {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.value ?? 0)}
                          </Badge>
                        )}
                      </div>

                      {/* Reactions */}
                      <div className="flex items-center gap-1 flex-wrap">
                        {REACTION_EMOJIS.map(emoji => {
                          const count = reactions.filter((r: { reaction: string }) => r.reaction === emoji).length;
                          return (
                            <Button
                              key={emoji}
                              variant="ghost"
                              size="sm"
                              className={cn("h-7 px-2 text-xs gap-1 rounded-full", count > 0 && "bg-primary/10")}
                              onClick={() => handleReaction(item.id, emoji)}
                            >
                              {emoji} {count > 0 && <span>{count}</span>}
                            </Button>
                          );
                        })}
                      </div>

                      {/* Comments toggle */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs gap-1 text-muted-foreground"
                        onClick={() => {
                          const next = new Set(expandedComments);
                          isExpanded ? next.delete(item.id) : next.add(item.id);
                          setExpandedComments(next);
                        }}
                      >
                        <MessageCircle className="h-3 w-3" />
                        {comments.length} comentário{comments.length !== 1 ? "s" : ""}
                      </Button>

                      {/* Comments section */}
                      {isExpanded && (
                        <div className="space-y-2 pt-2 border-t border-border/30 animate-in fade-in-0 slide-in-from-top-1">
                          {comments.map((comment: { id: string; content: string; salespeople?: { name: string } | null }) => (
                            <div key={comment.id} className="flex gap-2 text-xs">
                              <span className="font-semibold">{comment.salespeople?.name || "Anônimo"}</span>
                              <span className="text-muted-foreground flex-1">{comment.content}</span>
                            </div>
                          ))}
                          <div className="flex gap-2">
                            <Input
                              placeholder="Comentar..."
                              value={commentText[item.id] || ""}
                              onChange={(e) => setCommentText(prev => ({ ...prev, [item.id]: e.target.value }))}
                              onKeyDown={(e) => e.key === "Enter" && handleComment(item.id)}
                              className="h-8 text-xs"
                            />
                            <Button size="sm" className="h-8 w-8 p-0" onClick={() => handleComment(item.id)}>
                              <Send className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </motion.div>
          )}
        </div>
      </PageTransition>
    </>
  );
};

export default VictoryFeedPage;
