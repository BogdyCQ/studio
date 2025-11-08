
import { collection, writeBatch, doc, Firestore } from 'firebase/firestore';

const sampleLocations = [
    { name: "Huis van Hoop", address: "Nieuwezijds Voorburgwal 101, Amsterdam", position: { lat: 52.374, lng: 4.889 }, imageId: "amsterdam", description: "Een veilige haven in het hart van Amsterdam, die onderdak en begeleiding biedt aan diegenen die het het hardst nodig hebben." },
    { name: "De Veilige Haven", address: "Wijnhaven 107, Rotterdam", position: { lat: 51.917, lng: 4.484 }, imageId: "rotterdam", description: "Biedt acute opvang en langdurige zorg voor individuen en gezinnen die dakloos zijn." },
    { name: "Stadsoase Utrecht", address: "Oudegracht aan de Werf 123, Utrecht", position: { lat: 52.091, lng: 5.122 }, imageId: "utrecht", description: "Een rustpunt in de drukke stad, waar mensen op adem kunnen komen en ondersteuning vinden." },
    { name: "Het Warme Nest", address: "Grote Markt 22, Groningen", position: { lat: 53.219, lng: 6.567 }, imageId: "hero", description: "Een gastvrije plek in het noorden die warmte en zorg biedt aan iedereen die dat nodig heeft." },
    { name: "Lichtpunt Eindhoven", address: "Demer 2, Eindhoven", position: { lat: 51.439, lng: 5.479 }, imageId: "hero", description: "Een baken van hoop in de lichtstad, gericht op re-integratie en zelfredzaamheid." },
    { name: "Haagse Toevlucht", address: "Spui 68, Den Haag", position: { lat: 52.078, lng: 4.315 }, imageId: "hero", description: "Biedt een veilige plek en juridische ondersteuning aan vluchtelingen en ontheemden." },
    { name: "De Helpende Hand", address: "Grote Houtstraat 180, Haarlem", position: { lat: 52.381, lng: 4.632 }, imageId: "hero", description: "Een gemeenschapscentrum dat zich richt op maaltijdvoorziening en dagopvang." },
    { name: "Maastrichts Medeleven", address: "Vrijthof 10, Maastricht", position: { lat: 50.849, lng: 5.688 }, imageId: "hero", description: "Zuid-Limburgse gastvrijheid voor hen die op zoek zijn naar een luisterend oor en een bed." },
    { name: "Arnhemse Armslag", address: "Jansplaats 8, Arnhem", position: { lat: 51.984, lng: 5.910 }, imageId: "hero", description: "Geeft mensen de ruimte om te herstellen en weer op eigen benen te staan." },
    { name: "Nijmeegs Welkom", address: "Burchtstraat 55, Nijmegen", position: { lat: 51.845, lng: 5.864 }, imageId: "hero", description: "Een open deur voor iedereen die tijdelijk geen thuis heeft in de oudste stad van Nederland." },
    { name: "Amersfoortse Aandacht", address: "Langestraat 100, Amersfoort", position: { lat: 52.155, lng: 5.388 }, imageId: "hero", description: "Gericht op persoonlijke aandacht en het creëren van een familiegevoel voor bewoners." },
    { name: "Breda's Baken", address: "Grote Markt 1, Breda", position: { lat: 51.588, lng: 4.776 }, imageId: "hero", description: "Een stabiel punt in Breda voor mensen die door moeilijke tijden gaan." },
    { name: "Leidse Luwte", address: "Breestraat 88, Leiden", position: { lat: 52.159, lng: 4.490 }, imageId: "hero", description: "Biedt een kalme en ondersteunende omgeving voor herstel en persoonlijke groei." },
    { name: "Tilburgs Thuis", address: "Heuvelstraat 40, Tilburg", position: { lat: 51.556, lng: 5.092 }, imageId: "hero", description: "Creëert een thuisgevoel voor hen die het tijdelijk moeten missen." },
    { name: "Zwolse Zorg", address: "Melkmarkt 1, Zwolle", position: { lat: 52.513, lng: 6.094 }, imageId: "hero", description: "Staat klaar met zorg en ondersteuning voor de meest kwetsbaren in de regio Zwolle." },
];

export const seedDatabase = async (db: Firestore) => {
    try {
        console.log('Starting database seed...');
        const batch = writeBatch(db);

        // Delete existing locations to prevent duplicates
        const locationsSnapshot = await collection(db, 'locations').get();
        locationsSnapshot.forEach((doc) => batch.delete(doc.ref));
        console.log('Cleared existing locations.');

        const bedsCollectionGroup = collection(db, 'beds');
        const bedsSnapshot = await bedsCollectionGroup.get();
        bedsSnapshot.forEach(doc => batch.delete(doc.ref));
        console.log('Cleared existing beds.');

        const roomsCollectionGroup = collection(db, 'rooms');
        const roomsSnapshot = await roomsCollectionGroup.get();
        roomsSnapshot.forEach(doc => batch.delete(doc.ref));
        console.log('Cleared existing rooms.');

        // Create new locations, rooms, and beds
        for (const loc of sampleLocations) {
            const locationRef = doc(collection(db, 'locations'));
            const locationId = locationRef.id;

            batch.set(locationRef, { ...loc, id: locationId });

            const numRooms = Math.floor(Math.random() * 5) + 3; // 3-7 rooms
            for (let i = 1; i <= numRooms; i++) {
                const roomRef = doc(collection(db, `locations/${locationId}/rooms`));
                const roomId = roomRef.id;

                const roomData = {
                    id: roomId,
                    locationId: locationId,
                    name: `Kamer ${i}`,
                    capacity: Math.floor(Math.random() * 4) + 1, // 1-4 beds
                    description: `Een comfortabele kamer op de ${i % 2 === 0 ? 'begane grond' : 'eerste verdieping'}.`
                };
                batch.set(roomRef, roomData);

                for (let j = 1; j <= roomData.capacity; j++) {
                    const bedRef = doc(collection(db, `locations/${locationId}/rooms/${roomId}/beds`));
                    const bedId = bedRef.id;
                    const statuses = ['available', 'occupied', 'reserved'];
                    const status = statuses[Math.floor(Math.random() * statuses.length)];

                    const bedData = {
                        id: bedId,
                        roomId: roomId,
                        locationId: locationId, // Add locationId directly to bed
                        bedNumber: `Bed ${j}`,
                        status: status,
                        description: "Standaard eenpersoonsbed."
                    };
                    batch.set(bedRef, bedData);
                }
            }
        }

        await batch.commit();
        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
};
