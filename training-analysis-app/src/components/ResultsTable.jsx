import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, Download, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { exportToCSV } from '../utils/dataProcessing';

export default function ResultsTable({ analysisData, courseName }) {
  const [sortConfig, setSortConfig] = useState({ key: 'learningGain', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, improved, declined, nochange

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = [...analysisData];

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(row =>
        `${row.displayName} ${row.lastname}`.toLowerCase().includes(search) ||
        row.email.toLowerCase().includes(search)
      );
    }

    // Apply type filter
    if (filterType === 'improved') {
      filtered = filtered.filter(row => row.learningGain > 0);
    } else if (filterType === 'declined') {
      filtered = filtered.filter(row => row.learningGain < 0);
    } else if (filterType === 'nochange') {
      filtered = filtered.filter(row => row.learningGain === 0);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (sortConfig.key === 'displayName') {
        const aName = `${a.displayName} ${a.lastname}`.toLowerCase();
        const bName = `${b.displayName} ${b.lastname}`.toLowerCase();
        return sortConfig.direction === 'asc'
          ? aName.localeCompare(bName)
          : bName.localeCompare(aName);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    return filtered;
  }, [analysisData, searchTerm, filterType, sortConfig]);

  const handleExport = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${courseName}_analysis_${timestamp}.csv`;
    exportToCSV(filteredAndSortedData, filename);
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronDown className="w-4 h-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc'
      ? <ChevronUp className="w-4 h-4 text-blue-600" />
      : <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  const getChangeIcon = (gain) => {
    if (gain > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (gain < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getRowColor = (gain) => {
    if (gain > 5) return 'bg-green-50 border-l-4 border-green-500';
    if (gain < -5) return 'bg-red-50 border-l-4 border-red-500';
    if (gain !== 0) return 'bg-yellow-50 border-l-4 border-yellow-500';
    return 'bg-white border-l-4 border-gray-200';
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">Individual Results</h3>
        <button
          onClick={handleExport}
          className="btn-primary flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({analysisData.length})
          </button>
          <button
            onClick={() => setFilterType('improved')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterType === 'improved'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Improved
          </button>
          <button
            onClick={() => setFilterType('declined')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterType === 'declined'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Declined
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('displayName')}
              >
                <div className="flex items-center gap-2">
                  Name
                  <SortIcon columnKey="displayName" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('preRate')}
              >
                <div className="flex items-center justify-end gap-2">
                  Pre-Test
                  <SortIcon columnKey="preRate" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('postRate')}
              >
                <div className="flex items-center justify-end gap-2">
                  Post-Test
                  <SortIcon columnKey="postRate" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('learningGain')}
              >
                <div className="flex items-center justify-end gap-2">
                  Learning Gain
                  <SortIcon columnKey="learningGain" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('percentageImprovement')}
              >
                <div className="flex items-center justify-end gap-2">
                  Improvement %
                  <SortIcon columnKey="percentageImprovement" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAndSortedData.map((row, index) => (
              <tr
                key={`${row.email}-${index}`}
                className={`${getRowColor(row.learningGain)} hover:bg-opacity-75 transition-colors`}
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">
                    {row.displayName} {row.lastname}
                  </div>
                  <div className="text-sm text-gray-500">{row.email}</div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="font-medium text-gray-900">
                    {row.preScore}/{row.fullScore}
                  </div>
                  <div className="text-sm text-gray-500">{row.preRate.toFixed(1)}%</div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="font-medium text-gray-900">
                    {row.postScore}/{row.fullScore}
                  </div>
                  <div className="text-sm text-gray-500">{row.postRate.toFixed(1)}%</div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {getChangeIcon(row.learningGain)}
                    <span className={`font-semibold ${
                      row.learningGain > 0
                        ? 'text-green-700'
                        : row.learningGain < 0
                        ? 'text-red-700'
                        : 'text-gray-600'
                    }`}>
                      {row.learningGain > 0 ? '+' : ''}{row.learningGain.toFixed(1)} pts
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`font-medium ${
                    row.percentageImprovement > 0
                      ? 'text-green-700'
                      : row.percentageImprovement < 0
                      ? 'text-red-700'
                      : 'text-gray-600'
                  }`}>
                    {row.percentageImprovement > 0 ? '+' : ''}{row.percentageImprovement.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {row.postPassed ? (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                        Passed
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                        Not Passed
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAndSortedData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No results found matching your criteria
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredAndSortedData.length} of {analysisData.length} participants
      </div>
    </div>
  );
}
