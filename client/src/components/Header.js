import Image from "next/image";
import Link from "next/link";
import {
  MenuIcon,
  SearchIcon,
  ShoppingCartIcon,
  LocationMarkerIcon,
  ChevronDownIcon,
} from "@heroicons/react/outline";
// import { signIn, signOut, useSession } from "next-auth/client";
import { useRouter } from "next/router";
import headerStyles from "../styles/Header.module.css";
// import { useSelector } from "react-redux";
// import { selectItems } from "../slices/basketSlice";

const Header = () => {
  // const [session] = useSession();
  // const router = useRouter();
  // const items = useSelector(selectItems);

  return (
    <header className="sticky top-0 z-50">
      {/* Top Nav */}
      <div className="sticky top-0 z-50 flex items-center bg-amazon_blue p-1 py-2 flex-grow">
        <div
          className={`flex items-center flex-grow sm:flex-grow-0 p-2 ${headerStyles.borderOutline}`}
        >
          <Image
            onClick={() => router.push("/")}
            src={"https://pngimg.com/uploads/amazon/amazon_PNG11.png"}
            width={140}
            height={35}
            objectFit={"contain"}
            className={`custom-important-component`}
          />
        </div>

        <div
          className={`hidden sm:inline text-xs text-white mx-4 p-2 ${headerStyles.borderOutline}`}
        >
          <p>
            Hello
            {/* {session
              ? `Deliver to ${session.user.name.split(" ")[0]}`
              : "Hello"} */}
          </p>
          <div className="flex items-center">
            <LocationMarkerIcon className="h-5" />
            <p className={"font-bold md:text-sm"}>
              "Select Address"
              {/* {session ? `Sonipat, India` : "Select Address"} */}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="hidden sm:flex space-x-1 flex-shrink h-10 rounded-l-md p-3 items-center bg-gray-200 text-gray-500 cursor-pointer">
          <p className="text-sm">All</p>
          <ChevronDownIcon className="h-3" />
        </div>
        <form
          target="_blank"
          action={"https://www.amazon.in/s"}
          className="hidden sm:flex items-center h-10 rounded-md flex-grow cursor-pointer bg-yellow-400 hover:bg-yellow-500"
        >
          <input
            type="text"
            name={"k"}
            className={`focus:outline-none p-2 h-full w-6 flex-grow flex-shrink px-4 bg-white hover:bg-gray-100`}
          />
          <button className="focus:outline-none" type="submit">
            <SearchIcon className="h-12 p-4" />
          </button>
        </form>

        {/* Right Bar */}
        <div
          className={`text-white flex items-center text-xs space-x-6 mx-5 whitespace-nowrap`}
        >
          {/* <div onClick={!session ? signIn : signOut} className={`link`}>
            <p>Hello, {session ? `${session.user.name}` : "Sign In"}</p> */}
          <div className={`link`}>
            <p>Hello, Sign In</p>
            {/* </div> */}
            <p className={"font-bold md:text-sm"}>Account & Lists</p>
          </div>

          <div
            // onClick={() => {
            //   session && router.push("/orders");
            // }}
            className="link"
          >
            <p>Returns</p>
            <p className={"font-bold md:text-sm"}>& Orders</p>
          </div>

          <div
            onClick={() => router.push("/checkout")}
            className="relative flex items-center link"
          >
            <span className="absolute top-0 right-0 md:right-6 h-4 w-4 bg-yellow-400 text-center rounded-full text-black font-bold">
              0{/* {items ? items.length : 0} */}
            </span>

            <ShoppingCartIcon className="h-10" />
            <p className={"hidden md:inline font-bold md:text-sm mt-2"}>Cart</p>
          </div>
        </div>
      </div>

      {/*  Bottom Nav */}
      <div
        className={`flex items-center space-x-4 p-1 pl-4 bg-amazon_blue-light text-white text-sm`}
      >
        <p className={`flex items-center p-1 ${headerStyles.borderOutlineSm}`}>
          <MenuIcon className="h-6 mr-1" />
          All
        </p>
        <p className={`link`}>Prime Video</p>
        <p className={`link`}>Sell</p>
        <p className={`link`}>Amazon Pay</p>
        <p className={`link`}>Today's Deal</p>
        <p className="link hidden md:inline-flex">Gift Cards</p>
        <p className="link hidden md:inline-flex">Electronics</p>
        <p className="link hidden md:inline-flex">Food & Grocery</p>
        <p className="link hidden lg:inline-flex">Health & Personal Care</p>
        <p className="link hidden lg:inline-flex">Kindle eBooks</p>
      </div>
    </header>
  );
};

export default Header;
