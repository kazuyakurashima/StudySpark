import { Header } from "@/components/layout/header"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { ProfileView } from "@/components/profile/profile-view"

export default function ProfilePage() {
  return (
    <main className="flex min-h-screen flex-col pb-20">
      <Header title="プロフィール" showBackButton backUrl="/home" />
      <ProfileView />
      <BottomNavigation />
    </main>
  )
}
