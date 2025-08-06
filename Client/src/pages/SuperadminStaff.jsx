import React, { useState, useEffect, useMemo } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaExclamationTriangle, FaSearch } from 'react-icons/fa';
import Pagination from '../components/Pagination';

const STAFF_ROLES = ['doctor', 'nurse', 'receptionist', 'pharmacist', 'lab technician', 'accountant'];
const ROLES_WITH_DEPARTMENTS = ['doctor', 'nurse', 'pharmacist', 'lab technician', 'accountant'];

// Add/Edit Staff Modal
function StaffModal({ isOpen, onClose, onSave, staffMember, hospitals, departments }) {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', role: '', hospital: '', departmentId: '' });
  const isEditMode = !!staffMember;

  const availableDepartments = useMemo(() => {
    console.log('Hospitals data received in modal:', hospitals);
    console.log('All departments available in modal:', departments);
    if (!formData.hospital || !hospitals.length || !departments.length) return [];
    const selectedHospital = hospitals.find(h => h._id === formData.hospital);
    if (!selectedHospital || !selectedHospital.departments) return [];
    // Get an array of the IDs of the departments assigned to the selected hospital
    const assignedDepartmentIds = selectedHospital.departments.map(d => d._id);
    // Filter the master department list to only include those assigned to the hospital
    const filtered = departments.filter(d => assignedDepartmentIds.includes(d._id));
    console.log(`For hospital ${selectedHospital.name}, found departments:`, filtered);
    return filtered;
  }, [formData.hospital, hospitals, departments]);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && staffMember) {
        setFormData({
          firstName: staffMember.firstName || '',
          lastName: staffMember.lastName || '',
          email: staffMember.email || '',
          phone: staffMember.phone || '',
          password: '', // Always clear password for security
          role: staffMember.role || '',
          hospital: staffMember.hospitalId?._id || '',
          departmentId: staffMember.departmentId?._id || ''
        });
      } else {
        setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '', role: '', hospital: '', departmentId: '' });
      }
    }
  }, [staffMember, isEditMode, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, _id: staffMember?._id });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-700">{isEditMode ? 'Edit Staff' : 'Add New Staff'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FaTimes size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
          </div>
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
          <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder={isEditMode ? 'New Password (optional)' : 'Password'} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required={!isEditMode} />
          <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required>
            <option value="">Select Role</option>
            {STAFF_ROLES.map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
          </select>
          <select name="hospital" value={formData.hospital} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required>
            <option value="">Assign to Hospital</option>
            {hospitals.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
          </select>
           {ROLES_WITH_DEPARTMENTS.includes(formData.role) && (
            <select name="departmentId" value={formData.departmentId} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required>
                <option value="">Assign to Department</option>
                {availableDepartments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
           )}
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-semibold">{isEditMode ? 'Save Changes' : 'Add Staff'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmationModal({ isOpen, onClose, onConfirm, staffName }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md m-4 text-center">
                <FaExclamationTriangle className="mx-auto text-red-500 text-5xl mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">Confirm Deletion</h2>
                <p className="text-gray-600 mt-2 mb-6">Are you sure you want to delete <strong className='text-indigo-700'>{staffName}</strong>? This action cannot be undone.</p>
                <div className="flex justify-center gap-4">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold">Cancel</button>
                    <button onClick={onConfirm} className="px-6 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 font-semibold">Delete</button>
                </div>
            </div>
        </div>
    );
}

export default function SuperadminStaff() {
  const [users, setUsers] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingStaff, setDeletingStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, hospitalsRes, deptsRes] = await Promise.all([
        api.get('/auth/getallusers'),
        api.get('/hospital/getall'),
        api.get('/department/getall')
      ]);
      setUsers(usersRes.data);
      setHospitals(hospitalsRes.data);
      setDepartments(deptsRes.data);
    } catch (error) {
      toast.error('Failed to fetch data.');
    }
    setLoading(false);
  };

  const staff = useMemo(() => {
    return users
      .filter(user => STAFF_ROLES.includes(user.role))
      .filter(user => {
        const searchTermLower = searchTerm.toLowerCase();
        const nameMatch = (user.firstName && user.firstName.toLowerCase().includes(searchTermLower)) || 
                          (user.lastName && user.lastName.toLowerCase().includes(searchTermLower));
        const emailMatch = user.email && user.email.toLowerCase().includes(searchTermLower);
        const matchesSearch = nameMatch || emailMatch;

        const matchesHospital = selectedHospital ? user.hospitalId?._id === selectedHospital : true;
        const matchesRole = selectedRole ? user.role === selectedRole : true;

        return matchesSearch && matchesHospital && matchesRole;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [users, searchTerm, selectedHospital, selectedRole]);

  const handleSaveStaff = async (staffData) => {
    setLoading(true);
    try {
      let response;
      if (editingStaff) {
        // Edit existing staff
        const payload = { ...staffData, id: editingStaff._id, hospitalId: staffData.hospital };
        delete payload.hospital;
        response = await api.put(`/staff/edit`, payload);
        setUsers(prev => prev.map(s => s._id === response.data.staff._id ? response.data.staff : s));
        toast.success('Staff member updated successfully!');
      } else {
        // Add new staff
        const payload = { ...staffData, hospitalId: staffData.hospital };
        delete payload.hospital;
        response = await api.post('/staff/add', payload);
        setUsers(prev => [...prev, response.data.staff]);
        toast.success('Staff member added successfully!');
      }
      setIsModalOpen(false);
      setEditingStaff(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save staff member.');
    }
    setLoading(false);
  };

  const handleDeleteStaff = async () => {
    if (!deletingStaff) return;
    try {
      await api.post('/auth/delete', { _id: deletingStaff._id });
      setUsers(prev => prev.filter(u => u._id !== deletingStaff._id));
      toast.success(`Staff member '${deletingStaff.firstName} ${deletingStaff.lastName}' deleted successfully.`);
      setIsDeleteModalOpen(false);
      setDeletingStaff(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete staff member.');
    }
  };

  const openAddModal = () => {
    setEditingStaff(null);
    setIsModalOpen(true);
  };

  const openEditModal = (staffMember) => {
    setEditingStaff(staffMember);
    setIsModalOpen(true);
  };

  const openDeleteModal = (staffMember) => {
    setDeletingStaff(staffMember);
    setIsDeleteModalOpen(true);
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-800">Staff Management</h1>
        <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold">
          <FaPlus /> Add Staff
        </button>
      </div>

      <div className="flex justify-between items-center mb-6 gap-4">
        <div className="relative w-full max-w-xs">
          <input 
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <select 
          value={selectedHospital}
          onChange={e => setSelectedHospital(e.target.value)}
          className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">All Hospitals</option>
          {hospitals.map(h => <option key={h._id} value={h._id}>{h.name}</option>)} 
        </select>
        <select 
          value={selectedRole}
          onChange={e => setSelectedRole(e.target.value)}
          className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">All Roles</option>
          {STAFF_ROLES.map(r => <option key={r} value={r} className="capitalize">{r}</option>)} 
        </select>
      </div>

      {staff.length === 0 && !loading ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-700">No Staff Found</h3>
          <p className="text-gray-500 mt-2">There are no staff members matching your criteria. Try adjusting your filters or add a new one.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="bg-indigo-50 text-indigo-800 uppercase text-sm leading-normal">
                <th className="py-3 px-6">Name</th>
                <th className="py-3 px-6">Role</th>
                <th className="py-3 px-6">Hospital</th>
                <th className="py-3 px-6">Department</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {staff.map(s => (
                <tr key={s._id} className="border-b border-gray-200 hover:bg-indigo-50">
                  <td className="py-3 px-6 font-medium">{`${s.firstName} ${s.lastName}`}</td>
                  <td className="py-3 px-6 capitalize">{s.role}</td>
                  <td className="py-3 px-6">{s.hospitalId?.name || <span className='text-gray-400'>N/A</span>}</td>
                  <td className="py-3 px-6">{s.departmentId?.name || <span className='text-gray-400'>N/A</span>}</td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex item-center justify-center gap-4">
                      <button onClick={() => openEditModal(s)} className="text-blue-500 hover:text-blue-700 text-xl" title="Edit"><FaEdit /></button>
                      <button onClick={() => openDeleteModal(s)} className="text-red-500 hover:text-red-700 text-xl" title="Delete"><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <StaffModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveStaff} staffMember={editingStaff} hospitals={hospitals} departments={departments} />
      <DeleteConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteStaff} staffName={deletingStaff ? `${deletingStaff.firstName} ${deletingStaff.lastName}` : ''} />
    </div>
  );
}
