# Amar Batch — Development Roadmap

## Where We Are Now ✅

Multi-tenant SaaS with: Students, Batches, Teachers, Fees, Attendance, Exams (basic), Notices, Holidays, Reports, Multi-branch, Subscriptions/Plans, RBAC (Super Admin/Owner/Staff).

---

## Roadmap: Next 10–12 Weeks

### 🔵 Phase 1 — Manual Payment Verification (Week 1)

No merchant account needed — unlocks real fee collection tracking immediately.

- [ ] Add payment fields to Fee model: `payment_method`, `trx_id`, `proof_screenshot`, `verified_by`, `payment_status`
- [ ] Settings: owner enters their personal bKash/Nagad number
- [ ] Student/parent fee page: select method, enter TrxID, upload screenshot
- [ ] Admin "Pending Verifications" page: approve/reject
- [ ] Auto-generate receipt on verification

**Outcome:** Parents pay via bKash/Nagad personal number, admin verifies, receipt auto-generated.

---

### 🔵 Phase 2 — BD-Specific Student Data (Week 1–2, short)

- [ ] Add fields: Bangla name, school/college name, medium (Bangla/English), NID/birth cert, district, thana, guardian NID, guardian occupation
- [ ] District/Thana as dropdown (seeded dataset, not free text)
- [ ] Update forms, detail page, CSV export

**Outcome:** Student records match real BD admission-form standards.

---

### 🔵 Phase 3 — Model Test, Merit List & Admit Card (Week 2–3)

Your biggest market differentiator — build this well.

- [ ] Exam types: class test, model test, admission test, final
- [ ] Auto roll number generation per batch/exam
- [ ] Admit card PDF (photo, name Bangla+English, roll, batch, exam date)
- [ ] Merit list: ranked by marks, tie handling, printable/exportable
- [ ] Optional: best-of-N average, group-wise (Science/Commerce/Arts) merit

**Outcome:** Run a model test → publish ranked merit list → print admit cards. Core BD coaching workflow, done properly.

---

### 🔵 Phase 4 — Simple Notifications: SMS + WhatsApp (Week 4)

Keep it simple — two toggles, one send function.

- [ ] Settings page: SMS toggle + WhatsApp toggle (each with provider/API key/test button)
- [ ] One internal function `sendMessage($student, $text)` — checks which channels are on, sends accordingly
- [ ] Wire to 4 triggers only: fee verified, fee reminder (manual button), absent, exam result published
- [ ] Simple "Sent Messages" log page
- [ ] Guardian opt-out checkbox per student

**Outcome:** Optional, per-tenant, zero setup burden if unused — real parent reach if enabled.

---

### 🔵 Phase 5 — Discounts: Sibling & Freeship/Quota (Week 5)

- [ ] `fee_waivers` table: type (sibling/scholarship/quota/other), amount/percent, reason, approved_by
- [ ] Auto-detect siblings by guardian phone/NID
- [ ] Admin approval required (accountability for money)
- [ ] Apply waiver before fee generation
- [ ] Dashboard stat: total waived amount

**Outcome:** Discounts tracked and approved formally, not informal verbal deals.

---

### 🔵 Phase 6 — Income/Expense Tracking (Week 6)

- [ ] Expenses model: category (rent/utility/salary/printing/marketing/other), amount, date, receipt
- [ ] Simple CRUD + list page
- [ ] Dashboard: Fees collected − Expenses = Net (this month)
- [ ] Category breakdown chart

**Outcome:** Owner sees real profit/loss, not just fee numbers.

---

### 🟢 Phase 7 — bKash/Nagad Automated Payment (Week 7–9, when ready)

Only when you have real paying tenants — needs trade license.

- [ ] Apply for SSLCommerz or AamarPay (aggregates bKash/Nagad/Rocket/cards in one integration)
- [ ] Integrate checkout flow, replace manual TrxID entry with automated webhook confirmation
- [ ] Keep manual method as fallback option

**Outcome:** Fully automated fee collection, no manual verification needed.

---

### 🟡 Phase 8 — Parent/Student Portal (Week 9–10, optional but valuable)

Your User model already has student/parent roles — mostly frontend work.

- [ ] Read-only login: view attendance %, fees due/paid, exam results/rank
- [ ] Simple dashboard for parents, no admin capabilities

**Outcome:** Strong selling point — parents self-serve instead of calling the office.

---

### 🟡 Phase 9 — Facebook Notice Auto-Post (Week 10, optional/low priority)

- [ ] Connect tenant's Facebook Page (Graph API token in settings)
- [ ] Checkbox on Notice: "Also post to Facebook"

**Outcome:** Notices reach parents where centers already have a public presence.

---

### 🟡 Phase 10 — Tenant Subscription Billing (Week 11–12, once you have paying customers)

- [ ] Auto-charge coaching centers for their plan after trial ends (via SSLCommerz/AamarPay from Phase 7)
- [ ] Webhook-driven subscription renewal/expiry handling
- [ ] Downgrade/lock features on non-payment

**Outcome:** Your own SaaS revenue loop closes — this is when the product starts making you money automatically.

---

## Priority Summary

| Priority | Phase | Why |
|----------|-------|-----|
| 🔴 Must-have, do first | 1, 3 | Payment tracking + the BD-specific killer feature (merit lists) |
| 🟠 High value, do next | 4, 2 | Parent reach (SMS/WhatsApp) + proper local data fields |
| 🟡 Important, not urgent | 5, 6 | Discounts + expense tracking — real but not blocking |
| 🟢 Do when you have real users | 7, 10 | Automated payments + billing — needs trade license/real traffic first |
| ⚪ Optional polish | 8, 9 | Parent portal + Facebook — genuinely nice, not core |

## Realistic Timeline

- **Solo, part-time:** ~12–14 weeks for everything through Phase 6
- **Solo, full-time:** ~6–7 weeks for everything through Phase 6
- **Phases 7–10:** timed around actual business milestones (getting a trade license, getting real paying tenants) rather than a fixed calendar
