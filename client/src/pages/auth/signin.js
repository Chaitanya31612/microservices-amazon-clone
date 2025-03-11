import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import useRequest from "@/hooks/useRequest";
import { useRouter } from "next/router";
import ErrorAlert from "@/components/ErrorAlert";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { doRequest, errors } = useRequest({
    url: "/api/users/signin",
    method: "post",
    body: { email, password },
    onSuccess: () => router.push("/"),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Sign in attempt with:", { email, password });
    doRequest();
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <Head>
        <title>Amazon Sign In</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="flex-1 flex flex-col items-center px-4 py-4">
        <div className="mb-4">
          <Image
            src="/images/amazon-logo.png"
            width={140}
            height={35}
            style={{ objectFit: "contain" }}
            className={`custom-important-component`}
          />
        </div>

        <div className="w-full max-w-sm p-4 border border-gray-300 rounded">
          {console.log(errors)}
          {errors.length > 0 && <ErrorAlert subMessage={errors[0]?.message} />}
          <h1 className="text-2xl font-normal mb-4">Sign in</h1>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-xs font-bold mb-1 pl-1"
              >
                Email
              </label>
              <input
                type="text"
                id="email"
                className="w-full h-8 px-2 border border-gray-400 rounded shadow-sm focus:border-yellow-600 focus:ring-1 focus:ring-yellow-500 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold pl-1"
                >
                  Password
                </label>
                <Link
                  href="/"
                  className="text-xs text-blue-600 hover:text-yellow-700 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <input
                type="password"
                id="password"
                className="w-full h-8 px-2 border border-gray-400 rounded shadow-sm focus:border-yellow-600 focus:ring-1 focus:ring-yellow-500 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full h-8 mt-4 bg-gradient-to-b from-yellow-200 to-yellow-400 border border-yellow-800 rounded cursor-pointer hover:from-yellow-300 hover:to-yellow-500 text-sm"
            >
              Sign in
            </button>
          </form>

          <div className="mt-6 mb-3 text-center relative">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200"></div>
            <span className="px-2 bg-white text-xs text-gray-500 relative z-10">
              New to Amazon?
            </span>
          </div>

          <Link
            href="/auth/register"
            className="block w-full h-8 bg-gradient-to-b from-gray-100 to-gray-200 border border-gray-400 rounded cursor-pointer hover:from-gray-200 hover:to-gray-300 text-sm flex items-center justify-center text-gray-800"
          >
            Create an account
          </Link>

          <div className="mt-4">
            <p className="text-xs leading-normal text-gray-800">
              By signing in you are agreeing to our{" "}
              <Link
                href="/"
                className="text-blue-600 hover:text-yellow-700 hover:underline"
              >
                Conditions of Use and Sale
              </Link>{" "}
              and our{" "}
              <Link
                href="/"
                className="text-blue-600 hover:text-yellow-700 hover:underline"
              >
                Privacy Notice
              </Link>
              .
            </p>
          </div>
        </div>
      </main>

      <footer className="text-xs text-gray-600 text-center mt-6 pb-6">
        <div className="mb-2">
          <Link
            href="/"
            className="text-blue-600 hover:text-yellow-700 hover:underline mx-2"
          >
            Help
          </Link>
          <Link
            href="/"
            className="text-blue-600 hover:text-yellow-700 hover:underline mx-2"
          >
            Conditions of Use
          </Link>
          <Link
            href="/"
            className="text-blue-600 hover:text-yellow-700 hover:underline mx-2"
          >
            Privacy Notice
          </Link>
        </div>
        <div className="text-gray-600">
          © 2025, Amazon.dev, Dev attempt to learn
        </div>
      </footer>
    </div>
  );
}
