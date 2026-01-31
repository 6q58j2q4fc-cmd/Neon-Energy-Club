# NEON Energy MLM Platform Architecture

## Executive Summary

This document outlines the comprehensive technical architecture for the NEON Energy multi-level marketing (MLM) platform, designed to serve five distinct user personas: Customers, Subscribers, Distributors, Franchisees, and Vending Machine Owners.

---

## Technical Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | Core UI framework with concurrent features |
| **TypeScript** | Type-safe development |
| **Tailwind CSS 4** | Utility-first styling with OKLCH colors |
| **Wouter** | Lightweight client-side routing |
| **TanStack Query** | Server state management via tRPC |
| **Shadcn/UI** | Accessible component library |

### Backend
| Technology | Purpose |
|------------|---------|
| **Express 4** | HTTP server framework |
| **tRPC 11** | End-to-end type-safe API layer |
| **Drizzle ORM** | Type-safe database queries |
| **TiDB/MySQL** | Distributed SQL database |
| **Redis** | Session caching & rate limiting |
| **JWT** | Stateless authentication tokens |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| **Manus Cloud** | Managed hosting with auto-scaling |
| **S3-compatible Storage** | File uploads & media storage |
| **CDN** | Global asset distribution |
| **WebSocket** | Real-time notifications |

### Security
| Feature | Implementation |
|---------|----------------|
| **MFA** | TOTP-based two-factor authentication |
| **SSL/TLS** | All data encrypted in transit |
| **Automated Backups** | Daily snapshots with 30-day retention |
| **Rate Limiting** | 100 req/min general, 5 req/15min auth |

---

## MLM Commission Engine

### Compensation Plan Structure: Binary + Unilevel Hybrid

```
                    [Sponsor]
                       │
          ┌────────────┴────────────┐
          │                         │
     [Left Leg]              [Right Leg]
          │                         │
    ┌─────┴─────┐            ┌─────┴─────┐
    │           │            │           │
 [L1-L]      [L1-R]       [R1-L]      [R1-R]
```

### Commission Types

| Commission Type | Rate | Trigger |
|-----------------|------|---------|
| **Direct Referral** | 20% | First purchase by referred customer |
| **Binary Volume** | 10% | Matched volume on weaker leg |
| **Unilevel Override** | 5-15% | Team sales (7 levels deep) |
| **Rank Advancement** | $50-$5,000 | One-time bonus per rank |
| **Leadership Pool** | 2% | Global sales pool for top ranks |

### Rank Structure

| Rank | Personal Volume | Team Volume | Binary Legs | Monthly Bonus |
|------|-----------------|-------------|-------------|---------------|
| Starter | $0 | $0 | 0 | $0 |
| Bronze | $100 | $500 | 2 | $50 |
| Silver | $200 | $2,000 | 4 | $150 |
| Gold | $300 | $10,000 | 8 | $500 |
| Platinum | $500 | $50,000 | 16 | $2,000 |
| Diamond | $1,000 | $250,000 | 32 | $10,000 |
| Crown | $2,000 | $1,000,000 | 64 | $50,000 |

### Real-Time Point Tracking

```typescript
interface VolumeTracking {
  personalVolume: number;      // PV from personal purchases
  leftLegVolume: number;       // Binary left leg total
  rightLegVolume: number;      // Binary right leg total
  teamVolume: number;          // Unilevel team total
  carryoverVolume: number;     // Unmatched volume from previous period
  qualifyingVolume: number;    // Volume counting toward rank
}
```

### Spillover Logic

1. **Placement Preference**: New recruits placed in weaker leg by default
2. **Sponsor Override**: Sponsors can manually place in either leg
3. **Auto-Balance**: System suggests optimal placement for team growth
4. **Carryover Rules**: Unmatched volume carries forward (max 3 periods)

---

## Sitemap

