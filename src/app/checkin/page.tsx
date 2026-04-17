'use client'

import { useState } from 'react'
import { Child } from '@/types'

export default function CheckinPage() {
  const [fullName, setFullName] = useState('')
  const [centreNumber, setCentreNumber] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [hasChildren, setHasChildren] = useState(false)
  const [children, setChildren] = useState<Child[]>([])
  const [phoneError, setPhoneError] = useState('')

  const toTitleCase = (str: string) => {
    return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^0\d{10}$/
    if (!phoneRegex.test(phone)) {
      setPhoneError('Phone number must be 11 digits starting with 0')
      return false
    }
    setPhoneError('')
    return true
  }

  const addChild = () => {
    setChildren([...children, { name: '', age: 0 }])
  }

  const updateChild = (index: number, field: keyof Child, value: string | number) => {
    const newChildren = [...children]
    newChildren[index] = { ...newChildren[index], [field]: value }
    setChildren(newChildren)
  }

  const removeChild = (index: number) => {
    setChildren(children.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validatePhoneNumber(phoneNumber)) {
      return
    }
    
    setSubmitting(true)

    const checkinData = {
      fullName,
      centreNumber,
      phoneNumber,
      children: hasChildren ? children : [],
    }

    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkinData),
      })

      if (response.ok) {
        setSubmitted(true)
      } else {
        alert('Error submitting check-in')
      }
    } catch (error) {
      alert('Error submitting check-in')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold mb-4">Check-in Successful!</h1>
        <p>Thank you for checking in. You can now proceed to the event.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Check-in Another Person
        </button>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-8">Event Check-in</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(toTitleCase(e.target.value))}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Centre</label>
          <input
            type="text"
            value={centreNumber}
            onChange={(e) => setCentreNumber(toTitleCase(e.target.value))}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value)
              if (e.target.value) validatePhoneNumber(e.target.value)
            }}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
          {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
        </div>
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={hasChildren}
              onChange={(e) => setHasChildren(e.target.checked)}
              className="mr-2"
            />
            I am caring for children
          </label>
        </div>
        {hasChildren && (
          <div>
            <h3 className="text-lg font-medium mb-2">Children</h3>
            {children.map((child, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  placeholder="Child's Name"
                  value={child.name}
                  onChange={(e) => updateChild(index, 'name', toTitleCase(e.target.value))}
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded"
                />
                <input
                  type="number"
                  placeholder="Age"
                  value={child.age || ''}
                  onChange={(e) => updateChild(index, 'age', parseInt(e.target.value) || 0)}
                  required
                  className="w-20 px-3 py-2 border border-gray-300 rounded"
                />
                <button
                  type="button"
                  onClick={() => removeChild(index)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addChild}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Add Child
            </button>
          </div>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-500 text-white py-2 rounded disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Check In'}
        </button>
      </form>
    </main>
  )
}