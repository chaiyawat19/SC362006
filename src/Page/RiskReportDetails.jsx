import React, { useEffect, useState } from 'react';
import { useParams,useNavigate  } from 'react-router-dom';
import { doc, getDoc, deleteDoc  } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import '../css/table.css';

export default function RiskReportDetails() {
    const { reportId } = useParams(); // Get reportId from URL
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchReport = async () => {
            try {
                if (!reportId) {
                    console.error("No report ID found.");
                    return;
                }
                const docRef = doc(db, "risk_reports", reportId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setReport(docSnap.data());
                } else {
                    console.log("No such document!");
                }
            } catch (error) {
                console.error("Error fetching report: ", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [reportId]);

    if (loading) {
        return <p>Loading...</p>;
    }

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this report?")) return;

        try {
            await deleteDoc(doc(db, "risk_reports", reportId));
            alert("Report deleted successfully!");
            navigate("/userProfile"); // กลับไปยังหน้ารายงานทั้งหมด
        } catch (error) {
            console.error("Error deleting report:", error);
            alert("Failed to delete the report.");
        }
    };


    const getRiskLevel = (score) => {
        if (score >= 9) return { label: 'High Risk', color: 'bg-danger', textColor: 'text-danger' };
        if (score >= 7) return { label: 'Medium-High Risk', color: 'bg-warning', textColor: 'text-warning' };
        if (score >= 5) return { label: 'Medium Risk', color: 'bg-primary', textColor: 'text-primary' };
        if (score >= 3) return { label: 'Medium-Low Risk', color: 'bg-info', textColor: 'text-info' };
        if (score >= 1) return { label: 'Low Risk', color: 'bg-success', textColor: 'text-success' };
        return { label: 'No Risk', color: 'bg-secondary', textColor: 'text-secondary' };
    };

    const generateChartData = () => {
        if (!report || !report.scores) return {};
        const categories = Object.keys(report.scores);
        const values = categories.map(cat => 
            Object.values(report.scores[cat]).reduce((a, b) => a + b, 0)
        );
        return {
            labels: categories,
            datasets: [
                {
                    label: 'Risk Score',
                    data: values,
                    backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0'],
                },
            ],
        };
    };

    const totalScore = report ? Object.values(report.scores).reduce((acc, category) => {
        return acc + Object.values(category).reduce((a, b) => a + b, 0);
    }, 0) : 0;

    const overallRisk = getRiskLevel(totalScore);

    return (
        <div className="container mt-5">
            {report ? (
                <div>
                    <button className="btn btn-secondary mb-3" onClick={() => window.history.back()}>Back</button>
                    <h2>Risk Report Details</h2>
                    <strong>Date:</strong> {new Intl.DateTimeFormat('en-GB').format(new Date(report.date))}
                    <p><strong>Risk Level:</strong> {report.riskLevel}</p>
                    
                    <h4 className="mt-4">Summary</h4>
                    <div className="p-3 border rounded bg-light mb-5">
                        <p className="mb-1"><strong>Total Score:</strong> {totalScore}</p>
                        <p className={`mb-0 ${overallRisk.textColor}`}><strong>Overall Risk Level:</strong> {overallRisk.label}</p>
                    </div>
                    <button className="btn btn-danger mb-3" onClick={handleDelete}>Delete Report</button>

                    <h4>Risk Score Overview</h4>
                    <div className="chart-container" style={{ width: '80%', margin: 'auto' }}>
                        <Bar data={generateChartData()} />
                    </div>
                    
                    <h4>Scores:</h4>
                    {Object.entries(report.scores).map(([category, data]) => (
                        <div key={category} className="mt-3">
                            <h5 className="text-uppercase text-secondary">{category.replace(/([A-Z])/g, ' $1')}</h5>
                            <table className="table table-light table-hover">
                                <thead>
                                    <tr>
                                        <th>Aspect</th>
                                        <th>Risk Level</th>
                                        <th>Risk Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(data).map(([key, value]) => {
                                        const risk = getRiskLevel(value);
                                        return (
                                            <tr key={key}>
                                                <td>{key.replace(/([A-Z])/g, ' $1')}</td>
                                                <td><span className={`badge ${risk.color}`}>{risk.label}</span></td>
                                                <td>{value}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ))}
                    
                </div>
            ) : (
                <p>No report found.</p>
            )}
        </div>
    );
}
