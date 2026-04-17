'use client'

import { useEffect, useState } from 'react'
import { db, isDemoMode } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts'
import { Checkin } from '@/types'

export default function AdminPage() {
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemoMode) {
      // In demo mode, poll the API every 5 seconds
      const fetchCheckins = async () => {
        try {
          const response = await fetch('/api/checkin')
          if (response.ok) {
            const data = await response.json()
            setCheckins(data)
          }
        } catch (error) {
          console.error('Error fetching demo checkins:', error)
        } finally {
          setLoading(false)
        }
      }

      fetchCheckins()
      const interval = setInterval(fetchCheckins, 5000) // Poll every 5 seconds

      return () => clearInterval(interval)
    } else {
      // Firebase real-time updates
      const q = query(collection(db, 'checkins'), orderBy('timestamp', 'desc'))
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const checkinsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Checkin[]
        setCheckins(checkinsData)
        setLoading(false)
      })

      return () => unsubscribe()
    }
  }, [])

  const totalCheckins = checkins.length
  const totalChildren = checkins.reduce((sum, checkin) => sum + checkin.children.length, 0)

  const checkinsByCentre = checkins.reduce((acc, checkin) => {
    acc[checkin.centreNumber] = (acc[checkin.centreNumber] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const centreData = Object.entries(checkinsByCentre).map(([centre, count]) => ({
    centre,
    count,
  }))

  const ageGroups = checkins.flatMap(checkin => checkin.children.map(child => child.age))
    .reduce((acc, age) => {
      acc[age] = (acc[age] || 0) + 1
      return acc
    }, {} as Record<number, number>)

  const ageData = Object.entries(ageGroups).map(([age, count]) => ({
    age: parseInt(age),
    count,
  }))

  const exportToExcel = async () => {
    try {
      const response = await fetch('/api/export', {
        method: 'GET',
      })
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'checkins.xlsx'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      alert('Error exporting to Excel')
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-100 p-4 rounded">
          <h2 className="text-xl font-semibold">Total Check-ins</h2>
          <p className="text-2xl">{totalCheckins}</p>
        </div>
        <div className="bg-green-100 p-4 rounded">
          <h2 className="text-xl font-semibold">Total Children</h2>
          <p className="text-2xl">{totalChildren}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded">
          <h2 className="text-xl font-semibold">Unique Centres</h2>
          <p className="text-2xl">{Object.keys(checkinsByCentre).length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Check-ins by Centre</h2>
          <BarChart width={400} height={300} data={centreData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="centre" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Children Ages</h2>
          <PieChart width={400} height={300}>
            <Pie
              data={ageData}
              cx={200}
              cy={150}
              labelLine={false}
              label={({ age, percent }) => `${age} years: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {ageData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
      </div>

      <div className="mb-8">
        <button
          onClick={exportToExcel}
          className="bg-green-500 text-white px-4 py-2 rounded mb-4"
        >
          Export to Excel
        </button>
        <h2 className="text-xl font-semibold mb-4">Recent Check-ins</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Name</th>
                <th className="border border-gray-300 px-4 py-2">Centre</th>
                <th className="border border-gray-300 px-4 py-2">Phone</th>
                <th className="border border-gray-300 px-4 py-2">Children</th>
                <th className="border border-gray-300 px-4 py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {checkins.slice(0, 20).map((checkin) => (
                <tr key={checkin.id}>
                  <td className="border border-gray-300 px-4 py-2">{checkin.fullName}</td>
                  <td className="border border-gray-300 px-4 py-2">{checkin.centreNumber}</td>
                  <td className="border border-gray-300 px-4 py-2">{checkin.phoneNumber}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {checkin.children.length > 0
                      ? checkin.children.map(child => `${child.name} (${child.age})`).join(', ')
                      : 'None'
                    }
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {checkin.timestamp instanceof Date
                      ? checkin.timestamp.toLocaleString()
                      : checkin.timestamp?.toDate
                        ? checkin.timestamp.toDate().toLocaleString()
                        : new Date(checkin.timestamp.seconds * 1000).toLocaleString()
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}