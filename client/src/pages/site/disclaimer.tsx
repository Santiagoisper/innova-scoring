import { useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function SiteDisclaimer() {
  const { user } = useStore();
  const [, setLocation] = useLocation();

  if (!user || user.role !== "site") {
     return <div>Unauthorized</div>;
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-muted/20">
        <Card className="max-w-2xl w-full border-t-4 border-t-amber-500 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-amber-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
               <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
            <CardTitle className="text-2xl font-heading">Confidentiality & Consent</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-justify text-muted-foreground leading-relaxed">
            <p>
              Before proceeding with the site evaluation questionnaire, please review the following terms regarding the use and protection of your data.
            </p>
            <div className="bg-white p-4 rounded-md border text-sm space-y-3">
              <h4 className="font-bold text-foreground">1. Data Usage</h4>
              <p>
                The information provided in this evaluation will be used solely for the purpose of assessing your site's suitability for upcoming clinical trials managed by Innova Trials.
              </p>
              
              <h4 className="font-bold text-foreground">2. Confidentiality</h4>
              <p>
                We strictly protect your proprietary information. No data will be shared with third parties without your explicit written consent, except as required by regulatory authorities.
              </p>

              <h4 className="font-bold text-foreground">3. Consent</h4>
              <p>
                By clicking "I Agree", you consent to the collection, processing, and storage of the data provided in the subsequent questionnaire. You certify that the information provided is accurate and truthful to the best of your knowledge.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between gap-4">
            <Button variant="outline" onClick={() => setLocation("/")}>Decline</Button>
            <Button onClick={() => setLocation("/site/evaluation")} className="bg-primary hover:bg-primary/90">
              I Agree & Continue
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