```
/                           → Homepage (public)
├── /story                  → Brand story & mission
├── /products               → Product catalog
│   ├── /products/:id       → Product detail
│   └── /products/compare   → Product comparison
├── /celebrities            → Celebrity endorsements
├── /franchise              → Territory opportunities
│   ├── /franchise/map      → Interactive territory map
│   └── /franchise/apply    → Application form
├── /vending                → Vending machine info
├── /nfts                   → NFT gallery
├── /give-back              → Charity partnerships
├── /join                   → Distributor signup
├── /crowdfunding           → Crowdfunding tiers
│
├── /customer-portal        → Customer dashboard
│   ├── /orders             → Order history
│   ├── /referrals          → 3-for-Free program
│   └── /profile            → Account settings
│
├── /distributor            → Distributor dashboard
│   ├── /team               → Genealogy tree
│   ├── /commissions        → Earnings & payouts
│   ├── /leads              → Lead capture pages
│   ├── /marketing          → Marketing materials
│   ├── /training           → Training modules
│   ├── /autoship           → Auto-ship management
│   └── /website            → Vanity page editor
│
├── /franchise-portal       → Franchisee dashboard
│   ├── /territory          → Territory management
│   ├── /machines           → Vending machine fleet
│   ├── /inventory          → Stock levels
│   ├── /reports            → Regional analytics
│   └── /supply-chain       → Order management
│
├── /vending-portal         → Vending owner dashboard
│   ├── /machines           → Machine status
│   ├── /inventory          → Stock alerts
│   ├── /revenue            → Earnings per machine
│   ├── /maintenance        → Service requests
│   └── /analytics          → Performance metrics
│
└── /admin                  → Admin panel
    ├── /users              → User management
    ├── /commissions        → Commission processing
    ├── /territories        → Territory assignments
    ├── /machines           → IoT fleet management
    └── /reports            → System analytics
```

---

## Persona Journey Maps

### 1. Vending Machine Owner Journey

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    VENDING MACHINE OWNER JOURNEY                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  AWARENESS          CONSIDERATION        PURCHASE         ONBOARDING   │
│  ─────────          ─────────────        ────────         ──────────   │
│                                                                         │
│  • Sees ad for      • Visits /vending    • Selects        • Receives   │
│    passive income   • Uses ROI           • machine         welcome     │
│  • Clicks           • calculator         • package         email       │
│    "Learn More"     • Views territory    • Completes      • Accesses   │
│                     • map                • payment         dashboard   │
│                     • Reads FAQ          • Signs           • Schedules │
│                                          • agreement       install     │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ACTIVATION         ENGAGEMENT           RETENTION        ADVOCACY     │
│  ──────────         ──────────           ─────────        ────────     │
│                                                                         │
│  • Machine          • Monitors real-     • Receives       • Refers     │
│    installed        • time sales         • monthly         other       │
│  • First sale       • Tracks inventory   • payouts         owners      │
│    notification     • Views analytics    • Upgrades to    • Shares     │
│  • Dashboard        • Schedules          • more            success     │
│    tutorial         • maintenance        • machines        story       │
│                     • Optimizes          • Joins owner    • Earns      │
│                     • placement          • community       referral    │
│                                                            bonus       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Key Features for Vending Machine Owners

| Feature | Description | Dashboard Location |
|---------|-------------|-------------------|
| **Live Machine Status** | Real-time connectivity, temperature, stock levels | /vending-portal/machines |
| **Revenue Tracking** | Per-machine earnings with hourly/daily/monthly views | /vending-portal/revenue |
| **Inventory Alerts** | Push notifications when stock drops below threshold | /vending-portal/inventory |
| **Maintenance Requests** | One-click service ticket creation with photo upload | /vending-portal/maintenance |
| **Performance Analytics** | Heat maps, peak hours, product popularity | /vending-portal/analytics |
| **Payout History** | Commission statements, tax documents | /vending-portal/payouts |

#### IoT Integration Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Vending    │     │   IoT        │     │   NEON       │
│   Machine    │────▶│   Gateway    │────▶│   Backend    │
│   (Sensors)  │     │   (MQTT)     │     │   (tRPC)     │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       ▼                    ▼                    ▼
  • Temperature        • Message Queue      • Real-time DB
  • Stock Level        • Data Transform     • Alert Engine
  • Door Status        • Health Check       • Analytics
  • Payment Events     • Retry Logic        • Notifications
