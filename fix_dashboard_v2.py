import sys
import re

file_path = 'src/components/dashboard/FuturisticSpeedometerDashboard.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Clean up duplicated section in PopoverContent
# The duplication starts with:
# <div className="space-y-4 pt-3 border-t border-primary/10">
#                   <h5 className="font-mono text-[9px] font-bold uppercase tracking-widest text-primary/80">Thresholds & Alerts</h5>

# I'll look for the second occurrence of this pattern and remove it.
pattern = r'<div className="space-y-4 pt-3 border-t border-primary/10">\s+<h5 className="font-mono text-\[9px\] font-bold uppercase tracking-widest text-primary/80">Thresholds & Alerts</h5>'
matches = list(re.finditer(pattern, content))

if len(matches) > 1:
    # We found at least two. The second one is the duplicate.
    start_pos = matches[1].start()
    # Find the end of this block by looking for the next </PopoverContent> and working backwards
    # or just look for the end of the select frequency which is the last part of the duplicated block.
    # The duplicated block ends with a </Select> and then two </div>s before </PopoverContent>
    # Let's find the closing tag for PopoverContent after the second match.
    popover_end = content.find('</PopoverContent>', start_pos)
    # The duplicated block seems to end just before </PopoverContent>
    # Actually, looking at the previous view, it has a lot of content.
    # I'll look for the last </div> </div> before </PopoverContent>
    # Actually, the most reliable way is to find the next </PopoverContent> and remove everything between start_pos and that.
    # BUT we must leave the </PopoverContent> itself.
    if popover_end != -1:
        # We want to keep the closing tags </PopoverContent>
        # The duplicated block is inside the main div.
        content = content[:start_pos] + '\n                ' + content[popover_end:]

# 2. Final check for 'severity' vs 'priority'
content = content.replace('alert.severity', 'alert.priority')
content = content.replace("alert.priority === 'critical'", "alert.priority === 'high'")
content = content.replace("alert.priority === 'warning'", "alert.priority === 'high'")

# 3. Double check testAlert for severity
content = content.replace('severity: "info"', 'priority: "info"')
content = content.replace('severity: "success"', 'priority: "high"')

with open(file_path, 'w') as f:
    f.write(content)
