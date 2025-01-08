import NavBar from "../NavBar";
import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import "./manpower.css";
import manpowerData from "../data/manpower_projected.json";
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

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [manpowerInfo, setManpowerInfo] = useState(null);
  const [updatedData, setUpdatedData] = useState({});
  const [teamAssignments, setTeamAssignments] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [originalMembers, setOriginalMembers] = useState([]);
  const [isModifyModalVisible, setIsModifyModalVisible] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);

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

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedEmployee(null);
  };

  const handleEmployeeClick = (employeeId) => {
    const employeeDetails = employees.find((emp) => emp.empId === employeeId);
    setSelectedEmployee(employeeDetails);
  };

  const handleDateChange = (date) => {
    const dateString = date.toLocaleDateString("en-CA");
    setSelectedDate(dateString);
    if (updatedData[dateString]) {
      setTeamAssignments(updatedData[dateString]);
    } else if (manpowerData[dateString]) {
      const data = manpowerData[dateString];
      const assignments = assignTeamMembers(data);
      setTeamAssignments(assignments);
    } else {
      setTeamAssignments(null);
    }
  };

  const assignTeamMembers = (data) => {
    const assignments = {
      T1: [],
      T2: [],
      T3: [],
      T4: [],
      OH: []
    };

    const totalMembers = 40;
    let ids = Array.from({ length: totalMembers }, (_, index) => `id_${String(index + 1).padStart(2, '0')}`);
    const teamRequirements = data.team_details;

    Object.keys(teamRequirements).forEach((team) => {
      const requiredMembers = teamRequirements[team];
      assignments[team] = ids.splice(0, requiredMembers);
    });

    return assignments;
  };

  const handleModifyClick = (team) => {
    setSelectedTeam(team);
    setOriginalMembers([...teamAssignments[team]]);
    setSelectedMembers([...teamAssignments[team]]);
    setShowModal(true);
  };

  const handleAttendance = (team) => {
    setSelectedTeam(team);
    setOriginalMembers([...teamAssignments[team] || []]);
    setSelectedMembers([...teamAssignments[team] || []]);
    setIsModifyModalVisible(true);
  };

  const handleSelectMember = (id) => {
    setSelectedMembers((prevMembers) => {
      if (prevMembers.includes(id)) {
        return prevMembers.filter((member) => member !== id);
      } else {
        return [...prevMembers, id];
      }
    });
  };

  const handleSubmit = () => {
    setTeamAssignments((prevAssignments) => ({
      ...prevAssignments,
      [selectedTeam]: [...selectedMembers],
    }));
    setShowModal(false);
  };

  const handleSubmission = () => {
    setTeamAssignments((prevAssignments) => ({
      ...prevAssignments,
      [selectedTeam]: [...selectedMembers],
    }));

    setIsModifyModalVisible(false);
    setNotificationVisible(true);

    setTimeout(() => {
      setNotificationVisible(false);
    }, 3000);
  };

  const filteredEmployees = selectedCategory
    ? employees.filter((emp) => emp.category === selectedCategory)
    : [];

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
          <h3>Employee Dashboard</h3>
          <div className="employee-categories">
            <button onClick={() => handleCategorySelect("PM Team")}>PM Team</button>
            <button onClick={() => handleCategorySelect("OH Team")}>OH Team</button>
          </div>
          <div className="employee-list">
            {filteredEmployees.map((emp) => (
              <div key={emp.empId} className="employee-id" onClick={() => handleEmployeeClick(emp.empId)}>
                {emp.empId}
              </div>
            ))}
          </div>
          {selectedEmployee && (
            <div className="employee-details">
              <div className="profile-picture">
                <img src="/PROFILE.jpg" alt="Employee Profile" className="profile-img" />
              </div>
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
          <h3>Team Assignments</h3>
        </div>
        <Calendar onChange={handleDateChange} value={selectedDate} />
        {selectedDate && manpowerInfo && (
          <div className="manpower-details">
            <div className="employee-dashboard">
              <h4>Manpower Details for {selectedDate}</h4>
            </div>
            <table style={{ marginBottom: '20px' }}>
              <tbody>
                <tr>
                  <td><strong>T1</strong></td>
                  <td><strong>T2</strong></td>
                  <td><strong>T3</strong></td>
                  <td><strong>T4</strong></td>
                  <td><strong>OH</strong></td>
                </tr>
                <tr>
                  <td>{manpowerInfo.team_details.T1}</td>
                  <td>{manpowerInfo.team_details.T2}</td>
                  <td>{manpowerInfo.team_details.T3}</td>
                  <td>{manpowerInfo.team_details.T4}</td>
                  <td>{manpowerInfo.team_details.OH}</td>
                </tr>
              </tbody>
            </table>
            <table>
              <tbody>
                <tr style={{ backgroundColor: manpowerInfo.projected_present.length < manpowerInfo.required ? 'rgba(255, 99, 71, 0.5)' : 'rgba(144, 238, 144, 0.5)' }}>
                  <td><strong>Required:</strong></td>
                  <td colSpan="2">{manpowerInfo.required}</td>
                </tr>
                <tr>
                  <td><strong>Projected Present:</strong></td>
                  <td><strong>{manpowerInfo.projected_present.length}</strong></td>
                  <td>{manpowerInfo.projected_present.join(", ") || "None"}</td>
                </tr>
                <tr>
                  <td><strong>Projected Absent:</strong></td>
                  <td><strong>{manpowerInfo.projected_absent.length}</strong></td>
                  <td>{manpowerInfo.projected_absent.join(", ") || "None"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {selectedDate && !manpowerInfo && (
          <div className="employee-dashboard">
            <h4>No data available for {selectedDate}</h4>
          </div>
        )}
        {teamAssignments && (
          <div>
            <div className="employee-dashboard">
              <h4>Team Assignments for {selectedDate}</h4>
            </div>
            <table style={{ width: '100%', marginTop: '20px' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(144, 238, 144, 0.5)', fontSize: '18px' }}>
                  <th>Team</th>
                  <th>Assigned Members (IDs)</th>
                  <th>Modify Team Assignment</th>
                  <th>Attendance</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(teamAssignments).map((team) => (
                  <tr key={team}>
                    <td style={{ fontSize: '18px', textAlign: 'center' }}>{team}</td>
                    <td style={{ fontSize: '18px', textAlign: 'center' }}>{teamAssignments[team].join(', ') || 'N/A'}</td>
                    <td style={{ fontSize: '18px', textAlign: 'center' }}>
                      <button onClick={() => handleModifyClick(team)} style={{ color: '#007BFF', fontSize: '18px', textDecoration: 'underline', cursor: 'pointer', fontWeight: 'normal' }}>Modify</button>
                    </td>
                    <td style={{ fontSize: '18px', textAlign: 'center' }}>
                      <button onClick={() => handleAttendance(team)} style={{ color: '#007BFF', fontSize: '18px', textDecoration: 'underline', cursor: 'pointer', fontWeight: 'normal' }}>Record Attendance</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      
      
      {showModal && (
  <div style={modalStyles}>
    <div style={modalContentStyles}>
      <h3
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#333',
          textAlign: 'center',
          marginBottom: '20px',
          borderBottom: '2px solid #4CAF50',
          paddingBottom: '10px',
        }}
      >
        Modify Members for {selectedTeam}
      </h3>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          marginTop: '20px',
          maxHeight: '300px',
          overflowY: 'auto',
        }}
      >
        {Array.from({ length: 40 }, (_, index) => `id_${String(index + 1).padStart(2, '0')}`).map((id) => (
          <div key={id}>
            <input
              type="checkbox"
              id={id}
              checked={selectedMembers.includes(id)}
              onChange={() => handleSelectMember(id)}
              style={{
                marginRight: '10px',
              }}
            />
            <label htmlFor={id} style={{ fontSize: '16px' }}>
              {id}
            </label>
          </div>
        ))}
      </div>
      <div>
        <button
          onClick={handleSubmit}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            marginRight: '10px',
            transition: 'background-color 0.3s ease',
          }}
        >
          Submit
        </button>
        <button
          onClick={() => setShowModal(false)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'background-color 0.3s ease',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

{notificationVisible && (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: '#4CAF50',
      color: 'white',
      padding: '15px',
      textAlign: 'center',
      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
    }}
  >
    Attendance Recorded!
  </div>
)}

{isModifyModalVisible && (
  <div style={modalStyles}>
    <div style={modalContentStyles}>
      <h3
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#333',
          textAlign: 'center',
          marginBottom: '20px',
          borderBottom: '2px solid #4CAF50',
          paddingBottom: '10px',
        }}
      >
        Attendance Record
      </h3>
      <div style={modalContentStyles}>
        <h4
          style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '20px',
            paddingBottom: '10px',
          }}
        >
          PM Team
        </h4>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column', // Stack checkboxes vertically
            gap: '10px', // Consistent gap between each checkbox item
            marginTop: '20px', // Space from the top
          }}
        >
          {Array.from({ length: 20 }, (_, index) => `id_${String(index + 1).padStart(2, '0')}`).map((id) => (
            <div key={id}>
              <input
                type="checkbox"
                id={id}
                checked={selectedMembers.includes(id)}
                onChange={() => handleSelectMember(id)}
                style={{
                  marginRight: '10px',
                }}
              />
              <label htmlFor={id} style={{ fontSize: '16px' }}>
                {id}
              </label>
            </div>
          ))}
        </div>
        <br />
        <hr />
        <br />
        <h4
          style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '20px',
            paddingBottom: '10px',
          }}
        >
          OH Team
        </h4>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column', // Stack checkboxes vertically
            gap: '10px', // Same gap as PM Team for consistency
            marginTop: '20px', // Space from the top
          }}
        >
          {Array.from({ length: 20 }, (_, index) => `id_${String(index + 21).padStart(2, '0')}`).map((id) => (
            <div key={id}>
              <input
                type="checkbox"
                id={id}
                checked={selectedMembers.includes(id)}
                onChange={() => handleSelectMember(id)}
                style={{
                  marginRight: '10px', // Space between checkbox and label
                  
                }}
              />
              <label htmlFor={id} style={{ fontSize: '16px' }}>
                {id}
              </label>
            </div>
          ))}
        </div> 
      </div>
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={handleSubmission}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px',
          }}
        >
          Submit
        </button>
        <button
          onClick={() => setIsModifyModalVisible(false)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

<div className="employee-dashboard">
    <hr />
    
    <br />
    <h3>Progress Projections</h3>
    
    <Bar data={progressProjectionData} options={{ indexAxis: 'y' }} />
  </div>
  </div>
  </>
  );
};
const modalStyles = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const modalContentStyles = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '5px',
  width: '80%',
  maxHeight: '80%',
  overflowY: 'auto',
};

export default Manpower;
