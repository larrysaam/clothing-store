import React from 'react';
import { useSettings } from '@/hooks/useSettings';
import TrendCard from '@/components/TrendCard';

const Trends = () => {
  const { settings, loading, error } = useSettings();

  // If loading, show loading state
  if (loading) {
    return (
      <div className="w-full my-10 pr-2 pl-2 sm:pr-10 sm:pl-10 lg:pr-16 lg:pl-16">
        <div className="text-center py-8 text-3xl">
          <h2 className="font-bold">TRENDS</h2>
          <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
            Stay ahead with the latest fashion trends and must-have styles.
          </p>
        </div>
        <div className="grid grid-cols-1 w-full gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-300 w-full h-screen"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If error or no settings, don't render anything
  if (error || !settings || !settings.trends || settings.trends.length === 0) {
    return null;
  }

  const trends = settings.trends.slice(0, 4); // Limit to 4 trends

  return (
    <div className="w-full my-10 pr-2 pl-2 sm:pr-10 sm:pl-10 lg:pr-16 lg:pl-16">
      <div className="text-center py-8 text-3xl">
        <h2 className="font-bold">TRENDS</h2>
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Stay ahead with the latest fashion trends and must-have styles.
        </p>
      </div>
      <div className="grid grid-cols-1 w-full gap-3">
        {trends.map((trend, index) => (
          <TrendCard
            key={index}
            image={trend.image}
            label={trend.label}
            link={trend.link}
          />
        ))}
      </div>
    </div>
  );
};

export default Trends;
