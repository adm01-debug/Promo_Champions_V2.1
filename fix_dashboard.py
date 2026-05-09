import sys
import re

file_path = 'src/components/dashboard/FuturisticSpeedometerDashboard.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Remove the faultily placed Monitoring useEffect (it was placed before kpis)
# It likely contains 'const currentOpp = kpis.current.conversionRate'
# I'll look for the block starting with '// Monitor KPIs and Trigger Alerts' and remove it if it's before the kpis definition.
monitor_regex = r'// Monitor KPIs and Trigger Alerts\n\s+useEffect\(\(\) => \{[\s\S]*?\}, \[kpis, oppThreshold, retThreshold, alertFrequency, user\?\.id, alertChannels, notifiedEvents\]\);'
# Actually, I'll just remove all occurrences of this specific block and re-insert it in the right place later.
content = re.sub(monitor_regex, '', content)

# 2. Remove the duplicated Popover section
# It starts with '<div className="space-y-4 pt-3 border-t border-primary/10">\n\s+<h5 className="font-mono text-\[9px\] font-bold uppercase tracking-widest text-primary/80">Thresholds & Alerts</h5>'
# and ends before '</PopoverContent>'
# Since there are two, I'll remove the second one.
popover_sections = list(re.finditer(r'<h5 className="font-mono text-\[9px\] font-bold uppercase tracking-widest text-primary/80">Thresholds & Alerts</h5>', content))
if len(popover_sections) > 1:
    # Keep the first one, remove the second one and its surrounding div
    second_start = popover_sections[1].start()
    # Find the start of the div containing this h5
    div_start = content.rfind('<div className="space-y-4 pt-3 border-t border-primary/10">', 0, second_start)
    # Find the end of this div (it should be before the next </PopoverContent>)
    popover_end = content.find('</PopoverContent>', second_start)
    # Find the last </div> before </PopoverContent>
    div_end = content.rfind('</div>', 0, popover_end) + 6
    if div_start != -1 and div_end != -1:
        content = content[:div_start] + content[div_end:]

# 3. Fix 'severity' to 'priority' in testAlert and insert notifications
content = content.replace('severity: "info"', 'priority: "info"')
content = content.replace('severity: "success"', 'priority: "high"')
content = content.replace('severity: "warning"', 'priority: "high"')
content = content.replace('data.severity === \'success\'', 'data.priority === \'high\'')

# 4. Insert the Monitoring useEffect in the correct place (after kpis definition)
kpis_effect_marker = 'if (kpis) setLastUpdate(new Date());\n  }, [kpis]);'
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
if kpis_effect_marker in content:
    content = content.replace(kpis_effect_marker, kpis_effect_marker + monitor_code)

with open(file_path, 'w') as f:
    f.write(content)
