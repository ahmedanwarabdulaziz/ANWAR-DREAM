# 🎯 Customer Class & Referral System - Complete Design

## 📋 Overview

This document outlines the complete customer class and referral system for businesses. Each business can create unlimited customer classes, manage referrals, and track customer relationships across multiple businesses.

---

## 💰 **Permanent Points Conversion Rule**

**CRITICAL BUSINESS RULE:**
```
100 Points = $1.00 USD
```
This is a **permanent, system-wide rule** that applies to:
- Point redemption calculations
- Cash value conversions
- Reward pricing
- All financial transactions

---

## 🏗️ **Database Schema**

### **1. Businesses Collection** (`/businesses/{businessId}`)

```json
{
  "businessId": "BIZ001", // Auto-generated: BIZ + 4 digits
  "name": "Coffee Shop Downtown",
  "ownerId": "BC2085", // Customer ID of business owner
  "email": "owner@coffeeshop.com",
  "phone": "+1234567890",
  "address": "123 Main St, City, State",
  "businessType": "restaurant",
  "website": "https://coffeeshop.com",
  "isActive": true,
  "createdAt": "2025-10-28T17:28:45.123Z",
  "settings": {
    "pointsToDollarRate": 100, // PERMANENT: 100 points = $1
    "allowCustomClasses": true,
    "defaultReferralRouting": "referral_class", // Options: "referral_class", "referrer_class", "custom"
    "customReferralClassId": null // Used if defaultReferralRouting = "custom"
  }
}
```

### **2. Customer Classes Collection** (`/businesses/{businessId}/customerClasses/{classId}`)

```json
{
  "classId": "CLASS001", // Auto-generated: CLASS + 6 digits
  "businessId": "BIZ001",
  "name": "General Customers",
  "type": "permanent", // "permanent" or "custom"
  "description": "Regular customers who visit our store",
  "isActive": true,
  "createdAt": "2025-10-28T17:28:45.123Z",
  
  // QR Code & Signup Link (Permanent, Server-Based)
  "qrCode": {
    "data": "https://yourapp.com/signup?b=BIZ001&c=CLASS001", // Server URL
    "imageUrl": "https://cloudinary.com/qr/BIZ001_CLASS001.png"
  },
  "signupLink": "https://yourapp.com/signup?b=BIZ001&c=CLASS001",
  
  // Points Configuration
  "points": {
    "welcomePoints": 100, // Points given when customer joins this class
    "referrerPoints": 50, // Points given to person who made referral
    "referredPoints": 50 // Points given to person who was referred
  },
  
  // Benefits & Settings
  "benefits": {
    "pointsMultiplier": 1.0, // Multiply earned points (e.g., 1.5 = 50% bonus)
    "discountPercentage": 0, // Discount percentage on purchases
    "specialOffers": true, // Enable special offers for this class
    "freeShipping": false,
    "earlyAccess": false
  },
  
  // Analytics (Calculated fields)
  "analytics": {
    "totalCustomers": 0,
    "totalPointsDistributed": 0,
    "totalWelcomePointsGiven": 0,
    "totalReferrerPointsGiven": 0,
    "totalReferredPointsGiven": 0,
    "lastUpdated": "2025-10-28T17:28:45.123Z"
  }
}
```

**Permanent Classes (Auto-created):**
- `"General Customers"` - Default class for regular signups
- `"Referral Customers"` - Default class for referrals (unless routing changes)

### **3. Customers-Businesses Relationships** (`/customers/{customerId}/businesses/{businessId}`)

```json
{
  "customerId": "BC2085",
  "businessId": "BIZ001",
  "customerClassId": "CLASS001",
  "joinedAt": "2025-10-28T17:28:45.123Z",
  "status": "active", // "active", "inactive", "suspended"
  
  // Points & Activity
  "totalPoints": 250,
  "totalPointsEarned": 250,
  "totalPointsRedeemed": 0,
  "totalPointsValue": 2.50, // Calculated: totalPoints / 100 (always $)
  "totalVisits": 12,
  "lastVisit": "2025-10-28T17:28:45.123Z",
  
  // Referral Information
  "referrerId": null, // Customer ID who referred this customer (if applicable)
  "referredBy": null, // Class ID from which referral happened (if applicable)
  "referralDate": null,
  
  // Class History (for migration tracking)
  "classHistory": [
    {
      "classId": "CLASS001",
      "joinedAt": "2025-10-28T17:28:45.123Z",
      "migratedAt": null,
      "reason": "initial_signup"
    }
  ],
  
  // Custom Notes
  "notes": "VIP customer, always orders large coffee",
  "tags": ["vip", "regular"]
}
```

