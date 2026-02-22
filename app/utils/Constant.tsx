import {
  FileText,
  PlusCircle,
  Layers,
  Calendar,
  Plus,
} from "lucide-react";
//export const URL = "http://api.rev-collect.smartcitygh.com"
//export const URL = "https://api.rev-collect.smartcitygh.com" //prod
//export const URL = "http://api.dev.rev-collect.smartcitygh.com" //dev
 //export const URL = "http://localhost:3000"
 export const URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const primaryColor = "#61dafb"



export const BILLING_COLORS = {
  primary: "text-[#10b981]",
  primaryBg: "bg-[#10b981]",
  primaryHover: "hover:bg-[#059669]",

  paid: "text-green-600",
  unpaid: "text-red-600",

  stats: {
    default: "text-gray-900",
    purple: "text-purple-600",
    blue: "text-blue-600",
    yellow: "text-yellow-600",
  },

  buttonOutline: {
    blue: "border-blue-200 text-blue-700 hover:bg-blue-50",
    green: "border-green-200 text-green-700 hover:bg-green-50",
    purple: "border-purple-200 text-purple-700 hover:bg-purple-50",
  },
};



export const BILLING_ICONS = {
  view: FileText,
  single: PlusCircle,
  bulk: Layers,
  calendar: Calendar,
  create: Plus,
};

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
