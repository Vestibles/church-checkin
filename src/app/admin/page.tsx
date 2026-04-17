'use client'

import { useEffect, useState } from 'react'
import { db, isDemoMode } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts'
import { Checkin } from '@/types'

const ADMIN_PASSWORD = 'Kereke'

const formatTooltip = (_value: number, _name: string, props: any) => {
  const payload = props?.payload?.[0]
  if (!payload) return ['', '']
  const value = payload.value
  const percent = payload.percent
  return [`${value}`, `${percent ? (percent * 100).toFixed(0) : '0'}%`]
}

const CustomPieTooltip = ({ active, payload }: any) => {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const item = payload[0]
  const value = item.value
  const age = item.payload.age
  
  // Access the pie instance to get total
  const pieInstance = item.payload.pieInstance
  const total = item.payload.total
  const percent = total ? (value / total) * 100 : 0

  return (
    <div className="rounded border border-gray-300 bg-white p-3 shadow-lg">
      <div className="text-sm font-semibold">Age {age}</div>
      <div className="mt-1 text-sm">Count: {value}</div>
      <div className="text-sm">Percentage: {percent.toFixed(1)}%</div>
    </div>
  )
}

export default function AdminPage() {
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [loading, setLoading] = useState(true)
  const [adminPassword, setAdminPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [showDataTable, setShowDataTable] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCentre, setFilterCentre] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = window.sessionStorage.getItem('adminAccess')
      setIsAuthenticated(saved === 'true')
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

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
  }, [isAuthenticated])

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

  const ageGroups = checkins
    .flatMap(checkin => checkin.children)
    .map(child => Number(child.age))
    .filter(age => !Number.isNaN(age) && age >= 0)
    .reduce((acc, age) => {
      acc[age] = (acc[age] || 0) + 1
      return acc
    }, {} as Record<number, number>)

  const ageDataList = Object.entries(ageGroups)
    .map(([age, count]) => ({
      age: Number(age),
      count,
    }))
    .sort((a, b) => a.age - b.age)

  const totalAgeCount = ageDataList.reduce((sum, item) => sum + item.count, 0)
  
  const ageData = ageDataList.map(item => ({
    ...item,
    total: totalAgeCount
  }))

  const filteredCheckins = checkins.filter(checkin => {
    const matchesSearch = searchTerm === '' ||
      checkin.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checkin.phoneNumber.includes(searchTerm) ||
      checkin.emergencyContact.includes(searchTerm) ||
      checkin.children.some(child => child.name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCentre = filterCentre === '' || checkin.centreNumber === filterCentre
    
    return matchesSearch && matchesCentre
  })

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

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault()

    if (adminPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      window.sessionStorage.setItem('adminAccess', 'true')
      setPasswordError('')
    } else {
      setPasswordError('Password incorrect')
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
          <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
          <p className="mb-4 text-sm text-gray-600">Enter the admin password to access the dashboard.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2"
                required
              />
            </div>
            {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
            <button type="submit" className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Unlock Dashboard
            </button>
          </form>
        </div>
      </main>
    )
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
          <BarChart width={700} height={320} data={centreData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="centre" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4">Children Ages</h2>
          <PieChart width={520} height={360}>
            <Pie
              data={ageData}
              cx={260}
              cy={180}
              label={false}
              labelLine={false}
              outerRadius={140}
              fill="#8884d8"
              dataKey="count"
            >
              {ageData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
              ))}
            </Pie>
            <Tooltip content={CustomPieTooltip} />
          </PieChart>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setShowDataTable(!showDataTable)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {showDataTable ? 'Hide Data' : 'Show Data'}
          </button>
          <button
            onClick={exportToExcel}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Export to Excel
          </button>
        </div>
        
        {showDataTable && (
          <>
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by name, phone, emergency contact, or child name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <select
                  value={filterCentre}
                  onChange={(e) => setFilterCentre(e.target.value)}
                  className="rounded border border-gray-300 px-3 py-2"
                >
                  <option value="">All Centres</option>
                  {Object.keys(checkinsByCentre).sort().map(centre => (
                    <option key={centre} value={centre}>{centre}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <h2 className="text-xl font-semibold mb-4">Check-in Data ({filteredCheckins.length} entries)</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2">Name</th>
                    <th className="border border-gray-300 px-4 py-2">Centre</th>
                    <th className="border border-gray-300 px-4 py-2">Phone</th>
                    <th className="border border-gray-300 px-4 py-2">Emergency Contact</th>
                    <th className="border border-gray-300 px-4 py-2">Children</th>
                    <th className="border border-gray-300 px-4 py-2">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCheckins.map((checkin) => (
                    <tr key={checkin.id}>
                      <td className="border border-gray-300 px-4 py-2">{checkin.fullName}</td>
                      <td className="border border-gray-300 px-4 py-2">{checkin.centreNumber}</td>
                      <td className="border border-gray-300 px-4 py-2">{checkin.phoneNumber}</td>
                      <td className="border border-gray-300 px-4 py-2">{checkin.emergencyContact}</td>
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
          </>
        )}
      </div>
    </main>
  )
}