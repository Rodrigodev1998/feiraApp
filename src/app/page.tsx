import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm space-y-6 bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-xl font-semibold text-start">Entrar</h1>

        <div className="space-y-4">
          <Input type="email" placeholder="Email" />
          <Input type="password" placeholder="Senha" />
          <Button  className="w-full bg-black text-white hover:bg-gray-800">Acessar</Button>
        </div>

        <div className="text-center">
          <a href="/home" className="text-sm underline text-black hover:text-gray-700">
            Criar conta
          </a>
        </div>
      </div>
    </div>
  )
}
