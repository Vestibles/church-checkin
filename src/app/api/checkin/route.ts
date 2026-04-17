import { NextRequest, NextResponse } from 'next/server'
import { db, isDemoMode } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'

// In-memory storage for demo mode
let demoCheckins: any[] = []

export async function POST(request: NextRequest) {
  try {
    const { fullName, centreNumber, phoneNumber, emergencyContact, children } = await request.json()

    const checkinData = {
      fullName,
      centreNumber,
      phoneNumber,
      emergencyContact,
      children,
      timestamp: new Date(),
    }

    if (isDemoMode) {
      // Store in memory for demo
      const id = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      demoCheckins.push({ id, ...checkinData })
      return NextResponse.json({ id }, { status: 200 })
    } else {
      const docRef = await addDoc(collection(db, 'checkins'), checkinData)
      return NextResponse.json({ id: docRef.id }, { status: 200 })
    }
  } catch (error) {
    console.error('Error adding checkin:', error)
    return NextResponse.json({ error: 'Failed to check in' }, { status: 500 })
  }
}

// GET endpoint to retrieve demo checkins
export async function GET() {
  if (isDemoMode) {
    return NextResponse.json(demoCheckins, { status: 200 })
  }
  return NextResponse.json({ error: 'Not in demo mode' }, { status: 400 })
}