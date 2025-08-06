const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./Database/DbCongif");
const UserRouter = require("./Routers/Auth/User");
const ServicesRouter = require('./Routers/ServicesRouter');
const HospitalRouter = require('./Routers/Hospital/Hospital');
const AssignHospitalRouter = require('./Routers/Hospital/AssignHospital');
const DashboardRouter = require('./Routers/Dashboard');
const auditLogRouter = require('./Routers/AuditLog');

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.static("public"));



app.use("/api/auth" , UserRouter);
app.use("/api/services", ServicesRouter);
app.use("/api/hospital", HospitalRouter);
app.use("/api/assign-hospital", AssignHospitalRouter);
app.use("/api/dashboard", DashboardRouter);
app.use('/api/audit-logs', auditLogRouter);
const StaffRouter = require('./Routers/Hospital/Staff');
app.use("/api/staff", StaffRouter);
const DepartmentRouter = require('./Routers/Hospital/Department');
app.use("/api/department", DepartmentRouter);
const DepartmentAssignRouter = require('./Routers/Hospital/DepartmentAssign');
app.use("/api/department-assign", DepartmentAssignRouter);
const PatientRouter = require('./Routers/Reception/Patient');
const InvoiceRouter = require('./Routers/Reception/Invoice');
const PaymentRouter = require('./Routers/Reception/Payment');
const SettingsRouter = require('./routes/SettingsRouter');
app.use("/api/reception/patient", PatientRouter);
app.use("/api/reception/invoice", InvoiceRouter);
app.use("/api/reception/payment", PaymentRouter);
app.use('/api/settings', SettingsRouter);
const PharmacyProductRouter = require('./Routers/Pharmacy/Product');
const PharmacyInvoiceRouter = require('./Routers/Pharmacy/Invoice');
app.use("/api/pharmacy/product", PharmacyProductRouter);
app.use("/api/pharmacy/invoice", PharmacyInvoiceRouter);
const LabReportRouter = require('./Routers/Lab/Report');
app.use("/api/lab/report", LabReportRouter);








app.get("/api/test" , (req , res) => {
    res.send("Hello World");
})

app.get("/" , (req , res) => {
    res.sendFile(__dirname + "/public/Templates/welcome.html");
})

app.get("/404" , (req , res) => {
    res.sendFile(__dirname + "/public/Templates/404.html");
})

connectDB();
app.listen(process.env.PORT , () => {
    console.log(`Server is running on port http://localhost:${process.env.PORT}`);
});
