"use client";

import { useEffect, useState, useRef } from "react";
import {
  Upload,
  Download,
  Loader2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import useRequests from "@/app/utils/UseRequests";
import Cookies from "js-cookie";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/sidbar";

type Stage = "idle" | "parsing" | "uploading" | "finalizing";

const PAGE_SIZE = 500;

export default function BulkUploadMembersPage() {
  const { httpAuthPostAsync } = useRequests();
  const assemblyId = Cookies.get("orgId");

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [stage, setStage] = useState<Stage>("idle");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* ================= PROGRESS ANIMATION ================= */
  useEffect(() => {
    if (!uploading) return;

    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 8;
      if (current >= 90) {
        current = 90;
        clearInterval(interval);
      }
      setProgress(Math.floor(current));
    }, 250);

    return () => clearInterval(interval);
  }, [uploading]);

  /* ================= FILE HANDLER ================= */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setStage("parsing");
    setPreviewData([]);
    setCurrentPage(1);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        if (!data) return;

        const workbook = XLSX.read(data, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        setPreviewData(rows as any[]);
        setStage("idle");
      } catch(error) {
        console.log(error)
        toast.error("Failed to parse Excel file");
        setStage("idle");
      }
    };

    reader.readAsBinaryString(file);
  };

  /* ================= UPLOAD ================= */
  const handleUpload = async () => {
    if (!uploadedFile) return;

    setUploading(true);
    setStage("uploading");
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      if (assemblyId) formData.append("assemblyId", assemblyId);

      await httpAuthPostAsync("person/bulk-upload", formData);

      setStage("finalizing");
      setProgress(100);

      setTimeout(() => {
        toast.success("Bulk upload completed successfully");
        clearFile();
        setUploading(false);
        setStage("idle");
        setProgress(0);
      }, 600);
    } catch (err: any) {
        console.log(err)
      toast.error(err?.message ?? "Upload failed");
      setUploading(false);
      setStage("idle");
    }
  };

  /* ================= TEMPLATE ================= */
  const downloadTemplate = () => {
    window.location.href = "/templates/pr-template.xlsx";
  };

  /* ================= CLEAR FILE ================= */
  const clearFile = () => {
    setUploadedFile(null);
    setPreviewData([]);
    setStage("idle");
    setProgress(0);
    setCurrentPage(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const stageLabel = {
    idle: "Idle",
    parsing: "Parsing file",
    uploading: "Uploading data",
    finalizing: "Finalizing",
  }[stage];

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(previewData.length / PAGE_SIZE);
  const currentRows = previewData.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
     <div className="min-h-screen flex bg-gray-100">
          <Sidebar />
      {/* ===== BASE SCROLLABLE CONTAINER ===== */}
      <div className="max-w-6xl mx-auto p-6 flex flex-col h-[calc(100vh-2rem)]">
        {/* ===== HEADER ===== */}
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h1 className="text-3xl font-bold text-[#141b34]">
            Bulk Upload Members
          </h1>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2 border ml-3 border-[#4cb944] text-[#4cb944] rounded-lg hover:bg-[#f0f9ff]"
          >
            <Download className="w-4 h-4" />
            Download Template
          </button>
        </div>

        {/* ===== UPLOAD CARD ===== */}
        <div className="bg-white rounded-xl border p-8 text-center relative shrink-0 mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xls,.xlsx"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={uploading}
          />
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-[#f0f9ff] rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-[#4cb944]" />
            </div>
            <p className="text-lg font-semibold text-[#4cb944]">
              Click to upload Excel file
            </p>
            <p className="text-sm text-gray-500">Supported formats: .xls, .xlsx</p>
            {uploadedFile && (
              <button
                onClick={clearFile}
                className="flex items-center gap-2 mt-2 px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
                disabled={uploading}
              >
                <Trash2 className="w-4 h-4" />
                Change File
              </button>
            )}
          </div>
        </div>

        {/* ===== SUMMARY & ACTIONS ===== */}
        <div className="flex justify-between items-center mb-2 flex-shrink-0">
          <div className="text-sm">
            Total Rows: <strong>{previewData.length}</strong> | Page {currentPage} of{" "}
            {totalPages || 1}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleUpload}
              disabled={uploading || previewData.length === 0}
              className="px-8 py-3 bg-[#4cb944] text-white rounded-lg font-semibold disabled:bg-gray-400"
            >
              Upload Data
            </button>
            {uploadedFile && (
              <button
                onClick={clearFile}
                disabled={uploading}
                className="px-4 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* ===== PROGRESS ===== */}
        <AnimatePresence>
          {uploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3 mb-2 flex-shrink-0"
            >
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                {stageLabel}
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="bg-[#4cb944] h-3 rounded-full"
                  animate={{ width: `${progress}%` }}
                />
              </div>

              <p className="text-xs text-gray-500">{progress}% completed</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== PREVIEW TABLE (SCROLLABLE) ===== */}
        <div className="flex-1 overflow-auto border rounded-xl">
          {currentRows.length > 0 && (
            <table className="min-w-full text-sm">
              <thead className="bg-[#f0f9ff] sticky top-0 z-10">
                <tr>
                  {Object.keys(currentRows[0]).map((key) => (
                    <th key={key} className="px-4 py-3 border-b text-left">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentRows.map((row, idx) => (
                  <tr key={idx} className="border-b">
                    {Object.keys(row).map((key) => (
                      <td key={key} className="px-4 py-2">
                        {row[key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ===== PAGINATION CONTROLS ===== */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-3">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50 flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
