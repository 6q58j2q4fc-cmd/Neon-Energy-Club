import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const { data: preorders, isLoading } = trpc.preorder.list.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const updateStatus = trpc.preorder.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Order status updated successfully");
      utils.preorder.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#c8ff00]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <Card className="bg-[#0a0a0a] border-[#c8ff00]/30 max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-[#c8ff00]">
              Authentication Required
            </CardTitle>
            <CardDescription className="text-gray-400">
              Please log in to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="w-full bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold"
            >
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <Card className="bg-[#0a0a0a] border-[#c8ff00]/30 max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-[#c8ff00]">
              Access Denied
            </CardTitle>
            <CardDescription className="text-gray-400">
              You do not have permission to access this page
            </CardDescription>
          </CardHeader>
          <CardContent>
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-[#c8ff00]/20 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#c8ff00]">NEON Admin</h1>
          <Button
            variant="outline"
            className="border-[#c8ff00] text-[#c8ff00] hover:bg-[#c8ff00] hover:text-black"
            onClick={() => setLocation("/")}
          >
            Back to Home
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card className="bg-[#0a0a0a] border-[#c8ff00]/30">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-[#c8ff00]">
              Pre-Orders Dashboard
            </CardTitle>
            <CardDescription className="text-gray-400">
              Manage all NEON energy drink pre-orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#c8ff00]" />
              </div>
            ) : !preorders || preorders.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No pre-orders yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#c8ff00]/20 hover:bg-transparent">
                      <TableHead className="text-[#c8ff00]">ID</TableHead>
                      <TableHead className="text-[#c8ff00]">Name</TableHead>
                      <TableHead className="text-[#c8ff00]">Email</TableHead>
                      <TableHead className="text-[#c8ff00]">Phone</TableHead>
                      <TableHead className="text-[#c8ff00]">Quantity</TableHead>
                      <TableHead className="text-[#c8ff00]">Address</TableHead>
                      <TableHead className="text-[#c8ff00]">Status</TableHead>
                      <TableHead className="text-[#c8ff00]">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preorders.map((order) => (
                      <TableRow
                        key={order.id}
                        className="border-[#c8ff00]/10 hover:bg-[#c8ff00]/5"
                      >
                        <TableCell className="text-white">{order.id}</TableCell>
                        <TableCell className="text-white">{order.name}</TableCell>
                        <TableCell className="text-white">{order.email}</TableCell>
                        <TableCell className="text-white">
                          {order.phone || "—"}
                        </TableCell>
                        <TableCell className="text-white">
                          {order.quantity} cases
                        </TableCell>
                        <TableCell className="text-white text-sm">
                          {order.address}, {order.city}, {order.state}{" "}
                          {order.postalCode}, {order.country}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(value) =>
                              updateStatus.mutate({
                                id: order.id,
                                status: value as
                                  | "pending"
                                  | "confirmed"
                                  | "shipped"
                                  | "delivered"
                                  | "cancelled",
                              })
                            }
                          >
                            <SelectTrigger className="bg-black border-[#c8ff00]/30 text-white w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-black border-[#c8ff00]/30">
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-white text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