```

---

### 2. Distributor Journey

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       DISTRIBUTOR JOURNEY                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  DISCOVERY          ENROLLMENT          ACTIVATION       BUILDING      │
│  ─────────          ──────────          ──────────       ────────      │
│                                                                         │
│  • Referred by      • Visits /join      • Completes      • Shares      │
│    existing         • Watches comp      • first order     referral     │
│    distributor      • plan video        • Sets up         link         │
│  • Sees income      • Fills signup      • vanity page    • Invites     │
│    opportunity      • form              • Watches         contacts     │
│  • Attends          • Selects starter   • training       • Hosts       │
│    webinar          • kit               • videos          parties      │
│                     • Pays enrollment   • Joins team     • Uses lead   │
│                     • fee               • chat            capture      │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  GROWING            LEADING             SCALING          LEGACY        │
│  ───────            ───────             ───────          ──────        │
│                                                                         │
│  • Achieves         • Mentors new       • Builds         • Earns       │
│    Bronze rank      • distributors      • multiple        leadership   │
│  • First            • Runs team         • legs            pool         │
│    commission       • meetings          • Achieves       • Speaks at   │
│    payout           • Creates           • Diamond         events       │
│  • Builds           • training          • rank           • Trains      │
│    team of 5+       • content           • Passive         leaders      │
│  • Earns            • Achieves          • income         • Builds      │
│    rank bonus       • Gold rank         • streams         dynasty      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Key Features for Distributors

| Feature | Description | Dashboard Location |
|---------|-------------|-------------------|
| **Genealogy Tree** | Visual binary + unilevel tree with drill-down | /distributor/team |
| **Lead Capture Pages** | Customizable landing pages with analytics | /distributor/leads |
| **Referral Link Generator** | Unique tracking links with QR codes | /distributor/website |
| **Commission Dashboard** | Real-time earnings, pending, paid amounts | /distributor/commissions |
| **Rank Progress** | Visual progress bar with requirements checklist | /distributor (main) |
| **Auto-Ship Management** | Recurring order setup with volume tracking | /distributor/autoship |
| **Marketing Materials** | Downloadable graphics, videos, scripts | /distributor/marketing |
| **Training Academy** | Video courses with completion certificates | /distributor/training |

#### Genealogy Tree Visualization

```
                         ┌─────────────┐
                         │   YOU       │
                         │  Diamond    │
                         │  PV: $500   │
                         └──────┬──────┘
                                │
           ┌────────────────────┴────────────────────┐
           │                                         │
    ┌──────┴──────┐                          ┌──────┴──────┐
    │  LEFT LEG   │                          │ RIGHT LEG   │
    │  Gold       │                          │  Silver     │
    │  TV: $8,500 │                          │  TV: $3,200 │
    └──────┬──────┘                          └──────┬──────┘
           │                                        │
    ┌──────┴──────┐                          ┌──────┴──────┐
    │             │                          │             │
 ┌──┴──┐      ┌──┴──┐                    ┌──┴──┐      ┌──┴──┐
 │ L1  │      │ L2  │                    │ R1  │      │ R2  │
 │$2.1K│      │$1.8K│                    │$1.5K│      │$900 │
 └─────┘      └─────┘                    └─────┘      └─────┘
```

---

## Zero-Friction Navigation Principles

### 3-Click Rule Implementation

Every critical action must be reachable within 3 clicks:

| Action | Path | Clicks |
|--------|------|--------|
| View earnings | Dashboard → Commissions | 2 |
| Share referral link | Dashboard → Copy Link | 2 |
| Check machine status | Dashboard → Machines → Select | 3 |
| Request payout | Dashboard → Payouts → Request | 3 |
| View team member | Dashboard → Team → Select | 3 |

### Mobile-First Responsive Breakpoints

```css
/* Tailwind breakpoints */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet portrait */
lg: 1024px  /* Tablet landscape / Small laptop */
xl: 1280px  /* Desktop */
2xl: 1536px /* Large desktop */
```

### Navigation Consistency

All pages share:
- **Header**: Logo, main nav, search, cart, user dropdown, language switcher
- **Footer**: Company links, legal links, social icons
- **Mobile**: Hamburger menu with full navigation tree
- **Dropdowns**: Consistent hover/click behavior across all menus

---

## High Traffic Optimization

### Scalability Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CDN LAYER                               │
│                    (Static Assets, Images)                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      LOAD BALANCER                              │
│                    (Auto-scaling groups)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  App Server 1 │     │  App Server 2 │     │  App Server N │
│   (Express)   │     │   (Express)   │     │   (Express)   │
└───────────────┘     └───────────────┘     └───────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       REDIS CLUSTER                             │
│              (Sessions, Rate Limiting, Caching)                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TiDB DISTRIBUTED DB                          │
│              (Auto-sharding, HTAP workloads)                    │
└─────────────────────────────────────────────────────────────────┘
```

