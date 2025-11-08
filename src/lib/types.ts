
export interface Location {
  id: string;
  name: string;
  address: string;
  position: {
    lat: number;
    lng: number;
  };
  occupancy: number; // Percentage
  imageId: string;
}

export interface Room {
  id: string;
  name: string;
  locationId: string;
  capacity: number;
}

export interface Bed {
  id: string;
  bedNumber: string;
  roomId: string;
  status: 'available' | 'occupied' | 'reserved';
}

export interface Booking {
  id:string;
  bedId: string;
  userId: string;
  startDate: string;
  endDate: string;
}
