import { ArrowDownLeft, ArrowUpRight, Check, ChevronRight, CircleDollarSign, Clock3, Search, ShieldCheck, UtensilsCrossed, WalletCards } from "lucide-react";

function PhoneFrame({ children, label }: { children: React.ReactNode; label: string }) {
  return <div className="phone-frame" aria-label={label}><div className="phone-speaker" />{children}</div>;
}

export function MemberMockup() {
  return (
    <PhoneFrame label="Nia member app home screen mockup">
      <div className="phone-top"><span>9:41</span><span>● ●</span></div>
      <div className="member-head"><div><small>GOOD MORNING</small><strong>Hi, Aman.</strong></div><div className="avatar">AK</div></div>
      <div className="balance-card"><span>Available for meals</span><b>₹2,840</b><small>Next allowance · 01 Aug</small></div>
      <div className="quick-grid"><button><UtensilsCrossed /><span>Order food</span></button><button><WalletCards /><span>Wallet</span></button></div>
      <div className="mock-section-title"><b>Today</b><span>View all</span></div>
      <div className="meal-row"><div className="meal-icon"><UtensilsCrossed /></div><div><b>Lunch at Nia Kitchen</b><small>Arriving by 1:15 PM</small></div><span>₹90</span></div>
      <div className="continuity"><ShieldCheck /><div><b>You&apos;re covered</b><small>Ordering continues even if payroll is delayed.</small></div></div>
      <div className="phone-tabs"><b>Home</b><span>Orders</span><span>Wallet</span></div>
    </PhoneFrame>
  );
}

export function WalletMockup() {
  return (
    <PhoneFrame label="Nia Wallet ledger screen mockup">
      <div className="phone-top"><span>9:41</span><span>● ●</span></div>
      <div className="wallet-title"><span>‹</span><b>Nia Wallet</b><span>•••</span></div>
      <div className="wallet-total"><small>TOTAL BALANCE</small><strong>₹4,320.00</strong><span><i /> Active · Updated now</span></div>
      <div className="wallet-actions"><button><ArrowDownLeft /><span>Add money</span></button><button><ArrowUpRight /><span>Send</span></button></div>
      <div className="mock-section-title"><b>Recent activity</b><Search /></div>
      {[['Nia Kitchen','Today, 12:46 PM','− ₹90'],['Meal allowance','Yesterday','+ ₹1,500'],['Metro Mart','22 Jul, 7:08 PM','− ₹340']].map(([a,b,c], index) => <div className="ledger-row" key={a}><div className="ledger-icon">{index === 1 ? <CircleDollarSign /> : <UtensilsCrossed />}</div><div><b>{a}</b><small>{b}</small></div><span className={index === 1 ? 'positive' : ''}>{c}</span></div>)}
      <div className="wallet-note"><Clock3 /><span>Every movement is recorded in a double-entry ledger.</span></div>
    </PhoneFrame>
  );
}

export function OrderingMockup() {
  return (
    <div className="chat-frame" aria-label="WhatsApp ordering flow mockup">
      <div className="chat-head"><div className="chat-avatar">n</div><div><b>Nia Orders</b><small>Business account</small></div><span>•••</span></div>
      <div className="chat-day">TODAY</div>
      <div className="bubble incoming">Hi Aman, what would you like for lunch today?</div>
      <div className="bubble incoming menu-bubble"><b>Today&apos;s menu</b><span>1. Homestyle thali · ₹90</span><span>2. Paneer rice bowl · ₹110</span><span>3. Dal khichdi · ₹80</span></div>
      <div className="bubble outgoing">1</div>
      <div className="bubble incoming"><b>Homestyle thali</b><span>Deliver to Embassy Tech Village?</span><button>Confirm order</button></div>
      <div className="bubble outgoing">Confirmed</div>
      <div className="order-confirm"><Check /><div><b>Order #NIA-2841</b><small>Paid with Nia Wallet · ₹90</small></div></div>
      <div className="chat-input"><span>Message</span><b>→</b></div>
    </div>
  );
}

export function OpsMockup() {
  return (
    <div className="ops-frame" aria-label="Operations reconciliation dashboard mockup">
      <aside><div className="ops-brand">nia<span>.</span></div>{['Overview','Orders','Payments','Reconciliation','Members'].map((item, i) => <div className={i === 3 ? 'active' : ''} key={item}>{item}</div>)}</aside>
      <main><div className="ops-top"><div><small>OPERATIONS</small><h3>Reconciliation</h3></div><button>Export report</button></div>
      <div className="ops-stats"><div><small>ORDERS TODAY</small><b>1,284</b><span>↑ 8.4%</span></div><div><small>VALUE PROCESSED</small><b>₹11.6L</b><span>Across 42 sites</span></div><div><small>UNMATCHED</small><b>03</b><span>Needs review</span></div></div>
      <div className="ops-table-head"><div><b>Settlement batches</b><small>23 July 2026</small></div><div className="search-pill"><Search /> Search</div></div>
      <div className="ops-table"><div className="tr heading"><span>BATCH</span><span>SITE</span><span>ORDERS</span><span>VALUE</span><span>STATUS</span></div>{[['#284','Embassy Tech','482','₹4.32L'],['#283','Manyata Park','391','₹3.51L'],['#282','Electronic City','408','₹3.68L']].map((r) => <div className="tr" key={r[0]}>{r.map(v => <span key={v}>{v}</span>)}<span className="status"><Check /> Matched</span></div>)}</div>
      </main>
    </div>
  );
}

export function RailDiagram() {
  const steps = ['Demand', 'Order', 'Payment', 'Fulfilment', 'Books'];
  return <div className="rail" aria-label="Nia ordering rail stages">{steps.map((step, index) => <div className="rail-step" key={step}><span>0{index + 1}</span><b>{step}</b>{index < steps.length - 1 && <ChevronRight aria-hidden="true" />}</div>)}</div>;
}
