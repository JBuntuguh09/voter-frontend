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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardContent className="p-8 space-y-6">

          <div className="text-center">
            <h2 className="text-2xl font-bold">Voter Login</h2>
            <p className="text-gray-500 text-sm">
              Enter your voter credentials
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">

            <div className="space-y-2">
              <Label htmlFor="voterId">Voter ID/Email</Label>
              <Input
                id="voterId"
                placeholder="Enter your email/voter id"
                required
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pin"> Password</Label>
              <Input
                id="pin"
                type="password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                placeholder="Enter your Password"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-green-700 hover:bg-green-800"
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Login Securely"}
            </Button>

          </form>

          <div className="text-center text-sm text-gray-500">
            Need help? Contact Electoral Commission
          </div>

        </CardContent>
      </Card>

    </div>
  )
}
