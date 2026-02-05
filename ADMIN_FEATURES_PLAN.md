# Admin Features Plan

## Overview
Admins need a dedicated dashboard with specific administrative tasks. They are NOT regular users - they manage the platform.

## Admin Dashboard Structure

### 1. **ID Verification Management** ✅ (Already Implemented)
- View pending ID verifications
- Approve/Reject ID documents
- View user information with documents
- **Location**: `/admin/verifications`

### 2. **User Management** (New)
- View all users
- Search/filter users
- View user profiles
- Suspend/Activate user accounts
- Delete users (with confirmation)
- View user activity logs
- **Location**: `/admin/users`

### 3. **Profile Moderation** (New)
- Review new profiles before they go live
- Approve/Reject profiles
- Flag inappropriate content
- Edit/Remove profiles
- View profile statistics
- **Location**: `/admin/profiles`

### 4. **Content Moderation** (New)
- Review reported messages
- View message requests
- Flag inappropriate conversations
- Block users from messaging
- View message statistics
- **Location**: `/admin/messages`

### 5. **Reports Management** (New)
- View user reports (harassment, fake profiles, etc.)
- Take action on reports
- Ban users based on reports
- Track report history
- **Location**: `/admin/reports`

### 6. **Platform Analytics** (New)
- Total users
- Active profiles
- Pending verifications
- Successful matches
- Daily/weekly/monthly stats
- **Location**: `/admin/analytics`

### 7. **System Settings** (New)
- Platform configuration
- Email templates
- Notification settings
- Maintenance mode
- **Location**: `/admin/settings`

## Admin Navigation Structure

```
/admin (Dashboard Home)
├── /admin/verifications (ID Verification) ✅
├── /admin/users (User Management)
├── /admin/profiles (Profile Moderation)
├── /admin/messages (Content Moderation)
├── /admin/reports (Reports Management)
├── /admin/analytics (Platform Analytics)
└── /admin/settings (System Settings)
```

## Admin Dashboard Home Page

Should show:
- Quick stats (pending verifications, new users, reports)
- Recent activity
- Quick actions
- Alerts/notifications

## Implementation Priority

### Phase 1: Core Admin Features (High Priority)
1. ✅ ID Verification Management
2. User Management (view, suspend, activate)
3. Profile Moderation (approve/reject new profiles)
4. Reports Management (basic reporting system)

### Phase 2: Enhanced Features (Medium Priority)
5. Content Moderation (message review)
6. Platform Analytics Dashboard
7. User Activity Logs

### Phase 3: Advanced Features (Low Priority)
8. System Settings
9. Advanced Analytics
10. Automated Moderation Tools

## Admin Access Control

- Admins should NOT be able to:
  - Create their own matrimony profile
  - Browse profiles as regular users
  - Send message requests
  - Participate in matching

- Admins SHOULD be able to:
  - Access all admin pages
  - View all user data
  - Moderate all content
  - Manage platform settings

## Security Considerations

- All admin routes should check `isAdmin` status
- Admin actions should be logged
- Sensitive operations require confirmation
- Rate limiting on admin actions
- IP whitelisting (optional, for production)

## Database Changes Needed

1. **Reports Table** (for user reports)
   - id, reporter_id, reported_user_id, reason, status, created_at

2. **Admin Logs Table** (for audit trail)
   - id, admin_id, action, target_type, target_id, details, created_at

3. **User Suspension Table** (optional)
   - id, user_id, reason, suspended_by, suspended_until, created_at

## UI/UX Considerations

- Clean, professional admin interface
- Color coding for status (pending = yellow, approved = green, rejected = red)
- Bulk actions where applicable
- Search and filter capabilities
- Pagination for large datasets
- Export functionality (CSV/Excel)
