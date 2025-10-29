import { NextRequest, NextResponse } from 'next/server'
import { UserManager } from '@/server/firebase-admin'

export async function GET() {
  try {
    // List all users (paginated)
    const listUsersResult = await UserManager.listUsers()
    
    const users = listUsersResult.users.map(userRecord => ({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      emailVerified: userRecord.emailVerified,
      disabled: userRecord.disabled,
      metadata: {
        creationTime: userRecord.metadata.creationTime,
        lastSignInTime: userRecord.metadata.lastSignInTime,
        lastRefreshTime: userRecord.metadata.lastRefreshTime
      },
      customClaims: userRecord.customClaims,
      providerData: userRecord.providerData
    }))

    return NextResponse.json({
      success: true,
      users,
      totalUsers: users.length
    })
  } catch (error) {
    console.error('Error fetching auth users:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch auth users' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { uids } = await request.json()
    
    if (!uids || !Array.isArray(uids) || uids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No user IDs provided' },
        { status: 400 }
      )
    }

    const result = await UserManager.deleteUsers(uids)
    
    return NextResponse.json({
      success: true,
      message: `Deleted ${result.successCount} users successfully${result.failureCount > 0 ? `, ${result.failureCount} failed` : ''}`,
      successCount: result.successCount,
      failureCount: result.failureCount,
      errors: result.errors
    })
  } catch (error) {
    console.error('Error deleting auth users:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete auth users' },
      { status: 500 }
    )
  }
}