const API_URL = '/api/reports';

// Global State
let reportsData = [];
let isEditing = false;

// DOM Elements
const reportForm = document.getElementById('reportForm');
const reportsList = document.getElementById('reportsList');
const loadingIndicator = document.getElementById('loadingIndicator');
const noReportsMsg = document.getElementById('noReportsMsg');
const alertBox = document.getElementById('alertBox');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');

const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const statusGroup = document.getElementById('statusGroup');
const editReportId = document.getElementById('editReportId');

// Dashboard Elements
const totalReportsEl = document.getElementById('totalReports');
const pendingReportsEl = document.getElementById('pendingReports');
const reviewReportsEl = document.getElementById('reviewReports');
const resolvedReportsEl = document.getElementById('resolvedReports');

// Modal Elements
const viewModal = document.getElementById('viewModal');
const closeModalBtn = document.getElementById('closeModal');
const modalDetails = document.getElementById('modalDetails');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchReports();
});

// Fetch all reports
async function fetchReports() {
    try {
        loadingIndicator.classList.remove('hidden');
        reportsList.innerHTML = '';
        noReportsMsg.classList.add('hidden');

        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.success) {
            reportsData = data.data;
            renderReports(reportsData);
            updateDashboard(reportsData);
        } else {
            showAlert(data.message || 'Failed to load reports', 'error');
        }
    } catch (error) {
        console.error('Error fetching reports:', error);
        showAlert('Failed to connect to the server.', 'error');
    } finally {
        loadingIndicator.classList.add('hidden');
    }
}

// Render reports to the DOM
function renderReports(reportsToRender) {
    reportsList.innerHTML = '';

    if (reportsToRender.length === 0) {
        noReportsMsg.classList.remove('hidden');
        return;
    }

    noReportsMsg.classList.add('hidden');

    reportsToRender.forEach(report => {
        const card = document.createElement('div');
        card.className = 'report-card';
        
        // Fix spaces in status for CSS class
        const statusClass = `status-${report.status.replace(' ', '-')}`;

        card.innerHTML = `
            <div class="report-header">
                <div>
                    <span class="report-id">${report.id}</span>
                    <h3 class="report-title">${report.reporterName}</h3>
                </div>
                <span class="status-badge ${statusClass}">${report.status}</span>
            </div>
            <div class="report-meta">
                <span><strong>Type:</strong> ${report.incidentType}</span>
                <span><strong>Amount:</strong> ₹${report.amount}</span>
                <span><strong>Date:</strong> ${report.incidentDate}</span>
            </div>
            <p class="report-desc">${report.description}</p>
            <div class="report-actions">
                <button class="btn btn-sm btn-outline" onclick="viewReport('${report.id}')">View</button>
                <button class="btn btn-sm btn-primary" onclick="editReport('${report.id}')">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteReport('${report.id}')">Delete</button>
            </div>
        `;

        reportsList.appendChild(card);
    });
}

// Update Dashboard Stats
function updateDashboard(reports) {
    const total = reports.length;
    const pending = reports.filter(r => r.status === 'Pending').length;
    const review = reports.filter(r => r.status === 'Under Review').length;
    const resolved = reports.filter(r => r.status === 'Resolved').length;

    totalReportsEl.textContent = total;
    pendingReportsEl.textContent = pending;
    reviewReportsEl.textContent = review;
    resolvedReportsEl.textContent = resolved;
}

// Form Submission (Create or Update)
reportForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    const reportData = {
        reporterName: document.getElementById('reporterName').value.trim(),
        contactNumber: document.getElementById('contactNumber').value.trim(),
        incidentDate: document.getElementById('incidentDate').value,
        transactionInfo: document.getElementById('transactionInfo').value.trim(),
        amount: Number(document.getElementById('amount').value),
        incidentType: document.getElementById('incidentType').value,
        description: document.getElementById('description').value.trim(),
        additionalInfo: document.getElementById('additionalInfo').value.trim()
    };

    if (isEditing) {
        reportData.status = document.getElementById('statusSelect').value;
        const id = editReportId.value;
        await updateReport(id, reportData);
    } else {
        await createReport(reportData);
    }
});

// Basic Frontend Validation
function validateForm() {
    let isValid = true;
    
    // Clear previous errors
    document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');

    const name = document.getElementById('reporterName').value.trim();
    if (name.length < 2) {
        document.getElementById('nameError').textContent = 'Name must be at least 2 characters';
        isValid = false;
    }

    const contact = document.getElementById('contactNumber').value.trim();
    const contactRegex = /^[0-9]{10}$/;
    if (!contactRegex.test(contact)) {
        document.getElementById('contactError').textContent = 'Enter a valid 10-digit number';
        isValid = false;
    }

    const amount = document.getElementById('amount').value;
    if (amount <= 0) {
        document.getElementById('amountError').textContent = 'Amount must be greater than 0';
        isValid = false;
    }

    const date = document.getElementById('incidentDate').value;
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0,0,0,0);
    if (selectedDate > today) {
        document.getElementById('dateError').textContent = 'Incident date cannot be in the future';
        isValid = false;
    }

    const desc = document.getElementById('description').value.trim();
    if (desc.length < 10) {
        document.getElementById('descError').textContent = 'Description must be at least 10 characters';
        isValid = false;
    }

    return isValid;
}

