# NEON Energy MLM Compensation Plan - Technical Design Document

## Overview

This document defines the complete compensation plan system for NEON Energy's binary MLM structure, including commission calculations, rank advancement rules, and real-time earnings tracking.

## Binary Tree Structure

### Core Principles
- **Two-Leg System**: Every distributor has exactly 2 positions (left leg and right leg)
- **Unlimited Depth**: Tree can grow infinitely deep
- **Spillover Logic**: New distributors are placed in next available position when direct positions are filled
- **Sponsor vs Parent**: Sponsor is who recruited; Parent is who they're placed under

### Placement Rules
1. **Direct Placement**: First two recruits go directly under sponsor (left, then right)
2. **Spillover Placement**: Additional recruits spill to next available position in sponsor's downline
3. **Placement Preference**: Weaker leg priority (balance the tree automatically)

## Commission Types

### 1. Retail Commission (20%)
- **Trigger**: Customer makes purchase through distributor's replicated website
- **Calculation**: 20% of order total
- **Payment**: Immediate upon order completion
- **Example**: Customer orders $100 → Distributor earns $20

### 2. Binary Team Commission (10% of weaker leg)
- **Trigger**: Weekly payout cycle
- **Calculation**: 10% of weaker leg's total volume
- **Weaker Leg**: The leg (left or right) with lower total sales volume
- **Carry Forward**: Excess volume from stronger leg carries to next week
- **Cap**: Maximum $5,000 per week per distributor
- **Example**: 
  - Left leg: $10,000 volume
  - Right leg: $6,000 volume
  - Weaker leg: $6,000
  - Commission: $6,000 × 10% = $600
  - Carry forward: $4,000 to next cycle

### 3. Fast Start Bonus (25%)
- **Trigger**: New distributor enrolls and purchases starter package
- **Calculation**: 25% of enrollment package price
- **Eligibility**: Only for distributors within first 90 days
- **Payment**: Immediate upon enrollment completion
- **Example**: New distributor buys $500 Elite package → Sponsor earns $125

### 4. Rank Achievement Bonus (One-time)
- **Trigger**: Distributor advances to new rank
- **Payment**: One-time bonus upon rank qualification
- **Amounts**:
  - Bronze: $100
  - Silver: $250
  - Gold: $500
  - Platinum: $1,000
  - Diamond: $2,500
  - Crown Diamond: $5,000
  - Royal Diamond: $10,000

### 5. Matching Bonus (10% of downline earnings)
- **Trigger**: Direct recruit earns commission
- **Calculation**: 10% of direct recruit's total weekly earnings
- **Depth**: Only direct recruits (1 level deep)
- **Example**: Direct recruit earns $1,000 → You earn $100 matching bonus

## Rank Advancement System

### Rank Qualification Rules

#### Starter (Default)
- **Requirements**: Enrolled with any package
- **Benefits**: Eligible for all commission types

#### Bronze
- **Requirements**:
  - Personal Volume (PV): 100 PV/month
  - Team Volume: 1,000 TV/month
  - Active Legs: 2 active legs (at least 1 active distributor in each)
- **Benefits**: All commissions + Bronze achievement bonus

#### Silver
- **Requirements**:
  - Personal Volume: 150 PV/month
  - Team Volume: 5,000 TV/month
  - Active Legs: 2 legs with at least 2,000 TV each
- **Benefits**: All commissions + Silver achievement bonus + 5% team bonus increase

#### Gold
- **Requirements**:
  - Personal Volume: 200 PV/month
  - Team Volume: 15,000 TV/month
  - Active Legs: 2 legs with at least 5,000 TV each
  - Active Distributors: At least 5 active distributors in downline
- **Benefits**: All commissions + Gold achievement bonus + 10% team bonus increase

#### Platinum
- **Requirements**:
  - Personal Volume: 250 PV/month
  - Team Volume: 50,000 TV/month
  - Active Legs: 2 legs with at least 20,000 TV each
  - Active Distributors: At least 15 active distributors in downline
- **Benefits**: All commissions + Platinum achievement bonus + 15% team bonus increase + Car bonus eligibility

#### Diamond
- **Requirements**:
  - Personal Volume: 300 PV/month
  - Team Volume: 150,000 TV/month
  - Active Legs: 2 legs with at least 60,000 TV each
  - Active Distributors: At least 50 active distributors in downline
  - Leadership: At least 3 Gold or higher in downline
- **Benefits**: All commissions + Diamond achievement bonus + 20% team bonus increase + Car bonus + Travel incentives

#### Crown Diamond
- **Requirements**:
  - Personal Volume: 350 PV/month
  - Team Volume: 500,000 TV/month
  - Active Legs: 2 legs with at least 200,000 TV each
  - Active Distributors: At least 150 active distributors in downline
  - Leadership: At least 5 Platinum or higher in downline
