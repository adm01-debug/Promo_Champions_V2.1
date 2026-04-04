import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  GitBranch, 
  Phone, 
  Handshake, 
  Edit, 
  Trash2, 
  Calendar,
  UserPlus
} from "lucide-react";
import { Team } from "@/hooks/useTeams";
import { cn } from "@/lib/utils";

interface TeamCardProps {
  team: Team;
  onEdit: (team: Team) => void;
  onDelete: (team: Team) => void;
}

const TeamCardInner = ({ team, onEdit, onDelete }: TeamCardProps) {
  const closerCount = team.closers?.length || 0;
  const hasSDR = !!team.sdr;
  const isComplete = hasSDR && closerCount >= 2;

  return (
    <Card className={cn(
      "card-elevated hover-lift transition-all duration-300",
      !team.is_active && "opacity-60"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-xl",
              isComplete ? "gradient-primary" : "bg-muted"
            )}>
              <GitBranch className={cn(
                "h-5 w-5",
                isComplete ? "text-primary-foreground" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <CardTitle className="text-lg font-display">{team.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant={team.is_active ? "default" : "secondary"}
                  className="text-xs"
                >
                  {team.is_active ? "Ativo" : "Inativo"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  {team.inactivity_days} dias
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover-scale-sm"
              onClick={() => onEdit(team)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive hover-scale-sm"
              onClick={() => onDelete(team)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* SDR Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>SDR</span>
          </div>
          {team.sdr ? (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
              <Avatar className="h-8 w-8">
                <AvatarImage src={team.sdr.avatar_url || undefined} />
                <AvatarFallback className="text-xs bg-primary/20 text-primary">
                  {team.sdr.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{team.sdr.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 rounded-lg border border-dashed border-muted-foreground/30 text-muted-foreground">
              <UserPlus className="h-4 w-4" />
              <span className="text-sm">Nenhum SDR atribuído</span>
            </div>
          )}
        </div>

        {/* Closers Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Handshake className="h-4 w-4" />
              <span>Closers Atendidos</span>
            </div>
            <Badge 
              variant={closerCount >= 2 ? "default" : "outline"} 
              className={cn(
                "text-xs",
                closerCount >= 2 && "bg-status-success/20 text-status-success border-status-success/30"
              )}
            >
              {closerCount}/2
            </Badge>
          </div>
          
          <div className="space-y-2">
            {team.closers && team.closers.length > 0 ? (
              team.closers.map((closer) => (
                <div 
                  key={closer.id} 
                  className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={closer.salesperson.avatar_url || undefined} />
                    <AvatarFallback className="text-xs bg-secondary/20 text-secondary">
                      {closer.salesperson.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{closer.salesperson.name}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-2 p-2 rounded-lg border border-dashed border-muted-foreground/30 text-muted-foreground">
                <UserPlus className="h-4 w-4" />
                <span className="text-sm">Nenhum Closer atribuído</span>
              </div>
            )}
            
            {closerCount < 2 && closerCount > 0 && (
              <div className="flex items-center gap-2 p-2 rounded-lg border border-dashed border-warning/30 text-warning">
                <UserPlus className="h-4 w-4" />
                <span className="text-sm">Falta {2 - closerCount} closer</span>
              </div>
            )}
          </div>
        </div>

        {/* Status indicator */}
        {!isComplete && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-warning flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />
              Atribuição incompleta - configure SDR e 2 Closers
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
