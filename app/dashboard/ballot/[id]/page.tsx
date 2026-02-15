"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import useRequests from "@/app/utils/UseRequests";
import { User2 } from "lucide-react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/sidbar";
import { Label } from "@/components/ui/label";
import { useParams, useRouter } from "next/navigation";
import ConfirmDialog from "@/components/dialogs/ModalSure";
import toast from "react-hot-toast";

type Candidate = {
  id: number;
  firstName: string;
  lastName: string;
  position?: string;
  email?: string;
  phoneNumber?: string;
  organization?: {
    id: number;
    name: string;
  };
  image?: {
    id: number;
    url?: string;
  };
};

export default function CandidatesPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter()
  const [data, setData] = useState<Candidate[]>([]);
  const [selectedCan, setSelectedCan] = useState<Candidate>();
  const { httpAuthGetAsync, httpAuthPostAsync } = useRequests();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("");
  const [organizationId, setOrganizationId] = useState(
    Cookies.get("orgId") || "",
  );

  // ===== FETCH CANDIDATES =====
  const fetchCandidates = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();

      if (search) params.append("search", search);
      params.append("position", id);
      params.append("organizationId", organizationId);

      const res = await httpAuthGetAsync(`/candidates?${params.toString()}`);

      console.log(res);

      setData(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch candidates", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const vote = async () => {
    try {
      setLoading(true);
      const res = await httpAuthPostAsync("votes", {
        position: selectedCan?.position,
        vote: "Yes",
        candidateId: selectedCan?.id,
        organizationId: selectedCan?.organization?.id,
        createdBy: Cookies.get("username") || "admin",
      });
      

      toast.success(`Successfully voted for ${selectedCan?.firstName} ${selectedCan?.lastName} as ${id}`)
      router.back()
    } catch (error) {
      console.log(error)
      toast.error('Voting failed. Please try again later...')
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-10 space-y-8">
        {/* HEADER */}
        <div className="space-y-3">
          <Label className="text-3xl font-extrabold">{id}</Label>
          <p className="text-gray-600">Vote</p>

          <div className="p-6 max-w-6xl mx-auto">
            {/* ===== TITLE ===== */}
            <h1 className="text-2xl font-bold mb-6">Candidates</h1>

            {/* ===== FILTERS ===== */}
            <div className="grid md:grid-cols-3 gap-3 mb-6">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidate..."
                className="border rounded-xl px-3 py-2"
              />

              {/* <input
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          placeholder="Position"
          className="border rounded-xl px-3 py-2"
        />

        */}
            </div>

            <button
              onClick={fetchCandidates}
              className="px-4 py-2 rounded-xl bg-black text-white mb-6"
            >
              Apply Filters
            </button>

            {/* ===== LOADING ===== */}
            {loading && (
              <div className="text-gray-500">Loading candidates...</div>
            )}

            {/* ===== EMPTY ===== */}
            {!loading && data.length === 0 && (
              <div className="text-gray-500">No candidates found.</div>
            )}

            {/* ===== LIST ===== */}
            <div className="grid md:grid-cols-1 lg:grid-cols-1 gap-4">
              {data.map((candidate, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <div
                    onClick={() => {
                      setSelectedCan(candidate);
                      setShowConfirm(true);
                    }}
                    className={`flex w-full border rounded-2xl p-4 shadow-sm gap-10 transition-all
                  cursor-pointer hover:shadow-xl hover:-translate-y-1 bg-white
                  `}
                  >
                    <User2 size={96} />
                    <div key={candidate.id} className="">
                      <h2 className="font-semibold text-2xl">
                        {candidate.firstName} {candidate.lastName}
                      </h2>

                      <p className="text-xl text-gray-600">
                        Position: {candidate.position || "-"}
                      </p>

                      <p className="text-lg text-gray-500 font-bold ">
                        Tap to vote
                      </p>
                    </div>
                  </div>{" "}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <ConfirmDialog
        message={`Are you sure you want to vote ${selectedCan?.firstName} ${selectedCan?.lastName} for ${id}?`}
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={vote}
      />
    </div>
  );
}