### Caching Strategy

| Cache Layer | TTL | Content |
|-------------|-----|---------|
| **CDN** | 1 year | Static assets (JS, CSS, images) |
| **Redis** | 5 min | Session data, rate limit counters |
| **Redis** | 1 hour | Product catalog, pricing |
| **Redis** | 15 min | Genealogy tree snapshots |
| **Browser** | 24 hours | User preferences, cart |

### 99.9% Uptime Guarantees

- **Health checks**: Every 30 seconds
- **Auto-restart**: Failed containers replaced in <60s
- **Database failover**: Automatic replica promotion
- **Backup recovery**: Point-in-time restore within 5 minutes

---

## Quality Assurance Testing Suite

### Test Categories

```
tests/
├── unit/                    # Isolated function tests
│   ├── commission.test.ts   # Commission calculations
│   ├── rank.test.ts         # Rank advancement logic
│   └── volume.test.ts       # Volume tracking
│
├── integration/             # API endpoint tests
│   ├── auth.test.ts         # Login/logout flows
│   ├── distributor.test.ts  # Distributor operations
│   └── vending.test.ts      # Vending machine APIs
│
└── e2e/                     # Full user journey tests
    ├── customer.spec.ts     # Customer checkout flow
    ├── distributor.spec.ts  # Distributor signup → first sale
    └── vending.spec.ts      # Machine owner onboarding
```

### Critical Path Validation

| User Path | Test Coverage |
|-----------|---------------|
| Customer checkout | Form validation, payment, confirmation |
| Distributor signup | Form, payment, dashboard access |
| Referral tracking | Link generation, click tracking, attribution |
| Commission payout | Calculation, approval, transfer |
| Machine status | IoT connection, data sync, alerts |

### Broken Path Prevention

All forms validated for:
- Required field completion
- Email format validation
- Phone number formatting
- Password strength requirements
- Payment card validation
- Address verification

All redirects tested for:
- Login redirect after protected page access
- Post-payment redirect to confirmation
- Error page redirects with recovery options
- Session timeout handling

---

## Security Implementation

### Multi-Factor Authentication (MFA)

```typescript
// MFA flow for distributor/owner accounts
interface MFASetup {
  userId: string;
  secret: string;           // TOTP secret
  backupCodes: string[];    // 10 one-time codes
  enabledAt: Date;
  lastUsed: Date;
}

// Required for:
// - Distributor portal access
// - Vending owner portal access
// - Franchise portal access
// - Admin panel access
// - Payout requests > $100
```

### Data Encryption

| Data Type | At Rest | In Transit |
|-----------|---------|------------|
| Passwords | bcrypt (12 rounds) | TLS 1.3 |
| Payment info | Not stored (Stripe) | TLS 1.3 |
| Personal data | AES-256 | TLS 1.3 |
| Session tokens | JWT (HS256) | TLS 1.3 |

### Automated Backups

- **Frequency**: Every 6 hours
- **Retention**: 30 days
- **Recovery time**: < 5 minutes
- **Test restores**: Weekly automated verification

---

## Implementation Roadmap

### Phase 1: Core Platform (Weeks 1-4)
- [ ] User authentication with MFA
- [ ] Customer portal with 3-for-Free
- [ ] Basic distributor dashboard
- [ ] Product catalog and checkout

### Phase 2: MLM Engine (Weeks 5-8)
- [ ] Binary tree implementation
- [ ] Commission calculation engine
- [ ] Rank advancement system
- [ ] Payout processing

### Phase 3: Territory & Vending (Weeks 9-12)
- [ ] Territory management system
- [ ] Vending machine IoT integration
- [ ] Franchisee dashboard
- [ ] Regional analytics

### Phase 4: Optimization (Weeks 13-16)
- [ ] Performance optimization
- [ ] Mobile app development
- [ ] Advanced analytics
- [ ] API documentation

---

## Conclusion

This architecture provides a scalable, secure, and user-friendly platform for the NEON Energy MLM ecosystem. The modular design allows for incremental development while maintaining consistency across all user personas.

**Next Steps:**
1. Confirm user journey maps for Vending Machine Owner and Distributor
2. Review and approve technical stack selections
3. Begin Phase 1 implementation

---

*Document Version: 1.0*
*Last Updated: January 31, 2026*
*Author: NEON Development Team*