**Important:** Customers can have MULTIPLE entries (one per business), stored in:
```
/customers/{customerId}/businesses/{businessId}
```

### **4. Referral Tracking** (`/businesses/{businessId}/referrals/{referralId}`)

```json
{
  "referralId": "REF001",
  "businessId": "BIZ001",
  "referrerId": "BC2085", // Customer who made the referral
  "referredId": "BC2086", // Customer who was referred
  "referrerClassId": "CLASS001", // Class of the person who referred
  "assignedClassId": "CLASS002", // Class the referred person was assigned to
  "referralRouting": "referral_class", // How it was routed
  "status": "completed", // "pending", "completed", "failed"
  "createdAt": "2025-10-28T17:28:45.123Z",
  "completedAt": "2025-10-28T17:30:12.456Z",
  "pointsDistributed": {
    "referrerReceived": 50,
    "referredReceived": 50,
    "distributedAt": "2025-10-28T17:30:12.456Z"
  }
}
```

### **5. Customer Personal Referral Links** (`/customers/{customerId}/referralLinks/{businessId}`)

```json
{
  "customerId": "BC2085",
  "businessId": "BIZ001",
  "currentClassId": "CLASS001",
  "referralLink": "https://yourapp.com/signup?ref=BC2085&b=BIZ001",
  "qrCode": {
    "data": "https://yourapp.com/signup?ref=BC2085&b=BIZ001",
    "imageUrl": "https://cloudinary.com/qr/REF_BC2085_BIZ001.png"
  },
  "totalReferrals": 5,
  "totalReferralPoints": 250,
  "createdAt": "2025-10-28T17:28:45.123Z",
  "lastUsed": "2025-10-28T17:28:45.123Z"
}
```

**Note:** Each customer has a personal referral link for EACH business they're part of.

### **6. Class Migration Log** (`/businesses/{businessId}/classMigrations/{migrationId}`)

```json
{
  "migrationId": "MIG001",
  "businessId": "BIZ001",
  "customerId": "BC2085",
  "fromClassId": "CLASS001",
  "toClassId": "CLASS003",
  "reason": "task_completed", // "task_completed", "manual", "points_threshold"
  "initiatedBy": "business", // "customer", "business", "system"
  "taskId": "TASK001", // If reason = "task_completed"
  "pointsAtMigration": 500,
  "createdAt": "2025-10-28T17:28:45.123Z",
  "notes": "Customer completed VIP challenge"
}
```

---

## 🔄 **Complete System Flow**

### **Scenario 1: Business Registration**

1. Business owner signs up with `role: 'business'`
2. System generates unique Business ID: `BIZ001`
3. Creates business document in `/businesses/BIZ001`
4. **Automatically creates 2 permanent classes:**
   - "General Customers" (CLASS001)
     - Welcome Points: 100
     - Referrer Points: 0 (default)
     - Referred Points: 0 (default)
   - "Referral Customers" (CLASS002)
     - Welcome Points: 100
     - Referrer Points: 50 (default)
     - Referred Points: 50 (default)
5. Generates permanent QR codes and signup links for both classes
6. Business can customize points and settings immediately

### **Scenario 2: Direct Customer Signup (No Referral)**

1. Customer visits: `https://yourapp.com/signup?b=BIZ001&c=CLASS001`
2. Signup form pre-fills:
   - Business: BIZ001
   - Customer Class: CLASS001 (General Customers)
   - Referrer: None
3. Customer completes registration
4. System creates:
   - User account in `/users/{customerId}`
   - Relationship in `/customers/{customerId}/businesses/BIZ001`
   - Assigns customer to CLASS001
5. **Points Distribution:**
   - Customer receives: `CLASS001.welcomePoints` (e.g., 100 points)
   - Points transaction logged
   - Analytics updated

### **Scenario 3: Referral Signup - Default Routing (Referral Class)**

**Business Settings:**
```json
{
  "defaultReferralRouting": "referral_class"
}
```

**Flow:**
1. Customer A (BC2085) is in CLASS001 (General Customers)
2. Customer A shares their referral link: `https://yourapp.com/signup?ref=BC2085&b=BIZ001`
3. Customer B clicks link and signs up
4. System identifies:
   - Referrer: BC2085 (from CLASS001)
   - Business: BIZ001
   - Routing: "referral_class"
5. Customer B is assigned to CLASS002 (Referral Customers)
6. **Points Distribution:**
   - Customer A (referrer) receives: `CLASS001.referrerPoints` (e.g., 50 points)
   - Customer B (referred) receives: `CLASS002.referredPoints` (e.g., 50 points) + `CLASS002.welcomePoints` (e.g., 100 points)
