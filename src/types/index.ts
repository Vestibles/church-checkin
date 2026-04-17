export interface Child {
  name: string
  age: number
}

export interface Checkin {
  id: string
  fullName: string
  centreNumber: string
  phoneNumber: string
  children: Child[]
  timestamp: any // Firebase timestamp
}