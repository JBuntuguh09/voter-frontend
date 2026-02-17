"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import useRequests from "../utils/UseRequests"
import Cookies from "js-cookie"
import { AuthData, AuthResponse } from "../utils/Interface"
import { clearPermissionCache } from "../utils/permissions"
import toast from "react-hot-toast"
import Image from "next/image"
// import { error } from "console"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { httpAuthPostAsync, httpPostAsync} = useRequests()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
       setLoading(true) 
       const res: AuthResponse = await httpPostAsync("/auth/login", {
            username: email,
            password: password,
        });
       // setData(res)

            // Safely read user and person to avoid null access errors
            const user = res.data?.user;
            const person = user?.person ?? null;
            restoreSession(res.data)
    } catch (error) {
        setTimeout(() => {
      setLoading(false)
    
    }, 2000)
    }

    // TODO: Call your API here

    
  }

  const restoreSession=(res: AuthData | undefined)=>{
    const user = res?.user;
    const person = user?.person ?? null;
    Cookies.set("userId", user?.id?.toString() ?? "")

    if (person) {
      Cookies.set("personId", person.id.toString())
      Cookies.set("username", `${person.firstName} ${person.lastName}`)
      Cookies.set("fname", `${person.firstName}`)
      Cookies.set("lname", `${person.lastName}`)
      const org = person.organization
      Cookies.set("orgId", org?.id ? `${org.id}` : "")
      Cookies.set("orgName", org?.name ?? "")
      Cookies.set("role", user?.role.name ?? "")
      Cookies.set("startDate", user?.person?.organization?.electionStartDate ?? "")
      Cookies.set("startTime", user?.person?.organization?.electionStartTime ?? "")
      Cookies.set("endDate", user?.person?.organization?.electionEndDate ?? "")
      Cookies.set("endTime", user?.person?.organization?.electionEndTime ?? "")
    } else {
      // Set empty defaults if person is missing
      Cookies.set("personId", "")
      Cookies.set("username", "")
      Cookies.set("fname", "")
      Cookies.set("lname", "")
      Cookies.set("orgId", "")
      Cookies.set("orgName", "")
      Cookies.set("role", "")
    }

    Cookies.set("token", res?.access_token ?? "", {
      // httpOnly: true,
      // secure: true,
      sameSite: "strict",
    })
// ---- Extract permissions ----
    
localStorage.removeItem("permissions")



// const permissions =
//   (user?.role?.permission ?? [])
//     .filter((p) => p?.status === "Active")
//     .map((p) => ({
//       path: p.componentPath?.trim() ?? "",
//       method: p.crudType?.toUpperCase() ?? "",
//       name: p.name ?? "",
//     }))


// localStorage.setItem("permissions", JSON.stringify(permissions))
 clearPermissionCache()
toast.success("Successfully logged in")
setLoading(false)
router.push("/dashboard")

  }

  return (
    <div className="flex">
      <div className="flex-1 bg-amber-700 relative min-h-screen">
        <Image src={'/images/pic_1.png'} alt="pic_1" fill className="object-cover" />
      </div>
      <main className=" bg-green-800 flex-1 min-h-screen flex items-center justify-center  p-4">
        <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 space-y-6">
          <h1 className="text-2xl font-bold text-center">Login</h1>

          {/* {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )} */}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-black text-white rounded-lg p-3"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
