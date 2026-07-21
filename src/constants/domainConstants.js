/**
 * BuildTrack Domain Constants
 * Single source of truth for all business enum values
 * 
 * This file centralizes all domain constants to ensure consistency
 * across frontend, backend, validation, and database layers.
 */

// ============================================
// PROJECT CONSTANTS
// ============================================

export const PROJECT_STATUS = Object.freeze([
  "Planning",
  "Active", 
  "Completed",
  "Delayed",
  "On Hold",
  "Cancelled"
]);

export const PROJECT_PRIORITY = Object.freeze([
  "Low",
  "Medium",
  "High",
  "Critical"
]);

// ============================================
// TASK CONSTANTS
// ============================================

export const TASK_STATUS = Object.freeze([
  "Pending",
  "In Progress",
  "Completed",
  "Blocked",
  "On Hold"
]);

export const TASK_PRIORITY = Object.freeze([
  "Low",
  "Medium",
  "High",
  "Critical"
]);

// ============================================
// MILESTONE CONSTANTS
// ============================================

export const MILESTONE_STATUS = Object.freeze([
  "Pending",
  "In Progress",
  "Completed",
  "Blocked",
  "On Hold",
  "Cancelled"
]);

// ============================================
// WORKER CONSTANTS
// ============================================

export const WORKER_STATUS = Object.freeze([
  "Active",
  "On Leave",
  "Suspended",
  "Resigned",
  "Terminated"
]);

export const WORKER_ROLES = Object.freeze([
  "General Worker",
  "Site Engineer",
  "Foreman",
  "Supervisor",
  "Project Manager",
  "Safety Officer",
  "Quality Inspector",
  "Electrician",
  "Plumber",
  "Carpenter",
  "Welder",
  "Heavy Equipment Operator"
]);

export const EMPLOYMENT_TYPE = Object.freeze([
  "Permanent",
  "Contract",
  "Casual",
  "Intern",
  "Consultant"
]);

// ============================================
// ATTENDANCE CONSTANTS
// ============================================

export const ATTENDANCE_STATUS = Object.freeze([
  "Active",
  "Completed",
  "Transferred",
  "Removed"
]);

export const ATTENDANCE_SESSION_STATUS = Object.freeze([
  "Active",
  "Completed",
  "Cancelled"
]);

// ============================================
// MATERIAL CONSTANTS
// ============================================

export const MATERIAL_STATUS = Object.freeze([
  "In Stock",
  "Low Stock",
  "Out of Stock",
  "Ordered",
  "Delivered"
]);

export const MATERIAL_CATEGORY = Object.freeze([
  "Construction",
  "Engineering",
  "Electrical",
  "Plumbing",
  "Finishing",
  "Safety Equipment",
  "Tools",
  "Other"
]);

export const TRANSACTION_TYPE = Object.freeze([
  "Purchase",
  "Usage",
  "Transfer",
  "Return",
  "Adjustment"
]);

// ============================================
// USER/ROLE CONSTANTS
// ============================================

export const USER_ROLES = Object.freeze({
  ADMIN: "Admin",
  PROJECT_MANAGER: "Project Manager",
  SUPERVISOR: "Supervisor",
  WORKER: "Worker"
});

export const USER_ROLES_ARRAY = Object.freeze([
  "Admin",
  "Project Manager",
  "Supervisor",
  "Worker"
]);

// ============================================
// ASSIGNMENT CONSTANTS
// ============================================

export const ASSIGNMENT_STATUS = Object.freeze([
  "Active",
  "Completed",
  "Transferred",
  "Removed"
]);

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validate if a value is in the allowed enum values
 * @param {string} value - Value to validate
 * @param {Array} allowedValues - Array of allowed values
 * @returns {boolean} True if valid
 */
export const isValidEnumValue = (value, allowedValues) => {
  if (!value || typeof value !== 'string') return false;
  return allowedValues.includes(value.trim());
};

