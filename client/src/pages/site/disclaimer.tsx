import { useState } from "react";
import { useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle } from "lucide-react";

export default function SiteDisclaimer() {
  const { user } = useStore();
  const [, setLocation] = useLocation();
  const [accepted, setAccepted] = useState(false);

  if (!user || user.role !== "site") {
     return <div>Unauthorized</div>;
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-muted/20">
        <Card className="max-w-3xl w-full border-t-4 border-t-amber-500 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-amber-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
               <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
            <CardTitle className="text-2xl font-heading">DISCLAIMER, ACKNOWLEDGMENT AND ACCEPTANCE OF TERMS</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">(Site Registration – Click-Wrap Agreement)</p>
          </CardHeader>
          <CardContent className="space-y-4 text-justify text-muted-foreground leading-relaxed">
            <p className="text-sm">
              By checking the box below and submitting this registration form, you ("Site", "Registrant" or "You") expressly acknowledge, represent, warrant, and agree to the following terms and conditions in favor of Innova Trials LLC, a limited liability company duly organized and existing under the laws of the State of Florida, United States of America, with its principal place of business in Miami, Florida ("Innova Trials" or the "Company"):
            </p>
            <div className="bg-white p-5 rounded-md border text-sm space-y-5 max-h-[50vh] overflow-y-auto">
              <div className="space-y-2">
                <h4 className="font-bold text-foreground">1. Voluntary Registration</h4>
                <p>
                  You acknowledge that your registration as a clinical research site is voluntary and initiated solely at your own discretion. You understand that submission of this form does not create any obligation for Innova Trials to accept, engage, contract with, or otherwise work with you.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-foreground">2. Accuracy, Completeness, and Responsibility for Information</h4>
                <p>
                  You represent and warrant that all information, data, documents, answers, and materials provided through this registration process (the "Information") are true, accurate, complete, current, and not misleading.
                </p>
                <p>
                  You acknowledge and agree that you are solely responsible for the accuracy, legality, and completeness of the Information submitted. Innova Trials assumes no responsibility for verifying, validating, or auditing the Information provided by you.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-foreground">3. No Advice, No Reliance</h4>
                <p>
                  You expressly acknowledge that Innova Trials does not provide medical, legal, regulatory, financial, compliance, or professional advice through this registration process.
                </p>
                <p>
                  Nothing contained in the questions, forms, communications, or any subsequent interaction shall be construed as advice, guidance, endorsement, certification, or approval of your site, personnel, facilities, or capabilities.
                </p>
                <p>
                  You agree that you shall not rely on any output, feedback, classification, or response from Innova Trials for decision-making, regulatory submissions, or operational actions.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-foreground">4. No Contractual Relationship</h4>
                <p>
                  Submission of this registration form does not create any contractual, fiduciary, agency, partnership, joint venture, or professional relationship between you and Innova Trials.
                </p>
                <p>
                  Any future engagement, if any, shall be subject to a separate written agreement duly executed by authorized representatives of both parties.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-foreground">5. Use of Information / No Warranties</h4>
                <p>
                  You authorize Innova Trials to review, store, process, analyze, and internally use the Information for evaluation, operational, research, or business purposes.
                </p>
                <p>
                  All use of the Information is provided on an "AS IS" and "AS AVAILABLE" basis, without warranties of any kind, express or implied, including but not limited to warranties of accuracy, fitness for a particular purpose, regulatory acceptance, or commercial suitability.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-foreground">6. Limitation of Liability</h4>
                <p>
                  To the maximum extent permitted by applicable law, you agree that Innova Trials, its affiliates, members, managers, officers, employees, contractors, and agents shall not be liable for any direct, indirect, incidental, consequential, special, punitive, or exemplary damages, including but not limited to loss of business opportunities, loss of data, regulatory exposure, reputational harm, or third-party claims, arising out of or related to:
                </p>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>your registration,</li>
                  <li>the Information you submit,</li>
                  <li>any use or non-use of such Information, or</li>
                  <li>any decision made based on the registration process.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-foreground">7. Indemnification</h4>
                <p>
                  You agree to fully indemnify, defend, and hold harmless Innova Trials from and against any and all claims, damages, liabilities, losses, penalties, fines, costs, and expenses (including reasonable attorneys' fees) arising from:
                </p>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>inaccurate or misleading Information provided by you,</li>
                  <li>any breach of this Disclaimer, or</li>
                  <li>any violation of applicable laws, regulations, or third-party rights related to your activities.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-foreground">8. Regulatory Responsibility</h4>
                <p>
                  You acknowledge that you are solely responsible for compliance with all applicable local, state, federal, and international laws and regulations, including but not limited to those related to clinical research, healthcare, data protection, ethics committees, and regulatory authorities.
                </p>
                <p>
                  Innova Trials makes no representations or guarantees regarding regulatory compliance or approval of your site.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-foreground">9. Governing Law and Jurisdiction</h4>
                <p>
                  This Disclaimer shall be governed by and construed in accordance with the laws of the State of Florida, without regard to conflict of law principles.
                </p>
                <p>
                  You irrevocably agree that any dispute arising out of or related to this Disclaimer or your registration shall be exclusively submitted to the state or federal courts located in Miami-Dade County, Florida, and you consent to personal jurisdiction therein.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-foreground">10. Electronic Acceptance and Binding Effect</h4>
                <p>
                  You acknowledge that checking the acceptance box and submitting this form constitutes an electronic signature and legally binding agreement, equivalent to a handwritten signature, under applicable U.S. and Florida law.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 pt-4 border-t">
              <Checkbox
                id="accept-terms"
                checked={accepted}
                onCheckedChange={(checked) => setAccepted(checked === true)}
                data-testid="checkbox-accept-terms"
              />
              <label
                htmlFor="accept-terms"
                className="text-sm font-medium leading-relaxed cursor-pointer select-none text-foreground"
              >
                I have read, understood, and agree to the Disclaimer, Acknowledgment and Acceptance of Terms of Innova Trials LLC.
              </label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between gap-4">
            <Button variant="outline" onClick={() => setLocation("/")} data-testid="button-decline">Decline</Button>
            <Button
              onClick={() => setLocation("/site/evaluation")}
              className="bg-primary hover:bg-primary/90"
              disabled={!accepted}
              data-testid="button-agree-continue"
            >
              I Agree & Continue
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
