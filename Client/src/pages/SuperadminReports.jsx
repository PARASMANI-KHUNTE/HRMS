import React, { useState, useEffect, useMemo } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt, FaDollarSign, FaUsers, FaFileInvoice, FaHospital, FaUserShield, FaUsersCog, FaUserInjured } from 'react-icons/fa';

const StatCard = ({ icon, title, value, color }) => (
  <div className={`bg-white p-6 rounded-xl shadow-md flex items-center gap-4 border-l-4 ${color}`}>
    <div className="text-4xl">{icon}</div>
    <div>
      <h3 className="text-gray-500 font-semibold text-lg">{title}</h3>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-bold text-lg">{payload.name}</text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle} innerRadius={outerRadius + 6} outerRadius={outerRadius + 10} fill={fill} />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${value} Users`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">{`(Rate ${(percent * 100).toFixed(2)}%)`}</text>
    </g>
  );
};

export default function SuperadminReports() {
  const [stats, setStats] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, reportDataRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/report-data'),
        ]);
        setStats(statsRes.data);
        setReportData(reportDataRes.data);
      } catch (error) {
        toast.error('Failed to fetch report data.');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const COLORS = { 'admin': '#0088FE', 'superadmin': '#00C49F', 'doctor': '#FFBB28', 'patient': '#FF8042', 'receptionist': '#AF19FF', 'pharmacist': '#FF4560', 'labtechnician': '#775DD0', 'accountant': '#4CAF50', 'nurse': '#FFC0CB' };

  if (loading || !stats || !reportData) return <div className="text-center p-8">Loading analytical data...</div>;

  return (
    <div className="bg-gray-50 p-8 rounded-xl shadow-lg space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-indigo-800">Reports & Analytics</h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<FaHospital />} title="Total Hospitals" value={stats.hospitals} color="border-blue-500" />
        <StatCard icon={<FaUserShield />} title="Total Admins" value={stats.admins} color="border-purple-500" />
        <StatCard icon={<FaUsersCog />} title="Total Staff" value={stats.staff} color="border-yellow-500" />
        <StatCard icon={<FaUserInjured />} title="Total Patients" value={stats.patients} color="border-green-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Monthly Revenue & Patient Growth</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={reportData.monthlyRevenue} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip formatter={(value, name) => name === 'revenue' ? `$${value.toFixed(2)}` : value} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line yAxisId="right" type="monotone" dataKey="patients" stroke="#82ca9d" data={reportData.monthlyRegistrations} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Staff Distribution by Role</h2>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie activeIndex={activeIndex} activeShape={renderActiveShape} data={reportData.staffDistribution} cx="50%" cy="50%" innerRadius={70} outerRadius={90} fill="#8884d8" dataKey="value" onMouseEnter={(_, index) => setActiveIndex(index)}>
                {reportData.staffDistribution.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#cccccc'} />))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
       <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Hospital Performance</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={reportData.hospitalPerformance} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip formatter={(value) => typeof value === 'number' ? value.toLocaleString() : value} />
                <Legend />
                <Bar dataKey="patientCount" name="Patients" stackId="a" fill="#8884d8" />
                <Bar dataKey="staffCount" name="Staff" stackId="a" fill="#82ca9d" />
                <Bar dataKey="totalRevenue" name="Revenue ($)" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>

    </div>
  );
}
