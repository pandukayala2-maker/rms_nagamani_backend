import PDFDocument from "pdfkit";
import type { Response } from "express";

interface ReceiptOrderItem {
  nameSnapshot: string;
  quantity: number;
  priceSnapshot: number;
  subtotal: number;
}

interface ReceiptData {
  orderNumber: string;
  createdAt: Date;
  restaurantName: string;
  address?: string | null;
  contact?: string | null;
  tableName?: string | null;
  orderType: string;
  items: ReceiptOrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payments: { method: string; amount: number }[];
}

export function streamReceiptPdf(res: Response, receipt: ReceiptData): void {
  const doc = new PDFDocument({ size: [226, 600], margin: 12 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="receipt-${receipt.orderNumber}.pdf"`
  );
  doc.pipe(res);

  doc.fontSize(14).text(receipt.restaurantName, { align: "center" });
  if (receipt.address) doc.fontSize(8).text(receipt.address, { align: "center" });
  if (receipt.contact) doc.fontSize(8).text(receipt.contact, { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(9).text(`Order #: ${receipt.orderNumber}`);
  doc.text(`Date: ${receipt.createdAt.toLocaleString()}`);
  doc.text(`Type: ${receipt.orderType}${receipt.tableName ? ` (${receipt.tableName})` : ""}`);
  doc.moveDown(0.5);
  doc.text("--------------------------------");

  receipt.items.forEach((item) => {
    doc.text(`${item.nameSnapshot}`);
    doc.text(
      `  ${item.quantity} x ${item.priceSnapshot.toFixed(2)}   = ${item.subtotal.toFixed(2)}`
    );
  });

  doc.text("--------------------------------");
  doc.text(`Subtotal: ${receipt.subtotal.toFixed(2)}`, { align: "right" });
  doc.text(`Discount: -${receipt.discount.toFixed(2)}`, { align: "right" });
  doc.text(`Tax: ${receipt.tax.toFixed(2)}`, { align: "right" });
  doc.fontSize(11).text(`Total: ${receipt.total.toFixed(2)}`, { align: "right" });
  doc.fontSize(9).moveDown(0.5);

  receipt.payments.forEach((p) => {
    doc.text(`Paid via ${p.method}: ${p.amount.toFixed(2)}`, { align: "right" });
  });

  doc.moveDown();
  doc.fontSize(9).text("Thank you for visiting!", { align: "center" });

  doc.end();
}