/**
 * Normalize status value (trim whitespace, standardize case)
 * @param {string} status - Status value to normalize
 * @returns {string} Normalized status
 */
export const normalizeStatus = (status) => {
  if (!status || typeof status !== 'string') return '';
  return status.trim();
};

/**
 * Get validation error message for invalid enum value
 * @param {string} fieldName - Name of the field
 * @param {Array} allowedValues - Array of allowed values
 * @returns {string} Error message
 */
export const getValidationErrorMessage = (fieldName, allowedValues) => {
  return `Invalid ${fieldName}. Allowed values:\n${allowedValues.join('\n')}`;
};

// ============================================
// STATUS COLOR MAPPINGS (for UI consistency)
// ============================================

export const PROJECT_STATUS_COLORS = Object.freeze({
  "Planning": "#F59E0B",
  "Active": "#10B981",
  "Completed": "#3B82F6",
  "Delayed": "#EF4444",
  "On Hold": "#F59E0B",
  "Cancelled": "#6B7280"
});

export const TASK_STATUS_COLORS = Object.freeze({
  "Pending": "#F59E0B",
  "In Progress": "#3B82F6",
  "Completed": "#10B981",
  "Blocked": "#EF4444",
  "On Hold": "#6B7280"
});

export const MILESTONE_STATUS_COLORS = Object.freeze({
  "Pending": "#F59E0B",
  "In Progress": "#3B82F6",
  "Completed": "#10B981",
  "Blocked": "#EF4444",
  "On Hold": "#EF4444",
  "Cancelled": "#6B7280"
});

export const WORKER_STATUS_COLORS = Object.freeze({
  "Active": "#10B981",
  "On Leave": "#F59E0B",
  "Suspended": "#EF4444",
  "Resigned": "#6B7280",
  "Terminated": "#6B7280"
});

export const MATERIAL_STATUS_COLORS = Object.freeze({
  "In Stock": "#10B981",
  "Low Stock": "#F59E0B",
  "Out of Stock": "#EF4444",
  "Ordered": "#3B82F6",
  "Delivered": "#10B981"
});

// ============================================
// DROPDOWN OPTIONS (for forms and filters)
// ============================================

export const PROJECT_STATUS_OPTIONS = PROJECT_STATUS.map(status => ({
  label: status,
  value: status
}));

export const PROJECT_PRIORITY_OPTIONS = PROJECT_PRIORITY.map(priority => ({
  label: priority,
  value: priority
}));

export const TASK_STATUS_OPTIONS = TASK_STATUS.map(status => ({
  label: status,
  value: status
}));

export const TASK_PRIORITY_OPTIONS = TASK_PRIORITY.map(priority => ({
  label: priority,
  value: priority
}));

export const MILESTONE_STATUS_OPTIONS = MILESTONE_STATUS.map(status => ({
  label: status,
  value: status
}));

export const WORKER_STATUS_OPTIONS = WORKER_STATUS.map(status => ({
  label: status,
  value: status
}));

export const WORKER_ROLE_OPTIONS = WORKER_ROLES.map(role => ({
  label: role,
  value: role
}));

export const EMPLOYMENT_TYPE_OPTIONS = EMPLOYMENT_TYPE.map(type => ({
  label: type,
  value: type
}));

export const MATERIAL_STATUS_OPTIONS = MATERIAL_STATUS.map(status => ({
  label: status,
  value: status
}));

export const MATERIAL_CATEGORY_OPTIONS = MATERIAL_CATEGORY.map(category => ({
  label: category,
  value: category
}));

export const TRANSACTION_TYPE_OPTIONS = TRANSACTION_TYPE.map(type => ({
  label: type,
  value: type
}));

export const USER_ROLE_OPTIONS = USER_ROLES_ARRAY.map(role => ({
  label: role,
  value: role
}));

export const ASSIGNMENT_STATUS_OPTIONS = ASSIGNMENT_STATUS.map(status => ({
  label: status,
  value: status
}));