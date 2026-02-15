import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { fetchSites, registerSite as registerSiteApi, generateToken as generateTokenApi, deleteSite as deleteSiteApi } from "@/lib/api";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Eye, Send, Plus, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCountryFlagUrl } from "@/lib/country-flags";

export default function AdminCenters() {
  const { user } = useStore();
  const { data: sites = [], isLoading } = useQuery({ queryKey: ["/api/sites"], queryFn: fetchSites, refetchInterval: 10000 });
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    country: "",
    city: "",
    address: "",
    contactName: "",
    email: "",
    phone: "",
    description: ""
  });

  const generateTokenMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => generateTokenApi(id, user?.name || "Admin"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sites"] });
    }
  });

  const deleteSiteMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => deleteSiteApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sites"] });
    }
  });

  const filteredSites = sites.filter((s: any) => 
    s.status !== "Pending" && (
      s.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleSendToken = (id: string, email: string) => {
    generateTokenMutation.mutate({ id });
    toast({
      title: "Token Sent",
      description: `Access token sent to ${email}`,
    });
  };

  const handleDeleteSite = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      deleteSiteMutation.mutate({ id });
      toast({
        title: "Site Deleted",
        description: `${name} has been removed from the registry.`,
        variant: "destructive"
      });
    }
  };

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await registerSiteApi({
        contactName: formData.contactName,
        email: formData.email,
        location: `${formData.city}, ${formData.country}`,
        description: formData.description,
        code: formData.code,
        country: formData.country,
        city: formData.city,
        address: formData.address,
        phone: formData.phone,
        score: 0,
        token: undefined
      });

      queryClient.invalidateQueries({ queryKey: ["/api/sites"] });
      setIsAddModalOpen(false);
      setFormData({ name: "", code: "", country: "", city: "", address: "", contactName: "", email: "", phone: "", description: "" });
      
      toast({
        title: "Site Added",
        description: `${formData.contactName} has been successfully registered.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add site.",
      });
    }
    setIsSubmitting(false);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Approved": return <Badge className="bg-emerald-600 hover:bg-emerald-700">Approved</Badge>;
      case "Rejected": return <Badge variant="destructive">Rejected</Badge>;
      case "ToConsider": return <Badge className="bg-amber-500 hover:bg-amber-600">Condicional</Badge>;
      case "Pending": return <Badge variant="secondary">Pending</Badge>;
      case "TokenSent": return <Badge variant="outline" className="border-blue-500 text-blue-600">Token Sent</Badge>;
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
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-heading font-bold text-primary">Center Management</h1>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live
              </div>
            </div>
            <p className="text-muted-foreground">Manage registered clinical sites and their evaluation status.</p>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search centers..." 
                className="pl-9 bg-white" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" /> Add Site
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Clinical Site</DialogTitle>
                  <CardDescription>
                    Manually register a new center to the network.
                  </CardDescription>
                </DialogHeader>
                <form onSubmit={handleAddSite} className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Site Name</Label>
                      <Input 
                        id="siteName" 
                        required
                        value={formData.contactName}
                        onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                        placeholder="e.g. General Hospital"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="code">Site Code</Label>
                      <Input 
                        id="code" 
                        required
                        value={formData.code}
                        onChange={(e) => setFormData({...formData, code: e.target.value})}
                        placeholder="e.g. SITE-001"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input 
                        id="country" 
                        required
                        value={formData.country}
                        onChange={(e) => setFormData({...formData, country: e.target.value})}
                        placeholder="e.g. USA"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        placeholder="e.g. New York"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input 
                      id="address" 
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="e.g. 123 Medical Blvd"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">Contact Person</Label>
                      <Input 
                        id="contactPerson" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g. Dr. Jane Smith"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone" 
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+1 555 000 0000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="john@clinic.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Brief description of facilities and capabilities..."
                      className="min-h-[100px]"
                    />
                  </div>
                  <DialogFooter className="pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                        </>
                      ) : "Add Site"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact / Site</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Evaluated By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSites.map((site: any) => (
                  <TableRow key={site.id}>
                    <TableCell>
                      <div className="font-medium">{site.contactName}</div>
                      <div className="text-xs text-muted-foreground">{site.email}</div>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const country = site.country || (site.location?.split(",").pop()?.trim() ?? "");
                        const flagUrl = getCountryFlagUrl(country, 20);
                        return (
                          <span className="inline-flex items-center gap-2">
                            {flagUrl && (
                              <img
                                src={flagUrl}
                                alt={country ? `${country} flag` : "Country flag"}
                                className="h-4 w-5 rounded-[2px] border border-black/10 object-cover"
                                loading="lazy"
                              />
                            )}
                            <span>{site.location || "N/A"}</span>
                          </span>
                        );
                      })()}
                    </TableCell>
                    <TableCell>{getStatusBadge(site.status)}</TableCell>
                    <TableCell>
                      {site.score !== undefined ? (
                        <span className={`font-bold ${
                          site.score >= 80 ? "text-emerald-600" :
                          site.score >= 50 ? "text-amber-600" : "text-red-600"
                        }`}>
                          {site.score}%
                        </span>
                      ) : "-"}
                    </TableCell>
                    <TableCell>{site.evaluatedBy || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {site.status === "Pending" && (
                          <Button 
                            size="sm" 
                            variant="default" 
                            className="h-8 px-2"
                            onClick={() => handleSendToken(site.id, site.email)}
                            title="Send Access Token"
                          >
                            <Send className="h-3 w-3 mr-1" /> Token
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          onClick={() => setLocation(`/admin/centers/${site.id}`)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteSite(site.id, site.contactName)}
                          title="Delete Site"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredSites.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No sites found matching your search.
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
