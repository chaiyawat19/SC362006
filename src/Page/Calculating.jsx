import { useState, useMemo, useRef, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import Papa from "papaparse";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import AuthNavbar from "../Components/AuthNavbar";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
import { db } from "../firebaseConfig";  // นำเข้า db จากไฟล์ firebaseConfig
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import "../css/card.css";
export default function Calculating() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsLoggedIn(!!user);
            setUser(user); // set user info
        });
        return () => unsubscribe();
    }, []);

        // ฟังก์ชันบันทึกข้อมูลลง Firestore
    const saveData = () => {
        if (!user) return; // ถ้าไม่มี user ก็ไม่ทำการบันทึก

        const riskData = {
            date: new Date().toISOString(),
            scores: scores,
            riskLevel: calculateRisk(),
            user_id: user.uid // เพิ่ม user_id เป็น field ในเอกสาร
        };

        // ใช้ addDoc เพื่อให้ Firestore สร้าง document ID ใหม่
        addDoc(collection(db, "risk_reports"), riskData)
            .then(() => {
                console.log("Data saved successfully");
                alert("Data saved successfully!");
            })
            .catch((error) => {
                console.error("Error saving data: ", error);
                alert("Error saving data");
            });
    };





  const [scores, setScores] = useState({
    threatAgent: {
      skillLevel: 0,
      motive: 0,
      opportunity: 0,
      size: 0,
    },
    vulnerability: {
      easeOfDiscovery: 0,
      easeOfExploit: 0,
      awareness: 0,
      intrusionDetection: 0,
    },
    technicalImpact: {
        lossOfConfidentiality: 0,
        lossOfIntegrity: 0,
        lossOfAvailability: 0,
        lossOfAccountability: 0,
    },
    businessImpact: {
      financialDamage: 0,
      reputationDamage: 0,
      nonCompliance: 0,
      privacyViolation: 0,
    },
  });

  const chartRef = useRef();
  const chartContainerRef = useRef(null);


  // ฟังก์ชันคำนวณค่าความเสี่ยง
  const calculateRisk = () => {
    const total =
      Object.values(scores.threatAgent).reduce((sum, value) => sum + value, 0) +
      Object.values(scores.vulnerability).reduce((sum, value) => sum + value, 0) +
      Object.values(scores.technicalImpact).reduce((sum, value) => sum + value, 0) +
      Object.values(scores.businessImpact).reduce((sum, value) => sum + value, 0);
    if (total <= 20) return "Low Risk";
    if (total <= 30) return "Medium Risk";
    return "High Risk";
  };
  const [showGraph, setShowGraph] = useState(true);
  const toggleGraph = () => {
    setShowGraph(!showGraph);
  };
  // ข้อมูลกราฟ
  const chartData = useMemo(
    () => ({
      labels: ["Threat Agent", "Vulnerability", "Technical Impact", "Business Impact"],
      datasets: [
        {
          label: "Score",
          data: [
            Object.values(scores.threatAgent).reduce((sum, value) => sum + value, 0),
            Object.values(scores.vulnerability).reduce((sum, value) => sum + value, 0),
            Object.values(scores.technicalImpact).reduce((sum, value) => sum + value, 0),
            Object.values(scores.businessImpact).reduce((sum, value) => sum + value, 0),
          ],
          backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0'],
        },
      ],
    }),
    [scores]
  );

  const exportPDF = () => {
    const doc = new jsPDF('landscape');
    doc.text("OWASP Risk Report", 20, 10);
    doc.text("Date: " + new Date().toLocaleDateString(), 20, 20);

    const createTable = (title, head, data, yPos) => {
      doc.text(title, 14, yPos);
      autoTable(doc, {
        startY: yPos + 5,
        head: [head],
        body: data,
        columnStyles: {
          0: { cellWidth: 90 },
          1: { cellWidth: 90 },
          2: { cellWidth: 90 },
        },
      });
    };

    // จัดรูปแบบข้อมูล
    const businessImpactData = Object.entries(scores.businessImpact).map(([factor, value]) => [
      factor.replace(/([A-Z])/g, ' $1'), 
      getRiskLevel(value), 
      value,
    ]);

    const technicalImpactData = Object.entries(scores.technicalImpact).map(([factor, value]) => [
      factor.replace(/([A-Z])/g, ' $1'),
      getRiskLevel(value),
      value,
    ]);

    const threatAgentData = Object.entries(scores.threatAgent).map(([factor, value]) => [
      factor.replace(/([A-Z])/g, ' $1'),
      getRiskLevel(value),
      value,
    ]);

    const vulnerabilityData = Object.entries(scores.vulnerability).map(([factor, value]) => [
      factor.replace(/([A-Z])/g, ' $1'),
      getRiskLevel(value),
      value,
    ]);

    // เพิ่มตารางลงใน PDF
    createTable("Business Impact", ["Impact", "Risk Level", "Risk Value"], businessImpactData, 30);
    createTable("Technical Impact", ["Impact", "Risk Level", "Risk Value"], technicalImpactData, doc.lastAutoTable.finalY + 10);
    createTable("Threat Agent", ["Agent", "Risk Level", "Risk Value"], threatAgentData, doc.lastAutoTable.finalY + 10);
    createTable("Vulnerability", ["Vulnerability", "Risk Level", "Risk Value"], vulnerabilityData, doc.lastAutoTable.finalY + 10);

    // คำนวณคะแนนรวม
    const totalScores = {
      "Threat Agent": Object.values(scores.threatAgent).reduce((sum, value) => sum + value, 0),
      "Vulnerability": Object.values(scores.vulnerability).reduce((sum, value) => sum + value, 0),
      "Technical Impact": Object.values(scores.technicalImpact).reduce((sum, value) => sum + value, 0),
      "Business Impact": Object.values(scores.businessImpact).reduce((sum, value) => sum + value, 0),
    };

    // คำนวณระดับความเสี่ยงโดยรวม
    const totalRiskScore = Object.values(totalScores).reduce((sum, value) => sum + value, 0);
    const overallRiskLevel = getOverallRiskLevel(totalRiskScore);


    createTable("Risk Summary", ["Category", "Total Score"], Object.entries(totalScores), doc.lastAutoTable.finalY + 10);

    // แสดงระดับความเสี่ยงโดยรวม
    doc.text(`Overall Risk Level: ${overallRiskLevel}`, 14, doc.lastAutoTable.finalY + 10);
    doc.text(`Total Score: ${totalRiskScore}`, 14, doc.lastAutoTable.finalY + 20);
    doc.addPage();
    // เพิ่มกราฟเข้าไปใน PDF
    html2canvas(chartContainerRef.current, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
    
      // คำนวณขนาดของหน้ากระดาษ
      const pageWidth = doc.internal.pageSize.width; // ความกว้างของหน้า PDF
      const pageHeight = doc.internal.pageSize.height; // ความสูงของหน้า PDF
      
      // คำนวณขนาดของกราฟให้เต็มหน้ากระดาษ
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width; // คำนวณอัตราส่วนเพื่อให้กราฟไม่เบี้ยว
    
      // คำนวณตำแหน่ง X, Y เพื่อให้อยู่กึ่งกลาง
      const offsetX = (pageWidth - imgWidth) / 2; // คำนวณให้กราฟอยู่กึ่งกลางในแนวนอน
      const offsetY = (pageHeight - imgHeight) / 2; // คำนวณให้กราฟอยู่กึ่งกลางในแนวตั้ง
    
      // เพิ่มกราฟลงใน PDF ที่ตำแหน่งที่คำนวณไว้
      doc.addImage(imgData, 'PNG', offsetX, offsetY, imgWidth, imgHeight);
    
      const currentDate = new Date();
      const dateString = currentDate.toISOString().slice(0, 10).replace(/-/g, '');
      doc.save(`Risk_Report_${dateString}.pdf`);
    });
    

};

