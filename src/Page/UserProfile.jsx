import React, { useEffect, useState } from 'react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import AuthNavbar from '../Components/AuthNavbar';

export default function UserProfile() {
    const [user, setUser] = useState(null);
    const [riskReports, setRiskReports] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchRiskReports(currentUser.uid);
            } else {
                navigate('/login');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const fetchRiskReports = async (uid) => {
        try {
            const q = query(collection(db, "risk_reports"), where("user_id", "==", uid));
            const querySnapshot = await getDocs(q);
            const reports = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRiskReports(reports);
        } catch (error) {
            console.error("Error fetching risk reports: ", error);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error("Error Logout: ", error);
        }
    };

    const handleViewDetails = (reportId) => {
        navigate(`/risk-report/${reportId}`);
    };

    return (
        <div className="container mt-5">
            {/* <AuthNavbar /> */}

            <div className="row justify-content-center">
                <div className="col-md-8">
                        <button className="btn btn-secondary mb-3" onClick={() => navigate('/')}>Back</button>
                    <div className="card shadow-lg border-0 rounded-3 p-4">
                        <div className="card-body text-center">
                            {user ? (
                                <>
                                    {/* Profile Section */}
                                    <img 
                                        src={user.photoURL || "https://via.placeholder.com/100"} 
                                        alt="Profile" 
                                        className="rounded-circle border mb-3"
                                        width="100"
                                    />
                                    
                                    <h3 className="fw-bold">{user.displayName || "No Name"}</h3>
                                    <p className="text-muted mb-1"><strong>Email:</strong> {user.email}</p>

                                    {/* Risk Reports Section */}
                                    <hr className="my-4" />
                                    <h4 className="fw-bold">Risk Reports</h4>
                                    {riskReports.length > 0 ? (
                                        <div className="list-group">
                                            {riskReports.map((report) => (
                                                <div 
                                                    key={report.id} 
                                                    className="list-group-item d-flex justify-content-between align-items-center shadow-sm p-3 mb-2 rounded"
                                                >
                                                    <div className="">    
                                                        <strong>Date:</strong> {new Intl.DateTimeFormat('en-GB').format(new Date(report.date))}
                                                        <p className="mb-0"><strong>Risk Level:</strong> {report.riskLevel}</p>
                                                    </div>
                                                    <button 
                                                        className="btn btn-primary btn-sm" 
                                                        onClick={() => handleViewDetails(report.id)}
                                                    >
                                                        View Details
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted">No risk reports found.</p>
                                    )}

                                    {/* Logout Button */}
                                    <button className="btn btn-danger mt-4 w-100" onClick={handleLogout}>
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <p>Loading user data...</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
