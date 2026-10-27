# FoodBridge AI — Surplus Food Redistribution & Smart Perishability Logistics

> **Tagline:** *Rescue surplus. Deliver safely. Waste less.*  
> **Platform Version:** 1.0.0 (Hackathon Edition)  
> **Workspace Location:** `C:\Users\hp\.gemini\antigravity\scratch\foodbridge-ai`

---

## 1. Executive Summary & Problem Statement

Global food waste accounts for approximately 8–10% of global greenhouse gas emissions, while millions of families and individuals face food insecurity daily. A critical reason edible commercial surplus ends up in landfills rather than on dinner tables is **perishability risk, logistical friction, and lack of verifiable food safety**.

Traditional redistribution models rely on slow, manual phone calls, spreadsheet lists, or unvetted drop-offs where cold-chain integrity cannot be guaranteed.

**FoodBridge AI** solves this through a multi-sided social-impact platform that:
1. **Intelligently forecasts surplus** up to 3 hours before kitchen closure to pre-arrange NGO logistics.
2. **Gates candidate recipients using 6 hard food-safety constraints** (storage compatibility, collection window feasibility, dietary/allergen integrity, quarantine lock) before soft scoring.
3. **Optimizes dynamic logistics failover** with automatic re-routing when a courier encounters a vehicle breakdown or delay.
4. **Enforces two-stage cryptographic handoffs (QR & OTP)** for pickup and drop-off to eliminate ghost deliveries.
5. **Circuit-breaks unsafe batches** with an automated food-safety quarantine workflow.
6. **Produces transparent, scientifically grounded impact telemetry** (meals rescued, kg waste avoided, CO2e prevented, recipient equity).

---

## 2. Architecture & Tech Stack

```
                              ┌──────────────────────────────────┐
                              │         FoodBridge AI UI         │
                              │  (React 18 + TS + Tailwind CSS)  │
                              └──────────────┬───────────────────┘
                                             │
             ┌───────────────────────────────┼───────────────────────────────┐
             │                               │                               │
             ▼                               ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│ AI Surplus Predictor    │     │ Constraint Match Engine │     │ Logistics Failover & OTP│
│ • Footfall & Rain ML    │     │ • 6 Hard Safety Gates   │     │ • Real-time state mach. │
│ • Explainable factors   │     │ • Multi-factor Soft Rank│     │ • Standby driver assign │
│ • 1-Click Draft Listing │     │ • Recipient Equity Index│     │ • Anti-replay QR tokens │
└─────────────────────────┘     └─────────────────────────┘     └─────────────────────────┘
             │                               │                               │
             └───────────────────────────────┼───────────────────────────────┘
                                             │
                                             ▼
                              ┌──────────────────────────────────┐
                              │  Reactive State & Audit Engine   │
                              │ (LocalStorage + Demo Time Mach.) │
                              └──────────────────────────────────┘
```

- **Frontend Core:** React 18 with TypeScript, Vite 6 bundler.
- **Styling & UI:** Tailwind CSS, Emerald social-impact palette, warm off-white canvas (`#fafaf9`), dark charcoal text (`#1c1917`).
- **Data Visualizations:** Recharts for historical surplus comparisons, category breakdowns, and fairness distribution.
- **Icons:** Lucide React icons.
- **State Management:** Reactive Context API with auto-persistence in `localStorage` and single-click state reset.

---

## 3. The 5 Stakeholder Roles

Switch perspectives instantly via the top-right header role switcher:

1. **Food Donor (Hotel / Restaurant / Hostel Mess / Supermarket)**
   - Dashboard: Portions donated, active listings, upcoming expiry countdowns, and waste avoided.
   - Actions: Run AI Surplus Predictor, 1-click publish listing, generate pickup QR code, and track courier dispatch.
2. **NGO Coordinator (Regional Food Bank)**
   - Dashboard: Available food opportunities, incoming cold-chain bulk, and warehouse capacity meters.
   - Actions: Accept/decline matches, approve partial quantity allocations, and monitor regional equity.
3. **Delivery Partner (Eco EV Fleet / Insulated Courier)**
   - Dashboard: Assigned delivery tasks, simulated GIS route waypoints, and ETA countdowns.
   - Actions: Optical QR scan simulation, handoff OTP validation, and 1-click **Report Carrier Issue** (triggering dynamic failover).
