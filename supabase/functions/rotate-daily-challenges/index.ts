import { createClient } from 'npm:@supabase/supabase-js@2.49.4'
import { corsHeaders } from "../_shared/cors.ts";


// Pool of daily challenge templates with smaller targets
const DAILY_CHALLENGE_TEMPLATES = [
  { title: 'Maratonista de Ligações', description: 'Faça 10 ligações hoje', challenge_type: 'calls', target_value: 10, xp_reward: 30 },
  { title: 'Caçador de Contatos', description: 'Faça 5 ligações com conexão', challenge_type: 'calls', target_value: 5, xp_reward: 25 },
  { title: 'Mestre do E-mail', description: 'Envie 8 e-mails hoje', challenge_type: 'emails', target_value: 8, xp_reward: 25 },
  { title: 'Networking Digital', description: 'Faça 5 contatos no LinkedIn', challenge_type: 'linkedin', target_value: 5, xp_reward: 25 },
  { title: 'WhatsApp Warrior', description: 'Envie 10 mensagens no WhatsApp', challenge_type: 'whatsapp', target_value: 10, xp_reward: 25 },
  { title: 'Agendador Pro', description: 'Agende 2 reuniões', challenge_type: 'meetings', target_value: 2, xp_reward: 40 },
  { title: 'Fechador Relâmpago', description: 'Feche 1 venda hoje', challenge_type: 'sales', target_value: 1, xp_reward: 50 },
  { title: 'Comunicador Total', description: 'Faça 15 atividades de qualquer tipo', challenge_type: 'any', target_value: 15, xp_reward: 35 },
  { title: 'Sprint Matinal', description: 'Complete 5 atividades até o almoço', challenge_type: 'any', target_value: 5, xp_reward: 20 },
  { title: 'Persistência Paga', description: 'Faça 3 follow-ups hoje', challenge_type: 'follow_up', target_value: 3, xp_reward: 30 },
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const today = new Date().toISOString().split('T')[0]

    // Check if today's challenges already exist
    const { data: existingChallenges } = await supabase
      .from('daily_challenges')
      .select('id')
      .eq('challenge_date', today)
      .eq('is_active', true)

    if (existingChallenges && existingChallenges.length > 0) {
      console.info('Daily challenges already exist for today:', today)
      return new Response(
        JSON.stringify({ message: 'Daily challenges already created for today', count: existingChallenges.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Deactivate yesterday's challenges
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    await supabase
      .from('daily_challenges')
      .update({ is_active: false })
      .eq('challenge_date', yesterdayStr)

    // Select 3 random challenges for today
    const shuffled = [...DAILY_CHALLENGE_TEMPLATES].sort(() => Math.random() - 0.5)
    const selectedChallenges = shuffled.slice(0, 3)

    // Insert today's challenges
    const challengesToInsert = selectedChallenges.map(challenge => ({
      ...challenge,
      challenge_date: today,
      is_active: true,
    }))

    const { data: newChallenges, error } = await supabase
      .from('daily_challenges')
      .insert(challengesToInsert)
      .select()

    if (error) {
      console.error('Error creating daily challenges:', error)
      throw error
    }

    console.info('Created daily challenges:', newChallenges?.length)

    return new Response(
      JSON.stringify({ 
        message: 'Daily challenges created successfully', 
        challenges: newChallenges 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in rotate-daily-challenges:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
