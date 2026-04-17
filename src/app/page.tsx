import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Church Check-in System</h1>
      <div className="flex space-x-4">
        <Link href="/checkin" className="bg-blue-500 text-white px-4 py-2 rounded">
          Check-in
        </Link>
        <Link href="/admin" className="bg-green-500 text-white px-4 py-2 rounded">
          Admin Dashboard
        </Link>
      </div>
    </main>
  )
}