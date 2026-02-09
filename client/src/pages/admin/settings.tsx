import { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Trash2, UserPlus, Shield, ShieldAlert, Lock, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminSettings() {
  const { adminUsers, addAdminUser, deleteAdminUser, user: currentUser } = useStore();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Form State
  const [newUser, setNewUser] = useState({
    name: "",
    username: "",
    password: "",
    permission: "readonly" as "readonly" | "readwrite"
  });

  const handleAddUser = () => {
    if (!newUser.name || !newUser.username || !newUser.password) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill in all fields to create a user."
      });
      return;
    }

    // Check if username exists
    if (adminUsers.some(u => u.username === newUser.username)) {
      toast({
        variant: "destructive",
        title: "Username Taken",
        description: "Please choose a different username."
      });
      return;
    }

    addAdminUser({
      name: newUser.name,
      username: newUser.username,
      password: newUser.password,
      permission: newUser.permission,
      role: "admin"
    });

    setIsAddDialogOpen(false);
    setNewUser({ name: "", username: "", password: "", permission: "readonly" });
    
    toast({
      title: "User Created",
      description: `${newUser.name} has been added successfully.`
    });
  };

  const handleDeleteUser = (id: string) => {
    if (currentUser?.id === id) {
      toast({
        variant: "destructive",
        title: "Action Denied",
        description: "You cannot delete your own account."
      });
      return;
    }

    deleteAdminUser(id);
    toast({
      title: "User Deleted",
      description: "Administrator account has been removed."
    });
  };

  const canEdit = currentUser?.permission === "readwrite";

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-primary">System Settings</h1>
            <p className="text-muted-foreground">Manage administrator access and permissions.</p>
          </div>
          
          {canEdit && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" /> Add Administrator
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Administrator</DialogTitle>
                  <DialogDescription>
                    Add a new user with access to the admin portal.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      value={newUser.username}
                      onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                      placeholder="jdoe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="permission">Permissions</Label>
                    <Select 
                      value={newUser.permission} 
                      onValueChange={(val: "readonly" | "readwrite") => setNewUser({...newUser, permission: val})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="readonly">Read Only (View Only)</SelectItem>
                        <SelectItem value="readwrite">Read & Write (Full Access)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Read & Write users will have their actions logged in the Activity Log.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddUser}>Create User</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Administrator Accounts
            </CardTitle>
            <CardDescription>
              Users with access to the administration portal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.name}
                      {user.id === currentUser?.id && <Badge variant="secondary" className="ml-2 text-xs">You</Badge>}
                    </TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell>
                      {user.permission === "readwrite" ? (
                        <Badge className="bg-emerald-600 hover:bg-emerald-700 gap-1">
                          <ShieldCheck className="h-3 w-3" /> Read & Write
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <Lock className="h-3 w-3" /> Read Only
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {canEdit && user.id !== currentUser?.id && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
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

import { ShieldCheck } from "lucide-react";
