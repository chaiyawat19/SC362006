import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { db, collection, addDoc } from '../firebaseConfig'; // Import Firestore methods
import bcrypt from 'bcryptjs'; // Import bcrypt for password hashing

export default function Register() {
  const [email, setEmail] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate(); // Initialize navigate hook

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10); // 10 is the salt rounds for bcrypt

    // Prepare user data to store in Firestore
    const userData = {
      displayName,
      email,
      password: hashedPassword,
      photoURL,
      createdAt: new Date().toISOString()
    };

    try {
      // Add the user data to the Firestore database in the "users" collection
      await addDoc(collection(db, 'users'), userData);

      // Redirect to the Dashboard after successful registration
      navigate('/login', { state: userData });
    } catch (error) {
      console.error('Error adding document: ', error);
      // Handle errors (e.g., show an error message)
    }
  };

  return (
    <>
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="card p-4 shadow-lg text-center" style={{ width: '25rem' }}>
          <h1 className="mb-4">Register</h1>
          <form onSubmit={handleSubmit} className="text-start">
            <div className="mb-3">
              <label htmlFor="displayName" className="form-label">Fullname</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-person-circle"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  id="displayName"
                  placeholder="Enter your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-envelope-fill"></i>
                </span>
                <input
                  type="email"
                  className="form-control"
                  id="exampleInputEmail1"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-lock"></i>
                </span>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="photoURL" className="form-label">Image URL</label>
              <input
                type="text"
                className="form-control"
                id="photoURL"
                placeholder="Enter your URL profile picture"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 mt-3">
              Register
            </button>
          </form>
          <div className="mt-3">
            Already have an account? <a href="/login">Login</a>
          </div>
        </div>
      </div>
    </>
  );
}
