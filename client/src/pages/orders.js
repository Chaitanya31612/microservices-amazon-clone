import Header from "../components/Header";
import moment from "moment";
import Order from "../components/Order";
import Footer from "../components/Footer";
import axios from "axios";
import { useUser } from "@/context/UserContext";

const orders = ({ orders }) => {
  const { currentUser } = useUser()
  return (
    <div>
      <Header />

      <main className="max-w-screen-lg mx-auto p-10">
        <h1 className="text-2xl border-b mb-2 pb-1">Your Orders</h1>

        {currentUser ? (
          <h2>{orders.length} Orders</h2>
        ) : (
          <h2>Please Sign In to see your orders</h2>
        )}

        <div className="mt-5 space-y-4">
          {orders && orders.map((order) => (
            <Order key={order.id} order={order} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default orders;

export async function getServerSideProps({ req }) {
  let orders = []

  try {
    const { data } = await axios.get(
      `${process.env.INGRESS_URL}/api/orders/user-orders`,
      { headers: req.headers }
    );

    orders = data;
    console.log('orders is ', orders)
  } catch (error) {
    console.log(error);
  }

  return {
    props: {
      orders,
    },
  };
}
