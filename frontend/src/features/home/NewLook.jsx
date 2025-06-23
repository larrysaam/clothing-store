import React from 'react';
import { useSettings } from '@/hooks/useSettings';
import LookCard from '@/components/LookCard';

const NewLook = () => {
  const { settings, loading, error } = useSettings();

  // If loading, show loading state
  if (loading) {
    return (
      <div className="my-10 pr-2 pl-2 sm:pr-10 sm:pl-10 lg:pr-16 lg:pl-16">
        <div className="text-center py-8 text-3xl">
          <h2 className="font-bold">NEW LOOKS</h2>
          <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
            Discover the latest styles and trends curated just for you.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-300 w-full h-[600px] rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If error or no settings, don't render anything
  if (error || !settings || !settings.looks || settings.looks.length === 0) {
    return null;
  }

  const looks = settings.looks;

  return (
    <div className="my-10 pr-2 pl-2 sm:pr-10 sm:pl-10 lg:pr-16 lg:pl-16">
      <div className="text-center py-8 text-3xl">
        <h2 className="font-bold">NEW LOOKS</h2>
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Discover the latest styles and trends curated just for you.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {looks.map((look, index) => (
          <LookCard
            key={index}
            image={look.image}
            label={look.label}
            link={look.link}
          />
        ))}
      </div>
    </div>
  );
};

export default NewLook;