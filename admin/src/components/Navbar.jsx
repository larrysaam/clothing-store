import React, { useEffect } from 'react'
import { assets } from '../assets/assets'
import { MdPublic } from "react-icons/md";

const Navbar = ({setToken}) => {
  useEffect(() => {    
    // Inject Google Translate script and initialize
    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = function() {
        if (window.google && window.google.translate) {
          new window.google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: 'en,fr',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
          }, 'google_translate_element');
        }
      };
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(script);
    } else if (window.google && window.google.translate && document.getElementById('google_translate_element')) {
      new window.google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,fr',
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
      }, 'google_translate_element');
    }
  }, []);

  // Language toggle handler
  const handleLangToggle = () => {
    const match = document.cookie.match(/googtrans=\/en\/(fr|en)/);
    const currentLang = match ? match[1] : 'en';
    const newLang = currentLang === 'en' ? 'fr' : 'en';
    document.cookie = `googtrans=/en/${newLang};path=/`;
    window.location.reload();
  };

  return (
    <div className='flex items-center py-2 px-[4%] justify-between'>
        <img className='sm:w-[max(5%,30px)] w-10 ' src={assets.logo} alt='' />
        <div className='text-lg sm:text-xl mx-2 sm:mx-6'>Our Shop's Admin Panel</div>
        {/* Google Translate widget (hidden) */}
        <div id="google_translate_element" style={{ display: 'none' }}></div>
        {/* Language toggle button with globe icon */}
        <button
          onClick={handleLangToggle}
          className='ml-4 px-2 py-1 text-sm border rounded hover:bg-gray-100 flex items-center justify-center'
          title="Switch Language"
        >
          <MdPublic className="w-5 h-5" />
        </button>
    </div>
  )
}

export default Navbar
