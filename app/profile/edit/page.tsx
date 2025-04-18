import { Header } from "@/components/layout/header"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { ProfileEdit } from "@/components/profile/profile-edit"

export default function ProfileEditPage() {
  return (
    <main className="flex min-h-screen flex-col pb-20">
      <Header title="プロフィール編集" showBackButton backUrl="/profile" />
      <ProfileEdit />
      <BottomNavigation />
    </main>
  )
}
