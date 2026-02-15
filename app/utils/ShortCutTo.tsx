export const  convertDateForApp=(vDate: string| undefined): string => {
    if(vDate === undefined){
        return ""
    }
    const date = new Date(vDate);

    const day = date.getUTCDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getUTCFullYear();

    const daySuffix = (d: number) => {
        if (d > 3 && d < 21) return 'th'; // covers 4th-20th
        switch (d % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };

    return `${day}${daySuffix(day)} ${month} ${year}`;
};

export const convertTimeForApp = (isoString: string | undefined): string => {
    if(isoString === undefined){
        return ""
    }
    const date = new Date(isoString);

    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes.toString();

    return `${hours}:${minutesStr}${ampm}`;
};

export const checkIfDateGreater=(date: string): Boolean=>{
    const inputDate = new Date(date);
    const now = new Date();

    if (inputDate >= now) {
        return true;
    } else {
        return false
    }
}

export const reverseDate=(date: string, old: string, chg:string): string=>{
    try {
        const nDate = date.split(old)
        const newDate = nDate[2]+chg+nDate[1]+chg+nDate[0]
        return newDate
    } catch (error) {
        return date
    }
}

export function formatDate(dateString?: string): string {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // ✅ Convert "2025-09-23" to "Tuesday, 23 September, 2025"
export function formatAppointmentDate(dateString: string): string {
  if (!dateString || dateString=="") return "";
    try {
    
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  } catch (error) {
    
    return dateString; // Return the original string if parsing fails
  }
}

// ✅ Convert "09:03:00" to "9:03 AM"
export function formatAppointmentTime(timeString: string): string {
    if (!timeString || timeString=="") return "";
  try {

    const [hours, minutes] = timeString.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  } catch (error) {
    
    return timeString; // Return the original string if parsing fails
  }

  
}
export function convertDateForApp2(timeString: string): string{

    const date = new Date(timeString);

    const formatted = date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
        return formatted
  }

  export function getPermitStatus(dateStr: string): "Expired" | "Expiring Soon" | "Active" {
  if (!dateStr) return "Expired"; // handle empty or null date safely

  const expiryDate = new Date(dateStr);
  const currentDate = new Date();

  // Normalize both dates to ignore time portion
  expiryDate.setHours(0, 0, 0, 0);
  currentDate.setHours(0, 0, 0, 0);

  // Calculate difference in days
  const diffInMs = expiryDate.getTime() - currentDate.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  if (diffInDays < 0) {
    return "Expired";
  } else if (diffInDays <= 90) {
    return "Expiring Soon";
  } else {
    return "Active";
  }
}

export function getTotalPages(total: number, limit: number): number {
  try {
    if (limit <= 0) return 1; // avoid divide-by-zero
  return Math.ceil(total / limit);
  } catch (error) {
    return 0
  }
}

// Returns current date in YYYY-MM-DD format for <input type="date">
export function getCurrentDate(): string {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const year = today.getFullYear();

  return `${year}-${month}-${day}`; // YYYY-MM-DD
}

export const addMonthsToCurrentDate = (months: number): string => {
  const date = new Date();

  // Set new month
  date.setMonth(date.getMonth() + months);

  // Format dd/MM/yyyy
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  return `${dd}/${mm}/${yyyy}`;
};

  export const addMonthsToCurrentDateReverse = (months: number): string => {
  const date = new Date();

  // Set new month
  date.setMonth(date.getMonth() + months);

  // Format dd/MM/yyyy
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  return `${yyyy}-${mm}-${dd}`;
};

// small helpers
export const formatCurrency = (v?: number | string) => {
  const num = Number(v || 0)

  return `GHS ${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatPhone(value: string): string {
  if (!value) return value
  if(value === "-") return value
  return value.startsWith("0") ? value : `0${value}`
}



export const formatNumber = (v?: number | string) =>
  typeof v === "string" ? `${Number(v).toLocaleString()}` : `${Number(v || 0).toLocaleString()}`

export const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v))

export function formatDateLong(dateStr: string) {
  if (!dateStr) return ""

  const [year, month, day] = dateStr.split("-").map(Number)

  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
      ? "rd"
      : "th"

  const date = new Date(year, month - 1, day)
  const monthName = date.toLocaleString("en-US", { month: "long" })

  return `${day}${suffix} ${monthName} ${year}`
}

export function getMonthDateRange() {
  const now = new Date();

  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const format = (d: Date) => d.toISOString().split("T")[0];

  return {
    startDate: format(start),
    endDate: format(end),
  };
}

