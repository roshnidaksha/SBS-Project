import NavBar from "../NavBar";
import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2"; 
import "./manpower.css";
import manpowerData from "../data/manpower.json";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Calendar from "react-calendar"; 

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Manpower = () => {
  const initialAttendance = {
    E1: { present: 0, required: 0 },
    E2: { present: 0, required: 0 },
    E3: { present: 0, required: 0 },
    E4: { present: 0, required: 0 },
    E5: { present: 0, required: 0 },
    E6: { present: 0, required: 0 },
    E7: { present: 0, required: 0 },
    W1: { present: 0, required: 0 },
    W2: { present: 0, required: 0 },
    W3: { present: 0, required: 0 },
    W4: { present: 0, required: 0 },
  };

  const initialEmployeeData = {
    empId: "id_1",
    firstName: "John",
    lastName: "Doe",
    position: "Lead",
    category: "PM Team",
  };

  const [attendance, setAttendance] = useState(initialAttendance);
  const [selectedDate, setSelectedDate] = useState(null);
  const [submittedData, setSubmittedData] = useState({});
  const [employeeData, setEmployeeData] = useState(initialEmployeeData);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [manpowerInfo, setManpowerInfo] = useState(null);



  const employees = [
    { empId: "id_1", firstName: "John", lastName: "Doe", position: "Lead", category: "PM Team" },
    { empId: "id_2", firstName: "Jane", lastName: "Smith", position: "Support", category: "PM Team" },
    { empId: "id_5", firstName: "Alice", lastName: "Johnson", position: "Support", category: "PM Team" },
    { empId: "id_9", firstName: "Bob", lastName: "Brown", position: "Lead", category: "PM Team" },
    { empId: "id_3", firstName: "Eve", lastName: "Davis", position: "Manager", category: "PM Team" },
    { empId: "id_6", firstName: "Tom", lastName: "Wilson", position: "Support", category: "PM Team" },
    { empId: "id_4", firstName: "John", lastName: "Doe", position: "Lead", category: "OH Team" },
    { empId: "id_10", firstName: "Jane", lastName: "Smith", position: "Support", category: "OH Team" },
    { empId: "id_11", firstName: "Alice", lastName: "Johnson", position: "Support", category: "OH Team" },
    { empId: "id_16", firstName: "Bob", lastName: "Brown", position: "Lead", category: "OH Team" },
    { empId: "id_8", firstName: "Eve", lastName: "Davis", position: "Manager", category: "OH Team" },
    { empId: "id_6", firstName: "Tom", lastName: "Wilson", position: "Support", category: "OH Team" },
  ];
  useEffect(() => {
    if (selectedDate) {
      const formattedDate = new Date(selectedDate).toISOString().split("T")[0];
      setManpowerInfo(manpowerData[formattedDate] || null);
    }
  }, [selectedDate]);

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
    setSelectedDate(date.toISOString().split("T")[0]);
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

  // Dummy data for horizontal bar graph
  const progressProjectionData = {
    labels: ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "W1", "W2", "W3", "W4"],
    datasets: [
      {
        label: "Progress Percentage",
        data: [53, 85, 88, 36, 12, 80, 50, 60, 78, 42, 85], 
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
        borderWidth: 1,
      },
      {
        label: "Absence Percentage",
        data: [5, 0, 3.33, 0, 6.66, 10.4, 2.5, 5, 0, 1, 0], 
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: true,
        borderWidth: 1,
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
            <button onClick={() => handleCategorySelect("PM Team")}>PM Team</button>
            <button onClick={() => handleCategorySelect("OH Team")}>OH Team</button>
          </div>

          <div className="employee-list">
            {filteredEmployees.map((emp) => (
              <div
                key={emp.empId}
                className="employee-id"
                onClick={() => handleEmployeeClick(emp.empId)}
              >
                {emp.empId}
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
            </div>
          )}
        </div>
 

        <div className="employee-dashboard">
          <hr />
          <br />
          <h2>Attendance and Shortage</h2>
        </div>

        <Calendar onChange={handleDateChange} value={new Date()} />
        {selectedDate && manpowerInfo && (
          <div className="manpower-details">
            <div className="employee-dashboard">
            <h2>Manpower Details for {selectedDate}</h2>
            </div>
            <table>
              <tbody>
                <tr>
                  <td><strong>Required:</strong></td>
                  <td>{manpowerInfo.required}</td>
                </tr>
                <tr>
                  <td><strong>Projected Present:</strong></td>
                  <td>{manpowerInfo.projected_present.join(", ") || "None"}</td>
                </tr>
                <tr>
                  <td><strong>Projected Absent:</strong></td>
                  <td>{manpowerInfo.projected_absent.join(", ") || "None"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {selectedDate && !manpowerInfo && (
          <div className="employee-dashboard">
            <h2>No data available for {selectedDate}</h2>
          </div>
        )}
        {selectedDate && (
          <div className="shortages-section">
            <h3>Manpower Record for {selectedDate}</h3>
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
                    <td>
                      <input
                        type="number"
                        value={attendance[track].required}
                        onChange={(e) =>
                          handleAttendanceChange(track, "required", e.target.value)
                        }
                      />
                    </td>
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
 
        <div className="employee-dashboard">
          <hr />
          <br />
          <h2>Progress Projections</h2>
          
          <Bar data={progressProjectionData} options={{ indexAxis: 'y' }} />
        </div>
      </div>
    </>
  );
};

export default Manpower;