- **Benefits**: All commissions + Crown Diamond achievement bonus + 25% team bonus increase + Luxury car bonus + International trips

#### Royal Diamond
- **Requirements**:
  - Personal Volume: 400 PV/month
  - Team Volume: 1,500,000 TV/month
  - Active Legs: 2 legs with at least 600,000 TV each
  - Active Distributors: At least 500 active distributors in downline
  - Leadership: At least 10 Diamond or higher in downline
- **Benefits**: All commissions + Royal Diamond achievement bonus + 30% team bonus increase + Equity participation + Presidential retreats

### Rank Maintenance
- **Monthly Check**: Ranks are evaluated monthly
- **Grace Period**: 2 consecutive months below qualification = rank drop
- **Re-qualification**: Can re-qualify for rank at any time by meeting requirements

## Volume Calculations

### Personal Volume (PV)
- **Definition**: Sales volume from distributor's own purchases and direct customer orders
- **Calculation**: Sum of all order totals from distributor's replicated website
- **Period**: Rolling 30 days

### Team Volume (TV)
- **Definition**: Total sales volume from entire downline (both legs)
- **Calculation**: Sum of all PV from all downline distributors
- **Period**: Rolling 30 days
- **Includes**: Personal volume + all downline volume

### Business Volume (BV)
- **Definition**: Commissionable value assigned to each product
- **Calculation**: Typically 70-80% of retail price
- **Usage**: Used for commission calculations instead of actual dollar amounts

## Commission Calculation Engine

### Weekly Payout Cycle
1. **Sunday 11:59 PM**: Cycle closes
2. **Monday 12:00 AM**: Calculations begin
3. **Monday 6:00 AM**: Commissions posted to distributor accounts
4. **Monday 9:00 AM**: Email notifications sent

### Calculation Steps
1. Calculate all retail commissions from week's orders
2. Calculate each distributor's leg volumes (left and right)
3. Identify weaker leg for each distributor
4. Calculate binary team commission (10% of weaker leg)
5. Apply weekly cap ($5,000)
6. Carry forward excess volume from stronger leg
7. Calculate matching bonuses on direct recruits' earnings
8. Check rank qualifications and award rank bonuses
9. Post all commissions to distributor balances
10. Send notifications

### Commission Caps and Limits
- **Weekly Binary Cap**: $5,000 per distributor
- **Monthly Total Cap**: $25,000 per distributor
- **Minimum Payout**: $50 (must accumulate to this amount before withdrawal)
- **Flush vs Carry Forward**: Excess volume carries forward (no flush)

## Database Schema Requirements

### New Tables Needed

