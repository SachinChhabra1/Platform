import {
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Landmark,
  RadioTower,
  RotateCcw,
  Send,
  UserCog,
  UserRound,
  WalletCards,
  HandHeart,
} from "lucide-react";

const recordInputs = [
  { icon: UserRound, title: "Membership", copy: "Identity, tenure, rights" },
  { icon: BriefcaseBusiness, title: "Work", copy: "Wages, attendance, deductions" },
  { icon: Building2, title: "Living", copy: "Nest, membership fee, Trip Home" },
  { icon: HandHeart, title: "Essentials", copy: "Savings, remittance, insurance, credit" },
  { icon: WalletCards, title: "Wallet", copy: "Credit, debit, hold, release, reversal" },
  { icon: RadioTower, title: "Edge", copy: "Payroll, bank, UPI, SMS, e-KYC" },
  { icon: UserCog, title: "Operator", copy: "Daybook, corrections, human context" },
];

const memberOutputs = [
  { icon: BriefcaseBusiness, title: "Earned", copy: "What work produced" },
  { icon: WalletCards, title: "Kept", copy: "What remains in hand" },
  { icon: Landmark, title: "Saved", copy: "What is set aside" },
  { icon: Send, title: "Sent home", copy: "What reached family" },
];

export function NiaBooksRecord() {
  return (
    <section className="record-section" id="record" aria-labelledby="record-title">
      <div className="page-width">
        <div className="record-principle">
          <RotateCcw aria-hidden="true" />
          <div>
            <p><strong>Nia AI reads. Decides. Acts.</strong> Never owns the record.</p>
            <span>Reversible · auditable</span>
          </div>
        </div>

        <div className="record-grid">
          <div className="record-inputs">
            <h2 id="record-title">What writes to the books</h2>
            <ol>
              {recordInputs.map(({ icon: Icon, title, copy }, index) => (
                <li key={title}>
                  <span className="record-number">{String(index + 1).padStart(2, "0")}</span>
                  <Icon aria-hidden="true" />
                  <div>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </div>
                  <span className="record-arrow" aria-hidden="true">→</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="record-core" aria-label="NiaBooks, the Member's continuous record">
            <div className="record-core-inner">
              <span className="record-orbit record-orbit-outer" aria-hidden="true" />
              <span className="record-orbit record-orbit-inner" aria-hidden="true" />
              <BookOpen aria-hidden="true" />
              <strong>NiaBooks</strong>
              <p>The Member&apos;s<br />continuous record</p>
            </div>
          </div>

          <div className="record-outputs">
            <h2>What the Member can see</h2>
            <ul>
              {memberOutputs.map(({ icon: Icon, title, copy }) => (
                <li key={title}>
                  <Icon aria-hidden="true" />
                  <div>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
