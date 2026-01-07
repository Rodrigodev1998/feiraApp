"use client";

import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen bg-white flex items-center justify-center overflow-hidden">

      <div className="z-10 text-center max-w-md px-6">
        <h1 className="text-5xl font-bold text-indigo-600 mb-4">
          FeiraApp
        </h1>

        <p className="text-purple-500 mb-10">
          Gerencie suas compras, e evite surpresa ao finalizar no caixa
        </p>

        <GoogleButton />
      </div>
    </main>
  );
}

function GoogleButton() {
  const router = useRouter();

  async function handleLogin() {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/home");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <button
      onClick={handleLogin}
      className="w-full bg-white text-[#223A5E] font-semibold py-4 rounded-xl flex items-center justify-center gap-3 shadow-md hover:opacity-90 transition"
    >
      <img
        src="https://logos-world.net/wp-content/uploads/2020/09/Google-Symbol.png"
        alt="Google"
        className="w-10 h-5"
      />
      Entrar com Google
    </button>
  );
}
