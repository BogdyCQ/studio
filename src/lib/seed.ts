
import { collection, writeBatch, doc } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import type { Location, Room, Bed } from "@/lib/types";

// Note: This is a simplified seeding script. In a real-world application,
// this would likely be a more robust script run from the command line.

const locations: Omit<Location, 'id'>[] = [
    {
        name: 'Huis van Hoop Amsterdam',
        address: 'Europaboulevard 2, 1078 RV Amsterdam',
        position: { lat: 52.342, lng: 4.880 },
        imageId: 'amsterdam',
        description: 'Een moderne faciliteit in het hart van Amsterdam Zuid, gericht op het bieden van kortdurende opvang en begeleiding.'
    },
    {
        name: 'De Veilige Haven Utrecht',
        address: 'Catharijnesingel 55, 3511 GD Utrecht',
        position: { lat: 52.088, lng: 5.112 },
        imageId: 'utrecht',
        description: 'Gelegen nabij het centrum, biedt deze locatie een rustige en ondersteunende omgeving voor langduriger verblijf.'
    },
    {
        name: 'Stichting Toevlucht Rotterdam',
        address: 'Provenierssingel 1, 3033 EG Rotterdam',
        position: { lat: 51.929, lng: 4.472 },
        imageId: 'rotterdam',
        description: 'Gespecialiseerd in crisisopvang en noodhulp, met een team dat 24/7 paraat staat.'
    },
    {
        name: 'Residentie van Zorg Den Haag',
        address: 'Stationsplein 1, 2515 Den Haag',
        position: { lat: 52.070, lng: 4.323 },
        imageId: 'hero',
        description: 'Een grootschalige voorziening met diverse woonvormen, van zelfstandige units tot groepswonen.'
    },
    {
        name: 'Lichtpunt Eindhoven',
        address: 'Stationsplein 22, 5611 AC Eindhoven',
        position: { lat: 51.442, lng: 5.481 },
        imageId: 'hero',
        description: 'Focus op jongvolwassenen en het bieden van een springplank naar zelfstandigheid.'
    },
    {
        name: 'Noorderlicht Opvang Groningen',
        address: 'Grote Markt 1, 9712 HN Groningen',
        position: { lat: 53.219, lng: 6.567 },
        imageId: 'hero',
        description: 'Een warme en gastvrije opvang in de binnenstad van Groningen, met veel aandacht voor sociale activiteiten.'
    },
    {
        name: 'MaasZorg Maastricht',
        address: 'Parallelweg 2, 6221 BD Maastricht',
        position: { lat: 50.849, lng: 5.699 },
        imageId: 'hero',
        description: 'Biedt gespecialiseerde zorg en begeleiding in een huiselijke sfeer in de wijk Wyck.'
    },
    {
        name: 'Sleutelstad Steunpunt Leiden',
        address: 'Stationsweg 26, 2312 AV Leiden',
        position: { lat: 52.166, lng: 4.485 },
        imageId: 'hero',
        description: 'Centraal gelegen steunpunt voor ambulante begeleiding en tijdelijke opvang.'
    },
    {
        name: 'RijnIJssel Woonzorg Arnhem',
        address: 'Jansplein 1, 6811 KG Arnhem',
        position: { lat: 51.985, lng: 5.908 },
        imageId: 'hero',
        description: 'Combineert wonen met zorg en biedt dagbesteding en re-integratietrajecten.'
    },
    {
        name: 'IJsselThuis Zwolle',
        address: 'Stationsplein 16, 8011 CW Zwolle',
        position: { lat: 52.505, lng: 6.091 },
        imageId: 'hero',
        description: 'Een veilige thuishaven voor mensen die tijdelijk een dak boven hun hoofd nodig hebben, met focus op doorstroom.'
    },
].map(loc => ({ ...loc, id: loc.name.toLowerCase().replace(/\s/g, '-') }));


const bedStatuses: Bed['status'][] = ['available', 'occupied', 'reserved'];

export async function seedDatabase(firestore: Firestore) {
    console.log("Starting to seed the database...");
    const batch = writeBatch(firestore);

    // Clear existing locations to avoid duplicates
    const oldLocationsQuery = collection(firestore, "locations");
    const oldLocationsSnapshot = await firestore.collection("locations").get();
    oldLocationsSnapshot.forEach(doc => batch.delete(doc.ref));

    for (const location of locations) {
        const locationRef = doc(firestore, "locations", location.id);
        batch.set(locationRef, location);

        const numRooms = Math.floor(Math.random() * 5) + 3; // 3-7 rooms
        for (let i = 1; i <= numRooms; i++) {
            const roomId = `room-${i}`;
            const roomRef = doc(locationRef, "rooms", roomId);
            const room: Omit<Room, 'id'> = {
                locationId: location.id,
                name: `Kamer ${100 + i}`,
                capacity: 4,
                description: `Een standaard kamer met basisvoorzieningen voor maximaal 4 personen.`
            };
            batch.set(roomRef, room);

            const numBedsInRoom = 4;
            for (let j = 1; j <= numBedsInRoom; j++) {
                const bedId = `bed-${j}`;
                const bedRef = doc(roomRef, "beds", bedId);
                const status = bedStatuses[Math.floor(Math.random() * bedStatuses.length)];

                const bed: Omit<Bed, 'id'> = {
                    roomId: roomId,
                    locationId: location.id,
                    bedNumber: `Bed ${String.fromCharCode(64 + j)}`, // A, B, C, D
                    status: status,
                    description: `Standaard eenpersoonsbed in kamer ${100+i}.`
                };
                batch.set(bedRef, bed);
            }
        }
    }

    try {
        await batch.commit();
        console.log("Database seeded successfully!");
    } catch (error) {
        console.error("Error seeding database: ", error);
    }
}
