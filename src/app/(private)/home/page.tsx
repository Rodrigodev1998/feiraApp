"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Plus, ShoppingCart, LogOut } from "lucide-react"
import { useEffect, useState } from "react"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  Timestamp,
} from "firebase/firestore"
import Image from "next/image"


interface Cart {
  id:string
  name: string
  description: string
}

export default function Home() {
  const [carts, setCarts] = useState<Cart[]>([])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [editingCart, setEditingCart] = useState<Cart | null>(null)
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return
    const uid = user.uid
    async function loadCarts() {
      const q = query(
        collection(db, "users", uid, "carts"),
        orderBy("createdAt", "desc")
      )

      const snapshot = await getDocs(q)

      const cartsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Cart, "id">),
      }))

      setCarts(cartsData)
    }

    loadCarts()
  }, [user])

  async function handleSave() {
    if (!user || !name.trim()) return

    const docRef = await addDoc(
      collection(db, "users", user.uid, "carts"),
      {
        name,
        description,
        createdAt: Timestamp.now(),
      }
    )

    setCarts([
      {
        id: docRef.id,
        name,
        description,
      },
      ...carts,
    ])

    setName("")
    setDescription("")
  }

  async function handleLogout() {
    await signOut(auth);
    router.push("/login");
  }

  async function handleEditCart() {
  if (!user || !editingCart) return
  const uid = user.uid

  await updateDoc(
    doc(db, "users", uid, "carts", editingCart.id),
    {
      name: editingCart.name,
      description: editingCart.description,
    }
  )

  setCarts(prev =>
    prev.map(cart =>
      cart.id === editingCart.id ? editingCart : cart
    )
  )

  setEditingCart(null)
}

  async function handleDeleteCart(cartId: string) {
  if (!user) return
  const uid = user.uid

  const itemsSnap = await getDocs(
    collection(db, "users", uid, "carts", cartId, "items")
  )

  for (const item of itemsSnap.docs) {
    await deleteDoc(item.ref)
  }

  await deleteDoc(doc(db, "users", uid, "carts", cartId))

  setCarts(prev => prev.filter(cart => cart.id !== cartId))
}


  return (
    <div className="min-h-screen p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {user?.photoURL && (
            <Image
              src={user.photoURL}
              alt="Foto do usuário"
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
          <span className="text-sm font-medium">
            {user?.displayName}
          </span>
        </div>

        <Button onClick={handleLogout} variant="ghost" size="icon">
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

        {carts.map((cart) => (
          <Card
              key={cart.id}
              onClick={() => router.push(`/cart-items/${cart.id}`)}
              className="
                relative w-40 h-40 p-4
                flex flex-col justify-between
                rounded-xl border border-gray-200 bg-white
                cursor-pointer
                transition-all duration-200
                hover:shadow-md hover:-translate-y-0.5
              "
            >

              <div className="flex justify-between items-start">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingCart(cart)
                  }}
                  className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                  title="Editar carrinho"
                >
                  ✏️
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteCart(cart.id)
                  }}
                  className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                  title="Excluir carrinho"
                >
                  🗑️
                </button>
              </div>

              <div className="flex flex-col items-center justify-center flex-1 text-center px-2">
                <span className="text-sm font-semibold text-gray-800 truncate w-full">
                  {cart.name}
                </span>

                {cart.description && (
                  <span className="mt-1 text-xs text-gray-500 line-clamp-2">
                    {cart.description}
                  </span>
                )}
              </div>

              <div className="text-xs text-gray-500 text-center font-medium">
                Abrir carrinho →
              </div>
            </Card>

        ))}
      </div>

      <Dialog open={!!editingCart} onOpenChange={() => setEditingCart(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Carrinho</DialogTitle>
            </DialogHeader>

            <Input
              value={editingCart?.name ?? ""}
              onChange={(e) =>
                setEditingCart(prev => prev && { ...prev, name: e.target.value })
              }
            />
            <Input
              value={editingCart?.description ?? ""}
              onChange={(e) =>
                setEditingCart(prev => prev && { ...prev, description: e.target.value })
              }
            />

            <Button onClick={handleEditCart}>Salvar</Button>
          </DialogContent>
        </Dialog>
        <Dialog open={!!editingCart} onOpenChange={() => setEditingCart(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Carrinho</DialogTitle>
            </DialogHeader>

            <Input
              value={editingCart?.name ?? ""}
              onChange={(e) =>
                setEditingCart(prev => prev && { ...prev, name: e.target.value })
              }
            />
            <Input
              value={editingCart?.description ?? ""}
              onChange={(e) =>
                setEditingCart(prev => prev && { ...prev, description: e.target.value })
              }
            />

            <Button onClick={handleEditCart}>Salvar</Button>
          </DialogContent>
        </Dialog>

    </div>
  )
}
