import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  ChevronRight, 
  Phone, 
  MapPin, 
  Edit3, 
  UserCheck, 
  Download,
  ShieldCheck,
  Lock,
  Power,
  RotateCcw
} from 'lucide-react';
import { Farmer, CoordinatorProfile } from '../../types';
import { Badge } from '../common/Badge';
import { Pagination } from '../common/Pagination';
import { EmptyState } from '../common/EmptyState';
import { ReportService } from '../../services/reportService';

interface FarmerListViewProps {
  farmers: Farmer[];
  coordinator: CoordinatorProfile;
  onSelectFarmer: (farmer: Farmer) => void;
  onOpenCreateModal: () => void;
  onEditFarmer: (farmer: Farmer) => void;
  onToggleFarmerStatus?: (farmer: Farmer) => void;
}

const ITEMS_PER_PAGE = 6;

export const FarmerListView: React.FC<FarmerListViewProps> = ({
  farmers,
  coordinator,
  onSelectFarmer,
  onOpenCreateModal,
  onEditFarmer,
  onToggleFarmerStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [villageFilter, setVillageFilter] = useState('All');
  const [cropFilter, setCropFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const isCoordinator = coordinator.role === 'Village Agriculture Coordinator';

  // Distinct villages & crops for dynamic filters
  const villages = useMemo(() => {
    return Array.from(new Set(farmers.map(f => f.village))).sort();
  }, [farmers]);

  const crops = useMemo(() => {
    return Array.from(new Set(farmers.map(f => f.primaryCrop))).sort();
  }, [farmers]);

  // Filtering
  const filteredFarmers = useMemo(() => {
    return farmers.filter(f => {
      const matchSearch = 
        f.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.phone.includes(searchTerm) ||
        f.fatherSpouseName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchVillage = villageFilter === 'All' || f.village === villageFilter;
      const matchCrop = cropFilter === 'All' || f.primaryCrop === cropFilter;
      const matchStatus = statusFilter === 'All' || f.status === statusFilter;

      return matchSearch && matchVillage && matchCrop && matchStatus;
    });
  }, [farmers, searchTerm, villageFilter, cropFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredFarmers.length / ITEMS_PER_PAGE);
  const paginatedFarmers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredFarmers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredFarmers, currentPage]);

  const handleExport = () => {
    ReportService.exportFarmersCsv(filteredFarmers);
  };

  return (
    <div className="space-y-4">
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Farmer Directory & Records</h2>
          <p className="text-xs text-slate-500">
            Registered village landholders, primary crops, and agricultural profiles
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
            title="Download CSV report of current filtered view"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>

          <button
            id="register-new-farmer-btn"
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-800 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Register Farmer</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
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
            placeholder="Search name, ID, phone..."
            className="w-full rounded-md border border-slate-300 py-2 pr-3 pl-9 text-xs focus:border-blue-500 focus:outline-hidden"
          />
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
            <option value="All">All Villages ({farmers.length})</option>
            {villages.map(v => (
              <option key={v} value={v}>Village: {v}</option>
            ))}
          </select>
        </div>

        {/* Crop Filter */}
        <div>
          <select
            value={cropFilter}
            onChange={e => {
              setCropFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-md border border-slate-300 py-2 px-3 text-xs focus:border-blue-500 focus:outline-hidden"
          >
            <option value="All">All Crops</option>
            {crops.map(c => (
              <option key={c} value={c}>Crop: {c}</option>
            ))}
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
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive / Suspended</option>
          </select>
        </div>
      </div>

      {/* Record Retention Policy Banner */}
      <div className="flex items-center gap-2.5 rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs text-blue-900 shadow-2xs">
        <ShieldCheck className="h-4 w-4 text-blue-700 shrink-0" />
        <div className="flex-1 text-[11px] leading-relaxed">
          <span className="font-bold">Record Preservation Policy:</span> Permanent deletion of farmer records is prohibited to safeguard all historical crop surveys, disease diagnostics, emergency incidents, and welfare disbursements. If an account should no longer be actively serviced, change its status to <strong className="text-blue-950 font-bold">Inactive</strong>.
        </div>
        <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-blue-800 border border-blue-200">
          <UserCheck className="h-3 w-3 text-blue-600" />
          <span>Editor: {coordinator.role}</span>
        </div>
      </div>

      {/* Main Farmers Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        {filteredFarmers.length === 0 ? (
          <EmptyState
            title="No Farmers Found"
            description="No farmer records match the specified search or filter criteria."
            actionText="Clear Filters"
            onAction={() => {
              setSearchTerm('');
              setVillageFilter('All');
              setCropFilter('All');
              setStatusFilter('All');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Farmer & ID</th>
                  <th className="px-4 py-3">Location & Contact</th>
                  <th className="px-4 py-3">Land & Soil</th>
                  <th className="px-4 py-3">Primary Crop</th>
                  <th className="px-4 py-3">Aadhaar (Masked)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedFarmers.map(farmer => (
                  <tr 
                    key={farmer.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Farmer Name & ID */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{farmer.fullName}</div>
                      <div className="text-[11px] text-slate-400">
                        {farmer.id} • S/o {farmer.fatherSpouseName}
                      </div>
                    </td>

                    {/* Location & Phone */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 font-medium text-slate-800">
                        <MapPin className="h-3.5 w-3.5 text-blue-600" />
                        <span>{farmer.village}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3 text-emerald-600" />
                        <span>{farmer.phone}</span>
                      </div>
                    </td>

                    {/* Land & Soil */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{farmer.landAreaAcres} Acres</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[130px]">{farmer.soilType}</div>
                    </td>

                    {/* Primary Crop */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-800">{farmer.primaryCrop}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[140px]">{farmer.cropVariety}</div>
                    </td>

                    {/* Aadhaar */}
                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-600">
                      {farmer.aadhaarMasked}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <Badge variant={farmer.status === 'Active' ? 'success' : 'neutral'}>
                        {farmer.status}
                      </Badge>
                      {farmer.updatedAt && (
                        <div className="text-[10px] text-slate-400 mt-1 font-mono">
                          Upd: {new Date(farmer.updatedAt).toLocaleDateString()}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectFarmer(farmer)}
                          className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1.5 font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                          title="View Comprehensive Profile"
                        >
                          <span>Profile</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>

                        {/* Edit Action - Village Agriculture Coordinator Only */}
                        {isCoordinator ? (
                          <button
                            onClick={() => onEditFarmer(farmer)}
                            className="inline-flex items-center gap-1 rounded-md bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 font-semibold text-slate-700 transition-colors"
                            title="Edit Farmer Details (Village Agriculture Coordinator Only)"
                          >
                            <Edit3 className="h-3.5 w-3.5 text-blue-700" />
                            <span>Edit</span>
                          </button>
                        ) : (
                          <span 
                            className="inline-flex items-center gap-1 rounded-md bg-slate-50 border border-slate-200 px-2 py-1 text-[11px] text-slate-400 cursor-not-allowed"
                            title="Editing is restricted to authenticated Village Agriculture Coordinators"
                          >
                            <Lock className="h-3 w-3" />
                            <span>Edit Locked</span>
                          </span>
                        )}

                        {/* Status Toggle Action - Instead of Deletion */}
                        {isCoordinator && onToggleFarmerStatus && (
                          farmer.status === 'Active' ? (
                            <button
                              onClick={() => onToggleFarmerStatus(farmer)}
                              className="inline-flex items-center gap-1 rounded-md bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-1.5 text-xs font-semibold text-amber-800 transition-colors"
                              title="Set status to Inactive (preserves all surveys, health, emergencies, and schemes)"
                            >
                              <Power className="h-3.5 w-3.5 text-amber-600" />
                              <span>Deactivate</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onToggleFarmerStatus(farmer)}
                              className="inline-flex items-center gap-1 rounded-md bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-1.5 text-xs font-semibold text-emerald-800 transition-colors"
                              title="Reactivate farmer for active coordination"
                            >
                              <RotateCcw className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Activate</span>
                            </button>
                          )
                        )}
                      </div>
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
          totalItems={filteredFarmers.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={page => setCurrentPage(page)}
        />
      </div>
    </div>
  );
};
