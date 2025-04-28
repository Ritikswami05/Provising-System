import { useState, useRef, ChangeEvent, FormEvent } from "react"; // Added FormEvent
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FaStar, FaInfo, FaTruck, FaUpload, FaFile, FaCheck } from "react-icons/fa";
import { SUPPLIERS, CheckoutFormData, Supplier, InsertOrder, InsertOrderItem } from "@shared/schema"; // Import necessary types
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation, useQueryClient } from "@tanstack/react-query"; // Import useMutation and queryClient
import { apiRequest } from "@/lib/queryClient"; // Import apiRequest
import { useAuth } from "@/hooks/use-auth"; // Import useAuth
import { Loader2 } from "lucide-react"; // Import Loader

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { cart, updateSupplier, clearCart } = useCart();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { user, isLoading: isAuthLoading } = useAuth(); // Get user and auth loading state
  const queryClient = useQueryClient(); // Get query client instance
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    paymentMethod: "credit_card",
    documentType: undefined,
    documentName: undefined
  });

  // Format price to display 2 decimal places
  const formatPrice = (price: string | number) => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numericPrice.toFixed(2);
  };

  // Calculate total with shipping
  const calculateTotalWithShipping = () => {
    let total = cart.total;
    const selectedSupplierIds = new Set<number>();
    let shippingTotal = 0;

    cart.items.forEach(item => {
      if (item.selectedSupplierId && !selectedSupplierIds.has(item.selectedSupplierId)) {
        selectedSupplierIds.add(item.selectedSupplierId);
        const supplier = SUPPLIERS.find(s => s.id === item.selectedSupplierId);
        if (supplier) {
          shippingTotal += supplier.shippingFee;
        }
      }
    });

    return {
      subtotal: total,
      shipping: shippingTotal,
      total: total + shippingTotal
    };
  };

  const totals = calculateTotalWithShipping();

  // Define the mutation for creating an order
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: InsertOrder & { items: InsertOrderItem[] }) => {
      // We only need InsertOrder fields + items for the request body
      // The backend route /api/orders will handle creating both Order and OrderItems
      const res = await apiRequest("POST", "/api/orders", orderData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Order placed successfully!",
        description: selectedFile
            ? "Your order and document have been received and are being processed."
            : "Your order has been received and is being processed.",
      });
      clearCart();
      // Invalidate admin orders query so the dashboard updates
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Order placement failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSupplierChange = (itemId: number, supplierId: number) => {
    updateSupplier(itemId, supplierId);
  };

  const handleFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Simple size check (e.g., 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      setFormData(prev => ({
        ...prev,
        documentName: file.name
      }));

      toast({
        title: "Document uploaded",
        description: `${file.name} has been attached to your order.`,
      });
    }
  };

  const handleDocumentTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      documentType: value as "id_verification" | "proof_of_address" | "other"
    }));
  };

  const handleSubmit = (e: FormEvent) => { // Use FormEvent
    e.preventDefault();

    if (isAuthLoading || !user) {
      toast({
        title: "Authentication Error",
        description: "Please wait or log in again to place an order.",
        variant: "destructive",
      });
      return;
    }

    // Check if all items have suppliers selected
    const hasUnselectedSuppliers = cart.items.some(item => !item.selectedSupplierId);
    if (hasUnselectedSuppliers) {
      toast({
        title: "Please select suppliers",
        description: "Each item must have a supplier selected before checkout.",
        variant: "destructive"
      });
      return;
    }

    // Check if document type is selected but no file is uploaded
    if (formData.documentType && !selectedFile) {
      toast({
        title: "Document required",
        description: "Please upload a document or deselect the document type.",
        variant: "destructive"
      });
      return;
    }

    // Prepare order data
    const orderItemsPayload: InsertOrderItem[] = cart.items.map(item => ({
      // orderId will be set by the backend
      productId: item.productId,
      productName: item.name, // Add productName
      quantity: item.quantity,
      price: typeof item.price === 'string' ? item.price : item.price.toString(),
      supplierId: item.selectedSupplierId!, // We've checked above that it exists
      // orderId is omitted as per schema definition
    }));

    const orderPayload: InsertOrder & { items: InsertOrderItem[] } = {
      userId: user.id, // Include userId from the authenticated user
      totalAmount: totals.total.toFixed(2),
      customerName: `${formData.firstName} ${formData.lastName}`,
      customerEmail: formData.email,
      shippingAddress: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
      paymentMethod: formData.paymentMethod,
      // status defaults to 'pending' on the backend
      items: orderItemsPayload, // Send items within the main payload
    };

    // TODO: Handle file upload properly here if needed
    // For now, we just log if a file was selected
    if (selectedFile) {
      console.log("Document selected for upload (implement actual upload logic):", {
        name: selectedFile.name,
        type: selectedFile.type,
        documentType: formData.documentType
      });
      // In a real app:
      // 1. Upload the file to storage (e.g., S3) BEFORE calling createOrderMutation
      // 2. Get the URL or identifier of the uploaded file
      // 3. Add the file identifier/URL to the orderPayload before sending
    }

    // Call the mutation
    createOrderMutation.mutate(orderPayload);
  };

  // Component to render supplier rating stars
  const SupplierRating = ({ rating }: { rating: number }) => {
    return (
        <div className="flex items-center">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
                <FaStar
                    key={i}
                    className={i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}
                />
            ))}
          </div>
          <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
        </div>
    );
  };

  if (cart.items.length === 0 && !createOrderMutation.isSuccess) { // Prevent showing empty cart briefly after success
    return (
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="mb-6">You don't have any items in your cart to checkout.</p>
          <Button onClick={() => setLocation("/")}>Continue Shopping</Button>
        </div>
    );
  }

  return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary and Supplier Selection */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review your items and select suppliers</CardDescription>
              </CardHeader>
              <CardContent>
                {cart.items.map((item) => (
                    <div key={item.id} className="mb-6 pb-6 border-b last:border-0">
                      <div className="flex flex-col sm:flex-row">
                        <div className="w-full sm:w-2/5 flex items-start">
                          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mr-4">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover object-center"
                            />
                          </div>
                          <div>
                            <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
                            <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                            <p className="mt-1 text-sm font-medium text-gray-900">
                              ${formatPrice(item.price)} each
                            </p>
                          </div>
                        </div>

                        <div className="w-full sm:w-3/5 mt-4 sm:mt-0">
                          <Label htmlFor={`supplier-${item.id}`} className="font-medium mb-2 block">
                            Select a supplier
                          </Label>
                          <Select
                              value={item.selectedSupplierId?.toString() || ""}
                              onValueChange={(value) => handleSupplierChange(item.id, parseInt(value))}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a supplier" />
                            </SelectTrigger>
                            <SelectContent>
                              {SUPPLIERS.map((supplier) => (
                                  <SelectItem
                                      key={supplier.id}
                                      value={supplier.id.toString()}
                                      className="py-2 px-3"
                                  >
                                    <div className="flex flex-col">
                                      <div className="flex justify-between mb-1">
                                        <span className="font-medium">{supplier.name}</span>
                                        <span className="text-green-600 font-medium">
                                    +${formatPrice(supplier.shippingFee)} shipping
                                  </span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <SupplierRating rating={supplier.rating} />
                                        <span className="text-gray-500">{supplier.deliveryTime}</span>
                                      </div>
                                    </div>
                                  </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {item.selectedSupplierId && (
                              <div className="mt-2 bg-blue-50 rounded-md p-2 text-sm flex items-start">
                                <FaInfo className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-blue-800">
                              <span className="font-medium">
                                {SUPPLIERS.find(s => s.id === item.selectedSupplierId)?.name}
                              </span> will deliver in {" "}
                                    <span className="font-medium">
                                {SUPPLIERS.find(s => s.id === item.selectedSupplierId)?.deliveryTime}
                              </span>
                                  </p>
                                </div>
                              </div>
                          )}

                          {!item.selectedSupplierId && (
                              <p className="text-red-500 text-sm mt-2">Please select a supplier for this item</p>
                          )}
                        </div>
                      </div>
                    </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Checkout Form and Payment */}
          <div>
            <form onSubmit={handleSubmit}>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          disabled={createOrderMutation.isPending}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          disabled={createOrderMutation.isPending}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={createOrderMutation.isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        disabled={createOrderMutation.isPending}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          disabled={createOrderMutation.isPending}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          required
                          disabled={createOrderMutation.isPending}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                        disabled={createOrderMutation.isPending}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Document Upload (Optional)</CardTitle>
                  <CardDescription>
                    Upload any necessary documents for verification or delivery
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="documentType">Document Type</Label>
                    <Select
                        value={formData.documentType}
                        onValueChange={handleDocumentTypeChange}
                        disabled={createOrderMutation.isPending}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="id_verification">ID Verification</SelectItem>
                        <SelectItem value="proof_of_address">Proof of Address</SelectItem>
                        <SelectItem value="other">Other Document</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 transition-colors ${createOrderMutation.isPending ? 'cursor-not-allowed bg-gray-100' : 'cursor-pointer hover:bg-gray-50'}`} onClick={!createOrderMutation.isPending ? handleFileClick : undefined}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        disabled={createOrderMutation.isPending}
                    />

                    {selectedFile ? (
                        <div className="flex flex-col items-center">
                          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                            <FaCheck className="h-6 w-6 text-green-600" />
                          </div>
                          <p className="text-sm font-medium">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2"
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!createOrderMutation.isPending) {
                                  setSelectedFile(null);
                                  setFormData(prev => ({ ...prev, documentName: undefined }));
                                }
                              }}
                              disabled={createOrderMutation.isPending}
                          >
                            Remove
                          </Button>
                        </div>
                    ) : (
                        <>
                          <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-2 ${createOrderMutation.isPending ? 'bg-gray-200' : 'bg-primary-50'}`}>
                            <FaUpload className={`h-5 w-5 ${createOrderMutation.isPending ? 'text-gray-400' : 'text-primary'}`} />
                          </div>
                          <p className={`text-sm font-medium ${createOrderMutation.isPending ? 'text-gray-500' : ''}`}>Click to upload a document</p>
                          <p className="text-xs text-gray-500 mt-1">
                            PDF, JPG, PNG, DOC up to 10MB
                          </p>
                        </>
                    )}
                  </div>

                  {formData.documentType && !selectedFile && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          Please upload a document for the selected document type
                        </AlertDescription>
                      </Alert>
                  )}
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                      defaultValue="credit_card"
                      value={formData.paymentMethod}
                      onValueChange={(value) => setFormData({
                        ...formData,
                        paymentMethod: value as "credit_card" | "cash" | "bank_transfer" // Updated type assertion
                      })}
                      disabled={createOrderMutation.isPending}
                  >
                    <div className="flex items-center space-x-2 mb-2"> { /* Credit Card */ }
                      <RadioGroupItem value="credit_card" id="credit_card" />
                      <Label htmlFor="credit_card">Credit Card</Label>
                    </div>
                    <div className="flex items-center space-x-2 mb-2"> { /* Cash */ }
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash">Cash</Label>
                    </div>
                    <div className="flex items-center space-x-2"> { /* Bank Transfer */ }
                      <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                      <Label htmlFor="bank_transfer">Bank Transfer</Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Totals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${formatPrice(totals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                    <span className="flex items-center">
                      <FaTruck className="mr-1 text-gray-500" />
                      Shipping
                    </span>
                      <span>${formatPrice(totals.shipping)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium text-lg">
                      <span>Total</span>
                      <span>${formatPrice(totals.total)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary-600"
                      disabled={createOrderMutation.isPending || isAuthLoading || !user}
                  >
                    {createOrderMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Placing Order...
                        </>
                    ) : (
                        "Place Order"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </div>
        </div>
      </div>
  );
}
