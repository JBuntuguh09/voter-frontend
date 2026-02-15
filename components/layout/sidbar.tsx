"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Ballot",
    href: "/dashboard/ballot",
    icon: Vote,
  },
  {
    name: "Results",
    href: "/dashboard/results",
    icon: BarChart3,
  },
  {
    name: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
]

function SidebarContent() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-green-900 text-white p-6 space-y-6 w-64">
      <h1 className="text-2xl font-bold">Voter Portal</h1>

      <nav className="space-y-3 text-sm">
        <div className="flex w-full justify-center items-center mb-10">
            <Image src={'/images/im_logo.jpeg'} alt="logo-side" width={100} height={100}/>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href

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
        <button className="flex items-center font-bold gap-3 text-white hover:text-gray-400 cursor-pointer">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  )
}

export function Sidebar() {
  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:block">
        <SidebarContent />
      </aside>

      {/* MOBILE SIDEBAR */}
      <div className="md:hidden h-10 p-4 text-black absolute items-center justify-between">
        <Sheet >
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu />
            </Button>
          </SheetTrigger>

          <SheetContent side="left"  className="p-0 bg-green-900 border-none w-64 text-white">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
