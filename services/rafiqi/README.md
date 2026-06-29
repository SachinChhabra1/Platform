# services/rafiqi

**Purpose:** RafiQi — the Member's capital allocation agent, as a standalone
orchestration service. It owns **no source-of-truth records**. It acts through the
Membership, Wallet, Living, Work and Essentials contracts and writes **only its own
decision logs**. Every action explains what and why, shows the data used, and is
reversible within a documented window (Book IX §3.2). Spelled **RafiQi** (Book I §4.15).
**Owner:** _unassigned (senior review — acts on money)._
**Nia OS books:** Book IX (§3.2, §5), VIII (§3.8), IV (RafiQi), I (§4.15).
**Local setup:** _TBD. Reversibility window pending OD-3._
**Testing:** Decision-log assertions; reversibility within window; never acts without logged authority.
