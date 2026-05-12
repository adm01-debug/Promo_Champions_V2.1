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
import { Trophy, Heart, MessageCircle, Send, PartyPopper, Star, ThumbsUp, ArrowRight } from "lucide-react";
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
    // In a real app, we would get the current user's ID
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
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-page-title font-display flex items-center gap-2">
                <Trophy className="h-8 w-8 text-rank-gold" />
                Feed de Vitórias
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Celebrações e conquistas em tempo real</p>
            </div>
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
                  <Card key={item.id} className="glass border-border/40 overflow-hidden group">
                    <div className="p-4 space-y-3">
                      {/* Header */}
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 border-2 border-primary/20 shadow-lg">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                            {item.salespeople?.name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p 
                            className="font-bold text-sm cursor-pointer hover:text-primary transition-colors flex items-center gap-1.5"
                            onClick={() => window.location.href = `/vendedor/${item.salesperson_id}`}
                          >
                            {item.salespeople?.name || "Vendedor"}
                            <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest px-1.5 h-4">
                              {item.salespeople?.role || "Vendedor"}
                            </Badge>
                          </p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ptBR })}
                          </p>
                        </div>
                        <div className={cn("p-2 rounded-xl bg-primary/10 border border-primary/20 shadow-inner", eventConfig.color)}>
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="pl-1">
                        <p className="font-display font-bold text-lg leading-snug">{item.title}</p>
                        {item.description && <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.description}</p>}
                        
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          {(item.value ?? 0) > 0 && (
                            <Badge className="text-[11px] font-bold bg-status-success/10 text-status-success border-status-success/30 px-3 py-1" variant="outline">
                              💰 {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.value ?? 0)}
                            </Badge>
                          )}
                          {(item.metadata as any)?.sale_id && (
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="h-6 p-0 text-[10px] font-black uppercase tracking-widest text-primary hover:no-underline flex items-center gap-1"
                              onClick={() => window.location.href = `/vendedor/${item.salesperson_id}`}
                            >
                              Ver Detalhes <ArrowRight className="h-3 w-3" />
                            </Button>
                          )}
                          {(item.metadata as any)?.battle_id && (
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="h-6 p-0 text-[10px] font-black uppercase tracking-widest text-primary hover:no-underline flex items-center gap-1"
                              onClick={() => window.location.href = `/arena`}
                            >
                              Ver Arena <ArrowRight className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Reactions */}
                      <div className="flex items-center gap-1 flex-wrap pt-2 border-t border-border/20">
                        {REACTION_EMOJIS.map(emoji => {
                          const count = reactions.filter((r: { reaction: string }) => r.reaction === emoji).length;
                          return (
                            <Button
                              key={emoji}
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "h-8 px-2.5 text-xs gap-1.5 rounded-xl transition-all duration-300", 
                                count > 0 ? "bg-primary/10 text-primary border border-primary/20 shadow-sm" : "hover:bg-muted/50 text-muted-foreground"
                              )}
                              onClick={() => handleReaction(item.id, emoji)}
                            >
                              <span className="text-sm">{emoji}</span> {count > 0 && <span className="font-bold">{count}</span>}
                            </Button>
                          );
                        })}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 ml-auto text-xs gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                          onClick={() => {
                            const next = new Set(expandedComments);
                            isExpanded ? next.delete(item.id) : next.add(item.id);
                            setExpandedComments(next);
                          }}
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span className="font-bold">{comments.length}</span>
                        </Button>
                      </div>

                      {/* Comments section */}
                      {isExpanded && (
                        <div className="space-y-3 pt-3 border-t border-border/20 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                            {comments.map((comment: { id: string; content: string; salespeople?: { name: string } | null }) => (
                              <div key={comment.id} className="flex gap-2 text-xs bg-muted/30 p-2.5 rounded-xl">
                                <span className="font-bold text-primary min-w-fit">{comment.salespeople?.name || "Anônimo"}:</span>
                                <span className="text-muted-foreground break-words">{comment.content}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 items-center bg-muted/40 p-1.5 rounded-2xl border border-border/20">
                            <Input
                              placeholder="Escreva um comentário..."
                              value={commentText[item.id] || ""}
                              onChange={(e) => setCommentText(prev => ({ ...prev, [item.id]: e.target.value }))}
                              onKeyDown={(e) => e.key === "Enter" && handleComment(item.id)}
                              className="h-9 text-xs border-none bg-transparent focus-visible:ring-0"
                            />
                            <Button 
                              size="sm" 
                              className="h-9 w-9 rounded-xl p-0 shadow-lg shadow-primary/20" 
                              onClick={() => handleComment(item.id)}
                            >
                              <Send className="h-4 w-4" />
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
