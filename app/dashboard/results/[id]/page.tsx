"use client";

import useRequests from "@/app/utils/UseRequests";
import { Sidebar } from "@/components/layout/sidbar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { motion } from "framer-motion"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";

type VoteResult = {
  candidateId: number;
  fullName: string;
  position: string;
  totalVotes: number;
};

const COLORS = [
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
  "#F59E0B",
  "#10B981",
  "#3B82F6",
];

export default function VotesResultPage() {
    const id = useParams<{id: string}>()
  const [data, setData] = useState<VoteResult[]>([]);
  const [loading, setLoading] = useState(true);
  const {httpAuthGetAsync} = useRequests()
  const [organizationId, setOrganizationId] = useState(
    Cookies.get("orgId") || "",
  );
  const population = Number(Cookies.get("population") || "0")

  const fetchResults = async () => {
    try {
      setLoading(true);

      const res = await httpAuthGetAsync(
        `/votes/tally?organizationId=${organizationId}&position=${id.id}`,
      );

      
   
      setData(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const totalVotes = data.reduce((a, b) => a + b.totalVotes, 0);

  if (loading) {
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

          
        </motion.div>
      <div className="min-h-screen p-10 bg-slate-50">
        <h1 className="text-3xl font-bold mb-6">Election Results</h1>
        <div className="grid md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-white shadow animate-pulse"
            />
          ))}
        </div>
      </div>
      </main>
      </div>
    );
  }

  return (
     <div className="min-h-screen flex bg-linear-to-br from-slate-50 via-white to-slate-100">
      <Sidebar />

      <main className="flex-1 p-10 space-y-8">

        {/* HEADER */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="inline-block px-6 py-3 rounded-2xl bg-linear-to-r from-indigo-500 to-purple-600 shadow-lg">
            <Label className="text-3xl font-extrabold text-white">
              Election Results for {id.id.replaceAll("-", " ")}
            </Label>
          </div>

          <p className="text-gray-600 mt-3">
            Live tally of votes per candidate.
          </p>

          <Badge className="bg-green-100 text-green-700 border mt-2">
            Election Open
          </Badge>

          
        </motion.div>
    <div className="min-h-screen p-10 bg-linear-to-br from-slate-50 to-white">
      

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-5 mb-8">
        <StatCard title="Total Votes" value={totalVotes} />
        <StatCard title="Candidates" value={data.length} />
        <StatCard
          title="Top Candidate"
          value={data[0]?.fullName || "-"}
        />
      </div>

      {/* CHARTS */}
      <div className="grid xl:grid-cols-2 gap-6">

        {/* BAR CHART */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Votes by Candidate
          </h2>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
              <XAxis dataKey="fullName" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalVotes" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* PIE CHART */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Vote Share
          </h2>

          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={data}
                dataKey="totalVotes"
                nameKey="fullName"
                outerRadius={120}
                label
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TABLE */}
      <div className="mt-8 bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left p-3">Rank</th>
              <th className="text-left p-3">Candidate</th>
              <th className="text-left p-3">Position</th>
              <th className="text-left p-3">Votes</th>
              <th className="text-left p-3">% of Votes</th>
              <th className="text-left p-3">% of Members</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r, i) => (
              <tr
                key={r.candidateId}
                className="border-t hover:bg-slate-50"
              >
                <td className="p-3 font-semibold">#{i + 1}</td>
                <td className="p-3">{r.fullName}</td>
                <td className="p-3">{r.position}</td>
                <td className="p-3 font-bold">{r.totalVotes}</td>
                <td className="p-3">
                  {totalVotes
                    ? ((r.totalVotes / totalVotes) * 100).toFixed(1)
                    : 0}
                  %
                </td>
                <td className="p-3">
                  {population
                    ? ((r.totalVotes / population) * 100).toFixed(1)
                    : 0}
                  %
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </main>
    </div>
  );
}

/* ================= UI HELPERS ================= */

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold mt-2 text-gray-900">{value}</p>
    </div>
  );
}
