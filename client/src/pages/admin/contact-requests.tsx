import { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Mail, Phone, MapPin, Check, X } from "lucide-react";

// Mock Data for Contact Requests
const MOCK_REQUESTS = [
  { id: "1", name: "Dr. Albert Wesker", email: "a.wesker@umbrella.corp", subject: "Site Registration Inquiry", status: "Pending", date: "2023-10-25" },
  { id: "2", name: "Nurse Joy", email: "joy@pokemon.center", subject: "Technical Support - Login Issue", status: "Resolved", date: "2023-10-24" },
  { id: "3", name: "Gregory House", email: "house@ppth.org", subject: "Evaluation Criteria Question", status: "Pending", date: "2023-10-23" },
];

export default function ContactRequests() {
  const [searchTerm, setSearchTerm] = useState("");
  const [requests, setRequests] = useState(MOCK_REQUESTS);

  const filteredRequests = requests.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = (id: string, newStatus: string) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-primary">Contact Requests</h1>
            <p className="text-muted-foreground">Manage inquiries and support tickets from clinical sites.</p>
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
                  <TableHead>Sender</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <div className="font-medium">{req.name}</div>
                      <div className="text-xs text-muted-foreground">{req.email}</div>
                    </TableCell>
                    <TableCell>{req.subject}</TableCell>
                    <TableCell>{req.date}</TableCell>
                    <TableCell>
                      <Badge variant={req.status === "Resolved" ? "default" : "secondary"}>
                        {req.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {req.status === "Pending" && (
                          <Button size="sm" variant="ghost" onClick={() => handleStatusChange(req.id, "Resolved")}>
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
