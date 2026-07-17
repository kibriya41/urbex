import { getAllAdminSpots } from "../actions";
import SpotsCatalog from "./SpotsCatalog";

export default async function AdminSpotsPage() {
  const spots = await getAllAdminSpots();

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)] font-mono">Cataloged Spots</h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">Review, toggle featured status, unpublish, or delete spots from the community catalog.</p>
      </div>

      {/* Spots Catalog container */}
      <SpotsCatalog initialSpots={spots} />
    </div>
  );
}
