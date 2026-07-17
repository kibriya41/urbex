import { getModerationQueue } from "../actions";
import ModerationList from "./ModerationList";

export default async function ModerationQueuePage() {
  const pendingSpots = await getModerationQueue();

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)] font-mono">Moderation Queue</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">Review new spot submissions before they are published to explore page.</p>
        </div>
      </div>

      {/* Moderation List Container */}
      <ModerationList initialSpots={pendingSpots} />
    </div>
  );
}
