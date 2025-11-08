import { LocationList } from "@/components/locations/location-list";
import { locations } from "@/lib/data";

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <LocationList locations={locations} />
        </div>
    );
}
