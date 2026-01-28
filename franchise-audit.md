# Franchise Page Audit - January 28, 2026

## Current State

The Franchise page has a territory licensing system with:
1. Interactive map for territory selection
2. Pricing calculator based on area/population
3. Application form with Name, Email, Phone, Notes fields
4. "Apply for This Territory - $5,891" button
5. "Submit Application" button

## Issues Found

1. **No Schedule Call button** - The page lacks a "Schedule Call" functionality
2. **Apply for Territory button** - Need to verify it works correctly
3. **Submit Application button** - Need to verify form submission works
4. **No meeting scheduler** - No way to schedule a consultation call
5. **Application flow incomplete** - Need to verify application goes to checkout

## Required Fixes

1. Add "Schedule a Call" button with meeting scheduler
2. Verify Apply for Territory button works
3. Verify Submit Application form submission
4. Add checkout integration for territory applications
5. Create MeetingScheduler component with time slot selection


# Vending Page Audit - January 28, 2026

## Current State

The Vending page has:
1. "Apply Now" button - scrolls to application section
2. "Book a Call" button - NOT WORKING (no action)
3. "Apply for a Machine" button/link
4. "Contact Sales" button
5. ROI Calculator
6. Machine features section

## Issues Found

1. **Book a Call button** - Does nothing when clicked (BROKEN)
2. **Apply Now button** - Only scrolls, doesn't open application form
3. **No scheduler** - No meeting scheduling functionality
4. **Application flow** - Need to verify complete flow to checkout

## Required Fixes

1. Fix Book a Call button - should open meeting scheduler
2. Verify Apply Now leads to working application form
3. Create meeting scheduler component
4. Ensure application flow connects to checkout
