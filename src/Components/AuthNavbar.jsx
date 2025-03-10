import React, { useEffect, useState } from 'react';
import { auth } from '../firebaseConfig'; // เพิ่มการนำเข้า firebaseConfig

function AuthNavbar() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user); // เก็บข้อมูลผู้ใช้ที่ล็อกอิน
        });
        return () => unsubscribe();
    }, []);

    return (
        <div>
            <div className="container mt-4">
                <ul className="nav nav-pills d-flex justify-content-between">
                    <li>
                        <a href="/" className='d-flex gap-2 justify-content-center align-items-center text-decoration-none'>
                            <img src="/src/assets/logo.png" alt="" width={45} />
                            <h6 className="mb-0" style={{ color: '#2c83df' }}>Risk Calculator</h6>
                        </a>
                    </li>

                    <div className="d-flex gap-3">
                        <li className="nav-item">
                            <a className="nav-link" href="/userProfile">
                                {user ? (
                                    <>
                                        <img
                                            src={user.photoURL || '/src/assets/default-avatar.png'} // ใช้รูปจาก Firebase หรือรูปเริ่มต้น
                                            alt="Profile"
                                            width={30}
                                            height={30}
                                            style={{ borderRadius: '50%' }}
                                        />
                                        <span className="ms-2">{user.displayName || 'Profile'}</span>
                                    </>
                                ) : (
                                    'Profile'
                                )}
                            </a>
                        </li>
                    </div>
                </ul>
            </div>
        </div>
    );
}

export default AuthNavbar;
