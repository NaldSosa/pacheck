document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.querySelector('.sidebar');
  const sidebarToggler = document.querySelector('.sidebar-toggler');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.content-section');
  const topBarTitle = document.getElementById('topBarTitle');

  const profileToggle = document.getElementById('profileToggle');
  const profileDropdown = document.getElementById('profileDropdown');

  const bell = document.querySelector('.notification');
  const notificationDropdown = document.getElementById('notificationDropdown');

  const sectionTitles = {
    "#dashboard": "Dashboard",
    "#assessment-list": "Assessment List",
    "#reports": "Reports",
    "#scheduling": "Scheduling",
    "#user-management": "User Management",
    "#system-configuration": "System Configuration",
    "#record-management": "Record Management",
    "#security-audit": "Security & Audit Logs",
    "#sync-management": "Sync Management"
  };

  if (sidebarToggler) {
    sidebarToggler.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
    });
  }

  const savedPath = localStorage.getItem("activeNav");
  if (savedPath) {
    const savedLink = [...navLinks].find(link => link.getAttribute("href") === savedPath);
    if (savedLink) setActiveLink(savedLink);
  } else {
    const defaultLink = document.querySelector('.nav-link[href="#dashboard"]');
    if (defaultLink) setActiveLink(defaultLink);
  }

  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      setActiveLink(link);
      localStorage.setItem("activeNav", link.getAttribute("href"));

      if (link.getAttribute("href") === "#scheduling") {
        setTimeout(renderCalendar, 50);
      }
    });
  });

  function setActiveLink(activeLink) {
    navLinks.forEach(link => link.classList.remove("active"));
    activeLink.classList.add("active");

    const href = activeLink.getAttribute("href");
    if (topBarTitle) topBarTitle.textContent = sectionTitles[href] || "Dashboard";

    sections.forEach(section => section.hidden = true);
    const target = document.querySelector(`[id^="${href.substring(1)}"]`);
    if (target) target.hidden = false;
  }

  // Dropdowns
  bell.addEventListener('click', (e) => {
    e.stopPropagation();
    notificationDropdown.style.display = notificationDropdown.style.display === 'block' ? 'none' : 'block';
    profileDropdown.style.display = 'none';
  });

  profileToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    profileDropdown.style.display = profileDropdown.style.display === 'block' ? 'none' : 'block';
    notificationDropdown.style.display = 'none';
  });

  document.addEventListener('click', (e) => {
    if (!notificationDropdown.contains(e.target) && !bell.contains(e.target)) {
      notificationDropdown.style.display = 'none';
    }
    if (!profileDropdown.contains(e.target) && !profileToggle.contains(e.target)) {
      profileDropdown.style.display = 'none';
    }
  });

  // Charts
  const ctxPie = document.getElementById('riskPie');
  if (ctxPie) {
    new Chart(ctxPie, {
      type: 'doughnut',
      data: {
        labels: ['Modifiable', 'Non-Modifiable'],
        datasets: [{
          data: [68, 32],
          backgroundColor: ['#4caf50', '#e53935']
        }]
      }
    });
  }

  const ctxBar = document.getElementById('riskBar');
  if (ctxBar) {
    new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: ['Smoking', 'Alcohol', 'Inactivity', 'Obesity'],
        datasets: [{
          label: 'Risk %',
          data: [60, 50, 40, 30],
          backgroundColor: '#ff7043'
        }]
      }
    });
  }

  const ctxMeasles = document.getElementById('measlesChart');
  if (ctxMeasles) {
    new Chart(ctxMeasles, {
      type: 'bar',
      data: {
        labels: ['0-4', '5-9', '10-14', '15-19', '20-24', '25-29'],
        datasets: [
          {
            label: 'Male',
            data: [50, 40, 30, 20, 15, 10],
            backgroundColor: '#42a5f5'
          },
          {
            label: 'Female',
            data: [45, 35, 25, 20, 10, 5],
            backgroundColor: '#ef5350'
          }
        ]
      },
      options: {
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  // Calendar Setup
  window.renderCalendar = function () {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    if (window.calendar) {
      window.calendar.destroy();
    }

    window.calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      selectable: true,
      events: []
    });

    window.calendar.render();
  };

  // Schedule Modal Functions
  window.openScheduleForm = function () {
    document.getElementById('scheduleForm').style.display = 'block';
  };

  window.closeScheduleForm = function () {
    document.getElementById('scheduleForm').style.display = 'none';
  };

  window.addSchedule = function () {
    const title = document.getElementById('scheduleTitle').value;
    const date = document.getElementById('scheduleDate').value;
    const start = document.getElementById('startTime').value;
    const end = document.getElementById('endTime').value;

    if (!title || !date || !start || !end) {
      alert("Please complete all fields.");
      return;
    }

    const calendarApi = window.calendar.getApi();
    calendarApi.addEvent({
      title: title,
      start: `${date}T${start}`,
      end: `${date}T${end}`
    });

    window.closeScheduleForm();
  };

  // -------------------------------
  // User Management Functions
  // -------------------------------

  // Tab Switch Logic for User Management
  const usersTabBtn = document.getElementById('usersTabBtn');
  const addUserTabBtn = document.getElementById('addUserTabBtn');
  const userListSection = document.getElementById('userListSection');
  const addUserForm = document.getElementById('addUserForm');

  if (usersTabBtn && addUserTabBtn && userListSection && addUserForm) {
    usersTabBtn.addEventListener('click', () => {
      usersTabBtn.classList.add('active');
      addUserTabBtn.classList.remove('active');
      userListSection.style.display = 'block';
      addUserForm.style.display = 'none';
    });

    addUserTabBtn.addEventListener('click', () => {
      usersTabBtn.classList.remove('active');
      addUserTabBtn.classList.add('active');
      userListSection.style.display = 'none';
      addUserForm.style.display = 'block';
      document.getElementById('userForm').reset();
      handleRoleChange(); // reset location dropdowns visibility
    });
  }

  // Show/hide Barangay or Assigned Office field based on role
  window.handleRoleChange = function () {
    const role = document.getElementById('role').value;
    const barangayField = document.getElementById('barangayField');
    const assignedOfficeField = document.getElementById('assignedOfficeField');

    if (role === 'bhw') {
      barangayField.style.display = 'block';
      assignedOfficeField.style.display = 'none';
    } else if (role === 'mho') {
      barangayField.style.display = 'none';
      assignedOfficeField.style.display = 'block';
    } else {
      barangayField.style.display = 'none';
      assignedOfficeField.style.display = 'none';
    }
  };

  document.getElementById('role').addEventListener('change', handleRoleChange);

  // Handle Add User Form Submission
  document.getElementById('userForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const firstName = document.getElementById('firstName').value.trim();
    const middleName = document.getElementById('middleName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const birthdate = document.getElementById('birthdate').value;
    const age = document.getElementById('age').value;
    const sex = document.getElementById('sex').value;
    const address = document.getElementById('address').value.trim();
    const contactNumber = document.getElementById('contactNumber').value.trim();
    const email = document.getElementById('email').value.trim();
    const role = document.getElementById('role').value;
    const barangay = document.getElementById('barangay').value;
    const assignedOffice = document.getElementById('assignedOffice').value;
    const status = document.getElementById('status').value;
    const password = document.getElementById('password').value;

    let location = "-";
    if (role === 'bhw') {
      location = barangay;
      if (!location) {
        alert("Please select a barangay.");
        return;
      }
    } else if (role === 'mho') {
      location = assignedOffice;
      if (!location) {
        alert("Please select an RHU.");
        return;
      }
    }

    const tableBody = document.querySelector('#userTable tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
      <td>${fullName}</td>
      <td>${email}</td>
      <td>${location}</td>
      <td>${role.toUpperCase()}</td>
      <td><span class="status ${status}">${capitalize(status)}</span></td>
      <td>
        <button class="view-btn" onclick="editUser()">Edit</button>
        <button class="view-btn danger" onclick="deleteUser()">Delete</button>
      </td>
    `;
    tableBody.appendChild(newRow);

    this.reset();
    handleRoleChange();
    usersTabBtn.click();
    updateUserCount();
  });

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function updateUserCount() {
    const count = document.querySelectorAll('#userTable tbody tr').length;
    const counter = document.querySelector('.user-count');
    if (counter) counter.textContent = `(${count})`;
  }

  const togglePicker = document.getElementById('togglePicker');
  const popup = document.getElementById('datePickerPopup');
  const fromInput = document.getElementById('fromDate');
  const toInput = document.getElementById('toDate');
  const displayInput = document.getElementById('dateRangeInput');

  if (togglePicker && popup) {
    togglePicker.addEventListener('click', () => {
      popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
    });
  }

  window.setPreset = function (days) {
    const now = new Date();
    const from = new Date();
    from.setDate(now.getDate() - days);
    fromInput.value = from.toISOString().slice(0, 10);
    toInput.value = now.toISOString().slice(0, 10);
  };

  window.applyDateFilter = function () {
    const from = new Date(fromInput.value);
    const to = new Date(toInput.value);
    if (!from || !to || isNaN(from) || isNaN(to)) return;

    document.querySelectorAll('#assessmentTable tbody tr').forEach(row => {
      const rowDate = new Date(row.getAttribute('data-date'));
      row.style.display = (rowDate >= from && rowDate <= to) ? '' : 'none';
    });

    displayInput.value = `${from.toLocaleDateString()} - ${to.toLocaleDateString()}`;
    popup.style.display = 'none';
  };

  document.addEventListener('click', function (e) {
    if (!popup.contains(e.target) && !togglePicker.contains(e.target) && !displayInput.contains(e.target)) {
      popup.style.display = 'none';
    }
  });

  window.toggleFilterDropdown = function (button) {
  const dropdown = button.closest('.custom-dropdown');
  const menu = dropdown.querySelector('.dropdown-menu');

  // Close others first
  document.querySelectorAll('.dropdown-menu').forEach(m => {
    if (m !== menu) m.style.display = 'none';
  });

  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  };

  window.selectFilterOption = function (button, value) {
    const dropdown = button.closest('.custom-dropdown');
    const labelSpan = dropdown.querySelector('.label');
    labelSpan.textContent = value;

    const menu = dropdown.querySelector('.dropdown-menu');
    menu.style.display = 'none';

    const filterType = dropdown.getAttribute('data-filter-type');
    console.log(`${filterType} selected: ${value}`);
  };

  // Security Audit Date Picker Logic
  const auditTogglePicker = document.getElementById('auditTogglePicker');
  const auditPopup = document.getElementById('auditDatePickerPopup');
  const auditFromInput = document.getElementById('auditFromDate');
  const auditToInput = document.getElementById('auditToDate');
  const auditDisplayInput = document.getElementById('auditDateRangeInput');

  if (auditTogglePicker && auditPopup) {
    auditTogglePicker.addEventListener('click', () => {
      auditPopup.style.display = auditPopup.style.display === 'block' ? 'none' : 'block';
    });
  }

  window.setAuditPreset = function (days) {
  const now = new Date();
  const from = new Date();

  if (days === 0) {
    // Today
    from.setHours(0, 0, 0, 0);
  } else if (days === 1) {
    // Yesterday
    from.setDate(now.getDate() - 1);
    now.setDate(now.getDate() - 1);
  } else {
    from.setDate(now.getDate() - days);
  }

  document.getElementById('auditFromDate').value = from.toISOString().slice(0, 10);
  document.getElementById('auditToDate').value = now.toISOString().slice(0, 10);
  };

  window.applyAuditDateFilter = function () {
    const from = new Date(auditFromInput.value);
    const to = new Date(auditToInput.value);
    if (!from || !to || isNaN(from) || isNaN(to)) return;

    document.querySelectorAll('#auditLogTable tbody tr').forEach(row => {
      const rowText = row.cells[5].textContent.trim(); // Date & Time column
      const rowDate = new Date(rowText);
      row.style.display = (rowDate >= from && rowDate <= to) ? '' : 'none';
    });

    auditDisplayInput.value = `${from.toLocaleDateString()} - ${to.toLocaleDateString()}`;
    auditPopup.style.display = 'none';
  };

  document.addEventListener('click', function (e) {
    if (!auditPopup.contains(e.target) && !auditTogglePicker.contains(e.target) && !auditDisplayInput.contains(e.target)) {
      auditPopup.style.display = 'none';
    }
  });

  const activeTabBtn = document.getElementById("activeTabBtn");
  const archivedTabBtn = document.getElementById("archivedTabBtn");

  if (activeTabBtn && archivedTabBtn) {
    activeTabBtn.addEventListener("click", showActiveRecords);
    archivedTabBtn.addEventListener("click", showArchivedRecords);
  }

  function showActiveRecords() {
    document.getElementById("activeRecordBody").style.display = "";
    document.getElementById("archivedRecordBody").style.display = "none";

    activeTabBtn.classList.add("active");
    archivedTabBtn.classList.remove("active");
  }

  function showArchivedRecords() {
    document.getElementById("activeRecordBody").style.display = "none";
    document.getElementById("archivedRecordBody").style.display = "";

    archivedTabBtn.classList.add("active");
    activeTabBtn.classList.remove("active");
  }

  // -------------------------------
// Reports Section Logic
// -------------------------------
const sampleReports = [
  { name: "Juan Dela Cruz", sex: "Male", age: 45, address: "Brgy 1", risk: "High", diagnosis: "Hypertension", date: "2025-07-05", encoder: "BHW 1" },
  { name: "Maria Santos", sex: "Female", age: 50, address: "Brgy 2", risk: "Moderate", diagnosis: "Diabetes", date: "2025-07-10", encoder: "BHW 2" },
  { name: "Ana Reyes", sex: "Female", age: 38, address: "Brgy 1", risk: "Low", diagnosis: "None", date: "2025-07-12", encoder: "BHW 3" }
];

window.filterReports = function () {
  const location = document.getElementById("locationFilter").value;
  const sex = document.getElementById("sexFilter").value;
  const risk = document.getElementById("riskFilter").value;

  const filtered = sampleReports.filter((row) => {
    return (
      (location === "" || row.address === location) &&
      (sex === "" || row.sex === sex) &&
      (risk === "" || row.risk === risk)
    );
  });

  updateReportTable(filtered);
  updateReportSummary(filtered);
  updateReportCharts(filtered);
};

function updateReportTable(data) {
  const tbody = document.querySelector("#reportTable tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  data.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.name}</td>
      <td>${row.sex}</td>
      <td>${row.age}</td>
      <td>${row.address}</td>
      <td>${row.risk}</td>
      <td>${row.diagnosis}</td>
      <td>${row.date}</td>
      <td>${row.encoder}</td>
    `;
    tbody.appendChild(tr);
  });
}

function updateReportSummary(data) {
  document.getElementById("totalAssessments").innerText = data.length;
  document.getElementById("atRiskPatients").innerText = data.filter(d => d.risk === "High" || d.risk === "Moderate").length;
  document.getElementById("newHypertension").innerText = data.filter(d => d.diagnosis.includes("Hypertension")).length;
  document.getElementById("newDiabetes").innerText = data.filter(d => d.diagnosis.includes("Diabetes")).length;
}

// Charts
let reportBarChart, reportPieChart;
function updateReportCharts(data) {
  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString("en", { month: "short" })
  );

  const monthlyCount = Array(12).fill(0);
  data.forEach((row) => {
    const month = new Date(row.date).getMonth();
    monthlyCount[month]++;
  });

  const riskLevels = { Low: 0, Moderate: 0, High: 0 };
  data.forEach((row) => {
    if (riskLevels[row.risk] !== undefined) riskLevels[row.risk]++;
  });

  if (reportBarChart) reportBarChart.destroy();
  if (reportPieChart) reportPieChart.destroy();

  const barCanvas = document.getElementById("barChart");
  const pieCanvas = document.getElementById("pieChart");

  if (barCanvas) {
    reportBarChart = new Chart(barCanvas, {
      type: "bar",
      data: {
        labels: months,
        datasets: [{
          label: "Monthly Assessments",
          data: monthlyCount,
          backgroundColor: "#2e7d32"
        }]
      },
      options: { responsive: true }
    });
  }

  if (pieCanvas) {
    reportPieChart = new Chart(pieCanvas, {
      type: "pie",
      data: {
        labels: Object.keys(riskLevels),
        datasets: [{
          label: "Risk Distribution",
          data: Object.values(riskLevels),
          backgroundColor: ["#81c784", "#ffb74d", "#e57373"]
        }]
      },
      options: { responsive: true }
    });
  }
}

// Export Functions
window.exportToCSV = function () {
  let csv = "Name,Sex,Age,Address,Risk Level,Diagnosis,Date,Encoder\n";
  sampleReports.forEach((r) => {
    csv += `${r.name},${r.sex},${r.age},${r.address},${r.risk},${r.diagnosis},${r.date},${r.encoder}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "coras_report.csv";
  link.click();
};

window.exportToPDF = function () {
  const content = document.querySelector("#reportTable").outerHTML;
  const printWin = window.open("", "", "width=900,height=650");
  printWin.document.write(`<html><head><title>CoRAS Report</title></head><body>${content}</body></html>`);
  printWin.document.close();
  printWin.print();
};

// Initial report rendering
filterReports();
  
});

// Open modal
function openAssessmentModal() {
  document.getElementById('assessmentModal').style.display = 'flex';
}

// Close modal
function closeAssessmentModal() {
  document.getElementById('assessmentModal').style.display = 'none';
}
