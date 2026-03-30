import { supabase } from "@/integrations/supabase/client";

export interface League {
  id: string;
  name: string;
  tier: number;
  icon: string;
  color: string;
  min_xp: number;
  xp_bonus_percent: number;
  promotion_slots: number;
  demotion_slots: number;
}

export interface LeagueMember {
  id: string;
  salesperson_id: string;
  league_id: string;
  weekly_xp: number;
  joined_at: string;
}

export const leaguesService = {
  async getLeagues(): Promise<League[]> {
    const { data, error } = await supabase
      .from("leagues")
      .select("*")
      .order("tier", { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async getLeagueMembers(leagueId: string) {
    const { data, error } = await supabase
      .from("league_members")
      .select(`
        *,
        salespeople:salesperson_id (
          id, name, avatar_url
        )
      `)
      .eq("league_id", leagueId)
      .order("weekly_xp", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getMyLeague(salespersonId: string) {
    const { data, error } = await supabase
      .from("league_members")
      .select(`
        *,
        leagues:league_id (*)
      `)
      .eq("salesperson_id", salespersonId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async joinLeague(salespersonId: string, leagueId: string) {
    const { data, error } = await supabase
      .from("league_members")
      .upsert({
        salesperson_id: salespersonId,
        league_id: leagueId,
        weekly_xp: 0,
      }, { onConflict: "salesperson_id" })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async addWeeklyXP(salespersonId: string, xp: number) {
    const member = await this.getMyLeague(salespersonId);
    if (!member) return null;

    const { data, error } = await supabase
      .from("league_members")
      .update({
        weekly_xp: member.weekly_xp + xp,
        updated_at: new Date().toISOString(),
      })
      .eq("salesperson_id", salespersonId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getLeaderboard(leagueId: string) {
    const { data, error } = await supabase
      .from("league_members")
      .select(`
        *,
        salespeople:salesperson_id (
          id, name, avatar_url
        )
      `)
      .eq("league_id", leagueId)
      .order("weekly_xp", { ascending: false })
      .limit(20);
    if (error) throw error;
    return data || [];
  },
};
