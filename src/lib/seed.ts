'use server';

import {
  Firestore,
  writeBatch,
  doc,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { subDays, addDays, format } from 'date-fns';

const locationsData = [
    { name: 'Stichting Vluchteling - Amsterdam', address: 'Prins Hendrikkade 1, 1012 TM Amsterdam', imageId: 'amsterdam', position: { lat: 52.379189, lng: 4.899431 } },
    { name: 'War Child Holland - Utrecht', address: 'Maliebaan 88, 3581 CW Utrecht', imageId: 'utrecht', position: { lat: 52.0913, lng: 5.1321 } },
    { name: 'Cordaid - The Hague', address: 'Lutherse Burgwal 10, 2512 CB Den Haag', imageId: 'rotterdam', position: { lat: 52.0787, lng: 4.3081 } },
    { name: 'Dokters van de Wereld - Rotterdam', address: 'Westersingel 101, 3015 LD Rotterdam', imageId: 'rotterdam', position: { lat: 51.9171, lng: 4.4752 } },
    { name: 'CARE Nederland - Groningen', address: 'Oude Ebbingestraat 61, 9712 HG Groningen', imageId: 'utrecht', position: { lat: 53.2194, lng: 6.5665 } },
    { name: 'Oxfam Novib - Eindhoven', address: 'Mauritskade 9, 5616 AA Eindhoven', imageId: 'amsterdam', position: { lat: 51.4416, lng: 5.4697 } },
    { name: 'Plan International - Leiden', address: 'Stadhouderslaan 12, 2313 AV Leiden', imageId: 'rotterdam', position: { lat: 52.1601, lng: 4.4970 } },
    { name: 'Save the Children - Maastricht', address: 'Avenue Ceramique 250, 6221 KX Maastricht', imageId: 'utrecht', position: { lat: 50.8484, lng: 5.6889 } },
    { name: 'Amnesty International - Nijmegen', address: 'Keizer Karelplein 32, 6511 NH Nijmegen', imageId: 'amsterdam', position: { lat: 51.8426, lng: 5.8629 } },
    { name: 'Hivos - Haarlem', address: 'Raamweg 16, 2011 PA Haarlem', imageId: 'rotterdam', position: { lat: 52.3874, lng: 4.6462 } },
    { name: 'Terre des Hommes - Breda', address: 'Zandvoortselaan 59, 4835 AA Breda', imageId: 'utrecht', position: { lat: 51.5719, lng: 4.7683 } },
    { name: 'Het Nederlandse Rode Kruis - Zwolle', address: 'Ceintuurbaan 2, 8022 AW Zwolle', imageId: 'amsterdam', position: { lat: 52.5168, lng: 6.0831 } },
    { name: 'Unicef Nederland - Arnhem', address: 'Jansbuitensingel 29, 6811 AD Arnhem', imageId: 'rotterdam', position: { lat: 51.9851, lng: 5.8987 } },
    { name: 'Stichting Vluchteling - Leeuwarden', address: 'Wirdumerdijk 34, 8911 CE Leeuwarden', imageId: 'utrecht', position: { lat: 53.2013, lng: 5.7999 } },
    { name: 'Humanity House - Tilburg', address: 'Spoorlaan 350, 5038 CC Tilburg', imageId: 'amsterdam', position: { lat: 51.5555, lng: 5.0667 } }
];


const firstNames = ["Aad", "Bram", "Cornelis", "Daan", "Eva", "Fenna", "Gijs", "Hannah", "Isa", "Jan", "Kees", "Lotte", "Mila", "Noah", "Olivia", "Pieter", "Quinty", "Ruben", "Sara", "Teun"];
const lastNames = ["de Vries", "Jansen", "van den Berg", "Bakker", "Smit", "Meijer", "de Boer", "Mulder", "Bos", "Vos"];

const getRandomName = () => `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;

const generateReservations = () => {
    const reservations = [];
    const today = new Date();
    // 50% chance to have any reservations at all
    if (Math.random() > 0.5) {
        return [];
    }

    // Reservation in the past
    if (Math.random() > 0.3) {
        reservations.push({
            id: uuidv4(),
            clientName: getRandomName(),
            startDate: format(subDays(today, 15), 'yyyy-MM-dd'),
            endDate: format(subDays(today, 10), 'yyyy-MM-dd'),
        });
    }
    // Current reservation
    if (Math.random() > 0.6) {
        reservations.push({
            id: uuidv4(),
            clientName: getRandomName(),
            startDate: format(subDays(today, 2), 'yyyy-MM-dd'),
            endDate: format(addDays(today, 3), 'yyyy-MM-dd'),
        });
    }
    // Future reservation
    if (Math.random() > 0.4) {
        reservations.push({
            id: uuidv4(),
            clientName: getRandomName(),
            startDate: format(addDays(today, 7), 'yyyy-MM-dd'),
            endDate: format(addDays(today, 12), 'yyyy-MM-dd'),
        });
    }

    return reservations;
};

export const seedDatabase = async (db: Firestore) => {
    const batch = writeBatch(db);

    locationsData.forEach(loc => {
        const locationId = uuidv4();
        const locationRef = doc(db, 'locations', locationId);
        batch.set(locationRef, { id: locationId, ...loc });

        const numRooms = Math.floor(Math.random() * 4) + 2; // 2 to 5 rooms
        for (let i = 1; i <= numRooms; i++) {
            const roomId = uuidv4();
            const roomRef = doc(db, 'locations', locationId, 'rooms', roomId);
            batch.set(roomRef, {
                id: roomId,
                locationId: locationId,
                name: `Room ${String.fromCharCode(64 + i)}`,
                capacity: Math.floor(Math.random() * 6) + 2, // 2 to 7 beds
                description: `A cozy room on the ${i === 1 ? 'first' : 'second'} floor.`
            });

            const numBeds = Math.floor(Math.random() * 4) + 2; // 2 to 5 beds
            for (let j = 1; j <= numBeds; j++) {
                const bedId = uuidv4();
                const bedRef = doc(db, 'locations', locationId, 'rooms', roomId, 'beds', bedId);
                batch.set(bedRef, {
                    id: bedId,
                    roomId: roomId,
                    locationId: locationId,
                    bedNumber: `Bed ${j}`,
                    reservations: generateReservations(),
                    description: `Bunk bed, top level.`
                });
            }
        }
    });

    try {
        await batch.commit();
        console.log("Database seeded successfully!");
    } catch (error) {
        console.error("Error seeding database: ", error);
    }
};
