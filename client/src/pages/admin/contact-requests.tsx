import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { fetchSites, generateToken as generateTokenApi } from "@/lib/api";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ContactRequests() {
  const { user } = useStore();
  const { data: sites = [], isLoading } = useQuery({ queryKey: ["/api/sites"], queryFn: fetchSites });
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const generateTokenMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => generateTokenApi(id, user?.name || "Admin"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sites"] });
    }
  });

  const pendingSites = sites.filter((s: any) => 
    s.status === "Pending" && (
      s.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleStatusChange = (id: string, newStatus: string) => {
    if (newStatus === "Resolved") {
      if (confirm("Are you sure you want to resolve this request? The site will be moved to the active Centers list.")) {
        generateTokenMutation.mutate({ id });
        
        toast({
          title: "Request Resolved",
          description: "Site has been moved to Centers list.",
        });
      }
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
                {pendingSites.map((site: any) => (
                  <TableRow key={site.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setLocation(`/admin/centers/${site.id}`)}>
                    <TableCell>
                      <div className="font-medium">{site.contactName}</div>
                      <div className="text-xs text-muted-foreground">{site.email}</div>
                    </TableCell>
                    <TableCell>{site.location || "N/A"}</TableCell>
                    <TableCell>{new Date(site.registeredAt).toLocaleDateString()}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
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
                        variant="ghost" 
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/admin/centers/${site.id}`);
                        }}
                      >
                        <Eye className="h-4 w-4" />
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
