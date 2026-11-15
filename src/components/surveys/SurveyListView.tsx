import React, { useState, useMemo } from 'react';
import { 
  Search, 
  PlusCircle, 
  Calendar, 
  Download, 
  Eye, 
  AlertTriangle, 
  MapPin, 
  Sprout 
} from 'lucide-react';
import { MonthlySurvey, Farmer } from '../../types';
import { Badge } from '../common/Badge';
import { Pagination } from '../common/Pagination';
import { EmptyState } from '../common/EmptyState';
import { ReportService } from '../../services/reportService';

interface SurveyListViewProps {
  surveys: MonthlySurvey[];
  farmers: Farmer[];
  onOpenCreateSurvey: () => void;
  onViewSurvey: (survey: MonthlySurvey) => void;
}

const ITEMS_PER_PAGE = 6;

export const SurveyListView: React.FC<SurveyListViewProps> = ({
  surveys,
  farmers,
  onOpenCreateSurvey,
  onViewSurvey
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [villageFilter, setVillageFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('All');
  const [conditionFilter, setConditionFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Distinct filter values
  const villages = useMemo(() => {
    return Array.from(new Set(surveys.map(s => s.village))).sort();
  }, [surveys]);

  const months = useMemo(() => {
    return Array.from(new Set(surveys.map(s => s.month))).sort().reverse();
  }, [surveys]);

  // Filtering
  const filteredSurveys = useMemo(() => {
    return surveys.filter(s => {
      const matchSearch =
        s.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchVillage = villageFilter === 'All' || s.village === villageFilter;
      const matchMonth = monthFilter === 'All' || s.month === monthFilter;
      const matchCondition = conditionFilter === 'All' || s.cropCondition === conditionFilter;

      return matchSearch && matchVillage && matchMonth && matchCondition;
    });
  }, [surveys, searchTerm, villageFilter, monthFilter, conditionFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredSurveys.length / ITEMS_PER_PAGE);
  const paginatedSurveys = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSurveys.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSurveys, currentPage]);

  const handleExport = () => {
    ReportService.exportSurveysCsv(filteredSurveys);
  };

  return (
    <div className="space-y-4">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Monthly Crop Surveys</h2>
          <p className="text-xs text-slate-500">
            Field inspections, crop phenology, fertilizer usage, and adverse symptom tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
            title="Download CSV report of current surveys"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>

          <button
            id="conduct-new-survey-btn"
            onClick={onOpenCreateSurvey}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Conduct Survey</span>
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
            placeholder="Search farmer, crop, ID..."
            className="w-full rounded-md border border-slate-300 py-2 pr-3 pl-9 text-xs focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        {/* Month Filter */}
        <div>
          <select
            value={monthFilter}
            onChange={e => {
              setMonthFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-md border border-slate-300 py-2 px-3 text-xs focus:border-blue-500 focus:outline-hidden"
          >
            <option value="All">All Months ({surveys.length})</option>
            {months.map(m => (
              <option key={m} value={m}>Month: {m}</option>
            ))}
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

        {/* Crop Condition Filter */}
        <div>
          <select
            value={conditionFilter}
            onChange={e => {
              setConditionFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-md border border-slate-300 py-2 px-3 text-xs focus:border-blue-500 focus:outline-hidden"
          >
            <option value="All">All Conditions</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        {filteredSurveys.length === 0 ? (
          <EmptyState
            title="No Survey Records Found"
            description="No monthly surveys match the specified criteria."
            actionText="Clear Filters"
            onAction={() => {
              setSearchTerm('');
              setVillageFilter('All');
              setMonthFilter('All');
              setConditionFilter('All');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Survey ID & Date</th>
                  <th className="px-4 py-3">Farmer & Village</th>
                  <th className="px-4 py-3">Crop & Growth Stage</th>
                  <th className="px-4 py-3">Condition & Alerts</th>
                  <th className="px-4 py-3">Water & Nutrition</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedSurveys.map(survey => (
                  <tr key={survey.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* ID & Date */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{survey.id}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3 text-blue-600" />
                        <span>{survey.surveyDate}</span>
                        <span className="rounded bg-slate-100 px-1 py-0.2 text-[10px] font-semibold text-slate-600">
                          {survey.month}
                        </span>
                      </div>
                    </td>

                    {/* Farmer & Village */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-800">{survey.farmerName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span>{survey.village}</span>
                      </div>
                    </td>

                    {/* Crop & Stage */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 flex items-center gap-1">
                        <Sprout className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{survey.crop} ({survey.cropVariety})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{survey.growthStage}</div>
                    </td>

                    {/* Condition & Disease Alert */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant={
                          survey.cropCondition === 'Excellent' || survey.cropCondition === 'Good' ? 'success' :
                          survey.cropCondition === 'Fair' ? 'warning' : 'danger'
                        }>
                          {survey.cropCondition}
                        </Badge>
                        {survey.hasDiseaseAlert && (
                          <Badge variant="danger">
                            <AlertTriangle className="h-3 w-3" />
                            Disease Alert
                          </Badge>
                        )}
                      </div>
                      {survey.diseaseSymptoms && (
                        <div className="text-[11px] text-slate-500 truncate max-w-[170px] mt-1">
                          {survey.diseaseSymptoms}
                        </div>
                      )}
                    </td>

                    {/* Water & Nutrition */}
                    <td className="px-4 py-3.5">
                      <div className="text-slate-800 font-medium">Water: {survey.waterAvailability}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[150px] mt-0.5">
                        {survey.fertilizerUsed || 'No chemical reported'}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => onViewSurvey(survey)}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-blue-700 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Details</span>
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
          totalItems={filteredSurveys.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={page => setCurrentPage(page)}
        />
      </div>
    </div>
  );
};
