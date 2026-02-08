import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Mail, Send, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ContactRequests() {
  const { sites, updateSiteStatus, generateToken } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const pendingSites = sites.filter(s => 
    s.status === "Pending" && (
      s.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleSendToken = (id: string, email: string) => {
    // Generate token but don't change status yet? Or user implies it just sends mail?
    // User said: "Si apretamos ese de token generara el mail... pero si lo cambiamos a resolved... el sitio lo envia a centers"
    // So sending token is just an action here.
    
    // We can call generateToken from store, but that updates status to TokenSent.
    // The user wants the status change to happen on "Resolved".
    // So I should just fake the email send here, OR modify generateToken to NOT change status?
    // But generateToken usually implies changing status.
    
    // Let's just show a toast for now as per "generara el mail".
    toast({
      title: "Token Sent",
      description: `Access token email sent to ${email}`,
    });
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    if (newStatus === "Resolved") {
      if (confirm("Are you sure you want to resolve this request? The site will be moved to the active Centers list.")) {
        // Move to centers with status "TokenSent" as requested
        // "donde el cartel que tendra hasta ser evaluado sera el del status Token Sent"
        
        // I'll assume we should also generate a token if not exists?
        // Let's call generateToken which sets status to TokenSent and generates token.
        generateToken(id);
        
        toast({
          title: "Request Resolved",
          description: "Site has been moved to Centers list.",
        });
      }
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-primary">Contact Requests</h1>
            <p className="text-muted-foreground">Manage pending site registration requests.</p>
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search requests..." 
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
                  <TableHead>Contact / Site</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Registered At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingSites.map((site) => (
                  <TableRow key={site.id}>
                    <TableCell>
                      <div className="font-medium">{site.contactName}</div>
                      <div className="text-xs text-muted-foreground">{site.email}</div>
                    </TableCell>
                    <TableCell>{site.location || "N/A"}</TableCell>
                    <TableCell>{new Date(site.registeredAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                       <Select onValueChange={(val) => handleStatusChange(site.id, val)} defaultValue="Pending">
                        <SelectTrigger className="w-[130px] h-8">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Resolved" className="text-green-600 font-medium">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 gap-2"
                        onClick={() => handleSendToken(site.id, site.email)}
                      >
                        <Mail className="h-3 w-3" /> Send Token
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {pendingSites.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="h-8 w-8 text-muted-foreground/50" />
                        <p>No pending contact requests.</p>
                      </div>
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
