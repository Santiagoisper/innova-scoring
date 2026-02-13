import { FormEvent, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { buildInvoiceBreakdown, formatUsd } from "@/lib/invoicing";

type ClientRecord = {
  id: string;
  companyName: string;
  taxId: string;
  contactName: string;
  email: string;
};

type InvoiceRecord = {
  id: string;
  clientId: string;
  billingMonth: string;
  protocolCount: number;
  inPersonVisits: number;
  phoneVisits: number;
  implementation: boolean;
  total: number;
  createdAt: string;
};

const CLIENTS_KEY = "ichtys_clients";
const INVOICES_KEY = "ichtys_invoices";

function loadRecords<T>(key: string): T[] {
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function saveRecords<T>(key: string, records: T[]): void {
  localStorage.setItem(key, JSON.stringify(records));
}

export default function InvoicingPage() {
  const [clients, setClients] = useState<ClientRecord[]>(() => loadRecords<ClientRecord>(CLIENTS_KEY));
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(() => loadRecords<InvoiceRecord>(INVOICES_KEY));

  const [clientForm, setClientForm] = useState({
    companyName: "",
    taxId: "",
    contactName: "",
    email: "",
  });

  const [invoiceForm, setInvoiceForm] = useState({
    clientId: "",
    billingMonth: "",
    protocolCount: 0,
    inPersonVisits: 0,
    phoneVisits: 0,
    implementation: false,
  });

  const selectedClient = clients.find((client) => client.id === invoiceForm.clientId);
  const breakdown = useMemo(
    () =>
      buildInvoiceBreakdown({
        protocolCount: invoiceForm.protocolCount,
        inPersonVisits: invoiceForm.inPersonVisits,
        phoneVisits: invoiceForm.phoneVisits,
        includeImplementation: invoiceForm.implementation,
      }),
    [invoiceForm],
  );

  const clientInvoices = invoices.filter((invoice) => invoice.clientId === invoiceForm.clientId);

  function handleClientSubmit(event: FormEvent) {
    event.preventDefault();
    if (!clientForm.companyName.trim()) return;

    const nextClient: ClientRecord = {
      id: crypto.randomUUID(),
      companyName: clientForm.companyName.trim(),
      taxId: clientForm.taxId.trim(),
      contactName: clientForm.contactName.trim(),
      email: clientForm.email.trim(),
    };

    const nextClients = [...clients, nextClient];
    setClients(nextClients);
    saveRecords(CLIENTS_KEY, nextClients);
    setClientForm({ companyName: "", taxId: "", contactName: "", email: "" });

    if (!invoiceForm.clientId) {
      setInvoiceForm((prev) => ({ ...prev, clientId: nextClient.id }));
    }
  }

  function generatePdf(invoice: InvoiceRecord) {
    const client = clients.find((item) => item.id === invoice.clientId);
    const pdf = new jsPDF();
    const invoiceBreakdown = buildInvoiceBreakdown({
      protocolCount: invoice.protocolCount,
      inPersonVisits: invoice.inPersonVisits,
      phoneVisits: invoice.phoneVisits,
      includeImplementation: invoice.implementation,
    });

    pdf.setFontSize(18);
    pdf.text("ICHTYS - Factura", 14, 20);
    pdf.setFontSize(11);
    pdf.text(`Cliente: ${client?.companyName ?? "Sin cliente"}`, 14, 32);
    pdf.text(`Mes: ${invoice.billingMonth}`, 14, 40);
    pdf.text(`CUIT/ID: ${client?.taxId || "N/A"}`, 14, 48);
    pdf.text(`Contacto: ${client?.contactName || "N/A"} (${client?.email || "N/A"})`, 14, 56);

    let y = 72;
    const rows: Array<[string, string]> = [
      ["Cargo fijo por protocolos", formatUsd(invoiceBreakdown.protocolFee)],
      [
        `Visitas presenciales (${invoice.inPersonVisits} x U$S 10)`,
        formatUsd(invoiceBreakdown.inPersonSubtotal),
      ],
      [
        `Descuento visitas presenciales (${(invoiceBreakdown.inPersonDiscountRate * 100).toFixed(0)}%)`,
        `- ${formatUsd(invoiceBreakdown.inPersonDiscountAmount)}`,
      ],
      ["Total visitas presenciales", formatUsd(invoiceBreakdown.inPersonTotal)],
      [
        `Visitas telefónicas (${invoice.phoneVisits} x U$S 2.50)`,
        formatUsd(invoiceBreakdown.phoneTotal),
      ],
      ["Implementación (única vez)", formatUsd(invoiceBreakdown.implementationFee)],
    ];

    rows.forEach(([label, value]) => {
      pdf.text(label, 14, y);
      pdf.text(value, 140, y);
      y += 8;
    });

    pdf.setFontSize(14);
    pdf.text(`TOTAL: ${formatUsd(invoiceBreakdown.grandTotal)}`, 14, y + 8);

    pdf.save(`factura-${client?.companyName ?? "cliente"}-${invoice.billingMonth}.pdf`);
  }

  function handleInvoiceSubmit(event: FormEvent) {
    event.preventDefault();
    if (!invoiceForm.clientId || !invoiceForm.billingMonth) return;

    const nextInvoice: InvoiceRecord = {
      id: crypto.randomUUID(),
      clientId: invoiceForm.clientId,
      billingMonth: invoiceForm.billingMonth,
      protocolCount: invoiceForm.protocolCount,
      inPersonVisits: invoiceForm.inPersonVisits,
      phoneVisits: invoiceForm.phoneVisits,
      implementation: invoiceForm.implementation,
      total: breakdown.grandTotal,
      createdAt: new Date().toISOString(),
    };

    const nextInvoices = [nextInvoice, ...invoices];
    setInvoices(nextInvoices);
    saveRecords(INVOICES_KEY, nextInvoices);
    generatePdf(nextInvoice);
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Facturación ICHTYS</h1>
          <p className="text-slate-600">Carga clientes, calcula factura automática y exporta en PDF.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Base de datos de clientes</CardTitle>
              <CardDescription>Se guarda localmente por navegador.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleClientSubmit} className="space-y-3">
                <div className="space-y-2">
                  <Label>Empresa</Label>
                  <Input value={clientForm.companyName} onChange={(e) => setClientForm((p) => ({ ...p, companyName: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>CUIT / ID fiscal</Label>
                  <Input value={clientForm.taxId} onChange={(e) => setClientForm((p) => ({ ...p, taxId: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Contacto</Label>
                  <Input value={clientForm.contactName} onChange={(e) => setClientForm((p) => ({ ...p, contactName: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={clientForm.email} onChange={(e) => setClientForm((p) => ({ ...p, email: e.target.value }))} />
                </div>
                <Button type="submit" className="w-full">Guardar cliente</Button>
              </form>

              <Separator className="my-4" />

              <div className="space-y-2 max-h-56 overflow-y-auto">
                {clients.length === 0 && <p className="text-sm text-slate-500">Sin clientes cargados.</p>}
                {clients.map((client) => (
                  <div key={client.id} className="border rounded-md p-3 text-sm">
                    <p className="font-semibold">{client.companyName}</p>
                    <p className="text-slate-500">{client.contactName} · {client.email || "sin email"}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nueva factura</CardTitle>
              <CardDescription>Calcula según protocolos, visitas e implementación.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvoiceSubmit} className="space-y-3">
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <select
                    className="w-full border rounded-md h-10 px-3"
                    value={invoiceForm.clientId}
                    onChange={(e) => setInvoiceForm((p) => ({ ...p, clientId: e.target.value }))}
                    required
                  >
                    <option value="">Seleccionar cliente...</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>{client.companyName}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Mes de facturación</Label>
                  <Input type="month" value={invoiceForm.billingMonth} onChange={(e) => setInvoiceForm((p) => ({ ...p, billingMonth: e.target.value }))} required />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Protocolos</Label>
                    <Input type="number" min={0} value={invoiceForm.protocolCount} onChange={(e) => setInvoiceForm((p) => ({ ...p, protocolCount: Number(e.target.value) }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Visitas presenciales</Label>
                    <Input type="number" min={0} value={invoiceForm.inPersonVisits} onChange={(e) => setInvoiceForm((p) => ({ ...p, inPersonVisits: Number(e.target.value) }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Visitas telefónicas</Label>
                    <Input type="number" min={0} value={invoiceForm.phoneVisits} onChange={(e) => setInvoiceForm((p) => ({ ...p, phoneVisits: Number(e.target.value) }))} />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={invoiceForm.implementation}
                    onCheckedChange={(value) => setInvoiceForm((p) => ({ ...p, implementation: Boolean(value) }))}
                    id="implementation"
                  />
                  <Label htmlFor="implementation">Incluir implementación única (U$S 1000)</Label>
                </div>

                <div className="bg-slate-50 border rounded-md p-3 text-sm space-y-1">
                  <p><span className="font-medium">Cliente:</span> {selectedClient?.companyName ?? "-"}</p>
                  <p><span className="font-medium">Cargo protocolos:</span> {formatUsd(breakdown.protocolFee)}</p>
                  <p><span className="font-medium">Visitas presenciales:</span> {formatUsd(breakdown.inPersonTotal)} ({(breakdown.inPersonDiscountRate * 100).toFixed(0)}% desc.)</p>
                  <p><span className="font-medium">Visitas telefónicas:</span> {formatUsd(breakdown.phoneTotal)}</p>
                  <p><span className="font-medium">Implementación:</span> {formatUsd(breakdown.implementationFee)}</p>
                  <p className="text-base font-bold pt-2">Total: {formatUsd(breakdown.grandTotal)}</p>
                </div>

                <Button type="submit" className="w-full">Generar factura PDF</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Facturas del cliente seleccionado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {clientInvoices.length === 0 && (
                <p className="text-sm text-slate-500">No hay facturas para este cliente.</p>
              )}
              {clientInvoices.map((invoice) => (
                <div key={invoice.id} className="border rounded-md p-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{invoice.billingMonth} · {formatUsd(invoice.total)}</p>
                    <p className="text-sm text-slate-500">Protocolos: {invoice.protocolCount} · Presenciales: {invoice.inPersonVisits} · Telefónicas: {invoice.phoneVisits}</p>
                  </div>
                  <Button variant="outline" onClick={() => generatePdf(invoice)}>Descargar PDF</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
