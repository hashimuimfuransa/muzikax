import React, { useState } from 'react';

interface PartnerPromotionProps {
  variant?: 'button' | 'rewarded';
  buttonText?: string;
  rewardText?: string;
}

const PartnerPromotion: React.FC<PartnerPromotionProps> = ({
  variant = 'button',
  buttonText = '🎧 Support us – Download partner app',
  rewardText = 'Watch an ad / install app to get 30 minutes ad-free'
}) => {
  const [showRewardOption, setShowRewardOption] = useState(false);

  const handlePromotionClick = () => {
    if ((window as any).partnerPromotion) {
      (window as any).partnerPromotion.openLink('muzikax_promo');
    } else {
      // Fallback if script isn't loaded
      window.open('//djxh1.com/4/10541499?var=muzikax_fallback', '_blank');
    }
  };

  const handleRewardClick = () => {
    if ((window as any).partnerPromotion) {
      (window as any).partnerPromotion.openLink('muzikax_rewarded');
    } else {
      // Fallback if script isn't loaded
      window.open('//djxh1.com/4/10541499?var=muzikax_rewarded_fallback', '_blank');
    }
  };

  if (variant === 'rewarded') {
    return (
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-4 rounded-lg border border-purple-700 my-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white text-center md:text-left">
            {rewardText}
          </p>
          <button
            onClick={handleRewardClick}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105"
          >
            Watch & Get Reward
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handlePromotionClick}
      className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
    >
      {buttonText}
    </button>
  );
};

export default PartnerPromotion;