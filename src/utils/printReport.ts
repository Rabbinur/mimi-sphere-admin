/**
 * Dedicated Printable Report Generator for Mimi Sphere Admin Panel
 * Renders a clean, official, print-ready document in a dedicated iframe.
 * No sidebars, no headers, no inputs, no cut-offs.
 */

export interface IPrintReportOptions {
  title: string;
  subtitle?: string;
  periodText: string;
  metadata?: { label: string; value: string }[];
  summaryCards?: { label: string; value: string; color?: string }[];
  columns: { header: string; key: string; align?: "left" | "center" | "right" }[];
  data: Record<string, any>[];
  totalRow?: Record<string, any>;
}

export const printCleanReport = (options: IPrintReportOptions) => {
  const {
    title,
    subtitle = "Official Business Analytics & Management Report",
    periodText,
    metadata = [],
    summaryCards = [],
    columns,
    data,
    totalRow,
  } = options;

  const nowStr = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  const summaryCardsHtml =
    summaryCards.length > 0
      ? `
    <div style="display: grid; grid-template-columns: repeat(${Math.min(
      summaryCards.length,
      4
    )}, 1fr); gap: 12px; margin-bottom: 20px;">
      ${summaryCards
        .map(
          (c) => `
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; background: #f8fafc;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">${c.label}</div>
          <div style="font-size: 16px; font-weight: 800; color: ${c.color || "#0f172a"}; margin-top: 4px; font-family: monospace;">${c.value}</div>
        </div>
      `
        )
        .join("")}
    </div>
  `
      : "";

  const tableRowsHtml = data
    .map(
      (row, idx) => `
      <tr style="background: ${idx % 2 === 0 ? "#ffffff" : "#f8fafc"};">
        ${columns
          .map((col) => {
            const align = col.align || "left";
            const val = row[col.key] !== undefined && row[col.key] !== null ? row[col.key] : "-";
            return `<td style="padding: 7px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; text-align: ${align}; color: #1e293b;">${val}</td>`;
          })
          .join("")}
      </tr>
    `
    )
    .join("");

  const totalRowHtml = totalRow
    ? `
      <tr style="background: #e2e8f0; font-weight: 700;">
        ${columns
          .map((col) => {
            const align = col.align || "left";
            const val = totalRow[col.key] !== undefined ? totalRow[col.key] : "";
            return `<td style="padding: 8px 10px; border-top: 2px solid #94a3b8; font-size: 11px; text-align: ${align}; color: #0f172a;">${val}</td>`;
          })
          .join("")}
      </tr>
    `
    : "";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title} - Mimi Sphere</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 12mm 15mm 12mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #0f172a;
            background: #ffffff;
            font-size: 12px;
            line-height: 1.4;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 14px;
            margin-bottom: 16px;
          }
          .brand-title {
            font-size: 22px;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: -0.5px;
            text-transform: uppercase;
          }
          .brand-tagline {
            font-size: 11px;
            color: #475569;
            margin-top: 2px;
          }
          .report-info {
            text-align: right;
          }
          .report-title {
            font-size: 16px;
            font-weight: 800;
            color: #1e293b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .report-meta {
            font-size: 10.5px;
            color: #64748b;
            margin-top: 3px;
          }
          .meta-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            background: #f1f5f9;
            border-radius: 6px;
            padding: 8px 12px;
            margin-bottom: 16px;
            font-size: 11px;
          }
          .meta-item {
            display: flex;
            gap: 4px;
          }
          .meta-label {
            font-weight: 700;
            color: #475569;
          }
          .meta-value {
            font-weight: 600;
            color: #0f172a;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 6px;
          }
          th {
            background-color: #0f172a !important;
            color: #ffffff !important;
            font-size: 10.5px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 8px 10px;
            border: 1px solid #0f172a;
          }
          td {
            border: 1px solid #e2e8f0;
          }
          tr {
            page-break-inside: avoid;
          }
          .footer {
            margin-top: 36px;
            padding-top: 14px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            page-break-inside: avoid;
          }
          .sig-box {
            text-align: center;
            width: 180px;
          }
          .sig-line {
            border-top: 1px solid #94a3b8;
            margin-bottom: 4px;
          }
          .sig-text {
            font-size: 10.5px;
            font-weight: 600;
            color: #475569;
          }
          .print-note {
            font-size: 9.5px;
            color: #94a3b8;
            text-align: center;
            margin-top: 24px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand-title">MIMI SPHERE</div>
            <div class="brand-tagline">Premium Fashion & Lifestyle Retail • ERP Report</div>
            <div class="brand-tagline" style="font-size: 10px; color: #64748b;">Dhaka, Bangladesh • Hotline: +880 1700-000000</div>
          </div>
          <div class="report-info">
            <div class="report-title">${title}</div>
            <div class="report-meta">Generated: ${nowStr} (BST)</div>
            <div class="report-meta">Period: <strong>${periodText}</strong></div>
          </div>
        </div>

        ${
          metadata.length > 0
            ? `
          <div class="meta-grid">
            ${metadata
              .map(
                (m) => `
              <div class="meta-item">
                <span class="meta-label">${m.label}:</span>
                <span class="meta-value">${m.value}</span>
              </div>
            `
              )
              .join("")}
          </div>
        `
            : ""
        }

        ${summaryCardsHtml}

        <table>
          <thead>
            <tr>
              ${columns
                .map(
                  (c) =>
                    `<th style="text-align: ${c.align || "left"};">${c.header}</th>`
                )
                .join("")}
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
            ${totalRowHtml}
          </tbody>
        </table>

        <div class="footer">
          <div class="sig-box">
            <div class="sig-line"></div>
            <div class="sig-text">Prepared By (Admin)</div>
          </div>
          <div class="sig-box">
            <div class="sig-line"></div>
            <div class="sig-text">Authorized Signature</div>
          </div>
        </div>

        <div class="print-note">
          Mimi Sphere Automated Retail ERP System • Page 1 of 1 • System Generated Report
        </div>
      </body>
    </html>
  `;

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!doc) return;

  doc.open();
  doc.write(html);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1500);
  }, 350);
};
