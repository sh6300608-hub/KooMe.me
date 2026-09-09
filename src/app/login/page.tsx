import { signIn } from "@/lib/auth";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl">
        <p className="text-sm text-blue-400">KooMi</p>
        <h1 className="mt-2 text-2xl font-semibold">Private workspace</h1>
        <p className="mt-2 text-sm text-slate-400">Owner access only.</p>
        <form action={async (formData) => { "use server"; await signIn("credentials", { email: formData.get("email"), password: formData.get("password"), redirectTo: "/dashboard" }); }} className="mt-7 space-y-4">
          <label className="block text-sm">Email<input name="email" type="email" autoComplete="email" required className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-blue-500" /></label>
          <label className="block text-sm">Password<input name="password" type="password" autoComplete="current-password" required minLength={8} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-blue-500" /></label>
          <button type="submit" className="w-full rounded-lg bg-blue-500 px-4 py-2.5 font-medium hover:bg-blue-400">Sign in</button>
        </form>
      </div>
    </main>
  );
}
