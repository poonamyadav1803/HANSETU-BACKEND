/**
 * Category & Product Reference Data
 *
 * This is the canonical source of truth for all category, subcategory,
 * and product seed data. This data will be inserted into the database
 * via `npm run db:seed`.
 *
 * Source: migrated from HANSETUCOM monolith frontend static data.
 */
export const categoryData = {
  electrical: {
    subcategories: [
      "Cables & Wires", "Circuit Breakers", "Lighting (LED, Industrial)",
      "Switches & Sockets", "Electrical Tools", "Power Distribution",
      "Transformers", "Motors & Drives", "Control Panels", "Safety Equipment"
    ],
    products: [
      {
        id: 1, name: "Industrial LED Flood Light 100W", subcategory: "Lighting (LED, Industrial)",
        price: 89.99, originalPrice: 109.99, rating: 4.8, reviews: 234, brand: "Philips",
        inStock: true, specs: "100W, IP65, 5000K, 13000 Lumens",
        description: "High-efficiency LED flood light for industrial applications"
      },
      {
        id: 2, name: "Copper Power Cable 4mm² - 100m", subcategory: "Cables & Wires",
        price: 156.00, rating: 4.9, reviews: 187, brand: "Havells",
        inStock: true, specs: "4mm², 1100V, Copper conductor",
        description: "Premium copper power cable for industrial installations"
      },
      {
        id: 3, name: "3-Phase Circuit Breaker 63A", subcategory: "Circuit Breakers",
        price: 299.99, originalPrice: 349.99, rating: 4.7, reviews: 156, brand: "Schneider Electric",
        inStock: false, specs: "63A, 415V, C-Type, 10kA",
        description: "Industrial grade 3-phase MCB for electrical panels"
      },
      {
        id: 4, name: "Digital Multimeter Professional", subcategory: "Electrical Tools",
        price: 145.50, rating: 4.9, reviews: 342, brand: "Fluke",
        inStock: true, specs: "6000 Count, True RMS, CAT III",
        description: "Professional digital multimeter for electrical testing"
      },
      {
        id: 5, name: "Industrial Wall Socket 16A", subcategory: "Switches & Sockets",
        price: 25.99, originalPrice: 32.99, rating: 4.6, reviews: 89, brand: "Legrand",
        inStock: true, specs: "16A, 240V, IP44, Modular",
        description: "Heavy-duty industrial wall socket with weatherproof design"
      }
    ]
  },

  "hand-tools": {
    subcategories: [
      "Screwdrivers", "Wrenches", "Pliers", "Hammers", "Measuring Tools",
      "Cutting Tools", "Hex Keys", "Tool Sets", "Specialty Tools", "Safety Tools"
    ],
    products: [
      {
        id: 1, name: "Professional Screwdriver Set 12pc", subcategory: "Screwdrivers",
        price: 45.99, originalPrice: 59.99, rating: 4.8, reviews: 156, brand: "Stanley",
        inStock: true, specs: "Chrome Vanadium Steel, Magnetic Tips",
        description: "Professional grade screwdriver set with ergonomic handles"
      },
      {
        id: 2, name: "Adjustable Wrench 12 inch", subcategory: "Wrenches",
        price: 28.50, rating: 4.9, reviews: 203, brand: "Bahco",
        inStock: true, specs: "Chrome plated, 38mm jaw capacity",
        description: "Heavy-duty adjustable wrench for industrial use"
      },
      {
        id: 3, name: "Digital Caliper 150mm", subcategory: "Measuring Tools",
        price: 89.99, originalPrice: 109.99, rating: 4.7, reviews: 78, brand: "Mitutoyo",
        inStock: false, specs: "0.01mm accuracy, Stainless steel",
        description: "Precision digital caliper for accurate measurements"
      },
      {
        id: 4, name: "Ball Peen Hammer 16oz", subcategory: "Hammers",
        price: 32.99, rating: 4.6, reviews: 94, brand: "Estwing",
        inStock: true, specs: "Forged steel head, Leather grip",
        description: "One-piece forged steel hammer with shock-reducing grip"
      }
    ]
  },

  hydraulics: {
    subcategories: [
      "Hydraulic Pumps", "Cylinders", "Valves", "Hoses & Fittings",
      "Filters", "Accumulators", "Power Units", "Manifolds", "Seals", "Gauges"
    ],
    products: [
      {
        id: 1, name: "Hydraulic Gear Pump 25GPM", subcategory: "Hydraulic Pumps",
        price: 485.00, rating: 4.7, reviews: 89, brand: "Parker",
        inStock: true, specs: "25 GPM, 3000 PSI, Cast Iron",
        description: "High-pressure gear pump for industrial hydraulic systems"
      },
      {
        id: 2, name: "Double Acting Cylinder 4x12", subcategory: "Cylinders",
        price: 235.99, originalPrice: 275.00, rating: 4.8, reviews: 124, brand: "Bosch Rexroth",
        inStock: true, specs: "4 inch bore, 12 inch stroke, Chrome rod",
        description: "Heavy-duty hydraulic cylinder for industrial machinery"
      }
    ]
  },

  "material-handling": {
    subcategories: [
      "Conveyors", "Hoists & Cranes", "Forklifts", "Trolleys",
      "Storage Solutions", "Packaging Equipment", "Lifting Equipment", "Pallets", "Containers", "Dollies"
    ],
    products: [
      {
        id: 1, name: "Heavy Duty Pallet Jack 5500lbs", subcategory: "Trolleys",
        price: 345.00, rating: 4.6, reviews: 167, brand: "Crown",
        inStock: true, specs: "5500 lbs capacity, 48\" fork length",
        description: "Professional pallet jack for warehouse operations"
      },
      {
        id: 2, name: "Chain Hoist 2 Ton", subcategory: "Hoists & Cranes",
        price: 189.99, originalPrice: 225.00, rating: 4.8, reviews: 95, brand: "CM Columbus McKinnon",
        inStock: true, specs: "2 ton capacity, 10 ft lift, Manual operation",
        description: "Reliable chain hoist for heavy lifting applications"
      }
    ]
  },

  measurement: {
    subcategories: [
      "Calipers", "Micrometers", "Gauges", "Meters", "Test Equipment",
      "Inspection Tools", "Levels", "Rulers", "Protractors", "Thermometers"
    ],
    products: [
      {
        id: 1, name: "Digital Caliper 6 inch", subcategory: "Calipers",
        price: 78.99, originalPrice: 95.00, rating: 4.9, reviews: 234, brand: "Mitutoyo",
        inStock: true, specs: "0.0005 inch resolution, Stainless steel",
        description: "Precision digital caliper for accurate measurements"
      },
      {
        id: 2, name: "Digital Multimeter True RMS", subcategory: "Test Equipment",
        price: 125.50, rating: 4.7, reviews: 156, brand: "Fluke",
        inStock: true, specs: "6000 count, True RMS, CAT III safety",
        description: "Professional digital multimeter for electrical testing"
      }
    ]
  },

  plumbing: {
    subcategories: [
      "Pipes & Fittings", "Valves", "Pumps", "Sealing", "Water Treatment",
      "Drainage", "Tools", "Fixtures", "Insulation", "Heating"
    ],
    products: [
      {
        id: 1, name: "Ball Valve 2 inch Stainless Steel", subcategory: "Valves",
        price: 85.99, rating: 4.8, reviews: 145, brand: "Milwaukee Valve",
        inStock: true, specs: "2 inch NPT, 316 SS, Full port",
        description: "Heavy-duty stainless steel ball valve for industrial use"
      },
      {
        id: 2, name: "Centrifugal Pump 1HP", subcategory: "Pumps",
        price: 295.00, originalPrice: 345.00, rating: 4.6, reviews: 87, brand: "Goulds",
        inStock: true, specs: "1 HP, 3450 RPM, Cast iron volute",
        description: "Self-priming centrifugal pump for water applications"
      }
    ]
  }
};

