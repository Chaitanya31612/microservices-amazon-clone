import axios from "axios";

// !!NOT BEING USED
export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { orderId } = req.query;
      console.log("orderId from query is ", orderId);

      // Make sure we're calling the orders service with the correct URL
      const { data } = await axios.get(
        `
        http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/orders/${orderId}`,
        {
          headers: req.headers,
        }
      );

      const total = data.products.reduce((acc, product) => {
        return acc + product.product.price * product.quantity;
      }, 0);

      const order = {
        ...data,
        price: total,
      };

      console.log("order from get-order is", order);
      return res.status(200).json(order);
    } catch (error) {
      console.log(error);
      return res.status(error.response?.status || 500).json({
        errors: error.response?.data?.errors || [
          { message: "Error fetching order" },
        ],
      });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
