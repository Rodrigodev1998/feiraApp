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
