export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      access_denied_logs: {
        Row: {
          attempted_path: string
          created_at: string
          id: string
          ip_address: string | null
          required_role: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string
          user_role: string | null
        }
        Insert: {
          attempted_path: string
          created_at?: string
          id?: string
          ip_address?: string | null
          required_role?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id: string
          user_role?: string | null
        }
        Update: {
          attempted_path?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          required_role?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string
          user_role?: string | null
        }
        Relationships: []
      }
      account_activities: {
        Row: {
          account_id: string
          activity_type: string
          contact_id: string | null
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          occurred_at: string
          salesperson_id: string | null
          title: string
        }
        Insert: {
          account_id: string
          activity_type: string
          contact_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          occurred_at?: string
          salesperson_id?: string | null
          title: string
        }
        Update: {
          account_id?: string
          activity_type?: string
          contact_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          occurred_at?: string
          salesperson_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_activities_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "account_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_activities_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_activities_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      account_contacts: {
        Row: {
          account_id: string
          buying_role: string
          created_at: string
          department: string | null
          email: string | null
          id: string
          influence_level: number
          is_primary: boolean | null
          job_title: string | null
          last_contacted_at: string | null
          linkedin_url: string | null
          name: string
          notes: string | null
          phone: string | null
          sale_id: string | null
          seniority: string | null
          sentiment: string
          updated_at: string
        }
        Insert: {
          account_id: string
          buying_role?: string
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          influence_level?: number
          is_primary?: boolean | null
          job_title?: string | null
          last_contacted_at?: string | null
          linkedin_url?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          sale_id?: string | null
          seniority?: string | null
          sentiment?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          buying_role?: string
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          influence_level?: number
          is_primary?: boolean | null
          job_title?: string | null
          last_contacted_at?: string | null
          linkedin_url?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          sale_id?: string | null
          seniority?: string | null
          sentiment?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_contacts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_contacts_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          account_score: number
          annual_revenue: number | null
          champion_count: number | null
          country: string | null
          coverage: number | null
          created_at: string
          decision_maker_count: number | null
          domain: string | null
          employee_count: number | null
          engaged_contacts: number | null
          health_status: string
          id: string
          industry: string | null
          last_aggregated_at: string | null
          name: string
          notes: string | null
          owner_id: string | null
          parent_account_id: string | null
          size_bucket: string | null
          tier: string
          updated_at: string
          website: string | null
        }
        Insert: {
          account_score?: number
          annual_revenue?: number | null
          champion_count?: number | null
          country?: string | null
          coverage?: number | null
          created_at?: string
          decision_maker_count?: number | null
          domain?: string | null
          employee_count?: number | null
          engaged_contacts?: number | null
          health_status?: string
          id?: string
          industry?: string | null
          last_aggregated_at?: string | null
          name: string
          notes?: string | null
          owner_id?: string | null
          parent_account_id?: string | null
          size_bucket?: string | null
          tier?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          account_score?: number
          annual_revenue?: number | null
          champion_count?: number | null
          country?: string | null
          coverage?: number | null
          created_at?: string
          decision_maker_count?: number | null
          domain?: string | null
          employee_count?: number | null
          engaged_contacts?: number | null
          health_status?: string
          id?: string
          industry?: string | null
          last_aggregated_at?: string | null
          name?: string
          notes?: string | null
          owner_id?: string | null
          parent_account_id?: string | null
          size_bucket?: string | null
          tier?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      achievements: {
        Row: {
          achievement_date: string
          achievement_type: string
          created_at: string
          details: Json | null
          id: string
          salesperson_id: string
        }
        Insert: {
          achievement_date?: string
          achievement_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          salesperson_id: string
        }
        Update: {
          achievement_date?: string
          achievement_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          salesperson_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievements_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      active_power_ups: {
        Row: {
          activated_at: string
          expires_at: string
          id: string
          is_active: boolean
          multiplier: number
          power_up_type: string
          salesperson_id: string
          source: string | null
        }
        Insert: {
          activated_at?: string
          expires_at: string
          id?: string
          is_active?: boolean
          multiplier?: number
          power_up_type: string
          salesperson_id: string
          source?: string | null
        }
        Update: {
          activated_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          multiplier?: number
          power_up_type?: string
          salesperson_id?: string
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "active_power_ups_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_power_ups_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      active_sessions: {
        Row: {
          created_at: string | null
          device_info: Json | null
          expires_at: string | null
          id: string
          ip_address: string | null
          last_activity: string | null
          last_refresh_at: string | null
          max_lifetime_hours: number | null
          refresh_count: number | null
          session_token: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          last_activity?: string | null
          last_refresh_at?: string | null
          max_lifetime_hours?: number | null
          refresh_count?: number | null
          session_token?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          last_activity?: string | null
          last_refresh_at?: string | null
          max_lifetime_hours?: number | null
          refresh_count?: number | null
          session_token?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          contact_name: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          notes: string | null
          outcome: Database["public"]["Enums"]["activity_outcome"]
          sale_id: string | null
          salesperson_id: string | null
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          contact_name?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          outcome: Database["public"]["Enums"]["activity_outcome"]
          sale_id?: string | null
          salesperson_id?: string | null
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          contact_name?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          outcome?: Database["public"]["Enums"]["activity_outcome"]
          sale_id?: string | null
          salesperson_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_goals: {
        Row: {
          calls_goal: number
          created_at: string
          emails_goal: number
          id: string
          linkedin_goal: number
          meetings_goal: number
          salesperson_id: string
          updated_at: string
          whatsapp_goal: number
        }
        Insert: {
          calls_goal?: number
          created_at?: string
          emails_goal?: number
          id?: string
          linkedin_goal?: number
          meetings_goal?: number
          salesperson_id: string
          updated_at?: string
          whatsapp_goal?: number
        }
        Update: {
          calls_goal?: number
          created_at?: string
          emails_goal?: number
          id?: string
          linkedin_goal?: number
          meetings_goal?: number
          salesperson_id?: string
          updated_at?: string
          whatsapp_goal?: number
        }
        Relationships: [
          {
            foreignKeyName: "activity_goals_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: true
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_goals_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: true
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      agenda_events: {
        Row: {
          client_id: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          event_type: string
          id: string
          priority: string
          reminder_minutes_before: number | null
          sale_id: string | null
          salesperson_id: string
          scheduled_at: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          priority?: string
          reminder_minutes_before?: number | null
          sale_id?: string | null
          salesperson_id: string
          scheduled_at: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          priority?: string
          reminder_minutes_before?: number | null
          sale_id?: string | null
          salesperson_id?: string
          scheduled_at?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agenda_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_purchase_seasonality"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "agenda_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_events_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_events_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_events_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agent_actions: {
        Row: {
          executed_at: string
          executed_by: string
          id: string
          run_id: string
          status: string
          step_index: number
          tool_input: Json
          tool_name: string
          tool_output: Json | null
        }
        Insert: {
          executed_at?: string
          executed_by?: string
          id?: string
          run_id: string
          status?: string
          step_index: number
          tool_input?: Json
          tool_name: string
          tool_output?: Json | null
        }
        Update: {
          executed_at?: string
          executed_by?: string
          id?: string
          run_id?: string
          status?: string
          step_index?: number
          tool_input?: Json
          tool_name?: string
          tool_output?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_actions_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "ai_agent_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agent_runs: {
        Row: {
          agent_type: string
          approved_by: string | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          goal: string | null
          id: string
          requires_approval: boolean
          result: Json | null
          salesperson_id: string
          status: string
          steps: Json
          target_entity_id: string | null
          target_entity_type: string | null
          updated_at: string
        }
        Insert: {
          agent_type: string
          approved_by?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          goal?: string | null
          id?: string
          requires_approval?: boolean
          result?: Json | null
          salesperson_id: string
          status?: string
          steps?: Json
          target_entity_id?: string | null
          target_entity_type?: string | null
          updated_at?: string
        }
        Update: {
          agent_type?: string
          approved_by?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          goal?: string | null
          id?: string
          requires_approval?: boolean
          result?: Json | null
          salesperson_id?: string
          status?: string
          steps?: Json
          target_entity_id?: string | null
          target_entity_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      api_tokens: {
        Row: {
          company_name: string
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          is_active: boolean
          last_used_at: string | null
          team_id: string | null
          token: string
          usage_count: number
        }
        Insert: {
          company_name?: string
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          team_id?: string | null
          token: string
          usage_count?: number
        }
        Update: {
          company_name?: string
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          team_id?: string | null
          token?: string
          usage_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "api_tokens_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_decisions: {
        Row: {
          approver_id: string
          comments: string | null
          decided_at: string
          decision: string
          id: string
          level: number
          request_id: string
        }
        Insert: {
          approver_id: string
          comments?: string | null
          decided_at?: string
          decision: string
          id?: string
          level?: number
          request_id: string
        }
        Update: {
          approver_id?: string
          comments?: string | null
          decided_at?: string
          decision?: string
          id?: string
          level?: number
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_decisions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "approval_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_requests: {
        Row: {
          created_at: string
          current_level: number
          deal_id: string | null
          deal_name: string | null
          discount_percentage: number | null
          expires_at: string | null
          id: string
          justification: string | null
          original_value: number | null
          requested_value: number
          requester_id: string
          resolved_at: string | null
          status: string
          updated_at: string
          workflow_id: string
        }
        Insert: {
          created_at?: string
          current_level?: number
          deal_id?: string | null
          deal_name?: string | null
          discount_percentage?: number | null
          expires_at?: string | null
          id?: string
          justification?: string | null
          original_value?: number | null
          requested_value: number
          requester_id: string
          resolved_at?: string | null
          status?: string
          updated_at?: string
          workflow_id: string
        }
        Update: {
          created_at?: string
          current_level?: number
          deal_id?: string | null
          deal_name?: string | null
          discount_percentage?: number | null
          expires_at?: string | null
          id?: string
          justification?: string | null
          original_value?: number | null
          requested_value?: number
          requester_id?: string
          resolved_at?: string | null
          status?: string
          updated_at?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_requests_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_requests_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "approval_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_workflows: {
        Row: {
          auto_approve_below: number | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          required_approvers: number
          threshold_amount: number | null
          threshold_percentage: number | null
          updated_at: string
          workflow_type: string
        }
        Insert: {
          auto_approve_below?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          required_approvers?: number
          threshold_amount?: number | null
          threshold_percentage?: number | null
          updated_at?: string
          workflow_type?: string
        }
        Update: {
          auto_approve_below?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          required_approvers?: number
          threshold_amount?: number | null
          threshold_percentage?: number | null
          updated_at?: string
          workflow_type?: string
        }
        Relationships: []
      }
      asset_usage_logs: {
        Row: {
          action: string
          asset_id: string
          created_at: string
          deal_id: string | null
          id: string
          metadata: Json | null
          salesperson_id: string | null
          user_id: string
        }
        Insert: {
          action?: string
          asset_id: string
          created_at?: string
          deal_id?: string | null
          id?: string
          metadata?: Json | null
          salesperson_id?: string | null
          user_id: string
        }
        Update: {
          action?: string
          asset_id?: string
          created_at?: string
          deal_id?: string | null
          id?: string
          metadata?: Json | null
          salesperson_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_usage_logs_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "sales_enablement_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          changes: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
        }
        Relationships: []
      }
      automation_runs: {
        Row: {
          actions_executed: Json | null
          completed_at: string | null
          duration_ms: number | null
          error_message: string | null
          id: string
          started_at: string
          status: string
          trigger_payload: Json | null
          workflow_id: string
        }
        Insert: {
          actions_executed?: Json | null
          completed_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          started_at?: string
          status?: string
          trigger_payload?: Json | null
          workflow_id: string
        }
        Update: {
          actions_executed?: Json | null
          completed_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          started_at?: string
          status?: string
          trigger_payload?: Json | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_runs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_workflows: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          last_run_at: string | null
          name: string
          run_count: number
          trigger_config: Json
          trigger_type: string
          updated_at: string
        }
        Insert: {
          actions?: Json
          conditions?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          name: string
          run_count?: number
          trigger_config?: Json
          trigger_type: string
          updated_at?: string
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          name?: string
          run_count?: number
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      available_spins: {
        Row: {
          id: string
          salesperson_id: string
          spins_count: number
          updated_at: string
        }
        Insert: {
          id?: string
          salesperson_id: string
          spins_count?: number
          updated_at?: string
        }
        Update: {
          id?: string
          salesperson_id?: string
          spins_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "available_spins_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: true
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "available_spins_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: true
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_participants: {
        Row: {
          battle_id: string
          current_score: number
          id: string
          joined_at: string
          salesperson_id: string
          team_name: string | null
        }
        Insert: {
          battle_id: string
          current_score?: number
          id?: string
          joined_at?: string
          salesperson_id: string
          team_name?: string | null
        }
        Update: {
          battle_id?: string
          current_score?: number
          id?: string
          joined_at?: string
          salesperson_id?: string
          team_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "battle_participants_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "sales_battles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_participants_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_participants_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      bitrix24_sync_logs: {
        Row: {
          companies_from_bitrix: number | null
          companies_to_bitrix: number | null
          created_at: string
          deals_from_bitrix: number | null
          deals_to_bitrix: number | null
          duration_ms: number | null
          error_message: string | null
          id: string
          status: string
          sync_type: string
          triggered_by: string | null
        }
        Insert: {
          companies_from_bitrix?: number | null
          companies_to_bitrix?: number | null
          created_at?: string
          deals_from_bitrix?: number | null
          deals_to_bitrix?: number | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          status?: string
          sync_type?: string
          triggered_by?: string | null
        }
        Update: {
          companies_from_bitrix?: number | null
          companies_to_bitrix?: number | null
          created_at?: string
          deals_from_bitrix?: number | null
          deals_to_bitrix?: number | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          status?: string
          sync_type?: string
          triggered_by?: string | null
        }
        Relationships: []
      }
      blocked_ips: {
        Row: {
          block_count: number | null
          blocked_at: string | null
          blocked_by: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          ip_address: string
          is_permanent: boolean | null
          reason: string
          updated_at: string | null
        }
        Insert: {
          block_count?: number | null
          blocked_at?: string | null
          blocked_by?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address: string
          is_permanent?: boolean | null
          reason: string
          updated_at?: string | null
        }
        Update: {
          block_count?: number | null
          blocked_at?: string | null
          blocked_by?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string
          is_permanent?: boolean | null
          reason?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      buying_committee_members: {
        Row: {
          committee_role: string
          contact_email: string | null
          contact_name: string
          created_at: string
          created_by: string | null
          id: string
          influence_level: number
          is_single_threaded: boolean | null
          job_title: string | null
          notes: string | null
          sale_id: string
          sentiment: string
          updated_at: string
        }
        Insert: {
          committee_role?: string
          contact_email?: string | null
          contact_name: string
          created_at?: string
          created_by?: string | null
          id?: string
          influence_level?: number
          is_single_threaded?: boolean | null
          job_title?: string | null
          notes?: string | null
          sale_id: string
          sentiment?: string
          updated_at?: string
        }
        Update: {
          committee_role?: string
          contact_email?: string | null
          contact_name?: string
          created_at?: string
          created_by?: string | null
          id?: string
          influence_level?: number
          is_single_threaded?: boolean | null
          job_title?: string | null
          notes?: string | null
          sale_id?: string
          sentiment?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "buying_committee_members_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      cadence_ab_assignments: {
        Row: {
          ab_test_id: string
          assigned_at: string
          id: string
          prospect_cadence_id: string
          variant: string
        }
        Insert: {
          ab_test_id: string
          assigned_at?: string
          id?: string
          prospect_cadence_id: string
          variant: string
        }
        Update: {
          ab_test_id?: string
          assigned_at?: string
          id?: string
          prospect_cadence_id?: string
          variant?: string
        }
        Relationships: [
          {
            foreignKeyName: "cadence_ab_assignments_ab_test_id_fkey"
            columns: ["ab_test_id"]
            isOneToOne: false
            referencedRelation: "cadence_ab_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cadence_ab_assignments_prospect_cadence_id_fkey"
            columns: ["prospect_cadence_id"]
            isOneToOne: false
            referencedRelation: "prospect_cadences"
            referencedColumns: ["id"]
          },
        ]
      }
      cadence_ab_tests: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          ended_at: string | null
          hypothesis: string | null
          id: string
          name: string
          started_at: string | null
          status: string
          traffic_split: number
          updated_at: string
          variant_a_id: string
          variant_b_id: string
          winner_variant: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          ended_at?: string | null
          hypothesis?: string | null
          id?: string
          name: string
          started_at?: string | null
          status?: string
          traffic_split?: number
          updated_at?: string
          variant_a_id: string
          variant_b_id: string
          winner_variant?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          ended_at?: string | null
          hypothesis?: string | null
          id?: string
          name?: string
          started_at?: string | null
          status?: string
          traffic_split?: number
          updated_at?: string
          variant_a_id?: string
          variant_b_id?: string
          winner_variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cadence_ab_tests_variant_a_id_fkey"
            columns: ["variant_a_id"]
            isOneToOne: false
            referencedRelation: "cadences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cadence_ab_tests_variant_b_id_fkey"
            columns: ["variant_b_id"]
            isOneToOne: false
            referencedRelation: "cadences"
            referencedColumns: ["id"]
          },
        ]
      }
      cadence_enrollment_rules: {
        Row: {
          cadence_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          max_amount: number | null
          min_amount: number | null
          name: string
          priority: number
          trigger_category: string | null
          trigger_source: string | null
          trigger_stage: string | null
          updated_at: string
        }
        Insert: {
          cadence_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          max_amount?: number | null
          min_amount?: number | null
          name: string
          priority?: number
          trigger_category?: string | null
          trigger_source?: string | null
          trigger_stage?: string | null
          updated_at?: string
        }
        Update: {
          cadence_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          max_amount?: number | null
          min_amount?: number | null
          name?: string
          priority?: number
          trigger_category?: string | null
          trigger_source?: string | null
          trigger_stage?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cadence_enrollment_rules_cadence_id_fkey"
            columns: ["cadence_id"]
            isOneToOne: false
            referencedRelation: "cadences"
            referencedColumns: ["id"]
          },
        ]
      }
      cadence_steps: {
        Row: {
          action_type: string
          cadence_id: string
          created_at: string
          day_number: number
          description: string | null
          id: string
          step_order: number
          template_content: string | null
          title: string
        }
        Insert: {
          action_type: string
          cadence_id: string
          created_at?: string
          day_number?: number
          description?: string | null
          id?: string
          step_order?: number
          template_content?: string | null
          title: string
        }
        Update: {
          action_type?: string
          cadence_id?: string
          created_at?: string
          day_number?: number
          description?: string | null
          id?: string
          step_order?: number
          template_content?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "cadence_steps_cadence_id_fkey"
            columns: ["cadence_id"]
            isOneToOne: false
            referencedRelation: "cadences"
            referencedColumns: ["id"]
          },
        ]
      }
      cadence_tasks: {
        Row: {
          cadence_step_id: string
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          prospect_cadence_id: string
          scheduled_date: string
          status: string
        }
        Insert: {
          cadence_step_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          prospect_cadence_id: string
          scheduled_date: string
          status?: string
        }
        Update: {
          cadence_step_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          prospect_cadence_id?: string
          scheduled_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "cadence_tasks_cadence_step_id_fkey"
            columns: ["cadence_step_id"]
            isOneToOne: false
            referencedRelation: "cadence_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cadence_tasks_prospect_cadence_id_fkey"
            columns: ["prospect_cadence_id"]
            isOneToOne: false
            referencedRelation: "prospect_cadences"
            referencedColumns: ["id"]
          },
        ]
      }
      cadences: {
        Row: {
          cadence_type: Database["public"]["Enums"]["cadence_type"]
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          cadence_type?: Database["public"]["Enums"]["cadence_type"]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          cadence_type?: Database["public"]["Enums"]["cadence_type"]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      call_coaching_scorecards: {
        Row: {
          calculated_at: string
          factors: Json
          health: string
          id: string
          moments_score: number
          objection_score: number
          overall_score: number
          question_score: number
          recommendations: Json
          recording_id: string
          salesperson_id: string | null
          sentiment_score: number
          talk_score: number
          top_gaps: Json
          top_strengths: Json
        }
        Insert: {
          calculated_at?: string
          factors?: Json
          health?: string
          id?: string
          moments_score?: number
          objection_score?: number
          overall_score?: number
          question_score?: number
          recommendations?: Json
          recording_id: string
          salesperson_id?: string | null
          sentiment_score?: number
          talk_score?: number
          top_gaps?: Json
          top_strengths?: Json
        }
        Update: {
          calculated_at?: string
          factors?: Json
          health?: string
          id?: string
          moments_score?: number
          objection_score?: number
          overall_score?: number
          question_score?: number
          recommendations?: Json
          recording_id?: string
          salesperson_id?: string | null
          sentiment_score?: number
          talk_score?: number
          top_gaps?: Json
          top_strengths?: Json
        }
        Relationships: [
          {
            foreignKeyName: "call_coaching_scorecards_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: true
            referencedRelation: "call_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      call_conversation_metrics: {
        Row: {
          calculated_at: string
          client_talk_ratio: number
          client_words_per_minute: number
          engagement_score: number
          factors: Json
          health: string
          id: string
          interruptions_count: number
          longest_monologue_seconds: number
          pace_score: number
          recording_id: string
          seller_talk_ratio: number
          seller_words_per_minute: number
          silence_ratio: number
        }
        Insert: {
          calculated_at?: string
          client_talk_ratio?: number
          client_words_per_minute?: number
          engagement_score?: number
          factors?: Json
          health?: string
          id?: string
          interruptions_count?: number
          longest_monologue_seconds?: number
          pace_score?: number
          recording_id: string
          seller_talk_ratio?: number
          seller_words_per_minute?: number
          silence_ratio?: number
        }
        Update: {
          calculated_at?: string
          client_talk_ratio?: number
          client_words_per_minute?: number
          engagement_score?: number
          factors?: Json
          health?: string
          id?: string
          interruptions_count?: number
          longest_monologue_seconds?: number
          pace_score?: number
          recording_id?: string
          seller_talk_ratio?: number
          seller_words_per_minute?: number
          silence_ratio?: number
        }
        Relationships: [
          {
            foreignKeyName: "call_conversation_metrics_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: true
            referencedRelation: "call_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      call_critical_moments: {
        Row: {
          context: string | null
          created_at: string
          id: string
          moment_type: string
          owner_id: string
          quote: string | null
          recording_id: string
          salesperson_id: string
          severity: string
          status: string
          suggested_action: string | null
          timestamp_sec: number
          updated_at: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          id?: string
          moment_type: string
          owner_id: string
          quote?: string | null
          recording_id: string
          salesperson_id: string
          severity?: string
          status?: string
          suggested_action?: string | null
          timestamp_sec?: number
          updated_at?: string
        }
        Update: {
          context?: string | null
          created_at?: string
          id?: string
          moment_type?: string
          owner_id?: string
          quote?: string | null
          recording_id?: string
          salesperson_id?: string
          severity?: string
          status?: string
          suggested_action?: string | null
          timestamp_sec?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_critical_moments_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "call_recordings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_critical_moments_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_critical_moments_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      call_insights: {
        Row: {
          ai_model: string | null
          coaching_tips: Json | null
          created_at: string
          id: string
          key_moments: Json | null
          next_steps: Json | null
          objections: Json | null
          questions_asked: number | null
          recording_id: string
          sentiment_label: string | null
          sentiment_score: number | null
          summary: string | null
          talk_ratio_client: number | null
          talk_ratio_salesperson: number | null
          topics: Json | null
        }
        Insert: {
          ai_model?: string | null
          coaching_tips?: Json | null
          created_at?: string
          id?: string
          key_moments?: Json | null
          next_steps?: Json | null
          objections?: Json | null
          questions_asked?: number | null
          recording_id: string
          sentiment_label?: string | null
          sentiment_score?: number | null
          summary?: string | null
          talk_ratio_client?: number | null
          talk_ratio_salesperson?: number | null
          topics?: Json | null
        }
        Update: {
          ai_model?: string | null
          coaching_tips?: Json | null
          created_at?: string
          id?: string
          key_moments?: Json | null
          next_steps?: Json | null
          objections?: Json | null
          questions_asked?: number | null
          recording_id?: string
          sentiment_label?: string | null
          sentiment_score?: number | null
          summary?: string | null
          talk_ratio_client?: number | null
          talk_ratio_salesperson?: number | null
          topics?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "call_insights_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "call_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      call_logs: {
        Row: {
          call_sid: string | null
          created_at: string
          disposition: string
          duration_seconds: number | null
          id: string
          next_action_at: string | null
          notes: string | null
          outcome: string | null
          owner_id: string
          queue_item_id: string | null
          sale_id: string | null
        }
        Insert: {
          call_sid?: string | null
          created_at?: string
          disposition: string
          duration_seconds?: number | null
          id?: string
          next_action_at?: string | null
          notes?: string | null
          outcome?: string | null
          owner_id: string
          queue_item_id?: string | null
          sale_id?: string | null
        }
        Update: {
          call_sid?: string | null
          created_at?: string
          disposition?: string
          duration_seconds?: number | null
          id?: string
          next_action_at?: string | null
          notes?: string | null
          outcome?: string | null
          owner_id?: string
          queue_item_id?: string | null
          sale_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_logs_queue_item_id_fkey"
            columns: ["queue_item_id"]
            isOneToOne: false
            referencedRelation: "dialer_queue_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_logs_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      call_metric_benchmarks: {
        Row: {
          id: string
          metric: string
          p25: number
          p50: number
          p75: number
          target_max: number
          target_min: number
          updated_at: string
        }
        Insert: {
          id?: string
          metric: string
          p25?: number
          p50?: number
          p75?: number
          target_max?: number
          target_min?: number
          updated_at?: string
        }
        Update: {
          id?: string
          metric?: string
          p25?: number
          p50?: number
          p75?: number
          target_max?: number
          target_min?: number
          updated_at?: string
        }
        Relationships: []
      }
      call_objection_analysis: {
        Row: {
          avg_response_time_seconds: number
          calculated_at: string
          factors: Json
          handling_score: number
          health: string
          id: string
          partially_resolved_count: number
          recording_id: string
          resolved_count: number
          total_objections: number
          unresolved_count: number
        }
        Insert: {
          avg_response_time_seconds?: number
          calculated_at?: string
          factors?: Json
          handling_score?: number
          health?: string
          id?: string
          partially_resolved_count?: number
          recording_id: string
          resolved_count?: number
          total_objections?: number
          unresolved_count?: number
        }
        Update: {
          avg_response_time_seconds?: number
          calculated_at?: string
          factors?: Json
          handling_score?: number
          health?: string
          id?: string
          partially_resolved_count?: number
          recording_id?: string
          resolved_count?: number
          total_objections?: number
          unresolved_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "call_objection_analysis_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: true
            referencedRelation: "call_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      call_objections: {
        Row: {
          client_turn_index: number
          created_at: string
          factors: Json
          id: string
          objection_text: string
          objection_type: string
          recording_id: string
          resolution_status: string
          response_quality: string
          seller_response_text: string | null
          start_estimate: number
        }
        Insert: {
          client_turn_index?: number
          created_at?: string
          factors?: Json
          id?: string
          objection_text: string
          objection_type?: string
          recording_id: string
          resolution_status?: string
          response_quality?: string
          seller_response_text?: string | null
          start_estimate?: number
        }
        Update: {
          client_turn_index?: number
          created_at?: string
          factors?: Json
          id?: string
          objection_text?: string
          objection_type?: string
          recording_id?: string
          resolution_status?: string
          response_quality?: string
          seller_response_text?: string | null
          start_estimate?: number
        }
        Relationships: [
          {
            foreignKeyName: "call_objections_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "call_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      call_question_analysis: {
        Row: {
          avg_depth: number
          calculated_at: string
          closed_questions: number
          discovery_questions: number
          factors: Json
          health: string
          id: string
          impact_questions: number
          leading_questions: number
          open_questions: number
          quality_score: number
          question_density: number
          recording_id: string
          total_questions: number
        }
        Insert: {
          avg_depth?: number
          calculated_at?: string
          closed_questions?: number
          discovery_questions?: number
          factors?: Json
          health?: string
          id?: string
          impact_questions?: number
          leading_questions?: number
          open_questions?: number
          quality_score?: number
          question_density?: number
          recording_id: string
          total_questions?: number
        }
        Update: {
          avg_depth?: number
          calculated_at?: string
          closed_questions?: number
          discovery_questions?: number
          factors?: Json
          health?: string
          id?: string
          impact_questions?: number
          leading_questions?: number
          open_questions?: number
          quality_score?: number
          question_density?: number
          recording_id?: string
          total_questions?: number
        }
        Relationships: [
          {
            foreignKeyName: "call_question_analysis_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: true
            referencedRelation: "call_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      call_questions: {
        Row: {
          category: string
          created_at: string
          depth: number
          id: string
          recording_id: string
          start_estimate: number
          text: string
          turn_index: number
        }
        Insert: {
          category?: string
          created_at?: string
          depth?: number
          id?: string
          recording_id: string
          start_estimate?: number
          text: string
          turn_index?: number
        }
        Update: {
          category?: string
          created_at?: string
          depth?: number
          id?: string
          recording_id?: string
          start_estimate?: number
          text?: string
          turn_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "call_questions_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "call_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      call_recordings: {
        Row: {
          action_items: Json
          audio_url: string | null
          client_id: string | null
          created_at: string
          decisions: Json
          diarization: Json | null
          diarized_at: string | null
          duration_seconds: number | null
          id: string
          interruptions_count: number | null
          key_topics: string[]
          longest_monologue_sec: number | null
          metadata: Json | null
          next_steps: Json
          objections_summary: Json
          participants: Json | null
          recorded_at: string
          sale_id: string | null
          salesperson_id: string
          sentiment: string | null
          status: string
          summarized_at: string | null
          summary: string | null
          talk_ratio_client: number | null
          talk_ratio_seller: number | null
          title: string
          transcribed_at: string | null
          transcript: string | null
          transcript_language: string | null
          transcript_tsv: unknown
          transcription_error: string | null
          turns_count: number | null
          updated_at: string
        }
        Insert: {
          action_items?: Json
          audio_url?: string | null
          client_id?: string | null
          created_at?: string
          decisions?: Json
          diarization?: Json | null
          diarized_at?: string | null
          duration_seconds?: number | null
          id?: string
          interruptions_count?: number | null
          key_topics?: string[]
          longest_monologue_sec?: number | null
          metadata?: Json | null
          next_steps?: Json
          objections_summary?: Json
          participants?: Json | null
          recorded_at?: string
          sale_id?: string | null
          salesperson_id: string
          sentiment?: string | null
          status?: string
          summarized_at?: string | null
          summary?: string | null
          talk_ratio_client?: number | null
          talk_ratio_seller?: number | null
          title: string
          transcribed_at?: string | null
          transcript?: string | null
          transcript_language?: string | null
          transcript_tsv?: unknown
          transcription_error?: string | null
          turns_count?: number | null
          updated_at?: string
        }
        Update: {
          action_items?: Json
          audio_url?: string | null
          client_id?: string | null
          created_at?: string
          decisions?: Json
          diarization?: Json | null
          diarized_at?: string | null
          duration_seconds?: number | null
          id?: string
          interruptions_count?: number | null
          key_topics?: string[]
          longest_monologue_sec?: number | null
          metadata?: Json | null
          next_steps?: Json
          objections_summary?: Json
          participants?: Json | null
          recorded_at?: string
          sale_id?: string | null
          salesperson_id?: string
          sentiment?: string | null
          status?: string
          summarized_at?: string | null
          summary?: string | null
          talk_ratio_client?: number | null
          talk_ratio_seller?: number | null
          title?: string
          transcribed_at?: string | null
          transcript?: string | null
          transcript_language?: string | null
          transcript_tsv?: unknown
          transcription_error?: string | null
          turns_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_recordings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_purchase_seasonality"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "call_recordings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_recordings_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_recordings_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_recordings_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      call_sentiment_timeline: {
        Row: {
          confidence: number
          created_at: string
          end_sec: number
          excerpt: string | null
          id: string
          recording_id: string
          score: number
          segment_index: number
          sentiment: string
          speaker: string
          start_sec: number
        }
        Insert: {
          confidence?: number
          created_at?: string
          end_sec?: number
          excerpt?: string | null
          id?: string
          recording_id: string
          score?: number
          segment_index: number
          sentiment?: string
          speaker?: string
          start_sec?: number
        }
        Update: {
          confidence?: number
          created_at?: string
          end_sec?: number
          excerpt?: string | null
          id?: string
          recording_id?: string
          score?: number
          segment_index?: number
          sentiment?: string
          speaker?: string
          start_sec?: number
        }
        Relationships: [
          {
            foreignKeyName: "call_sentiment_timeline_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "call_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      call_transcripts: {
        Row: {
          created_at: string
          full_text: string
          id: string
          language: string | null
          recording_id: string
          segments: Json
          word_count: number | null
        }
        Insert: {
          created_at?: string
          full_text: string
          id?: string
          language?: string | null
          recording_id: string
          segments?: Json
          word_count?: number | null
        }
        Update: {
          created_at?: string
          full_text?: string
          id?: string
          language?: string | null
          recording_id?: string
          segments?: Json
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "call_transcripts_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "call_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      category_metrics: {
        Row: {
          category: string
          created_at: string
          date: string
          id: string
          percentage: number
        }
        Insert: {
          category: string
          created_at?: string
          date: string
          id?: string
          percentage?: number
        }
        Update: {
          category?: string
          created_at?: string
          date?: string
          id?: string
          percentage?: number
        }
        Relationships: []
      }
      challenge_progress: {
        Row: {
          challenge_id: string
          completed_at: string | null
          created_at: string
          current_value: number
          id: string
          salesperson_id: string
          updated_at: string
          xp_claimed: boolean
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          created_at?: string
          current_value?: number
          id?: string
          salesperson_id: string
          updated_at?: string
          xp_claimed?: boolean
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          created_at?: string
          current_value?: number
          id?: string
          salesperson_id?: string
          updated_at?: string
          xp_claimed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "weekly_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_progress_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_progress_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_credentials: {
        Row: {
          channel: string
          created_at: string
          credentials: Json
          enabled: boolean
          from_number: string | null
          id: string
          label: string | null
          owner_id: string
          provider: string
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          channel: string
          created_at?: string
          credentials?: Json
          enabled?: boolean
          from_number?: string | null
          id?: string
          label?: string | null
          owner_id: string
          provider: string
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          channel?: string
          created_at?: string
          credentials?: Json
          enabled?: boolean
          from_number?: string | null
          id?: string
          label?: string | null
          owner_id?: string
          provider?: string
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      channel_interactions: {
        Row: {
          channel: string
          contact_info: string | null
          contact_name: string
          created_at: string
          deal_id: string | null
          direction: string
          id: string
          message_preview: string | null
          metadata: Json | null
          salesperson_id: string
          status: string | null
          template_id: string | null
        }
        Insert: {
          channel?: string
          contact_info?: string | null
          contact_name: string
          created_at?: string
          deal_id?: string | null
          direction?: string
          id?: string
          message_preview?: string | null
          metadata?: Json | null
          salesperson_id: string
          status?: string | null
          template_id?: string | null
        }
        Update: {
          channel?: string
          contact_info?: string | null
          contact_name?: string
          created_at?: string
          deal_id?: string | null
          direction?: string
          id?: string
          message_preview?: string | null
          metadata?: Json | null
          salesperson_id?: string
          status?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "channel_interactions_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_interactions_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_interactions_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_interactions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          salesperson_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          salesperson_id: string
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          salesperson_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_conversations_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      circuit_breaker_events: {
        Row: {
          circuit_name: string
          created_at: string
          details: Json | null
          event_type: string
          failure_count: number | null
          id: string
          new_state: string | null
          previous_state: string | null
        }
        Insert: {
          circuit_name: string
          created_at?: string
          details?: Json | null
          event_type: string
          failure_count?: number | null
          id?: string
          new_state?: string | null
          previous_state?: string | null
        }
        Update: {
          circuit_name?: string
          created_at?: string
          details?: Json | null
          event_type?: string
          failure_count?: number | null
          id?: string
          new_state?: string | null
          previous_state?: string | null
        }
        Relationships: []
      }
      client_portfolio: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          client_id: string
          created_at: string
          id: string
          last_purchase_date: string | null
          salesperson_id: string
          source: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          client_id: string
          created_at?: string
          id?: string
          last_purchase_date?: string | null
          salesperson_id: string
          source?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          client_id?: string
          created_at?: string
          id?: string
          last_purchase_date?: string | null
          salesperson_id?: string
          source?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_portfolio_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_portfolio_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_portfolio_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_purchase_seasonality"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_portfolio_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_portfolio_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_portfolio_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          id: string
          lat: number | null
          lng: number | null
          name: string
          phone: string | null
          total_value: number
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          phone?: string | null
          total_value?: number
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          phone?: string | null
          total_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      coaching_actions: {
        Row: {
          accepted_at: string | null
          category: string
          created_at: string
          created_by_ai: boolean
          id: string
          manager_note: string | null
          quote: string | null
          recording_id: string
          salesperson_id: string
          severity: string
          status: string
          timestamp_sec: number | null
          tip: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          category?: string
          created_at?: string
          created_by_ai?: boolean
          id?: string
          manager_note?: string | null
          quote?: string | null
          recording_id: string
          salesperson_id: string
          severity?: string
          status?: string
          timestamp_sec?: number | null
          tip: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          category?: string
          created_at?: string
          created_by_ai?: boolean
          id?: string
          manager_note?: string | null
          quote?: string | null
          recording_id?: string
          salesperson_id?: string
          severity?: string
          status?: string
          timestamp_sec?: number | null
          tip?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaching_actions_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "call_recordings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaching_actions_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaching_actions_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      coaching_opportunities: {
        Row: {
          current_value: number
          detected_at: string
          gap_pct: number | null
          id: string
          metric_key: string
          metric_label: string
          priority: number
          recommended_action: string | null
          salesperson_id: string
          severity: string
          skill_focus: string
          team_benchmark: number
        }
        Insert: {
          current_value?: number
          detected_at?: string
          gap_pct?: number | null
          id?: string
          metric_key: string
          metric_label: string
          priority?: number
          recommended_action?: string | null
          salesperson_id: string
          severity?: string
          skill_focus: string
          team_benchmark?: number
        }
        Update: {
          current_value?: number
          detected_at?: string
          gap_pct?: number | null
          id?: string
          metric_key?: string
          metric_label?: string
          priority?: number
          recommended_action?: string | null
          salesperson_id?: string
          severity?: string
          skill_focus?: string
          team_benchmark?: number
        }
        Relationships: [
          {
            foreignKeyName: "coaching_opportunities_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaching_opportunities_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      coaching_sessions: {
        Row: {
          action_items: Json
          agenda: Json
          coach_id: string
          completed_at: string | null
          created_at: string
          duration_min: number
          focus_skills: string[]
          id: string
          notes: string | null
          outcome_rating: number | null
          salesperson_id: string
          scheduled_at: string
          status: string
          updated_at: string
        }
        Insert: {
          action_items?: Json
          agenda?: Json
          coach_id: string
          completed_at?: string | null
          created_at?: string
          duration_min?: number
          focus_skills?: string[]
          id?: string
          notes?: string | null
          outcome_rating?: number | null
          salesperson_id: string
          scheduled_at: string
          status?: string
          updated_at?: string
        }
        Update: {
          action_items?: Json
          agenda?: Json
          coach_id?: string
          completed_at?: string | null
          created_at?: string
          duration_min?: number
          focus_skills?: string[]
          id?: string
          notes?: string | null
          outcome_rating?: number | null
          salesperson_id?: string
          scheduled_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaching_sessions_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaching_sessions_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      coaching_skill_benchmarks: {
        Row: {
          computed_at: string
          id: string
          metric_key: string
          sample_size: number
          team_avg: number
          top_quartile: number
        }
        Insert: {
          computed_at?: string
          id?: string
          metric_key: string
          sample_size?: number
          team_avg?: number
          top_quartile?: number
        }
        Update: {
          computed_at?: string
          id?: string
          metric_key?: string
          sample_size?: number
          team_avg?: number
          top_quartile?: number
        }
        Relationships: []
      }
      cohort_analyses: {
        Row: {
          cohort_field: string
          config: Json
          created_at: string
          description: string | null
          id: string
          metric_field: string
          name: string
          owner_id: string
          period_type: string
          updated_at: string
        }
        Insert: {
          cohort_field?: string
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          metric_field?: string
          name: string
          owner_id: string
          period_type?: string
          updated_at?: string
        }
        Update: {
          cohort_field?: string
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          metric_field?: string
          name?: string
          owner_id?: string
          period_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      collectible_badges: {
        Row: {
          category: string
          created_at: string
          description: string | null
          icon: string
          id: string
          name: string
          rarity: string
          unlock_condition: string
          unlock_threshold: number
          xp_reward: number
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name: string
          rarity?: string
          unlock_condition: string
          unlock_threshold?: number
          xp_reward?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name?: string
          rarity?: string
          unlock_condition?: string
          unlock_threshold?: number
          xp_reward?: number
        }
        Relationships: []
      }
      combo_tracking: {
        Row: {
          actions_count: number
          combo_date: string
          created_at: string
          current_multiplier: number
          current_tier: number
          id: string
          max_tier_today: number
          salesperson_id: string
          updated_at: string
        }
        Insert: {
          actions_count?: number
          combo_date?: string
          created_at?: string
          current_multiplier?: number
          current_tier?: number
          id?: string
          max_tier_today?: number
          salesperson_id: string
          updated_at?: string
        }
        Update: {
          actions_count?: number
          combo_date?: string
          created_at?: string
          current_multiplier?: number
          current_tier?: number
          id?: string
          max_tier_today?: number
          salesperson_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "combo_tracking_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combo_tracking_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_rules: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          max_amount: number | null
          min_amount: number | null
          name: string
          percentage: number
          priority: number
          salesperson_id: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          max_amount?: number | null
          min_amount?: number | null
          name: string
          percentage?: number
          priority?: number
          salesperson_id?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          max_amount?: number | null
          min_amount?: number | null
          name?: string
          percentage?: number
          priority?: number
          salesperson_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_rules_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_rules_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          base_amount: number
          commission_amount: number
          created_at: string
          id: string
          paid_at: string | null
          paid_by: string | null
          payment_notes: string | null
          percentage: number
          rule_id: string | null
          sale_id: string
          salesperson_id: string
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          base_amount: number
          commission_amount: number
          created_at?: string
          id?: string
          paid_at?: string | null
          paid_by?: string | null
          payment_notes?: string | null
          percentage: number
          rule_id?: string | null
          sale_id: string
          salesperson_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          base_amount?: number
          commission_amount?: number
          created_at?: string
          id?: string
          paid_at?: string | null
          paid_by?: string | null
          payment_notes?: string | null
          percentage?: number
          rule_id?: string | null
          sale_id?: string
          salesperson_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "commission_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: true
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      committee_coverage_history: {
        Row: {
          coverage_score: number
          gaps: Json
          id: string
          sale_id: string
          snapshot_at: string
          stakeholder_count: number
          tier: string
        }
        Insert: {
          coverage_score?: number
          gaps?: Json
          id?: string
          sale_id: string
          snapshot_at?: string
          stakeholder_count?: number
          tier?: string
        }
        Update: {
          coverage_score?: number
          gaps?: Json
          id?: string
          sale_id?: string
          snapshot_at?: string
          stakeholder_count?: number
          tier?: string
        }
        Relationships: [
          {
            foreignKeyName: "committee_coverage_history_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      committee_extraction_runs: {
        Row: {
          confidence: number
          created_at: string
          created_count: number
          extracted_count: number
          id: string
          raw_output: Json
          recording_id: string | null
          sale_id: string | null
          updated_count: number
        }
        Insert: {
          confidence?: number
          created_at?: string
          created_count?: number
          extracted_count?: number
          id?: string
          raw_output?: Json
          recording_id?: string | null
          sale_id?: string | null
          updated_count?: number
        }
        Update: {
          confidence?: number
          created_at?: string
          created_count?: number
          extracted_count?: number
          id?: string
          raw_output?: Json
          recording_id?: string | null
          sale_id?: string | null
          updated_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "committee_extraction_runs_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "call_recordings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "committee_extraction_runs_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      competitive_chat_messages: {
        Row: {
          created_at: string
          id: string
          matchup_id: string | null
          message: string
          message_type: string
          reactions: Json | null
          salesperson_id: string
          target_salesperson_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          matchup_id?: string | null
          message: string
          message_type?: string
          reactions?: Json | null
          salesperson_id: string
          target_salesperson_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          matchup_id?: string | null
          message?: string
          message_type?: string
          reactions?: Json | null
          salesperson_id?: string
          target_salesperson_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competitive_chat_messages_matchup_id_fkey"
            columns: ["matchup_id"]
            isOneToOne: false
            referencedRelation: "weekly_matchups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitive_chat_messages_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitive_chat_messages_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitive_chat_messages_target_salesperson_id_fkey"
            columns: ["target_salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitive_chat_messages_target_salesperson_id_fkey"
            columns: ["target_salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      competitive_seasons: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          metadata: Json | null
          name: string
          season_number: number
          starts_at: string
          status: string
          xp_multiplier: number
        }
        Insert: {
          created_at?: string
          ends_at: string
          id?: string
          metadata?: Json | null
          name: string
          season_number?: number
          starts_at: string
          status?: string
          xp_multiplier?: number
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          metadata?: Json | null
          name?: string
          season_number?: number
          starts_at?: string
          status?: string
          xp_multiplier?: number
        }
        Relationships: []
      }
      competitor_mentions: {
        Row: {
          battle_card_id: string | null
          competitor_id: string | null
          competitor_name: string
          context_snippet: string | null
          created_at: string
          id: string
          recording_id: string
          timestamp_sec: number | null
        }
        Insert: {
          battle_card_id?: string | null
          competitor_id?: string | null
          competitor_name: string
          context_snippet?: string | null
          created_at?: string
          id?: string
          recording_id: string
          timestamp_sec?: number | null
        }
        Update: {
          battle_card_id?: string | null
          competitor_id?: string | null
          competitor_name?: string
          context_snippet?: string | null
          created_at?: string
          id?: string
          recording_id?: string
          timestamp_sec?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "competitor_mentions_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "competitors_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitor_mentions_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "call_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      competitors_registry: {
        Row: {
          aliases: string[]
          created_at: string
          default_battle_card_id: string | null
          id: string
          is_active: boolean
          name: string
          owner_id: string | null
          updated_at: string
        }
        Insert: {
          aliases?: string[]
          created_at?: string
          default_battle_card_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          owner_id?: string | null
          updated_at?: string
        }
        Update: {
          aliases?: string[]
          created_at?: string
          default_battle_card_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          owner_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contact_engagement_score: {
        Row: {
          contact_id: string
          contact_type: string
          decay_applied_at: string
          id: string
          last_signal_at: string | null
          score: number
          tier: string
          total_clicks: number
          total_opens: number
          total_replies: number
          updated_at: string
        }
        Insert: {
          contact_id: string
          contact_type: string
          decay_applied_at?: string
          id?: string
          last_signal_at?: string | null
          score?: number
          tier?: string
          total_clicks?: number
          total_opens?: number
          total_replies?: number
          updated_at?: string
        }
        Update: {
          contact_id?: string
          contact_type?: string
          decay_applied_at?: string
          id?: string
          last_signal_at?: string | null
          score?: number
          tier?: string
          total_clicks?: number
          total_opens?: number
          total_replies?: number
          updated_at?: string
        }
        Relationships: []
      }
      contact_send_time_profile: {
        Row: {
          clicks: number
          contact_id: string
          contact_type: string
          day_of_week: number
          hour_of_day: number
          id: string
          opens: number
          replies: number
          score: number | null
          updated_at: string
        }
        Insert: {
          clicks?: number
          contact_id: string
          contact_type: string
          day_of_week: number
          hour_of_day: number
          id?: string
          opens?: number
          replies?: number
          score?: number | null
          updated_at?: string
        }
        Update: {
          clicks?: number
          contact_id?: string
          contact_type?: string
          day_of_week?: number
          hour_of_day?: number
          id?: string
          opens?: number
          replies?: number
          score?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      conversation_analyses: {
        Row: {
          ai_model: string | null
          analyzed_by: string | null
          buying_signals: string[]
          client_id: string | null
          created_at: string
          decision_makers: string[]
          id: string
          next_steps: Json
          objections: Json
          risk_signals: string[]
          sale_id: string | null
          sentiment: string
          source: string
          summary: string | null
          transcript: string
        }
        Insert: {
          ai_model?: string | null
          analyzed_by?: string | null
          buying_signals?: string[]
          client_id?: string | null
          created_at?: string
          decision_makers?: string[]
          id?: string
          next_steps?: Json
          objections?: Json
          risk_signals?: string[]
          sale_id?: string | null
          sentiment?: string
          source: string
          summary?: string | null
          transcript: string
        }
        Update: {
          ai_model?: string | null
          analyzed_by?: string | null
          buying_signals?: string[]
          client_id?: string | null
          created_at?: string
          decision_makers?: string[]
          id?: string
          next_steps?: Json
          objections?: Json
          risk_signals?: string[]
          sale_id?: string | null
          sentiment?: string
          source?: string
          summary?: string | null
          transcript?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_analyses_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      critical_moment_notifications: {
        Row: {
          created_at: string
          delivered: boolean
          id: string
          moment_id: string
          read_at: string | null
          recipient_user_id: string
        }
        Insert: {
          created_at?: string
          delivered?: boolean
          id?: string
          moment_id: string
          read_at?: string | null
          recipient_user_id: string
        }
        Update: {
          created_at?: string
          delivered?: boolean
          id?: string
          moment_id?: string
          read_at?: string | null
          recipient_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "critical_moment_notifications_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "call_critical_moments"
            referencedColumns: ["id"]
          },
        ]
      }
      csat_ces_surveys: {
        Row: {
          account_id: string | null
          comment: string | null
          contact_email: string | null
          id: string
          metadata: Json
          responded_at: string | null
          score: number | null
          sent_at: string
          survey_type: Database["public"]["Enums"]["cs_survey_type"]
          trigger_event: string | null
        }
        Insert: {
          account_id?: string | null
          comment?: string | null
          contact_email?: string | null
          id?: string
          metadata?: Json
          responded_at?: string | null
          score?: number | null
          sent_at?: string
          survey_type?: Database["public"]["Enums"]["cs_survey_type"]
          trigger_event?: string | null
        }
        Update: {
          account_id?: string | null
          comment?: string | null
          contact_email?: string | null
          id?: string
          metadata?: Json
          responded_at?: string | null
          score?: number | null
          sent_at?: string
          survey_type?: Database["public"]["Enums"]["cs_survey_type"]
          trigger_event?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "csat_ces_surveys_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_reports: {
        Row: {
          config: Json
          created_at: string
          description: string | null
          entity: string
          id: string
          is_shared: boolean
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          description?: string | null
          entity: string
          id?: string
          is_shared?: boolean
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          description?: string | null
          entity?: string
          id?: string
          is_shared?: boolean
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_challenge_progress: {
        Row: {
          challenge_id: string
          completed_at: string | null
          created_at: string
          current_value: number
          id: string
          salesperson_id: string
          updated_at: string
          xp_claimed: boolean
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          created_at?: string
          current_value?: number
          id?: string
          salesperson_id: string
          updated_at?: string
          xp_claimed?: boolean
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          created_at?: string
          current_value?: number
          id?: string
          salesperson_id?: string
          updated_at?: string
          xp_claimed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "daily_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_challenge_progress_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_challenge_progress_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_challenges: {
        Row: {
          challenge_date: string
          challenge_type: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          target_value: number
          title: string
          updated_at: string
          xp_reward: number
        }
        Insert: {
          challenge_date?: string
          challenge_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          target_value?: number
          title: string
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          challenge_date?: string
          challenge_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          target_value?: number
          title?: string
          updated_at?: string
          xp_reward?: number
        }
        Relationships: []
      }
      daily_metrics: {
        Row: {
          avg_ticket: number
          conversion_rate: number
          created_at: string
          date: string
          id: string
          new_clients: number
          revenue: number
          revenue_goal: number
          total_sales: number
        }
        Insert: {
          avg_ticket?: number
          conversion_rate?: number
          created_at?: string
          date: string
          id?: string
          new_clients?: number
          revenue?: number
          revenue_goal?: number
          total_sales?: number
        }
        Update: {
          avg_ticket?: number
          conversion_rate?: number
          created_at?: string
          date?: string
          id?: string
          new_clients?: number
          revenue?: number
          revenue_goal?: number
          total_sales?: number
        }
        Relationships: []
      }
      daily_streak_achievements: {
        Row: {
          achieved_at: string
          created_at: string
          id: string
          salesperson_id: string
          streak_count: number
          streak_type: string
          xp_awarded: number
        }
        Insert: {
          achieved_at?: string
          created_at?: string
          id?: string
          salesperson_id: string
          streak_count: number
          streak_type: string
          xp_awarded?: number
        }
        Update: {
          achieved_at?: string
          created_at?: string
          id?: string
          salesperson_id?: string
          streak_count?: number
          streak_type?: string
          xp_awarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_streak_achievements_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_streak_achievements_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_layouts: {
        Row: {
          created_at: string
          id: string
          layout_config: Json
          salesperson_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          layout_config?: Json
          salesperson_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          layout_config?: Json
          salesperson_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_layouts_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: true
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dashboard_layouts_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: true
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_chat_history: {
        Row: {
          created_at: string
          deal_id: string
          id: string
          question: string
          question_type: string
          response: string | null
          salesperson_id: string | null
        }
        Insert: {
          created_at?: string
          deal_id: string
          id?: string
          question: string
          question_type?: string
          response?: string | null
          salesperson_id?: string | null
        }
        Update: {
          created_at?: string
          deal_id?: string
          id?: string
          question?: string
          question_type?: string
          response?: string | null
          salesperson_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_chat_history_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_chat_history_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_chat_history_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_committee_coverage: {
        Row: {
          calculated_at: string
          coverage_score: number
          created_at: string
          gaps: Json
          id: string
          owner_id: string
          risks: Json
          sale_id: string
          stakeholder_count: number
          tier: string
          updated_at: string
        }
        Insert: {
          calculated_at?: string
          coverage_score?: number
          created_at?: string
          gaps?: Json
          id?: string
          owner_id: string
          risks?: Json
          sale_id: string
          stakeholder_count?: number
          tier?: string
          updated_at?: string
        }
        Update: {
          calculated_at?: string
          coverage_score?: number
          created_at?: string
          gaps?: Json
          id?: string
          owner_id?: string
          risks?: Json
          sale_id?: string
          stakeholder_count?: number
          tier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_committee_coverage_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: true
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_health_history: {
        Row: {
          delta: number
          id: string
          owner_id: string
          sale_id: string
          score: number
          snapshot_at: string
          tier: string
        }
        Insert: {
          delta?: number
          id?: string
          owner_id: string
          sale_id: string
          score: number
          snapshot_at?: string
          tier: string
        }
        Update: {
          delta?: number
          id?: string
          owner_id?: string
          sale_id?: string
          score?: number
          snapshot_at?: string
          tier?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_health_history_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_health_scores: {
        Row: {
          ai_recommendation: string | null
          computed_at: string
          created_at: string
          days_in_stage: number | null
          factors: Json
          health_label: string
          health_score: number
          id: string
          last_activity_at: string | null
          negative_factors: Json | null
          owner_id: string | null
          positive_factors: Json | null
          recommended_actions: Json
          sale_id: string
          tier: string
          updated_at: string
        }
        Insert: {
          ai_recommendation?: string | null
          computed_at?: string
          created_at?: string
          days_in_stage?: number | null
          factors?: Json
          health_label: string
          health_score: number
          id?: string
          last_activity_at?: string | null
          negative_factors?: Json | null
          owner_id?: string | null
          positive_factors?: Json | null
          recommended_actions?: Json
          sale_id: string
          tier?: string
          updated_at?: string
        }
        Update: {
          ai_recommendation?: string | null
          computed_at?: string
          created_at?: string
          days_in_stage?: number | null
          factors?: Json
          health_label?: string
          health_score?: number
          id?: string
          last_activity_at?: string | null
          negative_factors?: Json | null
          owner_id?: string | null
          positive_factors?: Json | null
          recommended_actions?: Json
          sale_id?: string
          tier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_health_scores_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_outcomes: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          outcome: string
          reason: string
          sale_id: string | null
          salesperson_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          outcome: string
          reason: string
          sale_id?: string | null
          salesperson_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          outcome?: string
          reason?: string
          sale_id?: string | null
          salesperson_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_outcomes_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_outcomes_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_outcomes_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_probability_scores: {
        Row: {
          calculated_at: string
          calibrated_probability: number
          confidence: number
          factors: Json
          id: string
          raw_probability: number
          sale_id: string
        }
        Insert: {
          calculated_at?: string
          calibrated_probability?: number
          confidence?: number
          factors?: Json
          id?: string
          raw_probability?: number
          sale_id: string
        }
        Update: {
          calculated_at?: string
          calibrated_probability?: number
          confidence?: number
          factors?: Json
          id?: string
          raw_probability?: number
          sale_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_probability_scores_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_risk_signals: {
        Row: {
          description: string
          detected_at: string
          id: string
          metadata: Json | null
          resolved_at: string | null
          resolved_by: string | null
          sale_id: string
          severity: string
          signal_type: string
        }
        Insert: {
          description: string
          detected_at?: string
          id?: string
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          sale_id: string
          severity: string
          signal_type: string
        }
        Update: {
          description?: string
          detected_at?: string
          id?: string
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          sale_id?: string
          severity?: string
          signal_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_risk_signals_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_risk_signals_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_risk_signals_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_stage_history: {
        Row: {
          entered_at: string
          exited_at: string | null
          id: string
          sale_id: string | null
          stage: string
        }
        Insert: {
          entered_at?: string
          exited_at?: string | null
          id?: string
          sale_id?: string | null
          stage: string
        }
        Update: {
          entered_at?: string
          exited_at?: string | null
          id?: string
          sale_id?: string | null
          stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_stage_history_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_stage_transitions: {
        Row: {
          created_at: string
          duration_hours: number | null
          entered_at: string
          exited_at: string | null
          from_stage: string | null
          id: string
          sale_id: string
          to_stage: string
          transitioned_by: string | null
        }
        Insert: {
          created_at?: string
          duration_hours?: number | null
          entered_at?: string
          exited_at?: string | null
          from_stage?: string | null
          id?: string
          sale_id: string
          to_stage: string
          transitioned_by?: string | null
        }
        Update: {
          created_at?: string
          duration_hours?: number | null
          entered_at?: string
          exited_at?: string | null
          from_stage?: string | null
          id?: string
          sale_id?: string
          to_stage?: string
          transitioned_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_stage_transitions_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_stakeholders: {
        Row: {
          confidence: number | null
          created_at: string
          dmu_role: string
          email: string | null
          engagement_score: number
          evidence_quote: string | null
          id: string
          influence_level: string
          last_interaction_at: string | null
          linkedin_url: string | null
          name: string
          notes: string | null
          owner_id: string
          phone: string | null
          role_title: string | null
          sale_id: string
          sentiment: string
          signals: Json
          source: string
          updated_at: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          dmu_role?: string
          email?: string | null
          engagement_score?: number
          evidence_quote?: string | null
          id?: string
          influence_level?: string
          last_interaction_at?: string | null
          linkedin_url?: string | null
          name: string
          notes?: string | null
          owner_id: string
          phone?: string | null
          role_title?: string | null
          sale_id: string
          sentiment?: string
          signals?: Json
          source?: string
          updated_at?: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          dmu_role?: string
          email?: string | null
          engagement_score?: number
          evidence_quote?: string | null
          id?: string
          influence_level?: string
          last_interaction_at?: string | null
          linkedin_url?: string | null
          name?: string
          notes?: string | null
          owner_id?: string
          phone?: string | null
          role_title?: string | null
          sale_id?: string
          sentiment?: string
          signals?: Json
          source?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_stakeholders_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_velocity_alerts: {
        Row: {
          baseline_p75: number
          baseline_p90: number
          current_stage: string
          detected_at: string
          hours_in_stage: number
          id: string
          recommendation: string | null
          sale_id: string
          severity: string
        }
        Insert: {
          baseline_p75?: number
          baseline_p90?: number
          current_stage: string
          detected_at?: string
          hours_in_stage?: number
          id?: string
          recommendation?: string | null
          sale_id: string
          severity?: string
        }
        Update: {
          baseline_p75?: number
          baseline_p90?: number
          current_stage?: string
          detected_at?: string
          hours_in_stage?: number
          id?: string
          recommendation?: string | null
          sale_id?: string
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_velocity_alerts_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: true
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_velocity_predictions: {
        Row: {
          calculated_at: string
          confidence_score: number
          confidence_tier: string
          created_at: string
          current_stage: string | null
          days_in_stage: number | null
          expected_days_in_stage: number | null
          factors: Json
          id: string
          model_version: string
          owner_id: string | null
          predicted_close_date: string | null
          predicted_days_remaining: number | null
          sale_id: string
          stage_velocity_ratio: number | null
          updated_at: string
          velocity_status: string
        }
        Insert: {
          calculated_at?: string
          confidence_score?: number
          confidence_tier?: string
          created_at?: string
          current_stage?: string | null
          days_in_stage?: number | null
          expected_days_in_stage?: number | null
          factors?: Json
          id?: string
          model_version?: string
          owner_id?: string | null
          predicted_close_date?: string | null
          predicted_days_remaining?: number | null
          sale_id: string
          stage_velocity_ratio?: number | null
          updated_at?: string
          velocity_status?: string
        }
        Update: {
          calculated_at?: string
          confidence_score?: number
          confidence_tier?: string
          created_at?: string
          current_stage?: string | null
          days_in_stage?: number | null
          expected_days_in_stage?: number | null
          factors?: Json
          id?: string
          model_version?: string
          owner_id?: string | null
          predicted_close_date?: string | null
          predicted_days_remaining?: number | null
          sale_id?: string
          stage_velocity_ratio?: number | null
          updated_at?: string
          velocity_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_velocity_predictions_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: true
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      demand_forecasts: {
        Row: {
          confidence_score: number | null
          created_at: string
          factors: Json | null
          forecast_date: string
          id: string
          model_version: string | null
          predicted_quantity: number
          predicted_revenue: number
          product_id: string | null
          updated_at: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          factors?: Json | null
          forecast_date: string
          id?: string
          model_version?: string | null
          predicted_quantity?: number
          predicted_revenue?: number
          product_id?: string | null
          updated_at?: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          factors?: Json | null
          forecast_date?: string
          id?: string
          model_version?: string | null
          predicted_quantity?: number
          predicted_revenue?: number
          product_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "demand_forecasts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      dialer_queue_items: {
        Row: {
          added_at: string
          completed_at: string | null
          id: string
          queue_id: string
          queue_position: number
          sale_id: string
          score: number
          snooze_until: string | null
          status: string
        }
        Insert: {
          added_at?: string
          completed_at?: string | null
          id?: string
          queue_id: string
          queue_position?: number
          sale_id: string
          score?: number
          snooze_until?: string | null
          status?: string
        }
        Update: {
          added_at?: string
          completed_at?: string | null
          id?: string
          queue_id?: string
          queue_position?: number
          sale_id?: string
          score?: number
          snooze_until?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "dialer_queue_items_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "dialer_queues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialer_queue_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      dialer_queues: {
        Row: {
          created_at: string
          filter: Json
          id: string
          is_active: boolean
          last_built_at: string | null
          name: string
          owner_id: string
          priority_strategy: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          filter?: Json
          id?: string
          is_active?: boolean
          last_built_at?: string | null
          name: string
          owner_id: string
          priority_strategy?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          filter?: Json
          id?: string
          is_active?: boolean
          last_built_at?: string | null
          name?: string
          owner_id?: string
          priority_strategy?: string
          updated_at?: string
        }
        Relationships: []
      }
      digital_signatures: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          expires_at: string | null
          file_url: string | null
          id: string
          signed_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          file_url?: string | null
          id?: string
          signed_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          file_url?: string | null
          id?: string
          signed_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "digital_signatures_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_signatures_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      document_signers: {
        Row: {
          created_at: string
          document_id: string
          email: string
          id: string
          name: string
          sign_order: number | null
          signed_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          document_id: string
          email: string
          id?: string
          name: string
          sign_order?: number | null
          signed_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          document_id?: string
          email?: string
          id?: string
          name?: string
          sign_order?: number | null
          signed_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_signers_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "digital_signatures"
            referencedColumns: ["id"]
          },
        ]
      }
      email_bulk_drafts: {
        Row: {
          approved: boolean
          body: string
          client_id: string | null
          created_at: string
          error: string | null
          id: string
          job_id: string
          personalization_notes: string | null
          recipient_email: string | null
          recipient_name: string | null
          sale_id: string | null
          sent_at: string | null
          subject: string
          updated_at: string
        }
        Insert: {
          approved?: boolean
          body?: string
          client_id?: string | null
          created_at?: string
          error?: string | null
          id?: string
          job_id: string
          personalization_notes?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          sale_id?: string | null
          sent_at?: string | null
          subject?: string
          updated_at?: string
        }
        Update: {
          approved?: boolean
          body?: string
          client_id?: string | null
          created_at?: string
          error?: string | null
          id?: string
          job_id?: string
          personalization_notes?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          sale_id?: string | null
          sent_at?: string | null
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_bulk_drafts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "email_bulk_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      email_bulk_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          language: string
          owner_id: string
          prompt: string
          status: string
          target_count: number
          tone: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          language?: string
          owner_id: string
          prompt: string
          status?: string
          target_count?: number
          tone?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          language?: string
          owner_id?: string
          prompt?: string
          status?: string
          target_count?: number
          tone?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_engagement_score_history: {
        Row: {
          captured_at: string
          id: string
          sale_id: string
          score: number
          tier: string
        }
        Insert: {
          captured_at?: string
          id?: string
          sale_id: string
          score: number
          tier: string
        }
        Update: {
          captured_at?: string
          id?: string
          sale_id?: string
          score?: number
          tier?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_engagement_score_history_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      email_engagement_scores: {
        Row: {
          avg_response_minutes: number | null
          click_rate: number
          created_at: string
          id: string
          last_calculated_at: string
          open_rate: number
          recency_days: number | null
          reply_rate: number
          sale_id: string
          score: number
          tier: string
          total_clicks: number
          total_opens: number
          total_replies: number
          total_sent: number
        }
        Insert: {
          avg_response_minutes?: number | null
          click_rate?: number
          created_at?: string
          id?: string
          last_calculated_at?: string
          open_rate?: number
          recency_days?: number | null
          reply_rate?: number
          sale_id: string
          score?: number
          tier?: string
          total_clicks?: number
          total_opens?: number
          total_replies?: number
          total_sent?: number
        }
        Update: {
          avg_response_minutes?: number | null
          click_rate?: number
          created_at?: string
          id?: string
          last_calculated_at?: string
          open_rate?: number
          recency_days?: number | null
          reply_rate?: number
          sale_id?: string
          score?: number
          tier?: string
          total_clicks?: number
          total_opens?: number
          total_replies?: number
          total_sent?: number
        }
        Relationships: [
          {
            foreignKeyName: "email_engagement_scores_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: true
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          created_at: string
          error_message: string | null
          function_name: string
          id: string
          metadata: Json | null
          recipient_email: string
          status: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          function_name: string
          id?: string
          metadata?: Json | null
          recipient_email: string
          status?: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          function_name?: string
          id?: string
          metadata?: Json | null
          recipient_email?: string
          status?: string
          subject?: string | null
        }
        Relationships: []
      }
      email_tracking_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          recipient_email: string
          sale_id: string | null
          salesperson_id: string | null
          subject: string
          tracked_at: string
        }
        Insert: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          recipient_email: string
          sale_id?: string | null
          salesperson_id?: string | null
          subject: string
          tracked_at?: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          recipient_email?: string
          sale_id?: string | null
          salesperson_id?: string | null
          subject?: string
          tracked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_tracking_events_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_tracking_events_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_tracking_events_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      embedded_report_tokens: {
        Row: {
          allowed_domains: string[] | null
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          is_active: boolean
          last_viewed_at: string | null
          public_token: string
          report_id: string
          view_count: number
        }
        Insert: {
          allowed_domains?: string[] | null
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_viewed_at?: string | null
          public_token?: string
          report_id: string
          view_count?: number
        }
        Update: {
          allowed_domains?: string[] | null
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_viewed_at?: string | null
          public_token?: string
          report_id?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "embedded_report_tokens_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "custom_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      engagement_score_history: {
        Row: {
          captured_at: string
          contact_id: string
          contact_type: string
          created_at: string
          id: string
          score: number
          tier: string
        }
        Insert: {
          captured_at?: string
          contact_id: string
          contact_type: string
          created_at?: string
          id?: string
          score: number
          tier: string
        }
        Update: {
          captured_at?: string
          contact_id?: string
          contact_type?: string
          created_at?: string
          id?: string
          score?: number
          tier?: string
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          category: string
          component: string | null
          created_at: string
          id: string
          message: string
          metadata: Json | null
          severity: string
          stack_trace: string | null
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          category?: string
          component?: string | null
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          severity?: string
          stack_trace?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          component?: string | null
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          severity?: string
          stack_trace?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      executive_briefings: {
        Row: {
          briefing_date: string
          created_at: string
          created_by: string | null
          generated_by: string
          headline: string
          id: string
          key_risks: Json
          key_wins: Json
          narrative: string
          pulse_score: number
          recommended_actions: Json
        }
        Insert: {
          briefing_date?: string
          created_at?: string
          created_by?: string | null
          generated_by?: string
          headline: string
          id?: string
          key_risks?: Json
          key_wins?: Json
          narrative?: string
          pulse_score?: number
          recommended_actions?: Json
        }
        Update: {
          briefing_date?: string
          created_at?: string
          created_by?: string | null
          generated_by?: string
          headline?: string
          id?: string
          key_risks?: Json
          key_wins?: Json
          narrative?: string
          pulse_score?: number
          recommended_actions?: Json
        }
        Relationships: []
      }
      expansion_opportunities: {
        Row: {
          account_id: string
          confidence_score: number
          created_at: string
          estimated_value: number
          id: string
          notes: string | null
          owner_salesperson_id: string | null
          playbook_id: string | null
          status: Database["public"]["Enums"]["expansion_opp_status"]
          type: Database["public"]["Enums"]["expansion_type"]
          updated_at: string
        }
        Insert: {
          account_id: string
          confidence_score?: number
          created_at?: string
          estimated_value?: number
          id?: string
          notes?: string | null
          owner_salesperson_id?: string | null
          playbook_id?: string | null
          status?: Database["public"]["Enums"]["expansion_opp_status"]
          type?: Database["public"]["Enums"]["expansion_type"]
          updated_at?: string
        }
        Update: {
          account_id?: string
          confidence_score?: number
          created_at?: string
          estimated_value?: number
          id?: string
          notes?: string | null
          owner_salesperson_id?: string | null
          playbook_id?: string | null
          status?: Database["public"]["Enums"]["expansion_opp_status"]
          type?: Database["public"]["Enums"]["expansion_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expansion_opportunities_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expansion_opportunities_owner_salesperson_id_fkey"
            columns: ["owner_salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expansion_opportunities_owner_salesperson_id_fkey"
            columns: ["owner_salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expansion_opportunities_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "expansion_playbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      expansion_playbooks: {
        Row: {
          created_at: string
          description: string | null
          expansion_type: Database["public"]["Enums"]["expansion_type"]
          id: string
          is_active: boolean
          name: string
          recommended_action: string | null
          trigger_config: Json
          trigger_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          expansion_type?: Database["public"]["Enums"]["expansion_type"]
          id?: string
          is_active?: boolean
          name: string
          recommended_action?: string | null
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          expansion_type?: Database["public"]["Enums"]["expansion_type"]
          id?: string
          is_active?: boolean
          name?: string
          recommended_action?: string | null
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          allowed_roles: string[] | null
          created_at: string
          description: string | null
          id: string
          is_enabled: boolean
          key: string
          metadata: Json | null
          rollout_percentage: number
          updated_at: string
        }
        Insert: {
          allowed_roles?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          key: string
          metadata?: Json | null
          rollout_percentage?: number
          updated_at?: string
        }
        Update: {
          allowed_roles?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          key?: string
          metadata?: Json | null
          rollout_percentage?: number
          updated_at?: string
        }
        Relationships: []
      }
      feed_comments: {
        Row: {
          content: string
          created_at: string
          feed_item_id: string
          id: string
          salesperson_id: string
        }
        Insert: {
          content: string
          created_at?: string
          feed_item_id: string
          id?: string
          salesperson_id: string
        }
        Update: {
          content?: string
          created_at?: string
          feed_item_id?: string
          id?: string
          salesperson_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_comments_feed_item_id_fkey"
            columns: ["feed_item_id"]
            isOneToOne: false
            referencedRelation: "victory_feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_comments_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_comments_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_reactions: {
        Row: {
          created_at: string
          feed_item_id: string
          id: string
          reaction: string
          salesperson_id: string
        }
        Insert: {
          created_at?: string
          feed_item_id: string
          id?: string
          reaction?: string
          salesperson_id: string
        }
        Update: {
          created_at?: string
          feed_item_id?: string
          id?: string
          reaction?: string
          salesperson_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_reactions_feed_item_id_fkey"
            columns: ["feed_item_id"]
            isOneToOne: false
            referencedRelation: "victory_feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_reactions_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_reactions_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      forecast_accuracy: {
        Row: {
          actual_amount: number
          actual_deals: number
          bias: string
          computed_at: string
          id: string
          mape: number
          snapshot_id: string
          variance_amount: number | null
          variance_pct: number
        }
        Insert: {
          actual_amount?: number
          actual_deals?: number
          bias?: string
          computed_at?: string
          id?: string
          mape?: number
          snapshot_id: string
          variance_amount?: number | null
          variance_pct?: number
        }
        Update: {
          actual_amount?: number
          actual_deals?: number
          bias?: string
          computed_at?: string
          id?: string
          mape?: number
          snapshot_id?: string
          variance_amount?: number | null
          variance_pct?: number
        }
        Relationships: [
          {
            foreignKeyName: "forecast_accuracy_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: true
            referencedRelation: "forecast_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      forecast_confidence_scores: {
        Row: {
          avg_mape: number
          bias_trend: string
          computed_at: string
          confidence_score: number
          id: string
          owner_id: string | null
          period_count: number
          source: string
        }
        Insert: {
          avg_mape?: number
          bias_trend?: string
          computed_at?: string
          confidence_score?: number
          id?: string
          owner_id?: string | null
          period_count?: number
          source: string
        }
        Update: {
          avg_mape?: number
          bias_trend?: string
          computed_at?: string
          confidence_score?: number
          id?: string
          owner_id?: string | null
          period_count?: number
          source?: string
        }
        Relationships: []
      }
      forecast_deal_contributions: {
        Row: {
          category: string
          created_at: string
          forecast_id: string
          id: string
          probability: number
          reasoning: string | null
          sale_id: string
          weighted_amount: number
        }
        Insert: {
          category: string
          created_at?: string
          forecast_id: string
          id?: string
          probability?: number
          reasoning?: string | null
          sale_id: string
          weighted_amount?: number
        }
        Update: {
          category?: string
          created_at?: string
          forecast_id?: string
          id?: string
          probability?: number
          reasoning?: string | null
          sale_id?: string
          weighted_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "forecast_deal_contributions_forecast_id_fkey"
            columns: ["forecast_id"]
            isOneToOne: false
            referencedRelation: "revenue_forecasts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forecast_deal_contributions_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      forecast_snapshots: {
        Row: {
          best_case_amount: number
          commit_amount: number
          created_at: string
          forecast_amount: number
          forecast_deals: number
          id: string
          owner_id: string | null
          period_end: string
          period_start: string
          segment: string | null
          snapshot_at: string
          source: string
          weighted_amount: number
        }
        Insert: {
          best_case_amount?: number
          commit_amount?: number
          created_at?: string
          forecast_amount?: number
          forecast_deals?: number
          id?: string
          owner_id?: string | null
          period_end: string
          period_start: string
          segment?: string | null
          snapshot_at?: string
          source?: string
          weighted_amount?: number
        }
        Update: {
          best_case_amount?: number
          commit_amount?: number
          created_at?: string
          forecast_amount?: number
          forecast_deals?: number
          id?: string
          owner_id?: string | null
          period_end?: string
          period_start?: string
          segment?: string | null
          snapshot_at?: string
          source?: string
          weighted_amount?: number
        }
        Relationships: []
      }
      geo_access_logs: {
        Row: {
          attempted_path: string | null
          blocked: boolean | null
          city: string | null
          country_code: string | null
          country_name: string | null
          created_at: string
          id: string
          ip_address: string
          region: string | null
          user_agent: string | null
        }
        Insert: {
          attempted_path?: string | null
          blocked?: boolean | null
          city?: string | null
          country_code?: string | null
          country_name?: string | null
          created_at?: string
          id?: string
          ip_address: string
          region?: string | null
          user_agent?: string | null
        }
        Update: {
          attempted_path?: string | null
          blocked?: boolean | null
          city?: string | null
          country_code?: string | null
          country_name?: string | null
          created_at?: string
          id?: string
          ip_address?: string
          region?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      geo_blocked_regions: {
        Row: {
          blocked_at: string | null
          blocked_by: string | null
          country_code: string
          country_name: string
          created_at: string
          id: string
          is_active: boolean | null
          reason: string | null
          updated_at: string
        }
        Insert: {
          blocked_at?: string | null
          blocked_by?: string | null
          country_code: string
          country_name: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          reason?: string | null
          updated_at?: string
        }
        Update: {
          blocked_at?: string | null
          blocked_by?: string | null
          country_code?: string
          country_name?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      icp_data: {
        Row: {
          bitrix_id: string | null
          capital_social: number | null
          client_id: string
          created_at: string
          grupo_nicho: string | null
          id: string
          is_icp_match: boolean | null
          num_colaboradores: number | null
          ramo_atividade: string | null
          updated_at: string
        }
        Insert: {
          bitrix_id?: string | null
          capital_social?: number | null
          client_id: string
          created_at?: string
          grupo_nicho?: string | null
          id?: string
          is_icp_match?: boolean | null
          num_colaboradores?: number | null
          ramo_atividade?: string | null
          updated_at?: string
        }
        Update: {
          bitrix_id?: string | null
          capital_social?: number | null
          client_id?: string
          created_at?: string
          grupo_nicho?: string | null
          id?: string
          is_icp_match?: boolean | null
          num_colaboradores?: number | null
          ramo_atividade?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "icp_data_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "client_purchase_seasonality"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "icp_data_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      inbound_reply_events: {
        Row: {
          created_at: string
          event_type: string
          from_email: string | null
          id: string
          matched_enrollment_id: string | null
          message_id: string | null
          payload: Json
          provider: string
          received_at: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          event_type?: string
          from_email?: string | null
          id?: string
          matched_enrollment_id?: string | null
          message_id?: string | null
          payload?: Json
          provider: string
          received_at?: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          from_email?: string | null
          id?: string
          matched_enrollment_id?: string | null
          message_id?: string | null
          payload?: Json
          provider?: string
          received_at?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inbound_reply_events_matched_enrollment_id_fkey"
            columns: ["matched_enrollment_id"]
            isOneToOne: false
            referencedRelation: "sequence_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_levels: {
        Row: {
          created_at: string
          current_stock: number
          id: string
          last_restock_date: string | null
          lead_time_days: number | null
          max_stock_level: number
          min_stock_level: number
          product_id: string | null
          reorder_point: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_stock?: number
          id?: string
          last_restock_date?: string | null
          lead_time_days?: number | null
          max_stock_level?: number
          min_stock_level?: number
          product_id?: string | null
          reorder_point?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_stock?: number
          id?: string
          last_restock_date?: string | null
          lead_time_days?: number | null
          max_stock_level?: number
          min_stock_level?: number
          product_id?: string | null
          reorder_point?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_levels_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      ip_whitelist: {
        Row: {
          added_by: string | null
          created_at: string | null
          description: string | null
          id: string
          ip_address: string
          updated_at: string | null
        }
        Insert: {
          added_by?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          ip_address: string
          updated_at?: string | null
        }
        Update: {
          added_by?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          ip_address?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      known_devices: {
        Row: {
          browser: string | null
          created_at: string | null
          device_fingerprint: string
          device_name: string | null
          first_seen_at: string | null
          id: string
          ip_address: string | null
          is_trusted: boolean | null
          last_seen_at: string | null
          location: string | null
          os: string | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string | null
          device_fingerprint: string
          device_name?: string | null
          first_seen_at?: string | null
          id?: string
          ip_address?: string | null
          is_trusted?: boolean | null
          last_seen_at?: string | null
          location?: string | null
          os?: string | null
          user_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string | null
          device_fingerprint?: string
          device_name?: string | null
          first_seen_at?: string | null
          id?: string
          ip_address?: string | null
          is_trusted?: boolean | null
          last_seen_at?: string | null
          location?: string | null
          os?: string | null
          user_id?: string
        }
        Relationships: []
      }
      kudos: {
        Row: {
          created_at: string
          from_salesperson_id: string
          id: string
          is_pinned: boolean
          kudos_type: string
          message: string
          to_salesperson_id: string
        }
        Insert: {
          created_at?: string
          from_salesperson_id: string
          id?: string
          is_pinned?: boolean
          kudos_type?: string
          message: string
          to_salesperson_id: string
        }
        Update: {
          created_at?: string
          from_salesperson_id?: string
          id?: string
          is_pinned?: boolean
          kudos_type?: string
          message?: string
          to_salesperson_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kudos_from_salesperson_id_fkey"
            columns: ["from_salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kudos_from_salesperson_id_fkey"
            columns: ["from_salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kudos_to_salesperson_id_fkey"
            columns: ["to_salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kudos_to_salesperson_id_fkey"
            columns: ["to_salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_assignments: {
        Row: {
          assigned_at: string
          id: string
          metadata: Json | null
          rule_id: string | null
          sale_id: string
          salesperson_id: string
          strategy_used: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          metadata?: Json | null
          rule_id?: string | null
          sale_id: string
          salesperson_id: string
          strategy_used: string
        }
        Update: {
          assigned_at?: string
          id?: string
          metadata?: Json | null
          rule_id?: string | null
          sale_id?: string
          salesperson_id?: string
          strategy_used?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_assignments_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "lead_routing_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_assignments_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_assignments_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_assignments_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_routing_log: {
        Row: {
          client_id: string | null
          created_at: string
          from_salesperson_id: string | null
          id: string
          notes: string | null
          routing_reason: string
          to_salesperson_id: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          from_salesperson_id?: string | null
          id?: string
          notes?: string | null
          routing_reason: string
          to_salesperson_id?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          from_salesperson_id?: string | null
          id?: string
          notes?: string | null
          routing_reason?: string
          to_salesperson_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_routing_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_purchase_seasonality"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lead_routing_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_routing_log_from_salesperson_id_fkey"
            columns: ["from_salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_routing_log_from_salesperson_id_fkey"
            columns: ["from_salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_routing_log_to_salesperson_id_fkey"
            columns: ["to_salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_routing_log_to_salesperson_id_fkey"
            columns: ["to_salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_routing_rules: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          filter_min_value: number | null
          filter_role: string | null
          filter_source: string | null
          filter_state: string | null
          id: string
          is_active: boolean
          name: string
          priority: number
          strategy: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          filter_min_value?: number | null
          filter_role?: string | null
          filter_source?: string | null
          filter_state?: string | null
          id?: string
          is_active?: boolean
          name: string
          priority?: number
          strategy?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          filter_min_value?: number | null
          filter_role?: string | null
          filter_source?: string | null
          filter_state?: string | null
          id?: string
          is_active?: boolean
          name?: string
          priority?: number
          strategy?: string
          updated_at?: string
        }
        Relationships: []
      }
      lead_score_explanations: {
        Row: {
          baseline_score: number
          calculated_at: string
          created_at: string
          id: string
          model_version: string
          narrative: string | null
          recommendations: Json
          sale_id: string
          score: number
          top_drivers: Json
          updated_at: string
        }
        Insert: {
          baseline_score?: number
          calculated_at?: string
          created_at?: string
          id?: string
          model_version?: string
          narrative?: string | null
          recommendations?: Json
          sale_id: string
          score: number
          top_drivers?: Json
          updated_at?: string
        }
        Update: {
          baseline_score?: number
          calculated_at?: string
          created_at?: string
          id?: string
          model_version?: string
          narrative?: string | null
          recommendations?: Json
          sale_id?: string
          score?: number
          top_drivers?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_score_explanations_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: true
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_score_history: {
        Row: {
          factors: Json
          id: string
          recorded_at: string
          sale_id: string
          score: number
        }
        Insert: {
          factors?: Json
          id?: string
          recorded_at?: string
          sale_id: string
          score: number
        }
        Update: {
          factors?: Json
          id?: string
          recorded_at?: string
          sale_id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "lead_score_history_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_scores: {
        Row: {
          calculated_at: string
          created_at: string
          factors: Json
          id: string
          sale_id: string
          score: number
          updated_at: string
        }
        Insert: {
          calculated_at?: string
          created_at?: string
          factors?: Json
          id?: string
          sale_id: string
          score?: number
          updated_at?: string
        }
        Update: {
          calculated_at?: string
          created_at?: string
          factors?: Json
          id?: string
          sale_id?: string
          score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_scores_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: true
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      league_members: {
        Row: {
          id: string
          joined_at: string
          league_id: string
          salesperson_id: string
          updated_at: string
          weekly_xp: number
        }
        Insert: {
          id?: string
          joined_at?: string
          league_id: string
          salesperson_id: string
          updated_at?: string
          weekly_xp?: number
        }
        Update: {
          id?: string
          joined_at?: string
          league_id?: string
          salesperson_id?: string
          updated_at?: string
          weekly_xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "league_members_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "league_members_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: true
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "league_members_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: true
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      leagues: {
        Row: {
          color: string
          created_at: string
          demotion_slots: number
          icon: string
          id: string
          min_xp: number
          name: string
          promotion_slots: number
          tier: number
          xp_bonus_percent: number
        }
        Insert: {
          color?: string
          created_at?: string
          demotion_slots?: number
          icon?: string
          id?: string
          min_xp?: number
          name: string
          promotion_slots?: number
          tier?: number
          xp_bonus_percent?: number
        }
        Update: {
          color?: string
          created_at?: string
          demotion_slots?: number
          icon?: string
          id?: string
          min_xp?: number
          name?: string
          promotion_slots?: number
          tier?: number
          xp_bonus_percent?: number
        }
        Relationships: []
      }
      login_alerts: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          alert_type: string | null
          browser: string | null
          created_at: string | null
          device_fingerprint: string
          email_sent: boolean | null
          email_sent_at: string | null
          id: string
          ip_address: string | null
          location: string | null
          os: string | null
          user_id: string
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          alert_type?: string | null
          browser?: string | null
          created_at?: string | null
          device_fingerprint: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          id?: string
          ip_address?: string | null
          location?: string | null
          os?: string | null
          user_id: string
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          alert_type?: string | null
          browser?: string | null
          created_at?: string | null
          device_fingerprint?: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          id?: string
          ip_address?: string | null
          location?: string | null
          os?: string | null
          user_id?: string
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          created_at: string | null
          email: string
          failure_reason: string | null
          id: string
          ip_address: string | null
          success: boolean | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean | null
          user_agent?: string | null
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          body: string
          category: string | null
          channel: string
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          pipeline_stage: string | null
          salesperson_id: string
          subject: string | null
          updated_at: string
          usage_count: number | null
          variables: string[] | null
        }
        Insert: {
          body: string
          category?: string | null
          channel?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          pipeline_stage?: string | null
          salesperson_id: string
          subject?: string | null
          updated_at?: string
          usage_count?: number | null
          variables?: string[] | null
        }
        Update: {
          body?: string
          category?: string | null
          channel?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          pipeline_stage?: string | null
          salesperson_id?: string
          subject?: string | null
          updated_at?: string
          usage_count?: number | null
          variables?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_templates_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_verification_attempts: {
        Row: {
          created_at: string | null
          id: string
          ip_address: string | null
          method: string
          success: boolean | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          method: string
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          method?: string
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      mood_entries: {
        Row: {
          created_at: string
          entry_date: string
          id: string
          mood_value: number
          salesperson_id: string
        }
        Insert: {
          created_at?: string
          entry_date?: string
          id?: string
          mood_value: number
          salesperson_id: string
        }
        Update: {
          created_at?: string
          entry_date?: string
          id?: string
          mood_value?: number
          salesperson_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mood_entries_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mood_entries_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          consecutive_days_threshold: number
          created_at: string
          email: string
          frequency: string
          id: string
          inactive_threshold_days: number
          is_active: boolean
          notify_at_risk_goals: boolean
          notify_inactive_clients: boolean
          notify_stagnant_deals: boolean
          preferred_time: string
          stagnant_threshold_days: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          consecutive_days_threshold?: number
          created_at?: string
          email: string
          frequency?: string
          id?: string
          inactive_threshold_days?: number
          is_active?: boolean
          notify_at_risk_goals?: boolean
          notify_inactive_clients?: boolean
          notify_stagnant_deals?: boolean
          preferred_time?: string
          stagnant_threshold_days?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          consecutive_days_threshold?: number
          created_at?: string
          email?: string
          frequency?: string
          id?: string
          inactive_threshold_days?: number
          is_active?: boolean
          notify_at_risk_goals?: boolean
          notify_inactive_clients?: boolean
          notify_stagnant_deals?: boolean
          preferred_time?: string
          stagnant_threshold_days?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          archived_at: string | null
          category: string
          created_at: string
          expires_at: string | null
          icon: string | null
          id: string
          message: string | null
          metadata: Json | null
          priority: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          archived_at?: string | null
          category?: string
          created_at?: string
          expires_at?: string | null
          icon?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          priority?: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          archived_at?: string | null
          category?: string
          created_at?: string
          expires_at?: string | null
          icon?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          priority?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      nps_surveys: {
        Row: {
          client_name: string
          comment: string | null
          created_at: string
          id: string
          responded_at: string | null
          sale_id: string | null
          salesperson_id: string | null
          score: number | null
          sent_at: string | null
          status: string
          survey_type: string
        }
        Insert: {
          client_name: string
          comment?: string | null
          created_at?: string
          id?: string
          responded_at?: string | null
          sale_id?: string | null
          salesperson_id?: string | null
          score?: number | null
          sent_at?: string | null
          status?: string
          survey_type?: string
        }
        Update: {
          client_name?: string
          comment?: string | null
          created_at?: string
          id?: string
          responded_at?: string | null
          sale_id?: string | null
          salesperson_id?: string | null
          score?: number | null
          sent_at?: string | null
          status?: string
          survey_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "nps_surveys_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nps_surveys_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nps_surveys_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      objection_library: {
        Row: {
          best_response_recording_id: string | null
          best_response_text: string | null
          frequency_count: number
          id: string
          last_seen_at: string
          objection_type: string
          pattern_text: string
          updated_at: string
        }
        Insert: {
          best_response_recording_id?: string | null
          best_response_text?: string | null
          frequency_count?: number
          id?: string
          last_seen_at?: string
          objection_type: string
          pattern_text: string
          updated_at?: string
        }
        Update: {
          best_response_recording_id?: string | null
          best_response_text?: string | null
          frequency_count?: number
          id?: string
          last_seen_at?: string
          objection_type?: string
          pattern_text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "objection_library_best_response_recording_id_fkey"
            columns: ["best_response_recording_id"]
            isOneToOne: false
            referencedRelation: "call_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      objections_library: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          effectiveness_score: number | null
          id: string
          objection: string
          response: string
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          effectiveness_score?: number | null
          id?: string
          objection: string
          response: string
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          effectiveness_score?: number | null
          id?: string
          objection?: string
          response?: string
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "objections_library_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objections_library_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_journeys: {
        Row: {
          account_id: string
          completed_at: string | null
          created_at: string
          current_step: number
          id: string
          owner_salesperson_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["onboarding_status"]
          template_key: string
          total_steps: number
          updated_at: string
        }
        Insert: {
          account_id: string
          completed_at?: string | null
          created_at?: string
          current_step?: number
          id?: string
          owner_salesperson_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["onboarding_status"]
          template_key?: string
          total_steps?: number
          updated_at?: string
        }
        Update: {
          account_id?: string
          completed_at?: string | null
          created_at?: string
          current_step?: number
          id?: string
          owner_salesperson_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["onboarding_status"]
          template_key?: string
          total_steps?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_journeys_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_journeys_owner_salesperson_id_fkey"
            columns: ["owner_salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_journeys_owner_salesperson_id_fkey"
            columns: ["owner_salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_steps: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          journey_id: string
          order_index: number
          status: string
          title: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          journey_id: string
          order_index?: number
          status?: string
          title: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          journey_id?: string
          order_index?: number
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_steps_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "onboarding_journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      outbound_messages: {
        Row: {
          body: string | null
          channel: string
          created_at: string
          delivered_at: string | null
          enrollment_id: string | null
          error: string | null
          id: string
          metadata: Json
          owner_id: string
          provider: string
          provider_message_id: string | null
          read_at: string | null
          sent_at: string | null
          status: string
          step_id: string | null
          template_id: string | null
          to_number: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          channel: string
          created_at?: string
          delivered_at?: string | null
          enrollment_id?: string | null
          error?: string | null
          id?: string
          metadata?: Json
          owner_id: string
          provider: string
          provider_message_id?: string | null
          read_at?: string | null
          sent_at?: string | null
          status?: string
          step_id?: string | null
          template_id?: string | null
          to_number: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          channel?: string
          created_at?: string
          delivered_at?: string | null
          enrollment_id?: string | null
          error?: string | null
          id?: string
          metadata?: Json
          owner_id?: string
          provider?: string
          provider_message_id?: string | null
          read_at?: string | null
          sent_at?: string | null
          status?: string
          step_id?: string | null
          template_id?: string | null
          to_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "outbound_messages_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "sequence_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outbound_messages_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "sequence_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      page_analytics: {
        Row: {
          created_at: string
          device_type: string | null
          duration_seconds: number | null
          entered_at: string
          exited_at: string | null
          id: string
          interactions: number | null
          page_title: string | null
          referrer_route: string | null
          route: string
          salesperson_id: string | null
          session_id: string | null
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          duration_seconds?: number | null
          entered_at?: string
          exited_at?: string | null
          id?: string
          interactions?: number | null
          page_title?: string | null
          referrer_route?: string | null
          route: string
          salesperson_id?: string | null
          session_id?: string | null
        }
        Update: {
          created_at?: string
          device_type?: string | null
          duration_seconds?: number | null
          entered_at?: string
          exited_at?: string | null
          id?: string
          interactions?: number | null
          page_title?: string | null
          referrer_route?: string | null
          route?: string
          salesperson_id?: string | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_analytics_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "page_analytics_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      password_reset_requests: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          ip_address: string | null
          rejection_reason: string | null
          requested_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_agent: string | null
          user_email: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          rejection_reason?: string | null
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_email: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          rejection_reason?: string | null
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_email?: string
          user_id?: string | null
        }
        Relationships: []
      }
      performance_bets: {
        Row: {
          bet_type: string
          created_at: string
          current_value: number
          description: string | null
          ends_at: string
          id: string
          resolved_at: string | null
          salesperson_id: string
          starts_at: string
          status: string
          target_value: number
          xp_multiplier: number
          xp_wagered: number
        }
        Insert: {
          bet_type: string
          created_at?: string
          current_value?: number
          description?: string | null
          ends_at: string
          id?: string
          resolved_at?: string | null
          salesperson_id: string
          starts_at?: string
          status?: string
          target_value: number
          xp_multiplier?: number
          xp_wagered?: number
        }
        Update: {
          bet_type?: string
          created_at?: string
          current_value?: number
          description?: string | null
          ends_at?: string
          id?: string
          resolved_at?: string | null
          salesperson_id?: string
          starts_at?: string
          status?: string
          target_value?: number
          xp_multiplier?: number
          xp_wagered?: number
        }
        Relationships: [
          {
            foreignKeyName: "performance_bets_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_bets_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          action: string
          created_at: string
          description: string | null
          id: string
          name: string
          resource: string
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          resource: string
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          resource?: string
        }
        Relationships: []
      }
      pipeline_coverage_recommendations: {
        Row: {
          acted_on: boolean
          acted_on_at: string | null
          acted_on_by: string | null
          action: string
          ai_generated: boolean
          created_at: string
          expected_impact_amount: number
          id: string
          priority: string
          snapshot_id: string
          title: string
        }
        Insert: {
          acted_on?: boolean
          acted_on_at?: string | null
          acted_on_by?: string | null
          action: string
          ai_generated?: boolean
          created_at?: string
          expected_impact_amount?: number
          id?: string
          priority?: string
          snapshot_id: string
          title: string
        }
        Update: {
          acted_on?: boolean
          acted_on_at?: string | null
          acted_on_by?: string | null
          action?: string
          ai_generated?: boolean
          created_at?: string
          expected_impact_amount?: number
          id?: string
          priority?: string
          snapshot_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_coverage_recommendations_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "pipeline_coverage_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_coverage_snapshots: {
        Row: {
          calculated_at: string
          coverage_ratio: number
          created_at: string
          deals_count: number
          gap_to_target: number
          health: string
          id: string
          owner_id: string | null
          period_end: string
          period_start: string
          pipeline_amount: number
          quota_amount: number
          segment: string | null
          stage: string | null
          target_ratio: number
          weighted_pipeline: number
        }
        Insert: {
          calculated_at?: string
          coverage_ratio?: number
          created_at?: string
          deals_count?: number
          gap_to_target?: number
          health?: string
          id?: string
          owner_id?: string | null
          period_end: string
          period_start: string
          pipeline_amount?: number
          quota_amount?: number
          segment?: string | null
          stage?: string | null
          target_ratio?: number
          weighted_pipeline?: number
        }
        Update: {
          calculated_at?: string
          coverage_ratio?: number
          created_at?: string
          deals_count?: number
          gap_to_target?: number
          health?: string
          id?: string
          owner_id?: string | null
          period_end?: string
          period_start?: string
          pipeline_amount?: number
          quota_amount?: number
          segment?: string | null
          stage?: string | null
          target_ratio?: number
          weighted_pipeline?: number
        }
        Relationships: []
      }
      pipeline_inspection_snapshots: {
        Row: {
          days_in_stage: number
          days_since_activity: number | null
          health_score: number | null
          id: string
          inspected_at: string
          last_activity_at: string | null
          risk_flags: Json
          sale_id: string
          stage: string
        }
        Insert: {
          days_in_stage?: number
          days_since_activity?: number | null
          health_score?: number | null
          id?: string
          inspected_at?: string
          last_activity_at?: string | null
          risk_flags?: Json
          sale_id: string
          stage: string
        }
        Update: {
          days_in_stage?: number
          days_since_activity?: number | null
          health_score?: number | null
          id?: string
          inspected_at?: string
          last_activity_at?: string | null
          risk_flags?: Json
          sale_id?: string
          stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_inspection_snapshots_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stages: {
        Row: {
          color: string
          created_at: string
          id: string
          is_final: boolean
          label: string
          name: string
          pipeline_id: string
          probability: number
          stage_order: number
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          is_final?: boolean
          label: string
          name: string
          pipeline_id: string
          probability?: number
          stage_order?: number
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          is_final?: boolean
          label?: string
          name?: string
          pipeline_id?: string
          probability?: number
          stage_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stages_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      pipelines: {
        Row: {
          color: string
          created_at: string
          description: string | null
          display_order: number
          icon: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      playbook_items: {
        Row: {
          content: string
          created_at: string
          id: string
          is_required: boolean
          item_order: number
          item_type: string
          playbook_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_required?: boolean
          item_order?: number
          item_type?: string
          playbook_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_required?: boolean
          item_order?: number
          item_type?: string
          playbook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playbook_items_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "playbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      playbook_progress: {
        Row: {
          completed_at: string
          completed_by: string | null
          id: string
          playbook_item_id: string
          sale_id: string
        }
        Insert: {
          completed_at?: string
          completed_by?: string | null
          id?: string
          playbook_item_id: string
          sale_id: string
        }
        Update: {
          completed_at?: string
          completed_by?: string | null
          id?: string
          playbook_item_id?: string
          sale_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playbook_progress_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playbook_progress_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playbook_progress_playbook_item_id_fkey"
            columns: ["playbook_item_id"]
            isOneToOne: false
            referencedRelation: "playbook_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playbook_progress_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      playbooks: {
        Row: {
          created_at: string
          description: string | null
          id: string
          stage: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          stage: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          stage?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      price_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_read: boolean
          new_price: number
          old_price: number | null
          price_change_percent: number | null
          product_id: string | null
          supplier_id: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_read?: boolean
          new_price: number
          old_price?: number | null
          price_change_percent?: number | null
          product_id?: string | null
          supplier_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_read?: boolean
          new_price?: number
          old_price?: number | null
          price_change_percent?: number | null
          product_id?: string | null
          supplier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_alerts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_alerts_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      price_history: {
        Row: {
          created_at: string
          id: string
          new_price: number
          old_price: number
          price_change_percent: number | null
          product_id: string | null
          recorded_at: string
          supplier_id: string | null
          supplier_product_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          new_price: number
          old_price: number
          price_change_percent?: number | null
          product_id?: string | null
          recorded_at?: string
          supplier_id?: string | null
          supplier_product_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          new_price?: number
          old_price?: number
          price_change_percent?: number | null
          product_id?: string | null
          recorded_at?: string
          supplier_id?: string | null
          supplier_product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_history_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_history_supplier_product_id_fkey"
            columns: ["supplier_product_id"]
            isOneToOne: false
            referencedRelation: "supplier_products"
            referencedColumns: ["id"]
          },
        ]
      }
      prize_wheel_spins: {
        Row: {
          id: string
          prize_label: string
          prize_type: string
          prize_value: number
          salesperson_id: string
          spun_at: string
          trigger_type: string
        }
        Insert: {
          id?: string
          prize_label: string
          prize_type: string
          prize_value?: number
          salesperson_id: string
          spun_at?: string
          trigger_type?: string
        }
        Update: {
          id?: string
          prize_label?: string
          prize_type?: string
          prize_value?: number
          salesperson_id?: string
          spun_at?: string
          trigger_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "prize_wheel_spins_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prize_wheel_spins_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      product_usage_events: {
        Row: {
          account_id: string
          event_type: string
          feature_key: string
          id: string
          metadata: Json
          occurred_at: string
          user_email: string | null
        }
        Insert: {
          account_id: string
          event_type?: string
          feature_key: string
          id?: string
          metadata?: Json
          occurred_at?: string
          user_email?: string | null
        }
        Update: {
          account_id?: string
          event_type?: string
          feature_key?: string
          id?: string
          metadata?: Json
          occurred_at?: string
          user_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_usage_events_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      product_usage_summary: {
        Row: {
          account_id: string
          adoption_score: number
          computed_at: string
          dau: number
          last_login_at: string | null
          mau: number
          top_features: Json
          wau: number
        }
        Insert: {
          account_id: string
          adoption_score?: number
          computed_at?: string
          dau?: number
          last_login_at?: string | null
          mau?: number
          top_features?: Json
          wau?: number
        }
        Update: {
          account_id?: string
          adoption_score?: number
          computed_at?: string
          dau?: number
          last_login_at?: string | null
          mau?: number
          top_features?: Json
          wau?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_usage_summary_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          id: string
          name: string
          price: number
          rating: number
          sales_count: number
          status: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          name: string
          price?: number
          rating?: number
          sales_count?: number
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          name?: string
          price?: number
          rating?: number
          sales_count?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      progressive_goals: {
        Row: {
          completed_levels: number
          created_at: string
          current_level: number
          current_progress: number
          current_target: number
          goal_type: string
          id: string
          multiplier: number
          salesperson_id: string
          total_xp_earned: number
          updated_at: string
        }
        Insert: {
          completed_levels?: number
          created_at?: string
          current_level?: number
          current_progress?: number
          current_target?: number
          goal_type?: string
          id?: string
          multiplier?: number
          salesperson_id: string
          total_xp_earned?: number
          updated_at?: string
        }
        Update: {
          completed_levels?: number
          created_at?: string
          current_level?: number
          current_progress?: number
          current_target?: number
          goal_type?: string
          id?: string
          multiplier?: number
          salesperson_id?: string
          total_xp_earned?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "progressive_goals_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progressive_goals_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      prospect_cadences: {
        Row: {
          cadence_id: string
          completed_at: string | null
          created_at: string
          current_step: number
          enrolled_via_rule_id: string | null
          enrollment_source: string
          id: string
          next_action_date: string | null
          paused_at: string | null
          paused_reason: string | null
          quote_id: string | null
          sale_id: string | null
          salesperson_id: string | null
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          cadence_id: string
          completed_at?: string | null
          created_at?: string
          current_step?: number
          enrolled_via_rule_id?: string | null
          enrollment_source?: string
          id?: string
          next_action_date?: string | null
          paused_at?: string | null
          paused_reason?: string | null
          quote_id?: string | null
          sale_id?: string | null
          salesperson_id?: string | null
          started_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          cadence_id?: string
          completed_at?: string | null
          created_at?: string
          current_step?: number
          enrolled_via_rule_id?: string | null
          enrollment_source?: string
          id?: string
          next_action_date?: string | null
          paused_at?: string | null
          paused_reason?: string | null
          quote_id?: string | null
          sale_id?: string | null
          salesperson_id?: string | null
          started_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prospect_cadences_cadence_id_fkey"
            columns: ["cadence_id"]
            isOneToOne: false
            referencedRelation: "cadences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospect_cadences_enrolled_via_rule_id_fkey"
            columns: ["enrolled_via_rule_id"]
            isOneToOne: false
            referencedRelation: "cadence_enrollment_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospect_cadences_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospect_cadences_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospect_cadences_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospect_cadences_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      qbr_reports: {
        Row: {
          ai_narrative: string | null
          generated_at: string
          generated_by: string | null
          id: string
          metrics: Json
          period_end: string
          period_label: string
          period_start: string
          recommendations: Json
          salesperson_id: string | null
        }
        Insert: {
          ai_narrative?: string | null
          generated_at?: string
          generated_by?: string | null
          id?: string
          metrics?: Json
          period_end: string
          period_label: string
          period_start: string
          recommendations?: Json
          salesperson_id?: string | null
        }
        Update: {
          ai_narrative?: string | null
          generated_at?: string
          generated_by?: string | null
          id?: string
          metrics?: Json
          period_end?: string
          period_label?: string
          period_start?: string
          recommendations?: Json
          salesperson_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qbr_reports_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qbr_reports_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      qbr_schedule: {
        Row: {
          account_id: string
          auto_generate: boolean
          created_at: string
          frequency: Database["public"]["Enums"]["qbr_frequency"]
          id: string
          is_active: boolean
          last_qbr_at: string | null
          next_qbr_at: string | null
          owner_salesperson_id: string | null
          updated_at: string
        }
        Insert: {
          account_id: string
          auto_generate?: boolean
          created_at?: string
          frequency?: Database["public"]["Enums"]["qbr_frequency"]
          id?: string
          is_active?: boolean
          last_qbr_at?: string | null
          next_qbr_at?: string | null
          owner_salesperson_id?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          auto_generate?: boolean
          created_at?: string
          frequency?: Database["public"]["Enums"]["qbr_frequency"]
          id?: string
          is_active?: boolean
          last_qbr_at?: string | null
          next_qbr_at?: string | null
          owner_salesperson_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "qbr_schedule_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qbr_schedule_owner_salesperson_id_fkey"
            columns: ["owner_salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qbr_schedule_owner_salesperson_id_fkey"
            columns: ["owner_salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      query_telemetry: {
        Row: {
          count_mode: string | null
          created_at: string
          duration_ms: number
          error_message: string | null
          id: string
          operation: string
          query_limit: number | null
          query_offset: number | null
          record_count: number | null
          rpc_name: string | null
          severity: string
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          count_mode?: string | null
          created_at?: string
          duration_ms?: number
          error_message?: string | null
          id?: string
          operation?: string
          query_limit?: number | null
          query_offset?: number | null
          record_count?: number | null
          rpc_name?: string | null
          severity?: string
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          count_mode?: string | null
          created_at?: string
          duration_ms?: number
          error_message?: string | null
          id?: string
          operation?: string
          query_limit?: number | null
          query_offset?: number | null
          record_count?: number | null
          rpc_name?: string | null
          severity?: string
          table_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      quota_attainment_actions: {
        Row: {
          action_type: string
          created_at: string
          description: string | null
          expected_impact: number
          forecast_id: string
          id: string
          priority: number
          title: string
        }
        Insert: {
          action_type: string
          created_at?: string
          description?: string | null
          expected_impact?: number
          forecast_id: string
          id?: string
          priority?: number
          title: string
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string | null
          expected_impact?: number
          forecast_id?: string
          id?: string
          priority?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "quota_attainment_actions_forecast_id_fkey"
            columns: ["forecast_id"]
            isOneToOne: false
            referencedRelation: "quota_attainment_forecasts"
            referencedColumns: ["id"]
          },
        ]
      }
      quota_attainment_alerts: {
        Row: {
          acknowledged: boolean
          created_at: string
          id: string
          message: string
          prediction_id: string
          recommended_action: string | null
          salesperson_id: string
          severity: string
        }
        Insert: {
          acknowledged?: boolean
          created_at?: string
          id?: string
          message: string
          prediction_id: string
          recommended_action?: string | null
          salesperson_id: string
          severity?: string
        }
        Update: {
          acknowledged?: boolean
          created_at?: string
          id?: string
          message?: string
          prediction_id?: string
          recommended_action?: string | null
          salesperson_id?: string
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "quota_attainment_alerts_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "quota_attainment_predictions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quota_attainment_alerts_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quota_attainment_alerts_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      quota_attainment_forecasts: {
        Row: {
          attainment_probability: number
          closed: number
          computed_at: string
          days_remaining: number
          id: string
          p10: number
          p50: number
          p90: number
          pace_per_day: number
          period_end: string
          period_start: string
          quota: number
          risk_level: string
          salesperson_id: string
          simulations: number
          weighted_open: number
        }
        Insert: {
          attainment_probability?: number
          closed?: number
          computed_at?: string
          days_remaining?: number
          id?: string
          p10?: number
          p50?: number
          p90?: number
          pace_per_day?: number
          period_end: string
          period_start: string
          quota?: number
          risk_level?: string
          salesperson_id: string
          simulations?: number
          weighted_open?: number
        }
        Update: {
          attainment_probability?: number
          closed?: number
          computed_at?: string
          days_remaining?: number
          id?: string
          p10?: number
          p50?: number
          p90?: number
          pace_per_day?: number
          period_end?: string
          period_start?: string
          quota?: number
          risk_level?: string
          salesperson_id?: string
          simulations?: number
          weighted_open?: number
        }
        Relationships: [
          {
            foreignKeyName: "quota_attainment_forecasts_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quota_attainment_forecasts_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      quota_attainment_predictions: {
        Row: {
          attainment_probability: number
          calculated_at: string
          closed_amount: number
          current_pace_per_day: number
          factors: Json
          id: string
          pace_required_per_day: number
          period_end: string
          period_start: string
          predicted_amount: number
          quota_amount: number
          risk_level: string
          salesperson_id: string
          scenario_optimistic: number
          scenario_pessimistic: number
          scenario_realistic: number
          weighted_pipeline: number
        }
        Insert: {
          attainment_probability?: number
          calculated_at?: string
          closed_amount?: number
          current_pace_per_day?: number
          factors?: Json
          id?: string
          pace_required_per_day?: number
          period_end: string
          period_start: string
          predicted_amount?: number
          quota_amount?: number
          risk_level?: string
          salesperson_id: string
          scenario_optimistic?: number
          scenario_pessimistic?: number
          scenario_realistic?: number
          weighted_pipeline?: number
        }
        Update: {
          attainment_probability?: number
          calculated_at?: string
          closed_amount?: number
          current_pace_per_day?: number
          factors?: Json
          id?: string
          pace_required_per_day?: number
          period_end?: string
          period_start?: string
          predicted_amount?: number
          quota_amount?: number
          risk_level?: string
          salesperson_id?: string
          scenario_optimistic?: number
          scenario_pessimistic?: number
          scenario_realistic?: number
          weighted_pipeline?: number
        }
        Relationships: [
          {
            foreignKeyName: "quota_attainment_predictions_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quota_attainment_predictions_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_sync_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          error_message: string | null
          external_quote_id: string | null
          id: string
          quote_number: string | null
          status: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          error_message?: string | null
          external_quote_id?: string | null
          id?: string
          quote_number?: string | null
          status?: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          error_message?: string | null
          external_quote_id?: string | null
          id?: string
          quote_number?: string | null
          status?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          approved_at: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          created_at: string
          created_by: string | null
          description: string | null
          discount_amount: number | null
          discount_percent: number | null
          external_quote_id: string | null
          external_reference: string | null
          id: string
          items: Json | null
          last_synced_at: string | null
          notes: string | null
          pdf_url: string | null
          quote_number: string | null
          rejected_at: string | null
          rejection_reason: string | null
          sale_id: string | null
          seller_name: string | null
          sent_at: string | null
          source: string | null
          status: string
          subtotal: number | null
          sync_status: string | null
          synced_from_external: boolean | null
          title: string
          total_value: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          approved_at?: string | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          external_quote_id?: string | null
          external_reference?: string | null
          id?: string
          items?: Json | null
          last_synced_at?: string | null
          notes?: string | null
          pdf_url?: string | null
          quote_number?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          sale_id?: string | null
          seller_name?: string | null
          sent_at?: string | null
          source?: string | null
          status?: string
          subtotal?: number | null
          sync_status?: string | null
          synced_from_external?: boolean | null
          title: string
          total_value?: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          approved_at?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          external_quote_id?: string | null
          external_reference?: string | null
          id?: string
          items?: Json | null
          last_synced_at?: string | null
          notes?: string | null
          pdf_url?: string | null
          quote_number?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          sale_id?: string | null
          seller_name?: string | null
          sent_at?: string | null
          source?: string | null
          status?: string
          subtotal?: number | null
          sync_status?: string | null
          synced_from_external?: boolean | null
          title?: string
          total_value?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      race_badges: {
        Row: {
          badge_code: string
          earned_at: string
          id: string
          salesperson_id: string
          season_id: string | null
        }
        Insert: {
          badge_code: string
          earned_at?: string
          id?: string
          salesperson_id: string
          season_id?: string | null
        }
        Update: {
          badge_code?: string
          earned_at?: string
          id?: string
          salesperson_id?: string
          season_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "race_badges_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "race_badges_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "race_badges_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "race_leaderboard_view"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "race_badges_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "race_seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "race_badges_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "race_spectator_view"
            referencedColumns: ["season_id"]
          },
        ]
      }
      race_cars: {
        Row: {
          car_number: number
          car_style: string
          created_at: string
          id: string
          nickname: string | null
          preset_id: string | null
          primary_color: string
          salesperson_id: string
          secondary_color: string
          total_overtakes: number
          total_races: number
          total_wins: number
          updated_at: string
          victory_quote: string | null
        }
        Insert: {
          car_number: number
          car_style?: string
          created_at?: string
          id?: string
          nickname?: string | null
          preset_id?: string | null
          primary_color?: string
          salesperson_id: string
          secondary_color?: string
          total_overtakes?: number
          total_races?: number
          total_wins?: number
          updated_at?: string
          victory_quote?: string | null
        }
        Update: {
          car_number?: number
          car_style?: string
          created_at?: string
          id?: string
          nickname?: string | null
          preset_id?: string | null
          primary_color?: string
          salesperson_id?: string
          secondary_color?: string
          total_overtakes?: number
          total_races?: number
          total_wins?: number
          updated_at?: string
          victory_quote?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "race_cars_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: true
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "race_cars_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: true
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      race_daily_snapshots: {
        Row: {
          created_at: string
          deals_count: number
          id: string
          progress: number
          rank: number
          salesperson_id: string
          score: number | null
          season_id: string
          snapshot_date: string
          total_sales: number
        }
        Insert: {
          created_at?: string
          deals_count?: number
          id?: string
          progress?: number
          rank: number
          salesperson_id: string
          score?: number | null
          season_id: string
          snapshot_date?: string
          total_sales?: number
        }
        Update: {
          created_at?: string
          deals_count?: number
          id?: string
          progress?: number
          rank?: number
          salesperson_id?: string
          score?: number | null
          season_id?: string
          snapshot_date?: string
          total_sales?: number
        }
        Relationships: [
          {
            foreignKeyName: "race_daily_snapshots_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "race_leaderboard_view"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "race_daily_snapshots_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "race_seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "race_daily_snapshots_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "race_spectator_view"
            referencedColumns: ["season_id"]
          },
        ]
      }
      race_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json
          salesperson_id: string
          season_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
          salesperson_id: string
          season_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
          salesperson_id?: string
          season_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "race_events_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "race_events_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "race_events_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "race_leaderboard_view"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "race_events_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "race_seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "race_events_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "race_spectator_view"
            referencedColumns: ["season_id"]
          },
        ]
      }
      race_overlay_telemetry: {
        Row: {
          created_at: string
          id: string
          last_viewed_at: string
          overlay_name: string
          user_id: string
          viewed_count: number
        }
        Insert: {
          created_at?: string
          id?: string
          last_viewed_at?: string
          overlay_name: string
          user_id: string
          viewed_count?: number
        }
        Update: {
          created_at?: string
          id?: string
          last_viewed_at?: string
          overlay_name?: string
          user_id?: string
          viewed_count?: number
        }
        Relationships: []
      }
      race_powerups: {
        Row: {
          collected_at: string
          effect_data: Json
          id: string
          powerup_type: string
          salesperson_id: string
          season_id: string
          used_at: string | null
        }
        Insert: {
          collected_at?: string
          effect_data?: Json
          id?: string
          powerup_type: string
          salesperson_id: string
          season_id: string
          used_at?: string | null
        }
        Update: {
          collected_at?: string
          effect_data?: Json
          id?: string
          powerup_type?: string
          salesperson_id?: string
          season_id?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "race_powerups_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "race_powerups_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "race_powerups_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "race_leaderboard_view"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "race_powerups_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "race_seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "race_powerups_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "race_spectator_view"
            referencedColumns: ["season_id"]
          },
        ]
      }
      race_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          reactor_user_id: string
          season_id: string | null
          target_car_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          reactor_user_id: string
          season_id?: string | null
          target_car_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          reactor_user_id?: string
          season_id?: string | null
          target_car_id?: string
        }
        Relationships: []
      }
      race_rivalries_persistent: {
        Row: {
          car_id: string
          created_at: string
          id: string
          rival_car_id: string
          season_id: string
          updated_at: string
        }
        Insert: {
          car_id: string
          created_at?: string
          id?: string
          rival_car_id: string
          season_id: string
          updated_at?: string
        }
        Update: {
          car_id?: string
          created_at?: string
          id?: string
          rival_car_id?: string
          season_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "race_rivalries_persistent_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "race_cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "race_rivalries_persistent_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "race_leaderboard_view"
            referencedColumns: ["car_id"]
          },
          {
            foreignKeyName: "race_rivalries_persistent_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "race_spectator_view"
            referencedColumns: ["car_id"]
          },
          {
            foreignKeyName: "race_rivalries_persistent_rival_car_id_fkey"
            columns: ["rival_car_id"]
            isOneToOne: false
            referencedRelation: "race_cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "race_rivalries_persistent_rival_car_id_fkey"
            columns: ["rival_car_id"]
            isOneToOne: false
            referencedRelation: "race_leaderboard_view"
            referencedColumns: ["car_id"]
          },
          {
            foreignKeyName: "race_rivalries_persistent_rival_car_id_fkey"
            columns: ["rival_car_id"]
            isOneToOne: false
            referencedRelation: "race_spectator_view"
            referencedColumns: ["car_id"]
          },
          {
            foreignKeyName: "race_rivalries_persistent_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "race_leaderboard_view"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "race_rivalries_persistent_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "race_seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "race_rivalries_persistent_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "race_spectator_view"
            referencedColumns: ["season_id"]
          },
        ]
      }
      race_scoring_rules: {
        Row: {
          created_at: string
          id: string
          label: string | null
          metric_code: string
          points_per_unit: number
          season_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string | null
          metric_code: string
          points_per_unit?: number
          season_id: string
          weight?: number
        }
        Update: {
          created_at?: string
          id?: string
          label?: string | null
          metric_code?: string
          points_per_unit?: number
          season_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "race_scoring_rules_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "race_leaderboard_view"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "race_scoring_rules_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "race_seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "race_scoring_rules_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "race_spectator_view"
            referencedColumns: ["season_id"]
          },
        ]
      }
      race_seasons: {
        Row: {
          created_at: string
          end_date: string
          goal_amount: number
          id: string
          name: string
          role_type: string
          start_date: string
          status: string
          track_type: string
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          created_at?: string
          end_date: string
          goal_amount?: number
          id?: string
          name: string
          role_type?: string
          start_date: string
          status?: string
          track_type?: string
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string
          end_date?: string
          goal_amount?: number
          id?: string
          name?: string
          role_type?: string
          start_date?: string
          status?: string
          track_type?: string
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "race_seasons_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "race_seasons_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      race_team_members: {
        Row: {
          car_id: string
          id: string
          joined_at: string
          team_id: string
        }
        Insert: {
          car_id: string
          id?: string
          joined_at?: string
          team_id: string
        }
        Update: {
          car_id?: string
          id?: string
          joined_at?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "race_team_members_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "race_cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "race_team_members_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "race_leaderboard_view"
            referencedColumns: ["car_id"]
          },
          {
            foreignKeyName: "race_team_members_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "race_spectator_view"
            referencedColumns: ["car_id"]
          },
          {
            foreignKeyName: "race_team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "race_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      race_teams: {
        Row: {
          color_primary: string
          color_secondary: string
          created_at: string
          emoji: string | null
          id: string
          name: string
          season_id: string
          updated_at: string
        }
        Insert: {
          color_primary?: string
          color_secondary?: string
          created_at?: string
          emoji?: string | null
          id?: string
          name: string
          season_id: string
          updated_at?: string
        }
        Update: {
          color_primary?: string
          color_secondary?: string
          created_at?: string
          emoji?: string | null
          id?: string
          name?: string
          season_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "race_teams_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "race_leaderboard_view"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "race_teams_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "race_seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "race_teams_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "race_spectator_view"
            referencedColumns: ["season_id"]
          },
        ]
      }
      race_unlocks: {
        Row: {
          id: string
          unlock_key: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          id?: string
          unlock_key: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          id?: string
          unlock_key?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      race_user_daily_checkins: {
        Row: {
          checkin_date: string
          created_at: string
          id: string
          reward_granted: boolean
          season_id: string
          streak_days: number
          user_id: string
        }
        Insert: {
          checkin_date?: string
          created_at?: string
          id?: string
          reward_granted?: boolean
          season_id: string
          streak_days?: number
          user_id: string
        }
        Update: {
          checkin_date?: string
          created_at?: string
          id?: string
          reward_granted?: boolean
          season_id?: string
          streak_days?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "race_user_daily_checkins_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "race_leaderboard_view"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "race_user_daily_checkins_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "race_seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "race_user_daily_checkins_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "race_spectator_view"
            referencedColumns: ["season_id"]
          },
        ]
      }
      race_user_preferences: {
        Row: {
          audio_muted: boolean
          calm_mode: boolean
          created_at: string
          id: string
          tour_completed: boolean
          updated_at: string
          user_id: string
          view_mode: string
        }
        Insert: {
          audio_muted?: boolean
          calm_mode?: boolean
          created_at?: string
          id?: string
          tour_completed?: boolean
          updated_at?: string
          user_id: string
          view_mode?: string
        }
        Update: {
          audio_muted?: boolean
          calm_mode?: boolean
          created_at?: string
          id?: string
          tour_completed?: boolean
          updated_at?: string
          user_id?: string
          view_mode?: string
        }
        Relationships: []
      }
      rank_change_notifications: {
        Row: {
          context: string | null
          created_at: string
          id: string
          is_read: boolean | null
          new_rank: number
          old_rank: number
          overtaken_by_id: string
          salesperson_id: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          new_rank: number
          old_rank: number
          overtaken_by_id: string
          salesperson_id: string
        }
        Update: {
          context?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          new_rank?: number
          old_rank?: number
          overtaken_by_id?: string
          salesperson_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rank_change_notifications_overtaken_by_id_fkey"
            columns: ["overtaken_by_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rank_change_notifications_overtaken_by_id_fkey"
            columns: ["overtaken_by_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rank_change_notifications_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rank_change_notifications_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      ranking_notifications: {
        Row: {
          created_at: string
          gap_to_first: number
          gap_to_next: number
          id: string
          message: string
          next_competitor_name: string | null
          period_start: string
          rank: number
          read_at: string | null
          salesperson_id: string
          total_sales: number
        }
        Insert: {
          created_at?: string
          gap_to_first?: number
          gap_to_next?: number
          id?: string
          message: string
          next_competitor_name?: string | null
          period_start: string
          rank: number
          read_at?: string | null
          salesperson_id: string
          total_sales?: number
        }
        Update: {
          created_at?: string
          gap_to_first?: number
          gap_to_next?: number
          id?: string
          message?: string
          next_competitor_name?: string | null
          period_start?: string
          rank?: number
          read_at?: string | null
          salesperson_id?: string
          total_sales?: number
        }
        Relationships: [
          {
            foreignKeyName: "ranking_notifications_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_notifications_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limit_logs: {
        Row: {
          action: string
          blocked: boolean | null
          created_at: string | null
          id: string
          identifier: string
          identifier_type: string
          request_count: number | null
          window_end: string | null
          window_start: string | null
        }
        Insert: {
          action: string
          blocked?: boolean | null
          created_at?: string | null
          id?: string
          identifier: string
          identifier_type?: string
          request_count?: number | null
          window_end?: string | null
          window_start?: string | null
        }
        Update: {
          action?: string
          blocked?: boolean | null
          created_at?: string | null
          id?: string
          identifier?: string
          identifier_type?: string
          request_count?: number | null
          window_end?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      rate_limit_settings: {
        Row: {
          action: string
          block_duration_seconds: number
          created_at: string | null
          id: string
          is_active: boolean | null
          max_requests: number
          updated_at: string | null
          window_seconds: number
        }
        Insert: {
          action: string
          block_duration_seconds?: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_requests?: number
          updated_at?: string | null
          window_seconds?: number
        }
        Update: {
          action?: string
          block_duration_seconds?: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_requests?: number
          updated_at?: string | null
          window_seconds?: number
        }
        Relationships: []
      }
      reauthentication_requests: {
        Row: {
          action_type: string
          created_at: string | null
          expires_at: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
          verified: boolean | null
          verified_at: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
          verified?: boolean | null
          verified_at?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
          verified?: boolean | null
          verified_at?: string | null
        }
        Relationships: []
      }
      renewals: {
        Row: {
          account_id: string
          auto_renew: boolean
          contract_value: number
          created_at: string
          currency: string
          id: string
          notes: string | null
          notice_period_days: number
          owner_salesperson_id: string | null
          renewal_date: string
          status: Database["public"]["Enums"]["renewal_status"]
          updated_at: string
        }
        Insert: {
          account_id: string
          auto_renew?: boolean
          contract_value?: number
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          notice_period_days?: number
          owner_salesperson_id?: string | null
          renewal_date: string
          status?: Database["public"]["Enums"]["renewal_status"]
          updated_at?: string
        }
        Update: {
          account_id?: string
          auto_renew?: boolean
          contract_value?: number
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          notice_period_days?: number
          owner_salesperson_id?: string | null
          renewal_date?: string
          status?: Database["public"]["Enums"]["renewal_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "renewals_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "renewals_owner_salesperson_id_fkey"
            columns: ["owner_salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "renewals_owner_salesperson_id_fkey"
            columns: ["owner_salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      report_embed_tokens: {
        Row: {
          allowed_origins: string[]
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          last_viewed_at: string | null
          report_id: string
          revoked: boolean
          token: string
          view_count: number
        }
        Insert: {
          allowed_origins?: string[]
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          last_viewed_at?: string | null
          report_id: string
          revoked?: boolean
          token: string
          view_count?: number
        }
        Update: {
          allowed_origins?: string[]
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          last_viewed_at?: string | null
          report_id?: string
          revoked?: boolean
          token?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "report_embed_tokens_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "custom_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_executions: {
        Row: {
          duration_ms: number | null
          error_message: string | null
          executed_at: string
          file_url: string | null
          id: string
          recipients_sent: string[] | null
          report_id: string
          rows_count: number | null
          schedule_id: string | null
          status: string
        }
        Insert: {
          duration_ms?: number | null
          error_message?: string | null
          executed_at?: string
          file_url?: string | null
          id?: string
          recipients_sent?: string[] | null
          report_id: string
          rows_count?: number | null
          schedule_id?: string | null
          status?: string
        }
        Update: {
          duration_ms?: number | null
          error_message?: string | null
          executed_at?: string
          file_url?: string | null
          id?: string
          recipients_sent?: string[] | null
          report_id?: string
          rows_count?: number | null
          schedule_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_executions_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "custom_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_executions_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "report_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      report_schedules: {
        Row: {
          created_at: string
          created_by: string
          day_of_month: number | null
          day_of_week: number | null
          format: string
          frequency: string
          id: string
          is_active: boolean
          last_run_at: string | null
          next_run_at: string | null
          recipients: string[]
          report_id: string
          time_of_day: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          day_of_month?: number | null
          day_of_week?: number | null
          format?: string
          frequency: string
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          next_run_at?: string | null
          recipients?: string[]
          report_id: string
          time_of_day?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          day_of_month?: number | null
          day_of_week?: number | null
          format?: string
          frequency?: string
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          next_run_at?: string | null
          recipients?: string[]
          report_id?: string
          time_of_day?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_schedules_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "custom_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_forecasts: {
        Row: {
          ai_summary: string | null
          best_case_amount: number
          calculated_at: string
          commit_amount: number
          confidence_score: number
          created_at: string
          deals_count: number
          factors: Json
          gap_to_goal: number
          goal_amount: number
          id: string
          model_version: string | null
          owner_id: string | null
          period_end: string
          period_start: string
          period_type: string
          updated_at: string
          upside_amount: number
          weighted_pipeline: number
        }
        Insert: {
          ai_summary?: string | null
          best_case_amount?: number
          calculated_at?: string
          commit_amount?: number
          confidence_score?: number
          created_at?: string
          deals_count?: number
          factors?: Json
          gap_to_goal?: number
          goal_amount?: number
          id?: string
          model_version?: string | null
          owner_id?: string | null
          period_end: string
          period_start: string
          period_type: string
          updated_at?: string
          upside_amount?: number
          weighted_pipeline?: number
        }
        Update: {
          ai_summary?: string | null
          best_case_amount?: number
          calculated_at?: string
          commit_amount?: number
          confidence_score?: number
          created_at?: string
          deals_count?: number
          factors?: Json
          gap_to_goal?: number
          goal_amount?: number
          id?: string
          model_version?: string | null
          owner_id?: string | null
          period_end?: string
          period_start?: string
          period_type?: string
          updated_at?: string
          upside_amount?: number
          weighted_pipeline?: number
        }
        Relationships: [
          {
            foreignKeyName: "revenue_forecasts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_forecasts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          id?: string
          permission_id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          account_id: string | null
          amount: number
          broadcast_sent_at: string | null
          category: string
          client_name: string
          created_at: string
          forecast_category:
            | Database["public"]["Enums"]["forecast_category"]
            | null
          id: string
          pipeline_id: string | null
          product_name: string
          salesperson_id: string | null
          source: string | null
          status: string
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          broadcast_sent_at?: string | null
          category?: string
          client_name: string
          created_at?: string
          forecast_category?:
            | Database["public"]["Enums"]["forecast_category"]
            | null
          id?: string
          pipeline_id?: string | null
          product_name: string
          salesperson_id?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          broadcast_sent_at?: string | null
          category?: string
          client_name?: string
          created_at?: string
          forecast_category?:
            | Database["public"]["Enums"]["forecast_category"]
            | null
          id?: string
          pipeline_id?: string | null
          product_name?: string
          salesperson_id?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_battles: {
        Row: {
          battle_type: string
          created_at: string
          created_by: string | null
          ends_at: string
          id: string
          metric: string
          starts_at: string
          status: string
          target_value: number | null
          title: string
          winner_id: string | null
          xp_reward: number
        }
        Insert: {
          battle_type?: string
          created_at?: string
          created_by?: string | null
          ends_at: string
          id?: string
          metric?: string
          starts_at?: string
          status?: string
          target_value?: number | null
          title: string
          winner_id?: string | null
          xp_reward?: number
        }
        Update: {
          battle_type?: string
          created_at?: string
          created_by?: string | null
          ends_at?: string
          id?: string
          metric?: string
          starts_at?: string
          status?: string
          target_value?: number | null
          title?: string
          winner_id?: string | null
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_battles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_battles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_battles_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_battles_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_enablement_assets: {
        Row: {
          asset_type: string
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          file_url: string | null
          funnel_stage: string | null
          id: string
          is_active: boolean
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          asset_type?: string
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_url?: string | null
          funnel_stage?: string | null
          id?: string
          is_active?: boolean
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          asset_type?: string
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_url?: string | null
          funnel_stage?: string | null
          id?: string
          is_active?: boolean
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      sales_goals: {
        Row: {
          created_at: string
          goal_amount: number
          id: string
          month: string
          salesperson_id: string
        }
        Insert: {
          created_at?: string
          goal_amount?: number
          id?: string
          month: string
          salesperson_id: string
        }
        Update: {
          created_at?: string
          goal_amount?: number
          id?: string
          month?: string
          salesperson_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_goals_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_goals_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_streaks: {
        Row: {
          current_streak: number
          id: string
          last_sale_date: string | null
          longest_streak: number
          salesperson_id: string
          updated_at: string
          xp_multiplier: number
        }
        Insert: {
          current_streak?: number
          id?: string
          last_sale_date?: string | null
          longest_streak?: number
          salesperson_id: string
          updated_at?: string
          xp_multiplier?: number
        }
        Update: {
          current_streak?: number
          id?: string
          last_sale_date?: string | null
          longest_streak?: number
          salesperson_id?: string
          updated_at?: string
          xp_multiplier?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_streaks_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: true
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_streaks_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: true
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_territories: {
        Row: {
          conquered_at: string | null
          created_at: string
          current_owner_id: string | null
          id: string
          is_contested: boolean
          territory_name: string
          territory_type: string
          total_deals: number
          total_revenue: number
          updated_at: string
        }
        Insert: {
          conquered_at?: string | null
          created_at?: string
          current_owner_id?: string | null
          id?: string
          is_contested?: boolean
          territory_name: string
          territory_type?: string
          total_deals?: number
          total_revenue?: number
          updated_at?: string
        }
        Update: {
          conquered_at?: string | null
          created_at?: string
          current_owner_id?: string | null
          id?: string
          is_contested?: boolean
          territory_name?: string
          territory_type?: string
          total_deals?: number
          total_revenue?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_territories_current_owner_id_fkey"
            columns: ["current_owner_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_territories_current_owner_id_fkey"
            columns: ["current_owner_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      salespeople: {
        Row: {
          auth_user_id: string | null
          avatar_url: string | null
          commission_rate: number
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          role: Database["public"]["Enums"]["salesperson_role"]
          score_total: number
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          avatar_url?: string | null
          commission_rate?: number
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          role?: Database["public"]["Enums"]["salesperson_role"]
          score_total?: number
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          avatar_url?: string | null
          commission_rate?: number
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          role?: Database["public"]["Enums"]["salesperson_role"]
          score_total?: number
          updated_at?: string
        }
        Relationships: []
      }
      salesperson_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          is_showcase: boolean
          salesperson_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          is_showcase?: boolean
          salesperson_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          is_showcase?: boolean
          salesperson_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "salesperson_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "collectible_badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salesperson_badges_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salesperson_badges_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      salesperson_coaching_aggregates: {
        Row: {
          avg_objections: number
          avg_overall: number
          avg_questions: number
          avg_sentiment: number
          avg_talk: number
          calls_analyzed: number
          id: string
          last_calculated_at: string
          period_end: string
          period_start: string
          salesperson_id: string
          top_recurring_gap: string | null
          trend_delta: number
          trend_direction: string
        }
        Insert: {
          avg_objections?: number
          avg_overall?: number
          avg_questions?: number
          avg_sentiment?: number
          avg_talk?: number
          calls_analyzed?: number
          id?: string
          last_calculated_at?: string
          period_end: string
          period_start: string
          salesperson_id: string
          top_recurring_gap?: string | null
          trend_delta?: number
          trend_direction?: string
        }
        Update: {
          avg_objections?: number
          avg_overall?: number
          avg_questions?: number
          avg_sentiment?: number
          avg_talk?: number
          calls_analyzed?: number
          id?: string
          last_calculated_at?: string
          period_end?: string
          period_start?: string
          salesperson_id?: string
          top_recurring_gap?: string | null
          trend_delta?: number
          trend_direction?: string
        }
        Relationships: []
      }
      salesperson_custom_field_values: {
        Row: {
          boolean_value: boolean | null
          field_id: string
          id: string
          numeric_value: number | null
          salesperson_id: string
          text_value: string | null
          updated_at: string
        }
        Insert: {
          boolean_value?: boolean | null
          field_id: string
          id?: string
          numeric_value?: number | null
          salesperson_id: string
          text_value?: string | null
          updated_at?: string
        }
        Update: {
          boolean_value?: boolean | null
          field_id?: string
          id?: string
          numeric_value?: number | null
          salesperson_id?: string
          text_value?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "salesperson_custom_field_values_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "team_custom_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salesperson_custom_field_values_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salesperson_custom_field_values_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      salesperson_leagues: {
        Row: {
          created_at: string
          demoted_at: string | null
          id: string
          league: Database["public"]["Enums"]["sales_league"]
          points: number
          promoted_at: string | null
          salesperson_id: string
          season_number: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          demoted_at?: string | null
          id?: string
          league?: Database["public"]["Enums"]["sales_league"]
          points?: number
          promoted_at?: string | null
          salesperson_id: string
          season_number?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          demoted_at?: string | null
          id?: string
          league?: Database["public"]["Enums"]["sales_league"]
          points?: number
          promoted_at?: string | null
          salesperson_id?: string
          season_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "salesperson_leagues_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salesperson_leagues_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      salesperson_preferences: {
        Row: {
          ai_assistant_avatar: string | null
          ai_assistant_name: string
          created_at: string
          id: string
          response_mode: string
          salesperson_id: string
          updated_at: string
          voice_id: string | null
          voice_name: string | null
        }
        Insert: {
          ai_assistant_avatar?: string | null
          ai_assistant_name?: string
          created_at?: string
          id?: string
          response_mode?: string
          salesperson_id: string
          updated_at?: string
          voice_id?: string | null
          voice_name?: string | null
        }
        Update: {
          ai_assistant_avatar?: string | null
          ai_assistant_name?: string
          created_at?: string
          id?: string
          response_mode?: string
          salesperson_id?: string
          updated_at?: string
          voice_id?: string | null
          voice_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salesperson_preferences_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: true
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salesperson_preferences_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: true
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      salesperson_xp: {
        Row: {
          created_at: string
          current_level: number
          id: string
          salesperson_id: string
          total_xp: number
          updated_at: string
          xp_to_next_level: number
        }
        Insert: {
          created_at?: string
          current_level?: number
          id?: string
          salesperson_id: string
          total_xp?: number
          updated_at?: string
          xp_to_next_level?: number
        }
        Update: {
          created_at?: string
          current_level?: number
          id?: string
          salesperson_id?: string
          total_xp?: number
          updated_at?: string
          xp_to_next_level?: number
        }
        Relationships: [
          {
            foreignKeyName: "salesperson_xp_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: true
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salesperson_xp_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: true
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_filters: {
        Row: {
          created_at: string
          entity_type: string
          filters: Json
          id: string
          is_default: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_type: string
          filters?: Json
          id?: string
          is_default?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_type?: string
          filters?: Json
          id?: string
          is_default?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scheduled_report_runs: {
        Row: {
          error_message: string | null
          file_path: string | null
          finished_at: string | null
          id: string
          rows_count: number | null
          schedule_id: string
          started_at: string
          status: string
        }
        Insert: {
          error_message?: string | null
          file_path?: string | null
          finished_at?: string | null
          id?: string
          rows_count?: number | null
          schedule_id: string
          started_at?: string
          status?: string
        }
        Update: {
          error_message?: string | null
          file_path?: string | null
          finished_at?: string | null
          id?: string
          rows_count?: number | null
          schedule_id?: string
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_report_runs_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "scheduled_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_reports: {
        Row: {
          created_at: string
          created_by: string
          day_of_month: number | null
          day_of_week: number | null
          enabled: boolean
          format: string
          frequency: string
          hour_of_day: number
          id: string
          last_run_at: string | null
          name: string
          next_run_at: string | null
          recipients: string[]
          report_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          day_of_month?: number | null
          day_of_week?: number | null
          enabled?: boolean
          format?: string
          frequency?: string
          hour_of_day?: number
          id?: string
          last_run_at?: string | null
          name: string
          next_run_at?: string | null
          recipients?: string[]
          report_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          day_of_month?: number | null
          day_of_week?: number | null
          enabled?: boolean
          format?: string
          frequency?: string
          hour_of_day?: number
          id?: string
          last_run_at?: string | null
          name?: string
          next_run_at?: string | null
          recipients?: string[]
          report_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_reports_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "custom_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_sends: {
        Row: {
          channel: string
          created_at: string
          error: string | null
          id: string
          optimization_source: string
          owner_id: string
          payload: Json
          sale_id: string
          scheduled_for: string
          sent_at: string | null
          status: string
        }
        Insert: {
          channel: string
          created_at?: string
          error?: string | null
          id?: string
          optimization_source?: string
          owner_id: string
          payload?: Json
          sale_id: string
          scheduled_for: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          channel?: string
          created_at?: string
          error?: string | null
          id?: string
          optimization_source?: string
          owner_id?: string
          payload?: Json
          sale_id?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_sends_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      score_change_logs: {
        Row: {
          api_token_id: string | null
          change_value: number
          changed_by: string
          created_at: string
          field_name: string
          id: string
          new_value: number
          old_value: number
          operation: string
          salesperson_id: string
        }
        Insert: {
          api_token_id?: string | null
          change_value?: number
          changed_by?: string
          created_at?: string
          field_name?: string
          id?: string
          new_value?: number
          old_value?: number
          operation: string
          salesperson_id: string
        }
        Update: {
          api_token_id?: string | null
          change_value?: number
          changed_by?: string
          created_at?: string
          field_name?: string
          id?: string
          new_value?: number
          old_value?: number
          operation?: string
          salesperson_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "score_change_logs_api_token_id_fkey"
            columns: ["api_token_id"]
            isOneToOne: false
            referencedRelation: "api_tokens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_change_logs_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_change_logs_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      sdr_alert_history: {
        Row: {
          admin_emails: string[]
          created_at: string
          id: string
          sdr_details: Json
          sdrs_notified: number
          threshold_used: number
          triggered_by: string | null
        }
        Insert: {
          admin_emails?: string[]
          created_at?: string
          id?: string
          sdr_details?: Json
          sdrs_notified?: number
          threshold_used?: number
          triggered_by?: string | null
        }
        Update: {
          admin_emails?: string[]
          created_at?: string
          id?: string
          sdr_details?: Json
          sdrs_notified?: number
          threshold_used?: number
          triggered_by?: string | null
        }
        Relationships: []
      }
      security_alert_history: {
        Row: {
          access_count: number
          alert_type: string
          created_at: string
          id: string
          recipients: string[]
          threshold_used: number
          time_window_hours: number
        }
        Insert: {
          access_count: number
          alert_type?: string
          created_at?: string
          id?: string
          recipients: string[]
          threshold_used: number
          time_window_hours: number
        }
        Update: {
          access_count?: number
          alert_type?: string
          created_at?: string
          id?: string
          recipients?: string[]
          threshold_used?: number
          time_window_hours?: number
        }
        Relationships: []
      }
      security_alert_settings: {
        Row: {
          cooldown_hours: number
          created_at: string
          id: string
          spike_threshold: number
          time_window_hours: number
          updated_at: string
        }
        Insert: {
          cooldown_hours?: number
          created_at?: string
          id?: string
          spike_threshold?: number
          time_window_hours?: number
          updated_at?: string
        }
        Update: {
          cooldown_hours?: number
          created_at?: string
          id?: string
          spike_threshold?: number
          time_window_hours?: number
          updated_at?: string
        }
        Relationships: []
      }
      semantic_index: {
        Row: {
          content: string
          content_hash: string | null
          embedding: string | null
          entity_id: string
          entity_type: string
          id: string
          metadata: Json
          salesperson_id: string | null
          source_updated_at: string | null
          updated_at: string
        }
        Insert: {
          content: string
          content_hash?: string | null
          embedding?: string | null
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json
          salesperson_id?: string | null
          source_updated_at?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          content_hash?: string | null
          embedding?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json
          salesperson_id?: string | null
          source_updated_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      send_time_profiles: {
        Row: {
          best_dow: number
          best_hour: number
          confidence: number
          created_at: string
          dow_distribution: Json
          hour_distribution: Json
          id: string
          last_calculated_at: string
          sale_id: string
          sample_size: number
          tz: string
        }
        Insert: {
          best_dow?: number
          best_hour?: number
          confidence?: number
          created_at?: string
          dow_distribution?: Json
          hour_distribution?: Json
          id?: string
          last_calculated_at?: string
          sale_id: string
          sample_size?: number
          tz?: string
        }
        Update: {
          best_dow?: number
          best_hour?: number
          confidence?: number
          created_at?: string
          dow_distribution?: Json
          hour_distribution?: Json
          id?: string
          last_calculated_at?: string
          sale_id?: string
          sample_size?: number
          tz?: string
        }
        Relationships: [
          {
            foreignKeyName: "send_time_profiles_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: true
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sequence_enrollments: {
        Row: {
          auto_pause_reason: string | null
          auto_paused_at: string | null
          completed_at: string | null
          contact_id: string
          contact_type: string
          created_at: string
          current_step: number
          enrolled_by: string | null
          exit_reason: string | null
          id: string
          last_executed_at: string | null
          metadata: Json
          next_action_at: string | null
          optimized_for_at: string | null
          sequence_id: string
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          auto_pause_reason?: string | null
          auto_paused_at?: string | null
          completed_at?: string | null
          contact_id: string
          contact_type: string
          created_at?: string
          current_step?: number
          enrolled_by?: string | null
          exit_reason?: string | null
          id?: string
          last_executed_at?: string | null
          metadata?: Json
          next_action_at?: string | null
          optimized_for_at?: string | null
          sequence_id: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          auto_pause_reason?: string | null
          auto_paused_at?: string | null
          completed_at?: string | null
          contact_id?: string
          contact_type?: string
          created_at?: string
          current_step?: number
          enrolled_by?: string | null
          exit_reason?: string | null
          id?: string
          last_executed_at?: string | null
          metadata?: Json
          next_action_at?: string | null
          optimized_for_at?: string | null
          sequence_id?: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sequence_enrollments_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      sequence_step_assignments: {
        Row: {
          assigned_at: string
          enrollment_id: string
          id: string
          step_id: string
          variant_id: string | null
          variant_label: string | null
        }
        Insert: {
          assigned_at?: string
          enrollment_id: string
          id?: string
          step_id: string
          variant_id?: string | null
          variant_label?: string | null
        }
        Update: {
          assigned_at?: string
          enrollment_id?: string
          id?: string
          step_id?: string
          variant_id?: string | null
          variant_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sequence_step_assignments_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "sequence_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sequence_step_assignments_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "sequence_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sequence_step_assignments_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "sequence_step_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sequence_step_assignments_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "sequence_variant_performance"
            referencedColumns: ["variant_id"]
          },
        ]
      }
      sequence_step_executions: {
        Row: {
          channel: string | null
          created_at: string
          engagement: Json
          enrollment_id: string
          error_message: string | null
          executed_at: string
          id: string
          replied_at: string | null
          status: string
          step_id: string
          variant_id: string | null
        }
        Insert: {
          channel?: string | null
          created_at?: string
          engagement?: Json
          enrollment_id: string
          error_message?: string | null
          executed_at?: string
          id?: string
          replied_at?: string | null
          status: string
          step_id: string
          variant_id?: string | null
        }
        Update: {
          channel?: string | null
          created_at?: string
          engagement?: Json
          enrollment_id?: string
          error_message?: string | null
          executed_at?: string
          id?: string
          replied_at?: string | null
          status?: string
          step_id?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sequence_step_executions_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "sequence_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sequence_step_executions_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "sequence_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sequence_step_executions_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "sequence_step_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sequence_step_executions_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "sequence_variant_performance"
            referencedColumns: ["variant_id"]
          },
        ]
      }
      sequence_step_variants: {
        Row: {
          body: string | null
          created_at: string
          id: string
          label: string
          step_id: string
          subject: string | null
          traffic_weight: number
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          label: string
          step_id: string
          subject?: string | null
          traffic_weight?: number
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          label?: string
          step_id?: string
          subject?: string | null
          traffic_weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "sequence_step_variants_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "sequence_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      sequence_steps: {
        Row: {
          body: string | null
          channel: string
          conditions: Json
          created_at: string
          delay_days: number
          delay_hours: number
          id: string
          sequence_id: string
          step_order: number
          subject: string | null
          template_id: string | null
          whatsapp_template_id: string | null
        }
        Insert: {
          body?: string | null
          channel: string
          conditions?: Json
          created_at?: string
          delay_days?: number
          delay_hours?: number
          id?: string
          sequence_id: string
          step_order: number
          subject?: string | null
          template_id?: string | null
          whatsapp_template_id?: string | null
        }
        Update: {
          body?: string | null
          channel?: string
          conditions?: Json
          created_at?: string
          delay_days?: number
          delay_hours?: number
          id?: string
          sequence_id?: string
          step_order?: number
          subject?: string | null
          template_id?: string | null
          whatsapp_template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sequence_steps_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      sequences: {
        Row: {
          auto_pause_on_bounce: boolean
          auto_pause_on_reply: boolean
          channel_mix: string[]
          created_at: string
          description: string | null
          enabled: boolean
          exit_on_meeting: boolean
          exit_on_reply: boolean
          id: string
          name: string
          owner_id: string
          send_time_optimization: boolean
          updated_at: string
        }
        Insert: {
          auto_pause_on_bounce?: boolean
          auto_pause_on_reply?: boolean
          channel_mix?: string[]
          created_at?: string
          description?: string | null
          enabled?: boolean
          exit_on_meeting?: boolean
          exit_on_reply?: boolean
          id?: string
          name: string
          owner_id: string
          send_time_optimization?: boolean
          updated_at?: string
        }
        Update: {
          auto_pause_on_bounce?: boolean
          auto_pause_on_reply?: boolean
          channel_mix?: string[]
          created_at?: string
          description?: string | null
          enabled?: boolean
          exit_on_meeting?: boolean
          exit_on_reply?: boolean
          id?: string
          name?: string
          owner_id?: string
          send_time_optimization?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      skill_assessments: {
        Row: {
          created_at: string
          current_level: string
          factors: Json
          gap_count_30d: number
          gap_count_90d: number
          id: string
          last_assessed_at: string
          salesperson_id: string
          score: number
          skill: string
          trend: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_level?: string
          factors?: Json
          gap_count_30d?: number
          gap_count_90d?: number
          id?: string
          last_assessed_at?: string
          salesperson_id: string
          score?: number
          skill: string
          trend?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_level?: string
          factors?: Json
          gap_count_30d?: number
          gap_count_90d?: number
          id?: string
          last_assessed_at?: string
          salesperson_id?: string
          score?: number
          skill?: string
          trend?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_assessments_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_assessments_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_development_tracks: {
        Row: {
          ai_plan: string | null
          created_at: string
          current_level: string
          estimated_weeks: number
          id: string
          milestones: Json
          priority: number
          salesperson_id: string
          skill: string
          target_level: string
          updated_at: string
        }
        Insert: {
          ai_plan?: string | null
          created_at?: string
          current_level?: string
          estimated_weeks?: number
          id?: string
          milestones?: Json
          priority?: number
          salesperson_id: string
          skill: string
          target_level?: string
          updated_at?: string
        }
        Update: {
          ai_plan?: string | null
          created_at?: string
          current_level?: string
          estimated_weeks?: number
          id?: string
          milestones?: Json
          priority?: number
          salesperson_id?: string
          skill?: string
          target_level?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_development_tracks_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_development_tracks_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_policies: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          max_hours: number
          stage: string
          updated_at: string
          warning_hours: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          max_hours?: number
          stage: string
          updated_at?: string
          warning_hours?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          max_hours?: number
          stage?: string
          updated_at?: string
          warning_hours?: number
        }
        Relationships: []
      }
      sla_violations: {
        Row: {
          created_at: string
          detected_at: string
          hours_in_stage: number
          id: string
          metadata: Json | null
          policy_id: string | null
          resolved_at: string | null
          sale_id: string
          stage: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          detected_at?: string
          hours_in_stage?: number
          id?: string
          metadata?: Json | null
          policy_id?: string | null
          resolved_at?: string | null
          sale_id: string
          stage: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          detected_at?: string
          hours_in_stage?: number
          id?: string
          metadata?: Json | null
          policy_id?: string | null
          resolved_at?: string | null
          sale_id?: string
          stage?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sla_violations_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "sla_policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_violations_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_verification_codes: {
        Row: {
          code: string
          created_at: string | null
          expires_at: string
          id: string
          phone_number: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          expires_at: string
          id?: string
          phone_number: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          phone_number?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      squad_members: {
        Row: {
          added_at: string
          squad_id: string
          user_id: string
        }
        Insert: {
          added_at?: string
          squad_id: string
          user_id: string
        }
        Update: {
          added_at?: string
          squad_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "squad_members_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squads"
            referencedColumns: ["id"]
          },
        ]
      }
      squads: {
        Row: {
          color: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      stage_bottleneck_insights: {
        Row: {
          ai_summary: string | null
          calculated_at: string
          conversion_rate: number
          created_at: string
          id: string
          owner_id: string | null
          recommendations: Json
          severity: string
          stage: string
          top_loss_reasons: Json
          updated_at: string
        }
        Insert: {
          ai_summary?: string | null
          calculated_at?: string
          conversion_rate?: number
          created_at?: string
          id?: string
          owner_id?: string | null
          recommendations?: Json
          severity?: string
          stage: string
          top_loss_reasons?: Json
          updated_at?: string
        }
        Update: {
          ai_summary?: string | null
          calculated_at?: string
          conversion_rate?: number
          created_at?: string
          id?: string
          owner_id?: string | null
          recommendations?: Json
          severity?: string
          stage?: string
          top_loss_reasons?: Json
          updated_at?: string
        }
        Relationships: []
      }
      stage_conversion_metrics: {
        Row: {
          avg_transition_days: number
          calculated_at: string
          conversion_rate: number
          converted_count: number
          created_at: string
          entered_count: number
          from_stage: string
          id: string
          lost_count: number
          owner_id: string | null
          period_end: string
          period_start: string
          to_stage: string
          updated_at: string
        }
        Insert: {
          avg_transition_days?: number
          calculated_at?: string
          conversion_rate?: number
          converted_count?: number
          created_at?: string
          entered_count?: number
          from_stage: string
          id?: string
          lost_count?: number
          owner_id?: string | null
          period_end: string
          period_start: string
          to_stage: string
          updated_at?: string
        }
        Update: {
          avg_transition_days?: number
          calculated_at?: string
          conversion_rate?: number
          converted_count?: number
          created_at?: string
          entered_count?: number
          from_stage?: string
          id?: string
          lost_count?: number
          owner_id?: string | null
          period_end?: string
          period_start?: string
          to_stage?: string
          updated_at?: string
        }
        Relationships: []
      }
      stage_velocity_baselines: {
        Row: {
          avg_days: number
          calculated_at: string
          computed_at: string
          created_at: string
          id: string
          median_days: number
          owner_id: string | null
          p50_hours: number
          p75_days: number
          p75_hours: number
          p90_hours: number
          sample_size: number
          segment: string
          stage: string
          updated_at: string
        }
        Insert: {
          avg_days?: number
          calculated_at?: string
          computed_at?: string
          created_at?: string
          id?: string
          median_days?: number
          owner_id?: string | null
          p50_hours?: number
          p75_days?: number
          p75_hours?: number
          p90_hours?: number
          sample_size?: number
          segment?: string
          stage: string
          updated_at?: string
        }
        Update: {
          avg_days?: number
          calculated_at?: string
          computed_at?: string
          created_at?: string
          id?: string
          median_days?: number
          owner_id?: string | null
          p50_hours?: number
          p75_days?: number
          p75_hours?: number
          p90_hours?: number
          sample_size?: number
          segment?: string
          stage?: string
          updated_at?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          created_at: string
          id: string
          movement_type: string
          performed_by: string | null
          product_id: string | null
          quantity: number
          reason: string | null
          reference_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          movement_type: string
          performed_by?: string | null
          product_id?: string | null
          quantity: number
          reason?: string | null
          reference_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          movement_type?: string
          performed_by?: string | null
          product_id?: string | null
          quantity?: number
          reason?: string | null
          reference_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string | null
          product_id: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "supplier_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "supplier_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_orders: {
        Row: {
          actual_delivery: string | null
          created_at: string
          created_by: string | null
          expected_delivery: string | null
          id: string
          notes: string | null
          order_date: string | null
          order_number: string | null
          status: string | null
          supplier_id: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          actual_delivery?: string | null
          created_at?: string
          created_by?: string | null
          expected_delivery?: string | null
          id?: string
          notes?: string | null
          order_date?: string | null
          order_number?: string | null
          status?: string | null
          supplier_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Update: {
          actual_delivery?: string | null
          created_at?: string
          created_by?: string | null
          expected_delivery?: string | null
          id?: string
          notes?: string | null
          order_date?: string | null
          order_number?: string | null
          status?: string | null
          supplier_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_products: {
        Row: {
          created_at: string
          currency: string | null
          id: string
          is_preferred: boolean | null
          last_price_update: string | null
          min_order_quantity: number | null
          product_id: string | null
          supplier_id: string | null
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          id?: string
          is_preferred?: boolean | null
          last_price_update?: string | null
          min_order_quantity?: number | null
          product_id?: string | null
          supplier_id?: string | null
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          id?: string
          is_preferred?: boolean | null
          last_price_update?: string | null
          min_order_quantity?: number | null
          product_id?: string | null
          supplier_id?: string | null
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_risk_assessments: {
        Row: {
          assessed_by: string | null
          assessment_date: string
          created_at: string
          delivery_risk: number | null
          factors: Json | null
          financial_risk: number | null
          id: string
          overall_risk: number | null
          quality_risk: number | null
          recommendations: string | null
          risk_level: string | null
          supplier_id: string | null
        }
        Insert: {
          assessed_by?: string | null
          assessment_date?: string
          created_at?: string
          delivery_risk?: number | null
          factors?: Json | null
          financial_risk?: number | null
          id?: string
          overall_risk?: number | null
          quality_risk?: number | null
          recommendations?: string | null
          risk_level?: string | null
          supplier_id?: string | null
        }
        Update: {
          assessed_by?: string | null
          assessment_date?: string
          created_at?: string
          delivery_risk?: number | null
          factors?: Json | null
          financial_risk?: number | null
          id?: string
          overall_risk?: number | null
          quality_risk?: number | null
          recommendations?: string | null
          risk_level?: string | null
          supplier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_risk_assessments_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          category: string | null
          city: string | null
          cnpj: string | null
          contact_name: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          lead_time_days: number | null
          name: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          reliability_score: number | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          category?: string | null
          city?: string | null
          cnpj?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          lead_time_days?: number | null
          name: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          reliability_score?: number | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          category?: string | null
          city?: string | null
          cnpj?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          lead_time_days?: number | null
          name?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          reliability_score?: number | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          account_id: string
          assignee_email: string | null
          created_at: string
          description: string | null
          external_id: string | null
          id: string
          metadata: Json
          priority: Database["public"]["Enums"]["support_ticket_priority"]
          requester_email: string | null
          resolved_at: string | null
          sentiment: string | null
          source: string
          status: Database["public"]["Enums"]["support_ticket_status"]
          subject: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          account_id: string
          assignee_email?: string | null
          created_at?: string
          description?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json
          priority?: Database["public"]["Enums"]["support_ticket_priority"]
          requester_email?: string | null
          resolved_at?: string | null
          sentiment?: string | null
          source?: string
          status?: Database["public"]["Enums"]["support_ticket_status"]
          subject: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          assignee_email?: string | null
          created_at?: string
          description?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json
          priority?: Database["public"]["Enums"]["support_ticket_priority"]
          requester_email?: string | null
          resolved_at?: string | null
          sentiment?: string | null
          source?: string
          status?: Database["public"]["Enums"]["support_ticket_status"]
          subject?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      task_assignments: {
        Row: {
          assigned_by: string
          assigned_to: string
          catalog_id: string
          created_at: string
          due_date: string | null
          id: string
          parent_recurrence_id: string | null
          recurrence_rule: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          squad_id: string | null
          status: Database["public"]["Enums"]["task_assignment_status"]
          submission_note: string | null
          updated_at: string
          xp_granted: number | null
        }
        Insert: {
          assigned_by: string
          assigned_to: string
          catalog_id: string
          created_at?: string
          due_date?: string | null
          id?: string
          parent_recurrence_id?: string | null
          recurrence_rule?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          squad_id?: string | null
          status?: Database["public"]["Enums"]["task_assignment_status"]
          submission_note?: string | null
          updated_at?: string
          xp_granted?: number | null
        }
        Update: {
          assigned_by?: string
          assigned_to?: string
          catalog_id?: string
          created_at?: string
          due_date?: string | null
          id?: string
          parent_recurrence_id?: string | null
          recurrence_rule?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          squad_id?: string | null
          status?: Database["public"]["Enums"]["task_assignment_status"]
          submission_note?: string | null
          updated_at?: string
          xp_granted?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "task_assignments_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "task_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignments_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squads"
            referencedColumns: ["id"]
          },
        ]
      }
      task_catalog: {
        Row: {
          active: boolean
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          difficulty: Database["public"]["Enums"]["task_difficulty"]
          id: string
          title: string
          updated_at: string
          xp_reward: number
        }
        Insert: {
          active?: boolean
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["task_difficulty"]
          id?: string
          title: string
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["task_difficulty"]
          id?: string
          title?: string
          updated_at?: string
          xp_reward?: number
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string
          due_time: string | null
          id: string
          priority: Database["public"]["Enums"]["task_priority"]
          sale_id: string | null
          salesperson_id: string | null
          status: Database["public"]["Enums"]["task_status"]
          task_type: Database["public"]["Enums"]["task_type"]
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          due_time?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          sale_id?: string | null
          salesperson_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          task_type?: Database["public"]["Enums"]["task_type"]
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          due_time?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          sale_id?: string | null
          salesperson_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          task_type?: Database["public"]["Enums"]["task_type"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      team_closers: {
        Row: {
          closer_id: string
          created_at: string
          id: string
          team_id: string
        }
        Insert: {
          closer_id: string
          created_at?: string
          id?: string
          team_id: string
        }
        Update: {
          closer_id?: string
          created_at?: string
          id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_closers_closer_id_fkey"
            columns: ["closer_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_closers_closer_id_fkey"
            columns: ["closer_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_closers_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_custom_fields: {
        Row: {
          created_at: string
          field_key: string
          field_label: string
          field_type: string
          id: string
          is_active: boolean
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          field_key: string
          field_label: string
          field_type?: string
          id?: string
          is_active?: boolean
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          field_key?: string
          field_label?: string
          field_type?: string
          id?: string
          is_active?: boolean
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_custom_fields_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          inactivity_days: number
          is_active: boolean
          name: string
          sdr_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          inactivity_days?: number
          is_active?: boolean
          name: string
          sdr_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          inactivity_days?: number
          is_active?: boolean
          name?: string
          sdr_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_sdr_id_fkey"
            columns: ["sdr_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_sdr_id_fkey"
            columns: ["sdr_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      territory_history: {
        Row: {
          conquered_at: string | null
          created_at: string
          deals_count: number
          id: string
          lost_at: string | null
          revenue_contribution: number
          salesperson_id: string
          territory_id: string
        }
        Insert: {
          conquered_at?: string | null
          created_at?: string
          deals_count?: number
          id?: string
          lost_at?: string | null
          revenue_contribution?: number
          salesperson_id: string
          territory_id: string
        }
        Update: {
          conquered_at?: string | null
          created_at?: string
          deals_count?: number
          id?: string
          lost_at?: string | null
          revenue_contribution?: number
          salesperson_id?: string
          territory_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "territory_history_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "territory_history_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "territory_history_territory_id_fkey"
            columns: ["territory_id"]
            isOneToOne: false
            referencedRelation: "sales_territories"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_matches: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          match_order: number
          player1_id: string | null
          player1_score: number
          player2_id: string | null
          player2_score: number
          round_number: number
          started_at: string | null
          status: string
          tournament_id: string
          winner_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          match_order?: number
          player1_id?: string | null
          player1_score?: number
          player2_id?: string | null
          player2_score?: number
          round_number: number
          started_at?: string | null
          status?: string
          tournament_id: string
          winner_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          match_order?: number
          player1_id?: string | null
          player1_score?: number
          player2_id?: string | null
          player2_score?: number
          round_number?: number
          started_at?: string | null
          status?: string
          tournament_id?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_matches_player1_id_fkey"
            columns: ["player1_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_player1_id_fkey"
            columns: ["player1_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_player2_id_fkey"
            columns: ["player2_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_player2_id_fkey"
            columns: ["player2_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_participants: {
        Row: {
          created_at: string
          eliminated_in_round: number | null
          final_position: number | null
          id: string
          is_eliminated: boolean
          salesperson_id: string
          seed: number | null
          tournament_id: string
        }
        Insert: {
          created_at?: string
          eliminated_in_round?: number | null
          final_position?: number | null
          id?: string
          is_eliminated?: boolean
          salesperson_id: string
          seed?: number | null
          tournament_id: string
        }
        Update: {
          created_at?: string
          eliminated_in_round?: number | null
          final_position?: number | null
          id?: string
          is_eliminated?: boolean
          salesperson_id?: string
          seed?: number | null
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_participants_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_participants_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          bracket_type: string
          created_at: string
          created_by: string | null
          current_round: number
          description: string | null
          ends_at: string | null
          id: string
          metric_type: string
          name: string
          round_duration_days: number
          starts_at: string
          status: string
          total_rounds: number
          xp_reward: number
        }
        Insert: {
          bracket_type?: string
          created_at?: string
          created_by?: string | null
          current_round?: number
          description?: string | null
          ends_at?: string | null
          id?: string
          metric_type?: string
          name: string
          round_duration_days?: number
          starts_at: string
          status?: string
          total_rounds?: number
          xp_reward?: number
        }
        Update: {
          bracket_type?: string
          created_at?: string
          created_by?: string | null
          current_round?: number
          description?: string | null
          ends_at?: string | null
          id?: string
          metric_type?: string
          name?: string
          round_duration_days?: number
          starts_at?: string
          status?: string
          total_rounds?: number
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "tournaments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournaments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      twilio_call_sessions: {
        Row: {
          call_sid: string | null
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          from_number: string | null
          id: string
          owner_id: string
          price: number | null
          queue_item_id: string | null
          recording_sid: string | null
          recording_url: string | null
          sale_id: string | null
          started_at: string | null
          status: string
          to_number: string
        }
        Insert: {
          call_sid?: string | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          from_number?: string | null
          id?: string
          owner_id: string
          price?: number | null
          queue_item_id?: string | null
          recording_sid?: string | null
          recording_url?: string | null
          sale_id?: string | null
          started_at?: string | null
          status?: string
          to_number: string
        }
        Update: {
          call_sid?: string | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          from_number?: string | null
          id?: string
          owner_id?: string
          price?: number | null
          queue_item_id?: string | null
          recording_sid?: string | null
          recording_url?: string | null
          sale_id?: string | null
          started_at?: string | null
          status?: string
          to_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "twilio_call_sessions_queue_item_id_fkey"
            columns: ["queue_item_id"]
            isOneToOne: false
            referencedRelation: "dialer_queue_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "twilio_call_sessions_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      user_mfa_settings: {
        Row: {
          backup_codes: string[] | null
          backup_codes_generated_at: string | null
          created_at: string | null
          id: string
          phone_number: string | null
          phone_verified_at: string | null
          preferred_method: string | null
          sms_enabled: boolean | null
          totp_enabled: boolean | null
          totp_secret: string | null
          totp_verified_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          backup_codes_generated_at?: string | null
          created_at?: string | null
          id?: string
          phone_number?: string | null
          phone_verified_at?: string | null
          preferred_method?: string | null
          sms_enabled?: boolean | null
          totp_enabled?: boolean | null
          totp_secret?: string | null
          totp_verified_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          backup_codes_generated_at?: string | null
          created_at?: string | null
          id?: string
          phone_number?: string | null
          phone_verified_at?: string | null
          preferred_method?: string | null
          sms_enabled?: boolean | null
          totp_enabled?: boolean | null
          totp_secret?: string | null
          totp_verified_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      victory_feed: {
        Row: {
          created_at: string
          description: string | null
          event_type: string
          id: string
          metadata: Json | null
          salesperson_id: string
          title: string
          value: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          salesperson_id: string
          title: string
          value?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          salesperson_id?: string
          title?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "victory_feed_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "victory_feed_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      webauthn_challenges: {
        Row: {
          challenge: string
          created_at: string
          expires_at: string
          id: string
          type: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          challenge: string
          created_at?: string
          expires_at: string
          id?: string
          type: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          challenge?: string
          created_at?: string
          expires_at?: string
          id?: string
          type?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      webauthn_credentials: {
        Row: {
          backed_up: boolean | null
          counter: number
          created_at: string
          credential_id: string
          device_type: string | null
          friendly_name: string | null
          id: string
          last_used_at: string | null
          public_key: string
          transports: string[] | null
          user_id: string
        }
        Insert: {
          backed_up?: boolean | null
          counter?: number
          created_at?: string
          credential_id: string
          device_type?: string | null
          friendly_name?: string | null
          id?: string
          last_used_at?: string | null
          public_key: string
          transports?: string[] | null
          user_id: string
        }
        Update: {
          backed_up?: boolean | null
          counter?: number
          created_at?: string
          credential_id?: string
          device_type?: string | null
          friendly_name?: string | null
          id?: string
          last_used_at?: string | null
          public_key?: string
          transports?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      webhook_deliveries: {
        Row: {
          attempts: number
          created_at: string
          duration_ms: number | null
          error_message: string | null
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          response_status: number | null
          success: boolean
          webhook_id: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          event_type: string
          id?: string
          payload: Json
          response_body?: string | null
          response_status?: number | null
          success?: boolean
          webhook_id: string
        }
        Update: {
          attempts?: number
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          success?: boolean
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          created_at: string
          created_by: string | null
          events: string[]
          failure_count: number
          headers: Json | null
          id: string
          is_active: boolean
          last_failure_at: string | null
          last_success_at: string | null
          last_triggered_at: string | null
          name: string
          secret: string | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          events?: string[]
          failure_count?: number
          headers?: Json | null
          id?: string
          is_active?: boolean
          last_failure_at?: string | null
          last_success_at?: string | null
          last_triggered_at?: string | null
          name: string
          secret?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          events?: string[]
          failure_count?: number
          headers?: Json | null
          id?: string
          is_active?: boolean
          last_failure_at?: string | null
          last_success_at?: string | null
          last_triggered_at?: string | null
          name?: string
          secret?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      weekly_challenges: {
        Row: {
          challenge_type: string
          created_at: string
          description: string | null
          end_date: string
          id: string
          is_active: boolean
          start_date: string
          target_value: number
          title: string
          updated_at: string
          xp_reward: number
        }
        Insert: {
          challenge_type?: string
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean
          start_date: string
          target_value?: number
          title: string
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          challenge_type?: string
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean
          start_date?: string
          target_value?: number
          title?: string
          updated_at?: string
          xp_reward?: number
        }
        Relationships: []
      }
      weekly_matchups: {
        Row: {
          created_at: string
          id: string
          salesperson_a_id: string
          salesperson_b_id: string
          score_a: number
          score_b: number
          status: string
          week_start: string
          winner_id: string | null
          xp_reward: number
        }
        Insert: {
          created_at?: string
          id?: string
          salesperson_a_id: string
          salesperson_b_id: string
          score_a?: number
          score_b?: number
          status?: string
          week_start: string
          winner_id?: string | null
          xp_reward?: number
        }
        Update: {
          created_at?: string
          id?: string
          salesperson_a_id?: string
          salesperson_b_id?: string
          score_a?: number
          score_b?: number
          status?: string
          week_start?: string
          winner_id?: string | null
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "weekly_matchups_salesperson_a_id_fkey"
            columns: ["salesperson_a_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_matchups_salesperson_a_id_fkey"
            columns: ["salesperson_a_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_matchups_salesperson_b_id_fkey"
            columns: ["salesperson_b_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_matchups_salesperson_b_id_fkey"
            columns: ["salesperson_b_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_matchups_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_matchups_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      win_calibration_buckets: {
        Row: {
          actual_win_rate: number
          bucket_max: number
          bucket_min: number
          computed_at: string
          id: string
          sample_size: number
          segment: string
          stage: string
        }
        Insert: {
          actual_win_rate?: number
          bucket_max: number
          bucket_min: number
          computed_at?: string
          id?: string
          sample_size?: number
          segment?: string
          stage: string
        }
        Update: {
          actual_win_rate?: number
          bucket_max?: number
          bucket_min?: number
          computed_at?: string
          id?: string
          sample_size?: number
          segment?: string
          stage?: string
        }
        Relationships: []
      }
      win_loss_analyses: {
        Row: {
          amount: number | null
          analyzed_at: string
          competitor: string | null
          created_at: string
          cycle_days: number | null
          id: string
          lost_stage: string | null
          outcome: string
          primary_reason: string | null
          sale_id: string
          secondary_reasons: Json
          segment: string | null
        }
        Insert: {
          amount?: number | null
          analyzed_at?: string
          competitor?: string | null
          created_at?: string
          cycle_days?: number | null
          id?: string
          lost_stage?: string | null
          outcome: string
          primary_reason?: string | null
          sale_id: string
          secondary_reasons?: Json
          segment?: string | null
        }
        Update: {
          amount?: number | null
          analyzed_at?: string
          competitor?: string | null
          created_at?: string
          cycle_days?: number | null
          id?: string
          lost_stage?: string | null
          outcome?: string
          primary_reason?: string | null
          sale_id?: string
          secondary_reasons?: Json
          segment?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "win_loss_analyses_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: true
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      win_loss_insights: {
        Row: {
          created_at: string
          description: string
          evidence: Json
          id: string
          insight_type: string
          severity: string
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          evidence?: Json
          id?: string
          insight_type: string
          severity?: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          evidence?: Json
          id?: string
          insight_type?: string
          severity?: string
          title?: string
        }
        Relationships: []
      }
      win_loss_patterns: {
        Row: {
          avg_amount: number
          avg_cycle_days: number
          computed_at: string
          confidence: number
          frequency: number
          id: string
          label: string
          outcome: string | null
          pattern_type: string
          win_rate: number
        }
        Insert: {
          avg_amount?: number
          avg_cycle_days?: number
          computed_at?: string
          confidence?: number
          frequency?: number
          id?: string
          label: string
          outcome?: string | null
          pattern_type: string
          win_rate?: number
        }
        Update: {
          avg_amount?: number
          avg_cycle_days?: number
          computed_at?: string
          confidence?: number
          frequency?: number
          id?: string
          label?: string
          outcome?: string | null
          pattern_type?: string
          win_rate?: number
        }
        Relationships: []
      }
      win_probability_calibrations: {
        Row: {
          baseline_probability: number
          calculated_at: string
          calibrated_probability: number
          confidence: number
          historical_win_rate: number
          id: string
          sample_size: number
          scope: string
          scope_value: string | null
          stage: string
        }
        Insert: {
          baseline_probability?: number
          calculated_at?: string
          calibrated_probability?: number
          confidence?: number
          historical_win_rate?: number
          id?: string
          sample_size?: number
          scope: string
          scope_value?: string | null
          stage: string
        }
        Update: {
          baseline_probability?: number
          calculated_at?: string
          calibrated_probability?: number
          confidence?: number
          historical_win_rate?: number
          id?: string
          sample_size?: number
          scope?: string
          scope_value?: string | null
          stage?: string
        }
        Relationships: []
      }
      win_probability_deal_calibrations: {
        Row: {
          calibrated_probability: number
          calibration_delta: number | null
          computed_at: string
          confidence: string
          declared_probability: number
          flag: string
          historical_win_rate: number
          id: string
          owner_id: string | null
          sale_id: string
          sample_size: number
          segment: string
          stage: string
        }
        Insert: {
          calibrated_probability?: number
          calibration_delta?: number | null
          computed_at?: string
          confidence?: string
          declared_probability?: number
          flag?: string
          historical_win_rate?: number
          id?: string
          owner_id?: string | null
          sale_id: string
          sample_size?: number
          segment?: string
          stage: string
        }
        Update: {
          calibrated_probability?: number
          calibration_delta?: number | null
          computed_at?: string
          confidence?: string
          declared_probability?: number
          flag?: string
          historical_win_rate?: number
          id?: string
          owner_id?: string | null
          sale_id?: string
          sample_size?: number
          segment?: string
          stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "win_probability_deal_calibrations_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: true
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_executions: {
        Row: {
          duration_ms: number | null
          error_message: string | null
          finished_at: string | null
          id: string
          input_payload: Json | null
          started_at: string
          status: string
          step_log: Json
          triggered_by: string | null
          workflow_id: string
        }
        Insert: {
          duration_ms?: number | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          input_payload?: Json | null
          started_at?: string
          status?: string
          step_log?: Json
          triggered_by?: string | null
          workflow_id: string
        }
        Update: {
          duration_ms?: number | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          input_payload?: Json | null
          started_at?: string
          status?: string
          step_log?: Json
          triggered_by?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_rules: {
        Row: {
          action_config: Json
          action_type: string
          created_at: string
          description: string | null
          executions_count: number
          id: string
          is_active: boolean
          last_executed_at: string | null
          name: string
          salesperson_id: string | null
          trigger_config: Json
          trigger_type: string
          updated_at: string
        }
        Insert: {
          action_config?: Json
          action_type?: string
          created_at?: string
          description?: string | null
          executions_count?: number
          id?: string
          is_active?: boolean
          last_executed_at?: string | null
          name: string
          salesperson_id?: string | null
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
        }
        Update: {
          action_config?: Json
          action_type?: string
          created_at?: string
          description?: string | null
          executions_count?: number
          id?: string
          is_active?: boolean
          last_executed_at?: string | null
          name?: string
          salesperson_id?: string | null
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_rules_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_rules_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          edges: Json
          execution_count: number
          id: string
          is_active: boolean
          last_executed_at: string | null
          name: string
          nodes: Json
          trigger_config: Json
          trigger_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          edges?: Json
          execution_count?: number
          id?: string
          is_active?: boolean
          last_executed_at?: string | null
          name: string
          nodes?: Json
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          edges?: Json
          execution_count?: number
          id?: string
          is_active?: boolean
          last_executed_at?: string | null
          name?: string
          nodes?: Json
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      xp_adjustments: {
        Row: {
          adjusted_by: string
          amount: number
          created_at: string
          id: string
          reason: string
          related_assignment_id: string | null
          source: string
          user_id: string
        }
        Insert: {
          adjusted_by: string
          amount: number
          created_at?: string
          id?: string
          reason: string
          related_assignment_id?: string | null
          source?: string
          user_id: string
        }
        Update: {
          adjusted_by?: string
          amount?: number
          created_at?: string
          id?: string
          reason?: string
          related_assignment_id?: string | null
          source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xp_adjustments_related_assignment_id_fkey"
            columns: ["related_assignment_id"]
            isOneToOne: false
            referencedRelation: "task_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_history: {
        Row: {
          created_at: string
          description: string | null
          id: string
          salesperson_id: string
          source_id: string | null
          source_type: string
          xp_amount: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          salesperson_id: string
          source_id?: string | null
          source_type: string
          xp_amount: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          salesperson_id?: string
          source_id?: string | null
          source_type?: string
          xp_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "xp_history_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_history_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      call_sentiment_summary: {
        Row: {
          avg_score: number | null
          avg_score_client: number | null
          avg_score_salesperson: number | null
          negative_count: number | null
          positive_count: number | null
          recording_id: string | null
          segments_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "call_sentiment_timeline_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "call_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      client_purchase_seasonality: {
        Row: {
          avg_revenue: number | null
          client_id: string | null
          client_name: string | null
          day_of_week: number | null
          deal_count: number | null
          month_of_year: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
      coaching_impact_metrics: {
        Row: {
          coach_id: string | null
          completed_at: string | null
          delta_conversion: number | null
          delta_overall: number | null
          delta_ticket: number | null
          focus_skills: string[] | null
          outcome_rating: number | null
          post_avg_overall: number | null
          post_conversion: number | null
          post_ticket: number | null
          pre_avg_overall: number | null
          pre_conversion: number | null
          pre_ticket: number | null
          salesperson_id: string | null
          session_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coaching_sessions_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaching_sessions_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_best_send_window: {
        Row: {
          clicks: number | null
          contact_id: string | null
          contact_type: string | null
          day_of_week: number | null
          hour_of_day: number | null
          opens: number | null
          rank: number | null
          replies: number | null
          score: number | null
        }
        Relationships: []
      }
      conversation_insights_summary: {
        Row: {
          avg_buying_signals: number | null
          avg_objections: number | null
          avg_risk_signals: number | null
          last_analysis_at: string | null
          mixed_count: number | null
          negative_count: number | null
          neutral_count: number | null
          positive_count: number | null
          total_analyses: number | null
          user_id: string | null
        }
        Relationships: []
      }
      engagement_score_leaderboard: {
        Row: {
          contact_id: string | null
          contact_name: string | null
          contact_type: string | null
          id: string | null
          last_signal_at: string | null
          owner_salesperson_id: string | null
          score: number | null
          tier: string | null
          total_clicks: number | null
          total_opens: number | null
          total_replies: number | null
          updated_at: string | null
        }
        Insert: {
          contact_id?: string | null
          contact_name?: never
          contact_type?: string | null
          id?: string | null
          last_signal_at?: string | null
          owner_salesperson_id?: never
          score?: number | null
          tier?: string | null
          total_clicks?: number | null
          total_opens?: number | null
          total_replies?: number | null
          updated_at?: string | null
        }
        Update: {
          contact_id?: string | null
          contact_name?: never
          contact_type?: string | null
          id?: string | null
          last_signal_at?: string | null
          owner_salesperson_id?: never
          score?: number | null
          tier?: string | null
          total_clicks?: number | null
          total_opens?: number | null
          total_replies?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      latest_briefing_view: {
        Row: {
          briefing_date: string | null
          created_at: string | null
          created_by: string | null
          generated_by: string | null
          headline: string | null
          id: string | null
          key_risks: Json | null
          key_wins: Json | null
          narrative: string | null
          pulse_score: number | null
          recommended_actions: Json | null
        }
        Relationships: []
      }
      race_leaderboard_view: {
        Row: {
          activities_count: number | null
          avatar_url: string | null
          car_id: string | null
          car_number: number | null
          car_style: string | null
          conversations_count: number | null
          deals_count: number | null
          new_clients_count: number | null
          nickname: string | null
          primary_color: string | null
          progress: number | null
          role_type: string | null
          salesperson_id: string | null
          salesperson_name: string | null
          score: number | null
          season_id: string | null
          secondary_color: string | null
          total_sales: number | null
        }
        Relationships: [
          {
            foreignKeyName: "race_cars_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: true
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "race_cars_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: true
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      race_rivalries_view: {
        Row: {
          last_swap_at: string | null
          rival_a: string | null
          rival_b: string | null
          season_id: string | null
          swap_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "race_events_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "race_leaderboard_view"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "race_events_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "race_seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "race_events_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "race_spectator_view"
            referencedColumns: ["season_id"]
          },
        ]
      }
      race_spectator_view: {
        Row: {
          avatar_url: string | null
          car_id: string | null
          car_number: number | null
          car_style: string | null
          deals_count: number | null
          nickname: string | null
          primary_color: string | null
          progress: number | null
          role_type: string | null
          salesperson_id: string | null
          salesperson_name: string | null
          score: number | null
          season_id: string | null
          secondary_color: string | null
          total_sales: number | null
        }
        Relationships: [
          {
            foreignKeyName: "race_cars_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: true
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "race_cars_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: true
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_forecast_view: {
        Row: {
          avg_cycle_days: number | null
          monthly_goal: number | null
          open_deals_count: number | null
          optimistic_30d: number | null
          pessimistic_30d: number | null
          realistic_30d: number | null
          salesperson_id: string | null
          total_open_pipeline: number | null
          weighted_forecast: number | null
          won_amount_90d: number | null
          won_count_90d: number | null
        }
        Relationships: []
      }
      salespeople_public: {
        Row: {
          avatar_url: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          role: Database["public"]["Enums"]["salesperson_role"] | null
        }
        Insert: {
          avatar_url?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          role?: Database["public"]["Enums"]["salesperson_role"] | null
        }
        Update: {
          avatar_url?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          role?: Database["public"]["Enums"]["salesperson_role"] | null
        }
        Relationships: []
      }
      sequence_variant_performance: {
        Row: {
          label: string | null
          replied: number | null
          reply_rate: number | null
          sent: number | null
          step_id: string | null
          variant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sequence_step_variants_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "sequence_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      v_pipeline_coverage_summary: {
        Row: {
          avg_ratio: number | null
          calculated_at: string | null
          health: string | null
          owner_id: string | null
          owner_key: string | null
          period_end: string | null
          period_start: string | null
          total_quota: number | null
          total_weighted: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_league_weekly_xp: {
        Args: { p_salesperson_id: string; p_xp: number }
        Returns: boolean
      }
      add_salesperson_xp: {
        Args: {
          p_salesperson_id: string
          p_source?: string
          p_xp_amount: number
        }
        Returns: boolean
      }
      append_agent_step: {
        Args: {
          _executed_by?: string
          _run_id: string
          _status?: string
          _tool_input: Json
          _tool_name: string
          _tool_output: Json
        }
        Returns: undefined
      }
      approve_agent_run: { Args: { _run_id: string }; Returns: undefined }
      assign_cadence_variant: { Args: { _ab_test_id: string }; Returns: string }
      assign_task_to_squad: {
        Args: {
          _catalog_id: string
          _due_date?: string
          _recurrence?: string
          _squad_id: string
        }
        Returns: number
      }
      auto_assign_lead: {
        Args: { _sale_id: string }
        Returns: {
          assigned_to: string
          rule_id: string
          strategy: string
        }[]
      }
      auto_pause_enrollment: {
        Args: { _enrollment_id: string; _reason?: string }
        Returns: undefined
      }
      auto_promote_sequence_winners: {
        Args: { _sequence_id: string }
        Returns: {
          promoted_label: string
          step_id: string
        }[]
      }
      bulk_approve_assignments: {
        Args: { _ids: string[]; _xp_overrides?: Json }
        Returns: number
      }
      bulk_recompute_engagement: {
        Args: { _owner_id?: string }
        Returns: number
      }
      calculate_account_score: {
        Args: { p_account_id: string }
        Returns: number
      }
      calculate_daily_challenge_streak: {
        Args: { p_salesperson_id: string }
        Returns: number
      }
      calculate_deal_health: {
        Args: { _sale_id: string }
        Returns: {
          health_label: string
          health_score: number
          negative_factors: Json
          positive_factors: Json
        }[]
      }
      check_rate_limit: {
        Args: { p_action: string; p_identifier: string }
        Returns: {
          allowed: boolean
          remaining: number
          reset_at: string
        }[]
      }
      check_sla_violations: {
        Args: never
        Returns: {
          new_violations: number
          new_warnings: number
          processed: number
        }[]
      }
      coaching_progress_by_salesperson: {
        Args: { _days?: number; _salesperson_id: string }
        Returns: {
          category: string
          count: number
          severity: string
          status: string
        }[]
      }
      complete_agent_run: {
        Args: {
          _error?: string
          _result: Json
          _run_id: string
          _status?: string
        }
        Returns: undefined
      }
      compute_cohort_retention: {
        Args: { _cohort_id: string; _periods?: number }
        Returns: {
          cohort_period: string
          customers: number
          period_offset: number
          retention_pct: number
        }[]
      }
      compute_customer_health_v2: {
        Args: { _account_id: string }
        Returns: {
          account_id: string
          csat_factor: number
          health_score: number
          nps_factor: number
          recommended_action: string
          renewal_factor: number
          ticket_factor: number
          usage_factor: number
        }[]
      }
      compute_forecast_rollup: {
        Args: { _horizon_days?: number }
        Returns: {
          category: Database["public"]["Enums"]["forecast_category"]
          deal_count: number
          total_amount: number
          weighted_amount: number
        }[]
      }
      compute_optimal_send_time: {
        Args: { _contact_id: string; _contact_type: string; _earliest: string }
        Returns: string
      }
      compute_pipeline_inspection: { Args: never; Returns: number }
      count_failed_login_attempts: {
        Args: { check_email: string; check_ip: string; window_minutes?: number }
        Returns: number
      }
      count_reset_requests_24h: {
        Args: { check_email: string }
        Returns: number
      }
      create_activities_from_action_items: {
        Args: { _recording_id: string }
        Returns: number
      }
      create_agent_run: {
        Args: {
          _agent_type: string
          _goal?: string
          _requires_approval?: boolean
          _target_entity_id?: string
          _target_entity_type?: string
        }
        Returns: string
      }
      declare_step_winner: {
        Args: { _step_id: string; _variant_label: string }
        Returns: boolean
      }
      detect_renewal_risks: { Args: never; Returns: number }
      disable_sms: { Args: never; Returns: boolean }
      disable_totp: { Args: never; Returns: boolean }
      enroll_quote_in_cadence: {
        Args: { _cadence_id: string; _quote_id: string }
        Returns: string
      }
      finalize_race_season: { Args: { _season_id: string }; Returns: Json }
      find_matching_cadence_rule: {
        Args: { _sale_id: string }
        Returns: {
          cadence_id: string
          rule_id: string
          rule_name: string
        }[]
      }
      generate_api_token: { Args: never; Returns: string }
      generate_device_fingerprint: {
        Args: { p_ip_address: string; p_user_agent: string }
        Returns: string
      }
      generate_mfa_backup_codes: { Args: never; Returns: string[] }
      get_ab_test_results: {
        Args: { _ab_test_id: string }
        Returns: {
          cadence_name: string
          completed: number
          conversion_rate: number
          converted: number
          enrolled: number
          replied: number
          reply_rate: number
          variant: string
        }[]
      }
      get_account_engagement_summary: {
        Args: { _account_id: string }
        Returns: {
          account_id: string
          account_name: string
          avg_score: number
          coverage: number
          dominant_tier: string
          engaged_contacts: number
          interactions_30d: number
          total_contacts: number
        }[]
      }
      get_active_salespeople: {
        Args: never
        Returns: {
          avatar_url: string
          id: string
          is_active: boolean
          name: string
          role: string
        }[]
      }
      get_auto_paused_count: { Args: { _days?: number }; Returns: number }
      get_bulk_job_summary: {
        Args: { _job_id: string }
        Returns: {
          approved: number
          errored: number
          pending: number
          sent: number
          total: number
        }[]
      }
      get_cadence_metrics: {
        Args: { _cadence_id?: string; _days?: number }
        Returns: {
          active_count: number
          auto_paused_count: number
          cadence_id: string
          cadence_name: string
          cancelled_count: number
          completed_count: number
          completion_rate: number
          conversion_rate: number
          paused_count: number
          reply_rate: number
          tasks_completed: number
          tasks_skipped: number
          total_enrolled: number
          total_tasks: number
        }[]
      }
      get_client_purchase_heatmap: {
        Args: { _client_id?: string; _months?: number }
        Returns: {
          client_id: string
          client_name: string
          deal_count: number
          is_current_user: boolean
          month_start: string
          revenue: number
          salesperson_id: string
          salesperson_name: string
          won_count: number
        }[]
      }
      get_current_salesperson_id: { Args: never; Returns: string }
      get_current_user_email: { Args: never; Returns: string }
      get_dialer_queue_stats: {
        Args: { _queue_id: string }
        Returns: {
          calling_count: number
          done_count: number
          pending_count: number
          skipped_count: number
          snoozed_count: number
        }[]
      }
      get_embedded_report_by_token: {
        Args: { _token: string }
        Returns: {
          is_valid: boolean
          reason: string
          report_config: Json
          report_entity: string
          report_id: string
          report_name: string
        }[]
      }
      get_engagement_leaderboard: {
        Args: { _limit?: number }
        Returns: {
          click_rate: number
          client_name: string
          open_rate: number
          recency_days: number
          reply_rate: number
          sale_id: string
          salesperson_id: string
          score: number
          tier: string
          total_sent: number
        }[]
      }
      get_global_send_time_stats: {
        Args: never
        Returns: {
          best_dow: number
          best_hour: number
          sample_size: number
        }[]
      }
      get_mfa_status: {
        Args: never
        Returns: {
          preferred_method: string
          sms_enabled: boolean
          totp_enabled: boolean
        }[]
      }
      get_purchase_intelligence_summary: {
        Args: { _client_id: string }
        Returns: Json
      }
      get_revenue_forecast: {
        Args: { _days?: number }
        Returns: {
          avg_health: number
          deal_count: number
          period: string
          raw_pipeline: number
          weighted_revenue: number
        }[]
      }
      get_score_trend: {
        Args: { _days?: number; _sale_id: string }
        Returns: {
          recorded_at: string
          score: number
        }[]
      }
      get_semantic_coverage: {
        Args: never
        Returns: {
          coverage_pct: number
          entity_type: string
          indexed_rows: number
          last_indexed: string
          total_rows: number
        }[]
      }
      get_top_accounts: {
        Args: { _limit?: number }
        Returns: {
          account_score: number
          champion_count: number
          coverage: number
          decision_maker_count: number
          engaged_contacts: number
          id: string
          industry: string
          name: string
          tier: string
        }[]
      }
      get_user_permissions: {
        Args: never
        Returns: {
          action: string
          permission_name: string
          resource: string
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      grant_task_xp: {
        Args: { _assignment_id: string; _reason?: string; _xp_amount: number }
        Returns: string
      }
      has_pending_reset_request: {
        Args: { check_email: string }
        Returns: boolean
      }
      has_permission: {
        Args: { _action: string; _resource: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_combo: { Args: { p_salesperson_id: string }; Returns: boolean }
      increment_goal_progress: {
        Args: { p_goal_id: string; p_increment?: number }
        Returns: boolean
      }
      increment_race_car_overtakes: {
        Args: { _salesperson_id: string }
        Returns: undefined
      }
      increment_race_car_wins: {
        Args: { _salesperson_id: string }
        Returns: undefined
      }
      increment_sales_streak: {
        Args: { p_salesperson_id: string }
        Returns: boolean
      }
      initialize_totp: {
        Args: { p_email: string }
        Returns: {
          qr_url: string
        }[]
      }
      is_admin_or_manager: { Args: { _user_id: string }; Returns: boolean }
      is_authenticated: { Args: never; Returns: boolean }
      is_country_blocked: {
        Args: { check_country_code: string }
        Returns: boolean
      }
      is_ip_blocked: { Args: { check_ip: string }; Returns: boolean }
      is_ip_whitelisted: { Args: { check_ip: string }; Returns: boolean }
      is_known_device: {
        Args: { p_fingerprint: string; p_user_id: string }
        Returns: boolean
      }
      is_mfa_enabled: { Args: { check_user_id: string }; Returns: boolean }
      log_audit_event: {
        Args: {
          _action: string
          _changes?: Json
          _entity_id?: string
          _entity_type: string
          _metadata?: Json
        }
        Returns: string
      }
      log_rate_limit: {
        Args: {
          p_action: string
          p_blocked?: boolean
          p_identifier: string
          p_identifier_type: string
        }
        Returns: undefined
      }
      manual_xp_adjustment: {
        Args: { _amount: number; _reason: string; _user_id: string }
        Returns: string
      }
      mark_all_notifications_read: { Args: never; Returns: number }
      mark_entity_for_reindex: {
        Args: { _entity_id: string; _entity_type: string }
        Returns: boolean
      }
      match_reply_to_enrollment: {
        Args: { _contact_email: string; _received_at?: string }
        Returns: string
      }
      match_semantic: {
        Args: {
          _entity_types?: string[]
          _match_count?: number
          _query_embedding: string
        }
        Returns: {
          content: string
          entity_id: string
          entity_type: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
      next_dialer_item: {
        Args: { _queue_id: string }
        Returns: {
          item_id: string
          queue_position: number
          sale_id: string
          score: number
        }[]
      }
      pick_step_variant: {
        Args: { _step_id: string }
        Returns: {
          body: string
          label: string
          subject: string
          variant_id: string
        }[]
      }
      recompute_engagement_score: {
        Args: { _contact_id: string; _contact_type: string }
        Returns: number
      }
      record_engagement_signal: {
        Args: {
          _contact_id: string
          _contact_type: string
          _occurred_at?: string
          _signal: string
        }
        Returns: undefined
      }
      record_outbound_message: {
        Args: {
          _body: string
          _channel: string
          _enrollment_id: string
          _error?: string
          _owner_id: string
          _provider: string
          _provider_msg_id: string
          _status: string
          _step_id: string
          _template_id?: string
          _to: string
        }
        Returns: string
      }
      refresh_session: { Args: { session_id: string }; Returns: boolean }
      regenerate_backup_codes: { Args: never; Returns: string[] }
      register_race_daily_checkin: {
        Args: { _salesperson_id: string; _season_id: string }
        Returns: Json
      }
      schedule_next_qbrs: { Args: never; Returns: number }
      search_call_library: {
        Args: { _limit?: number; _query: string }
        Returns: {
          duration_seconds: number
          id: string
          rank: number
          recorded_at: string
          salesperson_id: string
          snippet: string
          status: string
          title: string
        }[]
      }
      search_products_semantic: {
        Args: { _keywords: string[]; _limit?: number; _query?: string }
        Returns: {
          category: string
          id: string
          name: string
          price: number
          rating: number
          sales_count: number
          similarity_score: number
          status: string
        }[]
      }
      send_notification: {
        Args: {
          p_action_label?: string
          p_action_url?: string
          p_category?: string
          p_message?: string
          p_metadata?: Json
          p_priority?: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      set_mfa_preferred_method: { Args: { p_method: string }; Returns: boolean }
      setup_sms_mfa: { Args: { p_phone: string }; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      snapshot_race_daily: { Args: { _season_id: string }; Returns: number }
      toggle_workflow_active: {
        Args: { p_active: boolean; p_workflow_id: string }
        Returns: boolean
      }
      unlock_race_item: {
        Args: { _required_league?: string; _unlock_key: string }
        Returns: Json
      }
      update_call_recording_diarization: {
        Args: {
          _diarization: Json
          _id: string
          _interruptions_count: number
          _longest_monologue_sec: number
          _talk_ratio_client: number
          _talk_ratio_seller: number
          _turns_count: number
        }
        Returns: undefined
      }
      update_call_recording_summary: {
        Args: {
          _action_items: Json
          _decisions: Json
          _key_topics: string[]
          _next_steps: Json
          _objections: Json
          _recording_id: string
          _sentiment: string
          _summary: string
        }
        Returns: boolean
      }
      update_call_recording_transcript: {
        Args: {
          _error?: string
          _id: string
          _language?: string
          _transcript: string
        }
        Returns: undefined
      }
      update_own_profile: {
        Args: { p_avatar_url?: string; p_name?: string }
        Returns: undefined
      }
      update_own_sale: {
        Args: {
          p_category?: string
          p_client_name?: string
          p_product_name?: string
          p_sale_id: string
          p_source?: string
        }
        Returns: boolean
      }
      update_user_mfa_settings: {
        Args: {
          p_backup_codes?: string[]
          p_preferred_method?: string
          p_sms_enabled?: boolean
          p_totp_enabled?: boolean
          p_totp_secret?: string
        }
        Returns: boolean
      }
      upsert_semantic_entry: {
        Args: {
          _content: string
          _embedding: string
          _entity_id: string
          _entity_type: string
          _metadata?: Json
          _salesperson_id: string
        }
        Returns: string
      }
      user_owns_engagement_contact: {
        Args: { _contact_id: string; _contact_type: string }
        Returns: boolean
      }
      user_owns_sequence_step: { Args: { _step_id: string }; Returns: boolean }
      validate_api_token: {
        Args: { p_token: string }
        Returns: {
          company_name: string
          team_id: string
          token_id: string
        }[]
      }
      validate_session: {
        Args: { session_id: string }
        Returns: {
          needs_refresh: boolean
          reason: string
          valid: boolean
        }[]
      }
      verify_and_enable_sms: { Args: { p_code: string }; Returns: boolean }
      verify_and_enable_totp: { Args: { p_token: string }; Returns: Json }
      verify_mfa_code: {
        Args: { p_code: string; p_method?: string }
        Returns: boolean
      }
      win_rate_breakdown: {
        Args: { _days?: number; _dimension?: string }
        Returns: {
          avg_deal_size: number
          lost_deals: number
          segment: string
          total_deals: number
          total_revenue: number
          win_rate: number
          won_deals: number
        }[]
      }
    }
    Enums: {
      activity_outcome:
        | "connected"
        | "no_answer"
        | "scheduled"
        | "voicemail"
        | "busy"
        | "callback"
        | "not_interested"
        | "qualified"
      activity_type:
        | "call"
        | "email"
        | "meeting"
        | "linkedin"
        | "whatsapp"
        | "other"
      app_role: "admin" | "manager" | "salesperson"
      cadence_type: "prospecting" | "quote_followup"
      cs_survey_type: "csat" | "ces"
      expansion_opp_status:
        | "identified"
        | "qualified"
        | "proposed"
        | "won"
        | "lost"
      expansion_type: "upsell" | "cross_sell" | "expansion"
      forecast_category:
        | "commit"
        | "best_case"
        | "pipeline"
        | "omitted"
        | "closed"
      onboarding_status: "not_started" | "in_progress" | "completed" | "stalled"
      qbr_frequency: "monthly" | "quarterly" | "biannual" | "annual"
      renewal_status: "upcoming" | "at_risk" | "renewed" | "churned" | "lost"
      sales_league: "bronze" | "silver" | "gold" | "diamond"
      salesperson_role: "sdr" | "closer" | "hybrid"
      support_ticket_priority: "low" | "normal" | "high" | "urgent"
      support_ticket_status: "open" | "pending" | "resolved" | "closed"
      task_assignment_status:
        | "pending"
        | "in_progress"
        | "submitted"
        | "approved"
        | "rejected"
      task_difficulty: "easy" | "medium" | "hard" | "epic"
      task_priority: "high" | "medium" | "low"
      task_status: "pending" | "in_progress" | "completed" | "cancelled"
      task_type:
        | "call"
        | "meeting"
        | "follow_up"
        | "email"
        | "proposal"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_outcome: [
        "connected",
        "no_answer",
        "scheduled",
        "voicemail",
        "busy",
        "callback",
        "not_interested",
        "qualified",
      ],
      activity_type: [
        "call",
        "email",
        "meeting",
        "linkedin",
        "whatsapp",
        "other",
      ],
      app_role: ["admin", "manager", "salesperson"],
      cadence_type: ["prospecting", "quote_followup"],
      cs_survey_type: ["csat", "ces"],
      expansion_opp_status: [
        "identified",
        "qualified",
        "proposed",
        "won",
        "lost",
      ],
      expansion_type: ["upsell", "cross_sell", "expansion"],
      forecast_category: [
        "commit",
        "best_case",
        "pipeline",
        "omitted",
        "closed",
      ],
      onboarding_status: ["not_started", "in_progress", "completed", "stalled"],
      qbr_frequency: ["monthly", "quarterly", "biannual", "annual"],
      renewal_status: ["upcoming", "at_risk", "renewed", "churned", "lost"],
      sales_league: ["bronze", "silver", "gold", "diamond"],
      salesperson_role: ["sdr", "closer", "hybrid"],
      support_ticket_priority: ["low", "normal", "high", "urgent"],
      support_ticket_status: ["open", "pending", "resolved", "closed"],
      task_assignment_status: [
        "pending",
        "in_progress",
        "submitted",
        "approved",
        "rejected",
      ],
      task_difficulty: ["easy", "medium", "hard", "epic"],
      task_priority: ["high", "medium", "low"],
      task_status: ["pending", "in_progress", "completed", "cancelled"],
      task_type: ["call", "meeting", "follow_up", "email", "proposal", "other"],
    },
  },
} as const
