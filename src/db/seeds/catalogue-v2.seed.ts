/**
 * Catalogue V2 seed — industries, categories, subcategories, products, nav.
 * Safe to re-run: uses ON CONFLICT DO NOTHING (upsert-safe).
 *
 * Run with: npx ts-node src/db/seeds/catalogue-v2.seed.ts
 */

import { pool } from "../index";

// ──────────────────────────────────────────────────────────────────────────────
// Industries
// ──────────────────────────────────────────────────────────────────────────────
const INDUSTRIES = [
  { slug: "automobile",    name: "Automobile",        icon: "directions_car" },
  { slug: "aerospace",     name: "Aerospace",          icon: "flight" },
  { slug: "chemical",      name: "Chemical",           icon: "science" },
  { slug: "construction",  name: "Construction",       icon: "construction" },
  { slug: "defence",       name: "Defence / Military", icon: "security" },
  { slug: "electronics",   name: "Electronics",        icon: "memory" },
  { slug: "energy",        name: "Energy",             icon: "electric_bolt" },
  { slug: "healthcare",    name: "Healthcare",         icon: "healing" },
  { slug: "medical",       name: "Medical",            icon: "medical_services" },
  { slug: "pharma",        name: "Pharma",             icon: "medication" },
  { slug: "polymers",      name: "Polymers",           icon: "bubble_chart" },
  { slug: "textile",       name: "Textile",            icon: "dry_cleaning" },
];

