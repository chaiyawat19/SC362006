import React, { useState, useEffect } from 'react';
import { auth, provider } from '../firebaseConfig';
import { getFirestore, collection, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import bcrypt from "bcryptjs";

const db = getFirestore();

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                navigate('/');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!email || !password) {
            alert("Email and password are required!");
            setLoading(false);
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            alert("Login successful!");
            navigate("/");
        } catch (error) {
            console.error("Error during login:", error.code, error.message);
            if (error.code === "auth/user-not-found") {
                alert("User not found in Firebase Authentication!");
            } else if (error.code === "auth/wrong-password") {
                alert("Incorrect password!");
            } else if (error.code === "auth/invalid-credential") {
                alert("Invalid email or password!");
            } else {
                alert("Login failed: " + error.message);
            }
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists()) {
                await setDoc(userDocRef, {
                    uid: user.uid,
                    name: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    createdAt: new Date()
                });
            }

            navigate("/");
        } catch (error) {
            console.error("Error during Google login:", error.code, error.message);
            alert("Google login failed: " + error.message);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card p-4 shadow-lg text-center" style={{ width: '25rem' }}>
                <h1 className="mb-4">Login</h1>
                <form className="text-start" onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label">Email address</label>
                        <input 
                            type="email" 
                            className="form-control" 
                            placeholder="Enter your email"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            placeholder="Enter your password"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100 mt-3" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <button className="btn btn-danger w-100 mt-3" onClick={handleGoogleLogin}>
                    <i className="fab fa-google me-2"></i> Login with Google
                </button>

                <div className="mt-3">
                    Don't have an account? <a href="/register">Register</a>
                </div>
            </div>
        </div>
    );
}