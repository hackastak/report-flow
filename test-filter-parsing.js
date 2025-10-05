/**
 * Test Filter Parsing
 * 
 * This script tests that filters are correctly parsed from JSON strings
 */

// Simulate what happens in the database
const mockFilters = [
  {
    filterKey: "dateRange",
    filterValue: JSON.stringify("LAST_30_DAYS"), // String
  },
  {
    filterKey: "salesChannel",
    filterValue: JSON.stringify(["online_store", "pos"]), // Array
  },
  {
    filterKey: "status",
    filterValue: JSON.stringify("ALL"), // String
  },
];

console.log("🧪 Testing Filter Parsing\n");
console.log("Mock filters from database:");
console.log(JSON.stringify(mockFilters, null, 2));
console.log("\n");

// OLD WAY (BROKEN) - What was happening before
console.log("❌ OLD WAY (BROKEN):");
const filtersObjOld = {};
mockFilters.forEach((filter) => {
  filtersObjOld[filter.filterKey] = filter.filterValue; // No parsing!
});
console.log("Result:", JSON.stringify(filtersObjOld, null, 2));
console.log("salesChannel type:", typeof filtersObjOld.salesChannel);
console.log("salesChannel value:", filtersObjOld.salesChannel);
console.log("Is array?", Array.isArray(filtersObjOld.salesChannel));

try {
  const channels = filtersObjOld.salesChannel.join(" OR ");
  console.log("✅ join() worked:", channels);
} catch (error) {
  console.log("💥 join() failed:", error.message);
}

console.log("\n");

// NEW WAY (FIXED) - What happens now
console.log("✅ NEW WAY (FIXED):");
const filtersObjNew = {};
mockFilters.forEach((filter) => {
  try {
    filtersObjNew[filter.filterKey] = JSON.parse(filter.filterValue); // Parse JSON!
  } catch (error) {
    filtersObjNew[filter.filterKey] = filter.filterValue;
  }
});
console.log("Result:", JSON.stringify(filtersObjNew, null, 2));
console.log("salesChannel type:", typeof filtersObjNew.salesChannel);
console.log("salesChannel value:", filtersObjNew.salesChannel);
console.log("Is array?", Array.isArray(filtersObjNew.salesChannel));

try {
  const channels = filtersObjNew.salesChannel.join(" OR ");
  console.log("✅ join() worked:", channels);
} catch (error) {
  console.log("💥 join() failed:", error.message);
}

console.log("\n🎉 Test complete! The fix works correctly.");

