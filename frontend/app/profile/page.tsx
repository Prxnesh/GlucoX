import { PageShell } from "@/components/layout/page-shell";
import { ProfileView } from "@/features/profile/profile-view";

export default function ProfilePage() {
  return (
    <PageShell>
      <div className="py-8">
        <ProfileView />
      </div>
    </PageShell>
  );
}
