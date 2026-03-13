"use client";

import { Sidebar } from "@/components/layout/sidbar";
import { useState, ChangeEvent, FormEvent } from "react";

interface CandidateFormData {
  name: string;
  email: string;
  phone: string;
  position: string;
  imageBase64: string;
}
export const items = [
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

export default function CreateCandidate() {
  const [form, setForm] = useState<CandidateFormData>({
    name: "",
    email: "",
    phone: "",
    position: "",
    imageBase64: "",
  });

  const [preview, setPreview] = useState<string>("");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setForm({ ...form, imageBase64: base64 });
      setPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    console.log("Submitting:", form);

    // TODO: Send to API
    // await fetch('/api/candidates', { method: 'POST', body: JSON.stringify(form) })
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />
      <div className="max-w-xl mx-auto p-6 bg-white shadow rounded-lg mt-10">
        <h1 className="text-2xl font-bold mb-6">Create Candidate</h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Image Upload */}
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

        {/* Name */}
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block mb-1 font-medium">Phone</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Position */}
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
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Create Candidate
        </button>
      </form>
    </div>
    </div>
  );
}