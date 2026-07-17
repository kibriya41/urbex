import { redirect } from "next/navigation";

// Individual user detail pages are shown in the Users panel's slide-over drawer.
// Direct URL access redirects back to the users list.
export default function UserDetailRedirect() {
  redirect("/admin/users");
}
