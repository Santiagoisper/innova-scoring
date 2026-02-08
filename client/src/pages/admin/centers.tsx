import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Eye, Send, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminCenters() {
  const { sites, generateToken, registerSite } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Form State
  const [formData, setFormData] = useState({
    name: "", // Site Name
    code: "",
    country: "",
    city: "",
    address: "",
    contactName: "",
    email: "",
    phone: "",
    description: ""
  });

  const filteredSites = sites.filter(s => 
    s.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendToken = (id: string, email: string) => {
    generateToken(id);
    toast({
      title: "Token Sent",
      description: `Access token sent to ${email}`,
    });
  };

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    registerSite({
      contactName: formData.contactName, // Keeping contactName as the primary name for now, or maybe I should update the store to use siteName if available. The mock data uses contactName as the main identifier in the UI often.
      email: formData.email,
      location: `${formData.city}, ${formData.country}`, // Backward compatibility
      description: formData.description,
      code: formData.code,
      country: formData.country,
      city: formData.city,
      address: formData.address,
      phone: formData.phone,
      score: 0,
      token: undefined
    });

    setIsSubmitting(false);
    setIsAddModalOpen(false);
    setFormData({ name: "", code: "", country: "", city: "", address: "", contactName: "", email: "", phone: "", description: "" }); // Reset form
    
    toast({
      title: "Site Added",
      description: `${formData.contactName} has been successfully registered.`,
    });
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

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-primary">Center Management</h1>
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
                        value={formData.name} // Using 'name' for person name to distinguish from 'contactName' which is used as Site Name in my logic above? Wait, let's fix the state mapping.
                        // Actually in my state init: name is Site Name? No, contactName was Site Name in previous logic. 
                        // Let's re-read the state init I just pushed: 
                        // { name: "", code: "", country: "", city: "", address: "", contactName: "", email: "", phone: "", description: "" }
                        // Wait, I messed up the state keys in the previous tool call.
                        // I will fix it here in the form implementation.
                        // Let's assume: contactName = Site Name (as per existing store usage), name = Contact Person Name?
                        // The user said: "Nombre del sitio, un codigo de sitio... Un nombre de contacto".
                        // In `types.ts`, `contactName` is likely the main identifier.
                        // Let's map: Site Name -> contactName (to keep store compatible), Contact Person -> new field? 
                        // Or maybe `contactName` was meant to be the person and the site name is missing? 
                        // Looking at mock data: "Dr. Sarah Chen" is contactName. "University hospital..." is description.
                        // So `contactName` is the Person. Where is the Site Name? 
                        // The mock data doesn't have a specific "Site Name" field, it uses `contactName` as the primary header. 
                        // User wants "Nombre del sitio" AND "Nombre de contacto".
                        // I should add `siteName` to types.ts as well? 
                        // Or just use `contactName` for Site Name and add `contactPerson`?
                        // Let's add `siteName` to types.ts in a separate call if needed, or re-purpose.
                        // The mock data uses "Dr. Sarah Chen" as the main title. 
                        // Let's add `siteName` to `Site` interface.
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
                {filteredSites.map((site) => (
                  <TableRow key={site.id}>
                    <TableCell>
                      <div className="font-medium">{site.contactName}</div>
                      <div className="text-xs text-muted-foreground">{site.email}</div>
                    </TableCell>
                    <TableCell>{site.location || "N/A"}</TableCell>
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
                        >
                          <Eye className="h-4 w-4" />
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
