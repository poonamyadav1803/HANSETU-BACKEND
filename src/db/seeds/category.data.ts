/**
 * Category & Product Reference Data
 *
 * Source: migrated from GgiTracker's raw material category structure.
 * Categories represent industrial raw material types bought/sold on the platform.
 */
export const categoryData = {
  steel: {
    subcategories: [
      "Hot Rolled Steel", "Cold Rolled Steel", "Stainless Steel", "Galvanized Steel",
      "TMT Bars", "Structural Steel", "Tool Steel", "Alloy Steel", "Carbon Steel",
      "Mild Steel", "Steel Pipes & Tubes", "Steel Plates", "Steel Angles & Channels",
      "Cast Iron", "Pig Iron", "Spring Steel"
    ],
    products: [
      {
        id: 1, name: "TMT Bar Fe-500D 12mm – 1MT Bundle", subcategory: "TMT Bars",
        price: 58500, rating: 4.8, reviews: 312, brand: "SAIL",
        inStock: true, specs: "Fe-500D, 12mm dia, IS 1786, 1 MT bundle",
        description: "High-strength TMT bar for RCC construction and industrial structures"
      },
      {
        id: 2, name: "HR Steel Sheet 3mm – 2.5×1.25m", subcategory: "Hot Rolled Steel",
        price: 8200, rating: 4.7, reviews: 189, brand: "Tata Steel",
        inStock: true, specs: "3mm thick, Grade IS 2062 E250, 2500×1250 mm",
        description: "Standard HR steel sheet for fabrication and general engineering"
      },
      {
        id: 3, name: "SS 316L Sheet 2mm – 1×2m", subcategory: "Stainless Steel",
        price: 18500, rating: 4.9, reviews: 98, brand: "JSW Steel",
        inStock: true, specs: "316L grade, 2mm thick, No.4 finish",
        description: "Corrosion-resistant stainless steel sheet for food, pharma, and chemical industries"
      },
      {
        id: 4, name: "Mild Steel Round Bar 25mm – 6m", subcategory: "Mild Steel",
        price: 3400, rating: 4.6, reviews: 145, brand: "SAIL",
        inStock: true, specs: "25mm dia, IS 2062 Grade A, 6m length",
        description: "Standard mild steel round bar for machined components"
      }
    ]
  },

  aluminum: {
    subcategories: [
      "Aluminum Sheets", "Aluminum Coils", "Aluminum Extrusions", "Aluminum Foil",
      "Aluminum Ingots", "Aluminum Bars & Rods", "Aluminum Tubes", "Aluminum Profiles",
      "Aluminum Castings", "Aluminum Billets", "Aluminum Powder", "Aluminum Circles"
    ],
    products: [
      {
        id: 1, name: "Aluminum Sheet 2024-T3 – 2mm", subcategory: "Aluminum Sheets",
        price: 32000, rating: 4.8, reviews: 134, brand: "Hindalco",
        inStock: true, specs: "2024-T3, 2mm thick, 1000×2000 mm, aerospace grade",
        description: "Aerospace-grade aluminum alloy sheet for structural applications"
      },
      {
        id: 2, name: "Aluminum Extrusion Profile 6063-T6", subcategory: "Aluminum Extrusions",
        price: 185, rating: 4.7, reviews: 267, brand: "NALCO",
        inStock: true, specs: "6063-T6, 40×40mm angle, 6m length",
        description: "Architectural aluminum extrusion for frames, windows, and structures"
      },
      {
        id: 3, name: "Aluminum Ingot A356 – 5 kg", subcategory: "Aluminum Ingots",
        price: 870, rating: 4.6, reviews: 89, brand: "Vedanta",
        inStock: true, specs: "A356 alloy, 5 kg ingot, casting grade",
        description: "Die-casting grade aluminum ingot for automotive components"
      }
    ]
  },

  "copper-alloys": {
    subcategories: [
      "Copper Wire", "Copper Sheets & Strips", "Copper Tubes & Pipes",
      "Copper Cathodes", "Copper Rods & Bars", "Copper Coils",
      "Brass Rods & Sections", "Brass Sheets", "Bronze Bushings",
      "Phosphor Bronze", "Copper Powder", "Copper Ingots"
    ],
    products: [
      {
        id: 1, name: "Copper Bus Bar 25×3mm – 3m", subcategory: "Copper Rods & Bars",
        price: 4200, rating: 4.9, reviews: 201, brand: "Hindalco Birla Copper",
        inStock: true, specs: "ETP Copper, 25×3mm, 3m length, 99.9% purity",
        description: "High-conductivity copper bus bar for electrical panels and switchgear"
      },
      {
        id: 2, name: "Brass Rod CZ121 – 25mm dia", subcategory: "Brass Rods & Sections",
        price: 680, rating: 4.7, reviews: 156, brand: "Precision Metals",
        inStock: true, specs: "CZ121 free-cutting brass, 25mm dia, 3m length",
        description: "Free-cutting brass rod for turned components and fittings"
      }
    ]
  },

  "plastics-polymers": {
    subcategories: [
      "Polypropylene (PP)", "ABS Plastic", "PVC Compounds", "HDPE",
      "LDPE", "Polyurethane", "Nylon 6/66", "Polycarbonate",
      "Polyethylene", "PTFE / Teflon", "Acrylic Sheets", "PET / PETG",
      "Engineering Plastics", "Thermoplastic Granules", "Masterbatches", "Recycled Plastics"
    ],
    products: [
      {
        id: 1, name: "PP Granules Homopolymer – 25 kg", subcategory: "Polypropylene (PP)",
        price: 1850, rating: 4.7, reviews: 234, brand: "Reliance Industries",
        inStock: true, specs: "MFI 12 g/10min, Food-grade, 25 kg bag",
        description: "General-purpose polypropylene granules for injection moulding"
      },
      {
        id: 2, name: "HDPE Pipe Grade Granules – 25 kg", subcategory: "HDPE",
        price: 2100, rating: 4.8, reviews: 178, brand: "GAIL",
        inStock: true, specs: "PE 100, Black, 25 kg bag, pipe extrusion grade",
        description: "HDPE granules for water supply and gas distribution pipes"
      },
      {
        id: 3, name: "Nylon 66 Engineering Granules – 25 kg", subcategory: "Nylon 6/66",
        price: 4200, rating: 4.6, reviews: 89, brand: "Zytel",
        inStock: true, specs: "PA66, unfilled, 25 kg, injection grade",
        description: "High-performance nylon for gears, bearings, and structural components"
      }
    ]
  },

  chemicals: {
    subcategories: [
      "Industrial Chemicals", "Paints & Coatings", "Adhesives & Sealants",
      "Lubricants & Oils", "Solvents", "Acids (Sulfuric, HCl, Nitric)",
      "Alkalis (Caustic Soda, Soda Ash)", "Specialty Chemicals",
      "Petrochemicals", "Water Treatment Chemicals", "Textile Chemicals",
      "Construction Chemicals", "Dyes & Pigments", "Resins", "Catalysts",
      "Flame Retardants", "Plasticizers", "Surfactants", "Anti-corrosion Chemicals"
    ],
    products: [
      {
        id: 1, name: "Caustic Soda Flakes 98% – 50 kg", subcategory: "Alkalis (Caustic Soda, Soda Ash)",
        price: 1650, rating: 4.7, reviews: 145, brand: "Grasim Industries",
        inStock: true, specs: "NaOH 98%, white flakes, 50 kg HDPE bag",
        description: "Industrial caustic soda for chemical processing, textiles, and water treatment"
      },
      {
        id: 2, name: "Toluene Diisocyanate (TDI) 80/20 – 200 kg", subcategory: "Specialty Chemicals",
        price: 28500, rating: 4.6, reviews: 67, brand: "BASF India",
        inStock: false, specs: "TDI 80:20 isomer ratio, 200 kg drum, reagent grade",
        description: "Key raw material for polyurethane foam production"
      }
    ]
  },

  rubber: {
    subcategories: [
      "Natural Rubber", "Synthetic Rubber", "Rubber Sheets & Rolls",
      "EPDM Rubber", "Silicone Rubber", "Nitrile Rubber (NBR)",
      "Neoprene", "Butyl Rubber", "Reclaimed Rubber",
      "Rubber Gaskets", "Rubber Belts", "Rubber Hoses & Seals", "Foam Rubber"
    ],
    products: [
      {
        id: 1, name: "Natural Rubber RSS4 – 35 kg Block", subcategory: "Natural Rubber",
        price: 5600, rating: 4.8, reviews: 112, brand: "Kerala Rubber",
        inStock: true, specs: "RSS4 grade, 35 kg block, visually inspected",
        description: "Standard ribbed smoked sheet for tyre and industrial rubber products"
      },
      {
        id: 2, name: "EPDM Rubber Sheet 3mm – 1×1m", subcategory: "EPDM Rubber",
        price: 850, rating: 4.7, reviews: 89, brand: "Lanxess India",
        inStock: true, specs: "3mm thick, Shore A 60, -40°C to 130°C",
        description: "Weather-resistant EPDM sheet for seals, gaskets, and roofing"
      }
    ]
  },

  composites: {
    subcategories: [
      "Carbon Fiber (Woven, UD)", "Carbon Fiber Prepreg", "E-Glass Fiber",
      "S-Glass Fiber", "Basalt Fiber", "Aramid Fiber (Kevlar®)",
      "Fiberglass Reinforced Plastic (FRP)", "CFRP Sheets & Tubes",
      "Epoxy Matrix Resins", "Vinyl Ester Resins", "Polyester Resins",
      "Honeycomb Core (Aluminum, Nomex)", "Foam Core (PVC, PET, Balsa)",
      "Sandwich Panels", "Prepregs (Aerospace Grade)"
    ],
    products: [
      {
        id: 1, name: "Carbon Fiber Fabric 3K 2×2 Twill – 1m²", subcategory: "Carbon Fiber (Woven, UD)",
        price: 4800, rating: 4.9, reviews: 78, brand: "Toray",
        inStock: true, specs: "3K, 200 g/m², 2×2 twill weave, epoxy compatible",
        description: "Aerospace-grade carbon fiber fabric for structural composites"
      },
      {
        id: 2, name: "FRP Pultrusion Profile 50×50mm – 6m", subcategory: "Fiberglass Reinforced Plastic (FRP)",
        price: 1850, rating: 4.7, reviews: 134, brand: "Permali Composites",
        inStock: true, specs: "E-glass/polyester, 50×50mm square tube, 6m length",
        description: "Corrosion-resistant GRP structural profile for chemical and marine applications"
      }
    ]
  },

  textiles: {
    subcategories: [
      "Raw Cotton (Shankar-6)", "Cotton Yarn 40s Combed", "Cotton Yarn 20s Carded",
      "Polyester Staple Fiber", "Polyester Filament Yarn FDY", "Nylon 6 Yarn",
      "Spandex / Lycra", "Viscose Staple Fiber", "Acrylic Fiber",
      "Reactive Dyes", "Disperse Dyes", "Vat Dyes",
      "Textile Auxiliaries & Softeners", "Technical Yarns (Aramid, Carbon)",
      "Cotton Fabric (Grey / Processed)", "Polyester Fabric", "Denim"
    ],
    products: [
      {
        id: 1, name: "Cotton Yarn 40s Combed Ring Spun – 1 kg", subcategory: "Cotton Yarn 40s Combed",
        price: 285, rating: 4.8, reviews: 456, brand: "Vardhman",
        inStock: true, specs: "40s count, combed, ring spun, TPI 22, 1 kg cone",
        description: "Premium combed cotton yarn for high-quality fabric weaving"
      },
      {
        id: 2, name: "Polyester FDY 150D/48F – 5 kg cone", subcategory: "Polyester Filament Yarn FDY",
        price: 820, rating: 4.6, reviews: 289, brand: "Reliance Industries",
        inStock: true, specs: "150 denier, 48 filaments, FDY, bright, 5 kg cone",
        description: "Fully drawn polyester filament yarn for weaving and embroidery"
      }
    ]
  },

  "electronics-components": {
    subcategories: [
      "PCBs (Bare & Assembled)", "Semiconductors & ICs", "Connectors",
      "Capacitors", "Resistors", "Diodes & Transistors",
      "Microcontrollers & Microprocessors", "LEDs & Displays",
      "Sensors & Transducers", "Relays & Switches", "Transformers & Inductors",
      "Battery Cells & Packs", "Cables & Wires (Electronic)", "RF & Antenna Components"
    ],
    products: [
      {
        id: 1, name: "FR4 PCB Bare Board 150×100mm – 10 pcs", subcategory: "PCBs (Bare & Assembled)",
        price: 1200, rating: 4.8, reviews: 167, brand: "Kinwong",
        inStock: true, specs: "2-layer, 1.6mm, HASL, FR4, 10 pcs",
        description: "Standard double-layer PCB blank for electronics prototyping"
      },
      {
        id: 2, name: "STM32F103C8T6 Microcontroller – 5 pcs", subcategory: "Microcontrollers & Microprocessors",
        price: 580, rating: 4.9, reviews: 312, brand: "STMicroelectronics",
        inStock: true, specs: "ARM Cortex-M3, 72 MHz, 64KB Flash, LQFP48",
        description: "Popular 32-bit MCU for embedded systems and IoT devices"
      }
    ]
  },

  "construction-materials": {
    subcategories: [
      "Cement (OPC, PPC, PSC)", "Ready Mix Concrete",
      "Sand & Aggregates", "Bricks & AAC Blocks",
      "Ceramic & Vitrified Tiles", "PVC, HDPE & RCC Pipes",
      "Structural Steel & TMT", "Roofing Materials",
      "Waterproofing Materials", "Plywood & Laminates",
      "Fly Ash Bricks", "Gypsum Products", "Marble & Granite",
      "Bitumen & Asphalt", "Insulation Materials"
    ],
    products: [
      {
        id: 1, name: "OPC 53-Grade Cement – 50 kg bag", subcategory: "Cement (OPC, PPC, PSC)",
        price: 380, rating: 4.8, reviews: 890, brand: "UltraTech",
        inStock: true, specs: "OPC 53-grade, IS 12269, 50 kg paper bag",
        description: "High-strength Portland cement for concrete, masonry, and plaster"
      },
      {
        id: 2, name: "HDPE Water Supply Pipe 110mm – 6m", subcategory: "PVC, HDPE & RCC Pipes",
        price: 1850, rating: 4.7, reviews: 234, brand: "Supreme Industries",
        inStock: true, specs: "PE100, PN10, 110mm OD, IS 4984, 6m length",
        description: "HDPE pressure pipe for potable water and irrigation"
      }
    ]
  },

  pharmaceutical: {
    subcategories: [
      "Active Pharmaceutical Ingredients (APIs)", "Bulk Drug Intermediates",
      "Excipients (Binders, Fillers, Disintegrants)", "Microcrystalline Cellulose (MCC)",
      "Lactose Pharmaceutical Grade", "Magnesium Stearate",
      "Gelatin (Pharmaceutical)", "HPMC / HPC / CMC",
      "Pharmaceutical Solvents (Ethanol, IPA)", "Capsule Shells",
      "Nutraceutical Ingredients", "Herbal Extracts & Botanicals",
      "Vitamins & Minerals (Bulk)", "Amino Acids", "Enzyme Preparations"
    ],
    products: [
      {
        id: 1, name: "Microcrystalline Cellulose PH-101 – 25 kg", subcategory: "Microcrystalline Cellulose (MCC)",
        price: 5800, rating: 4.9, reviews: 67, brand: "JRS Pharma",
        inStock: true, specs: "PH-101, NF/BP/EP grade, 25 kg polylined bag",
        description: "Standard binder and filler for tablet direct compression"
      },
      {
        id: 2, name: "Magnesium Stearate Ph. Grade – 25 kg", subcategory: "Magnesium Stearate",
        price: 3200, rating: 4.8, reviews: 89, brand: "Peter Greven",
        inStock: true, specs: "Hydrodynamic grade, IP/BP/NF, 25 kg bag",
        description: "Tablet lubricant for solid dosage manufacturing"
      }
    ]
  },

  minerals: {
    subcategories: [
      "Iron Ore", "Coal (Coking & Thermal)", "Limestone",
      "Silica Sand", "Bauxite", "Manganese Ore",
      "Chromite", "Gypsum", "Mica",
      "Talc", "Kaolin / China Clay", "Bentonite",
      "Feldspar", "Dolomite", "Graphite", "Quartz"
    ],
    products: [
      {
        id: 1, name: "Silica Quartz Powder 200 Mesh – 50 kg", subcategory: "Silica Sand",
        price: 480, rating: 4.7, reviews: 167, brand: "Gujarat Mineral",
        inStock: true, specs: "SiO₂ >99%, 200 mesh, 50 kg woven bag",
        description: "High-purity silica powder for glass, ceramics, and foundry use"
      },
      {
        id: 2, name: "Bentonite Powder (Drilling Grade) – 50 kg", subcategory: "Bentonite",
        price: 320, rating: 4.6, reviews: 123, brand: "AMCOL India",
        inStock: true, specs: "API 13A Grade, 50 kg bag, swelling index >24",
        description: "Drilling-grade bentonite for oil & gas and geotechnical applications"
      }
    ]
  }
};

