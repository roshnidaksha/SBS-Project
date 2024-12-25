import NavBar from "../NavBar";
import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import "./manpower.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Calendar from "react-calendar"; // You'll need to install this library: `npm install react-calendar`

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const Manpower = () => {
  const initialAttendance = {
    E1: { present: 0, required: 20 },
    E2: { present: 0, required: 20 },
    E3: { present: 0, required: 20 },
    E4: { present: 0, required: 20 },
    E5: { present: 0, required: 20 },
    E6: { present: 0, required: 20 },
    E7: { present: 0, required: 20 },
    W1: { present: 0, required: 20 },
    W2: { present: 0, required: 20 },
    W3: { present: 0, required: 20 },
    W4: { present: 0, required: 20 },
  };

  const initialEmployeeData = {
    empId: "S7277272727",
    firstName: "John",
    lastName: "Doe",
    position: "Developer",
    assignedTeam: "Team A",
    assignedTrack: "Track 1",
  };

  const [attendance, setAttendance] = useState(initialAttendance);
  const [selectedDate, setSelectedDate] = useState(null);
  const [submittedData, setSubmittedData] = useState({});
  const [employeeData, setEmployeeData] = useState(initialEmployeeData);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const employees = [
    { empId: "S7277272727", firstName: "John", lastName: "Doe", position: "Developer", assignedTeam: "Team A", assignedTrack: "Track 1", category: "Supervisor Support" },
    { empId: "S8277272728", firstName: "Jane", lastName: "Smith", position: "Designer", assignedTeam: "Team B", assignedTrack: "Track 2", category: "Technical Support" },
    { empId: "S9277272729", firstName: "Alice", lastName: "Johnson", position: "Manager", assignedTeam: "Team C", assignedTrack: "Track 3", category: "HR Support" },
    { empId: "S1027272730", firstName: "Bob", lastName: "Brown", position: "Developer", assignedTeam: "Team A", assignedTrack: "Track 1", category: "Supervisor Support" },
    { empId: "S2027272731", firstName: "Eve", lastName: "Davis", position: "Manager", assignedTeam: "Team B", assignedTrack: "Track 2", category: "Technical Support" },
    { empId: "S3027272732", firstName: "Tom", lastName: "Wilson", position: "Designer", assignedTeam: "Team C", assignedTrack: "Track 3", category: "HR Support" },
  ];

  const handleAttendanceChange = (track, field, value) => {
    const updatedAttendance = { ...attendance };
    updatedAttendance[track][field] = parseInt(value, 10) || 0;
    setAttendance(updatedAttendance);
  };

  const handleEmployeeDataChange = (field, value) => {
    const updatedEmployeeData = { ...employeeData };
    updatedEmployeeData[field] = value;
    setEmployeeData(updatedEmployeeData);
  };

  const handleSubmit = () => {
    if (selectedDate) {
      setSubmittedData((prevData) => ({
        ...prevData,
        [selectedDate]: { ...attendance },
      }));
      alert("Data submitted for " + selectedDate);
    }
  };

  const calculateShortages = (day) => {
    const shortages = [];
    const dayData = submittedData[day] || {};
    Object.keys(dayData).forEach((track) => {
      const present = dayData[track]?.present || 0;
      const required = dayData[track]?.required || 0;
      if (present < required) {
        shortages.push({ track, shortage: required - present });
      }
    });
    return shortages;
  };

  const handleDateChange = (date) => {
    setSelectedDate(date.toLocaleDateString());
    setAttendance(initialAttendance);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedEmployee(null);
  };

  const handleEmployeeClick = (employeeId) => {
    const employeeDetails = employees.find((emp) => emp.empId === employeeId);
    setSelectedEmployee(employeeDetails);
  };

  const shortages = selectedDate ? calculateShortages(selectedDate) : [];
  const filteredEmployees = selectedCategory
    ? employees.filter((emp) => emp.category === selectedCategory)
    : [];

  // Sample data for Progress Projections chart
  const progressProjectionData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'], // X-axis labels
    datasets: [
      {
        label: 'Projected Attendance',
        data: [15, 18, 19, 20, 21], // Example data, should be replaced with actual projections
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
      {
        label: 'Required Attendance',
        data: [20, 20, 20, 20, 20], // Required attendance data
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
      },
    ],
  };

  return (
    <>
    <NavBar />
    <div className="manpower-container">
      

      <div className="employee-dashboard">
        <h2>Employee Dashboard</h2>
        
        <div className="employee-categories">
          <button onClick={() => handleCategorySelect("Supervisor Support")}>Supervisor Support</button>
          <button onClick={() => handleCategorySelect("Technical Support")}>Technical Support</button>
          <button onClick={() => handleCategorySelect("HR Support")}>HR Support</button>
        </div>

        <div className="employee-list">
          {filteredEmployees.map((emp) => (
            <div
              key={emp.empId}
              className="employee-id"
              onClick={() => handleEmployeeClick(emp.empId)}
            >
              {emp.empId} - {emp.firstName} {emp.lastName}
            </div>
          ))}
        </div>

        {selectedEmployee && (
          <div className="employee-details">
            <div>
              <label>Employee ID:</label>
              <input type="text" value={selectedEmployee.empId} readOnly />
            </div>
            <div>
              <label>First Name:</label>
              <input type="text" value={selectedEmployee.firstName} readOnly />
            </div>
            <div>
              <label>Last Name:</label>
              <input type="text" value={selectedEmployee.lastName} readOnly />
            </div>
            <div>
              <label>Position:</label>
              <input type="text" value={selectedEmployee.position} readOnly />
            </div>
            <div>
              <label>Assigned Team:</label>
              <input type="text" value={selectedEmployee.assignedTeam} readOnly />
            </div>
            <div>
              <label>Assigned Track:</label>
              <input type="text" value={selectedEmployee.assignedTrack} readOnly />
            </div>
          </div>
        )}
      </div>

      <div className="employee-dashboard">
      <hr />
      <br />
        <h2>Attendance and Shortage</h2>
        
      </div>

      
        <Calendar onChange={handleDateChange} value={new Date()} />
      
      {selectedDate && (
        <div className="shortages-section">
          <h3>Manpower for {selectedDate}</h3>
          <table>
            <thead>
              <tr>
                <th>Track</th>
                <th>Present</th>
                <th>Required</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(attendance).map((track) => (
                <tr key={track}>
                  <td>{track}</td>
                  <td>
                    <input
                      type="number"
                      value={attendance[track].present}
                      onChange={(e) =>
                        handleAttendanceChange(track, "present", e.target.value)
                      }
                    />
                  </td>
                  <td>{attendance[track].required}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="submit-button" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      )}

      {selectedDate && shortages.length > 0 && (
        <div className="shortages-section">
          <h3>Shortages for {selectedDate}</h3>
          <ul>
            {shortages.map((shortage) => (
              <li key={shortage.track}>
                {shortage.track}: {shortage.shortage} more required
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Progress Projections Section */}
      <div className="employee-dashboard">
      <hr />
      <br />
        <h2>Progress Projections</h2>
        
        <Line data={progressProjectionData} />
      </div>
    </div>
    </>
  );
};

export default Manpower;
