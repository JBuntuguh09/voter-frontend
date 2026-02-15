 import ExcelJS from "exceljs";
import { CollectionReportItem } from "./Interface";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

type ExcelRow = Record<string, string | number | boolean | null>;

interface GenerateExcelOptions {
  title: string;
  headers: string[];
  data: ExcelRow[];
  fileName: string;
}
type CellValue = string | number;

const money = (n: number) => Number(n || 0);
export async function generateExcelDoc({
  title,
  headers,
  data,
  fileName,
}: GenerateExcelOptions) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet1");

  // ---- Title Row ----
  worksheet.mergeCells(1, 1, 1, headers.length);
  const titleCell = worksheet.getCell(1, 1);
  titleCell.value = title;
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };

  worksheet.addRow([]);

  // ---- Header Row ----
  const headerRow = worksheet.addRow(headers);
  headerRow.eachCell((cell:any) => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // ---- Data Rows ----
  data.forEach((row) => {
    const rowValues = headers.map((header) => row[header] ?? "");
    const dataRow = worksheet.addRow(rowValues);

    dataRow.eachCell((cell:any) => {
        cell.alignment = { horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  // ---- Auto Column Width ----
  worksheet.columns.forEach((column:any) => {
    if (!column) return;
    let maxLength = 10;
    column.eachCell?.({ includeEmpty: true }, (cell: any) => {
      const cellLength = cell.value?.toString().length || 0;
      maxLength = Math.max(maxLength, cellLength);
    });
    column.width = maxLength + 2;
  });

  // ---- Create Download ----
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}



export const exportToExcelCR = (
  data: CollectionReportItem[],
  year: string,
  title = "COLLECTION REPORT"
) => {
  if (!data.length) return;

  /* ================= HEADER ================= */

  const rows: CellValue[][] = [
    [`${title} ${year}`],
    [],
    [
      "S/N",
      "Collector",
      "Zone",
      "Bills Generated",
      "",
      "Bills Served",
      "",
      "",
      "Payment Received",
      "",
      "",
      "",
      "Total Payment",
      "Outstanding Amount",
      "",
      "Collection Rate",
      "",
    ],
    [
      "",
      "",
      "",
      "No",
      "Amount",
      "No",
      "Amount",
      "% Served",
      "Cash",
      "Cheque",
      "Mobile Money",
      "",
      "Bills Generated",
      "Bills Served",
      "Bills Generated",
      "Bills Served",
    ],
  ];

  /* ================= DATA ================= */

  data.forEach((r:any, i) => {
    const totalBills = money(r.totalCountBills);
    const servedBills = money(r.deliveredCount);

    const generatedAmount = money(r.totalSumBills);
    const servedAmount = money(r.deliveredBalanceSum);

    const cash = money(r.cashPaid);
    const cheque = money(r.chequePaid);
    const momo = money(r.momoPaid);

    const totalPaid = cash + cheque + momo;

    const outstandingGenerated = generatedAmount - totalPaid;
    const outstandingServed = servedAmount - totalPaid;

    const servedPercent =
      totalBills > 0 ? (servedBills / totalBills) * 100 : 0;

    const generatedRate =
      generatedAmount > 0 ? (totalPaid / generatedAmount) * 100 : 0;

    const servedRate =
      servedAmount > 0 ? (totalPaid / servedAmount) * 100 : 0;

    rows.push([
      i + 1,
      `${r.firstName} ${r.lastName}`,
      r.zone,
      totalBills,
      generatedAmount,
      servedBills,
      servedAmount,
      `${servedPercent.toFixed(2)}%`,
      cash,
      cheque,
      momo,
      totalPaid,
      outstandingGenerated,
      outstandingServed,
      `${generatedRate.toFixed(2)}%`,
      `${servedRate.toFixed(2)}%`,
    ]);
  });

  /* ================= SHEET ================= */

  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  /* ================= MERGES ================= */

  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 15 } }, // title
    { s: { r: 2, c: 3 }, e: { r: 2, c: 4 } },
    { s: { r: 2, c: 5 }, e: { r: 2, c: 7 } },
    { s: { r: 2, c: 8 }, e: { r: 2, c: 11 } },
    { s: { r: 2, c: 12 }, e: { r: 2, c: 13 } },
    { s: { r: 2, c: 14 }, e: { r: 2, c: 15 } },
  ];

  /* ================= COLUMN WIDTHS ================= */

  worksheet["!cols"] = [
    { wch: 5 },
    { wch: 22 },
    { wch: 22 },
    { wch: 10 },
    { wch: 15 },
    { wch: 10 },
    { wch: 15 },
    { wch: 10 },
    { wch: 12 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
    { wch: 18 },
    { wch: 18 },
    { wch: 14 },
    { wch: 14 },
  ];

  /* ================= FREEZE HEADER ================= */

  worksheet["!freeze"] = { xSplit: 0, ySplit: 4 };

  /* ================= EXPORT ================= */

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Collection Report");

  const buffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([buffer], {
    type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, `COLLECTION_REPORT_${year}.xlsx`);
};
