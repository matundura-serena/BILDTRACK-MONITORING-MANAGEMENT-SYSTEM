import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import * as FileSystem from 'expo-file-system';

/**
 * Service for parsing Excel and CSV files locally
 * Converts files to JSON format without uploading to backend
 */
export const fileParserService = {
  /**
   * Parse a file (Excel or CSV) and convert to JSON
   * @param {Object} file - File object from document picker
   * @param {string} file.uri - URI of the file
   * @param {string} file.name - Filename
   * @param {string} file.type - type
   * @returns {Promise<{columns: string[], rows: object[]}>} Parsed data
   */
  parseFile: async (file) => {
    if (!file || !file.uri) {
      throw new Error('File object with URI is required');
    }

    try {
      // Read file content
      const fileContent = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Determine file type and parse accordingly
      const fileExtension = file.name?.split('.').pop()?.toLowerCase();
      
      if (fileExtension === 'csv' || file.type === 'text/csv') {
        return fileParserService.parseCSV(fileContent);
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls' || 
                 file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                 file.type === 'application/vnd.ms-excel') {
        return fileParserService.parseExcel(file.uri);
      } else {
        throw new Error('Unsupported file type. Please use .xlsx, .xls, or .csv files');
      }
    } catch (error) {
      throw new Error(`Failed to parse file: ${error.message}`);
    }
  },

  /**
   * Parse CSV content
   * @param {string} content - CSV file content
   * @returns {Promise<{columns: string[], rows: object[]}>} Parsed data
   */
  parseCSV: (content) => {
    try {
      const result = Papa.parse(content, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        transformHeader: (header) => header.trim(),
      });

      if (result.errors.length > 0) {
        console.warn('CSV parsing warnings:', result.errors);
      }

      if (!result.data || result.data.length === 0) {
        throw new Error('CSV file is empty or has no data rows');
      }

      // Extract columns from the first row
      const columns = Object.keys(result.data[0]);
      
      // Convert to the standard format
      const rows = result.data.map((row, index) => {
        const processedRow = {};
        columns.forEach(column => {
          processedRow[column] = row[column];
        });
        return processedRow;
      });

      return {
        columns,
        rows,
      };
    } catch (error) {
      throw new Error(`Failed to parse CSV: ${error.message}`);
    }
  },

  /**
   * Parse Excel file
   * @param {string} fileUri - URI of the Excel file
   * @returns {Promise<{columns: string[], rows: object[]}>} Parsed data
   */
  parseExcel: async (fileUri) => {
    try {
      // Read the file as base64
      const base64Data = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 to binary
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Read workbook
      const workbook = XLSX.read(bytes, { type: 'array' });

      // Get first sheet
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        throw new Error('Excel file has no sheets');
      }

      const worksheet = workbook.Sheets[firstSheetName];

      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1, // Return array of arrays
        defval: '', // Default value for empty cells
      });

      if (!jsonData || jsonData.length < 2) {
        throw new Error('Excel file is empty or has no data rows');
      }

      // First row is headers
      const headers = jsonData[0].map(header => String(header).trim());
      
      // Remaining rows are data
      const rows = [];
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (row && row.length > 0) {
          const processedRow = {};
          headers.forEach((header, index) => {
            processedRow[header] = row[index] !== undefined ? row[index] : '';
          });
          rows.push(processedRow);
        }
      }

      if (rows.length === 0) {
        throw new Error('No data rows found in Excel file');
      }

      return {
        columns: headers,
        rows,
      };
    } catch (error) {
      throw new Error(`Failed to parse Excel file: ${error.message}`);
    }
  },

  /**
   * Validate parsed data structure
   * @param {Object} data - Parsed data to validate
   * @returns {boolean} True if valid
   */
  validateParsedData: (data) => {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data format');
    }

    if (!Array.isArray(data.columns) || data.columns.length === 0) {
      throw new Error('Data must have a non-empty columns array');
    }

    if (!Array.isArray(data.rows) || data.rows.length === 0) {
      throw new Error('Data must have a non-empty rows array');
    }

    // Validate that each row has the same number of fields as columns
    const columnCount = data.columns.length;
    data.rows.forEach((row, index) => {
      const rowKeys = Object.keys(row);
      if (rowKeys.length !== columnCount) {
        throw new Error(`Row ${index + 1} has ${rowKeys.length} fields, expected ${columnCount}`);
      }
    });

    return true;
  },

  /**
   * Generate preview data (first N rows)
   * @param {Object} data - Parsed data
   * @param {number} limit - Number of rows to preview
   * @returns {Array} Preview rows
   */
  generatePreview: (data, limit = 20) => {
    if (!data || !Array.isArray(data.rows)) {
      return [];
    }

    return data.rows.slice(0, limit).map((row, index) => ({
      rowNumber: index + 1,
      data: row,
    }));
  },
};

export default fileParserService;