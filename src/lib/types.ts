export interface Reservation {
  id: string;
  clientName: string;
  startDate: string;
  endDate: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  position: {
    lat: number;
    lng: number;
  };
  imageId: string;
  description?: string;
}

export interface Room {
  id: string;
  name: string;
  locationId: string;
  capacity: number;
  description?: string;
}

export interface Bed {
  id: string;
  bedNumber: string;
  roomId: string;
  locationId: string;
  reservations?: Reservation[];
  description?: string;
}

export interface Booking {
  id:string;
  bedId: string;
  userId: string;
  startDate: string;
  endDate: string;
  locationId: string;
}