7. Referral record created in `/businesses/BIZ001/referrals/REF001`
8. Customer A's referral link analytics updated

### **Scenario 4: Referral Signup - Same Class Routing**

**Business Settings:**
```json
{
  "defaultReferralRouting": "referrer_class"
}
```

**Flow:**
1. Customer A (BC2085) is in CLASS003 (VIP Customers)
2. Customer A shares referral link
3. Customer B signs up through referral
4. System assigns Customer B to **CLASS003** (same as referrer)
5. **Points Distribution:**
   - Customer A receives: `CLASS003.referrerPoints` (e.g., 100 points)
   - Customer B receives: `CLASS003.referredPoints` (e.g., 100 points) + `CLASS003.welcomePoints` (e.g., 200 points)

### **Scenario 5: Referral Signup - Custom Class Routing**

**Business Settings:**
```json
{
  "defaultReferralRouting": "custom",
  "customReferralClassId": "CLASS004" // "Special Promotion Class"
}
```

**Flow:**
1. Customer A (any class) shares referral link
2. Customer B signs up through referral
3. System assigns Customer B to **CLASS004** (custom selected class)
4. **Points Distribution:**
   - Customer A receives: Points from their own class (`referrerClass.referrerPoints`)
   - Customer B receives: Points from assigned class (`CLASS004.referredPoints + CLASS004.welcomePoints`)

### **Scenario 6: Class Migration - Task Completion**

1. Business creates task: "Complete 10 visits to upgrade to VIP"
2. Customer completes task
3. System creates migration record
4. Customer moved from CLASS001 → CLASS003
5. Class history updated
6. Customer keeps all existing points

### **Scenario 7: Class Migration - Manual (Business Dashboard)**

1. Business owner opens customer profile
2. Business selects: "Move to VIP Class"
3. System creates migration record
4. Customer moved to new class
5. Points multiplier and benefits updated immediately

### **Scenario 8: Customer Joins Multiple Businesses**

1. Customer BC2085 is already part of BIZ001 (Coffee Shop)
2. Customer BC2085 signs up for BIZ002 (Pizza Place) via their referral link
3. System creates: `/customers/BC2085/businesses/BIZ002`
4. Customer now has **two separate relationships:**
   - BIZ001: CLASS001, 250 points
   - BIZ002: CLASS001, 100 points (welcome points)
5. Customer has **two personal referral links:**
   - One for BIZ001
   - One for BIZ002
6. Points and analytics tracked separately per business

---

## 📊 **Analytics & Metrics**

### **Business Dashboard - Class Analytics**

For each customer class, display:

1. **Customer Metrics:**
   - Total customers in class
   - Active customers
   - New customers this month
   - Average points per customer

2. **Points Metrics:**
   - Total points distributed (all time)
   - Total welcome points given
   - Total referrer points given
   - Total referred points given
   - Points value in dollars (points / 100)

3. **Referral Metrics:**
   - Total referrals from this class
   - Average referrals per customer
   - Top referrers in this class

4. **Revenue Metrics:**
   - Total points value redeemed
   - Average redemption per customer
   - Points outstanding (not yet redeemed)

---

## 🔐 **Security & Rules**

### **URL Parameters:**
- `?b={businessId}` - Business ID (required for signup)
- `?c={classId}` - Customer Class ID (optional, defaults to General)
- `?ref={customerId}` - Referrer Customer ID (optional, for referrals)

### **Validation:**
- Business must exist and be active
- Class must belong to the business
- Referrer must be a customer of that business
- URL parameters must be validated before signup

---

## 🎯 **Key Features Summary**

✅ **Unlimited Custom Classes** per business  
✅ **Permanent QR Codes** (server-based URLs)  
✅ **Multi-Business Customers** (customers can join multiple businesses)  
✅ **Class Migration** (task-based or manual)  
✅ **Referral Routing Options** (referral class, referrer class, or custom class)  
✅ **Points Configuration** per class (welcome, referrer, referred)  
✅ **Referral Tracking** (who referred whom, with full history)  
✅ **Personal Referral Links** (each customer has unique link per business)  
✅ **Class Analytics** (comprehensive metrics per class)  
✅ **Permanent Conversion Rate** (100 points = $1, system-wide)  

---

## 🚀 **Next Steps**

1. **Database Schema Implementation**
2. **Business Registration with Auto-Class Creation**
3. **QR Code Generation Service**
4. **Enhanced Signup System with Referral Tracking**
5. **Customer Class Management Dashboard**
6. **Points Distribution System**
7. **Class Migration System**
8. **Analytics Dashboard**

---

This system provides a complete, scalable foundation for customer relationship management, referral tracking, and loyalty program management! 🎉

