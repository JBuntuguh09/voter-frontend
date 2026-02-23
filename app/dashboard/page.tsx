"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/layout/sidbar"
import useRequests from "../utils/UseRequests"
import { useEffect, useMemo, useState } from "react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

type ElectionState = "NOT_STARTED" | "OPEN" | "CLOSED"

export default function DashboardPage() {
  const router = useRouter()
  const { httpAuthGetAsync } = useRequests()

  const [loading, setLoading] = useState(true)
  const [voted, setVoted] = useState(0)

  const username = Cookies.get("username") || ""

  const startDate = Cookies.get("startDate") || ""
  const startTime = Cookies.get("startTime") || "00:00"
  const endDate = Cookies.get("endDate") || ""
  const endTime = Cookies.get("endTime") || "23:59"

  const [now, setNow] = useState(new Date())

  /* ================= CLOCK ================= */
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  /* ================= FETCH VOTES ================= */
  useEffect(() => {
    let mounted = true

    const fetchVotes = async () => {
      try {
        
        setLoading(true)

        const res = await httpAuthGetAsync("voted")
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
  }, [])

  /* ================= PARSE DATES ================= */

  const start = useMemo(
    () => new Date(`${startDate}`),
    [startDate, startTime]
  )

  const end = useMemo(
    () => new Date(`${endDate}`),
    [endDate, endTime]
  )

  /* ================= ELECTION STATUS ================= */

  const electionState: ElectionState = useMemo(() => {
    
    // If start or end date is not provided, election has not started
    if (!startDate || !endDate) return "NOT_STARTED"
    // If current time is before the start, not started
    if (now < start) return "NOT_STARTED"
    // If current time is after the end, closed
    if (now > end) return "CLOSED"
    return "OPEN"
  }, [now, start, end, startDate, endDate])

  /* ================= COUNTDOWN ================= */

  const targetTime =
    electionState === "NOT_STARTED" ? start :
    electionState === "OPEN" ? end :
    null

  const countdown = useMemo(() => {
    console.log("targetTime", targetTime)
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

  /* ================= UI ================= */

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />

      
      {/* MAIN CONTENT */}
      <main className="flex-1 p-10 space-y-8">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">
             IMMILAC Aflao Election 2026
            </h2>
            <p className="text-gray-700">
              Welcome back, {username}
            </p>
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

        {/* STATS CARDS */}
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
              <p className="text-sm text-gray-500">
                Your Polling Station
              </p>
              <h3 className="text-xl font-bold">
                IMMILAC Aflao
              </h3>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-md">
            <CardContent className="p-6">
              <p className="text-sm text-gray-500">
                Voting Status
              </p>
              <h3 className="text-xl font-bold text-green-600">
               {voted>0 ? voted +"/10" :"Not Yet Voted"}
              </h3>
            </CardContent>
          </Card>

        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">

          {/* VOTE CARD */}
          <Card className="rounded-2xl shadow-md">
            <CardContent className="p-8 space-y-6">
              <h3 className="text-xl font-semibold">
                Cast Your Vote
              </h3>

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

          {/* RESULTS PREVIEW */}
          <Card className="rounded-2xl shadow-md">
            <CardContent className="p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">
                  Live Results
                </h3>
                <Badge variant="outline">
                  Partial
                </Badge>
              </div>

              <p className="text-gray-600">
                View current national vote distribution.
              </p>

              <Button   disabled={!canView}
                onClick={() => canView && router.push("/dashboard/results")}
                className={`w-full h-12 text-lg ${
                  canView
                    ? "bg-blue-700 hover:bg-blue-800"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {canVote ? "View Detailed Results" : "Results unavailable"}
                
              </Button>
            </CardContent>
          </Card>

        </div>

      </main>
    </div>
  )
}
