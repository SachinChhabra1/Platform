# services/membership

**Purpose:** Identity, onboarding, off-boarding, and the Member record. The system of
record for who a Member is. Every read/write is audit-logged (Book VIII §7.1).
**Owner:** _unassigned_
**Nia OS books:** Book VIII (§2.1 Member, §7 audit), II (Member), I (Articles XV, XVII).
**Local setup:** _TBD._
**Testing:** Integration against a real DB; audit-log assertions on every record access.
