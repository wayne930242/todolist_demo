import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import TodoList from "./components/TodoList";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12 py-8">
      <div className="container mx-auto flex flex-col gap-4 items-stretch">
        <h1 className="text-3xl font-bold mb-6 text-center">Your Tasks</h1>
        <TodoList />
      </div>
    </div>
  );
}