// ──────────────────────────────────────────────────────────────────────────────
// Categories per industry
// ──────────────────────────────────────────────────────────────────────────────
const CATEGORIES: Array<{
  industrySlug: string;
  slug: string;
  name: string;
  description?: string;
  subcategories: string[];
}> = [
  {
    industrySlug: "automobile",
    slug: "auto-steel-alloys",
    name: "Steel & Alloys",
    description: "High-performance steel and alloys for automotive applications",
    subcategories: ["High-Strength Steel", "Stainless Steel", "Tool Steel", "Carbon Steel", "Spring Steel"],
  },
  {
    industrySlug: "automobile",
    slug: "auto-aluminum",
    name: "Aluminum",
    description: "Lightweight aluminum materials for automotive body and engine components",
    subcategories: ["Aluminum Sheets", "Extrusions", "Castings", "Forgings"],
  },
  {
    industrySlug: "automobile",
    slug: "auto-polymers",
    name: "Plastics & Polymers",
    description: "Engineering plastics for automotive interiors and exteriors",
    subcategories: ["ABS", "Polypropylene", "Nylon PA66", "PVC", "PEEK"],
  },
  {
    industrySlug: "aerospace",
    slug: "aero-titanium",
    name: "Titanium Alloys",
    description: "Aerospace-grade titanium alloys for structural and engine components",
    subcategories: ["Ti-6Al-4V", "Grade 2 CP Titanium", "Ti-6Al-2Sn-4Zr"],
  },
  {
    industrySlug: "aerospace",
    slug: "aero-composites",
    name: "Composites",
    description: "Carbon fiber and composite materials for aerospace structures",
    subcategories: ["CFRP Sheets", "Fiberglass Cloth", "Honeycomb Panels", "Prepreg Tapes"],
  },
  {
    industrySlug: "electronics",
    slug: "elec-copper",
    name: "Copper & Conductors",
    description: "High-purity copper and conductor materials for electronics",
    subcategories: ["Oxygen-Free Copper", "Copper Foil", "Copper Clad Laminate", "Bus Bars"],
  },
  {
    industrySlug: "electronics",
    slug: "elec-semiconductors",
    name: "Semiconductor Materials",
    description: "Substrates and substrates for semiconductor manufacturing",
    subcategories: ["Silicon Wafers", "GaAs Substrates", "Sputtering Targets", "Photoresists"],
  },
  {
    industrySlug: "healthcare",
    slug: "health-surgical-steel",
    name: "Surgical Steel",
    description: "Medical-grade stainless steel for instruments and implants",
    subcategories: ["316L Stainless Steel", "17-4 PH Steel", "Grade 5 Titanium"],
  },
  {
    industrySlug: "pharma",
    slug: "pharma-excipients",
    name: "Excipients & Intermediates",
    description: "Pharmaceutical-grade excipients and API intermediates",
    subcategories: ["MCC", "Lactose Monohydrate", "HPMC", "API Intermediates"],
  },
  {
    industrySlug: "polymers",
    slug: "poly-engineering",
    name: "Engineering Plastics",
    description: "High-performance engineering polymers for industrial use",
    subcategories: ["PEEK", "PPS", "Ultem PEI", "Delrin POM", "Nylon PA12"],
  },
  {
    industrySlug: "construction",
    slug: "const-structural-steel",
    name: "Structural Steel",
    description: "Heavy structural steel sections and plates",
    subcategories: ["I-Beams", "H-Beams", "Angles", "MS Plates", "Channels"],
  },
  {
    industrySlug: "construction",
    slug: "const-cement-aggregates",
    name: "Cement & Aggregates",
    description: "Construction-grade cement, sand, and aggregate materials",
    subcategories: ["OPC Cement", "PPC Cement", "Crushed Stone", "River Sand"],
  },
  {
    industrySlug: "defence",
    slug: "def-armour-steel",
    name: "Armour Steel",
    description: "High-hardness ballistic protection steel",
    subcategories: ["ARMOX 500T", "RHA Steel", "HARDOX 400", "Ballistic Plates"],
  },
  {
    industrySlug: "textile",
    slug: "text-natural-fibres",
    name: "Natural Fibres",
    description: "Premium natural textile raw materials",
    subcategories: ["Long-Staple Cotton", "Merino Wool", "Raw Silk", "Jute Fibre"],
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Products
// ──────────────────────────────────────────────────────────────────────────────
// (industrySlug, categorySlug, subcategoryName are resolved to IDs at seed time)
type ProductSeed = {
  industrySlug: string;
  categorySlug: string;
  subcategoryName: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  materialType: string;
  grade: string;
  specifications: Record<string, string>;
  moq: number;
  leadTime: string;
  price: string;
  originalPrice?: string;
  brand: string;
  samplesAvailable: boolean;
  inStock: boolean;
  rating: string;
  reviews: number;
};

const PRODUCTS: ProductSeed[] = [
  // ── Automobile: Steel ────────────────────────────────────────────────────────
  {
    industrySlug: "automobile",
    categorySlug: "auto-steel-alloys",
    subcategoryName: "High-Strength Steel",
    name: "DP780 High-Strength Dual Phase Steel Sheet",
    description: "Advanced dual-phase high-strength steel ideal for automotive chassis and structural reinforcements. Excellent formability with superior crash performance.",
    thumbnailUrl: "https://placehold.co/400x300?text=DP780+Steel",
    materialType: "Ferrous Metal",
    grade: "DP780",
    specifications: {
      "Tensile Strength": "780–950 MPa",
      "Yield Strength": "440–550 MPa",
      "Elongation": "≥14%",
      "Thickness": "0.7–3.0 mm",
      "Width": "Up to 1830 mm",
      "Surface Finish": "Cold Rolled",
    },
    moq: 5000,
    leadTime: "10–14 days",
    price: "82.50",
    originalPrice: "95.00",
    brand: "Tata Steel",
    samplesAvailable: true,
    inStock: true,
    rating: "4.6",
    reviews: 134,
  },
  {
    industrySlug: "automobile",
    categorySlug: "auto-steel-alloys",
    subcategoryName: "Stainless Steel",
    name: "SS 316L Automotive Exhaust Tubing",
    description: "Grade 316L stainless steel seamless tubes specifically designed for automotive exhaust systems. High corrosion resistance and excellent heat tolerance.",
    thumbnailUrl: "https://placehold.co/400x300?text=SS316L+Tubing",
    materialType: "Ferrous Metal",
    grade: "316L",
    specifications: {
      "Wall Thickness": "1.5–3.0 mm",
      "OD Range": "25–100 mm",
      "Max Temperature": "870°C continuous",
      "Surface": "2B / Polished",
      "Standard": "ASTM A269",
    },
    moq: 500,
    leadTime: "7–10 days",
    price: "285.00",
    originalPrice: "310.00",
    brand: "Jindal Stainless",
    samplesAvailable: false,
    inStock: true,
    rating: "4.4",
    reviews: 89,
  },
  // ── Automobile: Aluminum ─────────────────────────────────────────────────────
  {
    industrySlug: "automobile",
    categorySlug: "auto-aluminum",
    subcategoryName: "Aluminum Sheets",
    name: "6061-T6 Automotive Aluminium Sheet",
    description: "Heat-treatable aluminium alloy sheet for automotive body panels and structural parts. Excellent machinability and weldability with strong corrosion resistance.",
    thumbnailUrl: "https://placehold.co/400x300?text=6061-T6+Sheet",
    materialType: "Non-Ferrous Metal",
    grade: "6061-T6",
    specifications: {
      "Tensile Strength": "310 MPa",
      "Yield Strength": "276 MPa",
      "Elongation": "12%",
      "Thickness": "0.5–6.0 mm",
      "Temper": "T6",
      "Standard": "ASTM B209",
    },
    moq: 100,
    leadTime: "5–7 days",
    price: "195.00",
    brand: "Hindalco",
    samplesAvailable: true,
    inStock: true,
    rating: "4.7",
    reviews: 211,
  },
  {
    industrySlug: "automobile",
    categorySlug: "auto-aluminum",
    subcategoryName: "Castings",
    name: "A380 Die-Cast Aluminium Alloy",
    description: "Industry-standard die casting alloy offering excellent pressure tightness, good mechanical properties, and broad industrial use in engine housings and brackets.",
    thumbnailUrl: "https://placehold.co/400x300?text=A380+Die+Cast",
    materialType: "Non-Ferrous Metal",
    grade: "A380",
    specifications: {
      "Ultimate Tensile Strength": "324 MPa",
      "Yield Strength": "159 MPa",
      "Hardness": "80 HB",
      "Elongation": "3.5%",
      "Density": "2.71 g/cm³",
    },
    moq: 250,
    leadTime: "3–5 days",
    price: "162.00",
    originalPrice: "180.00",
    brand: "National Aluminium Co.",
    samplesAvailable: true,
    inStock: true,
    rating: "4.3",
    reviews: 57,
  },
  // ── Automobile: Polymers ─────────────────────────────────────────────────────
  {
    industrySlug: "automobile",
    categorySlug: "auto-polymers",
    subcategoryName: "ABS",
    name: "Automotive Grade ABS Compound",
    description: "Heat-stabilised ABS compound formulated for exterior automotive trims, dashboards, and grilles. UV-stabilised for outdoor durability.",
    thumbnailUrl: "https://placehold.co/400x300?text=Auto+ABS",
    materialType: "Polymer",
    grade: "ABS Grade A",
    specifications: {
      "MFI (220°C/10kg)": "8–12 g/10min",
      "Tensile Strength": "42 MPa",
      "Izod Impact": "250 J/m",
      "HDT (1.82 MPa)": "85°C",
      "UV Resistance": "Yes",
      "Form": "Pellets",
    },
    moq: 500,
    leadTime: "5–8 days",
    price: "118.00",
    brand: "LANXESS",
    samplesAvailable: true,
    inStock: true,
    rating: "4.5",
    reviews: 76,
  },
  // ── Aerospace: Titanium ──────────────────────────────────────────────────────
  {
    industrySlug: "aerospace",
    categorySlug: "aero-titanium",
    subcategoryName: "Ti-6Al-4V",
    name: "Ti-6Al-4V Grade 5 Aerospace Bar Stock",
    description: "The workhorse titanium alloy for aerospace structural parts. Excellent strength-to-weight ratio, high fracture toughness, and good fatigue resistance.",
    thumbnailUrl: "https://placehold.co/400x300?text=Ti-6Al-4V+Bar",
    materialType: "Non-Ferrous Metal",
    grade: "Ti-6Al-4V (Grade 5)",
    specifications: {
      "Ultimate Tensile Strength": "950 MPa",
      "Yield Strength": "880 MPa",
      "Elongation": "14%",
      "Density": "4.43 g/cm³",
      "Max Operating Temp": "315°C",
      "Standard": "AMS 4928",
      "Diameter Range": "10–200 mm",
    },
    moq: 10,
    leadTime: "14–21 days",
    price: "4800.00",
    originalPrice: "5200.00",
    brand: "TIMET",
    samplesAvailable: false,
    inStock: true,
    rating: "4.9",
    reviews: 43,
  },
  {
    industrySlug: "aerospace",
    categorySlug: "aero-titanium",
    subcategoryName: "Grade 2 CP Titanium",
    name: "CP Grade 2 Titanium Seamless Tube",
    description: "Commercially pure Grade 2 titanium tube with excellent corrosion resistance for hydraulic systems, fuel lines, and chemical processing in aerospace.",
    thumbnailUrl: "https://placehold.co/400x300?text=CP-Ti+Tube",
    materialType: "Non-Ferrous Metal",
    grade: "CP Grade 2",
    specifications: {
      "OD Range": "6–100 mm",
      "Wall Thickness": "0.5–5 mm",
      "Tensile Strength": "345 MPa min",
      "Yield Strength": "275 MPa min",
      "Standard": "ASTM B338",
    },
    moq: 20,
    leadTime: "10–14 days",
    price: "3250.00",
    brand: "ATI Metals",
    samplesAvailable: false,
    inStock: false,
    rating: "4.7",
    reviews: 28,
  },
  // ── Aerospace: Composites ─────────────────────────────────────────────────────
  {
    industrySlug: "aerospace",
    categorySlug: "aero-composites",
    subcategoryName: "CFRP Sheets",
    name: "12K Carbon Fibre Twill 2x2 Prepreg Sheet",
    description: "Aerospace-grade 12K carbon fibre twill prepreg with epoxy resin system. Ready-to-autoclave composite sheet for lightweight structural applications.",
    thumbnailUrl: "https://placehold.co/400x300?text=CFRP+Prepreg",
    materialType: "Composite",
    grade: "Aerospace Grade (AS4/3501-6)",
    specifications: {
      "Fibre": "Toray T700 12K",
      "Weave": "2×2 Twill",
      "Resin Content": "38±2%",
      "Ply Thickness": "0.22 mm",
      "Tensile Modulus": "230 GPa",
      "Storage": "-18°C",
    },
    moq: 5,
    leadTime: "7–10 days",
    price: "1850.00",
    originalPrice: "2100.00",
    brand: "Hexcel",
    samplesAvailable: true,
    inStock: true,
    rating: "4.8",
    reviews: 61,
  },
  // ── Electronics: Copper ─────────────────────────────────────────────────────
  {
    industrySlug: "electronics",
    categorySlug: "elec-copper",
    subcategoryName: "Oxygen-Free Copper",
    name: "OFC 99.99% Oxygen-Free Copper Rod",
    description: "Electrolytic tough-pitch free copper rod for electrical conductors, PCB manufacturing, and precision electronics where ultra-low oxygen content is critical.",
    thumbnailUrl: "https://placehold.co/400x300?text=OFC+Copper+Rod",
    materialType: "Non-Ferrous Metal",
    grade: "C10200 OFC",
    specifications: {
      "Purity": "99.99% Cu",
      "Oxygen Content": "<0.0005%",
      "Diameter Range": "3–50 mm",
      "Conductivity": "101% IACS",
      "Standard": "ASTM B187",
    },
    moq: 50,
    leadTime: "3–5 days",
    price: "710.00",
    brand: "Hindalco",
    samplesAvailable: false,
    inStock: true,
    rating: "4.5",
    reviews: 98,
  },
  {
    industrySlug: "electronics",
    categorySlug: "elec-copper",
    subcategoryName: "Copper Foil",
    name: "Electrodeposited Copper Foil 18µm",
    description: "18-micron electrodeposited copper foil for multilayer PCB inner layers. Exceptional surface roughness and consistent grain structure for fine-line circuitry.",
    thumbnailUrl: "https://placehold.co/400x300?text=ED+Copper+Foil",
    materialType: "Non-Ferrous Metal",
    grade: "ED-Grade HTE",
    specifications: {
      "Thickness": "18 µm",
      "Width": "305 mm / 610 mm",
      "Tensile Strength": "≥28 kgf/mm²",
      "Elongation": "≥3%",
      "Surface Treatment": "VLP (Very Low Profile)",
    },
    moq: 100,
    leadTime: "5–7 days",
    price: "4200.00",
    originalPrice: "4600.00",
    brand: "Mitsui Mining",
    samplesAvailable: true,
    inStock: true,
    rating: "4.6",
    reviews: 44,
  },
  // ── Electronics: Semiconductors ──────────────────────────────────────────────
  {
    industrySlug: "electronics",
    categorySlug: "elec-semiconductors",
    subcategoryName: "Silicon Wafers",
    name: "8-inch P-type Silicon Wafer (Boron doped)",
    description: "200mm diameter prime grade silicon wafer for CMOS IC fabrication. Boron-doped P-type with tight resistivity specification and mirror-polished surface.",
    thumbnailUrl: "https://placehold.co/400x300?text=Si+Wafer+8in",
    materialType: "Semiconductor",
    grade: "Prime Grade P-type",
    specifications: {
      "Diameter": "200 mm (8 inch)",
      "Resistivity": "5–10 Ω·cm",
      "Dopant": "Boron",
      "Orientation": "<100>",
      "Thickness": "725±10 µm",
      "TTV": "<1 µm",
      "Surface": "SSP Mirror",
    },
    moq: 25,
    leadTime: "7–10 days",
    price: "12500.00",
    brand: "Siltronic",
    samplesAvailable: false,
    inStock: true,
    rating: "4.9",
    reviews: 17,
  },
  // ── Healthcare: Surgical Steel ───────────────────────────────────────────────
  {
    industrySlug: "healthcare",
    categorySlug: "health-surgical-steel",
    subcategoryName: "316L Stainless Steel",
    name: "Medical-Grade 316L SS Flat Bar",
    description: "ISO 5832-1 compliant 316L stainless steel flat bars for surgical instrument manufacturing. Low carbon content prevents carbide precipitation during welding.",
    thumbnailUrl: "https://placehold.co/400x300?text=Medical+316L",
    materialType: "Ferrous Metal",
    grade: "316L Medical",
    specifications: {
      "Carbon": "≤0.03%",
      "Chromium": "16–18%",
      "Nickel": "10–14%",
      "Molybdenum": "2–3%",
      "Tensile Strength": "485 MPa min",
      "Certification": "ISO 5832-1, ASTM F138",
    },
    moq: 50,
    leadTime: "7–10 days",
    price: "380.00",
    originalPrice: "420.00",
    brand: "Carpenter Technology",
    samplesAvailable: true,
    inStock: true,
    rating: "4.7",
    reviews: 82,
  },
  {
    industrySlug: "healthcare",
    categorySlug: "health-surgical-steel",
    subcategoryName: "Grade 5 Titanium",
    name: "Ti-6Al-4V ELI Medical Grade Titanium Rod",
    description: "Extra-Low Interstitials titanium alloy for orthopaedic implants and surgical instruments. Higher fracture toughness vs standard Grade 5 with full implant-grade certification.",
    thumbnailUrl: "https://placehold.co/400x300?text=Ti+ELI+Rod",
    materialType: "Non-Ferrous Metal",
    grade: "Ti-6Al-4V ELI (Grade 23)",
    specifications: {
      "Oxygen": "≤0.13%",
      "Tensile Strength": "860 MPa",
      "Yield Strength": "795 MPa",
      "Elongation": "15%",
      "Standard": "ASTM F136",
      "Diameter": "5–120 mm",
    },
    moq: 5,
    leadTime: "14–21 days",
    price: "5600.00",
    brand: "Howmet Aerospace",
    samplesAvailable: false,
    inStock: true,
    rating: "4.9",
    reviews: 29,
  },
  // ── Pharma: Excipients ───────────────────────────────────────────────────────
  {
    industrySlug: "pharma",
    categorySlug: "pharma-excipients",
    subcategoryName: "MCC",
    name: "Microcrystalline Cellulose PH-101",
    description: "Highly pure pharmaceutical-grade MCC for direct compression tableting. Excellent compressibility, low moisture content, and consistent particle size distribution.",
    thumbnailUrl: "https://placehold.co/400x300?text=MCC+PH101",
    materialType: "Excipient",
    grade: "PH-101 (Pharma Grade)",
    specifications: {
      "Particle Size (D50)": "50 µm",
      "Loss on Drying": "≤5.0%",
      "pH": "5.0–7.5",
      "Ash": "≤0.1%",
      "Standard": "USP/NF, EP",
    },
    moq: 50,
    leadTime: "3–5 days",
    price: "95.00",
    brand: "Sigachi",
    samplesAvailable: true,
    inStock: true,
    rating: "4.6",
    reviews: 115,
  },
  {
    industrySlug: "pharma",
    categorySlug: "pharma-excipients",
    subcategoryName: "HPMC",
    name: "Hydroxypropyl Methylcellulose K100M",
    description: "Pharma-grade HPMC for sustained-release matrix tablets. High viscosity grade providing robust drug release control over 8–12 hours.",
    thumbnailUrl: "https://placehold.co/400x300?text=HPMC+K100M",
    materialType: "Excipient",
    grade: "K100M Pharma",
    specifications: {
      "Viscosity (2% w/w, 20°C)": "80,000–120,000 mPa·s",
      "Methoxyl": "19–24%",
      "Hydroxypropoxyl": "7–12%",
      "Loss on Drying": "≤5.0%",
      "Standard": "USP/NF, EP, JP",
    },
    moq: 25,
    leadTime: "5–7 days",
    price: "420.00",
    originalPrice: "480.00",
    brand: "Colorcon",
    samplesAvailable: true,
    inStock: true,
    rating: "4.8",
    reviews: 67,
  },
  // ── Polymers: Engineering ─────────────────────────────────────────────────────
  {
    industrySlug: "polymers",
    categorySlug: "poly-engineering",
    subcategoryName: "PEEK",
    name: "Victrex PEEK 450G Resin Pellets",
    description: "Semi-crystalline PEEK grade for high-performance structural parts at extreme temperatures. Exceptional chemical resistance, wear performance, and self-lubrication.",
    thumbnailUrl: "https://placehold.co/400x300?text=PEEK+450G",
    materialType: "High-Performance Polymer",
    grade: "PEEK 450G",
    specifications: {
      "MFI (380°C/2.16kg)": "3–5 g/10min",
      "Tensile Strength": "100 MPa",
      "Flexural Modulus": "3.7 GPa",
      "HDT (1.82 MPa)": "152°C",
      "Continuous Use Temp": "250°C",
      "Form": "Pellets",
    },
    moq: 10,
    leadTime: "7–10 days",
    price: "9800.00",
    originalPrice: "10500.00",
    brand: "Victrex",
    samplesAvailable: true,
    inStock: true,
    rating: "4.9",
    reviews: 38,
  },
  {
    industrySlug: "polymers",
    categorySlug: "poly-engineering",
    subcategoryName: "Delrin POM",
    name: "Acetal (POM-H) Homopolymer Natural Rod",
    description: "DuPont Delrin acetal homopolymer rod for precision machined gears, bearings, bushings, and valve components. Superior fatigue endurance and low friction.",
    thumbnailUrl: "https://placehold.co/400x300?text=POM+Rod",
    materialType: "Engineering Polymer",
    grade: "POM-H (Delrin 150 NC)",
    specifications: {
      "Tensile Strength": "70 MPa",
      "Elongation at Break": "25%",
      "Rockwell Hardness": "M90",
      "Coefficient of Friction": "0.2",
      "Water Absorption": "0.2%",
      "Diameter": "10–200 mm",
    },
    moq: 5,
    leadTime: "3–5 days",
    price: "650.00",
    brand: "DuPont",
    samplesAvailable: true,
    inStock: true,
    rating: "4.5",
    reviews: 93,
  },
  // ── Construction: Structural Steel ───────────────────────────────────────────
  {
    industrySlug: "construction",
    categorySlug: "const-structural-steel",
    subcategoryName: "I-Beams",
    name: "ISMB 200 Mild Steel I-Beam",
    description: "Indian Standard Medium Weight Beam for structural steel construction. Hot-rolled mild steel with consistent cross-section and guaranteed mechanical properties.",
    thumbnailUrl: "https://placehold.co/400x300?text=ISMB+200+Beam",
    materialType: "Ferrous Metal",
    grade: "IS 2062 E250",
    specifications: {
      "Section": "ISMB 200",
      "Web Height": "200 mm",
      "Flange Width": "100 mm",
      "Weight per Meter": "25.4 kg/m",
      "Tensile Strength": "410–530 MPa",
      "Yield Strength": "≥250 MPa",
    },
    moq: 1000,
    leadTime: "2–3 days",
    price: "58.00",
    brand: "SAIL",
    samplesAvailable: false,
    inStock: true,
    rating: "4.3",
    reviews: 187,
  },
  // ── Defence: Armour Steel ─────────────────────────────────────────────────────
  {
    industrySlug: "defence",
    categorySlug: "def-armour-steel",
    subcategoryName: "ARMOX 500T",
    name: "SSAB ARMOX 500T Ballistic Protection Steel Plate",
    description: "High-hardness armour steel plate for military vehicle protection, shelters, and blast containment. Certified to STANAG 4569 ballistic protection levels.",
    thumbnailUrl: "https://placehold.co/400x300?text=ARMOX+500T",
    materialType: "Armour Steel",
    grade: "ARMOX 500T",
    specifications: {
      "Hardness": "480–540 HBW",
      "Tensile Strength": "≥1550 MPa",
      "Thickness Range": "4–80 mm",
      "Charpy Impact (−40°C)": "≥25 J",
      "Standard": "MIL-DTL-46100",
      "STANAG": "4569 Level 2",
    },
    moq: 5,
    leadTime: "21–28 days",
    price: "185.00",
    originalPrice: "210.00",
    brand: "SSAB",
    samplesAvailable: false,
    inStock: true,
    rating: "4.8",
    reviews: 12,
  },
  // ── Textile: Natural Fibres ───────────────────────────────────────────────────
  {
    industrySlug: "textile",
    categorySlug: "text-natural-fibres",
    subcategoryName: "Long-Staple Cotton",
    name: "Egyptian Extra-Long Staple Cotton (ELS)",
    description: "Premium Egyptian Giza 86 long-staple cotton fibre for luxury shirting and fine yarn. Superior lustre, strength, and uniformity for premium textile applications.",
    thumbnailUrl: "https://placehold.co/400x300?text=ELS+Cotton",
    materialType: "Natural Fibre",
    grade: "ELS Giza 86",
    specifications: {
      "Staple Length": "≥36 mm",
      "Mic Value": "3.5–4.0",
      "Strength": "≥32 g/tex",
      "Uniformity Index": "≥85%",
      "Trash Content": "≤0.5%",
    },
    moq: 500,
    leadTime: "7–14 days",
    price: "220.00",
    originalPrice: "250.00",
    brand: "Egypt Cotton",
    samplesAvailable: true,
    inStock: true,
    rating: "4.7",
    reviews: 54,
  },
  {
    industrySlug: "textile",
    categorySlug: "text-natural-fibres",
    subcategoryName: "Merino Wool",
    name: "19.5-Micron Australian Merino Wool Top",
    description: "Ultra-fine Australian Merino wool top for luxury knitwear and suiting fabrics. Low prickle factor with exceptional softness and natural moisture management.",
    thumbnailUrl: "https://placehold.co/400x300?text=Merino+Wool",
    materialType: "Natural Fibre",
    grade: "Fine Merino 19.5µm",
    specifications: {
      "Fibre Diameter": "19.5 µm",
      "CVD": "≤22%",
      "Vegetable Matter": "≤0.3%",
      "Staple Strength": "≥35 N/ktex",
      "Comfort Factor": "≥99%",
    },
    moq: 100,
    leadTime: "10–14 days",
    price: "1850.00",
    brand: "AWI",
    samplesAvailable: true,
    inStock: true,
    rating: "4.8",
    reviews: 31,
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Nav raw material categories
// ──────────────────────────────────────────────────────────────────────────────
const NAV_ITEMS: Array<{ industrySlug: string; label: string; slug: string; icon: string; sortOrder: number }> = [
  { industrySlug: "automobile",   label: "Steel & Alloys",           slug: "steel-alloys",          icon: "hardware",      sortOrder: 1 },
  { industrySlug: "automobile",   label: "Aluminium",                slug: "aluminium",              icon: "view_in_ar",    sortOrder: 2 },
  { industrySlug: "automobile",   label: "Automotive Plastics",      slug: "automotive-plastics",    icon: "category",      sortOrder: 3 },
  { industrySlug: "aerospace",    label: "Titanium Alloys",          slug: "titanium-alloys",        icon: "rocket",        sortOrder: 4 },
  { industrySlug: "aerospace",    label: "Aerospace Composites",     slug: "aerospace-composites",   icon: "layers",        sortOrder: 5 },
  { industrySlug: "electronics",  label: "Copper & Conductors",      slug: "copper-conductors",      icon: "cable",         sortOrder: 6 },
  { industrySlug: "electronics",  label: "Semiconductor Materials",  slug: "semiconductor-materials",icon: "memory",        sortOrder: 7 },
  { industrySlug: "healthcare",   label: "Surgical Steel",           slug: "surgical-steel",         icon: "medical_services", sortOrder: 8 },
  { industrySlug: "pharma",       label: "Pharma Excipients",        slug: "pharma-excipients",      icon: "medication",    sortOrder: 9 },
  { industrySlug: "polymers",     label: "Engineering Plastics",     slug: "engineering-plastics",   icon: "bubble_chart",  sortOrder: 10 },
  { industrySlug: "construction", label: "Structural Steel",         slug: "structural-steel",       icon: "construction",  sortOrder: 11 },
  { industrySlug: "defence",      label: "Armour Steel",             slug: "armour-steel",           icon: "security",      sortOrder: 12 },
  { industrySlug: "textile",      label: "Natural Fibres",           slug: "natural-fibres",         icon: "dry_cleaning",  sortOrder: 13 },
];

// ──────────────────────────────────────────────────────────────────────────────
// Seed runner
// ──────────────────────────────────────────────────────────────────────────────
async function seed() {
  const client = await pool.connect();
  try {
    console.log("🌱 Starting catalogue-v2 seed...");

    // 1. Upsert industries
    const industryIdMap: Record<string, string> = {};
    for (const ind of INDUSTRIES) {
      const { rows } = await client.query(
        `INSERT INTO industries (slug, name, icon, is_active)
         VALUES ($1, $2, $3, true)
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon
         RETURNING id`,
        [ind.slug, ind.name, ind.icon]
      );
      industryIdMap[ind.slug] = rows[0].id;
    }
    console.log(`✓ Upserted ${INDUSTRIES.length} industries`);

    // 2. Upsert categories (with industryId)
    const categoryIdMap: Record<string, string> = {};
    for (const cat of CATEGORIES) {
      const industryId = industryIdMap[cat.industrySlug];
      if (!industryId) {
        console.warn(`  ⚠ Unknown industrySlug: ${cat.industrySlug} for category ${cat.slug}`);
        continue;
      }
      const { rows } = await client.query(
        `INSERT INTO categories (industry_id, slug, name, description, is_active)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT (slug) DO UPDATE
           SET industry_id = EXCLUDED.industry_id,
               name = EXCLUDED.name,
               description = EXCLUDED.description
         RETURNING id`,
        [industryId, cat.slug, cat.name, cat.description ?? null]
      );
      categoryIdMap[cat.slug] = rows[0].id;
    }
    console.log(`✓ Upserted ${CATEGORIES.length} categories`);

    // 3. Upsert subcategories
    const subcategoryIdMap: Record<string, string> = {};
    for (const cat of CATEGORIES) {
      const categoryId = categoryIdMap[cat.slug];
      if (!categoryId) continue;
      for (const subName of cat.subcategories) {
        const { rows } = await client.query(
          `INSERT INTO subcategories (category_id, name)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING
           RETURNING id`,
          [categoryId, subName]
        );
        if (rows[0]) {
          subcategoryIdMap[`${cat.slug}::${subName}`] = rows[0].id;
        } else {
          // Fetch existing
          const { rows: existing } = await client.query(
            `SELECT id FROM subcategories WHERE category_id = $1 AND name = $2`,
            [categoryId, subName]
          );
          if (existing[0]) subcategoryIdMap[`${cat.slug}::${subName}`] = existing[0].id;
        }
      }
    }
    console.log(`✓ Upserted subcategories`);

    // 4. Upsert products
    let productCount = 0;
    for (const p of PRODUCTS) {
      const industryId = industryIdMap[p.industrySlug];
      const categoryId = categoryIdMap[p.categorySlug];
      const subcategoryId = subcategoryIdMap[`${p.categorySlug}::${p.subcategoryName}`] ?? null;

      if (!industryId || !categoryId) {
        console.warn(`  ⚠ Skipping product "${p.name}" — missing industry or category`);
        continue;
      }

      await client.query(
        `INSERT INTO products (
           industry_id, category_id, subcategory_id, name, description,
           thumbnail_url, material_type, grade, specifications,
           moq, lead_time, price, original_price, brand,
           samples_available, in_stock, rating, reviews
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
         ON CONFLICT DO NOTHING`,
        [
          industryId,
          categoryId,
          subcategoryId,
          p.name,
          p.description,
          p.thumbnailUrl,
          p.materialType,
          p.grade,
          JSON.stringify(p.specifications),
          p.moq,
          p.leadTime,
          p.price,
          p.originalPrice ?? null,
          p.brand,
          p.samplesAvailable,
          p.inStock,
          p.rating,
          p.reviews,
        ]
      );
      productCount++;
    }
    console.log(`✓ Seeded ${productCount} products`);

    // 5. Upsert nav items
    for (const nav of NAV_ITEMS) {
      const industryId = industryIdMap[nav.industrySlug];
      if (!industryId) continue;
      await client.query(
        `INSERT INTO nav_raw_material_categories (industry_id, label, slug, icon, sort_order, is_active)
         VALUES ($1, $2, $3, $4, $5, true)
         ON CONFLICT (slug) DO UPDATE
           SET industry_id = EXCLUDED.industry_id,
               label = EXCLUDED.label,
               icon = EXCLUDED.icon,
               sort_order = EXCLUDED.sort_order`,
        [industryId, nav.label, nav.slug, nav.icon, nav.sortOrder]
      );
    }
    console.log(`✓ Upserted ${NAV_ITEMS.length} nav items`);

    console.log("✅ catalogue-v2 seed complete!");
  } catch (err) {
    console.error("❌ Seed failed:", err);
    throw err;
  } finally {
    client.release();
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
