# 📍 Where to Find Customer Classes in Firebase Database

## 🗂️ **Database Structure**

Customer classes are stored as a **subcollection** under each business document.

### **Path Structure:**
```
/businesses/{businessId}/customerClasses/{classId}
```

**Example:**
```
/businesses/BIZ001/customerClasses/CLASS000001
/businesses/BIZ001/customerClasses/CLASS000002
```

---

## 🔍 **How to Find Customer Classes in Firebase Console**

### **Step 1: Open Firebase Console**
1. Go to: https://console.firebase.google.com/
2. Select your project: `cadeala-cd61d`
3. Click **"Firestore Database"** in the left sidebar

### **Step 2: Navigate to Businesses Collection**
1. In the **Data** tab, you'll see collections listed
2. Click on the **`businesses`** collection

### **Step 3: Find Your Business**
1. You'll see a list of business documents (e.g., `BIZ001`, `BIZ002`, etc.)
2. Click on the business ID you want to view (e.g., `BIZ001`)

### **Step 4: View Customer Classes Subcollection**
1. Inside the business document, scroll down
2. You'll see a section called **"Subcollections"**
3. Click on **`customerClasses`** subcollection
4. You'll see all customer classes for that business!

---

## 📋 **What You'll See**

Each customer class document contains:

```json
{
  "classId": "CLASS000001",
  "businessId": "BIZ001",
  "name": "General Customers",
  "type": "permanent", // or "custom"
  "description": "Regular customers who visit our store",
  "isActive": true,
  "createdAt": "2025-10-28T17:28:45.123Z",
  "qrCode": {
    "data": "https://yoursite.com/signup?b=BIZ001&c=CLASS000001",
    "imageUrl": "https://api.qrserver.com/v1/create-qr-code/..."
  },
  "signupLink": "https://yoursite.com/signup?b=BIZ001&c=CLASS000001",
  "points": {
    "welcomePoints": 100,
    "referrerPoints": 0,
    "referredPoints": 0
  },
  "benefits": {
    "pointsMultiplier": 1.0,
    "discountPercentage": 0,
    "specialOffers": true,
    "freeShipping": false,
    "earlyAccess": false
  },
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

---

## 🎯 **Quick Navigation Path**

```
Firebase Console
  └── Firestore Database
      └── businesses (collection)
          └── {businessId} (document)
              └── customerClasses (subcollection) ✅ HERE!
                  └── {classId} (document)
```

---

## 🔑 **Key Points**

1. **Subcollection**: Customer classes are NOT in a separate top-level collection
2. **Business-Specific**: Each business has its own `customerClasses` subcollection
3. **Auto-Created**: When a business is approved, 2 permanent classes are automatically created:
   - `General Customers`
   - `Referral Customers`
4. **Custom Classes**: Business owners can create additional custom classes through the UI

---

## 💡 **Tips**

- **To find a specific business**: Look for the `ownerId` field in the business document - it matches the customer ID
- **To find all classes**: Navigate to any business → `customerClasses` subcollection
- **To identify permanent classes**: Look for `type: "permanent"` in the class document
- **To see class analytics**: Check the `analytics` field in each class document

---

## 🚀 **Example: Finding Classes for Business BIZ001**

1. Firebase Console → Firestore Database
2. Click `businesses` collection
3. Click document `BIZ001`
4. Scroll to "Subcollections" section
5. Click `customerClasses`
6. You'll see:
   - `CLASS000001` (General Customers)
   - `CLASS000002` (Referral Customers)
   - Any custom classes the business created

**That's it!** 🎉

