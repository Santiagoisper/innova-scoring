import { useState } from "react";
import { useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Shield } from "lucide-react";
import { submitTermsAcceptance } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const TERMS_VERSION = "1.0";
const TERMS_EFFECTIVE_DATE = "2026-02-11";

const TERMS_TEXT = `DISCLAIMER, ACKNOWLEDGMENT AND SITE REGISTRATION TERMS
Innova Trials LLC – Click-Wrap Agreement

By checking the box below and submitting this registration form, you ("Site", "Registrant", or "You") acknowledge, represent, warrant, and agree to the following terms in favor of Innova Trials LLC, a Florida limited liability company with principal place of business in Miami, Florida ("Innova Trials" or the "Company").

1. Voluntary Registration and No Obligation
Your submission of this registration form is voluntary and at your sole discretion. Submission does not create any partnership, joint venture, agency, fiduciary, certification, endorsement, or contractual relationship between you and Innova Trials. Innova Trials has no obligation to approve, onboard, engage, recommend, contract with, or otherwise work with you. Registration does not constitute approval, qualification, endorsement, or certification of your site.

2. Accuracy and Sole Responsibility
You represent and warrant that all information, data, documents, and materials submitted (the "Information") are true, accurate, complete, current, and not misleading. You are solely responsible for the legality, accuracy, and completeness of the Information. Innova Trials has no duty to verify or validate the Information and shall not be liable for any reliance placed upon it by third parties.

3. No Advice; No Reliance
Nothing in the registration process, communications, feedback, categorization, or evaluation constitutes legal, medical, regulatory, compliance, financial, or professional advice. You agree that you will not rely on any communication from Innova Trials as certification, regulatory approval, compliance validation, or suitability confirmation.

4. No Protected Health Information (PHI)
You agree not to submit any Protected Health Information (PHI) or individually identifiable patient information. You acknowledge that Innova Trials is not acting as a covered entity or business associate under HIPAA in connection with this registration. Any improper submission of PHI is solely your responsibility.

5. Use and Processing of Information
You authorize Innova Trials to store, review, analyze, process, and internally use the Information for evaluation, operational, research, compliance, business development, and network management purposes. Innova Trials may retain the Information in accordance with its internal policies and applicable law.

6. Right to Reject, Suspend, or Remove
Innova Trials may, at its sole discretion and without notice, reject, suspend, remove, or delete your registration or profile at any time, with or without cause, and without liability.

7. Regulatory Responsibility
You are solely responsible for compliance with all applicable local, state, federal, and international laws and regulations, including those relating to clinical research, healthcare operations, licensing, data protection, and ethics approvals. Innova Trials makes no representations or warranties regarding your compliance status.

8. Indemnification
You agree to indemnify, defend, and hold harmless Innova Trials, its members, managers, officers, employees, contractors, affiliates, and agents from and against any and all claims, liabilities, damages, penalties, fines, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or related to:
(a) inaccurate or misleading Information provided by you;
(b) your breach of these terms;
(c) your violation of applicable law;
(d) any claim by a third party related to your site operations.

9. Disclaimer of Warranties
The registration platform and any related services are provided on an "AS IS" and "AS AVAILABLE" basis. To the fullest extent permitted under Florida law, Innova Trials disclaims all warranties, express or implied, including merchantability, fitness for a particular purpose, non-infringement, accuracy, or availability.

10. Limitation of Liability
To the maximum extent permitted by law, Innova Trials shall not be liable for any indirect, incidental, special, consequential, punitive, or exemplary damages, including loss of business opportunity, reputational harm, regulatory exposure, or lost profits.
In all cases, Innova Trials' total aggregate liability arising out of or related to this registration shall not exceed USD 100.

11. Force Majeure
Innova Trials shall not be liable for any failure or delay resulting from causes beyond its reasonable control, including system failure, cyberattack, natural disaster, pandemic, governmental action, or third-party service interruption.

12. Class Action Waiver
You agree that any dispute shall be brought solely in your individual capacity and not as a plaintiff or class member in any purported class or representative proceeding.

13. Waiver of Jury Trial
You and Innova Trials knowingly and voluntarily waive any right to a trial by jury in any litigation arising out of or relating to this registration or these terms.

14. Governing Law and Exclusive Jurisdiction
These terms shall be governed by and construed under the laws of the State of Florida, without regard to conflict of law principles. Any dispute shall be brought exclusively in the state or federal courts located in Miami-Dade County, Florida. You irrevocably consent to personal jurisdiction in such courts.

15. Electronic Signature
By checking the acceptance box and submitting this form, you acknowledge that you are providing an electronic signature that is legally binding under applicable federal and Florida law, including the Florida Electronic Signature Act and the U.S. E-SIGN Act, and that it has the same force and effect as a handwritten signature.

16. Entire Agreement; Severability
These terms constitute the entire agreement between you and Innova Trials regarding site registration and supersede any prior discussions or communications. If any provision is deemed unenforceable, the remaining provisions shall remain in full force and effect.`;

