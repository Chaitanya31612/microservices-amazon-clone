import Product from "./Product";

const ProductFeed = ({ products }) => {
  // console.log(products);
  return (
    <div className="grid grid-flow-row-dense md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:-mt-52 mx-auto">
      {products.slice(0, 4).map((product) => {
        product = { ...product, quantity: 1 };
        return <Product key={product.id} product={product} />;
      })}

      {/* <img className="md:col-span-full" src="https://links.papareact.com/dyz" alt="" /> */}

      {products.slice(4).map((product) => {
        product = { ...product, quantity: 1 };
        return <Product key={product.id} product={product} />;
      })}
    </div>
  );
};

export default ProductFeed;