// Create Report API Call
async function createReport(data) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();

        if (result.success) {
            showAlert('Report created successfully', 'success');
            reportForm.reset();
            fetchReports();
        } else {
            showAlert(result.message || 'Failed to create report', 'error');
        }
    } catch (error) {
        console.error('Create error:', error);
        showAlert('An error occurred while creating the report', 'error');
    }
}

// Update Report API Call
async function updateReport(id, data) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();

        if (result.success) {
            showAlert('Report updated successfully', 'success');
            resetForm();
            fetchReports();
        } else {
            showAlert(result.message || 'Failed to update report', 'error');
        }
    } catch (error) {
        console.error('Update error:', error);
        showAlert('An error occurred while updating the report', 'error');
    }
}

// Delete Report API Call
async function deleteReport(id) {
    if (!confirm('Are you sure you want to delete this report?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();

        if (result.success) {
            showAlert('Report deleted successfully', 'success');
            fetchReports();
            if (isEditing && editReportId.value === id) {
                resetForm();
            }
        } else {
            showAlert(result.message || 'Failed to delete report', 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showAlert('An error occurred while deleting the report', 'error');
    }
}

// Prepare Form for Editing
function editReport(id) {
    const report = reportsData.find(r => r.id === id);
    if (!report) return;

    isEditing = true;
    editReportId.value = report.id;
    
    document.getElementById('reporterName').value = report.reporterName;
    document.getElementById('contactNumber').value = report.contactNumber;
    document.getElementById('incidentDate').value = report.incidentDate;
    document.getElementById('transactionInfo').value = report.transactionInfo;
    document.getElementById('amount').value = report.amount;
    document.getElementById('incidentType').value = report.incidentType;
    document.getElementById('description').value = report.description;
    document.getElementById('additionalInfo').value = report.additionalInfo;
    document.getElementById('statusSelect').value = report.status;

    formTitle.textContent = 'Edit Report';
    submitBtn.textContent = 'Update Report';
    cancelEditBtn.classList.remove('hidden');
    statusGroup.classList.remove('hidden');

    // Scroll to form
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

// Reset Form to Create Mode
function resetForm() {
    isEditing = false;
    editReportId.value = '';
    reportForm.reset();
    
    formTitle.textContent = 'Report a Fraud Incident';
    submitBtn.textContent = 'Submit Report';
    cancelEditBtn.classList.add('hidden');
    statusGroup.classList.add('hidden');
    
    // Clear errors
    document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
}

cancelEditBtn.addEventListener('click', resetForm);

// Search and Filter Logic
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const status = statusFilter.value;

    const filtered = reportsData.filter(report => {
        const matchesSearch = 
            report.reporterName.toLowerCase().includes(searchTerm) ||
            report.id.toLowerCase().includes(searchTerm) ||
            report.incidentType.toLowerCase().includes(searchTerm);
            
        const matchesStatus = status === 'All' || report.status === status;

        return matchesSearch && matchesStatus;
    });

    renderReports(filtered);
}

searchInput.addEventListener('input', applyFilters);
statusFilter.addEventListener('change', applyFilters);

// View Report Modal
function viewReport(id) {
    const report = reportsData.find(r => r.id === id);
    if (!report) return;

    modalDetails.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Report ID</span>
            <span class="detail-value">${report.id}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Status</span>
            <span class="detail-value status-badge status-${report.status.replace(' ', '-')}">${report.status}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Reporter Name</span>
            <span class="detail-value">${report.reporterName}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Contact Number</span>
            <span class="detail-value">${report.contactNumber}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Incident Date</span>
            <span class="detail-value">${report.incidentDate}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Incident Type</span>
            <span class="detail-value">${report.incidentType}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Amount Involved</span>
            <span class="detail-value">₹${report.amount}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Transaction Info</span>
            <span class="detail-value">${report.transactionInfo || 'N/A'}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Description</span>
            <span class="detail-value">${report.description}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Additional Info</span>
            <span class="detail-value">${report.additionalInfo || 'N/A'}</span>
        </div>
    `;

    viewModal.classList.remove('hidden');
}

closeModalBtn.addEventListener('click', () => {
    viewModal.classList.add('hidden');
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === viewModal) {
        viewModal.classList.add('hidden');
    }
});

// Show Alert Message
function showAlert(message, type) {
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type}`;
    alertBox.classList.remove('hidden');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
        alertBox.classList.add('hidden');
    }, 4000);
}
