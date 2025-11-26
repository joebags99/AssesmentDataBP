import { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import Papa from 'papaparse';

export default function CSVUpload({ onDataLoaded }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const processFile = useCallback((file) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(false);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target.result;

        // Parse the CSV - skip first 7 lines of metadata
        const lines = text.split('\n');

        if (lines.length < 9) {
          throw new Error('CSV file appears to be too short. Expected at least 8 header lines plus data.');
        }

        // Line 8 (index 7) contains the headers
        const dataSection = lines.slice(7).join('\n');

        Papa.parse(dataSection, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.data.length === 0) {
              setError('No data found in CSV file');
              setIsProcessing(false);
              return;
            }

            // Validate required fields
            const requiredFields = ['Email', 'Exam Title', 'Score', 'Course'];
            const firstRow = results.data[0];
            const missingFields = requiredFields.filter(field => !(field in firstRow));

            if (missingFields.length > 0) {
              setError(`Missing required fields: ${missingFields.join(', ')}`);
              setIsProcessing(false);
              return;
            }

            // Filter out empty records
            const validRecords = results.data.filter(record =>
              record.Email && record['Exam Title'] && record.Score
            );

            if (validRecords.length === 0) {
              setError('No valid records found in CSV file');
              setIsProcessing(false);
              return;
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            onDataLoaded(validRecords);
            setIsProcessing(false);
          },
          error: (error) => {
            setError(`Failed to parse CSV: ${error.message}`);
            setIsProcessing(false);
          }
        });
      } catch (err) {
        setError(err.message);
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setError('Failed to read file');
      setIsProcessing(false);
    };

    reader.readAsText(file);
  }, [onDataLoaded]);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  return (
    <div className="card">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Training Data</h2>
        <p className="text-gray-600">
          Upload your CSV export from UKG Learning Pro to begin analysis
        </p>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && document.getElementById('file-input').click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isProcessing}
        />

        <div className="flex flex-col items-center gap-3">
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 font-medium">Processing your file...</p>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-700">
                  Drop your CSV file here or click to browse
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Supports UKG Learning Pro CSV exports
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Upload Error</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-800 font-medium">Success!</p>
            <p className="text-green-700 text-sm mt-1">Your data has been loaded successfully</p>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Expected CSV Format:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>First 7 lines: Metadata (will be skipped)</li>
              <li>Line 8: Column headers</li>
              <li>Line 9+: Training data records</li>
              <li>Must include: Email, Exam Title, Score, Course fields</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
