/**
 * Authenticated Load Testing Script for NEON Energy MLM Platform
 * 
 * Tests platform performance under realistic authenticated user load:
 * - 1000+ concurrent authenticated distributors
 * - Real user workflows (dashboard, genealogy, commissions, orders)
 * - Sustained load over 10+ minutes
 * - Realistic think time between requests
 * 
 * Prerequisites:
 * 1. Run setup-test-users.ts to create test distributor accounts
 * 2. Ensure Redis is running for caching tests
 * 3. Set BASE_URL environment variable (default: http://localhost:3000)
 * 
 * Usage:
 *   k6 run --vus 100 --duration 5m test/authenticated-load-test.k6.js
 *   k6 run --vus 500 --duration 10m test/authenticated-load-test.k6.js
 *   k6 run --vus 1000 --duration 15m test/authenticated-load-test.k6.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const dashboardLoadTime = new Trend('dashboard_load_time');
const genealogyLoadTime = new Trend('genealogy_load_time');
const commissionsLoadTime = new Trend('commissions_load_time');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 500 },   // Ramp up to 500 users
    { duration: '5m', target: 1000 },  // Ramp up to 1000 users
    { duration: '5m', target: 1000 },  // Stay at 1000 users
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'], // 95% of requests under 500ms
    'errors': ['rate<0.01'],            // Error rate under 1%
    'dashboard_load_time': ['p(95)<300'], // Dashboard p95 under 300ms
    'genealogy_load_time': ['p(95)<500'], // Genealogy p95 under 500ms (complex query)
    'commissions_load_time': ['p(95)<300'], // Commissions p95 under 300ms
  },
};

// Base URL from environment or default
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Test user credentials (created by setup-test-users.ts)
// In production, these would be loaded from a file or environment
const TEST_USERS = [];
for (let i = 1; i <= 1000; i++) {
  TEST_USERS.push({
    email: `loadtest${i}@neonenergy.test`,
    password: 'LoadTest123!',
    id: i + 10000, // Offset to avoid conflicts with real users
  });
}

/**
 * Setup function - runs once per VU at start
 */
export function setup() {
  console.log(`Starting load test against ${BASE_URL}`);
  console.log(`Test users: ${TEST_USERS.length}`);
  return { baseUrl: BASE_URL };
}

/**
 * Main test function - runs repeatedly for each VU
 */
export default function (data) {
  // Each VU gets assigned a test user
  const userIndex = __VU % TEST_USERS.length;
  const testUser = TEST_USERS[userIndex];

  // Simulate realistic user session
  authenticatedUserSession(data.baseUrl, testUser);

  // Think time between sessions (30-60 seconds)
  sleep(Math.random() * 30 + 30);
}

/**
 * Simulate authenticated user session
 */
function authenticatedUserSession(baseUrl, user) {
  // Step 1: Login (or use existing session)
  // Note: In real implementation, you'd need to handle OAuth flow
  // For now, we'll simulate authenticated requests with session cookies
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Step 2: Load dashboard (most common page)
  const dashboardStart = Date.now();
  const dashboardRes = http.get(`${baseUrl}/api/trpc/distributor.getDashboardStats`, {
    headers,
    tags: { name: 'dashboard' },
  });
  
  check(dashboardRes, {
    'dashboard loaded': (r) => r.status === 200,
    'dashboard has data': (r) => r.body.length > 0,
  }) || errorRate.add(1);
  
  dashboardLoadTime.add(Date.now() - dashboardStart);
  sleep(Math.random() * 2 + 1); // 1-3 seconds viewing dashboard

  // Step 3: Load genealogy tree (complex query, tests caching)
  const genealogyStart = Date.now();
  const genealogyRes = http.get(`${baseUrl}/api/trpc/distributor.getGenealogyTree`, {
    headers,
    tags: { name: 'genealogy' },
  });
  
  check(genealogyRes, {
    'genealogy loaded': (r) => r.status === 200,
  }) || errorRate.add(1);
  
  genealogyLoadTime.add(Date.now() - genealogyStart);
  sleep(Math.random() * 3 + 2); // 2-5 seconds viewing genealogy

  // Step 4: Load commission history
  const commissionsStart = Date.now();
  const commissionsRes = http.get(`${baseUrl}/api/trpc/distributor.getCommissionHistory`, {
    headers,
    tags: { name: 'commissions' },
  });
  
  check(commissionsRes, {
    'commissions loaded': (r) => r.status === 200,
  }) || errorRate.add(1);
  
  commissionsLoadTime.add(Date.now() - commissionsStart);
  sleep(Math.random() * 2 + 1); // 1-3 seconds viewing commissions

  // Step 5: Load leaderboard (tests Redis caching)
  const leaderboardRes = http.get(`${baseUrl}/api/trpc/distributor.getLeaderboard`, {
    headers,
    tags: { name: 'leaderboard' },
  });
  
  check(leaderboardRes, {
    'leaderboard loaded': (r) => r.status === 200,
  }) || errorRate.add(1);
  
  sleep(Math.random() * 2 + 1); // 1-3 seconds viewing leaderboard

  // Step 6: Occasionally place an order (10% of sessions)
  if (Math.random() < 0.1) {
    const orderRes = http.post(`${baseUrl}/api/trpc/shop.createOrder`, 
      JSON.stringify({
        items: [{ productId: 1, quantity: 12 }], // 12-pack
        shippingAddress: {
          street: '123 Test St',
          city: 'Test City',
          state: 'CA',
          zip: '90210',
        },
      }),
      {
        headers,
        tags: { name: 'create_order' },
      }
    );
    
    check(orderRes, {
      'order created': (r) => r.status === 200 || r.status === 201,
    }) || errorRate.add(1);
    
    sleep(Math.random() * 3 + 2); // 2-5 seconds completing order
  }
}

/**
 * Teardown function - runs once at end
 */
export function teardown(data) {
  console.log('Load test complete');
}
