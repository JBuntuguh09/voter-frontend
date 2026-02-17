"use client";

import { useEffect, useState, KeyboardEvent } from "react";
import Cookies from "js-cookie";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronRight, Loader2, Search, Eye, X } from "lucide-react";
import useRequests from "@/app/utils/UseRequests";
import { Person, PropertyRate } from "@/app/utils/Interface";
import { formatCurrency, formatNumber } from "@/app/utils/ShortCutTo";
import dynamic from "next/dynamic";
import { Sidebar } from "@/components/layout/sidbar";



/* ===================== TYPES ===================== */

interface Zone {
  zone: string;
}

interface ApiResponse<T> {
  data: T;
  total?: number;
}

/* ===================== PAGE ===================== */

export default function MembersPage() {
  const organizationId = Cookies.get("orgId");
  const { httpAuthGetAsync } = useRequests();

  const [data, setData] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  /* ===== View Bill Modal ===== */
  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Person | null>(null);

  const [filters, setFilters] = useState({
    zoneName: "",
  });

  const limit = 10;

  /* ===================== FETCH ZONES ===================== */

  

  /* ===================== FETCH PROPERTY RATES ===================== */

  const getPersons = async (page = 1) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status: "Active",
        organizationId: organizationId ?? "",
      });

      if (search) params.append("search", search);

      const res = await httpAuthGetAsync(
        `/person?${params.toString()}`
      );

      setData(res.data?.data ?? []);
      setTotalRecords(res.data?.total ?? 0);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  /* ===================== EFFECTS ===================== */


  useEffect(() => {
    setCurrentPage(1);
    getPersons(1);
  }, [search, filters]);

  /* ===================== SEARCH ===================== */

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearch(searchInput.trim());
    }
  };

  /* ===================== PAGINATION ===================== */

  const totalPages = Math.ceil(totalRecords / limit);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    getPersons(page);
  };

  const Info = ({
  label,
  value,
}: {
  label: string;
  value?: string;
}) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-medium text-gray-900">
      {value || "-"}
    </p>
  </div>
);

const SummaryRow = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="flex justify-between px-4 py-3">
    <span className="text-gray-600">{label}</span>
    <span className="font-semibold text-gray-900">{value}</span>
  </div>
);


  /* ===================== UI ===================== */

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button
              className="lg:hidden p-2"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              ☰
            </button>
            <span>Dashboard</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">IMMILAC AFLAO MEMBERS</span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* FILTERS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Input
                placeholder="Search code, owner..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 text-gray-400" onClick={()=>setSearch(searchInput)} />
                )}
              </div>
            </div>

          </div>

          {/* TABLE */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone 2</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <Loader2 className="animate-spin inline-block mr-2" />
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((record, key) => (
                    <TableRow key={record.id}>
                      <TableCell>{(currentPage - 1) * 20 + key + 1}</TableCell>
                      <TableCell>{record.code}</TableCell>
                      <TableCell>{record.title}</TableCell>
                      <TableCell>{record.firstName} {record.lastName}</TableCell>
                      <TableCell>{record.phoneNumber}</TableCell>
                      <TableCell>{record.email ?? "-"}</TableCell>
                      <TableCell>{record.phoneNumber2 ?? "-"}</TableCell>
                      <TableCell>
                        <Badge>{record.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedBill(record);
                            setShowBillModal(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Member
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="px-3 py-2 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ================= VIEW BILL MODAL ================= */}
{showBillModal && selectedBill && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
   <div className="bg-white max-w-2xl w-full max-h-[90vh] rounded-2xl shadow-xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            View Property
          </h2>
          <p className="text-sm text-gray-500">
            Property Rate Details
          </p>
        </div>
        <button
          onClick={() => setShowBillModal(false)}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 text-sm text-gray-700 overflow-y-auto flex-1">
        
        {/* Property Info */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Member Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Info label="Code" value={selectedBill.code ??"-"} />
            <Info label="Rank" value={selectedBill.title ??"-"} />
            <Info label="Name" value={selectedBill.firstName+ " "+ selectedBill.lastName} />
            <Info label="Phone" value={selectedBill.phoneNumber ?? "-"} />
            <Info label="Phone 2" value={selectedBill.phoneNumber2 ?? "-"} />
            <Info label="Email" value={selectedBill.email ??""} />
          </div>
        </div>

          <div className="mt-4">
            <Badge
              variant={
                selectedBill.status === "Paid"
                  ? "default"
                  : selectedBill.status === "Partial"
                  ? "secondary"
                  : "secondary"
              }
            >
              {selectedBill.status}
            </Badge>
          </div>
          
        </div>
      </div>

      
  </div>
)}

    </div>
  );
}
