"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Vote,
  BarChart3,
  User,
  LogOut,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import ConfirmDialog from "../dialogs/ModalSure"
import { useMemo, useState, useEffect } from "react"
import Cookies from "js-cookie"
import { clearPermissionCache } from "@/app/utils/permissions"
import { Label } from "../ui/label"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, check: false },
  { name: "Ballot", href: "/dashboard/ballot", icon: Vote, check: true },
  { name: "Results", href: "/dashboard/results", icon: BarChart3, check: true },
  { name: "Members", href: "/dashboard/membership", icon: User, check: false },
]

function SidebarContent() {
  const pathname = usePathname()
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [now, setNow] = useState<Date | null>(null)

  // Prevent hydration mismatch
  useEffect(() => {
    setNow(new Date())
  }, [])

  const startDate = Cookies.get("startDate")?.split("T")[0] || ""
  const startTime = Cookies.get("startTime") || "00:00"
  const endDate = Cookies.get("endDate")?.split("T")[0] || ""
  const endTime = Cookies.get("endTime") || "23:59"

  const start = useMemo(() => {
    if (!startDate) return null
    return new Date(`${startDate}T${startTime}`)
  }, [startDate, startTime])

  const end = useMemo(() => {
    if (!endDate) return null
    return new Date(`${endDate}T${endTime}`)
  }, [endDate, endTime])

  const isWithinPeriod =
    now && start && end ? now >= start && now <= end : true

    

  return (
    <div className="flex flex-col h-full bg-green-900 text-white p-6 space-y-6 w-64">
      <h1 className="text-2xl font-bold">Voter Portal</h1>

      <div className="flex w-full justify-center items-center mb-6">
        <Image
          src="/images/im_logo.jpeg"
          alt="logo-side"
          width={100}
          height={100}
        />
      </div>

      <nav className="space-y-3 text-sm">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href

          // If item requires time check and not within period, skip it
          if (item.check && !isWithinPeriod) return <Label key={item.name} className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 cursor-not-allowed">
            <Icon size={18} />
            {item.name}
          </Label>

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                active
                  ? "bg-green-700 text-white"
                  : "hover:bg-green-800 text-green-200"
              )}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto">
        <button
          onClick={() => setShowConfirm(true)}
          className="flex items-center font-bold gap-3 text-white hover:text-gray-400"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={() => {
          Cookies.remove("token")
          Cookies.remove("permissions")
          localStorage.clear()
          clearPermissionCache()
          router.push("/")
        }}
        message="Are you sure you want to logout?"
      />
    </div>
  )
}

export function Sidebar() {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:block">
        <SidebarContent />
      </aside>

      {/* Mobile */}
      <div className="md:hidden h-10 p-4 text-black absolute">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className="p-0 bg-green-900 border-none w-64 text-white"
          >
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}