import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import axios from "axios";
import StripeCheckout from "react-stripe-checkout";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Head from "next/head";
import Image from "next/image";
import { useUser } from "@/context/UserContext";

// Stripe publishable key - Replace with your actual key in production
const STRIPE_KEY = "pk_test_51JADctSH9F4D0tUvEdlLn8cR0BcexzCBNOcA2emApeGxejaa5OPIfeXB1FvMKbomDaHsyP5N6Agnc9ZIMTp0oWkn000QjmwqVH";

// Payment Form Component
const PaymentForm = ({ orderId, total }) => {
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useUser();
  const router = useRouter();

  // Handle successful token generation
  const handleToken = async (token) => {
    setProcessing(true);

    try {
      // Process payment through our API
      const response = await axios.post("/api/payments", {
        token: token.id,
        orderId
      });
      console.log('response is', response);

      // Payment successful
      setSucceeded(true);
      setError(null);
      setProcessing(false);

      // Redirect to success page or order history
      // setTimeout(() => {
      //   router.push("/orders");
      // }, 2000);
    } catch (err) {
      console.log(err);
      setError(`Payment processing failed: ${err.response?.data?.error || 'Please try again'}`);
      setProcessing(false);
    }
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="p-4 border rounded-md bg-white">
        <h3 className="text-lg font-medium mb-2">Payment Information</h3>

        {!processing && !succeeded && (
          <StripeCheckout
            token={handleToken}
            stripeKey={STRIPE_KEY}
            amount={totalWithShipping * 100} // Amount in paise
            name="Amazon Clone"
            description={`Order #${orderId}`}
            currency="INR"
            email={currentUser?.email}
            billingAddress
            shippingAddress
            zipCode
            allowRememberMe
            className="w-full"
          >
            <button
              className="button w-full"
              disabled={processing}
            >
              {`Pay ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(totalWithShipping)}`}
            </button>
          </StripeCheckout>
        )}

        {processing && (
          <div className="text-center p-4">
            <p>Processing your payment...</p>
          </div>
        )}
      </div>

      {error && <div className="text-red-500">{error}</div>}

      {succeeded && (
        <div className="text-green-500 text-center p-2 bg-green-50 rounded">
          Payment successful! Redirecting to your orders...
        </div>
      )}
    </div>
  );
};

// Main Order Confirmation Page
const ConfirmOrderPage = () => {
  const router = useRouter();
  const { orderId } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shippingFee, setShippingFee] = useState(0);
  const { currentUser } = useUser();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      try {
        // Fetch order details
        const { data } = await axios.get(`/api/orders/${orderId}`);
        console.log('response is', data, typeof data.price)

        const total = data.products.reduce((acc, product) => {
          return acc + product.product.price * product.quantity;
        }, 0);

        setOrder({
          ...data,
          price: total
        });

        // Calculate shipping fee if total is less than 499
        if (total < 499) {
          setShippingFee(40); // 40 Rs shipping fee
        }

        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <Header />
        <main className="max-w-screen-lg mx-auto p-10">
          <div className="flex justify-center items-center h-64">
            <p>Loading order details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <Header />
        <main className="max-w-screen-lg mx-auto p-10">
          <div className="flex justify-center items-center h-64">
            <p>Order not found. Please check your order ID.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const totalWithShipping = order.price + shippingFee;

  return (
    <div className="bg-gray-100 min-h-screen">
      <Head>
        <title>Confirm Order | Amazon Clone</title>
      </Head>

      <Header />

      <main className="max-w-screen-lg mx-auto p-10">
        <div className="bg-white p-5 shadow-md rounded-md mb-5">
          <h1 className="text-2xl border-b pb-4 mb-4">Review Your Order</h1>

          <div className="mb-5">
            <h2 className="text-xl mb-2">Order Summary</h2>
            <p className="text-sm text-gray-500">Order ID: {orderId}</p>
          </div>

          {/* Order Items */}
          <div className="border-t border-b py-4 space-y-4">
            {order.products?.map((item, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="relative h-20 w-20">
                  <Image
                    src={item.product.image || "/images/placeholder.png"}
                    layout="fill"
                    objectFit="contain"
                    alt={item.product.title}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.product.title}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  <p className="text-sm font-bold">
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                    }).format(item.product.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Totals */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <p>Subtotal:</p>
              <p>
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                }).format(order.price)}
              </p>
            </div>

            <div className="flex justify-between">
              <p>Shipping:</p>
              <p>
                {shippingFee === 0
                  ? "FREE"
                  : new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                    }).format(shippingFee)}
              </p>
            </div>

            <div className="flex justify-between border-t pt-2 font-bold">
              <p>Order Total:</p>
              <p>
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                }).format(totalWithShipping)}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="bg-white p-5 shadow-md rounded-md">
          <h2 className="text-xl mb-4">Payment Method</h2>

          {currentUser ? (
            <PaymentForm orderId={orderId} total={totalWithShipping} />
          ) : (
            <div className="text-center p-4">
              <p className="mb-4">Please sign in to complete your purchase</p>
              <button
                className="button"
                onClick={() => router.push('/auth/signin')}
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ConfirmOrderPage;
