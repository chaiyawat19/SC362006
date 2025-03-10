import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // เชื่อมต่อ Bootstrap CSS

function Footer() {
  return (
    <footer className="bg-dark text-white py-4 mt-5">
      <div className="container text-center">
        <p className="mb-2">© 2025 SC362006. KKU Collage of Computing.</p>
        <div>
          <a href="https://owasp.org/www-community/OWASP_Risk_Rating_Methodology" target="_blank" className="text-white mx-3">Reference</a>
          <a href="/members" className="text-white mx-3">Member of Group 3</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
