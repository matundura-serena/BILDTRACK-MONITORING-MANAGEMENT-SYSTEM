/**
 * Column Mapper Service
 * Handles intelligent column mapping for Material Import Wizard
 * Maps Excel/CSV/Word table columns to BuildTrack material database fields
 * 
 * Pure JavaScript - No React code, No API calls, No database access
 */

export class ColumnMapper {
  /**
   * Field mappings configuration
   * Maps database fields to their possible aliases
   */
  static FIELD_MAPPINGS = {
    material_name: {
      field: 'material_name',
      required: true,
      aliases: [
        'materialname', 'material', 'item', 'itemname', 'product',
        'name', 'resource', 'stockitem', 'materialdescription'
      ]
    },
    quantity_total: {
      field: 'quantity_total',
      required: true,
      aliases: [
        'quantity', 'qty', 'stock', 'totalstock', 'availablestock',
        'availablequantity', 'inventory', 'count', 'pieces', 'units',
        'quantitytotal', 'totalqty', 'availableqty', 'qtyonhand',
        'quantityonhand', 'stocklevel', 'total', 'amount'
      ]
    },
    category: {
      field: 'category',
      required: false,
      aliases: [
        'type', 'materialcategory', 'classification', 'categoryname',
        'group', 'class', 'materialtype'
      ]
    },
    unit: {
      field: 'unit',
      required: false,
      aliases: [
        'uom', 'measurement', 'measure', 'unitofmeasure',
        'unitofmeasurement', 'uomname', 'measuringunit', 'unittype'
      ]
    },
    unit_cost: {
      field: 'unit_cost',
      required: false,
      aliases: [
        'price', 'cost', 'unitcost', 'buyingprice', 'unitprice',
        'purchaseprice', 'rate', 'amountperunit', 'priceperunit'
      ]
    },
    supplier: {
      field: 'supplier',
      required: false,
      aliases: [
        'vendor', 'company', 'manufacturer', 'suppliername',
        'source', 'provider', 'seller'
      ]
    },
    location: {
      field: 'location',
      required: false,
      aliases: [
        'warehouse', 'site', 'storage', 'store', 'warehouselocation',
        'storagelocation', 'shelf', 'bin', 'area'
      ]
    },
    minimum_stock: {
      field: 'minimum_stock',
      required: false,
      aliases: [
        'minimum', 'reorderlevel', 'safetystock', 'minstock',
        'minquantity', 'reorderpoint', 'threshold', 'minlevel',
        'minimumstock'
      ]
    },
    description: {
      field: 'description',
      required: false,
      aliases: [
        'desc', 'details', 'remarks', 'notes', 'comments',
        'specification', 'info', 'materialdescription'
      ]
    }
  };

  /**
   * Normalize column name by removing spaces, underscores, brackets, punctuation, and symbols
   * Converts to lowercase for consistent matching
   * 
   * @param {string} name - The column name to normalize
   * @returns {string} Normalized column name
   * 
   * @example
   * normalizeColumnName("Material Name") // returns "materialname"
   * normalizeColumnName("Unit Cost ($)") // returns "unitcost"
   */
  static normalizeColumnName(name) {
    if (!name || typeof name !== 'string') {
      return '';
    }

    return name
      .toLowerCase()
      .trim()
      // Remove brackets and their content (e.g., "($)", "[optional]")
      .replace(/\[.*?\]/g, '')
      .replace(/\(.*?\)/g, '')
      // Remove special characters and punctuation
      .replace(/[^\w\s]/g, '')
      // Remove underscores
      .replace(/_/g, '')
      // Remove extra spaces
      .replace(/\s+/g, '')
      // Convert to lowercase (already done, but ensure consistency)
      .toLowerCase();
  }

  /**
   * Get all field mappings with their aliases
   * Returns an object describing every BuildTrack field and all possible aliases
   * 
   * @returns {Object} Field mappings configuration
   * 
   * @example
   * getFieldMappings()
   * // Returns object with material_name, quantity_total, etc.
   */
  static getFieldMappings() {
    return this.FIELD_MAPPINGS;
  }

  /**
   * Automatically map uploaded columns to BuildTrack fields using fuzzy matching
   * 
   * @param {Array} uploadedColumns - Array of column names from uploaded file
   * @returns {Object} Mapping object with column names as keys and field names as values
   * 
   * @example
   * autoMapColumns(["Material", "Qty", "Price", "Warehouse"])
   * // Returns: { Material: "material_name", Qty: "quantity_total", Price: "unit_cost", Warehouse: "location" }
   */
  static autoMapColumns(uploadedColumns) {
    const mapping = {};

    if (!Array.isArray(uploadedColumns)) {
      return mapping;
    }

    uploadedColumns.forEach(columnName => {
      const normalized = this.normalizeColumnName(columnName);
      const matchedField = this._findMatchingField(normalized);

      if (matchedField) {
        mapping[columnName] = matchedField;
      }
    });

    return mapping;
  }

