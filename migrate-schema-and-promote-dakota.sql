-- Schema Migration: Fix column name mismatches and promote Dakota Rea to master distributor
-- Safe to run multiple times (uses IF EXISTS / IF NOT EXISTS)

-- 1. Rename totalPV → totalPv in autoship_orders
ALTER TABLE autoship_orders 
  CHANGE COLUMN `totalPV` `totalPv` INT DEFAULT 0 NOT NULL;

-- 2. Rename totalPV → totalPv in distributor_autoships  
ALTER TABLE distributor_autoships
  CHANGE COLUMN `totalPV` `totalPv` INT DEFAULT 0 NOT NULL;

-- 3. Rename monthlyPV → monthlyPv in distributors
ALTER TABLE distributors
  CHANGE COLUMN `monthlyPV` `monthlyPv` INT DEFAULT 0 NOT NULL;

-- 4. Rename monthlyAutoshipPV → monthlyAutoshipPv in distributors
ALTER TABLE distributors
  CHANGE COLUMN `monthlyAutoshipPV` `monthlyAutoshipPv` INT DEFAULT 0 NOT NULL;

-- 5. Add firstName column if not exists
ALTER TABLE distributors
  ADD COLUMN IF NOT EXISTS `firstName` VARCHAR(100);

-- 6. Add lastName column if not exists
ALTER TABLE distributors
  ADD COLUMN IF NOT EXISTS `lastName` VARCHAR(100);

-- 7. Add email column if not exists
ALTER TABLE distributors
  ADD COLUMN IF NOT EXISTS `email` VARCHAR(255);

-- 8. Promote Dakota Rea to master distributor
UPDATE distributors
SET 
  rank = 'master_distributor',
  status = 'active',
  isActive = 1,
  qualified = 1
WHERE email = 'dakotarea@neonenergy.com'
  OR firstName LIKE '%Dakota%' AND lastName LIKE '%Rea%';

-- Verify the update
SELECT id, firstName, lastName, email, rank, status, isActive, qualified
FROM distributors
WHERE email = 'dakotarea@neonenergy.com'
  OR (firstName LIKE '%Dakota%' AND lastName LIKE '%Rea%');
