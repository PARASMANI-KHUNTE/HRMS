import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

// Add/Edit Department Modal Component
function DepartmentModal({ isOpen, onClose, onSave, department }) {
  const [name, setName] = useState('');
  const isEditMode = !!department;

  useEffect(() => {
    if (isEditMode) {
      setName(department.name);
    } else {
      setName('');
    }
  }, [department, isEditMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Department name cannot be empty.');
      return;
    }
    onSave({ ...department, name });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-700">{isEditMode ? 'Edit Department' : 'Add New Department'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FaTimes size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="dept-name" className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
            <input 
              type="text" 
              id="dept-name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
              required 
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-semibold">{isEditMode ? 'Save Changes' : 'Add Department'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete Confirmation Modal
function DeleteConfirmationModal({ isOpen, onClose, onConfirm, departmentName }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md m-4">
        <div className="text-center">
          <FaExclamationTriangle className="mx-auto text-red-500 text-5xl mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Confirm Deletion</h2>
          <p className="text-gray-600 mt-2 mb-6">Are you sure you want to delete the department <strong className='text-indigo-700'>{departmentName}</strong>? This action cannot be undone.</p>
          <div className="flex justify-center gap-4">
            <button onClick={onClose} className="px-6 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold">Cancel</button>
            <button onClick={onConfirm} className="px-6 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 font-semibold">Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuperadminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingDepartment, setDeletingDepartment] = useState(null);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/department/getall');
      setDepartments(data || []);
    } catch (error) {
      toast.error('Failed to fetch departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSaveDepartment = async (departmentData) => {
    const isEditMode = !!departmentData._id;
    const endpoint = isEditMode ? '/department/update' : '/department/add';
    const method = isEditMode ? 'put' : 'post';

    try {
      await api[method](endpoint, {id: departmentData._id, name: departmentData.name});
      toast.success(`Department ${isEditMode ? 'updated' : 'added'} successfully.`);
      setIsModalOpen(false);
      setEditingDepartment(null);
      fetchDepartments(); // Refresh list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save department.');
    }
  };

  const handleDeleteDepartment = async () => {
    if (!deletingDepartment) return;
    try {
      await api.delete('/department/delete', { data: { id: deletingDepartment._id } });
      toast.success(`Department '${deletingDepartment.name}' deleted successfully.`);
      setIsDeleteModalOpen(false);
      setDeletingDepartment(null);
      fetchDepartments(); // Refresh list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete department.');
    }
  };

  const openAddModal = () => {
    setEditingDepartment(null);
    setIsModalOpen(true);
  };

  const openEditModal = (department) => {
    setEditingDepartment(department);
    setIsModalOpen(true);
  };

  const openDeleteModal = (department) => {
    setDeletingDepartment(department);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-800">Manage Departments</h1>
        <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold">
          <FaPlus /> Add Department
        </button>
      </div>

      {loading ? (
        <p>Loading departments...</p>
      ) : departments.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-700">No Departments Found</h3>
          <p className="text-gray-500 mt-2">Get started by adding a new department.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="bg-indigo-50 text-indigo-800 uppercase text-sm leading-normal">
                <th className="py-3 px-6">Department Name</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {departments.map(dept => (
                <tr key={dept._id} className="border-b border-gray-200 hover:bg-indigo-50">
                  <td className="py-3 px-6 font-medium">{dept.name}</td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex item-center justify-center gap-4">
                      <button onClick={() => openEditModal(dept)} className="text-blue-500 hover:text-blue-700 text-xl" title="Edit"><FaEdit /></button>
                      <button onClick={() => openDeleteModal(dept)} className="text-red-500 hover:text-red-700 text-xl" title="Delete"><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DepartmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveDepartment} 
        department={editingDepartment} 
      />

      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteDepartment}
        departmentName={deletingDepartment?.name}
      />
    </div>
  );
}