async function computeSHA256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export default function SiteDisclaimer() {
  const { user } = useStore();
  const [, setLocation] = useLocation();
  const [accepted, setAccepted] = useState(false);
  const [showError, setShowError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  if (!user || user.role !== "site") {
     return <div>Unauthorized</div>;
  }

  const handleSubmit = async () => {
    if (!accepted) {
      setShowError(true);
      return;
    }
    setSubmitting(true);
    try {
      const hash = await computeSHA256(TERMS_TEXT);
      await submitTermsAcceptance({
        siteId: user.siteId || user.id,
        registrantName: user.name,
        registrantEmail: user.email || "",
        siteName: user.name,
        termsVersion: TERMS_VERSION,
        termsEffectiveDate: TERMS_EFFECTIVE_DATE,
        termsTextSha256: hash,
      });
      toast({
        title: "Terms Accepted",
        description: `You agreed to Terms Version ${TERMS_VERSION} (Effective ${TERMS_EFFECTIVE_DATE}).`,
      });
      setLocation("/site/evaluation");
    } catch (err) {
      toast({ title: "Error", description: "Failed to record acceptance. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-muted/20">
        <Card className="max-w-3xl w-full border-t-4 border-t-amber-500 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-amber-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
               <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
            <CardTitle className="text-2xl font-heading">Innova Trials LLC – Site Registration Terms (Click-Wrap Agreement)</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">By submitting this registration, you represent that you are duly authorized to act on behalf of the Site and to legally bind the Site to these Terms.</p>
          </CardHeader>
          <CardContent className="space-y-4 text-justify text-muted-foreground leading-relaxed">
            <div className="bg-white p-5 rounded-md border text-sm space-y-5 max-h-[50vh] overflow-y-auto">
              <p className="font-semibold text-foreground text-center">
                DISCLAIMER, ACKNOWLEDGMENT AND SITE REGISTRATION TERMS<br />
                Innova Trials LLC – Click-Wrap Agreement
              </p>
              <p>
                By checking the box below and submitting this registration form, you ("Site", "Registrant", or "You") acknowledge, represent, warrant, and agree to the following terms in favor of Innova Trials LLC, a Florida limited liability company with principal place of business in Miami, Florida ("Innova Trials" or the "Company").
              </p>

              <div className="space-y-2">
                <h4 className="font-bold text-foreground">1. Voluntary Registration and No Obligation</h4>
                <p>Your submission of this registration form is voluntary and at your sole discretion. Submission does not create any partnership, joint venture, agency, fiduciary, certification, endorsement, or contractual relationship between you and Innova Trials. Innova Trials has no obligation to approve, onboard, engage, recommend, contract with, or otherwise work with you. Registration does not constitute approval, qualification, endorsement, or certification of your site.</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-foreground">2. Accuracy and Sole Responsibility</h4>
                <p>You represent and warrant that all information, data, documents, and materials submitted (the "Information") are true, accurate, complete, current, and not misleading. You are solely responsible for the legality, accuracy, and completeness of the Information. Innova Trials has no duty to verify or validate the Information and shall not be liable for any reliance placed upon it by third parties.</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-foreground">3. No Advice; No Reliance</h4>
                <p>Nothing in the registration process, communications, feedback, categorization, or evaluation constitutes legal, medical, regulatory, compliance, financial, or professional advice. You agree that you will not rely on any communication from Innova Trials as certification, regulatory approval, compliance validation, or suitability confirmation.</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-foreground">4. No Protected Health Information (PHI)</h4>
                <p>You agree not to submit any Protected Health Information (PHI) or individually identifiable patient information. You acknowledge that Innova Trials is not acting as a covered entity or business associate under HIPAA in connection with this registration. Any improper submission of PHI is solely your responsibility.</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-foreground">5. Use and Processing of Information</h4>
                <p>You authorize Innova Trials to store, review, analyze, process, and internally use the Information for evaluation, operational, research, compliance, business development, and network management purposes. Innova Trials may retain the Information in accordance with its internal policies and applicable law.</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-foreground">6. Right to Reject, Suspend, or Remove</h4>
                <p>Innova Trials may, at its sole discretion and without notice, reject, suspend, remove, or delete your registration or profile at any time, with or without cause, and without liability.</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-foreground">7. Regulatory Responsibility</h4>
                <p>You are solely responsible for compliance with all applicable local, state, federal, and international laws and regulations, including those relating to clinical research, healthcare operations, licensing, data protection, and ethics approvals. Innova Trials makes no representations or warranties regarding your compliance status.</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-foreground">8. Indemnification</h4>
                <p>You agree to indemnify, defend, and hold harmless Innova Trials, its members, managers, officers, employees, contractors, affiliates, and agents from and against any and all claims, liabilities, damages, penalties, fines, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or related to:</p>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>(a) inaccurate or misleading Information provided by you;</li>
                  <li>(b) your breach of these terms;</li>
                  <li>(c) your violation of applicable law;</li>
                  <li>(d) any claim by a third party related to your site operations.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-foreground">9. Disclaimer of Warranties</h4>
                <p>The registration platform and any related services are provided on an "AS IS" and "AS AVAILABLE" basis. To the fullest extent permitted under Florida law, Innova Trials disclaims all warranties, express or implied, including merchantability, fitness for a particular purpose, non-infringement, accuracy, or availability.</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-foreground">10. Limitation of Liability</h4>
                <p>To the maximum extent permitted by law, Innova Trials shall not be liable for any indirect, incidental, special, consequential, punitive, or exemplary damages, including loss of business opportunity, reputational harm, regulatory exposure, or lost profits.</p>
                <p>In all cases, Innova Trials' total aggregate liability arising out of or related to this registration shall not exceed USD 100.</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-foreground">11. Force Majeure</h4>
                <p>Innova Trials shall not be liable for any failure or delay resulting from causes beyond its reasonable control, including system failure, cyberattack, natural disaster, pandemic, governmental action, or third-party service interruption.</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-foreground">12. Class Action Waiver</h4>
                <p>You agree that any dispute shall be brought solely in your individual capacity and not as a plaintiff or class member in any purported class or representative proceeding.</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-foreground">13. Waiver of Jury Trial</h4>
                <p>You and Innova Trials knowingly and voluntarily waive any right to a trial by jury in any litigation arising out of or relating to this registration or these terms.</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-foreground">14. Governing Law and Exclusive Jurisdiction</h4>
                <p>These terms shall be governed by and construed under the laws of the State of Florida, without regard to conflict of law principles. Any dispute shall be brought exclusively in the state or federal courts located in Miami-Dade County, Florida. You irrevocably consent to personal jurisdiction in such courts.</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-foreground">15. Electronic Signature</h4>
                <p>By checking the acceptance box and submitting this form, you acknowledge that you are providing an electronic signature that is legally binding under applicable federal and Florida law, including the Florida Electronic Signature Act and the U.S. E-SIGN Act, and that it has the same force and effect as a handwritten signature.</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-foreground">16. Entire Agreement; Severability</h4>
                <p>These terms constitute the entire agreement between you and Innova Trials regarding site registration and supersede any prior discussions or communications. If any provision is deemed unenforceable, the remaining provisions shall remain in full force and effect.</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2 text-sm text-blue-800">
              <Shield className="h-4 w-4 flex-shrink-0" />
              <span>By submitting this form, you confirm that you have the legal authority to bind the Site.</span>
            </div>

            <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 mt-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="accept-terms"
                  checked={accepted}
                  onCheckedChange={(checked) => {
                    setAccepted(checked === true);
                    if (checked) setShowError(false);
                  }}
                  data-testid="checkbox-accept-terms"
                  className="mt-0.5"
                />
                <label
                  htmlFor="accept-terms"
                  className="text-sm font-semibold leading-relaxed cursor-pointer select-none text-foreground"
                >
                  I have read, understood, and agree to the Innova Trials LLC Disclaimer, Acknowledgment, and Site Registration Terms.
                </label>
              </div>
              {showError && (
                <p className="text-destructive text-sm font-medium mt-2 ml-7" data-testid="text-terms-error">
                  You must accept the terms before continuing.
                </p>
              )}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Terms Version {TERMS_VERSION} – Effective {TERMS_EFFECTIVE_DATE}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between gap-4">
            <Button variant="outline" onClick={() => setLocation("/")} data-testid="button-decline">Decline</Button>
            <Button
              onClick={handleSubmit}
              className="bg-primary hover:bg-primary/90"
              disabled={submitting}
              data-testid="button-agree-continue"
            >
              {submitting ? "Processing..." : "I Agree & Continue"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
