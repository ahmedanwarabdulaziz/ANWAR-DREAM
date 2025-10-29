/**
 * Database Type Definitions
 * All interfaces for the customer class and referral system
 */

// Permanent conversion rate: 100 points = $1 USD
export const POINTS_TO_DOLLAR_RATE = 100

/**
 * Referral Summary Interface (for user document)
 * Tracks referrals made by this customer
 */
export interface ReferralSummary {
  referralId: string
  businessId: string
  referredCustomerId: string
  referredCustomerName: string
  pointsEarned: number
  createdAt: string // ISO timestamp
}

export interface BusinessAssignment {
  businessId: string
  customerClassId: string
  joinedAt: string // ISO timestamp
  status: 'active' | 'inactive' | 'suspended'
  offerPoints: number // Points from signup, referrals, bonuses, tasks, admin grants
  purchasePoints: number // Points from purchases (future feature)
  totalPoints: number // offerPoints + purchasePoints
}

/**
 * Business Document Interface
 */
export interface Business {
  businessId: string
  name: string
  ownerId: string // Customer ID of business owner
  email: string
  phone?: string
  address?: string
  businessType?: string
  website?: string
  isActive: boolean
  allowPublicCustomer: boolean // If true, auto-join public customers (BC prefix) to this business
  createdAt: string // ISO timestamp
  settings: BusinessSettings
}

export interface BusinessSettings {
  pointsToDollarRate: number // Always 100 (system-wide constant)
  allowCustomClasses: boolean
  defaultReferralRouting: 'referral_class' | 'referrer_class' | 'custom'
  customReferralClassId?: string // Used if defaultReferralRouting = 'custom'
}

/**
 * Customer Class Document Interface
 */
export interface CustomerClass {
  classId: string
  businessId: string
  name: string
  type: 'permanent' | 'custom'
  description?: string
  isActive: boolean
  createdAt: string // ISO timestamp
  qrCode: QRCodeData
  signupLink: string
  points: ClassPointsConfig
  benefits: ClassBenefits
  analytics: ClassAnalytics
}

export interface QRCodeData {
  data: string // URL for QR code
  imageUrl: string // Cloudinary URL for QR code image
}

export interface ClassPointsConfig {
  welcomePoints: number // Points given when customer joins this class
  referrerPoints: number // Points given to person who made referral
  referredPoints: number // Points given to person who was referred
}

export interface ClassBenefits {
  pointsMultiplier: number // Multiply earned points (e.g., 1.5 = 50% bonus)
  discountPercentage: number // Discount percentage on purchases
  specialOffers: boolean
  freeShipping?: boolean
  earlyAccess?: boolean
}

export interface ClassAnalytics {
  totalCustomers: number
  totalPointsDistributed: number
  totalWelcomePointsGiven: number
  totalReferrerPointsGiven: number
  totalReferredPointsGiven: number
  lastUpdated: string // ISO timestamp
}

/**
 * Customer-Business Relationship Document Interface
 */
export interface CustomerBusinessRelationship {
  customerId: string
  businessId: string
  customerClassId: string
  joinedAt: string // ISO timestamp
  status: 'active' | 'inactive' | 'suspended'
  totalPoints: number
  totalPointsEarned: number
  totalPointsRedeemed: number
  totalPointsValue: number // Calculated: totalPoints / 100 (always $)
  totalVisits: number
  lastVisit?: string // ISO timestamp
  referrerId?: string // Customer ID who referred this customer
  referredBy?: string // Class ID from which referral happened
  referralDate?: string // ISO timestamp
  classHistory: ClassHistoryEntry[]
  notes?: string
  tags?: string[]
}

export interface ClassHistoryEntry {
  classId: string
  joinedAt: string // ISO timestamp
  migratedAt?: string // ISO timestamp (if migrated)
  reason: 'initial_signup' | 'task_completed' | 'manual' | 'points_threshold' | 'referral'
}

/**
 * Referral Tracking Document Interface
 */
export interface Referral {
  referralId: string
  businessId: string
  referrerId: string // Customer who made the referral
  referredId: string // Customer who was referred
  referrerClassId: string // Class of the person who referred
  assignedClassId: string // Class the referred person was assigned to
  referralRouting: 'referral_class' | 'referrer_class' | 'custom'
  status: 'pending' | 'completed' | 'failed'
  createdAt: string // ISO timestamp
  completedAt?: string // ISO timestamp
  pointsDistributed?: PointsDistribution
}

export interface PointsDistribution {
  referrerReceived: number
  referredReceived: number
  distributedAt: string // ISO timestamp
}

/**
 * Customer Personal Referral Link Document Interface
 */
export interface CustomerReferralLink {
  customerId: string
  businessId: string
  currentClassId: string
  referralLink: string // URL: https://yourapp.com/signup?ref=BC2085&b=BIZ001
  qrCode: QRCodeData
  totalReferrals: number
  totalReferralPoints: number
  createdAt: string // ISO timestamp
  lastUsed?: string // ISO timestamp
}

/**
 * Class Migration Document Interface
 */
export interface ClassMigration {
  migrationId: string
  businessId: string
  customerId: string
  fromClassId: string
  toClassId: string
  reason: 'task_completed' | 'manual' | 'points_threshold' | 'system'
  initiatedBy: 'customer' | 'business' | 'system'
  taskId?: string // If reason = 'task_completed'
  pointsAtMigration: number
  createdAt: string // ISO timestamp
  notes?: string
}

/**
 * URL Parameters Interface (for signup links)
 */
export interface SignupURLParams {
  b?: string // Business ID (required)
  c?: string // Customer Class ID (optional, defaults to General)
  ref?: string // Referrer Customer ID (optional, for referrals)
}

/**
 * Points Transaction Interface
 */
export interface PointsTransaction {
  transactionId: string
  customerId: string
  businessId: string
  amount: number // Positive for earned, negative for redeemed
  type: 'welcome' | 'referrer' | 'referred' | 'purchase' | 'redemption' | 'adjustment'
  description: string
  relatedId?: string // ID of related record (referralId, purchaseId, etc.)
  createdAt: string // ISO timestamp
}

/**
 * Class Migration Trigger Interface (for automatic migrations)
 */
export interface MigrationTrigger {
  triggerId: string
  businessId: string
  fromClassId: string
  toClassId: string
  triggerType: 'points_threshold' | 'visit_count' | 'spend_amount'
  thresholdValue: number
  isActive: boolean
  createdAt: string // ISO timestamp
}

