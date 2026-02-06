# NEON Energy Charity Impact Tracking System

## Overview

The Charity Impact Tracking System allows distributors to see the real-world environmental impact of their personal purchases and team sales. Each product contributes to specific charitable causes:

- **NEON Original**: Protects rainforest trees, habitats, and species
- **NEON Pink**: Saves animal lives in rainforests

## Impact Calculation Formulas

### NEON Original (Rainforest Protection)

**Per Can Impact:**
- Trees Protected: 0.5 trees per can
- Habitat Protected: 10 sq ft per can
- Species Lives Saved: 0.1 species per can

**Per Case Impact (24 cans):**
- Trees Protected: 12 trees per case
- Habitat Protected: 240 sq ft per case
- Species Lives Saved: 2.4 species per case

### NEON Pink (Animal Lives Saved)

**Per Can Impact:**
- Animal Lives Saved: 0.25 lives per can

**Per Case Impact (24 cans):**
- Animal Lives Saved: 6 lives per case

## Point Value System

### Product Points
- 1 can = 1 impact point
- 1 case (24 cans) = 24 impact points

### Impact Multipliers
- Personal purchases: 1x multiplier
- Team sales (direct recruits): 0.5x multiplier
- Team sales (downline): 0.25x multiplier

This encourages both personal consumption and team building.

## Database Schema

### charity_impact_tracking Table

```sql
CREATE TABLE charity_impact_tracking (
  id INT AUTO_INCREMENT PRIMARY KEY,
  distributorId INT NOT NULL,
  periodStart DATE NOT NULL,
  periodEnd DATE NOT NULL,
  
  -- Personal Impact
  personalCansOriginal INT DEFAULT 0,
  personalCansPink INT DEFAULT 0,
  personalTreesProtected DECIMAL(10,2) DEFAULT 0,
  personalHabitatProtected DECIMAL(10,2) DEFAULT 0,
  personalSpeciesSaved DECIMAL(10,2) DEFAULT 0,
  personalAnimalLivesSaved DECIMAL(10,2) DEFAULT 0,
  
  -- Team Impact
  teamCansOriginal INT DEFAULT 0,
  teamCansPink INT DEFAULT 0,
  teamTreesProtected DECIMAL(10,2) DEFAULT 0,
  teamHabitatProtected DECIMAL(10,2) DEFAULT 0,
  teamSpeciesSaved DECIMAL(10,2) DEFAULT 0,
  teamAnimalLivesSaved DECIMAL(10,2) DEFAULT 0,
  
  -- Totals
  totalTreesProtected DECIMAL(10,2) DEFAULT 0,
  totalHabitatProtected DECIMAL(10,2) DEFAULT 0,
  totalSpeciesSaved DECIMAL(10,2) DEFAULT 0,
  totalAnimalLivesSaved DECIMAL(10,2) DEFAULT 0,
  
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_distributorId (distributorId),
  INDEX idx_periodStart (periodStart)
);
```

## Calculation Logic

### Personal Impact Calculation

When a distributor places an order:

```typescript
const cansOriginal = order.items.filter(i => i.productSku === 'NEON-ORIGINAL').reduce((sum, i) => sum + i.quantity, 0);
const cansPink = order.items.filter(i => i.productSku === 'NEON-PINK').reduce((sum, i) => sum + i.quantity, 0);

const impact = {
  treesProtected: cansOriginal * 0.5,
  habitatProtected: cansOriginal * 10,
  speciesSaved: cansOriginal * 0.1,
  animalLivesSaved: cansPink * 0.25
};
```

### Team Impact Calculation

Aggregate all orders from team members (downline):

```typescript
const teamOrders = await getTeamOrders(distributorId, periodStart, periodEnd);

let teamCansOriginal = 0;
let teamCansPink = 0;

for (const order of teamOrders) {
  teamCansOriginal += order.items.filter(i => i.productSku === 'NEON-ORIGINAL').reduce((sum, i) => sum + i.quantity, 0);
  teamCansPink += order.items.filter(i => i.productSku === 'NEON-PINK').reduce((sum, i) => sum + i.quantity, 0);
}

const teamImpact = {
  treesProtected: teamCansOriginal * 0.5,
  habitatProtected: teamCansOriginal * 10,
  speciesSaved: teamCansOriginal * 0.1,
  animalLivesSaved: teamCansPink * 0.25
};
```

## Dashboard UI Components

### Impact Summary Cards

