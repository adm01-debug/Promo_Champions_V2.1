import { useState } from "react";
import { GitBranch, Plus, Phone, Handshake, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TeamCard } from "@/components/teams/TeamCard";
import { CreateTeamDialog } from "@/components/teams/CreateTeamDialog";
import { EditTeamDialog } from "@/components/teams/EditTeamDialog";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { useTeams, useDeleteTeam, Team } from "@/hooks/useTeams";
import { Skeleton } from "@/components/ui/skeleton";

export default function Times() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);

  const { data: teams, isLoading } = useTeams();
  const deleteTeam = useDeleteTeam();

  const handleDelete = async () => {
    if (deletingTeam) {
      await deleteTeam.mutateAsync(deletingTeam.id);
      setDeletingTeam(null);
    }
  };

  // Calculate stats
  const totalTeams = teams?.length || 0;
  const activeTeams = teams?.filter((t) => t.is_active).length || 0;
  const completeTeams = teams?.filter(
    (t) => t.sdr && (t.closers?.length || 0) >= 2
  ).length || 0;
  const incompleteTeams = totalTeams - completeTeams;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl gradient-primary">
            <GitBranch className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text font-display">
              Atribuições SDR
            </h1>
            <p className="text-muted-foreground">
              Configure qual SDR atende quais Closers (1:2)
            </p>
          </div>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Atribuição
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Atribuições</p>
                <p className="text-2xl font-bold gradient-text">{totalTeams}</p>
              </div>
              <GitBranch className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ativas</p>
                <p className="text-2xl font-bold text-status-success">{activeTeams}</p>
              </div>
              <Badge variant="default" className="bg-status-success/20 text-status-success">
                Ativas
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completas</p>
                <p className="text-2xl font-bold text-primary">{completeTeams}</p>
              </div>
              <div className="flex -space-x-1">
                <Phone className="h-4 w-4 text-primary" />
                <Handshake className="h-4 w-4 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Incompletas</p>
                <p className="text-2xl font-bold text-warning">{incompleteTeams}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-warning/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teams Grid */}
      {teams && teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team, index) => (
            <div
              key={team.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TeamCard
                team={team}
                onEdit={setEditingTeam}
                onDelete={setDeletingTeam}
              />
            </div>
          ))}
        </div>
      ) : (
        <Card className="card-elevated">
          <CardContent className="p-12 text-center">
            <GitBranch className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma atribuição cadastrada</h3>
            <p className="text-muted-foreground mb-4">
              Configure qual SDR atende quais Closers (estrutura 1:2)
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Atribuição
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <CreateTeamDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <EditTeamDialog
        team={editingTeam}
        open={!!editingTeam}
        onOpenChange={(open) => !open && setEditingTeam(null)}
      />

      <DeleteConfirmDialog
        open={!!deletingTeam}
        onOpenChange={(open) => !open && setDeletingTeam(null)}
        onConfirm={handleDelete}
        title="Excluir Atribuição"
        description={`Tem certeza que deseja excluir a atribuição "${deletingTeam?.name}"? Esta ação não pode ser desfeita.`}
        isDeleting={deleteTeam.isPending}
      />
    </div>
  );
}
