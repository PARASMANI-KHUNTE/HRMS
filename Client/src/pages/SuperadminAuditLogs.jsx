import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const SuperadminAuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { token } = useSelector((state) => state.auth);

    useEffect(() => {
        const fetchAuditLogs = async () => {
            setLoading(true);
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        page: currentPage,
                        action: searchTerm,
                    },
                };
                const { data } = await axios.get('/api/audit-logs', config);
                setLogs(data.logs || []);
                setCurrentPage(data.currentPage);
                setTotalPages(data.totalPages);
            } catch (error) {
                toast.error('Failed to fetch audit logs.');
                console.error('Error fetching audit logs:', error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchAuditLogs();
        }
    }, [token, currentPage, searchTerm]);

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(1); // Reset to first page on new search
        setSearchTerm(filter);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Audit Logs</h1>
            
            <form onSubmit={handleFilterSubmit} className="mb-4 flex gap-2">
                <input 
                    type="text"
                    placeholder="Filter by action (e.g., USER_LOGIN)"
                    value={filter}
                    onChange={handleFilterChange}
                    className="border p-2 rounded w-full md:w-1/3 dark:bg-gray-700 dark:border-gray-600"
                />
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Filter</button>
            </form>

            {loading ? (
                <p>Loading logs...</p>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white dark:bg-gray-800">
                            {/* Table Head */}
                            <thead>
                                <tr>
                                    <th className="py-2 px-4 border-b">Timestamp</th>
                                    <th className="py-2 px-4 border-b">Actor</th>
                                    <th className="py-2 px-4 border-b">Action</th>
                                    <th className="py-2 px-4 border-b">Target</th>
                                    <th className="py-2 px-4 border-b">Details</th>
                                </tr>
                            </thead>
                            {/* Table Body */}
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log._id}>
                                        <td className="py-2 px-4 border-b">{new Date(log.createdAt).toLocaleString()}</td>
                                        <td className="py-2 px-4 border-b">{log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : 'System'}</td>
                                        <td className="py-2 px-4 border-b">{log.action}</td>
                                        <td className="py-2 px-4 border-b">{log.target} ({log.targetId})</td>
                                        <td className="py-2 px-4 border-b text-sm"><pre>{log.details ? JSON.stringify(log.details, null, 2) : 'N/A'}</pre></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Controls */}
                    <div className="mt-4 flex justify-between items-center">
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="bg-gray-300 dark:bg-gray-600 px-4 py-2 rounded disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="bg-gray-300 dark:bg-gray-600 px-4 py-2 rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default SuperadminAuditLogs;
