/**
 * Export Utilities — Centralized multi-format export engine
 * Supports CSV, PDF, Excel (.xlsx), JSON, and PNG exports
 * with filter-aware metadata embedding.
 */

/* ── Types ────────────────────────────────────────────────────────────── */

export interface ExportColumn {
  key: string;
  label: string;
  /** Optional formatter for display values */
  format?: (value: any, row: any) => string;
}

export interface ActiveFilter {
  label: string;
  value: string;
}

export interface ExportConfig {
  /** Title for the export (used in PDF header, filename) */
  title: string;
  /** The data rows */
  data: Record<string, any>[];
  /** Column definitions */
  columns: ExportColumn[];
  /** Active filters/search to embed as metadata */
  activeFilters: ActiveFilter[];
  /** Total count before filtering */
  totalCount: number;
  /** Custom filename (without extension) */
  filename?: string;
  /** Whether to include metadata header in the export */
  includeMetadata?: boolean;
}

export type ExportFormat = "csv" | "pdf" | "xlsx" | "json" | "png";

/* ── Helpers ──────────────────────────────────────────────────────────── */

function getCellValue(row: Record<string, any>, col: ExportColumn): string {
  const raw = row[col.key];
  if (col.format) return col.format(raw, row);
  if (raw === null || raw === undefined) return "";
  return String(raw);
}

function buildFilename(config: ExportConfig, ext: string): string {
  const base =
    config.filename ||
    config.title.toLowerCase().replace(/[^a-z0-9]+/g, "_");
  const date = new Date().toISOString().split("T")[0];
  return `${base}_${date}.${ext}`;
}

