import { StarIcon } from "@heroicons/react/solid";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  removeFromCart,
  updateItemQuantity,
} from "../slices/cartThunks";
import { useUser } from "@/context/UserContext";

const MAX_RATING = 5;
const MIN_RATING = 1;

const CheckoutProduct = ({
  id,
  title,
  price,
  description,
  category,
  image,
  quantity,
}) => {
  const { currentUser } = useUser();
  const userId = currentUser?.id || null;

  // randamised rating
  const [rating] = useState(
    Math.floor(Math.random() * (MAX_RATING - MIN_RATING + 1)) + MIN_RATING
  );
  const [quant, setQuant] = useState(quantity);

  const dispatch = useDispatch();

  const removeItemFromCart = () => {
    dispatch(removeFromCart({ productId: id, userId }));
  };

  useEffect(() => {
    setQuant(quantity);
  }, [quantity]);

  const updateQuantity = (newQuantity) => {
    if (newQuantity === 0) {
      dispatch(removeFromCart({ productId: id, userId }));
      return;
    }

    setQuant(newQuantity);
    dispatch(updateItemQuantity({ productId: id, quantity: newQuantity, userId }));
  };

  const decrementItemQuantity = () => {
    updateQuantity(quant - 1);
  };

  const incrementItemQuantity = () => {
    updateQuantity(quant + 1);
  };

  return (
    <div className={"cart-item"}>
      <Image src={image} width={200} height={200} objectFit={"contain"} />

      <div className={"col-span-3 mx-5"}>
        <p>{title}</p>
        <div className="flex">
          {Array(rating)
            .fill()
            .map((_, index) => (
              <StarIcon key={index} className={"h-5 text-yellow-500"} />
            ))}
        </div>

        <p className={"text-xs my-2 line-clamp-3"}>{description}</p>

        <div className="mb-5">
          {new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
          }).format(price)}
        </div>
      </div>

      <div className="flex flex-col space-y-2 my-auto justify-self-end">
        <div className="flex space-x-2 items-center justify-center">
          <button
            onClick={decrementItemQuantity}
            className="p-2 px-4 text-xs md:text-sm bg-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            -
          </button>
          <span>{quant}</span>
          <button
            onClick={incrementItemQuantity}
            className="p-2 px-4 text-xs md:text-sm bg-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            +
          </button>
        </div>
        <button
          onClick={removeItemFromCart}
          className="button text-xs sm:text-sm"
        >
          Remove from Cart
        </button>
      </div>
    </div>
  );
};

export default CheckoutProduct;
