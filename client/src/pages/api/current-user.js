import axios from "axios";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // Forward request to auth service through ingress-nginx
      const response = await axios.get(
        "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser",
        { headers: req.headers }
      );

      return res.status(200).json({ currentUser: response.data });
    } catch (error) {
      console.log(error);
      return res.status(error.response?.status || 500).json({
        errors: error.response?.data?.errors || [
          { message: "Error fetching user" },
        ],
      });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
