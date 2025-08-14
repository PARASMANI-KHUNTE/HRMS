const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./Database/DbCongif");

// --- Router Imports ---
let UserRouter;
try {
  UserRouter = require("./Routes/Auth/User.js");
} catch (e) {
  try {
    UserRouter = require("./Routes/Auth/user.js");
  } catch (_e) {
    throw e; // surface the original error
  }
}
const StaffRouter = require('./Routes/Staff.js');
const HospitalRouter = require('./Routes/Hospital/Hospital.js');
const DepartmentRouter = require('./Routes/Department.js');
const PatientRouter = require('./Routes/Reception/Patient.js');
const InvoiceRouter = require('./Routes/Reception/Invoice.js');
const PaymentRouter = require('./Routes/Reception/Payment.js');
const LabRouter = require('./Routes/Lab/Report.js');
const PharmacyRouter = require('./Routes/Pharmacy.js');
const SettingsRouter = require('./Routes/SettingsRouter.js');
const AuditRouter = require('./Routes/AuditLog.js');

const app = express();

// --- Core Middleware ---
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.static("public"));

// --- API Routes ---
app.use("/api/auth", UserRouter);
app.use("/api/staff", StaffRouter);
app.use("/api/hospital", HospitalRouter);
app.use("/api/department", DepartmentRouter);
app.use("/api/reception/patient", PatientRouter);
app.use("/api/reception/invoice", InvoiceRouter);
app.use("/api/reception/payment", PaymentRouter);
app.use('/api/lab', LabRouter);
app.use('/api/pharmacy', PharmacyRouter);
app.use('/api/settings', SettingsRouter);
app.use('/api/audit', AuditRouter);

// --- Public & Test Routes ---
app.get("/api/test", (req, res) => {
    res.send("Hello World");
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/Templates/welcome.html");
});

app.get("/404", (req, res) => {
    res.sendFile(__dirname + "/public/Templates/404.html");
});

// --- Server Initialization ---
connectDB();
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port http://localhost:${process.env.PORT}`);
});

