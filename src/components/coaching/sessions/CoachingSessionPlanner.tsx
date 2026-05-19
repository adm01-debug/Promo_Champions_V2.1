import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Plus, Star } from "lucide-react";
import { useCoachingSessions, type CoachingSession } from "@/hooks/coaching/useCoachingSessions";
import { useSalespeople } from "@/hooks/sales/useSalespeople";
import { SessionScheduleDialog } from "./SessionScheduleDialog";
import { SessionNotesEditor } from "./SessionNotesEditor";
import { SessionPrepCard } from "./SessionPrepCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { STATUS_LABELS, STATUS_BADGE, SKILL_LABELS, formatSessionDate, formatRelativeDate } from "./sessionPlannerHelpers";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function CoachingSessionPlanner() {
  const { data: sessions, isLoading } = useCoachingSessions();
  const { data: salespeople } = useSalespeople();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [selectedSp, setSelectedSp] = useState<{ id: string; name: string } | null>(null);
  const [editingSession, setEditingSession] = useState<CoachingSession | null>(null);
  const [previewSp, setPreviewSp] = useState<string | null>(null);

  const upcoming = (sessions ?? []).filter((s) => s.status === "scheduled");
  const past = (sessions ?? []).filter((s) => s.status !== "scheduled");

  const openSchedule = (sp: { id: string; name: string }) => {
    setSelectedSp(sp);
    setScheduleOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-semibold">Sessões 1:1</h2>
          <p className="text-muted-foreground text-sm">Planeje e acompanhe coaching individual com dados reais</p>
        </div>
        {salespeople && salespeople.length > 0 && (
          <Button onClick={() => openSchedule({ id: salespeople[0].id, name: salespeople[0].name })}>
            <Plus className="h-4 w-4 mr-1" /> Nova sessão
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Tabs defaultValue="upcoming">
            <TabsList>
              <TabsTrigger value="upcoming">Próximas ({upcoming.length})</TabsTrigger>
              <TabsTrigger value="history">Histórico ({past.length})</TabsTrigger>
              <TabsTrigger value="team">Equipe</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-3">
              {isLoading && <Skeleton className="h-32 w-full" />}
              {!isLoading && upcoming.length === 0 && (
                <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhuma sessão agendada</CardContent></Card>
              )}
              {upcoming.map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <SessionRow session={s} onPreview={setPreviewSp} onEdit={setEditingSession} />
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="history" className="space-y-3">
              {past.length === 0 && (
                <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhuma sessão no histórico</CardContent></Card>
              )}
              {past.map((s) => <SessionRow key={s.id} session={s} onPreview={setPreviewSp} onEdit={setEditingSession} />)}
            </TabsContent>

            <TabsContent value="team" className="space-y-2">
              {(salespeople ?? []).map((sp) => (
                <Card key={sp.id} variant="interactive" onClick={() => openSchedule({ id: sp.id, name: sp.name })}>
                  <CardContent className="py-3 flex items-center gap-3">
                    <Avatar className="h-10 w-10"><AvatarImage src={sp.avatar_url ?? undefined} /><AvatarFallback>{sp.name.slice(0, 2)}</AvatarFallback></Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{sp.name}</p>
                      <p className="text-xs text-muted-foreground">Clique para agendar</p>
                    </div>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        <div>
          {previewSp ? (
            <SessionPrepCard salespersonId={previewSp} />
          ) : (
            <Card>
              <CardHeader><CardTitle>Preparação inteligente</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Selecione uma sessão para ver gaps, deals e talking points gerados por IA.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {selectedSp && (
        <SessionScheduleDialog
          open={scheduleOpen}
          onOpenChange={setScheduleOpen}
          salespersonId={selectedSp.id}
          salespersonName={selectedSp.name}
        />
      )}
      {editingSession && (
        <SessionNotesEditor
          session={editingSession}
          open={!!editingSession}
          onOpenChange={(v) => !v && setEditingSession(null)}
        />
      )}
    </div>
  );
}

function SessionRow({
  session,
  onPreview,
  onEdit,
}: {
  session: CoachingSession;
  onPreview: (id: string) => void;
  onEdit: (s: CoachingSession) => void;
}) {
  return (
    <Card variant="interactive" onClick={() => onPreview(session.salesperson_id)}>
      <CardContent className="py-4 flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={session.salesperson?.avatar_url ?? undefined} />
          <AvatarFallback>{(session.salesperson?.name ?? "?").slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{session.salesperson?.name ?? "Vendedor"}</p>
          <p className="text-xs text-muted-foreground">
            {formatSessionDate(session.scheduled_at)} · {session.duration_min}min · {formatRelativeDate(session.scheduled_at)}
          </p>
          {session.focus_skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {session.focus_skills.slice(0, 3).map((s) => (
                <Badge key={s} variant="secondary" className="text-[10px] py-0 h-4">{SKILL_LABELS[s] ?? s}</Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={STATUS_BADGE[session.status]} label={STATUS_LABELS[session.status]} />
          {session.outcome_rating && (
            <span className="flex items-center gap-0.5 text-xs text-warning">
              <Star className="h-3 w-3 fill-warning" /> {session.outcome_rating}
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(session); }}>
          {session.status === "scheduled" ? "Realizar" : "Ver"}
        </Button>
      </CardContent>
    </Card>
  );
}
