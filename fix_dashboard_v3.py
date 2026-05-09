import sys
import re

file_path = 'src/components/dashboard/FuturisticSpeedometerDashboard.tsx'
with open(file_path, 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if '// Monitor KPIs and Trigger Alerts' in line:
        # Check if we are before the kpis definition (which is around line 868)
        # Actually, let's just remove ALL occurrences and insert it only once at the end of the state section.
        skip = True
        continue
    if skip:
        if '}, [kpis, oppThreshold, retThreshold, alertFrequency, user?.id, alertChannels, notifiedEvents]);' in line:
            skip = False
            continue
        if '}, [kpis, oppThreshold, retThreshold, alertFrequency, user?.id]);' in line:
            skip = False
            continue
        continue
    new_lines.append(line)

content = "".join(new_lines)

# Now find where kpis is defined and insert it after.
kpis_def = 'const { data: kpis, isLoading: kpisLoading, isFetching: kpisFetching } = useDashboardKPIsPeriod(period, resolvedSalespersonId);'
kpis_effect = 'if (kpis) setLastUpdate(new Date());\n  }, [kpis]);'

monitor_code = """
  // Monitor KPIs and Trigger Alerts
  useEffect(() => {
    if (!kpis || !user?.id || alertFrequency !== "realtime") return;

    const checkThresholds = async () => {
      const currentOpp = kpis.current.conversionRate;
      const currentRet = 85; 
      
      const newAlerts = [];

      if (currentOpp >= oppThreshold && !notifiedEvents.has(`opp_${oppThreshold}`)) {
        newAlerts.push({
          title: "Meta de Oportunidades Atingida!",
          message: `O threshold de ${oppThreshold}% foi superado. Performance atual: ${currentOpp.toFixed(1)}%.`,
          type: "goal_achieved",
          priority: "high",
          metadata: { threshold: oppThreshold, actual: currentOpp }
        });
        setNotifiedEvents(prev => {
          const next = new Set(prev);
          next.add(`opp_${oppThreshold}`);
          return next;
        });
      }

      if (currentRet < retThreshold && !notifiedEvents.has(`ret_${retThreshold}`)) {
        newAlerts.push({
          title: "Alerta de Retenção",
          message: `A retenção caiu abaixo do threshold de ${retThreshold}%. Valor atual: ${currentRet}%.`,
          type: "threshold_reached",
          priority: "high",
          metadata: { threshold: retThreshold, actual: currentRet }
        });
        setNotifiedEvents(prev => {
          const next = new Set(prev);
          next.add(`ret_${retThreshold}`);
          return next;
        });
      }

      for (const alertData of newAlerts) {
        const { data, error } = await supabase
          .from("notifications")
          .insert({ ...alertData, user_id: user.id })
          .select()
          .single();

        if (data) {
          if (alertChannels.includes("toast")) {
            toast[data.priority === 'high' ? 'warning' : 'info'](data.title, {
              description: data.message,
              icon: <Bell className="h-4 w-4" />
            });
          }
          if (alertChannels.includes("hud")) {
            setActiveHudAlert(data);
            setTimeout(() => setActiveHudAlert(null), 8000);
          }
          setAlertHistory(prev => [data, ...prev].slice(0, 20));
        }
      }
    };

    checkThresholds();
  }, [kpis, oppThreshold, retThreshold, alertFrequency, user?.id, alertChannels, notifiedEvents]);
"""

if kpis_effect in content:
    content = content.replace(kpis_effect, kpis_effect + monitor_code)
else:
    # Fallback: find kpis_def
    content = content.replace(kpis_def, kpis_def + monitor_code)

# Clean up severity and priority
content = content.replace('severity:', 'priority:')
content = content.replace('alert.severity', 'alert.priority')
content = content.replace("alert.priority === 'critical'", "alert.priority === 'high'")
content = content.replace("alert.priority === 'warning'", "alert.priority === 'high'")
content = content.replace('data.severity', 'data.priority')

with open(file_path, 'w') as f:
    f.write(content)
