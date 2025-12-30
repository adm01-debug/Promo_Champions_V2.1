// Melhoria 83 - Audit Log Page
import { useState } from 'react';
import { useAuditLog } from '@/hooks/useAuditLog';

export const AuditLogPage = () => {
  const [filters, setFilters] = useState({});
  const { data: logs, isLoading } = useAuditLog(filters);

  return (
    <div className="p-6">
      <h1>Audit Trail</h1>
      
      {/* Filters */}
      <div className="filters">
        <select onChange={(e) => setFilters({...filters, table_name: e.target.value})}>
          <option value="">All Tables</option>
          <option value="clients">Clients</option>
          <option value="deals">Deals</option>
          <option value="activities">Activities</option>
        </select>
        
        <select onChange={(e) => setFilters({...filters, action: e.target.value})}>
          <option value="">All Actions</option>
          <option value="INSERT">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
        </select>
      </div>

      {/* Table */}
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>User</th>
            <th>Action</th>
            <th>Table</th>
            <th>Changes</th>
          </tr>
        </thead>
        <tbody>
          {logs?.map(log => (
            <tr key={log.id}>
              <td>{new Date(log.created_at).toLocaleString()}</td>
              <td>{log.user?.email}</td>
              <td>{log.action}</td>
              <td>{log.table_name}</td>
              <td>
                <button onClick={() => viewChanges(log)}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
