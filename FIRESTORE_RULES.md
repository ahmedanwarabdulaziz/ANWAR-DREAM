# Firestore Security Rules Documentation

## Overview
This document explains the production-ready Firestore security rules for the Rewards App. These rules are designed to be secure and scalable for production use.

## Rule Structure

### 1. Users Collection (`/users/{customerId}`)
- **Purpose**: Stores user profile data using customer ID as document ID
- **Security**: Users can only access their own data
- **Create**: Only during registration with proper validation
- **Read/Update/Delete**: Only by the user who owns the data

### 2. User Mappings Collection (`/user_mappings/{uid}`)
- **Purpose**: Maps Firebase UID to Customer ID for easy lookup
- **Security**: Users can only access their own mapping
- **Create**: Only during registration
- **Read/Update/Delete**: Only by the user who owns the mapping

### 3. Anonymous Tokens Collection (`/anonymous_tokens/{token}`)
- **Purpose**: Stores FCM tokens for anonymous users
- **Security**: Open access (needed for anonymous functionality)

### 4. Device Tokens Collection (`/users/{customerId}/devices/{token}`)
- **Purpose**: Stores FCM tokens for authenticated users
- **Security**: Users can only manage their own device tokens

### 5. Role-Based Collections
- **Admin Collections** (`/admin/**`): Only accessible by users with 'admin' role
- **Business Collections** (`/business/**`): Only accessible by users with 'business' role
- **Customer Collections** (`/customers/{customerId}/**`): Only accessible by the specific customer

### 6. Rewards and Points Collections
- **Rewards** (`/rewards/{rewardId}`): Read access for all users, write access for admins only
- **User Points** (`/users/{customerId}/points/{pointId}`): Only accessible by the specific customer
- **Transactions** (`/users/{customerId}/transactions/{transactionId}`): Only accessible by the specific customer

### 7. Campaigns Collection (`/campaigns/{campaignId}`)
- **Purpose**: QR code campaigns and business promotions
- **Security**: Read access for all users, write access for business users only

### 8. Businesses Collection (`/businesses/{businessId}`)
- **Purpose**: Stores business information and settings
- **Security**: Public read access (for signup links), write access for business owners only
- **Subcollections**:
  - `/customerClasses/{classId}`: Customer classes (public read, owner write)
  - `/referrals/{referralId}`: Referral tracking (owner read, system write)
  - `/classMigrations/{migrationId}`: Class migration logs (owner read, system write)

### 9. Customers Collection (`/customers/{customerId}`)
- **Purpose**: Customer-specific data collections
- **Security**: Customers can only access their own data
- **Subcollections**:
  - `/businesses/{businessId}`: Customer-business relationships (customer read, system write)
  - `/referralLinks/{businessId}`: Personal referral links (customer read, system write)
  - `/transactions/{transactionId}`: Points transactions (customer read, system write, immutable)

## Key Security Features

1. **Authentication Required**: All operations require user authentication
2. **Data Ownership**: Users can only access their own data
3. **Role-Based Access**: Different access levels based on user roles
4. **Email Verification**: User operations are tied to authenticated email
5. **Customer ID Validation**: All operations validate customer ID ownership
6. **Data Integrity**: Creation rules validate required fields and data types

## Deployment Instructions

### Prerequisites
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize project: `firebase init firestore`

### Deploy Rules
```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy both rules and indexes
firebase deploy --only firestore
```

### Test Rules
```bash
# Test rules locally
firebase emulators:start --only firestore

# Run tests against emulator
npm run test:firestore
```

## Development vs Production

### Development Mode
For development, you might want to temporarily relax rules:
```javascript
// Temporary development rule (DO NOT USE IN PRODUCTION)
match /{document=**} {
  allow read, write: if request.auth != null;
}
```

### Production Mode
The current rules are production-ready and should not be relaxed.

## Monitoring and Debugging

### Firebase Console
1. Go to Firebase Console → Firestore → Rules
2. Use the Rules Playground to test rules
3. Monitor rule violations in the Firebase Console

### Logging
```javascript
// Add logging to rules for debugging
allow read: if request.auth != null 
  && debug("User authenticated: " + request.auth.uid)
  && exists(/databases/$(database)/documents/user_mappings/$(request.auth.uid));
```

## Best Practices

1. **Principle of Least Privilege**: Users only get access to what they need
2. **Defense in Depth**: Multiple layers of validation
3. **Regular Audits**: Review rules periodically
4. **Testing**: Test rules thoroughly before deployment
5. **Monitoring**: Monitor rule violations and adjust as needed

## Future Enhancements

1. **Rate Limiting**: Add rate limiting for write operations
2. **Audit Logging**: Log all rule violations
3. **Dynamic Rules**: Implement dynamic rules based on user behavior
4. **Geographic Restrictions**: Add location-based access controls

## Troubleshooting

### Common Issues
1. **Permission Denied**: Check if user is authenticated and has proper role
2. **Missing Mapping**: Ensure user_mappings document exists
3. **Invalid Customer ID**: Verify customer ID format and ownership

### Debug Steps
1. Check Firebase Console for rule violations
2. Verify user authentication status
3. Check user_mappings document exists
4. Validate customer ID format
5. Test rules in Rules Playground

