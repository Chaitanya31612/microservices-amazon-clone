import axios from "axios";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { data } = await axios.get(
        `${process.env.INGRESS_URL}/api/orders`,
        { headers: req.headers }
      );

      return res.status(200).json({ orders: data });
    } catch (error) {
      console.log(error);
      return res.status(error.response?.status || 500).json({
        errors: error.response?.data?.errors || [
          { message: "Error fetching orders" },
        ],
      });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }

}
