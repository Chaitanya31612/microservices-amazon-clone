import moment from "moment";

const Order = ({ order }) => {
  const placedDate = moment(order.expiresAt).subtract(60, 'seconds').format("DD MMM YYYY")
  const orderTotalAmount = order.products.reduce((acc, productItem) => {
    return acc + productItem.product.price * productItem.quantity;
  }, 0);
  const shippingAdded = orderTotalAmount < 499 ? 40 : 0;
  const orderTotal = orderTotalAmount + shippingAdded;

  // Determine status color based on order status
  const getStatusColor = (status) => {
    switch (status) {
      case "complete":
        return "bg-green-500";
      case "created":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "complete":
        return "Completed";
      case "created":
        return "Created";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

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

        <div>
          <p className='font-bold text-xs uppercase'>Status</p>
          <div className='flex items-center'>
            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${getStatusColor(order.status)}`}></span>
            <p>{getStatusText(order.status)}</p>
          </div>
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
