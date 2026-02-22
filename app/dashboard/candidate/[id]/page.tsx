"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/layout/sidbar";
import useRequests from "@/app/utils/UseRequests";
import { CandidateFormData } from "@/app/utils/Interface";

export default function ViewCandidate() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { httpAuthGetAsync } = useRequests();

  const [candidate, setCandidate] = useState<CandidateFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchCandidate = async () => {
      try {
        setLoading(true);
        const res = await httpAuthGetAsync(`/candidates/${id}`);
        setCandidate(res.data?.data || null);
      } catch (err) {
        console.error("Error fetching candidate:", err);
        setError("Failed to load candidate details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [id, httpAuthGetAsync]);

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />

      <div className="flex-1 max-w-4xl mx-auto p-6 mt-10 mb-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Candidate Details</h1>
            <p className="text-gray-500">
              View detailed information about this candidate
            </p>
          </div>

          <button
            onClick={() => router.back()}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
          >
            ← Back
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white p-10 rounded shadow text-center">
            <p className="text-gray-500">Loading candidate details...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-100 text-red-700 p-6 rounded">
            {error}
          </div>
        )}

        {/* Candidate Card */}
        {!loading && candidate && (
          <div className="bg-white shadow rounded-lg p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              
              {/* Image */}
              {candidate.image?.base64 ? (
                <img
                  src={candidate.image.base64}
                  alt={`${candidate.firstName} ${candidate.lastName}`}
                  className="w-40 h-40 rounded-full object-cover border"
                />
              ) : (
                <div className="w-40 h-40 rounded-full bg-gray-200" />
              )}

              {/* Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold">
                    {candidate.firstName} {candidate.lastName}
                  </h2>
                  <p className="text-gray-600">{candidate.position}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <p>
                    <strong>Email:</strong> {candidate.email || "N/A"}
                  </p>
                  <p>
                    <strong>Phone:</strong> {candidate.phoneNumber || "N/A"}
                  </p>
                  
                  {/* <p>
                    <strong>Gender:</strong> {candidate.gender || "N/A"}
                  </p> */}
                </div>

            

                {/* Action Buttons */}
                <div className="flex gap-4 mt-8">
                  <Link
                    href={`/dashboard/candidate/${candidate.id}/update`}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
                  >
                    Edit Candidate
                  </Link>

                  <button
                    onClick={() => router.back()}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Not Found */}
        {!loading && !candidate && !error && (
          <div className="bg-white p-10 rounded shadow text-center">
            <p className="text-gray-500">Candidate not found.</p>
          </div>
        )}
      </div>
    </div>
  );
}