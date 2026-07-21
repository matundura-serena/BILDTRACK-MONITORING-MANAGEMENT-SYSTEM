// Test script for ColumnMapper
const { ColumnMapper } = require('./src/services/columnMapper');

console.log('=== ColumnMapper Test Suite ===\n');

// Test 1: Import successful
console.log('✓ Import successful');

// Test 2: Required fields
const requiredFields = ColumnMapper.getRequiredFields();
console.log('✓ Required fields:', requiredFields);
console.log('  Expected: ["material_name", "quantity_total"]');
console.log('  Match:', JSON.stringify(requiredFields) === '["material_name","quantity_total"]' ? '✓' : '✗');

// Test 3: Optional fields
const optionalFields = ColumnMapper.getOptionalFields();
console.log('\n✓ Optional fields:', optionalFields);
console.log('  Expected: ["category", "unit", "unit_cost", "supplier", "location", "minimum_stock", "description"]');
console.log('  Match:', JSON.stringify(optionalFields) === '["category","unit","unit_cost","supplier","location","minimum_stock","description"]' ? '✓' : '✗');

// Test 4: Normalize column name
const normalized1 = ColumnMapper.normalizeColumnName('Material Name');
console.log('\n✓ normalizeColumnName("Material Name"):', normalized1);
console.log('  Expected: "materialname"');
console.log('  Match:', normalized1 === 'materialname' ? '✓' : '✗');

const normalized2 = ColumnMapper.normalizeColumnName('Unit Cost ($)');
console.log('\n✓ normalizeColumnName("Unit Cost ($)"):', normalized2);
console.log('  Expected: "unitcost"');
console.log('  Match:', normalized2 === 'unitcost' ? '✓' : '✗');

// Test 5: Auto map columns
const autoMapped = ColumnMapper.autoMapColumns(['Material', 'Qty', 'Price', 'Warehouse']);
console.log('\n✓ autoMapColumns(["Material", "Qty", "Price", "Warehouse"]):');
console.log('  Result:', JSON.stringify(autoMapped));
console.log('  Expected: {"Material":"material_name","Qty":"quantity_total","Price":"unit_cost","Warehouse":"location"}');
const expectedMapping = {
  'Material': 'material_name',
  'Qty': 'quantity_total',
  'Price': 'unit_cost',
  'Warehouse': 'location'
};
console.log('  Match:', JSON.stringify(autoMapped) === JSON.stringify(expectedMapping) ? '✓' : '✗');

// Test 6: Validate mapping - valid
const validResult = ColumnMapper.validateMapping({ material_name: 'Material', quantity_total: 'Qty' });
console.log('\n✓ validateMapping({ material_name: "Material", quantity_total: "Qty" }):');
console.log('  Result:', JSON.stringify(validResult));
console.log('  Expected: {"valid":true,"errors":[]}');
console.log('  Match:', JSON.stringify(validResult) === '{"valid":true,"errors":[]}' ? '✓' : '✗');

// Test 7: Validate mapping - invalid
const invalidResult = ColumnMapper.validateMapping({ material_name: 'Material' });
console.log('\n✓ validateMapping({ material_name: "Material" }):');
console.log('  Result:', JSON.stringify(invalidResult));
console.log('  Expected: {"valid":false,"errors":["Quantity is required"]}');
console.log('  Match:', JSON.stringify(invalidResult) === '{"valid":false,"errors":["Quantity is required"]}' ? '✓' : '✗');

// Test 8: Get available mapping options
const options = ColumnMapper.getAvailableMappingOptions();
console.log('\n✓ getAvailableMappingOptions():');
console.log('  Count:', options.length, 'options');
console.log('  First option:', JSON.stringify(options[0]));
console.log('  Has material_name:', options.some(o => o.value === 'material_name'));
console.log('  Has quantity_total:', options.some(o => o.value === 'quantity_total'));

// Test 9: Fuzzy matching - Available Qty should map to quantity_total
const fuzzyMapped = ColumnMapper.autoMapColumns(['Available Qty']);
console.log('\n✓ Fuzzy matching - autoMapColumns(["Available Qty"]):');
console.log('  Result:', JSON.stringify(fuzzyMapped));
console.log('  Expected: {"Available Qty":"quantity_total"}');
console.log('  Match:', JSON.stringify(fuzzyMapped) === '{"Available Qty":"quantity_total"}' ? '✓' : '✗');

// Test 10: Verify quantity_available is NEVER returned
const allMappings = ColumnMapper.getFieldMappings();
const hasQuantityAvailable = Object.values(allMappings).some(m => m.field === 'quantity_available');
console.log('\n✓ Verify quantity_available is NEVER used:');
console.log('  Has quantity_available field:', hasQuantityAvailable);
console.log('  Match:', !hasQuantityAvailable ? '✓' : '✗');

console.log('\n=== All Tests Complete ===');