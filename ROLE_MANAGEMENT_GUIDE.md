# 🔧 Manual Role Management Guide

## Overview
This guide explains how to manually change user roles in the Firestore database for testing admin and business dashboards.

## Database Structure

### Users Collection (`/users/{customerId}`)
Each user document contains:
```json
{
  "name": "Alice Johnson",
  "email": "alice.johnson@example.com", 
  "userId": "BC2085",
  "createdAt": "2025-10-28T17:28:45.123Z",
  "role": "customer"  // ← Change this field
}
```

### Available Roles
- `"customer"` - Default role, access to customer dashboard
- `"admin"` - Administrator role, access to admin dashboard  
- `"business"` - Business owner role, access to business dashboard

## How to Change User Roles

### Method 1: Firebase Console (Recommended)

1. **Open Firebase Console**
   - Go to: https://console.firebase.google.com/
   - Select your project: `cadeala-cd61d`

2. **Navigate to Firestore**
   - Click "Firestore Database" in the left sidebar
   - Click "Data" tab

3. **Find User Document**
   - Navigate to `users` collection
   - Find the user by their Customer ID (e.g., `BC2085`)

4. **Edit Role Field**
   - Click on the user document
   - Click the "Edit" button (pencil icon)
   - Find the `role` field
   - Change the value to:
     - `"admin"` for admin access
     - `"business"` for business access
     - `"customer"` for customer access
   - Click "Save"

### Method 2: Firebase Admin SDK (Programmatic)

```javascript
// Example: Change user role to admin
const admin = require('firebase-admin');
const db = admin.firestore();

async function changeUserRole(customerId, newRole) {
  try {
    await db.collection('users').doc(customerId).update({
      role: newRole
    });
    console.log(`User ${customerId} role changed to ${newRole}`);
  } catch (error) {
    console.error('Error changing role:', error);
  }
}

// Usage examples:
changeUserRole('BC2085', 'admin');     // Make user admin
changeUserRole('BC2085', 'business');  // Make user business owner
changeUserRole('BC2085', 'customer');  // Make user customer
```

### Method 3: Using API Endpoint

You can also use the existing API endpoint to update user roles:

```bash
# Update user role via API
curl -X PUT "http://localhost:3000/api/users/BC2085" \
  -H "Content-Type: application/json" \
  -d '{"customClaims": {"role": "admin"}}'
```

## Testing Different Roles

### Test Admin Dashboard
1. Change a user's role to `"admin"`
2. Sign in with that user's credentials
3. Navigate to `/admin/dashboard`
4. You should see the admin dashboard with:
   - User management tools
   - System statistics
   - Admin-only features

### Test Business Dashboard  
1. Change a user's role to `"business"`
2. Sign in with that user's credentials
3. Navigate to `/business/dashboard`
4. You should see the business dashboard with:
   - Campaign management
   - Customer analytics
   - Business-specific features

### Test Customer Dashboard
1. Change a user's role to `"customer"` (or leave as default)
2. Sign in with that user's credentials
3. Navigate to `/customer/dashboard`
4. You should see the customer dashboard with:
   - Personal account info
   - Reward tracking
   - Customer features

## Security Notes

⚠️ **Important Security Considerations:**

1. **Development Only**: These manual role changes are for development/testing only
2. **Production Security**: In production, use proper role assignment workflows
3. **Access Control**: The dashboards check user roles and redirect unauthorized users
4. **Firestore Rules**: Current development rules allow role changes, but production rules should be more restrictive

## Troubleshooting

### User Can't Access Dashboard
- Check that the `role` field is correctly set in Firestore
- Verify the user is signed in
- Check browser console for errors
- Ensure Firestore rules allow the operation

### Role Not Updating
- Refresh the page after changing the role
- Clear browser cache
- Check Firestore console for any errors
- Verify the document ID matches the Customer ID

### Dashboard Shows Wrong Content
- Check the role value in Firestore (case-sensitive)
- Ensure the role is one of: `"customer"`, `"admin"`, `"business"`
- Verify the user authentication is working

## Example Test Users

For testing purposes, you can create these test scenarios:

### Admin User
```json
{
  "name": "Admin User",
  "email": "admin@test.com",
  "userId": "BC0001", 
  "createdAt": "2025-10-28T17:28:45.123Z",
  "role": "admin"
}
```

### Business User
```json
{
  "name": "Business Owner",
  "email": "business@test.com", 
  "userId": "BC0002",
  "createdAt": "2025-10-28T17:28:45.123Z",
  "role": "business"
}
```

### Customer User
```json
{
  "name": "Alice Johnson",
  "email": "alice.johnson@example.com",
  "userId": "BC2085",
  "createdAt": "2025-10-28T17:28:45.123Z", 
  "role": "customer"
}
```

## Next Steps

After testing the role-based dashboards:

1. **Create Role Assignment UI**: Build admin interface for role management
2. **Add Role Validation**: Implement server-side role validation
3. **Create Role-Specific Features**: Add unique functionality for each role
4. **Implement Permissions**: Add granular permission system
5. **Add Audit Logging**: Track role changes and access

---

**Happy Testing!** 🎉



