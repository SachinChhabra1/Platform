import {
  ArrowUpRight,
  BedDouble,
  BriefcaseBusiness,
  Bus,
  Check,
  ChevronRight,
  HeartPulse,
  IndianRupee,
  MapPin,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

function PhoneFrame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="phone-frame" aria-label={label}>
      <div className="phone-speaker" />
      {children}
    </div>
  );
}

export function MemberMockup() {
  return (
    <PhoneFrame label="RafiQi member app home screen mockup">
      <div className="phone-top"><span>9:41</span><span>● ●</span></div>
      <div className="member-head">
        <div><small>GOOD MORNING</small><strong>Namaste, Aman</strong></div>
        <div className="avatar">AK</div>
      </div>
      <div className="work-card">
        <div className="work-card-top"><span>WORK STATUS</span><b>On track</b></div>
        <strong>26 days</strong>
        <small>This month · Shift A</small>
        <div className="work-progress"><i /></div>
      </div>
      <div className="quick-grid">
        <button><Bus /><span>Shuttle</span></button>
        <button><BedDouble /><span>My studio</span></button>
        <button><HeartPulse /><span>Wellbeing</span></button>
        <button><IndianRupee /><span>Earnings</span></button>
      </div>
      <div className="mock-section-title"><b>Today</b><span>23 July</span></div>
      <div className="timeline-row"><span className="timeline-time">6:30</span><i /><div><b>Shuttle to plant</b><small>Gate 2 · On time</small></div></div>
      <div className="timeline-row"><span className="timeline-time">7:00</span><i /><div><b>Shift starts</b><small>Assembly line B</small></div></div>
      <div className="phone-tabs"><b>Home</b><span>Services</span><span>Profile</span></div>
    </PhoneFrame>
  );
}

export function WalletMockup() {
  return (
    <PhoneFrame label="RafiQi earnings and savings screen mockup">
      <div className="phone-top"><span>9:41</span><span>● ●</span></div>
      <div className="wallet-title"><span>‹</span><b>My earnings</b><span>•••</span></div>
      <div className="wallet-total">
        <small>SENT HOME THIS MONTH</small>
        <strong>₹12,400</strong>
        <span><i /> ₹2,100 more than last month</span>
      </div>
      <div className="money-split">
        <div><small>EARNED</small><b>₹18,900</b></div>
        <div><small>SAVED</small><b>₹3,200</b></div>
      </div>
      <div className="mock-section-title"><b>Recent activity</b><Search /></div>
      {[
        ["Sent home", "Today · UPI", "− ₹8,000"],
        ["Salary credited", "21 Jul · Nia Payroll", "+ ₹18,900"],
        ["Studio fee", "20 Jul · Oragadam", "− ₹2,100"],
      ].map(([a, b, c], index) => (
        <div className="ledger-row" key={a}>
          <div className="ledger-icon">{index === 0 ? <ArrowUpRight /> : <IndianRupee />}</div>
          <div><b>{a}</b><small>{b}</small></div>
          <span className={index === 1 ? "positive" : ""}>{c}</span>
        </div>
      ))}
      <div className="wallet-note"><ShieldCheck /><span>Your earnings record is private and secure.</span></div>
    </PhoneFrame>
  );
}

export function OpsMockup() {
  const rows = [
    ["Oragadam", "1,842", "94%", "7.2 mo", "Healthy"],
    ["Hosur", "1,216", "91%", "6.8 mo", "Healthy"],
    ["Sri City", "987", "87%", "5.9 mo", "Watch"],
  ];
  return (
    <div className="ops-frame" aria-label="RafiQi Central enterprise dashboard mockup">
      <aside>
        <div className="ops-brand">Nia</div>
        {[
          ["Overview", Users], ["Workforce", BriefcaseBusiness], ["Studios", BedDouble],
          ["Transport", Bus], ["Wellbeing", HeartPulse],
        ].map(([item, Icon], i) => {
          const NavIcon = Icon as typeof Users;
          return <div className={i === 0 ? "active" : ""} key={item as string}><NavIcon /><span>{item as string}</span></div>;
        })}
      </aside>
      <main>
        <div className="ops-top">
          <div><small>RAFIQI CENTRAL</small><h3>Workforce overview</h3></div>
          <button>July 2026 <ChevronRight /></button>
        </div>
        <div className="ops-stats">
          <div><small>ACTIVE MEMBERS</small><b>7,042</b><span>↑ 8.4% this quarter</span></div>
          <div><small>6-MO RETENTION</small><b>71%</b><span>+19 pts vs baseline</span></div>
          <div><small>ATTENDANCE</small><b>92.4%</b><span>Across 4 corridors</span></div>
        </div>
        <div className="ops-table-head"><div><b>Corridor performance</b><small>Live across Nia network</small></div><div className="search-pill"><Search /> Search</div></div>
        <div className="ops-table">
          <div className="tr heading"><span>CORRIDOR</span><span>MEMBERS</span><span>ATTENDANCE</span><span>TENURE</span><span>STATUS</span></div>
          {rows.map((row) => <div className="tr" key={row[0]}>{row.map((value, i) => <span className={i === 4 ? "status" : ""} key={value}>{i === 4 && <Check />}{value}</span>)}</div>)}
        </div>
      </main>
    </div>
  );
}

export function CorridorRail() {
  const steps = [
    ["Recruit", MapPin], ["Move", Bus], ["Live", BedDouble], ["Work", BriefcaseBusiness], ["Thrive", HeartPulse],
  ];
  return (
    <div className="corridor-rail" aria-label="Nia member journey">
      {steps.map(([step, Icon], index) => {
        const StepIcon = Icon as typeof MapPin;
        return <div className="rail-step" key={step as string}><span>0{index + 1}</span><StepIcon /><b>{step as string}</b>{index < steps.length - 1 && <ChevronRight aria-hidden="true" />}</div>;
      })}
    </div>
  );
}
