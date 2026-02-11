import { useState } from "react";
import { useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import {
  fetchAdminRules, createAdminRule, updateAdminRule,
  fetchReportTemplates, updateReportTemplate,
  fetchDomains, updateDomain,
  fetchScoreMappings, createScoreMapping, updateScoreMapping, deleteScoreMapping,
  fetchReportAuditLog
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Settings, FileText, Hash, ClipboardList, Plus, Edit, Save, X, AlertTriangle, Check, ArrowLeft, Loader2 } from "lucide-react";

const STATUS_OPTIONS = ["Not Approved", "Under Evaluation", "Conditionally Approved", "Approved"];

function RulesTab() {
  const { toast } = useToast();
  const { data: rules = [], isLoading } = useQuery({ queryKey: ["/api/admin-rules"], queryFn: fetchAdminRules });
  const [editingRule, setEditingRule] = useState<any>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [criticalDialog, setCriticalDialog] = useState<{ open: boolean; pendingData: any; ruleId: string }>({ open: false, pendingData: null, ruleId: "" });
  const [changeReason, setChangeReason] = useState("");
  const [newRule, setNewRule] = useState({
    domainKey: "", triggerKey: "", rulePriority: 1, forcesMinimumStatus: "Under Evaluation",
    blocksApproval: false, requiresCapa: false, requiredActionText: "", evidenceRequiredText: "",
    recommendedTimelineDays: 30, active: true
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => createAdminRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin-rules"] });
      queryClient.invalidateQueries({ queryKey: ["/api/report-audit-log"] });
      toast({ title: "Rule Created", description: "New evaluation rule has been added." });
      setIsCreateOpen(false);
      setNewRule({ domainKey: "", triggerKey: "", rulePriority: 1, forcesMinimumStatus: "Under Evaluation", blocksApproval: false, requiresCapa: false, requiredActionText: "", evidenceRequiredText: "", recommendedTimelineDays: 30, active: true });
    },
    onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to create rule." })
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateAdminRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin-rules"] });
      queryClient.invalidateQueries({ queryKey: ["/api/report-audit-log"] });
      toast({ title: "Rule Updated", description: "Evaluation rule has been updated." });
      setEditingRule(null);
    },
    onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to update rule." })
  });

  const isCriticalChange = (original: any, updated: any) => {
    const statusOrder = STATUS_OPTIONS;
    const origIdx = statusOrder.indexOf(original.forcesMinimumStatus || original.forces_minimum_status);
    const newIdx = statusOrder.indexOf(updated.forcesMinimumStatus);
    if (newIdx < origIdx) return true;
    if ((original.blocksApproval || original.blocks_approval) && !updated.blocksApproval) return true;
    if ((original.requiresCapa || original.requires_capa) && !updated.requiresCapa) return true;
    if (original.active !== false && updated.active === false) return true;
    return false;
  };

  const handleSaveRule = (ruleId: string, data: any) => {
    const original = rules.find((r: any) => (r.id || r.rule_id) === ruleId);
    if (original && isCriticalChange(original, data)) {
      setCriticalDialog({ open: true, pendingData: data, ruleId });
      return;
    }
    updateMutation.mutate({ id: ruleId, data });
  };

  const confirmCriticalChange = () => {
    if (!changeReason.trim()) {
      toast({ variant: "destructive", title: "Reason Required", description: "Please provide a reason for this critical change." });
      return;
    }
    updateMutation.mutate({ id: criticalDialog.ruleId, data: { ...criticalDialog.pendingData, changeReason } });
    setCriticalDialog({ open: false, pendingData: null, ruleId: "" });
    setChangeReason("");
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold" data-testid="text-rules-title">Evaluation Rules</h3>
        <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-rule"><Plus className="h-4 w-4 mr-2" />New Rule</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Min Status</TableHead>
                  <TableHead>Blocks</TableHead>
                  <TableHead>CAPA</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No rules configured yet.</TableCell></TableRow>
                ) : rules.map((rule: any) => {
                  const ruleId = rule.id || rule.rule_id;
                  return (
                    <TableRow key={ruleId} className={!(rule.active ?? true) ? "opacity-50" : ""} data-testid={`row-rule-${ruleId}`}>
                      <TableCell className="font-medium">{rule.domainKey || rule.domain_key}</TableCell>
                      <TableCell>{rule.triggerKey || rule.trigger_key}</TableCell>
                      <TableCell><Badge variant="outline">{rule.rulePriority || rule.rule_priority}</Badge></TableCell>
                      <TableCell><Badge className="bg-[#0066a1]">{rule.forcesMinimumStatus || rule.forces_minimum_status}</Badge></TableCell>
                      <TableCell>{(rule.blocksApproval ?? rule.blocks_approval) ? <Check className="h-4 w-4 text-red-600" /> : <X className="h-4 w-4 text-muted-foreground" />}</TableCell>
                      <TableCell>{(rule.requiresCapa ?? rule.requires_capa) ? <Check className="h-4 w-4 text-amber-600" /> : <X className="h-4 w-4 text-muted-foreground" />}</TableCell>
                      <TableCell>{rule.recommendedTimelineDays || rule.recommended_timeline_days || "—"} days</TableCell>
                      <TableCell>{(rule.active ?? true) ? <Badge className="bg-emerald-600">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setEditingRule({
                          id: ruleId,
                          domainKey: rule.domainKey || rule.domain_key || "",
                          triggerKey: rule.triggerKey || rule.trigger_key || "",
                          rulePriority: rule.rulePriority || rule.rule_priority || 1,
                          forcesMinimumStatus: rule.forcesMinimumStatus || rule.forces_minimum_status || "Under Evaluation",
                          blocksApproval: rule.blocksApproval ?? rule.blocks_approval ?? false,
                          requiresCapa: rule.requiresCapa ?? rule.requires_capa ?? false,
                          requiredActionText: rule.requiredActionText || rule.required_action_text || "",
                          evidenceRequiredText: rule.evidenceRequiredText || rule.evidence_required_text || "",
                          recommendedTimelineDays: rule.recommendedTimelineDays || rule.recommended_timeline_days || 30,
                          active: rule.active ?? true
                        })} data-testid={`button-edit-rule-${ruleId}`}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Evaluation Rule</DialogTitle>
            <DialogDescription>Define a new rule for the report evaluation engine.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Domain Key</Label><Input data-testid="input-new-domain-key" value={newRule.domainKey} onChange={e => setNewRule({ ...newRule, domainKey: e.target.value })} placeholder="e.g. infrastructure" /></div>
              <div className="space-y-2"><Label>Trigger Key</Label><Input data-testid="input-new-trigger-key" value={newRule.triggerKey} onChange={e => setNewRule({ ...newRule, triggerKey: e.target.value })} placeholder="e.g. low_score" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Priority</Label><Input data-testid="input-new-priority" type="number" min={1} value={newRule.rulePriority} onChange={e => setNewRule({ ...newRule, rulePriority: parseInt(e.target.value) || 1 })} /></div>
              <div className="space-y-2">
                <Label>Forces Minimum Status</Label>
                <Select value={newRule.forcesMinimumStatus} onValueChange={v => setNewRule({ ...newRule, forcesMinimumStatus: v })}>
                  <SelectTrigger data-testid="select-new-min-status"><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Switch data-testid="switch-new-blocks-approval" checked={newRule.blocksApproval} onCheckedChange={v => setNewRule({ ...newRule, blocksApproval: v })} />
                <Label>Blocks Approval</Label>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Switch data-testid="switch-new-requires-capa" checked={newRule.requiresCapa} onCheckedChange={v => setNewRule({ ...newRule, requiresCapa: v })} />
                <Label>Requires CAPA</Label>
              </div>
            </div>
            <div className="space-y-2"><Label>Required Action Text</Label><Textarea data-testid="textarea-new-action-text" value={newRule.requiredActionText} onChange={e => setNewRule({ ...newRule, requiredActionText: e.target.value })} placeholder="Describe required corrective action..." /></div>
            <div className="space-y-2"><Label>Evidence Required Text</Label><Textarea data-testid="textarea-new-evidence-text" value={newRule.evidenceRequiredText} onChange={e => setNewRule({ ...newRule, evidenceRequiredText: e.target.value })} placeholder="Describe evidence needed..." /></div>
            <div className="space-y-2"><Label>Recommended Timeline (days)</Label><Input data-testid="input-new-timeline" type="number" min={1} value={newRule.recommendedTimelineDays} onChange={e => setNewRule({ ...newRule, recommendedTimelineDays: parseInt(e.target.value) || 30 })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate(newRule)} disabled={!newRule.domainKey || !newRule.triggerKey} data-testid="button-save-new-rule"><Save className="h-4 w-4 mr-2" />Create Rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingRule} onOpenChange={open => { if (!open) setEditingRule(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Evaluation Rule</DialogTitle>
            <DialogDescription>Modify the rule configuration. Critical changes will require a reason.</DialogDescription>
          </DialogHeader>
          {editingRule && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Domain Key</Label><Input data-testid="input-edit-domain-key" value={editingRule.domainKey} onChange={e => setEditingRule({ ...editingRule, domainKey: e.target.value })} /></div>
                <div className="space-y-2"><Label>Trigger Key</Label><Input data-testid="input-edit-trigger-key" value={editingRule.triggerKey} onChange={e => setEditingRule({ ...editingRule, triggerKey: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Priority</Label><Input data-testid="input-edit-priority" type="number" min={1} value={editingRule.rulePriority} onChange={e => setEditingRule({ ...editingRule, rulePriority: parseInt(e.target.value) || 1 })} /></div>
                <div className="space-y-2">
                  <Label>Forces Minimum Status</Label>
                  <Select value={editingRule.forcesMinimumStatus} onValueChange={v => setEditingRule({ ...editingRule, forcesMinimumStatus: v })}>
                    <SelectTrigger data-testid="select-edit-min-status"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Switch data-testid="switch-edit-blocks-approval" checked={editingRule.blocksApproval} onCheckedChange={v => setEditingRule({ ...editingRule, blocksApproval: v })} />
                  <Label>Blocks Approval</Label>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Switch data-testid="switch-edit-requires-capa" checked={editingRule.requiresCapa} onCheckedChange={v => setEditingRule({ ...editingRule, requiresCapa: v })} />
                  <Label>Requires CAPA</Label>
                </div>
              </div>
              <div className="space-y-2"><Label>Required Action Text</Label><Textarea data-testid="textarea-edit-action-text" value={editingRule.requiredActionText} onChange={e => setEditingRule({ ...editingRule, requiredActionText: e.target.value })} /></div>
              <div className="space-y-2"><Label>Evidence Required Text</Label><Textarea data-testid="textarea-edit-evidence-text" value={editingRule.evidenceRequiredText} onChange={e => setEditingRule({ ...editingRule, evidenceRequiredText: e.target.value })} /></div>
              <div className="space-y-2"><Label>Recommended Timeline (days)</Label><Input data-testid="input-edit-timeline" type="number" min={1} value={editingRule.recommendedTimelineDays} onChange={e => setEditingRule({ ...editingRule, recommendedTimelineDays: parseInt(e.target.value) || 30 })} /></div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Switch data-testid="switch-edit-active" checked={editingRule.active} onCheckedChange={v => setEditingRule({ ...editingRule, active: v })} />
                <Label>Active</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRule(null)}>Cancel</Button>
            <Button onClick={() => handleSaveRule(editingRule.id, editingRule)} data-testid="button-save-edit-rule"><Save className="h-4 w-4 mr-2" />Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={criticalDialog.open} onOpenChange={open => { if (!open) { setCriticalDialog({ open: false, pendingData: null, ruleId: "" }); setChangeReason(""); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600"><AlertTriangle className="h-5 w-5" />Critical Change Detected</AlertDialogTitle>
            <AlertDialogDescription>This change reduces the severity of the evaluation rule. Lowering protections may impact compliance. Please provide a reason for this change.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label>Reason for Change</Label>
            <Textarea data-testid="textarea-change-reason" value={changeReason} onChange={e => setChangeReason(e.target.value)} placeholder="Explain why this change is necessary..." className="mt-2" />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCriticalChange} className="bg-amber-600 hover:bg-amber-700" data-testid="button-confirm-critical">Confirm Change</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function TemplatesTab() {
  const { toast } = useToast();
  const { data: templates = [], isLoading } = useQuery({ queryKey: ["/api/report-templates"], queryFn: fetchReportTemplates });
  const [editingTemplate, setEditingTemplate] = useState<any>(null);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateReportTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/report-templates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/report-audit-log"] });
      toast({ title: "Template Updated", description: "Report template saved successfully." });
      setEditingTemplate(null);
    },
    onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to update template." })
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const statusConfig: Record<string, { color: string; icon: string }> = {
    "Approved": { color: "bg-emerald-100 text-emerald-800 border-emerald-300", icon: "✅" },
    "Conditionally Approved": { color: "bg-amber-100 text-amber-800 border-amber-300", icon: "⚠️" },
    "Not Approved": { color: "bg-red-100 text-red-800 border-red-300", icon: "❌" },
    "Under Evaluation": { color: "bg-blue-100 text-blue-800 border-blue-300", icon: "🔍" },
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold" data-testid="text-templates-title">Report Templates</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.length === 0 ? STATUS_OPTIONS.map(s => (
          <Card key={s} className="border-dashed">
            <CardHeader><CardTitle className="text-sm">{statusConfig[s]?.icon} {s}</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">No template configured.</p></CardContent>
          </Card>
        )) : templates.map((t: any) => {
          const tId = t.id || t.template_id;
          const statusType = t.statusType || t.status_type || "";
          const cfg = statusConfig[statusType] || { color: "bg-gray-100", icon: "📄" };
          return (
            <Card key={tId} className={`border ${cfg.color.includes("emerald") ? "border-emerald-200" : cfg.color.includes("amber") ? "border-amber-200" : cfg.color.includes("red") ? "border-red-200" : "border-blue-200"}`} data-testid={`card-template-${tId}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">{cfg.icon} {statusType}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setEditingTemplate({
                    id: tId,
                    statusType,
                    executiveSummaryText: t.executiveSummaryText || t.executive_summary_text || "",
                    reevaluationClauseText: t.reevaluationClauseText || t.reevaluation_clause_text || ""
                  })} data-testid={`button-edit-template-${tId}`}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Executive Summary</p>
                  <p className="text-sm line-clamp-3">{t.executiveSummaryText || t.executive_summary_text || "Not set"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Re-evaluation Clause</p>
                  <p className="text-sm line-clamp-2">{t.reevaluationClauseText || t.reevaluation_clause_text || "Not set"}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!editingTemplate} onOpenChange={open => { if (!open) setEditingTemplate(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Template: {editingTemplate?.statusType}</DialogTitle>
            <DialogDescription>Update the report text for this status category.</DialogDescription>
          </DialogHeader>
          {editingTemplate && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Executive Summary Text</Label>
                <Textarea data-testid="textarea-edit-executive-summary" rows={5} value={editingTemplate.executiveSummaryText} onChange={e => setEditingTemplate({ ...editingTemplate, executiveSummaryText: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Re-evaluation Clause Text</Label>
                <Textarea data-testid="textarea-edit-reevaluation-clause" rows={4} value={editingTemplate.reevaluationClauseText} onChange={e => setEditingTemplate({ ...editingTemplate, reevaluationClauseText: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTemplate(null)}>Cancel</Button>
            <Button onClick={() => updateMutation.mutate({ id: editingTemplate.id, data: editingTemplate })} data-testid="button-save-template"><Save className="h-4 w-4 mr-2" />Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DomainsTab() {
  const { toast } = useToast();
  const { data: domains = [], isLoading } = useQuery({ queryKey: ["/api/domains"], queryFn: fetchDomains });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateDomain(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/domains"] });
      queryClient.invalidateQueries({ queryKey: ["/api/report-audit-log"] });
      toast({ title: "Domain Updated", description: "Domain settings saved." });
    },
    onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to update domain." })
  });

  const [editingDomain, setEditingDomain] = useState<any>(null);

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold" data-testid="text-domains-title">Evaluation Domains</h3>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Display Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Visible in Report</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {domains.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No domains configured.</TableCell></TableRow>
              ) : domains.map((d: any) => {
                const dId = d.id || d.domain_id;
                return (
                  <TableRow key={dId} data-testid={`row-domain-${dId}`}>
                    <TableCell><Badge variant="outline">{d.displayOrder || d.display_order || 0}</Badge></TableCell>
                    <TableCell className="font-medium">{d.displayName || d.display_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{d.description || "—"}</TableCell>
                    <TableCell>
                      <Switch
                        data-testid={`switch-domain-visible-${dId}`}
                        checked={d.isVisibleInReport ?? d.is_visible_in_report ?? true}
                        onCheckedChange={v => updateMutation.mutate({ id: dId, data: { isVisibleInReport: v } })}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setEditingDomain({
                        id: dId,
                        displayName: d.displayName || d.display_name || "",
                        description: d.description || "",
                        displayOrder: d.displayOrder || d.display_order || 0,
                        isVisibleInReport: d.isVisibleInReport ?? d.is_visible_in_report ?? true
                      })} data-testid={`button-edit-domain-${dId}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingDomain} onOpenChange={open => { if (!open) setEditingDomain(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Domain</DialogTitle>
            <DialogDescription>Update domain display settings.</DialogDescription>
          </DialogHeader>
          {editingDomain && (
            <div className="space-y-4 py-2">
              <div className="space-y-2"><Label>Display Name</Label><Input data-testid="input-edit-domain-name" value={editingDomain.displayName} onChange={e => setEditingDomain({ ...editingDomain, displayName: e.target.value })} /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea data-testid="textarea-edit-domain-desc" value={editingDomain.description} onChange={e => setEditingDomain({ ...editingDomain, description: e.target.value })} /></div>
              <div className="space-y-2"><Label>Display Order</Label><Input data-testid="input-edit-domain-order" type="number" min={0} value={editingDomain.displayOrder} onChange={e => setEditingDomain({ ...editingDomain, displayOrder: parseInt(e.target.value) || 0 })} /></div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Switch data-testid="switch-edit-domain-visible" checked={editingDomain.isVisibleInReport} onCheckedChange={v => setEditingDomain({ ...editingDomain, isVisibleInReport: v })} />
                <Label>Visible in Report</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDomain(null)}>Cancel</Button>
            <Button onClick={() => { updateMutation.mutate({ id: editingDomain.id, data: editingDomain }); setEditingDomain(null); }} data-testid="button-save-domain"><Save className="h-4 w-4 mr-2" />Save Domain</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ScoreMappingsTab() {
  const { toast } = useToast();
  const { data: mappings = [], isLoading } = useQuery({ queryKey: ["/api/score-mappings"], queryFn: fetchScoreMappings });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<any>(null);
  const [newMapping, setNewMapping] = useState({ minScore: 0, maxScore: 100, statusLabel: "" });

  const createMutation = useMutation({
    mutationFn: (data: any) => createScoreMapping(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/score-mappings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/report-audit-log"] });
      toast({ title: "Mapping Created", description: "Score mapping added." });
      setIsCreateOpen(false);
      setNewMapping({ minScore: 0, maxScore: 100, statusLabel: "" });
    },
    onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to create mapping." })
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateScoreMapping(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/score-mappings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/report-audit-log"] });
      toast({ title: "Mapping Updated", description: "Score mapping saved." });
      setEditingMapping(null);
    },
    onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to update mapping." })
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteScoreMapping(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/score-mappings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/report-audit-log"] });
      toast({ title: "Mapping Deleted", description: "Score mapping removed." });
    },
    onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to delete mapping." })
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const statusColors: Record<string, string> = {
    "Approved": "bg-emerald-100 text-emerald-800",
    "Conditionally Approved": "bg-amber-100 text-amber-800",
    "Not Approved": "bg-red-100 text-red-800",
    "Under Evaluation": "bg-blue-100 text-blue-800",
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold" data-testid="text-score-mappings-title">Score Mappings</h3>
        <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-mapping"><Plus className="h-4 w-4 mr-2" />New Mapping</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Min Score</TableHead>
                <TableHead>Max Score</TableHead>
                <TableHead>Status Label</TableHead>
                <TableHead>Range</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mappings.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No score mappings configured.</TableCell></TableRow>
              ) : mappings.map((m: any) => {
                const mId = m.id || m.mapping_id;
                const minScore = m.minScore ?? m.min_score ?? 0;
                const maxScore = m.maxScore ?? m.max_score ?? 100;
                const label = m.statusLabel || m.status_label || "";
                return (
                  <TableRow key={mId} data-testid={`row-mapping-${mId}`}>
                    <TableCell className="font-mono">{minScore}</TableCell>
                    <TableCell className="font-mono">{maxScore}</TableCell>
                    <TableCell><Badge className={statusColors[label] || "bg-gray-100 text-gray-800"}>{label}</Badge></TableCell>
                    <TableCell>
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-[#0066a1] rounded-full" style={{ marginLeft: `${minScore}%`, width: `${maxScore - minScore}%` }} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => setEditingMapping({ id: mId, minScore, maxScore, statusLabel: label })} data-testid={`button-edit-mapping-${mId}`}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => { if (confirm("Delete this score mapping?")) deleteMutation.mutate(mId); }} data-testid={`button-delete-mapping-${mId}`}><X className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Score Mapping</DialogTitle>
            <DialogDescription>Define a score range and its resulting status label.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Min Score</Label><Input data-testid="input-new-min-score" type="number" min={0} max={100} value={newMapping.minScore} onChange={e => setNewMapping({ ...newMapping, minScore: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Max Score</Label><Input data-testid="input-new-max-score" type="number" min={0} max={100} value={newMapping.maxScore} onChange={e => setNewMapping({ ...newMapping, maxScore: parseInt(e.target.value) || 100 })} /></div>
            </div>
            <div className="space-y-2">
              <Label>Status Label</Label>
              <Select value={newMapping.statusLabel} onValueChange={v => setNewMapping({ ...newMapping, statusLabel: v })}>
                <SelectTrigger data-testid="select-new-status-label"><SelectValue placeholder="Select status..." /></SelectTrigger>
                <SelectContent>{STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate(newMapping)} disabled={!newMapping.statusLabel} data-testid="button-save-new-mapping"><Save className="h-4 w-4 mr-2" />Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingMapping} onOpenChange={open => { if (!open) setEditingMapping(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Score Mapping</DialogTitle>
            <DialogDescription>Update the score range and status label.</DialogDescription>
          </DialogHeader>
          {editingMapping && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Min Score</Label><Input data-testid="input-edit-min-score" type="number" min={0} max={100} value={editingMapping.minScore} onChange={e => setEditingMapping({ ...editingMapping, minScore: parseInt(e.target.value) || 0 })} /></div>
                <div className="space-y-2"><Label>Max Score</Label><Input data-testid="input-edit-max-score" type="number" min={0} max={100} value={editingMapping.maxScore} onChange={e => setEditingMapping({ ...editingMapping, maxScore: parseInt(e.target.value) || 100 })} /></div>
              </div>
              <div className="space-y-2">
                <Label>Status Label</Label>
                <Select value={editingMapping.statusLabel} onValueChange={v => setEditingMapping({ ...editingMapping, statusLabel: v })}>
                  <SelectTrigger data-testid="select-edit-status-label"><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMapping(null)}>Cancel</Button>
            <Button onClick={() => updateMutation.mutate({ id: editingMapping.id, data: editingMapping })} data-testid="button-save-edit-mapping"><Save className="h-4 w-4 mr-2" />Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AuditLogTab() {
  const { data: logs = [], isLoading } = useQuery({ queryKey: ["/api/report-audit-log"], queryFn: fetchReportAuditLog, refetchInterval: 15000 });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold" data-testid="text-audit-log-title">Audit Log</h3>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Critical</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No audit log entries found.</TableCell></TableRow>
                ) : logs.map((log: any, idx: number) => {
                  const logId = log.id || log.audit_id || idx;
                  const isCritical = log.isCriticalChange ?? log.is_critical_change ?? false;
                  return (
                    <TableRow key={logId} className={isCritical ? "bg-red-50/50" : ""} data-testid={`row-audit-${logId}`}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{log.createdAtUtc || log.created_at_utc ? new Date(log.createdAtUtc || log.created_at_utc).toLocaleString() : "—"}</TableCell>
                      <TableCell><Badge variant="outline">{log.entityType || log.entity_type}</Badge></TableCell>
                      <TableCell className="font-medium">{log.actionType || log.action_type}</TableCell>
                      <TableCell>{log.actorName || log.actor_name || "System"}</TableCell>
                      <TableCell>
                        {isCritical ? (
                          <Badge className="bg-red-600 text-white gap-1"><AlertTriangle className="h-3 w-3" />Critical</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ReportConfig() {
  const { user } = useStore();
  const [, setLocation] = useLocation();

  const hasAccess = user?.permission === "super_admin" || user?.permission === "readwrite";

  if (!hasAccess) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <Card className="max-w-md mx-auto mt-20">
            <CardContent className="pt-6 text-center space-y-4">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground" />
              <h2 className="text-xl font-bold" data-testid="text-access-denied">Super Admin Access Required</h2>
              <p className="text-muted-foreground">You do not have sufficient permissions to access the Report Configuration panel. Contact a Super Admin to request access.</p>
              <Button variant="outline" onClick={() => setLocation("/admin")} data-testid="button-back-dashboard"><ArrowLeft className="h-4 w-4 mr-2" />Back to Dashboard</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6 animate-in fade-in duration-500">
        <div className="rounded-xl p-6 text-white" style={{ background: "linear-gradient(135deg, #0066a1, #00857c)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setLocation("/admin")} data-testid="button-nav-back">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-page-title">
                  <Settings className="h-6 w-6" />
                  Report Configuration
                </h1>
                <p className="text-white/80 text-sm mt-1">Manage evaluation rules, templates, domains, and score mappings</p>
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              <Shield className="h-3 w-3 mr-1" />
              {user?.permission === "super_admin" ? "Super Admin" : "Read & Write"}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="rules" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="rules" className="gap-1.5" data-testid="tab-rules"><Shield className="h-4 w-4" /><span className="hidden sm:inline">Rules</span></TabsTrigger>
            <TabsTrigger value="templates" className="gap-1.5" data-testid="tab-templates"><FileText className="h-4 w-4" /><span className="hidden sm:inline">Templates</span></TabsTrigger>
            <TabsTrigger value="domains" className="gap-1.5" data-testid="tab-domains"><Hash className="h-4 w-4" /><span className="hidden sm:inline">Domains</span></TabsTrigger>
            <TabsTrigger value="score-mappings" className="gap-1.5" data-testid="tab-score-mappings"><Settings className="h-4 w-4" /><span className="hidden sm:inline">Score Mappings</span></TabsTrigger>
            <TabsTrigger value="audit-log" className="gap-1.5" data-testid="tab-audit-log"><ClipboardList className="h-4 w-4" /><span className="hidden sm:inline">Audit Log</span></TabsTrigger>
          </TabsList>

          <TabsContent value="rules"><RulesTab /></TabsContent>
          <TabsContent value="templates"><TemplatesTab /></TabsContent>
          <TabsContent value="domains"><DomainsTab /></TabsContent>
          <TabsContent value="score-mappings"><ScoreMappingsTab /></TabsContent>
          <TabsContent value="audit-log"><AuditLogTab /></TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}