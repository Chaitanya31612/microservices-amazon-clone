import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import useRequest from "@/hooks/useRequest";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  const [validations, setValidations] = useState({
    passwordError: false,
    passwordMatch: true,
  });

  const { doRequest, errors } = useRequest({
    url: "/api/users/signup",
    method: "post",
    body: {
      username: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    },
    onSuccess: () => {
      window.location.href = "/"; // Redirect to root route
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate password length
    if (name === "password") {
      setValidations((prev) => ({
        ...prev,
        passwordError: value.length < 6,
      }));
    }

    // Validate password match
    if (name === "confirmPassword" || name === "password") {
      setValidations((prev) => ({
        ...prev,
        passwordMatch:
          name === "confirmPassword"
            ? formData.password === value
            : value === formData.confirmPassword,
      }));
    }
  };

  const handleRoleChange = (e) => {
    const newRole = formData.role === "user" ? "seller" : "user";

    setFormData((prev) => ({
      ...prev,
      role: newRole,
    }));
  };

  const isSellerRegister = () => {
    return formData.role === "seller";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (formData.password.length < 6) {
      setValidations((prev) => ({
        ...prev,
        passwordError: true,
      }));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidations((prev) => ({
        ...prev,
        passwordMatch: false,
      }));
      return;
    }

    // Handle registration logic here
    console.log("Registration data:", formData);

    doRequest();
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <Head>
        <title>Create Amazon Account</title>
        <meta name="description" content="Create a new Amazon account" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex-1 flex flex-col items-center px-4 py-4">
        <div className="mb-4">
          <Image
            src="/images/amazon-logo.png"
            width={140}
            height={35}
            alt="Amazon Logo"
            style={{ objectFit: "contain" }}
          />
        </div>

        <div className="w-full max-w-md p-5 border border-gray-300 rounded">
          <h1 className="text-2xl font-normal mb-4">Create account</h1>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="block text-sm font-bold mb-1">
                Your name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full h-8 px-2 border border-gray-400 rounded shadow-sm focus:border-yellow-600 focus:ring-1 focus:ring-yellow-500 outline-none"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="block text-sm font-bold mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full h-8 px-2 border border-gray-400 rounded shadow-sm focus:border-yellow-600 focus:ring-1 focus:ring-yellow-500 outline-none"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-1">
              <label
                htmlFor="password"
                className="block text-sm font-bold mb-1"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="At least 6 characters"
                className={`w-full h-8 px-2 border ${
                  validations.passwordError
                    ? "border-red-500"
                    : "border-gray-400"
                } rounded shadow-sm focus:border-yellow-600 focus:ring-1 focus:ring-yellow-500 outline-none`}
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <div className="flex items-center mb-3">
              <span className="text-xs text-gray-600">
                <span className="text-gray-500">ⓘ</span> Passwords must be at
                least 6 characters.
              </span>
            </div>

            <div className="mb-4">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-bold mb-1"
              >
                Re-enter password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className={`w-full h-8 px-2 border ${
                  !validations.passwordMatch
                    ? "border-red-500"
                    : "border-gray-400"
                } rounded shadow-sm focus:border-yellow-600 focus:ring-1 focus:ring-yellow-500 outline-none`}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {!validations.passwordMatch && (
                <p className="text-xs text-red-500 mt-1">
                  Passwords do not match
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full h-10 bg-gradient-to-b from-yellow-200 to-yellow-400 border border-yellow-800 rounded cursor-pointer hover:from-yellow-300 hover:to-yellow-500 text-sm font-normal"
            >
              Create your Amazon account
            </button>
          </form>

          <div className="mt-4">
            <p className="text-xs leading-normal text-gray-800">
              By creating an account, you agree to Amazon's{" "}
              <Link
                href="/"
                className="text-blue-600 hover:text-yellow-700 hover:underline"
              >
                Conditions of Use
              </Link>{" "}
              and{" "}
              <Link
                href="/"
                className="text-blue-600 hover:text-yellow-700 hover:underline"
              >
                Privacy Notice
              </Link>
              .
            </p>
          </div>

          <div className="border-t border-gray-200 mt-6 pt-4">
            <p className="text-sm">
              Already have an account?{" "}
              <Link
                href="/auth/signin"
                className="text-blue-600 hover:text-yellow-700 hover:underline"
              >
                Sign-in <span className="text-blue-600">›</span>
              </Link>
            </p>
          </div>

          <div className="border-t border-gray-200 mt-6 pt-4">
            <p className="text-sm">
              {isSellerRegister()
                ? "Register for user account"
                : "Register as seller account"}{" "}
              <button
                onClick={handleRoleChange}
                className="text-blue-600 hover:text-yellow-700 hover:underline cursor-pointer"
              >
                {isSellerRegister() ? "User Account " : "Seller Account "}
                <span className="text-blue-600">›</span>
              </button>
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
            Conditions of Use
          </Link>
          <Link
            href="/"
            className="text-blue-600 hover:text-yellow-700 hover:underline mx-2"
          >
            Privacy Notice
          </Link>
          <Link
            href="/"
            className="text-blue-600 hover:text-yellow-700 hover:underline mx-2"
          >
            Help
          </Link>
        </div>
        <div className="text-gray-600">
          © 2025, Amazon.dev, Dev attempt to learn
        </div>
      </footer>
    </div>
  );
}
