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
    contactName: "",
    email: "",
    location: "",
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
      contactName: formData.contactName,
      email: formData.email,
      location: formData.location,
      description: formData.description,
      score: 0,
      token: undefined
    });

    setIsSubmitting(false);
    setIsAddModalOpen(false);
    setFormData({ contactName: "", email: "", location: "", description: "" }); // Reset form
    
    toast({
      title: "Site Added",
      description: `${formData.contactName} has been successfully registered.`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Approved": return <Badge className="bg-emerald-600 hover:bg-emerald-700">Approved</Badge>;
      case "Rejected": return <Badge variant="destructive">Rejected</Badge>;
      case "ToConsider": return <Badge className="bg-amber-500 hover:bg-amber-600">To Consider</Badge>;
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
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Contact Name</Label>
                    <Input 
                      id="contactName" 
                      required
                      value={formData.contactName}
                      onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                      placeholder="Dr. John Doe"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        placeholder="City, Country"
                      />
                    </div>
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
