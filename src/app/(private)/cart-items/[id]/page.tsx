"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Trash2 } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"

interface Item {
  id: string
  name: string
  quantity?: number
  price?: number
  added: boolean
}

export default function CarrinhoPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()

  const [items, setItems] = useState<Item[]>([])
  const [currentItem, setCurrentItem] = useState<Item | null>(null)
  const [quantity, setQuantity] = useState("")
  const [price, setPrice] = useState("")
  const [confirmed, setConfirmed] = useState(false)
  const [newItemName, setNewItemName] = useState("")

  // 🔹 Buscar itens do carrinho
  useEffect(() => {
    if (!user || !id) return
    const uid = user.uid

    async function loadItems() {
      const snapshot = await getDocs(
        collection(db, "users", uid, "carts", id, "items")
      )

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Item, "id">),
      }))

      setItems(data)
    }

    loadItems()
  }, [user, id])

  const total = items.reduce((acc, item) => {
    if (item.added && item.quantity && item.price) {
      return acc + item.quantity * item.price
    }
    return acc
  }, 0)

  const totalCount = items.length
  const totalAddedCount = items.filter((item) => item.added).length

  // 🔹 Criar novo item
  async function handleAddNewItem() {
    if (!user || !id || !newItemName.trim()) return
    const uid = user.uid

    const docRef = await addDoc(
      collection(db, "users", uid, "carts", id, "items"),
      {
        name: newItemName,
        added: false,
        createdAt: Timestamp.now(),
      }
    )

    setItems([
      ...items,
      {
        id: docRef.id,
        name: newItemName,
        added: false,
      },
    ])

    setNewItemName("")
  }

  // 🔹 Atualizar item
  async function handleSave() {
    if (!user || !currentItem || !id) return
    const uid = user.uid

    const itemRef = doc(
      db,
      "users",
      uid,
      "carts",
      id,
      "items",
      currentItem.id
    )

    await updateDoc(itemRef, {
      added: confirmed,
      quantity: confirmed ? Number(quantity) : null,
      price: confirmed ? Number(price) : null,
    })

    setItems((prev) =>
      prev.map((item) =>
        item.id === currentItem.id
          ? {
              ...item,
              added: confirmed,
              quantity: confirmed ? Number(quantity) : undefined,
              price: confirmed ? Number(price) : undefined,
            }
          : item
      )
    )

    setCurrentItem(null)
    setQuantity("")
    setPrice("")
    setConfirmed(false)
  }

  // 🔹 Deletar item
  async function handleDeleteItem(itemId: string) {
    if (!user || !id) return
    const uid = user.uid

    await deleteDoc(
      doc(db, "users", uid, "carts", id, "items", itemId)
    )

    setItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  return (
    <div className="min-h-screen p-4 bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/home")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Carrinho</h1>
          <p className="text-xs text-gray-500">ID: {id}</p>
        </div>
      </div>

      {/* Totais */}
      <div className="flex justify-between items-center mb-4 px-2">
        <div className="text-sm text-gray-700">
          Total de itens: {totalCount}
          <br />
          Itens no carrinho: {totalAddedCount}
        </div>
        <div className="bg-black text-white px-4 py-2 rounded text-lg font-bold">
          R$ {total.toFixed(2)}
        </div>
      </div>

      {/* Novo item */}
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Nome do item"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
        />
        <Button onClick={handleAddNewItem}>Adicionar</Button>
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
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
                      {item.quantity}x R$ {item.price.toFixed(2)}
                    </span>
                  )}
                </div>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{currentItem?.name}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <Checkbox
                        checked={confirmed}
                        onCheckedChange={() => setConfirmed(true)}
                      />
                      Sim
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox
                        checked={!confirmed}
                        onCheckedChange={() => setConfirmed(false)}
                      />
                      Não
                    </label>
                  </div>

                  <Input
                    placeholder="Qtd"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                  <Input
                    placeholder="Valor unitário"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />

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
              onClick={() => handleDeleteItem(item.id)}
              className="text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
