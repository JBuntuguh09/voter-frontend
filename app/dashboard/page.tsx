"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/layout/sidbar"
import useRequests from "../utils/UseRequests"
import { useEffect, useMemo, useState } from "react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
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
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

type ElectionState = "NOT_STARTED" | "OPEN" | "CLOSED"

type WinnerItem = {
  candidateId: number
  code: string | null
  firstName: string
  lastName: string
  candidateName: string
  voteCount: number
  status: "Winner" | "Draw",
  imageBase64: string,
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
  { title: "CHAPLAIN MUSLIM FACTOR", href: "/CHAPLAIN-MUSLIM-FACTOR", icon: BookOpenCheck },
  { title: "PROTOCOL", href: "/PROTOCOL", icon: FileCheck },
  { title: "PORTRESS", href: "/PORTRESS", icon: Home },
]

type WinnerGroup = {
  position: string
  resultType: "Winner" | "Draw"
  winners: WinnerItem[]
}
const normalize = (val: string) =>
  val?.replace(/\s+/g, "-").toUpperCase()

export default function DashboardPage() {
  const router = useRouter()
  const { httpAuthGetAsync } = useRequests()
  const userId = Cookies.get("userId") || ""
  const organizationId = Cookies.get("orgId") || ""

  const [loading, setLoading] = useState(true)
  const [voted, setVoted] = useState(0)
  const [winnersLoading, setWinnersLoading] = useState(false)
  const [winners, setWinners] = useState<WinnerGroup[]>([])

  const username = Cookies.get("username") || ""

  const startDate = Cookies.get("startDate")?.split("T")[0] || ""
  const startTime = Cookies.get("startTime") || "00:00"
  const endDate = Cookies.get("endDate")?.split("T")[0] || ""
  const endTime = Cookies.get("endTime") || "23:59"

  const [now, setNow] = useState(new Date())

  const getPopulationTotal = async () => {
    try {
      const params = new URLSearchParams({
        status: "Active",
        organizationId: organizationId ?? "",
      })

      const res = await httpAuthGetAsync(`/person?${params.toString()}`)
      Cookies.set("population", String(res.data?.total ?? "0"))
    } catch {
      Cookies.set("population", "0")
    }
  }

  useEffect(() => {
    getPopulationTotal()
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    let mounted = true

    const fetchVotes = async () => {
      try {
        setLoading(true)

        const res = await httpAuthGetAsync("voted?userId=" + userId)
        const data = res?.data?.data || []

        const positions = new Set<string>()
        data.forEach((e: any) => {
          const pos = e?.position ?? e?.title
          if (pos) positions.add(pos)
        })

        if (mounted) setVoted(positions.size)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchVotes()
    return () => {
      mounted = false
    }
  }, [ userId])

  const start = useMemo(() => {
    if (!startDate) return null
    return new Date(`${startDate}T${startTime}`)
  }, [startDate, startTime])

  const end = useMemo(() => {
    if (!endDate) return null
    return new Date(`${endDate}T${endTime}`)
  }, [endDate, endTime])

  const electionState: ElectionState = useMemo(() => {
    if (!startDate || !endDate) return "NOT_STARTED"
    if (start && now < start) return "NOT_STARTED"
    if (end && now > end) return "CLOSED"
    return "OPEN"
  }, [now, start, end, startDate, endDate])

  const targetTime =
    electionState === "NOT_STARTED"
      ? start
      : electionState === "OPEN"
      ? end
      : null

  const countdown = useMemo(() => {
    if (!targetTime) return null

    const diff = targetTime.getTime() - now.getTime()
    if (diff <= 0) return null

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
    const mins = Math.floor((diff / (1000 * 60)) % 60)
    const secs = Math.floor((diff / 1000) % 60)

    return `${days}d ${hours}h ${mins}m ${secs}s`
  }, [now, targetTime])

  const canVote = electionState === "OPEN"
  const canView = electionState === "OPEN" || electionState === "CLOSED"

  useEffect(() => {
    let mounted = true

    const fetchWinners = async () => {
      if (electionState !== "CLOSED" || !organizationId) return

      try {
        setWinnersLoading(true)
        const res = await httpAuthGetAsync(`/votes/winners/${organizationId}`)
        const data = res?.data || []

        if (mounted) {
          setWinners(data)
        }
        console.log(res)
      } catch {
        if (mounted) {
          setWinners([])
        }
      } finally {
        if (mounted) {
          setWinnersLoading(false)
        }
      }
    }

    fetchWinners()

    return () => {
      mounted = false
    }
  }, [electionState, organizationId])

  const orderedWinners = items.map((item) => {
  return winners.find(
    (w) => normalize(w.position) === normalize(item.title)
  )
})



const downloadWinnersPDF = () => {
  const doc = new jsPDF()

  // TITLE
  doc.setFontSize(18)
  doc.text("Election Winners Report", 14, 20)

  doc.setFontSize(11)
  doc.text(` IMMILAC Aflao`, 14, 28)
  doc.text(`Date: ${new Date().toLocaleString()}`, 14, 34)

  let startY = 40

  orderedWinners.forEach((group, index) => {
    const positionTitle = items[index].title

    // SECTION TITLE
    doc.setFontSize(13)
    doc.text(positionTitle, 14, startY)

    startY += 4

    if (!group) {
      doc.setFontSize(10)
      doc.text("No results available", 14, startY + 6)
      startY += 12
      return
    }

    // TABLE DATA
    const tableData = group.winners.map((winner, i) => [
      winner.status === "Winner" ? "🥇" : "🥈",
      winner.candidateName,
      winner.voteCount,
      winner.status,
    ])

    autoTable(doc, {
      startY: startY + 4,
      head: [["Rank", "Candidate", "Votes", "Status"]],
      body: tableData,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [22, 160, 133], // emerald
      },
    })

    startY = (doc as any).lastAutoTable.finalY + 10

    // DRAW NOTE
    if (group.resultType === "Draw") {
      doc.setFontSize(9)
      doc.text(
        "Draw: Multiple candidates have equal highest votes",
        14,
        startY
      )
      startY += 8
    }

    // PAGE BREAK
    if (startY > 260) {
      doc.addPage()
      startY = 20
    }
  })

  doc.save("election-winners.pdf")
}

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-10 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">IMMILAC Aflao Election 2026</h2>
            <p className="text-gray-500">Welcome back, {username}</p>
          </div>

          {electionState === "NOT_STARTED" && (
            <Badge className="bg-yellow-500 text-white px-4 py-2">
              Election Not Yet Started
            </Badge>
          )}

          {electionState === "OPEN" && (
            <Badge className="bg-green-600 text-white px-4 py-2">
              Election Open
            </Badge>
          )}

          {electionState === "CLOSED" && (
            <Badge className="bg-gray-700 text-white px-4 py-2">
              Election Closed
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {countdown && (
            <Card className="rounded-2xl shadow-md">
              <CardContent className="p-6">
                <p className="text-sm opacity-80">
                  {electionState === "NOT_STARTED"
                    ? "Voting Starts in"
                    : "Voting Ends in"}
                </p>
                <h3 className="text-2xl font-bold mt-2">{countdown}</h3>
              </CardContent>
            </Card>
          )}

          <Card className="rounded-2xl shadow-md">
            <CardContent className="p-6">
              <p className="text-sm text-gray-500">Your Polling Station</p>
              <h3 className="text-xl font-bold">IMMILAC Aflao</h3>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-md">
            <CardContent className="p-6">
              <p className="text-sm text-gray-500">Voting Status</p>
              <h3 className="text-xl font-bold text-green-600">
                {loading ? "Loading..." : voted > 0 ? `${voted}/10` : "Not Yet Voted"}
              </h3>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <Card className="rounded-2xl shadow-md">
            <CardContent className="p-8 space-y-6">
              <h3 className="text-xl font-semibold">Cast Your Vote</h3>

              <p className="text-gray-600">
                Participate securely in the 2026 national election.
              </p>

              <Button
                disabled={!canVote}
                onClick={() => canVote && router.push("/dashboard/ballot")}
                className={`w-full h-12 text-lg ${
                  canVote
                    ? "bg-green-700 hover:bg-green-800"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {canVote ? "Proceed to Ballot" : "Voting Unavailable"}
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-md">
            <CardContent className="p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Live Results</h3>
                <Badge variant="outline">Partial</Badge>
              </div>

              <p className="text-gray-600">
                View current national vote distribution.
              </p>

              <Button
                disabled={!canView}
                onClick={() => canView && router.push("/dashboard/results")}
                className={`w-full h-12 text-lg ${
                  canView
                    ? "bg-blue-700 hover:bg-blue-800"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {canView ? "View Detailed Results" : "Results unavailable"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {electionState === "CLOSED" && (
  <Card className="rounded-3xl shadow-xl border bg-white/80 backdrop-blur-md">
    <CardContent className="p-8 space-y-6">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            🏆 Election Winners
          </h3>
          <p className="text-gray-500 mt-1 text-sm">
            Official final results by position
          </p>
        </div>

       <div className="flex items-center gap-3">
  <Badge className="bg-gradient-to-r from-emerald-600 to-green-500 text-white px-4 py-2 shadow">
    Final Results
  </Badge>

  <Button
    onClick={downloadWinnersPDF}
    className="bg-indigo-600 hover:bg-indigo-700 text-white"
  >
    Download PDF
  </Button>
</div>
      </div>

      {/* CONTENT */}
      {winnersLoading ? (
        <div className="text-gray-500 animate-pulse">
          Loading winners...
        </div>
      ) : winners.length === 0 ? (
        <div className="text-gray-500">
          No winners available.
        </div>
      ) : (
        <div className="space-y-6">
          {orderedWinners.map((group, i) => (
  <div
    key={group?.position || items[i].title}
    className="rounded-2xl border bg-white shadow-sm p-5 transition hover:shadow-lg animate-fade-in"
    style={{ animationDelay: `${i * 0.08}s` }}
  >
    {/* POSITION HEADER */}
    <div className="flex items-center justify-between mb-4">
      <h4 className="font-semibold text-lg text-gray-800">
        {items[i].title}
      </h4>

      {group && (
        <Badge
          className={
            group.resultType === "Winner"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }
        >
          {group.resultType}
        </Badge>
      )}
    </div>

    {/* IF NO DATA */}
    {!group ? (
      <div className="text-gray-400 text-sm italic">
        No results available for this position.
      </div>
    ) : (
      <>
        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs uppercase">
                <th className="text-left py-2">Rank</th>
                <th className="text-left py-2">Candidate</th>
                <th className="text-left py-2">Votes</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>

            <tbody>
              {group.winners.map((winner) => (
                <tr
                  key={winner.candidateId}
                  className={`transition ${
                    winner.status === "Winner"
                      ? "bg-green-50"
                      : "bg-yellow-50"
                  }`}
                >
                  <td className="py-3">
                    {winner.status === "Winner" ? "🥇" : "🥈"}
                  </td>

                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      {winner.imageBase64 ? (
                        <img
                          src={winner.imageBase64}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm">
                          {winner.firstName?.[0]}
                          {winner.lastName?.[0]}
                        </div>
                      )}
                      <span>{winner.candidateName}</span>
                    </div>
                  </td>

                  <td className="py-3 font-semibold">
                    {winner.voteCount}
                  </td>

                  <td>
                    <Badge
                      className={
                        winner.status === "Winner"
                          ? "bg-green-600 text-white"
                          : "bg-yellow-500 text-white"
                      }
                    >
                      {winner.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {group.resultType === "Draw" && (
          <div className="mt-3 text-xs text-yellow-700 bg-yellow-100 px-3 py-2 rounded">
            ⚖️ Draw — candidates have equal highest votes
          </div>
        )}
      </>
    )}
  </div>
))}
        </div>
      )}
    </CardContent>
  </Card>
)}
      </main>
    </div>
  )
}