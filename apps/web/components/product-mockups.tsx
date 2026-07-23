import { ArrowDown, BrainCircuit, BriefcaseBusiness, Building2, CircleCheck, Home, IndianRupee, Network, ShieldCheck, Sparkles } from "lucide-react";

const signals = ["Housing occupancy", "Shift attendance", "Member needs", "Savings behavior", "Employer demand"];

export function IntelligenceSystem() {
  return (
    <div className="system-visual" aria-label="Nia intelligence system">
      <div className="signal-column"><span className="visual-label">Live signals</span>{signals.map((signal, index) => <div className="signal" key={signal}><i>{String(index + 1).padStart(2, "0")}</i><span>{signal}</span><b /></div>)}</div>
      <div className="ai-core"><span className="core-orbit orbit-one" /><span className="core-orbit orbit-two" /><BrainCircuit aria-hidden="true" /><strong>Nia AI</strong><small>Decision layer</small></div>
      <div className="action-column"><span className="visual-label">Coordinated action</span><div className="action-card"><Home /><span><b>Living</b><small>Safer, closer, simpler</small></span><CircleCheck /></div><div className="action-card"><IndianRupee /><span><b>Essentials</b><small>More value retained</small></span><CircleCheck /></div><div className="action-card"><BriefcaseBusiness /><span><b>Work</b><small>More stable earnings</small></span><CircleCheck /></div></div>
    </div>
  );
}

export function OutcomeConsole() {
  return (
    <div className="console-shell">
      <div className="console-top"><span><i /> Nia intelligence</span><small>Corridor 07 · Live</small></div>
      <div className="console-grid"><aside><b>Overview</b><span>Member outcomes</span><span>Workforce health</span><span>Policy insights</span></aside><div className="console-main"><div className="console-heading"><div><small>System status</small><h3>4,286 lives coordinated</h3></div><span className="status"><Sparkles /> AI active</span></div><div className="metric-row"><div><span>Member savings</span><strong>+18%</strong><small>vs. corridor baseline</small></div><div><span>Income continuity</span><strong>+12%</strong><small>90-day average</small></div><div><span>Retention</span><strong>2.3×</strong><small>at partner sites</small></div></div><div className="insight-row"><div className="insight-copy"><Network /><span><b>Next best action</b><small>Adjust transport window for Shift B to protect 184 attendance hours this week.</small></span></div><button>Review action <ArrowDown /></button></div></div></div>
    </div>
  );
}

export function TrustStrip() { return <div className="trust-strip"><span><ShieldCheck /> Responsible by design</span><span><Building2 /> Built for institutions</span><span><Network /> Connected across the journey</span></div>; }
