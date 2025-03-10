import React, { useEffect, useState } from 'react';
import Navbar from '../Components/Navbar';
import AuthNavbar from '../Components/AuthNavbar'; // Navbar ใหม่เมื่อล็อกอินแล้ว
import { auth } from '../firebaseConfig';
import Footer from '../Components/Footer';

function SplashPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      {isLoggedIn ? <AuthNavbar /> : <Navbar />}
      <div className="container mt-5 mb-5 d-flex flex-column justify-content-center align-items-center" style={{ height: '100vh' }}>
  <img 
    src="/src/assets/premium_photo-1661962646119-0c9d2a604a63.avif" 
    alt="Risk Calculator Image" 
    className="img-fluid mb-4" // Makes the image responsive
    style={{ maxWidth: '50%', height: 'auto', borderRadius: '10px' }} // Adjusts the size and adds some styling
  />
  <h1>Welcome to Risk Calculator!</h1>
  <p>A risk analysis website helps users assess potential risks in various scenarios, such as security, business operations, or system vulnerabilities.</p>
  {isLoggedIn ? (
    <a className="btn btn-outline-primary btn-lg hover-effect" href="/calculating">
      Start Calculating
    </a>
  ) : (
    <a className="btn btn-outline-primary btn-lg hover-effect" href="/register">
      Get Started
    </a>
  )}
</div>



      <Footer/>
    </>
  );
}

export default SplashPage;