  /**
   * Find matching field for a normalized column name
   * Internal helper method for fuzzy matching
   * 
   * @param {string} normalizedName - Normalized column name
   * @returns {string|null} Matched field name or null
   * @private
   */
  static _findMatchingField(normalizedName) {
    // Check each field mapping
    for (const [fieldKey, fieldConfig] of Object.entries(this.FIELD_MAPPINGS)) {
      // Direct match with field key
      if (normalizedName === fieldKey) {
        return fieldConfig.field;
      }

      // Check if normalized name matches any alias
      if (fieldConfig.aliases.includes(normalizedName)) {
        return fieldConfig.field;
      }

      // Fuzzy matching - check if normalized name contains the field key or alias
      // This handles cases like "available qty" -> "availableqty" -> matches "availableqty" alias
      for (const alias of fieldConfig.aliases) {
        if (normalizedName.includes(alias) || alias.includes(normalizedName)) {
          return fieldConfig.field;
        }
      }

      // Check if normalized name contains the field key
      if (normalizedName.includes(fieldKey)) {
        return fieldConfig.field;
      }
    }

    return null;
  }

  /**
   * Get available mapping options for dropdown selectors
   * Returns array of objects with label and value for each field
   * 
   * @returns {Array} Array of mapping options
   * 
   * @example
   * getAvailableMappingOptions()
   * // Returns: [{ label: "Material Name", value: "material_name" }, ...]
   */
  static getAvailableMappingOptions() {
    return Object.entries(this.FIELD_MAPPINGS).map(([fieldKey, fieldConfig]) => ({
      label: this._formatFieldName(fieldConfig.field),
      value: fieldConfig.field,
      required: fieldConfig.required
    }));
  }

  /**
   * Validate a mapping object to ensure all required fields are present
   * 
   * @param {Object} mapping - Mapping object to validate
   * @returns {Object} Validation result with valid flag and errors array
   * 
   * @example
   * validateMapping({ material_name: "Material", quantity_total: "Qty" })
   * // Returns: { valid: true, errors: [] }
   * 
   * validateMapping({ material_name: "Material" })
   * // Returns: { valid: false, errors: ["Quantity is required"] }
   */
  static validateMapping(mapping) {
    const errors = [];

    if (!mapping || typeof mapping !== 'object') {
      return {
        valid: false,
        errors: ['Invalid mapping provided']
      };
    }

    // Check required fields
    for (const [fieldKey, fieldConfig] of Object.entries(this.FIELD_MAPPINGS)) {
      if (fieldConfig.required && !mapping[fieldConfig.field]) {
        // Use shorter display names for error messages
        const displayName = fieldConfig.field === 'material_name' ? 'Material Name' :
                           fieldConfig.field === 'quantity_total' ? 'Quantity' :
                           this._formatFieldName(fieldConfig.field);
        errors.push(`${displayName} is required`);
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Get list of required fields
   * 
   * @returns {Array} Array of required field names
   * 
   * @example
   * getRequiredFields()
   * // Returns: ["material_name", "quantity_total"]
   */
  static getRequiredFields() {
    return Object.entries(this.FIELD_MAPPINGS)
      .filter(([_, config]) => config.required)
      .map(([fieldKey, _]) => fieldKey);
  }

  /**
   * Get list of optional fields
   * 
   * @returns {Array} Array of optional field names
   * 
   * @example
   * getOptionalFields()
   * // Returns: ["category", "unit", "unit_cost", "supplier", "location", "minimum_stock", "description"]
   */
  static getOptionalFields() {
    return Object.entries(this.FIELD_MAPPINGS)
      .filter(([_, config]) => !config.required)
      .map(([fieldKey, _]) => fieldKey);
  }

  /**
   * Format field name for display (convert snake_case to Title Case)
   * 
   * @param {string} fieldName - Database field name in snake_case
   * @returns {string} Formatted display name in Title Case
   * @private
   * 
   * @example
   * _formatFieldName("material_name") // returns "Material Name"
   * _formatFieldName("unit_cost") // returns "Unit Cost"
   */
  static _formatFieldName(fieldName) {
    return fieldName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Get field configuration by field name
   * 
   * @param {string} fieldName - Database field name
   * @returns {Object|undefined} Field configuration object
   */
  static getFieldConfig(fieldName) {
    return this.FIELD_MAPPINGS[fieldName] || undefined;
  }

  /**
   * Check if a field is required
   * 
   * @param {string} fieldName - Database field name
   * @returns {boolean} True if field is required
   */
  static isFieldRequired(fieldName) {
    const config = this.FIELD_MAPPINGS[fieldName];
    return config ? config.required : false;
  }

  /**
   * Get all aliases for a specific field
   * 
   * @param {string} fieldName - Database field name
   * @returns {Array} Array of aliases for the field
   */
  static getFieldAliases(fieldName) {
    const config = this.FIELD_MAPPINGS[fieldName];
    return config ? config.aliases : [];
  }
}

export default ColumnMapper;