import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from '@/pages/Home';
import Collection from '@/pages/Collection';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Product from '@/pages/Product';
import Cart from '@/pages/Cart';
import Login from "@/pages/Login";
import Placeorder from "@/pages/Placeorder";
import Orders from "@/pages/Orders";
import MyProfile from "@/pages/MyProfile";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SearchBar from "@/components/layout/SearchBar";
import { Toaster } from 'sonner'
import Verify from "@/pages/Verify";
import NotFound from '@/components/NotFound'
import Signup from "@/pages/Signup";
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import OrderSuccess from '@/pages/OrderSuccess';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import Delivery from '@/pages/Delivery';

const App = () => {
  const { pathname } = useLocation();

  // Inject Google Translate widget on mount
  useEffect(() => {
    const addGoogleTranslateScript = () => {
      if (document.getElementById('google-translate-script')) return;
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(script);
    };
    window.googleTranslateElementInit = function() {
      new window.google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,fr', // Only allow English and French
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
      }, 'google_translate_element');
    };
    addGoogleTranslateScript();
    // Cleanup
    return () => {
      delete window.googleTranslateElementInit;
    };
  }, []);

  //scroll to top of the page on location changes
  useEffect(() => {
      window.scrollTo({top: 0, left: 0, behavior: 'smooth' });
}, [pathname]);

  return (
    <div className="">
      {/* Google Translate Widget */}
      {/* <div id="google_translate_element" style={{ position: 'fixed', top: 10, right: 10, zIndex: 9999 }}></div> */}
      <Toaster richColors closeButton/>
        <Navbar />
        <SearchBar />
          <Routes>
            <Route path='/' element={<Home/>} />
            <Route path='/collection' element={<Collection/>} />
            <Route path='/about' element={<About/>} />
            <Route path='/contact' element={<Contact/>} />
            <Route path='/privacy' element={<PrivacyPolicy/>} />
            <Route path='/product/:productId' element={<Product/>} />
            <Route path='/cart' element={<Cart/>} />
            <Route path='/login' element={<Login/>} />
            <Route path='/signup' element={<Signup/>} />
            <Route path='/place-order' element={<Placeorder/>} />
            <Route path='/orders' element={<Orders/>} />
            <Route path='/my-profile' element={<MyProfile/>} />
            <Route path='/verify' element={<Verify/>} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path='/delivery' element={<Delivery/>} />
            <Route path='*' element={<NotFound/>} />
          </Routes>
        <Footer/>
    </div>
  )
}

export default App