```
┌─────────────────────────────────────┐
│  🌳 Trees Protected                 │
│  Personal: 125 trees                │
│  Team: 1,450 trees                  │
│  Total: 1,575 trees                 │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  🏞️ Habitat Protected               │
│  Personal: 2,500 sq ft              │
│  Team: 29,000 sq ft                 │
│  Total: 31,500 sq ft                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  🦜 Species Lives Saved             │
│  Personal: 25 species               │
│  Team: 290 species                  │
│  Total: 315 species                 │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  🐾 Animal Lives Saved (Pink)       │
│  Personal: 62 animals               │
│  Team: 725 animals                  │
│  Total: 787 animals                 │
└─────────────────────────────────────┘
```

### Impact Visualization

- Progress bars showing personal vs team contribution
- Line chart showing impact growth over time
- Milestone badges (100 trees, 1,000 trees, 10,000 trees, etc.)
- Leaderboard showing top impact makers

### Messaging

**NEON Original:**
> "Help protect animals and habitats in the world's rainforests every time you drink NEON Original. Each can protects 0.5 trees, 10 sq ft of habitat, and helps save 0.1 species."

**NEON Pink:**
> "Help save animal lives in the world's rainforests every time you drink NEON Pink. Each can helps save 0.25 animal lives."

## Integration Points

### Order Completion Hook

When an order is completed:
1. Calculate impact based on order items
2. Update distributor's personal impact totals
3. Propagate impact up the tree (update all upline team totals)
4. Send notification to distributor about their impact
5. Check for milestone achievements

### Team Sales Tracking

When calculating team impact:
1. Get all downline distributors
2. Query their orders for the period
3. Aggregate product quantities
4. Calculate total team impact
5. Store in charity_impact_tracking table

### Real-Time Updates

- Impact counters update immediately on order completion
- Team impact recalculated daily (cron job)
- Milestone notifications sent in real-time
- Monthly impact summary emails

## Milestones & Achievements

### Personal Milestones
- 🌱 First Impact: 10 cans
- 🌿 Growing: 100 cans
- 🌳 Forest Guardian: 500 cans
- 🏞️ Habitat Hero: 1,000 cans
- 🌍 Earth Champion: 5,000 cans

### Team Milestones
- 👥 Team Start: 100 team cans
- 🤝 Team Builder: 1,000 team cans
- 🏆 Team Leader: 5,000 team cans
- 💎 Team Champion: 10,000 team cans
- 👑 Impact Legend: 50,000 team cans

## API Endpoints

### Get Impact Summary
```
GET /api/trpc/impact.getSummary
Input: { distributorId, periodStart?, periodEnd? }
Output: { personal, team, total, milestones }
```

### Get Impact History
```
GET /api/trpc/impact.getHistory
Input: { distributorId, limit? }
Output: { periods: [{ periodStart, periodEnd, impact }] }
```

### Get Impact Leaderboard
```
GET /api/trpc/impact.getLeaderboard
Input: { type: 'personal' | 'team', limit? }
Output: { leaders: [{ distributorId, name, impact }] }
```

## Performance Considerations

### Caching Strategy
- Cache impact totals for 1 hour
- Invalidate cache on order completion
- Pre-calculate team impact daily

### Query Optimization
- Index on distributorId and periodStart
- Aggregate queries use covering indexes
- Batch updates for team impact propagation

## Future Enhancements

1. **Charity Partner Integration**: Show which specific charities receive donations
2. **Impact Certificates**: Generate PDF certificates for major milestones
3. **Social Sharing**: Allow distributors to share their impact on social media
4. **Impact Challenges**: Monthly team challenges with bonus rewards
5. **Impact Visualization Map**: Show geographic distribution of impact
6. **Carbon Offset Tracking**: Add CO2 offset calculations
7. **Water Conservation**: Track water saved through sustainable practices

## Compliance & Transparency

- All impact calculations based on verified charity partnerships
- Annual third-party audit of impact claims
- Transparent reporting of donation amounts
- Regular updates on charity projects funded
- Impact reports published quarterly

## Conclusion

The Charity Impact Tracking System transforms every NEON purchase into a measurable contribution to environmental conservation. By showing distributors the real-world impact of their efforts, we create a powerful emotional connection to the brand and motivate continued engagement.

**Key Benefits:**
- Increases distributor pride and engagement
- Provides shareable social proof
- Differentiates NEON from competitors
- Aligns with consumer values (sustainability)
- Creates additional motivation beyond financial rewards
