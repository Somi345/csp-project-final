import React, { useState, useMemo } from 'react';
import { 
  Search, 
  AlertTriangle, 
  PlusCircle, 
  Phone, 
  MapPin, 
  Calendar, 
  Eye, 
  Clock 
} from 'lucide-react';
import { EmergencyCase, Farmer } from '../../types';
import { Badge } from '../common/Badge';
import { Pagination } from '../common/Pagination';
import { EmptyState } from '../common/EmptyState';

interface EmergencyListViewProps {
  emergencies: EmergencyCase[];
  farmers: Farmer[];
  onOpenCreateEmergency: () => void;
  onSelectEmergency: (emergency: EmergencyCase) => void;
}

const ITEMS_PER_PAGE = 6;

export const EmergencyListView: React.FC<EmergencyListViewProps> = ({
  emergencies,
  farmers,
  onOpenCreateEmergency,
  onSelectEmergency
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [villageFilter, setVillageFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const villages = useMemo(() => {
    return Array.from(new Set(emergencies.map(e => e.village))).sort();
  }, [emergencies]);

  const filteredEmergencies = useMemo(() => {
    return emergencies.filter(e => {
      const matchSearch =
        e.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.problemType.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchPriority = priorityFilter === 'All' || e.priority === priorityFilter;
      const matchStatus = statusFilter === 'All' || e.status === statusFilter;
      const matchVillage = villageFilter === 'All' || e.village === villageFilter;

      return matchSearch && matchPriority && matchStatus && matchVillage;
    });
  }, [emergencies, searchTerm, priorityFilter, statusFilter, villageFilter]);

  const totalPages = Math.ceil(filteredEmergencies.length / ITEMS_PER_PAGE);
  const paginatedEmergencies = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEmergencies.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEmergencies, currentPage]);

  const openCount = emergencies.filter(e => e.status === 'Open').length;
  const criticalCount = emergencies.filter(e => e.priority === 'Critical' && e.status !== 'Closed').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Emergency Crop Issue Tracker</h2>
            {criticalCount > 0 && (
              <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-xs font-bold text-white animate-pulse">
                {criticalCount} Critical
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Rapid response queue for pest outbreaks, fungal wilts, and localized stress
          </p>
        </div>

        <button
          id="log-emergency-incident-btn"
          onClick={onOpenCreateEmergency}
          className="inline-flex items-center gap-2 rounded-lg bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-800 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Log Emergency Incident</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:grid-cols-4">
        {/* Search */}
        <div className="relative sm:col-span-1">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search farmer, crop, case ID..."
            className="w-full rounded-md border border-slate-300 py-2 pr-3 pl-9 text-xs focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        {/* Priority Filter */}
        <div>
          <select
            value={priorityFilter}
            onChange={e => {
              setPriorityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-md border border-slate-300 py-2 px-3 text-xs focus:border-blue-500 focus:outline-hidden"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-md border border-slate-300 py-2 px-3 text-xs focus:border-blue-500 focus:outline-hidden"
          >
            <option value="All">All Statuses ({openCount} open)</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        {/* Village Filter */}
        <div>
          <select
            value={villageFilter}
            onChange={e => {
              setVillageFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-md border border-slate-300 py-2 px-3 text-xs focus:border-blue-500 focus:outline-hidden"
          >
            <option value="All">All Villages</option>
            {villages.map(v => (
              <option key={v} value={v}>Village: {v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        {filteredEmergencies.length === 0 ? (
          <EmptyState
            title="No Emergency Cases Found"
            description="There are currently no incidents matching the selected criteria."
            actionText="Clear Filters"
            onAction={() => {
              setSearchTerm('');
              setPriorityFilter('All');
              setStatusFilter('All');
              setVillageFilter('All');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Case ID & Date</th>
                  <th className="px-4 py-3">Farmer & Contact</th>
                  <th className="px-4 py-3">Crop & Issue Type</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Follow-up</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedEmergencies.map(emg => (
                  <tr key={emg.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* ID & Date */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{emg.id}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span>{new Date(emg.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>

                    {/* Farmer */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{emg.farmerName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-blue-600" />
                          {emg.village}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-emerald-600" />
                          {emg.contactPhone}
                        </span>
                      </div>
                    </td>

                    {/* Crop & Problem */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{emg.crop}</div>
                      <div className="text-[11px] text-slate-600 truncate max-w-[180px] font-medium">
                        {emg.problemType}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                        {emg.problemDescription}
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3.5">
                      <Badge variant={
                        emg.priority === 'Critical' ? 'danger' :
                        emg.priority === 'High' ? 'warning' : 'primary'
                      }>
                        {emg.priority}
                      </Badge>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <Badge variant={
                        emg.status === 'Resolved' ? 'success' :
                        emg.status === 'In Progress' ? 'warning' :
                        emg.status === 'Closed' ? 'neutral' : 'danger'
                      }>
                        {emg.status}
                      </Badge>
                    </td>

                    {/* Follow-up */}
                    <td className="px-4 py-3.5 text-slate-600 font-medium">
                      {emg.followUpDate ? (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-blue-600" />
                          <span>{emg.followUpDate}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">None set</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => onSelectEmergency(emg)}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-blue-700 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Manage Case</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredEmergencies.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={page => setCurrentPage(page)}
        />
      </div>
    </div>
  );
};
