#!/bin/bash

# Firestore Rules Deployment Script
# This script helps deploy Firestore security rules to Firebase

echo "🔥 Deploying Firestore Security Rules..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "   npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please login first:"
    echo "   firebase login"
    exit 1
fi

# Check if firebase.json exists
if [ ! -f "firebase.json" ]; then
    echo "❌ firebase.json not found. Please initialize Firebase first:"
    echo "   firebase init firestore"
    exit 1
fi

# Check if firestore.rules exists
if [ ! -f "firestore.rules" ]; then
    echo "❌ firestore.rules not found. Please create the rules file first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Deploy rules
echo "🚀 Deploying rules to Firebase..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo "✅ Firestore rules deployed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Test the rules in Firebase Console → Firestore → Rules"
    echo "   2. Monitor rule violations in Firebase Console"
    echo "   3. Test user signup functionality"
    echo ""
    echo "🔗 Firebase Console: https://console.firebase.google.com/"
else
    echo "❌ Deployment failed. Please check the error messages above."
    exit 1
fi

