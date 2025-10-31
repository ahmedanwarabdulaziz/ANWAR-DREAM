@echo off
REM Firestore Rules Deployment Script for Windows
REM This script helps deploy Firestore security rules to Firebase

echo 🔥 Deploying Firestore Security Rules...

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Firebase CLI is not installed. Please install it first:
    echo    npm install -g firebase-tools
    pause
    exit /b 1
)

REM Check if user is logged in
firebase projects:list >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Not logged in to Firebase. Please login first:
    echo    firebase login
    pause
    exit /b 1
)

REM Check if firebase.json exists
if not exist "firebase.json" (
    echo ❌ firebase.json not found. Please initialize Firebase first:
    echo    firebase init firestore
    pause
    exit /b 1
)

REM Check if firestore.rules exists
if not exist "firestore.rules" (
    echo ❌ firestore.rules not found. Please create the rules file first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Deploy rules
echo 🚀 Deploying rules to Firebase...
firebase deploy --only firestore:rules

if %errorlevel% equ 0 (
    echo ✅ Firestore rules deployed successfully!
    echo.
    echo 📋 Next steps:
    echo    1. Test the rules in Firebase Console → Firestore → Rules
    echo    2. Monitor rule violations in Firebase Console
    echo    3. Test user signup functionality
    echo.
    echo 🔗 Firebase Console: https://console.firebase.google.com/
) else (
    echo ❌ Deployment failed. Please check the error messages above.
    pause
    exit /b 1
)

pause