export const colorSchemes = {
  steel: {
    primary: "bg-slate-600 hover:bg-slate-700",
    secondary: "bg-gradient-to-br from-slate-100 to-gray-100",
    gradient: "bg-gradient-to-r from-slate-50 to-gray-50",
    badge: "bg-slate-100 text-slate-800"
  },
  aluminum: {
    primary: "bg-blue-500 hover:bg-blue-600",
    secondary: "bg-gradient-to-br from-blue-100 to-sky-100",
    gradient: "bg-gradient-to-r from-blue-50 to-sky-50",
    badge: "bg-blue-100 text-blue-800"
  },
  "copper-alloys": {
    primary: "bg-orange-600 hover:bg-orange-700",
    secondary: "bg-gradient-to-br from-orange-100 to-amber-100",
    gradient: "bg-gradient-to-r from-orange-50 to-amber-50",
    badge: "bg-orange-100 text-orange-800"
  },
  "plastics-polymers": {
    primary: "bg-purple-600 hover:bg-purple-700",
    secondary: "bg-gradient-to-br from-purple-100 to-violet-100",
    gradient: "bg-gradient-to-r from-purple-50 to-violet-50",
    badge: "bg-purple-100 text-purple-800"
  },
  chemicals: {
    primary: "bg-teal-600 hover:bg-teal-700",
    secondary: "bg-gradient-to-br from-teal-100 to-cyan-100",
    gradient: "bg-gradient-to-r from-teal-50 to-cyan-50",
    badge: "bg-teal-100 text-teal-800"
  },
  rubber: {
    primary: "bg-zinc-700 hover:bg-zinc-800",
    secondary: "bg-gradient-to-br from-zinc-100 to-stone-100",
    gradient: "bg-gradient-to-r from-zinc-50 to-stone-50",
    badge: "bg-zinc-100 text-zinc-800"
  },
  composites: {
    primary: "bg-indigo-600 hover:bg-indigo-700",
    secondary: "bg-gradient-to-br from-indigo-100 to-blue-100",
    gradient: "bg-gradient-to-r from-indigo-50 to-blue-50",
    badge: "bg-indigo-100 text-indigo-800"
  },
  textiles: {
    primary: "bg-pink-600 hover:bg-pink-700",
    secondary: "bg-gradient-to-br from-pink-100 to-rose-100",
    gradient: "bg-gradient-to-r from-pink-50 to-rose-50",
    badge: "bg-pink-100 text-pink-800"
  },
  "electronics-components": {
    primary: "bg-cyan-600 hover:bg-cyan-700",
    secondary: "bg-gradient-to-br from-cyan-100 to-blue-100",
    gradient: "bg-gradient-to-r from-cyan-50 to-blue-50",
    badge: "bg-cyan-100 text-cyan-800"
  },
  "construction-materials": {
    primary: "bg-amber-600 hover:bg-amber-700",
    secondary: "bg-gradient-to-br from-amber-100 to-yellow-100",
    gradient: "bg-gradient-to-r from-amber-50 to-yellow-50",
    badge: "bg-amber-100 text-amber-800"
  },
  pharmaceutical: {
    primary: "bg-emerald-600 hover:bg-emerald-700",
    secondary: "bg-gradient-to-br from-emerald-100 to-green-100",
    gradient: "bg-gradient-to-r from-emerald-50 to-green-50",
    badge: "bg-emerald-100 text-emerald-800"
  },
  minerals: {
    primary: "bg-brown-600 hover:bg-yellow-700",
    secondary: "bg-gradient-to-br from-yellow-100 to-amber-100",
    gradient: "bg-gradient-to-r from-yellow-50 to-amber-50",
    badge: "bg-yellow-100 text-yellow-800"
  }
};