function buildMetadataLines(config: ExportConfig): string[] {
  const lines: string[] = [];
  lines.push(`Export: ${config.title}`);
  lines.push(`Date: ${new Date().toLocaleString()}`);
  lines.push(`Records: ${config.data.length} of ${config.totalCount} total`);
  if (config.activeFilters.length > 0) {
    lines.push(
      `Active Filters: ${config.activeFilters
        .map((f) => `${f.label}: ${f.value}`)
        .join(" | ")}`
    );
  }
  return lines;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ── CSV Export ───────────────────────────────────────────────────────── */

export function exportCSV(config: ExportConfig): Blob {
  const rows: string[][] = [];

  // Metadata header
  if (config.includeMetadata) {
    for (const line of buildMetadataLines(config)) {
      rows.push([line]);
    }
    rows.push([]); // blank separator
  }

  // Column headers
  rows.push(config.columns.map((c) => c.label));

  // Data rows
  for (const row of config.data) {
    rows.push(
      config.columns.map((col) => {
        const val = getCellValue(row, col);
        // Escape CSV: wrap in quotes if contains comma, newline, or quote
        if (/[",\n\r]/.test(val)) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      })
    );
  }

  // BOM for Excel compatibility + content
  const bom = "\uFEFF";
  const csvString = bom + rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  return blob;
}

export function downloadCSV(config: ExportConfig) {
  const blob = exportCSV(config);
  triggerDownload(blob, buildFilename(config, "csv"));
}

/* ── JSON Export ──────────────────────────────────────────────────────── */

export function exportJSON(config: ExportConfig): Blob {
  const output: any = {};

  if (config.includeMetadata) {
    output.metadata = {
      title: config.title,
      exportedAt: new Date().toISOString(),
      totalRecords: config.totalCount,
      exportedRecords: config.data.length,
      activeFilters: config.activeFilters,
    };
  }

  output.columns = config.columns.map((c) => ({
    key: c.key,
    label: c.label,
  }));

  output.data = config.data.map((row) => {
    const obj: Record<string, string> = {};
    for (const col of config.columns) {
      obj[col.key] = getCellValue(row, col);
    }
    return obj;
  });

  const jsonString = JSON.stringify(output, null, 2);
  return new Blob([jsonString], { type: "application/json;charset=utf-8;" });
}

export function downloadJSON(config: ExportConfig) {
  const blob = exportJSON(config);
  triggerDownload(blob, buildFilename(config, "json"));
}

/* ── Excel Export ─────────────────────────────────────────────────────── */

export async function downloadExcel(config: ExportConfig) {
  const XLSX = await import("xlsx");

  const wb = XLSX.utils.book_new();
  const sheetData: any[][] = [];

  // Metadata rows
  if (config.includeMetadata) {
    for (const line of buildMetadataLines(config)) {
      sheetData.push([line]);
    }
    sheetData.push([]); // blank separator
  }

  // Header row
  sheetData.push(config.columns.map((c) => c.label));

  // Data
  for (const row of config.data) {
    sheetData.push(config.columns.map((col) => getCellValue(row, col)));
  }

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Auto-width columns
  const colWidths = config.columns.map((col) => {
    let max = col.label.length;
    for (const row of config.data) {
      const val = getCellValue(row, col);
      max = Math.max(max, val.length);
    }
    return { wch: Math.min(max + 2, 50) };
  });
  ws["!cols"] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, buildFilename(config, "xlsx"));
}

/* ── PDF Export ───────────────────────────────────────────────────────── */

export async function downloadPDF(config: ExportConfig) {
  const { default: jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({
    orientation: config.columns.length > 6 ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  });

  // Branded header
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(16, 62, 121); // --color-navy
  doc.text(config.title, 14, 18);

  // Metadata subtitle
  let yPos = 25;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Exported: ${new Date().toLocaleString()} \u2022 ${config.data.length} of ${config.totalCount} records`,
    14,
    yPos
  );
  yPos += 5;

  if (config.activeFilters.length > 0) {
    const filterStr = config.activeFilters
      .map((f) => `${f.label}: ${f.value}`)
      .join("  |  ");
    doc.text(`Filters: ${filterStr}`, 14, yPos);
    yPos += 5;
  }

  // Divider line
  doc.setDrawColor(16, 62, 121);
  doc.setLineWidth(0.5);
  doc.line(14, yPos, pageWidth - 14, yPos);
  yPos += 4;

  // Table
  const headers = config.columns.map((c) => c.label);
  const body = config.data.map((row) =>
    config.columns.map((col) => getCellValue(row, col))
  );

  autoTable(doc, {
    startY: yPos,
    head: [headers],
    body: body,
    styles: {
      fontSize: 8,
      cellPadding: 2,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [16, 62, 121], // navy
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 245, 239], // ivory
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data: any) => {
      // Footer with page number
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: "center" }
      );
    },
  });

  doc.save(buildFilename(config, "pdf"));
}

/* ── PNG Export (table as image) ──────────────────────────────────────── */

export async function downloadPNG(
  config: ExportConfig,
  tableElementId?: string
) {
  const html2canvas = (await import("html2canvas")).default;

  // If a table element ID is provided, screenshot it directly
  if (tableElementId) {
    const element = document.getElementById(tableElementId);
    if (element) {
      const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        scale: 2,
      });
      canvas.toBlob((blob) => {
        if (blob) triggerDownload(blob, buildFilename(config, "png"));
      }, "image/png");
      return;
    }
  }

  // Fallback: build a temporary styled HTML table
  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;left:-9999px;top:0;background:#fff;padding:24px;font-family:system-ui,-apple-system,sans-serif;";

  // Title
  const titleEl = document.createElement("h2");
  titleEl.textContent = config.title;
  titleEl.style.cssText =
    "color:#103E79;font-size:18px;margin:0 0 8px 0;font-weight:700;";
  container.appendChild(titleEl);

  // Metadata
  if (config.includeMetadata) {
    const meta = document.createElement("p");
    meta.style.cssText =
      "color:#666;font-size:11px;margin:0 0 12px 0;";
    const filterStr =
      config.activeFilters.length > 0
        ? ` \u2022 Filters: ${config.activeFilters.map((f) => `${f.label}: ${f.value}`).join(" | ")}`
        : "";
    meta.textContent = `${config.data.length} of ${config.totalCount} records \u2022 ${new Date().toLocaleString()}${filterStr}`;
    container.appendChild(meta);
  }

  // Table
  const table = document.createElement("table");
  table.style.cssText =
    "border-collapse:collapse;width:100%;font-size:12px;";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  for (const col of config.columns) {
    const th = document.createElement("th");
    th.textContent = col.label;
    th.style.cssText =
      "background:#103E79;color:#fff;padding:8px 12px;text-align:left;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;";
    headerRow.appendChild(th);
  }
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  config.data.forEach((row, idx) => {
    const tr = document.createElement("tr");
    tr.style.backgroundColor = idx % 2 === 0 ? "#ffffff" : "#F8F5EF";
    for (const col of config.columns) {
      const td = document.createElement("td");
      td.textContent = getCellValue(row, col);
      td.style.cssText =
        "padding:6px 12px;border-bottom:1px solid #e2e8f0;color:#2d3748;";
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);

  document.body.appendChild(container);

  const canvas = await html2canvas(container, {
    backgroundColor: "#ffffff",
    scale: 2,
  });

  document.body.removeChild(container);

  canvas.toBlob((blob) => {
    if (blob) triggerDownload(blob, buildFilename(config, "png"));
  }, "image/png");
}

/* ── Web Share ───────────────────────────────────────────────────────── */

export function canShare(): boolean {
  return typeof navigator !== "undefined" && !!navigator.share;
}

export function canShareFiles(): boolean {
  return typeof navigator !== "undefined" && !!navigator.canShare;
}

export async function shareExport(
  config: ExportConfig,
  format: ExportFormat
): Promise<boolean> {
  let blob: Blob;
  let filename: string;
  let mimeType: string;

  switch (format) {
    case "csv":
      blob = exportCSV(config);
      filename = buildFilename(config, "csv");
      mimeType = "text/csv";
      break;
    case "json":
      blob = exportJSON(config);
      filename = buildFilename(config, "json");
      mimeType = "application/json";
      break;
    default:
      // For PDF/XLSX/PNG, fall back to download
      return false;
  }

  const file = new File([blob], filename, { type: mimeType });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: config.title,
        text: `${config.title} \u2014 ${config.data.length} records`,
        files: [file],
      });
      return true;
    } catch (e: any) {
      if (e.name !== "AbortError") {
        console.error("Share failed:", e);
      }
      return false;
    }
  }

  // Fallback: share without file attachment
  if (navigator.share) {
    try {
      await navigator.share({
        title: config.title,
        text: `${config.title} \u2014 ${config.data.length} records exported on ${new Date().toLocaleDateString()}`,
      });
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

/* ── Unified Export Dispatcher ────────────────────────────────────────── */

export async function performExport(
  config: ExportConfig,
  format: ExportFormat
) {
  switch (format) {
    case "csv":
      downloadCSV(config);
      break;
    case "json":
      downloadJSON(config);
      break;
    case "xlsx":
      await downloadExcel(config);
      break;
    case "pdf":
      await downloadPDF(config);
      break;
    case "png":
      await downloadPNG(config);
      break;
  }
}
