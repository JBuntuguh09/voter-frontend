"use client"

import { motion } from "framer-motion"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  User2,
  AreaChart,
  TableProperties,
  Map,
  Tags,
  FileCheck,
  Home,
  LucideHome,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidbar"
import { Label } from "@/components/ui/label"
import useRequests from "@/app/utils/UseRequests"
import { useEffect, useMemo, useState } from "react"

const items = [
  { title: "VICE PRESIDENT", href: "/VICE-PRESIDENT", icon: User2 },
  { title: "GENERAL SECRETARY", href: "/GENERAL-SECRETARY", icon: CheckCircle },
  { title: "FINANCIAL SECRETARY", href: "/FINANCIAL-SECRETARY", icon: LucideHome },
  { title: "ASSISTANT FINANCIAL SECRETARY", href: "/ASSISTANT-FINANCIAL-SECRETARY", icon: AreaChart },
  { title: "ORGANIZING SECRETARY", href: "/ORGANIZING-SECRETARY", icon: TableProperties },
  { title: "TREASURER", href: "/TREASURER", icon: Map },
  { title: "CO-OPTED MEMBERS", href: "/CO-OPTED-MEMBERS", icon: Tags },
  { title: "CHAPLAIN/MUSLIM FACTOR", href: "/CHAPLAIN-MUSLIM-FACTOR", icon: Tags },
  { title: "PROTOCOL", href: "/PROTOCOL", icon: FileCheck },
  { title: "PORTRESS", href: "/PORTRESS", icon: Home },
]

export default function ManagementCards() {
  const router = useRouter()
  const { httpAuthGetAsync } = useRequests()

  const electionOpen = true

  const [loading, setLoading] = useState(true)
  const [votedPositions, setVotedPositions] = useState<Set<string>>(new Set())

  /* ================= FETCH VOTES ================= */
  useEffect(() => {
    let mounted = true

    const fetchVotes = async () => {
      try {
        setLoading(true)

        const res = await httpAuthGetAsync("voted")
        const data = res?.data?.data || []

        console.log("data", data)
        const positions = new Set<string>()

        data.forEach((entry: any) => {
          const pos = entry?.position ?? entry?.title
          if (pos) positions.add(pos)
        })

        console.log(positions)
        if (mounted) setVotedPositions(positions)
      } catch (error) {
        console.error(error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchVotes()

    return () => {
      mounted = false
    }
  }, [])

  /* ================= MEMO VALUES ================= */

  const total = items.length

  const votedCount = useMemo(
    () =>
      items.filter((i) => votedPositions.has(i.href.replace("/", ""))).length,
    [votedPositions]
  )

  const progress = useMemo(
    () => (votedCount / total) * 100,
    [votedCount, total]
  )

  /* ================= LOADING UI ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex bg-slate-50">
        <Sidebar />
        <main className="flex-1 p-10 space-y-6">
          <Label className="text-3xl font-bold">BALLOT</Label>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="rounded-2xl p-6 animate-pulse">
                <div className="h-6 w-2/3 bg-gray-200 rounded mb-3" />
                <div className="h-4 w-1/2 bg-gray-200 rounded" />
              </Card>
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Sidebar />

      <main className="flex-1 p-10 space-y-8">

        {/* HEADER */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="inline-block px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg">
            <Label className="text-3xl font-extrabold text-white">
              BALLOT
            </Label>
          </div>

          <p className="text-gray-600 mt-3">
            Select and vote for each position below.
          </p>

          <Badge className="bg-green-100 text-green-700 border mt-2">
            Election Open
          </Badge>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Voting Progress</span>
              <span>{votedCount}/{total}</span>
            </div>

            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mt-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-linear-to-r from-indigo-500 to-purple-500"
              />
            </div>
          </div>
        </motion.div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map((item, i) => {
            const Icon = item.icon
            const alreadyVoted = votedPositions.has(item.href.replace("/", ""))
            const disabled = !electionOpen || alreadyVoted

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={!disabled ? { y: -4 } : {}}
              >
                <Card
                  onClick={() =>
                    !disabled &&
                    router.push("/dashboard/ballot/" + item.href)
                  }
                  className={`rounded-2xl transition-all
                    ${disabled
                      ? "bg-gray-100 opacity-70 cursor-not-allowed"
                      : "cursor-pointer hover:shadow-xl hover:border-indigo-300"
                    }`}
                >
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="p-3 rounded-xl bg-indigo-100">
                      <Icon className="h-7 w-7 text-indigo-600" />
                    </div>

                    <div>
                      <CardTitle>{item.title}</CardTitle>
                      {alreadyVoted && (
                        <Badge className="mt-1 bg-blue-100 text-blue-700">
                          Already Voted
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    {alreadyVoted ? (
                      <p className="text-sm text-green-600">
                        Your vote has been recorded.
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600">
                        Click to cast your vote.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
