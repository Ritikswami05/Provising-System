import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import {
  Order,
  OrderItem,
  OrderStatus,
  ORDER_STATUSES,
  SUPPLIERS // Import SUPPLIERS
} from "@shared/schema";
import { Loader2, Search, Package, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

// Define interfaces for order data
interface OrderWithItems extends Order {
  items: OrderItem[]; // Ensure items is always expected, even if empty
}

// Helper function to safely format date
const formatDate = (dateInput: string | Date | undefined | null): string => {
  if (!dateInput) return "N/A";
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return date.toLocaleString();
  } catch (e) {
    return "Invalid Date";
  }
};

// Helper function to safely format currency
const formatCurrency = (amount: string | number | undefined | null): string => {
  if (amount === undefined || amount === null) return "$NaN";
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return "$NaN";
  return `$${numericAmount.toFixed(2)}`;
}

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Redirect if user is not admin
    if (!authLoading && (!user || !user.isAdmin)) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  // Fetch all orders
  const {
    data: orders,
    isLoading: ordersLoading,
    error: ordersError
  } = useQuery<Order[]>({
    queryKey: ['/api/admin/orders'],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user?.isAdmin,
    // Add placeholder data to avoid undefined checks later
    placeholderData: [],
  });

  // Fetch order details when an order is selected
  const {
    data: selectedOrderDetails,
    isLoading: orderDetailsLoading,
    error: orderDetailsError, // Capture error state
  } = useQuery<OrderWithItems>({
    // CORRECTED QUERY KEY: Use the full URL path including the ID
    queryKey: [`/api/admin/orders/${selectedOrderId}`],
    queryFn: getQueryFn({ on401: "throw" }),
    // The query will only run when selectedOrderId is a truthy value (not null or 0)
    enabled: !!selectedOrderId && !!user?.isAdmin,
  });

  // Mutation to update order status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number, status: OrderStatus }) => {
      const res = await apiRequest("PATCH", `/api/admin/orders/${orderId}/status`, { status });
      return await res.json();
    },
    onSuccess: (updatedOrder, variables) => { // Access updated order data
      toast({
        title: "Order updated",
        description: `Order #${variables.orderId} status changed to ${variables.status}.`,
      });

      // Update the cache for the individual order details query
      queryClient.setQueryData([`/api/admin/orders/${variables.orderId}`], updatedOrder);

      // Update the cache for the orders list query
      queryClient.setQueryData(['/api/admin/orders'], (oldData: Order[] | undefined) =>
          oldData?.map(order =>
              order.id === variables.orderId ? { ...order, status: variables.status } : order
          ) ?? []
      );
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Filter orders based on search term
  const filteredOrders = orders?.filter(order =>
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm)
  ) ?? []; // Ensure it's always an array

  // Handler for updating order status
  const handleStatusChange = (orderId: number, status: string) => {
    if (!ORDER_STATUSES.includes(status as OrderStatus)) {
      console.error("Invalid status selected:", status);
      return;
    }
    updateStatusMutation.mutate({
      orderId,
      status: status as OrderStatus
    });
  };

  // Return early if not admin or still loading auth
  if (authLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  if (!user?.isAdmin) {
    // This check might be redundant due to useEffect, but good for clarity
    return (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-lg">Access Denied. Redirecting...</p>
        </div>
    );
  }

  return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders list section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Orders</span>
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span className="text-sm font-normal">
                    {orders?.length ?? 0} total
                  </span>
                  </div>
                </CardTitle>
                <CardDescription>Manage customer orders</CardDescription>
                <div className="relative">
                  <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                      placeholder="Search orders..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : ordersError ? (
                    <div className="text-center p-4 text-destructive">
                      Failed to load orders: {ordersError.message}
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center p-4 text-muted-foreground">
                      No orders match your search.
                    </div>
                ) : (
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                      {filteredOrders.map((order) => (
                          <div
                              key={order.id}
                              className={`p-3 rounded-md border cursor-pointer transition-colors ${
                                  selectedOrderId === order.id
                                      ? "bg-primary/10 border-primary"
                                      : "hover:bg-muted"
                              }`}
                              onClick={() => setSelectedOrderId(order.id)}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Order #{order.id}</span>
                              <Badge variant={getStatusVariant(order.status)}>
                                {order.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1 truncate">
                              {order.customerName} ({order.customerEmail})
                            </div>
                            <div className="text-sm mt-1 flex justify-between">
                              <span>{formatCurrency(order.totalAmount)}</span>
                              <span className="text-muted-foreground text-xs">
                          {formatDate(order.createdAt)}
                        </span>
                            </div>
                          </div>
                      ))}
                    </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order details section */}
          <div className="lg:col-span-2">
            <Card className="min-h-[600px]"> {/* Add min height for consistency */}
              <CardHeader>
                <CardTitle>
                  {selectedOrderId
                      ? `Order #${selectedOrderId} Details`
                      : "Select an order"}
                </CardTitle>
                {selectedOrderDetails && !orderDetailsLoading && (
                    <CardDescription>
                      Placed on {formatDate(selectedOrderDetails.createdAt)}
                    </CardDescription>
                )}
                {!selectedOrderId && (
                    <CardDescription>Select an order from the list to view details.</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {!selectedOrderId ? (
                    <div className="text-center p-12 text-muted-foreground">
                      Please select an order from the list on the left.
                    </div>
                ) : orderDetailsLoading ? (
                    <div className="flex justify-center items-center p-12 h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-2">Loading order details...</span>
                    </div>
                ) : orderDetailsError ? (
                    <div className="text-center p-12 text-destructive">
                      Failed to load order details: {orderDetailsError.message}
                    </div>
                ) : !selectedOrderDetails ? (
                    <div className="text-center p-12 text-muted-foreground">
                      Order details not found.
                    </div>
                ) : (
                    <div className="space-y-6">
                      {/* Customer information */}
                      <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                          <h3 className="text-base font-semibold mb-2 border-b pb-1">Customer Information</h3>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="font-medium text-muted-foreground w-28 inline-block">Name:</span> {selectedOrderDetails.customerName}
                            </p>
                            <p>
                              <span className="font-medium text-muted-foreground w-28 inline-block">Email:</span> {selectedOrderDetails.customerEmail}
                            </p>
                            <p>
                              <span className="font-medium text-muted-foreground w-28 inline-block">Shipping Addr:</span>{" "}
                              {selectedOrderDetails.shippingAddress}
                            </p>
                            <p>
                              <span className="font-medium text-muted-foreground w-28 inline-block">Payment Method:</span>{" "}
                              {selectedOrderDetails.paymentMethod}
                            </p>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-base font-semibold mb-2 border-b pb-1">Order Status</h3>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-muted-foreground w-24 inline-block">Current:</span>
                              <Badge
                                  variant={getStatusVariant(selectedOrderDetails.status)}
                                  className="text-sm py-1 px-2"
                              >
                                {selectedOrderDetails.status}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-muted-foreground w-24 inline-block">Change to:</span>
                              <Select
                                  value={selectedOrderDetails.status} // Controlled component
                                  onValueChange={(value) =>
                                      handleStatusChange(selectedOrderDetails.id, value)
                                  }
                                  disabled={updateStatusMutation.isPending}
                              >
                                <SelectTrigger className="w-[180px] h-9">
                                  <SelectValue placeholder="Change status" />
                                </SelectTrigger>
                                <SelectContent>
                                  {ORDER_STATUSES.map((status) => (
                                      <SelectItem key={status} value={status}>
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                      </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {updateStatusMutation.isPending && (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order items */}
                      <div>
                        <h3 className="text-base font-semibold mb-2 border-b pb-1">Order Items</h3>
                        {selectedOrderDetails.items && selectedOrderDetails.items.length > 0 ? (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Product</TableHead>
                                  <TableHead className="text-center">Qty</TableHead>
                                  <TableHead className="text-right">Price</TableHead>
                                  <TableHead className="text-right">Supplier</TableHead>
                                  <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {selectedOrderDetails.items.map((item) => (
                                    <TableRow key={item.id}>
                                      <TableCell className="font-medium">
                                        {item.productName}
                                      </TableCell>
                                      <TableCell className="text-center">
                                        {item.quantity}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {formatCurrency(item.price)}
                                      </TableCell>
                                      <TableCell className="text-right text-xs text-muted-foreground">
                                        {/* Now SUPPLIERS is available */}
                                        {item.supplierId ? (SUPPLIERS.find(s => s.id === item.supplierId)?.name ?? `ID: ${item.supplierId}`) : 'N/A'}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {formatCurrency(parseFloat(item.price) * item.quantity)}
                                      </TableCell>
                                    </TableRow>
                                ))}
                              </TableBody>
                              <TableCaption className="mt-4">
                                <div className="flex justify-end">
                                  <div className="w-64 space-y-2 border-t pt-2">
                                    {/* Add subtotal/shipping if needed, currently totalAmount includes everything */}
                                    {/* <div className="flex justify-between text-sm">
                                <span>Subtotal:</span>
                                <span>{formatCurrency(subtotal)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Shipping:</span>
                                <span>{formatCurrency(shipping)}</span>
                              </div> */}
                                    <div className="flex justify-between font-bold">
                                      <span>Total:</span>
                                      <span>{formatCurrency(selectedOrderDetails.totalAmount)}</span>
                                    </div>
                                  </div>
                                </div>
                              </TableCaption>
                            </Table>
                        ) : (
                            <p className="text-sm text-muted-foreground py-4">No items found for this order.</p>
                        )}
                      </div>
                    </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
}

// Helper function to determine badge variant based on status
function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status?.toLowerCase()) { // Add null check and lowercase
    case "pending":
      return "secondary";
    case "processing":
      return "default";
    case "shipped":
      return "outline";
    case "delivered":
      return "default"; // Consider a different color like green if theme supports
    case "cancelled":
      return "destructive";
    default:
      return "secondary"; // Default for unknown or null status
  }
}
