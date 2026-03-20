"use client"
import { motion, AnimatePresence } from "framer-motion"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidbar"
import { Label } from "@/components/ui/label"
import useRequests from "@/app/utils/UseRequests"
import { useEffect, useMemo, useState } from "react"
import Cookies from "js-cookie"
import { X } from "lucide-react"

import {
  User2,
  ShieldCheck,
  Wallet,
  ClipboardPen,
  Users,
  Landmark,
  UserPlus,
  BookOpenCheck,
  FileCheck,
  Home,
  Handshake,
} from "lucide-react"

type PositionStats = {
  position: string
  votes: number
  totalVoters: number
}

const items = [
  { title: "VICE PRESIDENT", href: "/VICE-PRESIDENT", icon: ShieldCheck },
  { title: "GENERAL SECRETARY", href: "/GENERAL-SECRETARY", icon: ClipboardPen },
  { title: "ASSISTANT SECRETARY", href: "/ASSISTANT-SECRETARY", icon: User2 },
  { title: "FINANCIAL SECRETARY", href: "/FINANCIAL-SECRETARY", icon: Wallet },
  { title: "ORGANIZING SECRETARY", href: "/ORGANIZING-SECRETARY", icon: Users },
  { title: "ASSISTANT ORGANIZING SEC", href: "/ASSISTANT-ORGANIZING-SEC", icon: UserPlus },
  { title: "TREASURER", href: "/TREASURER", icon: Landmark },
  { title: "CO-OPTED MEMBERS", href: "/CO-OPTED-MEMBERS", icon: Handshake },
  { title: "CHAPLAIN/MUSLIM FACTOR", href: "/CHAPLAIN-MUSLIM-FACTOR", icon: BookOpenCheck },
  { title: "PROTOCOL", href: "/PROTOCOL", icon: FileCheck },
  { title: "PORTRESS", href: "/PORTRESS", icon: Home },
]

export default function ResultsCards() {
  const router = useRouter()
  const { httpAuthGetAsync } = useRequests()
  const population = Number(Cookies.get("population") || "0")

  const [loading, setLoading] = useState(true)
  const [voterStats, setVoterStats] = useState<PositionStats[]>([])
  const [showPopup, setShowPopup] = useState(false)
  const [totalVoters, setTotalVoters] = useState(0)

  const [downloading, setDownloading] = useState(false);

const downloadPdf = async () => {
  try {
    setDownloading(true);

    const orgId = Cookies.get("orgId");

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/votes/ranking/pdf/${orgId}`,
      {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      }
    );

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "election-results.pdf";
    a.click();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
  } finally {
    setDownloading(false);
  }
};
  useEffect(() => {
    let mounted = true

    const fetchVotes = async () => {
      try {
        setLoading(true)
        const res = await httpAuthGetAsync("voted/stats/" + Cookies.get("orgId"))
        const apiData = res?.data?.byPosition || []
        console.log("res", res)

        if (!mounted) return

        const totalVotersCount = res?.data?.totalUniqueVoters || 0

        // Map API data to items order
        const stats = items.map((item) => {
          const stat = apiData.find((d: any) => d.position === item.href.replace("/", ""))
          return {
            position: item.title,
            votes: stat ? Number(stat.totalVoters) : 0,
            totalVoters: population,
          }
        })

        setVoterStats(stats)
        setTotalVoters(totalVotersCount)
      } catch (err) {
        console.error(err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchVotes()
    return () => {
      mounted = false
    }
  }, [])

  const percentage = useMemo(() => {
    if (!population) return 0
    return Math.round((totalVoters / population) * 100)
  }, [totalVoters, population])

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-10 space-y-8">

        {/* HEADER */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="inline-block px-6 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-purple-600 shadow-lg">
            <Label className="text-3xl font-extrabold text-white">Election Results</Label>
          </div>

          <p className="text-gray-600 mt-3">Click a card to see detailed breakdown.</p>

          <div className="flex items-center gap-6 mt-4">
            <Badge className="bg-indigo-100 text-indigo-700 px-4 py-2">
              Total Voters: {totalVoters} / {population} ({percentage}%)
            </Badge>

            <Badge
              className="bg-green-100 text-green-700 px-4 py-2 cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setShowPopup(true)}
            >
              View Breakdown
            </Badge>
            <Badge
  className="bg-purple-100 text-purple-700 px-4 py-2 cursor-pointer"
  onClick={downloadPdf}
>
  {downloading ? "Generating PDF..." : "Download PDF"}
</Badge>
          </div>
        </motion.div>

        {/* Voter Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
          {items.map((item, idx) => {
            const stat = voterStats.find((v) => v.position === item.title)
            const votes = stat?.votes || 0
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card
                  className="rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer"
                  onClick={() => router.push(`/dashboard/results/${item.href}`)}
                >
                  <CardHeader className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-indigo-100">
                        <Icon className="h-6 w-6 text-indigo-700" />
                      </div>
                      <CardTitle>{item.title}</CardTitle>
                    </div>
                    <Badge className="bg-indigo-100 text-indigo-700">{votes} votes</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mt-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round((votes / population) * 100)}%` }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Percentage: {Math.round((votes / population) * 100)}%
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* BREAKDOWN POPUP */}
        <AnimatePresence>
          {showPopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="bg-white rounded-2xl p-6 w-11/12 max-w-2xl shadow-2xl relative"
              >
                <button
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                  onClick={() => setShowPopup(false)}
                >
                  <X />
                </button>

                <h3 className="text-2xl font-bold mb-4">Voter Breakdown by Position</h3>
                <div className="space-y-3">
                  {items.map((item) => {
                    const stat = voterStats.find((v) => v.position === item.title)
                   
                    const votes = stat?.votes || 0
                    return (
                      <div
                        key={item.title}
                        className="flex justify-between bg-gray-100 rounded-xl px-4 py-2"
                      >
                        <span>{item.title}</span>
                        <span>{votes} votes ({Math.round((votes / population) * 100)}%)</span>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  )
}