4. **Recipient Shelter / Community Kitchen (Hope Harbor / Seva Kitchen)**
   - Dashboard: Dinner arrival schedules, open hunger requests, and verified meal counters.
   - Actions: Submit hunger requests with dietary requirements, confirm drop-off tokens, and report food-quality concerns.
5. **Central Admin / Operations Sentinel**
   - Dashboard: System vitals, active deliveries, automated quarantine locks, and partner trust scores.
   - Actions: Review safety complaints, resolve quarantine investigations, inspect audit logs, and tune matching weights.

---

## 4. Key Engines & Mathematical Formulations

### A. AI Surplus Prediction Engine (`src/services/predictionEngine.ts`)
Calculates expected overage before service concludes based on:
$$\text{Surplus Portions} = \left(\frac{\text{Inventory}_{\text{kg}} \times 1000}{\text{PortionGrams}} - \frac{\text{Footfall} \times \text{AbsorptionRate}}{\text{WeatherMultiplier}}\right) \times (1 + \text{SafetyBuffer})$$
- Heavy Rain condition applies a $1.25\times$ variance due to walk-in dining cancellation.
- Provides human-readable attribution breakdown and 1-click conversion to a live redistribution listing.

### B. Constraint-Based AI Matching Engine (`src/services/matchingEngine.ts`)
1. **Hard Safety Constraints (Zero-Tolerance Gate):**
   - *Food Integrity & Quarantine:* Rejects any batch with an active safety flag.
   - *Collection Deadline Viability:* Requires $(T_{\text{transit}} + 10\text{m buffer}) \le T_{\text{collection}}$.
   - *Category & Storage Acceptance:* Verifies recipient and courier support required temperature (`hot_insulated`, `refrigerated`, `frozen`).
   - *Dietary & Allergen Verification:* Checks recipient exclusions against allergen disclosures.
   - *Receiving Physical Capacity:* Verifies warehouse can absorb batch without spoilage.
2. **Soft Ranking Factors (Score 0–100):**
   - Proximity decay ($+15$ for $<2$ km).
   - Recipient hunger urgency bonus ($+15$ for urgent evening hunger line).
   - Perishability urgency boost for batches with $<60$ min remaining.
   - **Regional Equity Dampener:** Deducts points if an organization has already absorbed 3+ allocations today, preventing single-hub monopolization.

### C. Dynamic Logistics Failover (`src/services/logisticsEngine.ts`)
When a courier reports a breakdown or timeout:
1. Evaluates remaining shelf-life against replacement dispatch window.
2. If remaining shelf-life $<10$m, safety sentinel terminates allocation to prevent bacterial hazard.
3. If feasible, auto-dispatches the closest standby courier with compatible thermal equipment.
4. Preserves full audit history (original courier ID, failure reason, reassignment timestamp).

### D. Scientific Impact Formulations (`src/services/impactCalculator.ts`)
- $\text{Meals Rescued} = \text{Portions Delivered} \text{ (or kg } \times 2.2\text{)}$
- $\text{Waste Avoided (kg)} = \text{Delivered kg}$
- $\text{CO}_2\text{e Avoided} = \text{Delivered kg} \times 2.5\text{ kg CO}_2\text{e}$ *(IPCC Benchmark)*
- $\text{Water Conserved} = \text{Delivered kg} \times 290\text{ Liters}$ *(USDA Agricultural Footprint)*
- $\text{Economic Value Saved} = \text{Meals Rescued} \times \$4.20\text{ USD}$

---

## 5. Simulated vs. Real Components Disclosure