// ฟังก์ชันช่วยแปลงค่าเป็นระดับ Risk Level
const getRiskLevel = (value) => {
    if (value >= 7) return "High Risk";
    if (value >= 5) return "Medium-High Risk";
    if (value >= 3) return "Medium-Low Risk";
    if (value > 0) return "Low Risk";
    return "No Risk";
};

// ฟังก์ชันคำนวณระดับความเสี่ยงโดยรวม
const getOverallRiskLevel = (totalScore) => {
    if (totalScore >= 25) return "High Risk";
    if (totalScore >= 15) return "Medium Risk";
    return "Low Risk";
};


  // ✅ ฟังก์ชันส่งออกเป็น CSV
const exportCSV = () => {
  const csvData = [
      ["Category", "Factor", "Score"],
      ...Object.entries(scores.threatAgent).map(([key, value]) => ["Threat Agent", key, value]),
      ...Object.entries(scores.vulnerability).map(([key, value]) => ["Vulnerability", key, value]),
      ...Object.entries(scores.technicalImpact).map(([key, value]) => ["Technical Impact", key, value]),
      ...Object.entries(scores.businessImpact).map(([key, value]) => ["Business Impact", key, value]),
      ["Threat Agent", "Total", Object.values(scores.threatAgent).reduce((sum, value) => sum + value, 0)],
      ["Vulnerability", "Total", Object.values(scores.vulnerability).reduce((sum, value) => sum + value, 0)],
      ["Technical Impact", "Total", Object.values(scores.technicalImpact).reduce((sum, value) => sum + value, 0)],
      ["Business Impact", "Total", Object.values(scores.businessImpact).reduce((sum, value) => sum + value, 0)],
      ["Total Score: ", Object.values(scores).reduce((sum, category) => sum + Object.values(category).reduce((a, b) => a + b, 0), 0)],
      ["Risk Level: ", calculateRisk()],
  ];

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `Risk_Report_${new Date().toISOString().slice(0, 10)}.csv`);
      link.click();
  }
};

  // ฟังก์ชัน handleChange สำหรับอัปเดต scores
  const handleChange = (event, category, factor) => {
    const value = parseInt(event.target.value);
    setScores((prevScores) => ({
      ...prevScores,
      [category]: {
        ...prevScores[category],
        [factor]: value,
      },
    }));
    setRisk(calculateRisk());
  };
  const [risk, setRisk] = useState(calculateRisk());
  // Reusable Dropdown Component
  const RiskFactorDropdown = ({ category, factor }) => (
    <div className="mb-3">
      <h6>{factor.replace(/([A-Z])/g, ' $1').toUpperCase()}</h6>
      <select
        className="form-control"
        onChange={(e) => handleChange(e, category, factor)}
        value={scores[category][factor]}
      >
        <option value={0}>No Risk</option>
        <option value={1}>Low Risk</option>
        <option value={3}>Medium-Low Risk</option>
        <option value={5}>Medium Risk</option>
        <option value={7}>Medium-High Risk</option>
        <option value={9}>High Risk</option>
      </select>
    </div>
  );

    // ฟังก์ชันเพื่อกำหนดสีและคลาสสำหรับการแสดง alert
    const getRiskAlertClass = (riskLevel) => {
        if (riskLevel === "Low Risk") return "alert-success"; // สีเขียว
        if (riskLevel === "Medium Risk") return "alert-warning"; // สีเหลือง
        return "alert-danger"; // สีแดง
      };

  return (
    <>
        <AuthNavbar />
        <div className="container mt-4">
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><a href="/">Home</a></li>
                    <li className="breadcrumb-item active" aria-current="page">Calculation</li>
                </ol>
            </nav>
        </div>

        <div className="container mt-5 ">
        <span className="d-flex justify-content-center align-items-center gap-2 fs-1 mb-2">
            <i className="fa-solid fa-user-secret"></i> 
        </span>
        <h1 className="text-center">OWASP Risk Calculator</h1>
        {/* แสดงผลเป็น alert */}
    


        <div className="text-center">
        {/* ปุ่มเพื่อเปิด/ปิดกราฟ */}
        <div className="d-flex justify-content-center align-items-center gap-2">
            <button className="btn btn-primary mb-4" onClick={toggleGraph}>
                {showGraph ? 'Hide Graph' : 'Show Graph'}
            </button>
            <button className="btn btn-success mb-4" onClick={saveData}>
                Save Data
            </button>
        </div>

      {showGraph && (
        <div ref={chartContainerRef} className="mt-4 d-flex justify-content-center align-items-center" style={{ width: '100%', height: '400px' }}>
          <Bar
            data={chartData}
            options={{
              responsive: true,  // ทำให้กราฟ responsive
              maintainAspectRatio: false,  // ปิดการรักษาสัดส่วน
              scales: {
                x: {
                  beginAtZero: true,
                },
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      )}
        </div>
        <div className="mt-4 text-center">
            <button className="btn btn-secondary me-2" onClick={exportPDF}><i className="fa-solid fa-arrow-up-from-bracket"></i> Export PDF</button>
            <button className="btn btn-secondary me-2 " onClick={exportCSV}><i className="fa-solid fa-arrow-up-from-bracket"></i> Export CSV</button>
      
        </div>


        {/* <div className="mt-4" ref={chartRef}>
            <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: true, height: 100 }} />
        </div> */}

        <div className="row d-flex justify-content-center gap-5 mt-5">
            <div className="col-md-5 bg-red rounded p-3 text-white shadow-sm ">
            <h3><i className="fa-solid fa-ghost"></i> Threat Agent Factors</h3>
            <hr />
            {["skillLevel", "motive", "opportunity", "size"].map((factor) => (
                <RiskFactorDropdown key={factor} category="threatAgent" factor={factor} />
            ))}
            </div>

            <div className="col-md-5 bg-blue rounded p-3 text-white">
            <h3><i className="fa-solid fa-user-tie"></i> Vulnerability Factors</h3>
            <hr />
            {["easeOfDiscovery", "easeOfExploit", "awareness", "intrusionDetection"].map((factor) => (
                <RiskFactorDropdown key={factor} category="vulnerability" factor={factor} />
            ))}
            </div>

            <div className="col-md-5 bg-yellow rounded p-3 text-white">
            <h3><i className="fa-solid fa-microchip"></i> Technical Impact Factors</h3>
            <hr />
            {["lossOfConfidentiality", "lossOfIntegrity", "lossOfAvailability", "lossOfAccountability"].map((factor) => (
                <RiskFactorDropdown key={factor} category="technicalImpact" factor={factor} />
            ))}
            </div>

            <div className="col-md-5 bg-green rounded p-3 text-white ">
            <h3><i className="fa-solid fa-building"></i> Business Impact Factors</h3>
            <hr />
            {["financialDamage", "reputationDamage", "nonCompliance", "privacyViolation"].map((factor) => (
                <RiskFactorDropdown key={factor} category="businessImpact" factor={factor} />
            ))}
            </div>
        </div>

        <div
        className={`alert ${getRiskAlertClass(risk)} mt-4 position-sticky bottom-0 w-100 mb-1`}
        role="alert"
        >
        Risk Level: {risk}
        </div>


        </div>
        <Footer />
    </>
    
  );
}
