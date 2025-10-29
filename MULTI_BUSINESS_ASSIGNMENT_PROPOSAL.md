# 💡 User Multi-Business Assignment - Design Proposal

## 🎯 **Current Situation**

Currently, the user document has:
```json
{
  "userId": "BC2085",
  "public": true/false,
  "businessId": "BIZ001",  // ❌ Only ONE business
  "customerClassId": "CLASS000001"  // ❌ Only ONE class
}
```

**Problem**: Users can join multiple businesses, but the user document only tracks one.

**Existing Structure**: There's already a subcollection:
```
/customers/{customerId}/businesses/{businessId}
```
This stores detailed relationship data (points, visits, class history, etc.)

---

## 💡 **Proposed Solution: Hybrid Approach**

### **Option 1: Array in User Document (Recommended) ✅**

Add a summary array to the user document for quick access:

```json
{
  "userId": "BC2085",
  "name": "John Doe",
  "email": "john@example.com",
  "public": true,  // true if initial signup was public
  "businessAssignments": [  // ✅ NEW: Array of business assignments
    {
      "businessId": "BIZ001",
      "customerClassId": "CLASS000001",
      "joinedAt": "2025-01-15T10:00:00Z",
      "status": "active"
    },
    {
      "businessId": "BIZ002",
      "customerClassId": "CLASS000005",
      "joinedAt": "2025-01-20T14:30:00Z",
      "status": "active"
    }
  ]
}
```

**Pros:**
- ✅ Quick access - no need to query subcollection
- ✅ Easy to display all businesses on user profile
- ✅ Compact - only essential info in user doc
- ✅ Keeps detailed data in subcollection (normalized)

**Cons:**
- ⚠️ Need to keep array in sync with subcollection
- ⚠️ Array could grow large (but users typically join 1-5 businesses)

---

### **Option 2: Subcollection Only**

Remove `businessId` and `customerClassId` from user document, rely entirely on:
```
/customers/{customerId}/businesses/{businessId}
```

**Pros:**
- ✅ Fully normalized
- ✅ No duplication
- ✅ No sync issues

**Cons:**
- ❌ Requires query to get all businesses
- ❌ Slower for dashboard display
- ❌ More complex queries

---

### **Option 3: Keep Current + Add Summary Array**

Keep existing fields for backwards compatibility, add array for multi-business:

```json
{
  "userId": "BC2085",
  "primaryBusinessId": "BIZ001",  // First business (for backwards compat)
  "primaryCustomerClassId": "CLASS000001",
  "businessAssignments": [
    {
      "businessId": "BIZ001",
      "customerClassId": "CLASS000001",
      "isPrimary": true,  // First business
      "joinedAt": "...",
      "status": "active"
    },
    {
      "businessId": "BIZ002",
      "customerClassId": "CLASS000005",
      "isPrimary": false,
      "joinedAt": "...",
      "status": "active"
    }
  ]
}
```

**Pros:**
- ✅ Backwards compatible
- ✅ Clear primary business
- ✅ Full list available

**Cons:**
- ⚠️ Some redundancy

---

## 🎯 **Recommended: Option 1 (Simple Array)**

### **Implementation:**

1. **Update UserData Interface:**
```typescript
export interface BusinessAssignment {
  businessId: string
  customerClassId: string
  joinedAt: string
  status: 'active' | 'inactive' | 'suspended'
}

export interface UserData {
  name: string
  email: string
  userId: string
  createdAt: string
  role: 'customer' | 'admin' | 'business'
  public: boolean
  businessAssignments: BusinessAssignment[]  // ✅ Array instead of single fields
}
```

2. **Remove:**
- `businessId?: string`
- `customerClassId?: string`

3. **Update Signup Flow:**
- When customer joins first business → Add to `businessAssignments` array
- When customer joins additional business → Push to array

4. **Keep Subcollection:**
- `/customers/{customerId}/businesses/{businessId}` still stores detailed data
- Array is just a summary for quick access

---

## 📊 **Database Structure**

```
/users/{customerId}
├── businessAssignments: [
│     {
│       businessId: "BIZ001",
│       customerClassId: "CLASS000001",
│       joinedAt: "...",
│       status: "active"
│     },
│     {
│       businessId: "BIZ002",
│       customerClassId: "CLASS000005",
│       joinedAt: "...",
│       status: "active"
│     }
│   ]

/customers/{customerId}/businesses/{businessId}
└── [Detailed relationship data]
    ├── totalPoints: 500
    ├── totalVisits: 10
    ├── classHistory: [...]
    └── [all other relationship fields]
```

---

## 🔄 **Migration Strategy**

1. Add `businessAssignments` array to new signups
2. For existing users with single `businessId`:
   - Query subcollection `/customers/{customerId}/businesses`
   - Build array from existing relationships
   - Update user document

---

## ❓ **Questions to Discuss**

1. **Array Limit?** Should we limit how many businesses a user can join?
2. **Primary Business?** Do we need a "primary" or "default" business?
3. **Sync Strategy?** How do we keep array and subcollection in sync?
   - Option A: Update both when relationship changes
   - Option B: Rebuild array from subcollection on read
4. **Backwards Compatibility?** Keep old fields temporarily?

---

## ✅ **My Recommendation**

**Use Option 1** (Simple Array):
- Clean and simple
- Fast queries
- Easy to implement
- Summary array + detailed subcollection = best of both worlds

**What do you think?** Which option do you prefer, or should we discuss further?

