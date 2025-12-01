import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function Success() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <Card className="bg-[#0a0a0a] border-[#c8ff00]/30 max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="w-16 h-16 text-[#c8ff00]" />
          </div>
          <CardTitle className="text-3xl font-bold text-[#c8ff00]">
            Pre-Order Confirmed!
          </CardTitle>
          <CardDescription className="text-gray-400 text-lg">
            Thank you for your pre-order
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-300 text-center">
            Your pre-order has been successfully submitted. We'll send you a
            confirmation email shortly with all the details.
          </p>
          <p className="text-gray-300 text-center">
            Get ready to experience the legendary NEON energy boost!
          </p>
          <Button
            onClick={() => setLocation("/")}
            className="w-full bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold"
          >
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