export const colorSchemes = {
  electrical: {
    primary: "bg-yellow-600 hover:bg-yellow-700",
    secondary: "bg-gradient-to-br from-yellow-100 to-orange-100",
    gradient: "bg-gradient-to-r from-yellow-50 to-orange-50",
    badge: "bg-yellow-100 text-yellow-800"
  },
  "hand-tools": {
    primary: "bg-blue-600 hover:bg-blue-700",
    secondary: "bg-gradient-to-br from-blue-100 to-cyan-100",
    gradient: "bg-gradient-to-r from-blue-50 to-cyan-50",
    badge: "bg-blue-100 text-blue-800"
  },
  hydraulics: {
    primary: "bg-purple-600 hover:bg-purple-700",
    secondary: "bg-gradient-to-br from-purple-100 to-indigo-100",
    gradient: "bg-gradient-to-r from-purple-50 to-indigo-50",
    badge: "bg-purple-100 text-purple-800"
  },
  "material-handling": {
    primary: "bg-green-600 hover:bg-green-700",
    secondary: "bg-gradient-to-br from-green-100 to-emerald-100",
    gradient: "bg-gradient-to-r from-green-50 to-emerald-50",
    badge: "bg-green-100 text-green-800"
  },
  measurement: {
    primary: "bg-red-600 hover:bg-red-700",
    secondary: "bg-gradient-to-br from-red-100 to-pink-100",
    gradient: "bg-gradient-to-r from-red-50 to-pink-50",
    badge: "bg-red-100 text-red-800"
  },
  plumbing: {
    primary: "bg-cyan-600 hover:bg-cyan-700",
    secondary: "bg-gradient-to-br from-cyan-100 to-blue-100",
    gradient: "bg-gradient-to-r from-cyan-50 to-blue-50",
    badge: "bg-cyan-100 text-cyan-800"
  }
};
