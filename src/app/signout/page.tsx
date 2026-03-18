import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function SignoutPage() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
