import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { fetchSites } from "@/lib/api";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, FileJson, FileSpreadsheet, Loader2 } from "lucide-react";

export default function ExportResults() {
  const { data: sites = [], isLoading } = useQuery({ queryKey: ["/api/sites"], queryFn: fetchSites });
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSites = sites.filter((s: any) => 
    s.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.location && s.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleExportCSV = () => {
    const headers = ["ID", "Contact Name", "Email", "Location", "Status", "Score", "Registered At", "Evaluated At"];
    const rows = filteredSites.map((s: any) => [
      s.id,
      `"${s.contactName}"`,
      s.email,
      `"${s.location || ''}"`,
      s.status,
      s.score || 0,
      s.registeredAt,
      s.evaluatedAt || ''
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map((e: any) => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "innova_trials_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log("Downloading CSV:", csvContent);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredSites, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", "innova_trials_results.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log("Downloading JSON");
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Approved": return <Badge className="bg-emerald-600 hover:bg-emerald-700">Aprobado</Badge>;
      case "Rejected": return <Badge variant="destructive">Rechazado</Badge>;
      case "ToConsider": return <Badge className="bg-amber-500 hover:bg-amber-600">Considerar</Badge>;
      case "Pending": return <Badge variant="secondary">Pendiente</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-primary">Exportar Resultados</h1>
            <p className="text-muted-foreground">Descarga y gestiona los datos de evaluación</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuración de Exportación</CardTitle>
            <CardDescription>Selecciona el formato deseado para descargar los reportes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="flex-1 h-24 flex-col gap-2 hover:border-primary hover:text-primary transition-colors" onClick={handleExportCSV}>
                <FileSpreadsheet className="h-8 w-8 text-green-600" />
                <span className="font-semibold">CSV Format</span>
                <span className="text-xs text-muted-foreground">Ideal for Excel / Sheets</span>
              </Button>
              <Button variant="outline" className="flex-1 h-24 flex-col gap-2 hover:border-primary hover:text-primary transition-colors" onClick={handleExportJSON}>
                <FileJson className="h-8 w-8 text-amber-600" />
                <span className="font-semibold">JSON Format</span>
                <span className="text-xs text-muted-foreground">Raw Data Structure</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Busca por nombre de sitio o código..." 
              className="pl-9 bg-white" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Información del Sitio</TableHead>
                  <TableHead>Puntaje</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSites.map((site: any) => (
                  <TableRow key={site.id}>
                    <TableCell>
                      <div className="font-medium">{site.contactName}</div>
                      <div className="text-xs text-muted-foreground">
                        {site.id.toUpperCase().substring(0, 8)} • {site.location || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {site.score !== undefined ? (
                        <span className={`font-bold ${
                          site.score >= 80 ? "text-emerald-600" :
                          site.score >= 50 ? "text-amber-600" : "text-red-600"
                        }`}>
                          {site.score}
                        </span>
                      ) : "—"}
                    </TableCell>
                    <TableCell>{getStatusBadge(site.status)}</TableCell>
                    <TableCell>
                      {new Date(site.evaluatedAt || site.registeredAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredSites.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No se encontraron resultados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
