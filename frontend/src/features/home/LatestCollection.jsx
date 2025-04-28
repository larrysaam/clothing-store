import React, { useContext, useMemo } from "react";
import { ShopContext } from "@/context/ShopContext";
import Title from "@/components/Title";
import ProductItem from "@/features/shared/ProductItem";

const LatestCollection = () => {
  const { products = [], isLoading } = useContext(ShopContext); // make sure it is array

  // useMemo to avoid rerenders
  const latestProducts = useMemo(() => products.slice(0, 8), [products]);

  if (isLoading) {
    return <div className='my-10 gap-6 flex justify-center items-center'>
        <div className="w-6 h-6 border-4 border-t-gray-800 border-gray-300 rounded-full animate-spin"></div>
        <p className="text-center py-8 text-lg">Loading products...</p>;
    </div>
  }

  return (
    <div className="my-10">
      <div className="text-center py-8 text-3xl">
        <Title text1="LATEST" text2="COLLECTIONS" />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Illum, vel?
        </p>
      </div>

      {latestProducts.length === 0 ? (
        <p className="text-center py-8 text-lg">No products available.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
          {latestProducts.map((item) => (
            <ProductItem
              key={item._id}
              id={item._id}
              image={item.image}
              name={item.name}
              price={item.price}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LatestCollection;
