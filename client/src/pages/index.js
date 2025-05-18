import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductFeed from "@/components/ProductFeed";
import Head from "next/head";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import { useDispatch } from "react-redux";
import { fetchFromLocalStorage, selectItems } from "@/slices/cartSlice";
import { useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { fetchCart } from "@/slices/cartThunks";

export default function Home({ products }) {
  const dispatch = useDispatch();
  const { currentUser } = useUser();

  useEffect(() => {
    dispatch(fetchCart(currentUser?.id));
  }, [currentUser]);

  return (
    <div className="bg-gray-100">
      <Head>
        <title>Amazon Clone</title>
      </Head>

      <ToastContainer />
      <Header />

      <main className="max-w-screen-2xl mx-auto">
        <Banner />

        <ProductFeed products={products} />

        <Footer />
      </main>
    </div>
  );
}

// by having this function, this tells next.js that it is not a static page and it's need a server in between for fetching and passing the data to the component
// this runs on the server on each request
export async function getServerSideProps({ req }) {
  // using kubernetes, if we make a request, it will be under the client pod and will not be routed by
  // ingress-nginx to the api pod, so for that, we need to route the request to ingress nginx service
  // which will then route it to the api pod (auth service) according to ingress configuration
  // kubectl get namespaces - to get ingress namespace
  // kubectl get services -n ingress-nginx - to get ingress service

  // this request is essentially a proxy request between the browser and the auth service pod through the ingress-nginx
  // passing the headers from the browser to the ingress-nginx, then to the auth service pod for the auth cookie
  const { data: products } = await axios.get(
    "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/products",
    {
      headers: req.headers,
    }
  );

  return {
    props: {
      products,
    },
  };
}
