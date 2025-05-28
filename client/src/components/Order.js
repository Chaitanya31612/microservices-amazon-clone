import moment from "moment";

const Order = ({ order }) => {
  const placedDate = moment.unix(order.expiresAt - 60).format("DD MMM YYYY");
  const orderTotalAmount = order.products.reduce((acc, productItem) => {
    return acc + productItem.product.price * productItem.quantity;
  }, 0);
  const shippingAdded = orderTotalAmount < 499 ? 40 : 0;
  const orderTotal = orderTotalAmount + shippingAdded;

  return (
    <div className='relative border rounded-md'>
      <div className='flex items-center space-x-10 p-5 bg-gray-100 text-sm text-gray-600'>
        <div>
          <p className='font-bold text-xs uppercase'>Order Placed</p>
          <p>{placedDate}</p>
        </div>

        <div>
          <p className='font-bold text-xs uppercase'>Total</p>
          <p>
            {new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
            }).format(orderTotal)}
          </p>
        </div>

        <p className='text-blue-500 text-right flex-1 self-end text-sm sm:text-lg whitespace-nowrap'>
          {order.products.length} items
        </p>
      </div>

      <div className='p-5 sm:p-10'>
        <div className='flex space-x-2 overflow-x-auto'>
          {order.products.map((productItem, index) => (
            <img
              key={index}
              src={productItem.product.image}
              alt=''
              className='h-20 object-contain sm:h-32'
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Order;
