const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// In-memory storage for reports
let reports = [
    {
        id: "REP-1001",
        reporterName: "Rajesh Kumar",
        contactNumber: "9876543210",
        incidentDate: "2026-08-15",
        transactionInfo: "UPI Ref: 123456789012",
        amount: 5000,
        incidentType: "UPI Scam",
        description: "Received a payment request claiming I won a lottery, but money was deducted from my account.",
        additionalInfo: "The caller spoke in Hindi and claimed to be from my bank.",
        status: "Pending",
        createdAt: new Date("2026-08-15T10:30:00Z")
    },
    {
        id: "REP-1002",
        reporterName: "Priya Sharma",
        contactNumber: "8765432109",
        incidentDate: "2026-08-14",
        transactionInfo: "VPA: scammer@upi",
        amount: 1500,
        incidentType: "Fake Customer Care",
        description: "Searched for customer care number online. They asked me to install a screen sharing app.",
        additionalInfo: "I uninstalled the app as soon as I realized, but 1500 was deducted.",
        status: "Under Review",
        createdAt: new Date("2026-08-14T14:45:00Z")
    },
    {
        id: "REP-1003",
        reporterName: "Amit Patel",
        contactNumber: "7654321098",
        incidentDate: "2026-08-10",
        transactionInfo: "UPI Ref: 987654321098",
        amount: 12000,
        incidentType: "Fraudulent Transaction",
        description: "Money sent by mistake to a wrong number, person refusing to return.",
        additionalInfo: "",
        status: "Resolved",
        createdAt: new Date("2026-08-10T09:15:00Z")
    }
];

// Helper function to generate unique IDs
const generateId = () => {
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `REP-${timestamp}${random}`;
};

// --- API Endpoints ---

// Get all reports
app.get('/api/reports', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Reports retrieved successfully",
        data: reports
    });
});

// Get one report
app.get('/api/reports/:id', (req, res) => {
    const report = reports.find(r => r.id === req.params.id);
    
    if (!report) {
        return res.status(404).json({
            success: false,
            message: "Report not found"
        });
    }

    res.status(200).json({
        success: true,
        message: "Report retrieved successfully",
        data: report
    });
});

// Create report
app.post('/api/reports', (req, res) => {
    try {
        const {
            reporterName,
            contactNumber,
            incidentDate,
            transactionInfo,
            amount,
            incidentType,
            description,
            additionalInfo
        } = req.body;

        // Basic Backend Validation
        if (!reporterName || !contactNumber || !incidentDate || !amount || !incidentType || !description) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid amount"
            });
        }
        
        // Simple 10-digit number validation for contact (India)
        const contactRegex = /^[0-9]{10}$/;
        if (!contactRegex.test(contactNumber)) {
            return res.status(400).json({
                success: false,
                message: "Invalid contact number"
            });
        }

        const newReport = {
            id: generateId(),
            reporterName,
            contactNumber,
            incidentDate,
            transactionInfo: transactionInfo || "",
            amount: Number(amount),
            incidentType,
            description,
            additionalInfo: additionalInfo || "",
            status: "Pending",
            createdAt: new Date()
        };

        reports.unshift(newReport); // Add to beginning of array

        res.status(201).json({
            success: true,
            message: "Report created successfully",
            data: newReport
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Update report
app.put('/api/reports/:id', (req, res) => {
    try {
        const reportIndex = reports.findIndex(r => r.id === req.params.id);

        if (reportIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Report not found"
            });
        }

        const currentReport = reports[reportIndex];
        const updateData = req.body;

        // Basic validation for updates
        if (updateData.amount !== undefined && (isNaN(updateData.amount) || updateData.amount <= 0)) {
            return res.status(400).json({
                success: false,
                message: "Invalid amount"
            });
        }

        if (updateData.contactNumber !== undefined) {
             const contactRegex = /^[0-9]{10}$/;
             if (!contactRegex.test(updateData.contactNumber)) {
                 return res.status(400).json({
                     success: false,
                     message: "Invalid contact number"
                 });
             }
        }

        // Update fields
        const updatedReport = {
            ...currentReport,
            reporterName: updateData.reporterName || currentReport.reporterName,
            contactNumber: updateData.contactNumber || currentReport.contactNumber,
            incidentDate: updateData.incidentDate || currentReport.incidentDate,
            transactionInfo: updateData.transactionInfo !== undefined ? updateData.transactionInfo : currentReport.transactionInfo,
            amount: updateData.amount !== undefined ? Number(updateData.amount) : currentReport.amount,
            incidentType: updateData.incidentType || currentReport.incidentType,
            description: updateData.description || currentReport.description,
            additionalInfo: updateData.additionalInfo !== undefined ? updateData.additionalInfo : currentReport.additionalInfo,
            status: updateData.status || currentReport.status
        };

        reports[reportIndex] = updatedReport;

        res.status(200).json({
            success: true,
            message: "Report updated successfully",
            data: updatedReport
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Delete report
app.delete('/api/reports/:id', (req, res) => {
    try {
        const reportIndex = reports.findIndex(r => r.id === req.params.id);

        if (reportIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Report not found"
            });
        }

        reports.splice(reportIndex, 1);

        res.status(200).json({
            success: true,
            message: "Report deleted successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
