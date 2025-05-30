import axios from "axios";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // Forward request to auth service through ingress-nginx
      const response = await axios.get(
        `${process.env.INGRESS_URL}/api/products`,
        { headers: req.headers }
      );

      return res.status(200).json({ products: response.data });
    } catch (error) {
      console.log(error);
      return res.status(error.response?.status || 500).json({
        errors: error.response?.data?.errors || [
          { message: "Error fetching products" },
        ],
      });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
