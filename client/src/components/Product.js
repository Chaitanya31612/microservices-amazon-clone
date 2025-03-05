import Image from "next/image";
import { StarIcon } from "@heroicons/react/solid";

const MAX_RATING = 5;
const MIN_RATING = 1;

const Product = ({
  product: { id, title, price, description, category, image, quantity },
}) => {
  // const dispatch = useDispatch();

  // // randamised rating
  // const [rating] = useState(
  //   Math.floor(Math.random() * (MAX_RATING - MIN_RATING + 1)) + MIN_RATING
  // );

  // const onClickNotify = () => {
  //   toast(`${title} added to Cart!`, {
  //     position: "bottom-right",
  //     autoClose: 1500,
  //     hideProgressBar: false,
  //     closeOnClick: true,
  //     pauseOnHover: true,
  //     draggable: true,
  //     progress: undefined,
  //   });
  // };

  // const addItemToBasket = () => {
  //   const product = {
  //     id,
  //     title,
  //     price,
  //     description,
  //     category,
  //     image,
  //     quantity,
  //   };

  //   dispatch(addToBasket(product));
  //   onClickNotify();
  // };

  return (
    <div className={"relative flex flex-col m-5 bg-white p-10 z-30"}>
      <p className="absolute top-2 right-2 text-xs italic text-gray-400">
        {category}
      </p>

      <Image src={image} width={200} height={200} objectFit={"contain"} />

      <h4 className={"my-3"}>{title}</h4>

      {/* <div className="flex">
        {Array(rating)
          .fill()
          .map((_, index) => (
            <StarIcon key={index} className={"h-5 text-yellow-500"} />
          ))}
      </div> */}

      <p className={"text-xs my-2 line-clamp-2"}>{description}</p>

      <div className="mb-5">
        {new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(price)}
      </div>

      {/* <button onClick={() => addItemToBasket()} className={'mt-auto button'}>Add to Cart</button> */}
      <button className={"mt-auto button"}>Add to Cart</button>
    </div>
  );
};

export default Product;