| Subsystem | Implementation Type | Description |
|---|---|---|
| 6-Gate Hard Constraint Engine | **Genuinely Integrated** | Pure algorithmic safety filter; blocks ineligible allocations |
| Surplus Prediction Heuristic | **Genuinely Integrated** | Deterministic multi-factor scenario calculation with attribution |
| Dynamic Logistics Failover | **Genuinely Integrated** | Live state machine reassignment with audit preservation |
| Two-Stage Anti-Replay Tokens | **Genuinely Integrated** | Distinct pickup/drop-off codes; prevents token reuse |
| Safety Quarantine & Audit Trail | **Genuinely Integrated** | Instant batch locking and immutable event logging |
| Impact Metrics & CSV Export | **Genuinely Integrated** | Live reactive calculation with client-side CSV download |
| GIS Mapping / GPS Coordinates | *Simulated* | Interactive schematic route with seeded waypoint coordinates |
| Camera QR Scanner | *Simulated* | Viewfinder animation with instant optical token autofill |
| SMS OTP Gateway | *Simulated* | In-app token display simulating SMS/push delivery |

---

## 6. Signature Feature: 6-Phase "Rescue Mission" Live Demo

Judges can click **"Rescue Mission"** in the top navigation bar at any time to run an orchestrated live demonstration:

1. **Phase 1 (AI Forecast):** Grand Amber Hotel calculates 50-portion dinner surplus based on rainy weather.
2. **Phase 2 (Publish Listing):** 50 portions of Steamed Salmon Pilaf registered with thermal and allergen disclosure.
3. **Phase 3 (Constraint Matching):** Vets 6 hard constraints. Recommends Hope Harbor with a score of 94/100.
4. **Phase 4 (Courier Breakdown & Failover):** Assigned courier reports a punctured tire on 34th St. System re-evaluates 38m shelf-life and auto-reassigns to standby EV courier Alex Chen.
5. **Phase 5 (Pickup Verification):** Courier scans donor QR token `PKUP-101-782`. Package temperature verified at 66°C.
6. **Phase 6 (Drop-off & Impact Update):** Hope Harbor enters drop-off token `DROP-101-943`. System marks 50 meals delivered, avoids 22.5 kg waste, and prevents 56 kg CO2e.

---

## 7. Installation & Running Instructions

### Prerequisites
- Node.js version 18.0.0 or higher.
- npm version 9.0.0 or higher.

### Quick Start
```bash
# 1. Navigate to the project directory
cd "C:\Users\hp\.gemini\antigravity\scratch\foodbridge-ai"

# 2. Install dependencies (already executed)
npm install

# 3. Start development server
npm run dev

# 4. Or build and preview production bundle
npm run build
npm run preview
```
Open your browser at `http://localhost:5173`.

---

## 8. Test Checklist for Hackathon Judges

- [x] **Role Switching:** Click the top-right profile chip to toggle between Donor, NGO, Courier, Shelter, and Admin.
- [x] **Live Demo Clock:** Click `+15m`, `+1h`, or `+3h` in the top bar; observe how collection deadlines on the Perishability Radar shift into "Critical" or "Lapsed".
- [x] **AI Forecaster:** Move the footfall or weather sliders in *AI Surplus Forecast*; click *1-Click Create Donation Listing*.
- [x] **Constraint Verification:** In *AI Matching Hub*, inspect the Hard Constraint checklist to see why safe candidates passed and unsafe candidates were blocked.
- [x] **Dynamic Failover:** In *Logistics & Failover*, click *Simulate Carrier Failure & Trigger Failover*; observe instant reassignment to the closest standby EV courier.
- [x] **QR/OTP Verification:** In *QR / OTP Verification*, click *Simulate Camera Scan* or *Insert Demo Token*; test reusing the token to verify replay rejection.
- [x] **Quarantine Sentinel:** In *Safety & Quarantine*, report an incident; observe the affected batch become locked across the entire platform.
- [x] **Audit Trail & CSV Export:** Search the immutable ledger in *Admin Audit Trail* and download the CSV report in *Impact & Analytics*.

---

## 9. Production Roadmap

1. **Transactional Backend:** Migrate reactive localStorage state to PostgreSQL with PostGIS for real-world geographic routing and row-level locking during allocation splits.
2. **IoT Cold-Chain Telemetry:** Integrate Bluetooth Low Energy (BLE) temperature logger probes inside insulated delivery transport containers.
3. **Direct NGO Notifications:** Connect Twilio WhatsApp/SMS API for driver dispatch alerts.
4. **Regulatory HACCP Compliance:** Automated export of digital temperature custody logs for local health department inspections.

---

*Crafted with passion for zero food waste and zero hunger.*