#### `binary_tree_positions`
- `id`: Primary key
- `distributor_id`: Foreign key to distributors
- `parent_id`: Foreign key to distributors (who they're placed under)
- `sponsor_id`: Foreign key to distributors (who recruited them)
- `position`: ENUM('left', 'right')
- `depth_level`: Integer (how many levels deep)
- `created_at`: Timestamp

#### `commission_transactions`
- `id`: Primary key
- `distributor_id`: Foreign key
- `commission_type`: ENUM('retail', 'binary', 'fast_start', 'rank_bonus', 'matching')
- `amount`: Integer (cents)
- `source_order_id`: Foreign key to orders (nullable)
- `source_distributor_id`: Foreign key to distributors (for matching bonus)
- `calculation_details`: JSON (stores calculation breakdown)
- `payout_cycle`: Date (which week/month this belongs to)
- `status`: ENUM('pending', 'paid', 'cancelled')
- `created_at`: Timestamp

#### `leg_volumes`
- `id`: Primary key
- `distributor_id`: Foreign key
- `period_start`: Date
- `period_end`: Date
- `left_leg_volume`: Integer (cents)
- `right_leg_volume`: Integer (cents)
- `left_leg_pv`: Integer
- `right_leg_pv`: Integer
- `carry_forward_left`: Integer (cents)
- `carry_forward_right`: Integer (cents)
- `created_at`: Timestamp

#### `rank_history`
- `id`: Primary key
- `distributor_id`: Foreign key
- `previous_rank`: ENUM(ranks)
- `new_rank`: ENUM(ranks)
- `qualification_date`: Date
- `qualification_details`: JSON (PV, TV, active legs, etc.)
- `bonus_paid`: Boolean
- `bonus_amount`: Integer (cents)
- `created_at`: Timestamp

## Real-Time Tracking Requirements

### Dashboard Metrics
- **Current Balance**: Available for withdrawal
- **Pending Commissions**: Not yet in payout cycle
- **This Week's Earnings**: Running total
- **This Month's Earnings**: Running total
- **Lifetime Earnings**: All-time total
- **Current Rank**: With progress to next rank
- **Team Size**: Total active distributors
- **Left Leg Volume**: Current cycle
- **Right Leg Volume**: Current cycle

### Team Analytics
- **Active Distributors**: Count by leg
- **Total Team Volume**: By leg and combined
- **New Enrollments**: This week/month
- **Team Growth Rate**: Percentage change
- **Top Performers**: Highest earners in downline
- **Rank Distribution**: Count of each rank in downline

## Integration Points

### Order Placement
1. Customer completes order on replicated website
2. Extract distributor ID from URL/subdomain
3. Create order record with distributor attribution
4. Calculate and post retail commission (20%)
5. Add order volume to distributor's PV
6. Propagate volume up the tree (add to all upline TV)
7. Update leg volumes for all upline distributors
8. Send notification to distributor

### Distributor Enrollment
1. New distributor completes enrollment form
2. Identify sponsor from referral link
3. Determine placement position (left/right via algorithm)
4. Create binary_tree_positions record
5. Calculate and post fast start bonus to sponsor
6. Add enrollment package volume to sponsor's PV
7. Propagate volume up the tree
8. Send notifications to sponsor and new distributor

### Weekly Commission Run
1. Trigger: Cron job every Monday 12:00 AM
2. For each distributor:
   - Calculate leg volumes
   - Determine weaker leg
   - Calculate binary commission
   - Apply caps
   - Calculate carry forward
3. For each commission earned:
   - Calculate matching bonuses for sponsors
4. Check rank qualifications
5. Post all transactions
6. Send email summaries

## Testing Scenarios

### Scenario 1: Simple Binary Commission
- Distributor A has 2 direct recruits (B on left, C on right)
- B generates $1,000 in sales
- C generates $1,500 in sales
- Expected: A earns $100 (10% of $1,000 weaker leg)
- Carry forward: $500 to next cycle

### Scenario 2: Spillover Placement
- Distributor A recruits D (3rd recruit)
- A's left and right are full
- D should spill to next available position
- Placement preference: weaker leg
- Expected: D placed under B or C depending on volumes

### Scenario 3: Rank Advancement
- Distributor A currently Bronze
- Achieves 150 PV, 5,000 TV, balanced legs
- Expected: Promoted to Silver + $250 bonus

### Scenario 4: Matching Bonus
- Distributor A sponsors B
- B earns $1,000 in commissions this week
- Expected: A earns $100 matching bonus

### Scenario 5: Commission Cap
- Distributor A's weaker leg has $60,000 volume
- Normal commission: $6,000
- Expected: Capped at $5,000
- Carry forward: None (cap applies to payout, not volume)

## LLM Monitoring System (Future Enhancement)

### Data Validation Checks
- Verify all commission calculations are mathematically correct
- Ensure no duplicate commission postings
- Validate tree structure integrity (no orphans, no cycles)
- Check for volume discrepancies between legs
- Verify rank qualifications match actual metrics

### Anomaly Detection
- Unusual commission spikes (potential fraud)
- Rapid tree growth (potential bot activity)
- Volume inconsistencies (data corruption)
- Missing commission postings (system errors)

### Self-Healing Actions
- Recalculate incorrect commissions
- Repair broken tree relationships
- Backfill missing volume propagation
- Correct rank assignments
- Generate audit reports for manual review

## Performance Considerations

### Optimization Strategies
- **Indexed Queries**: Index on distributor_id, sponsor_id, parent_id
- **Cached Calculations**: Cache leg volumes for 1 hour
- **Batch Processing**: Process commissions in batches of 100
- **Async Jobs**: Run heavy calculations in background workers
- **Read Replicas**: Use read replicas for dashboard queries

### Scalability Targets
- Support 10,000+ active distributors
- Process weekly commission run in < 30 minutes
- Handle 1,000+ concurrent dashboard users
- Real-time order processing (< 2 seconds)
- Tree traversal queries (< 500ms)

## Compliance and Legal

### Requirements
- Accurate commission tracking and reporting
- Transparent calculation methodology
- Audit trail for all transactions
- Tax reporting (1099 generation)
- Payout verification and reconciliation
- FTC compliance for income claims

### Audit Trail
- Log all commission calculations with details
- Store calculation formulas and inputs
- Track all rank changes with justification
- Record all payout requests and completions
- Maintain historical volume data for 7 years

## Next Steps

1. ✅ Design document complete
2. ⏳ Implement database schema changes
3. ⏳ Build binary tree placement logic
4. ⏳ Create commission calculation engine
5. ⏳ Implement rank advancement system
6. ⏳ Build earnings tracking dashboard
7. ⏳ Create genealogy tree visualization
8. ⏳ Integrate with order and enrollment workflows
9. ⏳ Test all scenarios
10. ⏳ Deploy to production
