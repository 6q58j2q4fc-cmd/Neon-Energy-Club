-- Performance Optimization Indexes for NEON Energy MLM Platform
-- These indexes will significantly improve query performance at scale (1000+ users)
-- Estimated performance improvement: 3-5x faster queries on high-traffic tables

-- ============================================
-- GENEALOGY TABLE INDEXES
-- ============================================
-- Speeds up team tree queries and upline lookups
CREATE INDEX IF NOT EXISTS idx_genealogy_upline ON genealogy(uplineId, level);
CREATE INDEX IF NOT EXISTS idx_genealogy_distributor ON genealogy(distributorId);
CREATE INDEX IF NOT EXISTS idx_genealogy_depth ON genealogy(level, createdAt);

-- ============================================
-- COMMISSIONS TABLE INDEXES
-- ============================================
-- Speeds up commission history and payout calculations
CREATE INDEX IF NOT EXISTS idx_commissions_distributor_date ON commissions(distributorId, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_commissions_type ON commissions(commissionType, distributorId);
CREATE INDEX IF NOT EXISTS idx_commissions_payout ON commissions(payoutStatus, createdAt);

-- ============================================
-- DISTRIBUTORS TABLE INDEXES
-- ============================================
-- Speeds up team queries and rank-based filtering
CREATE INDEX IF NOT EXISTS idx_distributors_sponsor ON distributors(sponsorId, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_distributors_rank ON distributors(currentRank, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_distributors_user ON distributors(userId);
CREATE INDEX IF NOT EXISTS idx_distributors_status ON distributors(status, currentRank);

-- ============================================
-- ORDERS TABLE INDEXES
-- ============================================
-- Speeds up customer order history and status filtering
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customerId, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_orders_distributor ON orders(distributorId, createdAt DESC);

-- ============================================
-- USERS TABLE INDEXES
-- ============================================
-- Speeds up authentication and user lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_openid ON users(openId);

-- ============================================
-- REFERRAL TRACKING INDEXES
-- ============================================
-- Speeds up referral analytics and tracking
CREATE INDEX IF NOT EXISTS idx_referral_distributor ON referralTracking(distributorId, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_referral_customer ON referralTracking(customerId, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_referral_source ON referralTracking(source, createdAt DESC);

-- ============================================
-- AUTOSHIP INDEXES
-- ============================================
-- Speeds up recurring order processing
CREATE INDEX IF NOT EXISTS idx_autoship_customer ON autoship(customerId, status);
CREATE INDEX IF NOT EXISTS idx_autoship_next_order ON autoship(nextOrderDate, status);
CREATE INDEX IF NOT EXISTS idx_autoship_distributor ON autoship(distributorId, status);

-- ============================================
-- RANK HISTORY INDEXES
-- ============================================
-- Speeds up rank advancement tracking
CREATE INDEX IF NOT EXISTS idx_rank_history_distributor ON rankHistory(distributorId, achievedAt DESC);
CREATE INDEX IF NOT EXISTS idx_rank_history_rank ON rankHistory(newRank, achievedAt DESC);

-- ============================================
-- NOTIFICATIONS INDEXES
-- ============================================
-- Speeds up notification delivery and read status
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(userId, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(isRead, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type, userId);

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this query to verify all indexes were created successfully:
-- SHOW INDEXES FROM genealogy;
-- SHOW INDEXES FROM commissions;
-- SHOW INDEXES FROM distributors;
-- SHOW INDEXES FROM orders;

-- Expected result: Each table should show the new indexes listed above
-- If any index is missing, run the specific CREATE INDEX command again

-- ============================================
-- PERFORMANCE TESTING
-- ============================================
-- Before indexes (baseline):
-- EXPLAIN SELECT * FROM genealogy WHERE uplineId = 123 AND level <= 5;
-- EXPLAIN SELECT * FROM commissions WHERE distributorId = 456 ORDER BY createdAt DESC LIMIT 50;

-- After indexes (should show "Using index" in Extra column):
-- EXPLAIN SELECT * FROM genealogy WHERE uplineId = 123 AND level <= 5;
-- EXPLAIN SELECT * FROM commissions WHERE distributorId = 456 ORDER BY createdAt DESC LIMIT 50;

-- Expected improvement: Query execution time reduced by 60-80%
