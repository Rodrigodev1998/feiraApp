"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Plus, ShoppingCart, LogOut } from "lucide-react"
import { useState } from "react"

interface Cart {
  name: string
  description: string
}

export default function Home() {
  const [carts, setCarts] = useState<Cart[]>([])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  function handleSave() {
    setCarts([...carts, { name, description }])
    setName("")
    setDescription("")
  }

  return (
    <div className="min-h-screen p-4 bg-white">
      <div className="flex justify-end mb-4">
        <Button variant="ghost" size="icon">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      <h1 className="text-start text-lg font-medium flex items-center justify-center gap-2">
        Meus Carrinhos <ShoppingCart className="w-4 h-4" />
      </h1>

      <div className="flex gap-4 justify-center mt-6 flex-wrap">
        <Dialog>
          <DialogTrigger asChild>
            <Card className="w-28 h-28 flex items-center justify-center border-dashed cursor-pointer">
              <Plus className="w-8 h-8" />
            </Card>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Carrinho</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
              <Input placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
              <DialogTrigger asChild>
                <Button className="w-full" onClick={handleSave}>Salvar</Button>
              </DialogTrigger>
            </div>
          </DialogContent>
        </Dialog>

        {carts.map((cart, index) => (
          <Card
            key={index}
            className="w-28 h-28 p-2 text-center flex flex-col items-center justify-center cursor-pointer hover:shadow-md"
          >
            <div className="font-semibold text-sm">{cart.name}</div>
            <div className="text-xs text-gray-500">{cart.description}</div>
          </Card>
        ))}
      </div>
    </div>
  )
}
