import type { Location, Room, Bed } from './types';

export const locations: Location[] = [
  {
    id: 'amsterdam-01',
    name: 'Amsterdam Central Hub',
    address: 'Stationsplein, 1012 AB Amsterdam',
    position: { lat: 52.379189, lng: 4.899431 },
    occupancy: 75,
    imageId: 'amsterdam',
  },
  {
    id: 'rotterdam-01',
    name: 'Rotterdam Portside',
    address: 'Wilhelminakade 909, 3072 AP Rotterdam',
    position: { lat: 51.9066, lng: 4.4883 },
    occupancy: 40,
    imageId: 'rotterdam',
  },
  {
    id: 'utrecht-01',
    name: 'Utrecht Dom Tower View',
    address: 'Domplein 21, 3512 JE Utrecht',
    position: { lat: 52.0907, lng: 5.1214 },
    occupancy: 90,
    imageId: 'utrecht',
  },
];

export const rooms: Room[] = [
  { id: 'a-01', name: 'Canal Room', locationId: 'amsterdam-01' },
  { id: 'a-02', name: 'City Room', locationId: 'amsterdam-01' },
  { id: 'r-01', name: 'Harbor Room', locationId: 'rotterdam-01' },
  { id: 'u-01', name: 'Cathedral Room', locationId: 'utrecht-01' },
];

export const beds: Bed[] = [
  // Amsterdam
  { id: 'a-01-b1', name: 'Bed 1', roomId: 'a-01', status: 'occupied' },
  { id: 'a-01-b2', name: 'Bed 2', roomId: 'a-01', status: 'available' },
  { id: 'a-02-b1', name: 'Bed 1', roomId: 'a-02', status: 'reserved' },
  { id: 'a-02-b2', name: 'Bed 2', roomId: 'a-02', status: 'occupied' },
  // Rotterdam
  { id: 'r-01-b1', name: 'Bed 1', roomId: 'r-01', status: 'available' },
  { id: 'r-01-b2', name: 'Bed 2', roomId: 'r-01', status: 'available' },
  { id: 'r-01-b3', name: 'Bed 3', roomId: 'r-01', status: 'available' },
  // Utrecht
  { id: 'u-01-b1', name: 'Bed 1', roomId: 'u-01', status: 'occupied' },
  { id: 'u-01-b2', name: 'Bed 2', roomId: 'u-01', status: 'occupied' },
];
