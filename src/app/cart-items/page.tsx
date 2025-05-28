"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Trash2 } from "lucide-react"

interface Item {
  name: string
  quantity?: number
  price?: number
  added: boolean
}

export default function CarrinhoPage() {
  const [items, setItems] = useState<Item[]>([])

  const [currentItem, setCurrentItem] = useState<Item | null>(null)
  const [quantity, setQuantity] = useState("")
  const [price, setPrice] = useState("")
  const [confirmed, setConfirmed] = useState(false)
  const [newItemName, setNewItemName] = useState("")

  const total = items.reduce((acc, item) => {
    if (item.added && item.quantity && item.price) {
      return acc + item.quantity * item.price
    }
    return acc
  }, 0)

   const totalCount = items.length
   const totalAddedCount = items.filter((item) => item.added).length

  function handleSave() {
    if (!currentItem) return

    const updated = items.map((item) => {
      if (item.name === currentItem.name) {
        return {
          ...item,
          quantity: confirmed ? Number(quantity) : undefined,
          price: confirmed ? Number(price) : undefined,
          added: confirmed,
        }
      }
      return item
    })
    setItems(updated)
    setCurrentItem(null)
    setQuantity("")
    setPrice("")
    setConfirmed(false)
  }

  function handleAddNewItem() {
    if (newItemName.trim() === "") return
    setItems([...items, { name: newItemName, added: false }])
    setNewItemName("")
  }

  function handleDeleteItem(indexToDelete: number) {
    const updated = items.filter((_, index) => index !== indexToDelete)
    setItems(updated)
  }

  return (
    <div className="min-h-screen p-4 bg-white">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Supermercado</h1>
      </div>

      <div className="flex justify-between items-center mb-4 px-2">
        <div className="text-sm text-gray-700">
          Total de items: {totalCount} <br/> Items no carrinho: {totalAddedCount}
        </div>
        <div className="bg-black text-white px-4 py-2 rounded text-right text-lg font-bold">
          R$ {total.toFixed(2)}
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Nome do item"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
        />
        <Button onClick={handleAddNewItem}>Adicionar</Button>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <div
                  className={`flex justify-between items-center flex-1 px-4 py-2 border rounded cursor-pointer ${
                    item.added ? "bg-green-100" : ""
                  }`}
                  onClick={() => {
                    setCurrentItem(item)
                    setQuantity(item.quantity?.toString() || "")
                    setPrice(item.price?.toString() || "")
                    setConfirmed(item.added)
                  }}
                >
                  <span>{item.name}</span>
                  {item.added && item.quantity && item.price && (
                    <span className="text-sm font-medium">
                      {item.quantity}x R$ {(item.price ?? 0).toFixed(2)}
                    </span>
                  )}
                </div>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{currentItem?.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="text-sm">Já adicionou esse item ao carrinho?</div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <Checkbox checked={confirmed} onCheckedChange={() => setConfirmed(true)} /> Sim
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox checked={!confirmed} onCheckedChange={() => setConfirmed(false)} /> Não
                    </label>
                  </div>
                  <Input placeholder="Qtd" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                  <Input placeholder="Valor unítario" value={price} onChange={(e) => setPrice(e.target.value)} />
                  <DialogTrigger asChild>
                    <Button className="w-full" onClick={handleSave}>
                      Salvar
                    </Button>
                  </DialogTrigger>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteItem(index)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}