"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/sidbar";
import useRequests from "@/app/utils/UseRequests";
import { CandidateFormData } from "@/app/utils/Interface";
import { items } from "@/app/utils/Constant";



export default function CandidatesList() {
  const [candidates, setCandidates] = useState<CandidateFormData[]>([]);
  const [filtered, setFiltered] = useState<CandidateFormData[]>([]);
  const [positionFilter, setPositionFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const {httpAuthGetAsync} = useRequests()

  useEffect(() => {
    // Replace with real API call
    fetchCandidates().then(() => setLoading(false));


  }, []);

  const fetchCandidates = async () => {
    try {
        const res = await httpAuthGetAsync("/candidates?organizationId=1");
        setCandidates(res.data?.data || []);
        setFiltered(res.data?.data || []);
        console.log("Fetched candidates:", res.data);
    } catch (error) {
        console.error("Error fetching candidates:", error); 
    }
  }

  useEffect(() => {
    if (!positionFilter) {
      setFiltered(candidates);
    } else {
      setFiltered(
        candidates.filter((c) => c.position === positionFilter)
      );
    }
  }, [positionFilter, candidates]);

  return (
    <div className="min-h-screen flex bg-gray-100">
        <Sidebar/>
    <div className="max-w-6xl mx-auto p-6 mt-10 mb-10">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Candidates</h1>
          <p className="text-gray-500">
            Manage and view all election candidates
          </p>
        </div>

        {/* Create New Button */}
        <Link
          href="/dashboard/candidate/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium text-center"
        >
          + Create New Candidate
        </Link>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <label className="block mb-1 font-medium" htmlFor="position">Position</label>
                <select
                  name="position"
                  value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          className="border p-2 rounded w-full md:w-64 appearance-auto"
                >
                  <option value="">Select Position</option>
                  {items.map((item) => (
                    <option
                      key={item.title}
                      value={item.href?.replace("/", "") || item.title}
                    >
                      {item.title}
                    </option>
                  ))}
                </select>
      </div>

      {/* Candidates Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((candidate) => (
            <div
              key={candidate.id}
              className="bg-white shadow rounded-lg p-5 border hover:shadow-lg transition"
            >
              {candidate.image?.base64 ? (
                <img
                  src={candidate.image?.base64}
                  alt={candidate.id.toString()}
                  className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4" />
              )}

              <h2 className="text-lg font-semibold text-center">
                {candidate.firstName} {candidate.lastName}
              </h2>

              <p className="text-sm text-gray-600 text-center mb-3">
                {candidate.position}
              </p>

              <div className="text-sm space-y-1">
                <p><strong>Email:</strong> {candidate.email}</p>
                <p><strong>Phone:</strong> {candidate.phoneNumber}</p>
              </div>

              <Link
                href={`/dashboard/candidate/${candidate.id}/update`}
                className="block mt-4 text-center bg-green-600 hover:bg-green-700 text-white py-2 rounded"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 bg-gray-50 rounded-lg border">
          <p className="text-gray-500 mb-4">
            No candidates found for this position.
          </p>
          <Link
            href="/candidates/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Create First Candidate
          </Link>
        </div>
      )}
    </div>
    </div>
  );
}