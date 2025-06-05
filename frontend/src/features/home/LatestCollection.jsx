import React, { useContext, useMemo } from "react";
import { ShopContext } from "@/context/ShopContext";
import Title from "@/components/Title";
import ProductItem from "@/features/shared/ProductItem";
import { useTranslation } from 'react-i18next';

const LatestCollection = () => {
  const { products = [], isLoading } = useContext(ShopContext);
  const { t } = useTranslation();

  // useMemo to avoid rerenders and shuffle products
  const randomProducts = useMemo(() => {
    const shuffled = [...products]
      .sort(() => Math.random() - 0.5)
      .slice(0, 30);
    return shuffled;
  }, [products]);

  if (isLoading) {
    return <div className='my-10 gap-6 flex justify-center items-center'>
        <div className="w-6 h-6 border-4 border-t-gray-800 border-gray-300 rounded-full animate-spin"></div>
        <p className="text-center py-8 text-lg">Loading products...</p>;
    </div>
  }

  return (
    <div className="my-10 pr-2 pl-2 sm:pr-10 sm:pl-10 lg:pr-16 lg:pl-16">
      <div className="text-center py-8 text-3xl">
        <Title text1={t('latest_collections')} />
      </div>

      {randomProducts.length === 0 ? (
        <p className="text-center py-8 text-lg">No products available.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
          {randomProducts.map((item) => (
            <ProductItem
              key={item._id}
              id={item._id}
              image={item.image}
              name={item.name}
              price={item.price}
              preorder={item.preorder}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LatestCollection;
