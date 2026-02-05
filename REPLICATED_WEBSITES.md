# Replicated Website System Documentation

## Overview

The NEON Energy Drink platform includes a sophisticated replicated website system that automatically generates personalized landing pages for each distributor. These pages track referrals and attribute sales to the correct distributor for commission purposes.

## How It Works

### URL Structure

Once the custom domain `neonenergyclub.com` is configured in Settings → Domains, distributors can share their personalized URLs in multiple formats:

1. **Distributor Code**: `neonenergyclub.com/DIST123ABC`
2. **Username**: `neonenergyclub.com/johndoe`
3. **Custom Vanity Slug**: `neonenergyclub.com/energy-ambassador`

All three formats work automatically - the system checks each option in order until it finds a match.

### Technical Implementation

#### Routing (App.tsx)

```tsx
// Catch-all route at the end of the route list
<Route path="/:slug" component={PersonalizedLanding} />
```

This catch-all route captures any URL that doesn't match a specific page route, allowing distributor codes to work seamlessly.

#### Backend Logic (routers.ts - profile.getBySlug)

The `getBySlug` procedure handles the lookup:

1. **First**: Checks for custom slugs in `userProfiles` table
2. **Then**: If not found, calls `getDistributorPublicProfile(code)` to check distributor codes
3. **Returns**: Profile data for the PersonalizedLanding page, or null if not found

#### Distributor Lookup (db.ts - getDistributorPublicProfile)

The function tries multiple lookup methods in order:

1. **Distributor Code** (case-sensitive): `DIST123ABC`
2. **Username**: `johndoe`
3. **Subdomain**: Legacy support for old subdomain system
4. **Custom Vanity URL**: User-defined slug from userProfiles

**Important**: Only shows pages for distributors with `status = 'active'` (not suspended)

### Referral Tracking

When a visitor lands on a distributor's replicated website:

1. **Session Storage**: `referralCode` is stored for immediate tracking
2. **Local Storage**: `neon_referral` object is stored with:
   - `distributorCode`: The distributor's code
   - `expiry`: 30 days from visit
   - `visitedAt`: Timestamp of visit

3. **Order Attribution**: When the visitor makes a purchase, the system:
   - Checks for `referringDistributor` in sessionStorage
   - Falls back to `neon_referral` in localStorage
   - Attributes the sale to the distributor for commission calculation

### Commission Attribution

**Critical**: The system uses `distributorId` (not URLs) for commission attribution. This means:

- ✅ Distributors can change their vanity URLs without losing commissions
- ✅ Multiple URL formats (code/username/slug) all work correctly
- ✅ Referrals are tracked for 30 days via localStorage
- ✅ Custom domain changes don't break existing referral links

## Setup Instructions

### 1. Configure Custom Domain

In the Manus Management UI:
1. Go to **Settings → Domains**
2. Add `neonenergyclub.com`
3. Configure DNS records as instructed (CNAME @ and www)
4. Wait for SSL certificate provisioning (automatic)

### 2. Distributor Enrollment

When a distributor signs up through `/join`:
1. System generates unique `distributorCode` (e.g., `DIST123ABC`)
2. Distributor can optionally set a `username`
3. Distributor can create a custom vanity slug in their profile settings

### 3. Sharing Links

Distributors can share any of these formats:
- `neonenergyclub.com/DIST123ABC` (auto-generated code)
- `neonenergyclub.com/johndoe` (their username)
- `neonenergyclub.com/energy-pro` (custom vanity slug)

All formats work identically and track referrals the same way.

## Testing

### Before Distributors Sign Up

Visiting any non-existent code shows: **"Page Not Found - This referral link doesn't exist or has been deactivated"**

This is correct behavior - the system is working properly.

### After Distributors Sign Up

1. Distributor completes enrollment at `/join`
2. System assigns distributor code (e.g., `DIST123ABC`)
3. Visit `neonenergyclub.com/DIST123ABC` → Shows personalized landing page
4. Page displays distributor's:
   - Name and photo
   - Rank/title
   - Location
   - Bio
   - Social media links
   - Custom message

### Verifying Referral Tracking

1. Visit distributor's replicated website
2. Open browser DevTools → Application → Local Storage
3. Check for `neon_referral` object with distributor code
4. Make a test purchase
5. Check database `sales` table - should have correct `distributorId`

## Database Schema

### Key Tables

**distributors**
- `id`: Primary key
- `userId`: Links to users table
- `distributorCode`: Unique code (e.g., DIST123ABC)
- `username`: Optional vanity username
- `status`: 'active' | 'inactive' | 'suspended'

**userProfiles**
- `userId`: Links to users table
- `customSlug`: Optional custom vanity URL
- `displayName`: Display name for replicated site
- `bio`: Personal message
- `profilePhotoUrl`: Avatar image

**sales**
- `distributorId`: Links to distributors table
- `customerId`: Links to users table
- Used for commission calculations

## Troubleshooting

### "Page Not Found" for all distributor codes

**Cause**: No distributors in database yet, or distributor status is not 'active'

**Solution**: 
1. Have a test user complete distributor enrollment
2. Check distributor status in database
3. Verify distributor code was generated

### Referrals not tracking

**Cause**: Browser blocking localStorage, or sessionStorage not persisting

**Solution**:
1. Check browser privacy settings
2. Verify localStorage is enabled
3. Test in incognito/private mode
4. Check console for JavaScript errors

### Custom domain not working

**Cause**: DNS not configured or SSL not provisioned

**Solution**:
1. Verify DNS records in domain registrar
2. Wait 24-48 hours for DNS propagation
3. Check SSL certificate status in Manus UI
4. Contact Manus support if issues persist

## Future Enhancements

Potential improvements to consider:

1. **QR Code Generation**: Auto-generate QR codes for distributor links
2. **Link Analytics**: Track clicks, conversions, geographic data
3. **A/B Testing**: Allow distributors to test different page variants
4. **Custom Branding**: Let distributors customize colors/images
5. **Video Integration**: Allow distributors to add personal video messages
6. **Social Proof**: Show real-time purchase notifications on replicated sites

## Support

For technical issues with the replicated website system:
- Check server logs for `[getDistributorPublicProfile]` messages
- Verify database connectivity
- Test with different distributor codes/usernames
- Review browser console for client-side errors

For business/account issues:
- Contact: support@neoncorporation.com
- Phone: 1-800-NEON-ENERGY
