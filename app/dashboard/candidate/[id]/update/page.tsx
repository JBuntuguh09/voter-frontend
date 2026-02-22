"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useParams } from "next/navigation";
import useRequests from "@/app/utils/UseRequests";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { CandidateFormData } from "@/app/utils/Interface";
import { Label } from "radix-ui";
import { Sidebar } from "@/components/layout/sidbar";


const items = [
  {
    title: "VICE PRESIDENT",
    href: "/VICE-PRESIDENT",
  },
  {
    title: "GENERAL SECRETARY",
    href: "/GENERAL-SECRETARY",
  },
  {
    title: "ASSISTANT SECRETARY",
    href: "/ASSISTANT-SECRETARY",
  },
  {
    title: "FINANCIAL SECRETARY",
    href: "/FINANCIAL-SECRETARY",
  },
  {
    title: "ORGANIZING SECRETARY",
    href: "/ORGANIZING-SECRETARY",
  },
  {
    title: "ASSISTANT ORGANIZING SEC",
    href: "/ASSISTANT-ORGANIZING-SEC",
  },
  {
    title: "TREASURER",
  },
  {
    title: "CO-OPTED MEMBERS",
    href: "/CO-OPTED-MEMBERS",
  },
  {
    title: "CHAPLAIN/MUSLIM FACTOR",
    href: "/CHAPLAIN-MUSLIM-FACTOR",
  },
  {
    title: "PROTOCOL",
    href: "/PROTOCOL",
  },
  {
    title: "PORTRESS",
    href: "/PORTRESS",
  },
];

export default function UpdateCandidate() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const { httpAuthGetAsync, httpAuthPostAsync, httpAuthPatchAsync } = useRequests();
  const [error, setError] = useState<string | null>(null);
  const orgId = Cookies.get("orgId") || "";
  const [form, setForm] = useState<CandidateFormData>({
    id: 0,
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    position: "",
    imageBase64: "",
    image: {
      id: 0,
      url: "",
      base64: "",
    },
    userId: 0,
  });

  const fetchCandidate = async () => {
    try {
      const res = await httpAuthGetAsync(`/candidates/${id}`);
      // const data = await res.json();
      console.log("Fetched candidate:", res);
      setForm(res);
      setForm((prev) => ({
        ...prev,
        imageBase64: res.image?.base64 || "",
      }));

      setLoading(false);
    } catch (error) {
      console.error("Error fetching candidate:", error);
    }
  };

  useEffect(() => {
    // TODO: Fetch candidate by id

    fetchCandidate();
  }, [id]);

  const updateCan = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.firstName ){
      toast.error("First name is required.");
      return;
    }
      if (
       !form.lastName ){
      toast.error("Last name is required.");
      return;
    }
    // if (!form.email) {
    //   toast.error("Email is required.");
    //   return;
    // }
    if (!form.position) {
      toast.error("Position is required.");
      return;
    }
    try {
      const body = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        position: form.position,
        userId: form.userId,
        organizationId: Number(orgId),
        base64Image: form.imageBase64,
      };

      const res = await httpAuthPatchAsync(`/candidates/${id}`, body);
      console.log("Updated candidate:", res);
      toast.success("Candidate updated successfully.");
    } catch (error: any) {
      console.error("Error updating candidate:", error.response.data.message || error.message);
      toast.error("Failed to update candidate. Please try again.");
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar/>
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded-lg mt-10 mb-10">
      <h1 className="text-2xl font-bold mb-6">Update Candidate</h1>

      <form onSubmit={updateCan} className="space-y-4">
        <div className="flex flex-col items-center">
          <label className="block mb-1 font-medium">Profile Image</label>
          {form.imageBase64 ? (
          <img
            src={form.imageBase64}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-full border"
          />
        ): (
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
           
            <span>No Image</span>
          </div>
        )}
        <input type="file" accept="image/*" onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            setForm({ ...form, imageBase64: base64 });
          };
          reader.readAsDataURL(file);
        }} />
        </div>

        <label className="block mb-1 font-medium" htmlFor="firstName">First Name</label>
        <input
          type="text"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <label className="block mb-1 font-medium" htmlFor="lastName">Last Name</label>
        <input
          type="text"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

          <label className="block mb-1 font-medium" htmlFor="email">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

          <label className="block mb-1 font-medium" htmlFor="phoneNumber">Phone Number</label>
        <input
          type="tel"
          name="phoneNumber"
          value={form.phoneNumber}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

          <label className="block mb-1 font-medium" htmlFor="position">Position</label>
        <select
          name="position"
          value={form.position}
          onChange={handleChange}
          className="w-full border p-2 rounded appearance-none"
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

        <button
         
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded"
        >
          Update Candidate
        </button>
      </form>
    </div>
    </div>
  );
}
