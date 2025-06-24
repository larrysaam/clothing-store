import React from 'react';
import { useNavigate } from 'react-router-dom';

const TrendCard = ({ image, label, link }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!link) return;

    if (link.productId) {
      navigate(`/product/${link.productId}`);
    } else if (link.category) {
      let url = `/collection?category=${link.category}`;
      if (link.subcategory) {
        url += `&subcategory=${link.subcategory}`;
        if (link.subsubcategory) {
          url += `&second=${link.subsubcategory}`;
        }
      }
      navigate(url);
    }
  };

  return (
    <div className="relative group cursor-pointer w-full h-screen" onClick={handleClick}>
      <img
        src={image}
        alt={label}
        className="w-full h-full object-cover transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300"></div>
      <button
        className="absolute bottom-8 left-8 bg-white text-black px-6 py-3 rounded-full hover:bg-slate-200 flex items-center gap-2 opacity-100 transition-all duration-300 group-hover:bg-slate-200 text-base font-medium"
      >
        <span className="material-icons"></span>
        {label}
      </button>
    </div>
  );
};

export default TrendCard;
