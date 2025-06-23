import React from 'react';
import { useNavigate } from 'react-router-dom';

const LookCard = ({ image, label, link }) => {
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
    <div className="relative group cursor-pointer" onClick={handleClick}>
      <img
        src={image}
        alt={label}
        className="w-full h-[600px] object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
      />
      <button
        className="absolute bottom-4 left-4 bg-white text-black px-4 py-2 rounded-full hover:bg-slate-200 flex items-center gap-2 opacity-100 transition-all duration-300 group-hover:bg-slate-200"
      >
        <span className="material-icons"></span>
        {label}
      </button>
    </div>
  );
};

export default LookCard;