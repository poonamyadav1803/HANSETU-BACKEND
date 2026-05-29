/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  GGI / Hansetu — MANUFACTURER MODULE SEED DATA
 *  shared/seedManufacturersData.ts
 *
 *  Single source of truth for the entire Manufacturer flow:
 *    Industries → Categories → Subcategories → Materials → Dimensions
 *    → Certifications → Sample Products → Anonymised Match Profiles
 *
 *  Pure TypeScript — no imports, no runtime dependencies.
 *  Use this file to:
 *    1. Seed the database from the backend (server/seedManufacturersData.ts runner)
 *    2. Import types & constants directly in frontend components
 *    3. Drive the Header dropdown, Spec Form, and Product Listing pages
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  USER FLOW  (end-to-end, step by step)
 *  ──────────────────────────────────────
 *  1. HEADER  ──▶  user hovers / clicks "Manufacturers" nav item
 *                  • requires login (auth gate opens if not authenticated)
 *                  • dropdown renders MANUFACTURER_INDUSTRIES list
 *                  • each row: icon  +  industry name  +  chevron
 *
 *  2. DROPDOWN CLICK  ──▶  user clicks e.g. "Automobile"
 *                  • route: /manufacturers-auto  (or /manufacturers-{slug})
 *                  • generic route pattern: /manufacturers/:slug
 *
 *  3. INDUSTRY LANDING PAGE  ──▶  two-column layout
 *     LEFT — Spec + Dimension Form:
 *       • Part Name (free text)
 *       • Category  (dropdown from industry.categories[])
 *       • Subcategory  (cascades from category)
 *       • Material  (dropdown from category.materials[])
 *       • Quantity + Order Type (sample / bulk / both)
 *       • Certifications  (multi-select from industry.certifications[])
 *       • Delivery State  (Indian states)
 *       • Lead Time preference
 *       • Budget (INR)
 *       • Dimension fields (length, width, height, OD, ID, wall thickness)
 *       • Tolerance  (dropdown from STANDARD_TOLERANCES)
 *       • Surface Finish  (dropdown from STANDARD_SURFACE_FINISHES)
 *       • Notes
 *     RIGHT — AI match panel (shows after form submit):
 *       • "Searching X verified manufacturers…"
 *       • Match stats card: total matches, states covered, cert count
 *       • Anonymised supplier tiles (city, lead time, MOQ, capability badges)
 *       • "Reveal Contact" button (consumes 1 credit)
 *
 *  4. PRODUCT LISTING  ──▶  below the form, or on a separate tab
 *     • Product cards drawn from MANUFACTURER_PRODUCTS for that industry
 *     • Each card: thumbnail icon, name, grade/spec, price range, certifications
 *     • "Add to Cart" → quantity selector → delivery address → payment
 *     • "Request Sample" → quote form → email to matched manufacturers
 *     • "Request Bulk Quote" → RFQ form
 *
 *  5. CHECKOUT FLOW
 *     • Address selection / creation (GET/POST /api/user/addresses)
 *     • Order type confirmation
 *     • PaymentCheckoutModal (UPI / Card / Net Banking / Wallet)
 *     • Success screen with order number
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  DATABASE TABLES  (Drizzle schema to add in shared/schema.ts)
 *  ────────────────────────────────────────────────────────────
 *
 *  manufacturer_industries
 *    id          TEXT PRIMARY KEY          e.g. "automobile"
 *    name        TEXT NOT NULL             e.g. "Automobile & Auto Components"
 *    slug        TEXT NOT NULL UNIQUE      e.g. "automobile"
 *    icon        TEXT NOT NULL             Material Icon name
 *    emoji       TEXT                      "🚗"
 *    description TEXT
 *    sort_order  INTEGER DEFAULT 0
 *
 *  manufacturer_categories
 *    id                 TEXT PRIMARY KEY   e.g. "auto-engine"
 *    industry_id        TEXT REFERENCES manufacturer_industries(id)
 *    name               TEXT NOT NULL      e.g. "Engine Components"
 *    subcategories      JSONB              string[]
 *    materials          JSONB              string[]
 *    certifications     JSONB              string[]
 *    tolerances         JSONB              string[]  (allowed tolerances for this cat)
 *    surface_finishes   JSONB              string[]
 *    dimension_template JSONB              DimensionTemplate object
 *    sort_order         INTEGER DEFAULT 0
 *
 *  manufacturer_products
 *    id              TEXT PRIMARY KEY
 *    industry_id     TEXT REFERENCES manufacturer_industries(id)
 *    category_id     TEXT REFERENCES manufacturer_categories(id)
 *    name            TEXT NOT NULL
 *    subcategory     TEXT
 *    description     TEXT
 *    grade           TEXT
 *    unit            TEXT DEFAULT 'pc'
 *    price_min       NUMERIC
 *    price_max       NUMERIC
 *    lead_time_days  INTEGER
 *    certifications  JSONB   string[]
 *    specifications  JSONB   Record<string, string|number>
 *    sort_order      INTEGER DEFAULT 0
 *
 *  (manufacturers live in the existing `users` table with dashboardRole='manufacturer')
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface DimensionTemplate {
  showLength: boolean;
  showWidth: boolean;
  showHeight: boolean;
  showOuterDia: boolean;
  showInnerDia: boolean;
  showWallThickness: boolean;
  showWeight: boolean;
  lengthLabel?: string;
  widthLabel?: string;
  heightLabel?: string;
}

export interface ManufacturerCategory {
  id: string;
  industryId: string;
  name: string;
  subcategories: string[];
  materials: string[];
  certifications: string[];
  tolerances: string[];
  surfaceFinishes: string[];
  dimensionTemplate: DimensionTemplate;
  sortOrder: number;
}

export interface ManufacturerIndustry {
  id: string;
  name: string;
  slug: string;
  icon: string;
  emoji: string;
  description: string;
  certifications: string[];
  routePath: string;
  sortOrder: number;
}

export interface ManufacturerProduct {
  id: string;
  industryId: string;
  categoryId: string;
  name: string;
  subcategory: string;
  description: string;
  grade: string;
  unit: string;
  priceMin: number;
  priceMax: number;
  leadTimeDays: number;
  certifications: string[];
  specifications: Record<string, string | number>;
  sortOrder: number;
}

// ─── Shared Reference Data ────────────────────────────────────────────────────

export const STANDARD_TOLERANCES: string[] = [
  '±0.001 mm', '±0.002 mm', '±0.005 mm', '±0.01 mm', '±0.02 mm',
  '±0.05 mm', '±0.1 mm', '±0.2 mm', '±0.5 mm', '±1.0 mm',
  'IT5', 'IT6', 'IT7', 'IT8', 'IT9', 'IT10',
  'H6/f6', 'H7/g6', 'H7/k6', 'H8/f7',
];

export const STANDARD_SURFACE_FINISHES: string[] = [
  'Ra 0.1 μm (Mirror Polish)', 'Ra 0.2 μm', 'Ra 0.4 μm', 'Ra 0.8 μm',
  'Ra 1.6 μm', 'Ra 3.2 μm', 'Ra 6.3 μm', 'Ra 12.5 μm',
  'As Machined', 'Ground', 'Lapped', 'Honed', 'Superfinished',
  'Anodised (Type II)', 'Hard Anodised (Type III)', 'Electroplated (Zinc)', 'Electroplated (Chrome)',
  'Powder Coated', 'Black Oxide', 'Phosphated', 'Galvanised',
];

export const INDIAN_MANUFACTURING_STATES: string[] = [
  'Maharashtra', 'Gujarat', 'Tamil Nadu', 'Karnataka', 'Rajasthan',
  'Uttar Pradesh', 'Haryana', 'Punjab', 'Andhra Pradesh', 'Telangana',
  'West Bengal', 'Madhya Pradesh', 'Odisha', 'Jharkhand', 'Chhattisgarh',
  'Himachal Pradesh', 'Uttarakhand', 'Kerala', 'Delhi', 'Goa',
];

export const COMMON_CERTIFICATIONS: string[] = [
  'ISO 9001:2015', 'ISO 14001:2015', 'ISO 45001:2018',
  'IATF 16949:2016', 'AS9100D', 'NADCAP', 'ISO 13485:2016',
  'GMP / WHO-GMP', 'BIS / ISI', 'CE Marking', 'REACH Compliance',
  'RoHS Compliant', 'UL Listed', 'ATEX Certified',
];

// ─── MANUFACTURER INDUSTRIES ──────────────────────────────────────────────────

export const MANUFACTURER_INDUSTRIES: ManufacturerIndustry[] = [
  {
    id: 'automobile',
    name: 'Automobile & Auto Components',
    slug: 'automobile',
    icon: 'directions_car',
    emoji: '🚗',
    description: 'IATF 16949-certified manufacturers of OEM & aftermarket auto parts — engine, transmission, braking, suspension, electrical and body components.',
    certifications: ['IATF 16949:2016','ISO 9001:2015','AIS-026','BIS/ISI','ECE Regulation','iCAT Certification','ISO 26262 (Functional Safety)','REACH','ARAI Approved'],
    routePath: '/manufacturers-auto',
    sortOrder: 1,
  },
  {
    id: 'aerospace',
    name: 'Aerospace & Aviation',
    slug: 'aerospace',
    icon: 'flight',
    emoji: '✈️',
    description: 'AS9100D and NADCAP-certified precision manufacturers for airframe structures, engine components, avionics enclosures and composites.',
    certifications: ['AS9100D','NADCAP (Heat Treatment)','NADCAP (Welding)','NADCAP (NDT)','DGCA Approved','ISO 9001:2015','FAA PMA','EASA Part 21'],
    routePath: '/manufacturers-aerospace',
    sortOrder: 2,
  },
  {
    id: 'defence',
    name: 'Defence & Military',
    slug: 'defence',
    icon: 'security',
    emoji: '🛡️',
    description: 'DRDO-approved and MIL-SPEC compliant manufacturers for armoured systems, ordnance, ballistics, and defence electronics.',
    certifications: ['DRDO Approved','MIL-STD-810','MIL-SPEC','BIS/ISI','ISO 9001:2015','SQAE Certified','OFB / DPSU Approved'],
    routePath: '/manufacturers-defense',
    sortOrder: 3,
  },
  {
    id: 'space',
    name: 'Space & Satellite Systems',
    slug: 'space',
    icon: 'rocket',
    emoji: '🚀',
    description: 'ISRO-empanelled and AS9100D precision manufacturers for satellite structures, propulsion, thermal protection and ground systems.',
    certifications: ['AS9100D','ISRO Empanelled','ECSS Standards','ISO 9001:2015','NADCAP','ESD Protected','NASA-STD'],
    routePath: '/manufacturers-space',
    sortOrder: 4,
  },
  {
    id: 'electronics',
    name: 'Electronics & PCB Manufacturing',
    slug: 'electronics',
    icon: 'memory',
    emoji: '💻',
    description: 'IPC-certified EMS and PCB manufacturers for consumer, industrial, medical and automotive electronics assemblies.',
    certifications: ['IPC-A-610','IPC-J-STD-001','ISO 9001:2015','ISO 14001','RoHS Compliant','REACH','UL Listed','CE Marking','AIS-140'],
    routePath: '/manufacturers-electronics',
    sortOrder: 5,
  },
  {
    id: 'electrical',
    name: 'Electrical Equipment',
    slug: 'electrical',
    icon: 'electric_bolt',
    emoji: '⚡',
    description: 'BIS and IEC-certified manufacturers of switchgear, transformers, cables, motors and industrial control panels.',
    certifications: ['BIS/ISI Mark','IEC 60947','IEC 60076','IS 732','IS 1554','CPRI Tested','ERDA Approved','ISO 9001:2015'],
    routePath: '/manufacturers-electrical',
    sortOrder: 6,
  },
  {
    id: 'pharmaceutical',
    name: 'Pharmaceutical Equipment',
    slug: 'pharma',
    icon: 'medication',
    emoji: '💊',
    description: 'WHO-GMP and USFDA-compliant manufacturers of pharmaceutical machinery, cleanroom equipment, and API processing systems.',
    certifications: ['WHO-GMP','USFDA 21 CFR','EU GMP','ISO 9001:2015','ISO 14001','CDSCO Approved','cGMP Compliant','ATEX Certified'],
    routePath: '/manufacturers-pharma',
    sortOrder: 7,
  },
  {
    id: 'medical-devices',
    name: 'Medical Devices & Equipment',
    slug: 'medical',
    icon: 'medical_services',
    emoji: '🩺',
    description: 'ISO 13485-certified manufacturers of surgical instruments, diagnostic devices, implants and hospital equipment.',
    certifications: ['ISO 13485:2016','CE Marking (MDR 2017/745)','CDSCO License','BIS','USFDA 510(k)','ISO 9001:2015','Sterile Processing Certified'],
    routePath: '/manufacturers-medical',
    sortOrder: 8,
  },
  {
    id: 'construction',
    name: 'Construction & Infrastructure',
    slug: 'construction',
    icon: 'construction',
    emoji: '🏗️',
    description: 'BIS and CPWD-approved manufacturers of structural steel, precast concrete, roofing, windows and construction hardware.',
    certifications: ['BIS/ISI Mark','IS 2062','IS 1786','IS 456','GRIHA Rating','ISO 9001:2015','CPWD Approved','NPCB Certified'],
    routePath: '/manufacturers-construction',
    sortOrder: 9,
  },
  {
    id: 'energy-power',
    name: 'Energy & Power Systems',
    slug: 'energy',
    icon: 'bolt',
    emoji: '🔋',
    description: 'BEE and IEC-certified manufacturers of solar panels, wind components, transformers, batteries and power electronics.',
    certifications: ['BEE Star Rating','IEC 61215','IEC 61730','CEA Regulations','MNRE Approved','ISO 9001:2015','ISO 14001','UL Certified'],
    routePath: '/manufacturers-energy',
    sortOrder: 10,
  },
  {
    id: 'chemical',
    name: 'Chemical Processing Equipment',
    slug: 'chemical',
    icon: 'science',
    emoji: '⚗️',
    description: 'ASME and IBR-certified fabricators of pressure vessels, reactors, heat exchangers, columns and storage tanks.',
    certifications: ['ASME U Stamp','IBR (Indian Boiler Regulations)','PED (97/23/EC)','ATEX / IECEx','ISO 9001:2015','ISO 3834','NACE MR0175','AD-2000'],
    routePath: '/manufacturers-chemical',
    sortOrder: 11,
  },
  {
    id: 'polymer',
    name: 'Polymer & Rubber Products',
    slug: 'polymer',
    icon: 'bubble_chart',
    emoji: '🧪',
    description: 'ISO and BIS-certified manufacturers of precision rubber mouldings, polymer profiles, gaskets, seals and composite parts.',
    certifications: ['ISO 9001:2015','BIS/ISI','IATF 16949:2016','RoHS Compliant','REACH','ISO 13485','ASTM Tested'],
    routePath: '/manufacturers-polymer',
    sortOrder: 12,
  },
  {
    id: 'textile',
    name: 'Textile & Apparel Machinery',
    slug: 'textile',
    icon: 'dry_cleaning',
    emoji: '🧵',
    description: 'ISO-certified manufacturers of spinning machinery, looms, processing equipment and knitting/weaving components.',
    certifications: ['ISO 9001:2015','CE Marking','BIS/ISI','ATEX','ITMF Member','SIMA Certified'],
    routePath: '/manufacturers-textile',
    sortOrder: 13,
  },
  {
    id: 'railway',
    name: 'Railway & Metro Components',
    slug: 'railway',
    icon: 'train',
    emoji: '🚆',
    description: 'RDSO and AAR-approved manufacturers of bogies, couplers, wheels, braking systems and rail fasteners.',
    certifications: ['RDSO Approved','ISO 9001:2015','AAR M-1003','EN 15085 (Welding)','IS 5905','BIS/ISI','IRS Specification'],
    routePath: '/manufacturers-railway',
    sortOrder: 14,
  },
  {
    id: 'oil-gas',
    name: 'Oil & Gas Equipment',
    slug: 'oil-gas',
    icon: 'oil_barrel',
    emoji: '🛢️',
    description: 'API and ASME-certified manufacturers of wellhead equipment, valves, flanges, fittings and subsea components.',
    certifications: ['API 6A','API 6D','API 5L','ASME B31.3','ISO 9001:2015','NACE MR0175','ATEX / IECEx','Lloyd\'s Register'],
    routePath: '/manufacturers-oil-gas',
    sortOrder: 15,
  },
  {
    id: 'food-processing',
    name: 'Food Processing Equipment',
    slug: 'food-processing',
    icon: 'kitchen',
    emoji: '🍱',
    description: 'FSSAI and 3-A-certified manufacturers of food processing machinery, mixing, filling, packaging and CIP systems.',
    certifications: ['FSSAI License','3-A Sanitary Standards','ISO 22000','HACCP','CE Marking','FDA Food Contact','ISO 9001:2015','BRC Approved'],
    routePath: '/manufacturers-food-processing',
    sortOrder: 16,
  },
];

// ─── MANUFACTURER CATEGORIES (per industry) ───────────────────────────────────

export const MANUFACTURER_CATEGORIES: ManufacturerCategory[] = [

  // ═══════════════════════════ AUTOMOBILE ═══════════════════════════════════

  {
    id: 'auto-engine',
    industryId: 'automobile',
    name: 'Engine Components',
    subcategories: ['Pistons & Piston Rings','Crankshafts','Camshafts','Cylinder Heads & Blocks','Connecting Rods','Valves & Valve Guides','Engine Bearings & Bushings','Gaskets & Seals','Oil Pumps','Water Pumps','Turbocharger Components','Timing Chains & Gears','Rocker Arms & Lifters','Intake Manifolds','Exhaust Manifolds'],
    materials: ['Aluminium Alloy (AA4032, AA2618)','Forged Steel (SAE 1045, 4340)','Cast Iron (GG25, GGG40)','Cast Aluminium Alloy','Stainless Steel 410/420','Powder Metal (Sintered)','Grey Cast Iron','Compacted Graphite Iron (CGI)','Tool Steel (H13)'],
    certifications: ['IATF 16949:2016','ISO 9001:2015','iCAT Certification','ARAI Approved','AIS-026'],
    tolerances: ['±0.005 mm','±0.01 mm','±0.02 mm','±0.05 mm','IT5','IT6','IT7','H7/g6','H6/f6'],
    surfaceFinishes: ['Ra 0.1 μm (Mirror Polish)','Ra 0.2 μm','Ra 0.4 μm','Ra 0.8 μm','Ra 1.6 μm','Honed','Ground','Superfinished'],
    dimensionTemplate: { showLength: true, showWidth: false, showHeight: true, showOuterDia: true, showInnerDia: true, showWallThickness: false, showWeight: true, lengthLabel: 'Stroke / Length', heightLabel: 'Height', },
    sortOrder: 1,
  },
  {
    id: 'auto-transmission',
    industryId: 'automobile',
    name: 'Transmission & Drivetrain',
    subcategories: ['Gearbox Housings','Gear Shafts & Pinions','Synchroniser Rings','Clutch Plates & Kits','Drive Shafts (Propeller)','CV Joints & Boots','Differential Housings & Gears','Transfer Case Components','Flywheel Assemblies','Torque Converters','Gear Rings','Universal Joints'],
    materials: ['Case Hardened Steel (SAE 8620, 4320)','Alloy Steel (SAE 4140, 4340)','Aluminium Alloy Die Cast','Grey Cast Iron','Sintered Metal (PM)','Forged Steel'],
    certifications: ['IATF 16949:2016','ISO 9001:2015','AIS-056','ARAI Approved'],
    tolerances: ['±0.005 mm','±0.01 mm','±0.02 mm','IT5','IT6','IT7','H7/k6'],
    surfaceFinishes: ['Ra 0.4 μm','Ra 0.8 μm','Ra 1.6 μm','Ground','Lapped','Black Oxide'],
    dimensionTemplate: { showLength: true, showWidth: true, showHeight: false, showOuterDia: true, showInnerDia: true, showWallThickness: false, showWeight: true },
    sortOrder: 2,
  },
  {
    id: 'auto-braking',
    industryId: 'automobile',
    name: 'Braking Systems',
    subcategories: ['Brake Discs / Rotors','Brake Drums','Brake Pads (Passenger)','Brake Pads (Commercial Vehicle)','Brake Shoes','Caliper Housings','Master Cylinders','Wheel Cylinders','Brake Lines & Fittings','ABS Sensor Rings / Tone Rings','Brake Boosters','Proportioning Valves'],
    materials: ['Grey Cast Iron (GG20, GG25)','Compacted Graphite Iron','Carbon-Ceramic (Racing)','Aluminium Alloy (Caliper)','Steel (Brake Lines — IS 638)','Non-asbestos Organic (NAO)','Low-Metallic','Semi-Metallic'],
    certifications: ['IATF 16949:2016','ISO 9001:2015','AIS-141 (Brakes)','ECE R-90','iCAT','BIS'],
    tolerances: ['±0.02 mm','±0.05 mm','±0.1 mm','±0.2 mm','IT7','IT8'],
    surfaceFinishes: ['Ra 0.8 μm','Ra 1.6 μm','Ra 3.2 μm','Ground','As Machined','Black Oxide'],
    dimensionTemplate: { showLength: false, showWidth: false, showHeight: true, showOuterDia: true, showInnerDia: true, showWallThickness: true, showWeight: true, heightLabel: 'Thickness' },
    sortOrder: 3,
  },
  {
    id: 'auto-suspension',
    industryId: 'automobile',
    name: 'Suspension & Steering',
    subcategories: ['Shock Absorbers & Struts','Coil Springs','Leaf Springs','Control Arms & Wishbones','Steering Racks','Steering Columns & Shafts','Ball Joints','Tie Rods & End Links','Bushings & Rubber Mounts','Stabiliser / Sway Bar Links','Anti-Roll Bars','Knuckle & Hub Assemblies'],
    materials: ['Forged Steel (SAE 1045, 5130)','High-Tensile Spring Steel (65Mn, SUP9)','Aluminium Alloy (AA6061, A380)','Rubber (Natural & EPDM)','Cast Iron','Chrome-Vanadium Steel'],
    certifications: ['IATF 16949:2016','ISO 9001:2015','AIS (Relevant Part)','ARAI Approved'],
    tolerances: ['±0.05 mm','±0.1 mm','±0.2 mm','±0.5 mm','IT7','IT8','IT9'],
    surfaceFinishes: ['Ra 0.8 μm','Ra 1.6 μm','Ra 3.2 μm','Phosphated','Zinc Plated','Powder Coated'],
    dimensionTemplate: { showLength: true, showWidth: false, showHeight: false, showOuterDia: true, showInnerDia: true, showWallThickness: true, showWeight: true },
    sortOrder: 4,
  },
  {
    id: 'auto-electrical',
    industryId: 'automobile',
    name: 'Electrical & Electronics',
    subcategories: ['Alternators / Generators','Starter Motors','Wiring Harnesses','Electronic Control Units (ECU / BCM)','Sensors (ABS, O2, MAP, TPS, Cam)','Switches & Relays','LED Lighting Assemblies','Ignition Coils & Modules','Fuse Boxes & Junction Blocks','CAN Bus Modules','Instrument Clusters','Actuators (EGR, VVT)'],
    materials: ['Copper (ETP C11000)','Aluminium Alloy (Rotor/Stator)','Engineering Plastics (PA66-GF30)','Silicon Steel (Laminations)','Neodymium Magnets','FR4 PCB Material','PVC / XLPE Insulation'],
    certifications: ['IATF 16949:2016','AIS-004','AIS-140','ISO 26262 (ASIL B/C/D)','E-Mark / ECE','RoHS','REACH'],
    tolerances: ['±0.05 mm','±0.1 mm','±0.2 mm','±0.5 mm'],
    surfaceFinishes: ['As Machined','Anodised (Type II)','Electroplated (Zinc)','Powder Coated'],
    dimensionTemplate: { showLength: true, showWidth: true, showHeight: true, showOuterDia: false, showInnerDia: false, showWallThickness: false, showWeight: true },
    sortOrder: 5,
  },
  {
    id: 'auto-body',
    industryId: 'automobile',
    name: 'Body, Exterior & Glazing',
    subcategories: ['Bumpers & Fascias','Fenders & Quarter Panels','Door Panels (Outer)','Hood / Bonnet Assemblies','Trunk Lid / Tailgate','Grilles & Trim Strips','Door Handles (Inner & Outer)','Mirrors & Brackets','Running Boards & Step Rails','Roof Rails','Side Skirts','Windshield (Laminated)','Rear Glass (Tempered)','Sunroof Glass'],
    materials: ['HSLA Steel (Grade 340/420/590 MPa)','PP+EPDM+T20 (Bumpers)','SMC (Sheet Moulding Compound)','Aluminium Alloy (AA5052, AA5754)','Polycarbonate (Glazing)','PVB Laminated Glass','Tempered Safety Glass','ABS + PC Blend'],
    certifications: ['IATF 16949:2016','AIS-099 (Glazing)','ECE R-43','ARAI','BIS'],
    tolerances: ['±0.5 mm','±1.0 mm','±2.0 mm'],
    surfaceFinishes: ['Class A Surface (Ra 0.1–0.4 μm)','Powder Coated','E-Coat Primer','Painted'],
    dimensionTemplate: { showLength: true, showWidth: true, showHeight: true, showOuterDia: false, showInnerDia: false, showWallThickness: true, showWeight: true },
    sortOrder: 6,
  },

  // ═══════════════════════════ AEROSPACE ════════════════════════════════════

  {
    id: 'aero-structures',
    industryId: 'aerospace',
    name: 'Airframe Structures',
    subcategories: ['Fuselage Skin Panels','Fuselage Frames & Stringers','Wing Spars & Ribs','Wing Skins (Monolithic)','Bulkheads','Floor Beams & Seat Tracks','Pressure Bulkheads','Empennage Structures','Fairings & Access Panels','Doors (Cargo & Passenger)','Nacelle Structures','Engine Mounts'],
    materials: ['AA7075-T7351','AA7010-T7451','AA2024-T3/T351','AA6061-T651','Ti-6Al-4V (Grade 5)','Inconel 718','CFRP Prepreg (Toray T800)','CFRP Prepreg (Hexcel IM7)','Aluminum-Lithium 2099','Titanium Grade 23'],
    certifications: ['AS9100D','NADCAP (Composites)','NADCAP (Heat Treatment)','DGCA Approved','FAA PMA'],
    tolerances: ['±0.001 mm','±0.002 mm','±0.005 mm','±0.01 mm','IT5','IT6'],
    surfaceFinishes: ['Ra 0.4 μm','Ra 0.8 μm','Ra 1.6 μm','Hard Anodised (Type III)','Anodised (Type II)','Alodine / Chromate Conversion'],
    dimensionTemplate: { showLength: true, showWidth: true, showHeight: true, showOuterDia: false, showInnerDia: false, showWallThickness: true, showWeight: true },
    sortOrder: 1,
  },
  {
    id: 'aero-engine-parts',
    industryId: 'aerospace',
    name: 'Aero-Engine Components',
    subcategories: ['Compressor Blades & Vanes','Turbine Blades (Casting)','Turbine Disc & Shaft','Combustion Liners','Nozzle Guide Vanes (NGV)','Shroud Segments','Diffuser Cases','Bearing Housings','Oil System Components','Fan Blade Containment Rings','Thrust Reverser Components'],
    materials: ['Inconel 718','Inconel 625','Hastelloy X','Rene 80 (Investment Cast)','Ti-6Al-4V ELI','CMSX-4 (Single Crystal)','Waspaloy','Mar-M247','Cobalt Alloy (L-605)'],
    certifications: ['AS9100D','NADCAP (Heat Treatment)','NADCAP (NDT)','NADCAP (Welding)','DGCA','FAA PMA'],
    tolerances: ['±0.001 mm','±0.002 mm','±0.005 mm','±0.01 mm','IT4','IT5'],
    surfaceFinishes: ['Ra 0.1 μm (Mirror Polish)','Ra 0.2 μm','Ra 0.4 μm','Superfinished','Ground'],
    dimensionTemplate: { showLength: true, showWidth: false, showHeight: true, showOuterDia: true, showInnerDia: true, showWallThickness: true, showWeight: true },
    sortOrder: 2,
  },
  {
    id: 'aero-avionics',
    industryId: 'aerospace',
    name: 'Avionics & Enclosures',
    subcategories: ['Avionics Chassis & Trays','RF Shielded Enclosures','Line Replaceable Units (LRU) Housings','ARINC 600 / ARINC 404 Racks','MCM / Multi-Chip Module Housings','Connectors & Backshells','PCB Assemblies (Mil-Spec)','Heat Sinks & Thermal Management','EMI/RFI Gaskets & Shielding','Waveguides'],
    materials: ['AA6061-T6 (Machined)','AA2024-T3','Magnesium Alloy AZ91','Carbon Fibre Composite','Invar 36 (Low Expansion)','Titanium Grade 2','FR4 / Polyimide PCB'],
    certifications: ['AS9100D','DO-160G (Environment)','DO-178C (Software)','MIL-STD-461','MIL-STD-810','DGCA Approved'],
    tolerances: ['±0.005 mm','±0.01 mm','±0.02 mm','IT6','IT7'],
    surfaceFinishes: ['Hard Anodised (Type III)','Anodised (Type II)','Alodine 1200','Electroplated (Nickel)','Conductive Coating'],
    dimensionTemplate: { showLength: true, showWidth: true, showHeight: true, showOuterDia: false, showInnerDia: false, showWallThickness: true, showWeight: true },
    sortOrder: 3,
  },

  // ═══════════════════════════ DEFENCE ══════════════════════════════════════

  {
    id: 'def-armour',
    industryId: 'defence',
    name: 'Armour & Ballistic Protection',
    subcategories: ['Rolled Homogeneous Armour (RHA) Plates','High Hardness Steel (HHS) Plates','Spaced Armour Modules','Explosive Reactive Armour (ERA) Cassettes','Ceramic Tile Arrays (Al2O3, SiC, B4C)','UHMWPE Composite Panels','Kevlar / Aramid Woven Panels','Ballistic Helmets (NIJ III/IV)','Vehicle Floor Blast Protection'],
    materials: ['RHA Steel (MIL-A-12560)','High Hardness Steel (HHS 500 / Armox 500T)','Boron Carbide (B4C) Ceramic','SiC Ceramic','UHMWPE (Dyneema / Spectra)','Para-Aramid (Kevlar KM2 / Twaron)','Aluminium Armour Alloy (AA5083, AA7039)'],
    certifications: ['DRDO Approved','MIL-A-12560','NIJ 0101.06','SQAE-A','IS 17051'],
    tolerances: ['±0.5 mm','±1.0 mm','±2.0 mm'],
    surfaceFinishes: ['As Rolled','Phosphated + Painted','Powder Coated (OD Green)','Primer Coated'],
    dimensionTemplate: { showLength: true, showWidth: true, showHeight: false, showOuterDia: false, showInnerDia: false, showWallThickness: true, showWeight: true, heightLabel: 'Thickness' },
    sortOrder: 1,
  },
  {
    id: 'def-ordnance',
    industryId: 'defence',
    name: 'Ordnance & Pyrotechnics (Inert Components)',
    subcategories: ['Shell Casings (Brass / Steel)','Fuze Bodies (Machined)','Propellant Charge Containers','Projectile Bodies','Mortar Baseplate Components','Grenade Bodies (Practice)','Rocket Motor Casings','Warhead Structural Components','Link & Belt Feeding Systems'],
    materials: ['Brass (CuZn30, CuZn37)','Steel (MIL-S-46850)','Forged Steel (C40, 42CrMo4)','Aluminium Alloy (AA7075)','Titanium Grade 5'],
    certifications: ['DRDO / DRDL Approved','SQAE (Armaments)','OFB Specification','MIL-STD-1167'],
    tolerances: ['±0.005 mm','±0.01 mm','±0.02 mm','±0.05 mm'],
    surfaceFinishes: ['Phosphated','Black Oxide','Zinc Plated','Primer Coated'],
    dimensionTemplate: { showLength: true, showWidth: false, showHeight: true, showOuterDia: true, showInnerDia: true, showWallThickness: true, showWeight: true },
    sortOrder: 2,
  },

  // ═══════════════════════════ SPACE ════════════════════════════════════════

  {
    id: 'space-structures',
    industryId: 'space',
    name: 'Spacecraft Structures',
    subcategories: ['Primary Structure Panels (CFRP)','Secondary Structure Brackets','Equipment Mounting Panels','Propellant Tank Supports','Solar Panel Drive Mechanisms','Deployable Appendage Structures','Inter-Stage Adapters','Payload Interface Rings','Separation Systems','Launch Vehicle Fairings'],
    materials: ['CFRP Prepreg (M55J, T1000G)','Aluminium Alloy AA7075-T73','Titanium Ti-6Al-4V ELI','Invar 36','Aluminium Honeycomb Core','Rohacell Foam Core','AA6061-T6'],
    certifications: ['AS9100D','ISRO Empanelled','ECSS-Q-ST-70','ISO 9001:2015'],
    tolerances: ['±0.001 mm','±0.002 mm','±0.005 mm','±0.01 mm'],
    surfaceFinishes: ['Ra 0.4 μm','Ra 0.8 μm','Anodised (Type II)','Alodine','ESD Controlled Coating'],
    dimensionTemplate: { showLength: true, showWidth: true, showHeight: true, showOuterDia: false, showInnerDia: false, showWallThickness: true, showWeight: true },
    sortOrder: 1,
  },
  {
    id: 'space-propulsion',
    industryId: 'space',
    name: 'Propulsion Components',
    subcategories: ['Thrust Chamber Assemblies','Nozzle Throats (Carbon-Carbon)','Turbo-Pump Impellers','Propellant Valves (Latch / Control)','Pressurant Tanks (COPV)','Fill & Drain Valves','Check Valves (Propellant Lines)','Injector Plates','Combustion Chambers','Feed System Manifolds'],
    materials: ['Inconel 718','Niobium C-103','Carbon-Carbon Composite','Ti-6Al-4V ELI','AA2219-T87 (Tanks)','Stainless Steel 316L','Maraging Steel 250'],
    certifications: ['AS9100D','ISRO Empanelled','ECSS-E-ST-35','NADCAP (NDT)'],
    tolerances: ['±0.001 mm','±0.002 mm','±0.005 mm','IT4','IT5'],
    surfaceFinishes: ['Ra 0.1 μm (Mirror Polish)','Ra 0.2 μm','Ra 0.4 μm','Electroplated (Gold)','TBC Coated'],
    dimensionTemplate: { showLength: true, showWidth: false, showHeight: true, showOuterDia: true, showInnerDia: true, showWallThickness: true, showWeight: true },
    sortOrder: 2,
  },

  // ═══════════════════════════ ELECTRONICS ══════════════════════════════════

  {
    id: 'elec-pcb',
    industryId: 'electronics',
    name: 'PCB Fabrication',
    subcategories: ['Single-Layer PCB','Double-Layer PCB','4-Layer PCB','6-Layer PCB','8–16 Layer HDI PCB','Flexible PCB (FPC)','Rigid-Flex PCB','Heavy Copper PCB (≥3 oz)','Aluminium Metal Core PCB (MCPCB)','High-Frequency PCB (Rogers)','High-Temperature PCB (Polyimide)'],
    materials: ['FR4 (Tg 130, Tg 150, Tg 170)','High Tg FR4 (Tg 170+)','Polyimide (Kapton)','Rogers RO4003C / RO4350B','Aluminium Core (1–3 mm)','Copper Foil (18 μm, 35 μm, 70 μm, 105 μm)','ENIG Surface Finish','OSP Finish','HASL (Lead-Free)','Immersion Silver','Hard Gold'],
    certifications: ['IPC-A-600','IPC-6012','UL 94 V-0','RoHS','REACH','ISO 9001:2015'],
    tolerances: ['±0.05 mm','±0.1 mm','±0.2 mm'],
    surfaceFinishes: ['ENIG (Electroless Nickel Immersion Gold)','HASL Lead-Free','OSP (Organic Solderability Preservative)','Immersion Silver','Hard Gold (Edge Connectors)'],
    dimensionTemplate: { showLength: true, showWidth: true, showHeight: false, showOuterDia: false, showInnerDia: false, showWallThickness: true, showWeight: false, heightLabel: 'Board Thickness' },
    sortOrder: 1,
  },
  {
    id: 'elec-ems',
    industryId: 'electronics',
    name: 'EMS / PCB Assembly',
    subcategories: ['SMT Assembly (0201, 0402, 0603)','Through-Hole Assembly (THT)','Mixed Technology Assembly','BGA / CSP / QFN Soldering','Fine-Pitch IC Placement','Press-Fit Connectors','Conformal Coating (Acrylic, PU, Silicone)','Potting & Encapsulation','Box Build Assembly','Cable & Harness Assembly'],
    materials: ['SAC305 Solder Paste (Lead-Free)','63/37 Sn/Pb Solder (Leaded)','No-Clean Flux','Water-Soluble Flux','Thermal Interface Materials','Conductive Epoxy','Underfill Epoxy'],
    certifications: ['IPC-A-610 Class 2 / Class 3','IPC-J-STD-001','ISO 9001:2015','RoHS','REACH','ISO 13485 (Medical EMS)'],
    tolerances: ['±0.05 mm','±0.1 mm'],
    surfaceFinishes: ['As Soldered','Conformal Coated (Acrylic)','Conformal Coated (Silicone)','Potted (Epoxy)'],
    dimensionTemplate: { showLength: true, showWidth: true, showHeight: true, showOuterDia: false, showInnerDia: false, showWallThickness: false, showWeight: true },
    sortOrder: 2,
  },

  // ═══════════════════════════ PHARMACEUTICAL ═══════════════════════════════

  {
    id: 'pharma-solid-dose',
    industryId: 'pharmaceutical',
    name: 'Solid Dosage Equipment',
    subcategories: ['Rotary Tablet Press (16–72 Stations)','Single-Punch Tablet Press','Capsule Filling Machine (Size 000–5)','Granulation Equipment (High-Shear, Fluid Bed)','Roller Compaction / Dry Granulation','Tablet Coating Pan (Perforated)','Film Coating Machine (Aqueous / Organic)','Blending Equipment (Double Cone, V-Blender, Ribbon)','Milling Equipment (Impact, Oscillating)','Sifter / Vibratory Screener'],
    materials: ['SS 316L (Product Contact)','SS 304 (Non-Contact)','SS 321 (High-Temp)','HDPE (Hoppers)','PTFE / UHMWPE (Seals)','Polished Surface (Ra ≤ 0.5 μm)'],
    certifications: ['WHO-GMP','USFDA 21 CFR Part 211','EU GMP Annex 1','CDSCO Schedule M','cGMP Compliant','ISO 9001:2015'],
    tolerances: ['±0.01 mm','±0.02 mm','±0.05 mm','±0.1 mm'],
    surfaceFinishes: ['Ra 0.2 μm (Internal Product Contact)','Ra 0.4 μm','Ra 0.8 μm','Electro-Polished','Mechanical Polished','Passivated'],
    dimensionTemplate: { showLength: true, showWidth: true, showHeight: true, showOuterDia: false, showInnerDia: false, showWallThickness: false, showWeight: false },
    sortOrder: 1,
  },
  {
    id: 'pharma-liquid-dose',
    industryId: 'pharmaceutical',
    name: 'Liquid Dosage & Parenteral Equipment',
    subcategories: ['Liquid Oral Manufacturing Vessel','Ampoule Filling & Sealing Machine','Vial Filling & Stoppering Machine','Blow-Fill-Seal (BFS) Machine','WFI Distillation Unit','Purified Water System (RO + EDI)','CIP / SIP Systems','Autoclave / Steriliser (Saturated Steam)','Lyophiliser / Freeze Dryer','Isolator (RABS / Barrier)'],
    materials: ['SS 316L (Electro-Polished, Ra ≤ 0.5 μm)','Borosilicate Glass (3.3)','EPDM Seals','PTFE Gaskets','Silicone Tubing (Pharma Grade)'],
    certifications: ['WHO-GMP','USFDA 21 CFR Part 211','EU GMP Annex 1','ISO 9001:2015','CDSCO Schedule M','GAMP 5 (Software)'],
    tolerances: ['±0.01 mm','±0.02 mm','±0.05 mm'],
    surfaceFinishes: ['Ra 0.2 μm (Electro-Polished)','Ra 0.4 μm','Ra 0.8 μm','Mirror Polished (Internal)'],
    dimensionTemplate: { showLength: true, showWidth: true, showHeight: true, showOuterDia: true, showInnerDia: true, showWallThickness: true, showWeight: false },
    sortOrder: 2,
  },

  // ═══════════════════════════ MEDICAL DEVICES ══════════════════════════════

  {
    id: 'med-surgical',
    industryId: 'medical-devices',
    name: 'Surgical Instruments',
    subcategories: ['Scissors (Mayo, Metzenbaum, Iris)','Forceps (Tissue, Dressing, Mosquito, Allis)','Needle Holders (Mayo-Hegar, Castroviejo)','Retractors (Langenbeck, Weitlaner, Gelpi)','Clamps (Bulldog, Towel, Sponge)','Scalpel Handles & Blades','Curettes & Gouges','Bone Levers & Elevators','Chisels & Osteotomes','Laparoscopic Trocars','Electrosurgical Instruments'],
    materials: ['SS 17-4 PH (AISI 630)','SS 420 (Cutting Instruments)','SS 316L (Implant-Grade)','Titanium Grade 5 (Ti-6Al-4V ELI)','Tungsten Carbide (TC Inserts)'],
    certifications: ['ISO 13485:2016','CE Marking (MDR 2017/745)','CDSCO Class B/C','BIS IS 7604','ISO 9001:2015','Biocompatibility Testing (ISO 10993)'],
    tolerances: ['±0.005 mm','±0.01 mm','±0.02 mm','±0.05 mm'],
    surfaceFinishes: ['Electro-Polished (Ra ≤ 0.4 μm)','Satin / Brushed (Ra 0.4–0.8 μm)','Mirror Polished (Ra ≤ 0.1 μm)','Passivated (ASTM A967)'],
    dimensionTemplate: { showLength: true, showWidth: false, showHeight: false, showOuterDia: true, showInnerDia: false, showWallThickness: false, showWeight: true },
    sortOrder: 1,
  },
  {
    id: 'med-implants',
    industryId: 'medical-devices',
    name: 'Orthopaedic Implants',
    subcategories: ['Cortical Bone Screws (LCP System)','Cancellous Bone Screws','Intramedullary Nails (Tibial, Femoral, Humeral)','Locking Compression Plates (LCP)','Dynamic Hip Screw (DHS) System','Knee Implants (Total / Partial)','Hip Femoral Stems','Hip Acetabular Cups','Spine Cages (PEEK / Ti)','Pedicle Screws & Rods','Dental Implant Fixtures & Abutments'],
    materials: ['Ti-6Al-4V ELI (ASTM F136)','Ti-6Al-4V (Grade 5, ASTM F1472)','SS 316L (ASTM F138)','CoCrMo (ASTM F799, F1537)','UHMWPE (Tibial Bearings)','PEEK (Spinal Cages, ASTM F2026)','Hydroxyapatite Coating'],
    certifications: ['ISO 13485:2016','CE Marking (MDR 2017/745)','CDSCO Class C','BIS IS 15883','ASTM F1374 (Titanium)','ISO 10993 (Biocompatibility)','EO Sterilisation'],
    tolerances: ['±0.001 mm','±0.002 mm','±0.005 mm','IT5','IT6'],
    surfaceFinishes: ['Electro-Polished (Ra ≤ 0.2 μm)','Grit Blasted + Acid Etched (Dental)','HA Coated (Plasma Spray)','Anodised (Type II Titanium)','Mirror Polished (Articular)'],
    dimensionTemplate: { showLength: true, showWidth: false, showHeight: false, showOuterDia: true, showInnerDia: true, showWallThickness: false, showWeight: true },
    sortOrder: 2,
  },

  // ═══════════════════════════ CHEMICAL PROCESSING ══════════════════════════

  {
    id: 'chem-pressure-vessel',
    industryId: 'chemical',
    name: 'Pressure Vessels & Reactors',
    subcategories: ['Jacketed Reactors (SS 316L / MS)','Storage Tanks (Vertical / Horizontal)','Pressure Vessels (ASME VIII Div 1)','Heat Exchangers (Shell & Tube)','Plate Heat Exchangers','Distillation Columns','Condenser & Reboiler','Agitator / Mixing Vessels','Surge Vessels','Flash Drums','Separators (Vertical / Horizontal)','Cryogenic Storage Vessels'],
    materials: ['SS 316L (Wetted Parts)','SS 304','Carbon Steel IS 2062 (Non-Corrosive)','Duplex SS 2205','Hastelloy C-276','Titanium Grade 2','Clad Vessels (CS + SS lining)','HDPE Lined','FRP / GRP'],
    certifications: ['ASME U Stamp','IBR (Indian Boiler Regulations)','PED 2014/68/EU','ISO 9001:2015','ISO 3834-2 (Welding)','NACE MR0175'],
    tolerances: ['±0.5 mm','±1.0 mm','±2.0 mm'],
    surfaceFinishes: ['Electro-Polished (Internal)','Ra 0.8 μm (Internal)','Sand Blasted + Painted','Shot Blasted Sa 2.5 + Epoxy Coated'],
    dimensionTemplate: { showLength: false, showWidth: false, showHeight: true, showOuterDia: true, showInnerDia: true, showWallThickness: true, showWeight: true, heightLabel: 'Shell Length' },
    sortOrder: 1,
  },

  // ═══════════════════════════ POLYMER & RUBBER ═════════════════════════════

  {
    id: 'poly-moulding',
    industryId: 'polymer',
    name: 'Rubber Moulded Components',
    subcategories: ['O-Rings (AS 568, IS 11149)','Flat Gaskets & Sheet Rubber','Rubber-to-Metal Bonded Parts','Diaphragms & Bellows','Grommets & Bushings','Rubber Seals (Lip Seals, Wiper Seals)','Anti-Vibration Mounts (AVM)','Engine Mounts','Bump Stops','Suspension Bushes','Fuel Hoses (SAE J30)','Brake Hoses','Boots & Bellows (CV Joint, Rack & Pinion)'],
    materials: ['EPDM (70A, 80A Shore)','NBR Nitrile 60–90 Shore A','Silicone (VMQ, PVMQ)','FKM Viton 70–90 Shore A','Neoprene CR 60–80A','Natural Rubber (60A, 70A)','HNBR','Polyurethane (80A, 90A, 95A)','Butyl IIR'],
    certifications: ['IATF 16949:2016 (Auto)','ISO 9001:2015','RoHS','REACH','FDA 21 CFR 177.2600 (Food Grade)','USP Class VI (Medical)'],
    tolerances: ['±0.1 mm','±0.2 mm','±0.5 mm','±1.0 mm'],
    surfaceFinishes: ['As Moulded','Flash-Free Trimmed','Deflashed (Cryogenic)','PTFE Coated'],
    dimensionTemplate: { showLength: false, showWidth: false, showHeight: true, showOuterDia: true, showInnerDia: true, showWallThickness: true, showWeight: false, heightLabel: 'Cross Section / Height' },
    sortOrder: 1,
  },

  // ═══════════════════════════ CONSTRUCTION ════════════════════════════════

  {
    id: 'const-structural',
    industryId: 'construction',
    name: 'Structural Steel Fabrication',
    subcategories: ['I-Beams & H-Beams (IS 12778)','Roof Trusses','Lattice Girders','Column Sections','Crane Girders','Mezzanine Floors','Staircase Stringers','Handrails & Balustrades','Pre-Engineered Building (PEB) Frames','Portal Frames','Gantry Structures','Modular Steel Buildings'],
    materials: ['IS 2062 E250 (Grade A/B)','IS 2062 E350 (High Tensile)','IS 2062 E410','IS 2062 E450','Weathering Steel (IS 11587)','SS 304 / SS 316 (Stainless Rail)','Hot-Dip Galvanised Steel (IS 4759)'],
    certifications: ['BIS / ISI Mark (IS 2062)','ISO 9001:2015','CPWD Approved','IS 800 (Design Standard)','CE Marking (EN 1090)'],
    tolerances: ['±0.5 mm','±1.0 mm','±2.0 mm','±5.0 mm'],
    surfaceFinishes: ['Shot Blasted Sa 2.5 + Epoxy Primer','Hot-Dip Galvanised (85 μm)','Powder Coated','Paint System (3-Coat)','Bare (To be painted on site)'],
    dimensionTemplate: { showLength: true, showWidth: true, showHeight: true, showOuterDia: false, showInnerDia: false, showWallThickness: true, showWeight: true },
    sortOrder: 1,
  },

  // ═══════════════════════════ ENERGY & POWER ═══════════════════════════════

  {
    id: 'energy-solar',
    industryId: 'energy-power',
    name: 'Solar PV Components',
    subcategories: ['Mono PERC Solar Cells (6-inch, M6, M10)','Bifacial Solar Modules (72-Cell, 144 Half-Cell)','Monofacial Solar Modules','Solar Module Frames (Anodised Al)','Solar Module Junction Boxes','EVA Encapsulant Film','Back Sheet (KPE, KPK, White)','Solar Inverter (String, Central)','Solar Mounting Structures (Ground, Rooftop)','DC Combiner Boxes','Solar Cable & MC4 Connectors'],
    materials: ['Mono-Crystalline Silicon (≥21% Efficiency)','Poly-Crystalline Silicon','AA6063-T5 Frame Alloy','Tempered Solar Glass (3.2 mm, ARC)','EVA Film (460 nm, 560 nm)','PVDF Back Sheet'],
    certifications: ['IEC 61215','IEC 61730','IS 14286','MNRE Approved','BIS/ISI','IEC 61701 (Salt Mist)','MCS Certified'],
    tolerances: ['±0.5 mm','±1.0 mm','±2.0 mm'],
    surfaceFinishes: ['Anodised (AA6063 Frame)','Clear Anodised','As Rolled (Steel Mounting)','Hot-Dip Galvanised'],
    dimensionTemplate: { showLength: true, showWidth: true, showHeight: false, showOuterDia: false, showInnerDia: false, showWallThickness: true, showWeight: true, heightLabel: 'Module Thickness' },
    sortOrder: 1,
  },

  // ═══════════════════════════ OIL & GAS ════════════════════════════════════

  {
    id: 'oilgas-valves',
    industryId: 'oil-gas',
    name: 'Industrial Valves & Fittings',
    subcategories: ['Gate Valves (API 6D / BS 1414)','Globe Valves (API 600)','Ball Valves (API 6D)','Butterfly Valves (API 609)','Check Valves (API 6D)','Safety Relief Valves (API 526)','Needle Valves','Plug Valves','Choke Valves','Wellhead Christmas Tree Valves (API 6A)','Flanged Fittings (ANSI B16.5)','Buttweld Fittings (ASME B16.9)','Pipe Spools'],
    materials: ['ASTM A216 WCB (Carbon Steel)','ASTM A351 CF8M (SS 316)','ASTM A352 LCB (Low-Temp)','Duplex SS (A995 Grade 4A)','Inconel 625 (High-Corrosion)','Titanium Grade 2 (Offshore)','NACE MR0175 Compliant'],
    certifications: ['API 6A','API 6D','API 598 (Testing)','BS EN 12266','ISO 9001:2015','NACE MR0175','PED 2014/68/EU','IBR (Steam Service)'],
    tolerances: ['±0.1 mm','±0.2 mm','±0.5 mm','ASME B16.34 Class'],
    surfaceFinishes: ['As Cast + Machined','Electro-Polished (SS)','Hard Chrome Plated (Stem)','Nickel Plated','Painted (2-Pack Epoxy)'],
    dimensionTemplate: { showLength: false, showWidth: false, showHeight: true, showOuterDia: true, showInnerDia: true, showWallThickness: true, showWeight: true, heightLabel: 'Face-to-Face (FTF)' },
    sortOrder: 1,
  },

  // ═══════════════════════════ RAILWAY ═════════════════════════════════════

  {
    id: 'rail-wheels-bogies',
    industryId: 'railway',
    name: 'Wheels, Bogies & Axles',
    subcategories: ['Forged Monoblock Wheels (BG/MG)','Wheelsets (Axle + Wheel)','Bogie Frames','Bogie Bolsters','Axle Boxes & Bearings','Buffer & Coupler Components','Coil Springs & Leaf Springs','Brake Beams & Brake Heads','Brake Blocks (Composite & Cast Iron)','Wheel Centres (Spoked)','Solid Axles','Hollow Axles'],
    materials: ['Class B Steel (IS 1030 Gr 280-520W)','Class C Steel (High Strength)','Forged Steel 42CrMo4','EN 47 Spring Steel (IS 3431)','Cast Steel IS 1030','Grey Cast Iron GG25 (Brake Blocks)','SS 316L (Bearing Housings)'],
    certifications: ['RDSO Approved','ISO 9001:2015','AAR M-107','IS 5905 (Forged Wheels)','EN 13262 (Wheels)','IRS Specification','UIC 510-1'],
    tolerances: ['±0.05 mm','±0.1 mm','±0.2 mm','±0.5 mm','±1.0 mm'],
    surfaceFinishes: ['As Forged + Machined','Black Oxide','Phosphated','Painted (Rust Preventive)','Shot Blasted Sa 2.5 + Primer'],
    dimensionTemplate: { showLength: false, showWidth: false, showHeight: false, showOuterDia: true, showInnerDia: true, showWallThickness: false, showWeight: true },
    sortOrder: 1,
  },
  {
    id: 'rail-braking',
    industryId: 'railway',
    name: 'Braking Systems',
    subcategories: ['Cast Iron Brake Blocks (BG/MG)','Composite Brake Blocks (K-Type/LL-Type)','Brake Cylinders','Brake Rigging Components','Disc Brakes (High-Speed Trains)','Brake Callipers','ABDW Distributor Valves','Control Valves','Slack Adjusters','Retainer Valves'],
    materials: ['Grey Cast Iron GG25','Composite Friction Material (K-Type)','SS 316L (Cylinder)','Forged Steel (Rigging)','Aluminium Alloy (Calliper Housing)'],
    certifications: ['RDSO Approved','IS 11145 (Brake Blocks)','EN 14535','ISO 9001:2015','IRS Specification'],
    tolerances: ['±0.1 mm','±0.2 mm','±0.5 mm','±1.0 mm'],
    surfaceFinishes: ['As Cast','Phosphated','Painted','As Machined'],
    dimensionTemplate: { showLength: true, showWidth: true, showHeight: true, showOuterDia: false, showInnerDia: false, showWallThickness: false, showWeight: true },
    sortOrder: 2,
  },

  // ═══════════════════════════ FOOD PROCESSING ══════════════════════════════

  {
    id: 'food-conveyor',
    industryId: 'food-processing',
    name: 'Conveyor & Sorting Systems',
    subcategories: ['Flat Belt Conveyors (SS 316L)','Modular Plastic Belt Conveyors','Screw / Auger Conveyors','Vibratory Feeders & Trays','Bucket Elevators','Spiral Elevators','Checkweighers','Metal Detectors (Inline)','Optical Sorters','Manual Inspection Conveyors','Sanitary Conveyor Frames (FSMA)'],
    materials: ['SS 316L (Product Contact)','SS 304 (Frame)','POM / Acetal (Belt Sliders)','UHMWPE (Guide Rails)','FDA-Grade Polyurethane (Belt)','PP Modular Belt'],
    certifications: ['FSSAI License','3-A Sanitary Standards','ISO 22000','HACCP','CE Marking','FDA Food Contact Materials'],
    tolerances: ['±0.5 mm','±1.0 mm','±2.0 mm'],
    surfaceFinishes: ['Ra 0.8 μm (Product Contact)','Ra 1.6 μm (Non-Contact)','Electro-Polished','Passivated'],
    dimensionTemplate: { showLength: true, showWidth: true, showHeight: true, showOuterDia: false, showInnerDia: false, showWallThickness: false, showWeight: true },
    sortOrder: 1,
  },
];

// ─── MANUFACTURER PRODUCTS ────────────────────────────────────────────────────

export const MANUFACTURER_PRODUCTS: ManufacturerProduct[] = [

  // ── Automobile ───────────────────────────────────────────────────────────

  {
    id: 'prod-auto-piston-al',
    industryId: 'automobile',
    categoryId: 'auto-engine',
    name: 'Aluminium Piston (Hypereutectic)',
    subcategory: 'Pistons & Piston Rings',
    description: 'High-performance hypereutectic aluminium piston for passenger car petrol engines. Skirt coated for friction reduction.',
    grade: 'AA4032 / AA2618 Alloy',
    unit: 'pc',
    priceMin: 350,
    priceMax: 1800,
    leadTimeDays: 14,
    certifications: ['IATF 16949:2016','iCAT Approved'],
    specifications: { bore: '65–105 mm', weight: '280–650 g', topRingGroove: 'Chrome-plated', pinDia: '18–28 mm', compressionHeight: '24–45 mm' },
    sortOrder: 1,
  },
  {
    id: 'prod-auto-crankshaft-forged',
    industryId: 'automobile',
    categoryId: 'auto-engine',
    name: 'Forged Steel Crankshaft (4-Cyl)',
    subcategory: 'Crankshafts',
    description: 'Induction-hardened forged crankshaft for 4-cylinder passenger cars. Nitrided main & pin journals.',
    grade: 'SAE 1045 / EN 19 (42CrMo4)',
    unit: 'pc',
    priceMin: 3500,
    priceMax: 12000,
    leadTimeDays: 21,
    certifications: ['IATF 16949:2016','ARAI Approved'],
    specifications: { stroke: '75–98 mm', mainJournalDia: '48–58 mm', pinJournalDia: '42–52 mm', hardness: '55–60 HRC (Journals)', weight: '8–22 kg' },
    sortOrder: 2,
  },
  {
    id: 'prod-auto-brake-disc',
    industryId: 'automobile',
    categoryId: 'auto-braking',
    name: 'Vented Brake Disc / Rotor',
    subcategory: 'Brake Discs / Rotors',
    description: 'Cast iron vented brake disc for front axle of passenger cars. Balancing tested.',
    grade: 'GG20 / GG25 Grey Cast Iron',
    unit: 'pc',
    priceMin: 600,
    priceMax: 3500,
    leadTimeDays: 10,
    certifications: ['IATF 16949:2016','ECE R-90','AIS-141'],
    specifications: { outerDia: '239–340 mm', internalDia: '65–130 mm', thickness: '22–30 mm', ventedHeight: '18–22 mm', coatingOption: 'Rust preventive E-Coat' },
    sortOrder: 3,
  },
  {
    id: 'prod-auto-shock-absorber',
    industryId: 'automobile',
    categoryId: 'auto-suspension',
    name: 'Hydraulic Shock Absorber (Twin-Tube)',
    subcategory: 'Shock Absorbers & Struts',
    description: 'Twin-tube hydraulic shock absorber for passenger car front/rear suspension.',
    grade: 'Carbon Steel Tube / Chromium Rod',
    unit: 'pc',
    priceMin: 800,
    priceMax: 4500,
    leadTimeDays: 14,
    certifications: ['IATF 16949:2016','AIS-142'],
    specifications: { strokeLength: '80–160 mm', closedLength: '240–380 mm', pistonDia: '28–46 mm', rodDia: '14–22 mm', maxForce: '800–2200 N' },
    sortOrder: 4,
  },
  {
    id: 'prod-auto-alternator',
    industryId: 'automobile',
    categoryId: 'auto-electrical',
    name: 'Vehicular Alternator 12V / 14V',
    subcategory: 'Alternators',
    description: 'Compact 12V/14V alternator for passenger car applications. OEM-equivalent fitment.',
    grade: 'IS 9001-certified Core',
    unit: 'pc',
    priceMin: 2200,
    priceMax: 8500,
    leadTimeDays: 7,
    certifications: ['IATF 16949:2016','AIS-004','ISO 9001:2015'],
    specifications: { voltage: '12 V / 14 V', current: '60–150 A', rpm: '2000–8000', weight: '3.5–6.5 kg', beltType: '6PK / Poly V' },
    sortOrder: 5,
  },

  // ── Aerospace ────────────────────────────────────────────────────────────

  {
    id: 'prod-aero-frame-panel',
    industryId: 'aerospace',
    categoryId: 'aero-structures',
    name: 'CNC-Machined Fuselage Frame (Aluminium)',
    subcategory: 'Fuselage Frames & Stringers',
    description: 'High-precision 5-axis CNC-machined fuselage frame section from aluminium alloy billet.',
    grade: 'AA7075-T7351',
    unit: 'pc',
    priceMin: 45000,
    priceMax: 180000,
    leadTimeDays: 45,
    certifications: ['AS9100D','NADCAP (Heat Treatment)','DGCA Approved'],
    specifications: { length: '800–2500 mm', weight: '3.5–22 kg', tolerance: '±0.01 mm (Critical Holes)', material: 'Billet AA7075-T7351', surfaceFinish: 'Alodine 1200 + Primer' },
    sortOrder: 1,
  },
  {
    id: 'prod-aero-cfrp-panel',
    industryId: 'aerospace',
    categoryId: 'aero-structures',
    name: 'CFRP Fuselage Skin Panel (Autoclave)',
    subcategory: 'Fuselage Skin Panels',
    description: 'Autoclave-cured carbon fibre skin panel from aerospace-grade prepreg. NDT inspected.',
    grade: 'Toray T800S-12K / HexPly M21',
    unit: 'pc',
    priceMin: 120000,
    priceMax: 650000,
    leadTimeDays: 60,
    certifications: ['AS9100D','NADCAP (Composites)','DGCA','FAA PMA'],
    specifications: { thickness: '2.5–12 mm', plies: '8–48', areal_weight: '165 g/m²', tensile_strength: '2800 MPa (0°)', compressive_strength: '1600 MPa', NDT: 'UT + Flash Thermography' },
    sortOrder: 2,
  },

  // ── Defence ──────────────────────────────────────────────────────────────

  {
    id: 'prod-def-armour-plate',
    industryId: 'defence',
    categoryId: 'def-armour',
    name: 'High Hardness Armour Steel Plate (HHS 500)',
    subcategory: 'High Hardness Steel (HHS) Plates',
    description: 'Rolled high-hardness steel plate for ballistic protection of military vehicles.',
    grade: 'HHS 500 / Armox 500T equiv.',
    unit: 'kg',
    priceMin: 280,
    priceMax: 450,
    leadTimeDays: 30,
    certifications: ['DRDO Approved','MIL-A-12560','SQAE-A'],
    specifications: { thickness: '4–40 mm', hardness: '480–530 HB', yieldStrength: '≥1250 MPa', tensileStrength: '1450–1650 MPa', impactKCV: '≥25 J at -40°C' },
    sortOrder: 1,
  },
  {
    id: 'prod-def-ceramic-tile',
    industryId: 'defence',
    categoryId: 'def-armour',
    name: 'Silicon Carbide Ceramic Armour Tile',
    subcategory: 'Ceramic Tile Arrays (Al2O3, SiC, B4C)',
    description: 'Hot-pressed SiC ceramic tile for composite armour systems against AP threats.',
    grade: 'SiC ≥98% (Hot-Pressed)',
    unit: 'pc',
    priceMin: 1200,
    priceMax: 8500,
    leadTimeDays: 45,
    certifications: ['DRDO Approved','NIJ 0101.06','SQAE-A'],
    specifications: { size: '100×100 mm / 150×150 mm / Custom', thickness: '6–20 mm', density: '≥3.15 g/cm³', hardness: '≥2300 HV', flexuralStrength: '≥400 MPa' },
    sortOrder: 2,
  },

  // ── Space ────────────────────────────────────────────────────────────────

  {
    id: 'prod-space-cfrp-panel',
    industryId: 'space',
    categoryId: 'space-structures',
    name: 'CFRP Honeycomb Sandwich Panel',
    subcategory: 'Primary Structure Panels (CFRP)',
    description: 'Ultra-lightweight CFRP honeycomb sandwich panel for satellite primary structures.',
    grade: 'M55J / T1000G Prepreg + Al Honeycomb',
    unit: 'pc',
    priceMin: 85000,
    priceMax: 450000,
    leadTimeDays: 90,
    certifications: ['AS9100D','ISRO Empanelled','ECSS-Q-ST-70'],
    specifications: { size: 'Up to 2000×1500 mm', faceSheetThickness: '0.5–3 mm', coreHeight: '10–50 mm', flatness: '±0.2 mm/m', specificStiffness: '≥15 GPa·cm³/g' },
    sortOrder: 1,
  },

  // ── Pharmaceutical ───────────────────────────────────────────────────────

  {
    id: 'prod-pharma-tablet-press',
    industryId: 'pharmaceutical',
    categoryId: 'pharma-solid-dose',
    name: 'Rotary Tablet Press (36-Station)',
    subcategory: 'Rotary Tablet Press (16–72 Stations)',
    description: 'Double-sided rotary tablet press, 36 stations, cGMP design with automated lubrication.',
    grade: 'SS 316L (Product Contact), SS 304 (Frame)',
    unit: 'pc',
    priceMin: 2500000,
    priceMax: 7000000,
    leadTimeDays: 120,
    certifications: ['WHO-GMP','USFDA 21 CFR Part 211','cGMP','ISO 9001:2015'],
    specifications: { stations: 36, maxPressForce: '100 kN', maxOutputRate: '252000 tabs/hr', toolingStd: 'EU-B / TSM-B', maxTabletDia: '25 mm', dustExtractionPort: 'Yes' },
    sortOrder: 1,
  },
  {
    id: 'prod-pharma-fbd',
    industryId: 'pharmaceutical',
    categoryId: 'pharma-solid-dose',
    name: 'Fluid Bed Dryer / Granulator (150 kg)',
    subcategory: 'Granulation Equipment (High-Shear, Fluid Bed)',
    description: 'Top-spray fluid bed granulator & dryer, 150 kg batch capacity, GMP-compliant design.',
    grade: 'SS 316L (Bowl, Bag-Filter Housing)',
    unit: 'pc',
    priceMin: 1800000,
    priceMax: 5000000,
    leadTimeDays: 90,
    certifications: ['WHO-GMP','USFDA 21 CFR Part 211','ATEX Zone 1','cGMP'],
    specifications: { batchCapacity: '150 kg', inletAirTemp: 'Ambient to 100°C', exhaustFilter: 'HEPA H14', spray_system: 'Top-spray peristaltic', airflow: '6000–9000 m³/hr' },
    sortOrder: 2,
  },

  // ── Medical Devices ──────────────────────────────────────────────────────

  {
    id: 'prod-med-scissors',
    industryId: 'medical-devices',
    categoryId: 'med-surgical',
    name: 'Mayo Scissors (Straight & Curved)',
    subcategory: 'Scissors (Mayo, Metzenbaum, Iris)',
    description: 'Stainless steel Mayo scissors with tungsten carbide inserts for extended cutting life.',
    grade: 'SS 17-4PH / TC Inserts',
    unit: 'pc',
    priceMin: 850,
    priceMax: 3500,
    leadTimeDays: 14,
    certifications: ['ISO 13485:2016','CE Marking (MDR)','CDSCO Class B','IS 7604'],
    specifications: { length: '140 mm / 170 mm', bladeType: 'Blunt-Blunt / Sharp-Blunt', finish: 'Satin (Ra ≤ 0.8 μm)', sterilisationCompatibility: 'Autoclave (134°C)', TC_inserts: 'Available' },
    sortOrder: 1,
  },
  {
    id: 'prod-med-bone-screw',
    industryId: 'medical-devices',
    categoryId: 'med-implants',
    name: 'Cortical Bone Screw (LCP System)',
    subcategory: 'Cortical Bone Screws (LCP System)',
    description: 'Locking cortical bone screw for LCP plating system. Electro-polished Ti-6Al-4V ELI.',
    grade: 'Ti-6Al-4V ELI (ASTM F136)',
    unit: 'pc',
    priceMin: 650,
    priceMax: 2800,
    leadTimeDays: 21,
    certifications: ['ISO 13485:2016','CE Marking (MDR 2017/745)','CDSCO Class C','ASTM F1472'],
    specifications: { diameter: '2.4 mm / 2.7 mm / 3.5 mm / 4.5 mm', length: '10–100 mm (10 mm steps)', thread: 'Self-tapping', head: 'Conical locking (LCP compatible)', packaging: 'EO sterile blister' },
    sortOrder: 2,
  },

  // ── Chemical Processing ──────────────────────────────────────────────────

  {
    id: 'prod-chem-reactor-ss',
    industryId: 'chemical',
    categoryId: 'chem-pressure-vessel',
    name: 'Jacketed & Agitated Reactor (SS 316L)',
    subcategory: 'Jacketed Reactors (SS 316L / MS)',
    description: 'ASME VIII Div 1 jacketed reactor with PTFE-lined agitator, CIP/SIP ports, and manway.',
    grade: 'SS 316L (Wetted) / SS 304 (Jacket)',
    unit: 'pc',
    priceMin: 800000,
    priceMax: 8000000,
    leadTimeDays: 90,
    certifications: ['ASME U Stamp','IBR','ISO 9001:2015','ISO 3834-2','PED'],
    specifications: { volume: '500 L to 50,000 L', design_pressure: '6 bar (shell) / 4 bar (jacket)', design_temp: '200°C / 150°C', agitator: 'Anchor / Paddle / Turbine', nozzles: 'As per P&ID', hydrotest: '1.5× MAWP' },
    sortOrder: 1,
  },

  // ── Polymer & Rubber ─────────────────────────────────────────────────────

  {
    id: 'prod-poly-oring',
    industryId: 'polymer',
    categoryId: 'poly-moulding',
    name: 'O-Ring (NBR / EPDM / FKM)',
    subcategory: 'O-Rings (AS 568, IS 11149)',
    description: 'Precision moulded O-rings to AS 568A and IS 11149 dimensions. All standard sizes in-stock.',
    grade: 'NBR 70A / EPDM 70A / FKM 75A',
    unit: 'pc',
    priceMin: 2,
    priceMax: 850,
    leadTimeDays: 5,
    certifications: ['ISO 9001:2015','IATF 16949:2016','RoHS','REACH'],
    specifications: { innerDiaRange: '1 mm – 800 mm', crossSection: '1.0 / 1.5 / 1.78 / 2.62 / 3.53 / 5.33 / 6.99 mm', hardness: '60–90 Shore A', tempRange: 'NBR: -40 to 120°C / FKM: -20 to 200°C', pressureRating: '≤40 MPa dynamic' },
    sortOrder: 1,
  },
  {
    id: 'prod-poly-cv-boot',
    industryId: 'polymer',
    categoryId: 'poly-moulding',
    name: 'CV Joint Boot (Injection Moulded)',
    subcategory: 'Boots & Bellows (CV Joint, Rack & Pinion)',
    description: 'Thermoplastic elastomer CV joint boot for passenger car driveshaft. Fits OEM specifications.',
    grade: 'TPE (Hytrel / Arnitel) 55A–70A',
    unit: 'pc',
    priceMin: 120,
    priceMax: 650,
    leadTimeDays: 10,
    certifications: ['IATF 16949:2016','ISO 9001:2015','REACH'],
    specifications: { largeDia: '95–130 mm', smallDia: '20–35 mm', height: '85–120 mm', tempRange: '-40°C to +150°C', grease_compatibility: 'All CV greases' },
    sortOrder: 2,
  },

  // ── Construction ─────────────────────────────────────────────────────────

  {
    id: 'prod-const-roof-truss',
    industryId: 'construction',
    categoryId: 'const-structural',
    name: 'Pre-Fabricated Steel Roof Truss',
    subcategory: 'Roof Trusses',
    description: 'Shop-fabricated Fink / Pratt roof truss in IS 2062 steel. Shot-blasted and primed.',
    grade: 'IS 2062 E250 Grade B',
    unit: 'MT',
    priceMin: 75000,
    priceMax: 95000,
    leadTimeDays: 21,
    certifications: ['BIS/ISI (IS 2062)','ISO 9001:2015','IS 800 Design'],
    specifications: { span: '6–36 m', pitch: '10°–30°', purlins: 'Z150/Z200 or MS angle', coating: 'Shot Blast Sa 2.5 + Zinc Primer + Finish Coat', connection: 'Bolted or Welded node plates' },
    sortOrder: 1,
  },

  // ── Energy ───────────────────────────────────────────────────────────────

  {
    id: 'prod-energy-solar-module',
    industryId: 'energy-power',
    categoryId: 'energy-solar',
    name: 'Bifacial Solar Module (540 Wp)',
    subcategory: 'Bifacial Solar Modules (72-Cell, 144 Half-Cell)',
    description: '144 half-cell bifacial solar module with glass-glass construction. IEC 61215 certified.',
    grade: 'Mono PERC Bifacial N-Type TOPCon',
    unit: 'pc',
    priceMin: 14000,
    priceMax: 19000,
    leadTimeDays: 14,
    certifications: ['IEC 61215','IEC 61730','MNRE Approved','BIS IS 14286','IEC 61701 (Salt Mist)'],
    specifications: { power: '540–545 Wp', efficiency: '21.2–21.8%', voc: '49.8 V', isc: '13.9 A', tempCoeff: '-0.35%/°C (Pmax)', cells: '144 half-cut (6×24)', bifacialGain: '≥10%' },
    sortOrder: 1,
  },

  // ── Oil & Gas ────────────────────────────────────────────────────────────

  {
    id: 'prod-oilgas-ball-valve',
    industryId: 'oil-gas',
    categoryId: 'oilgas-valves',
    name: 'Full-Bore Ball Valve (API 6D)',
    subcategory: 'Ball Valves (API 6D)',
    description: 'Trunnion-mounted full-bore ball valve in carbon steel body. Fire-safe design API 607.',
    grade: 'ASTM A216 WCB Body / SS 316 Trim',
    unit: 'pc',
    priceMin: 12000,
    priceMax: 450000,
    leadTimeDays: 30,
    certifications: ['API 6D','API 598','ISO 9001:2015','NACE MR0175','PED 2014/68/EU'],
    specifications: { bore: 'Full-Bore', size: '½"–24" (DN15–DN600)', classRating: 'ASME 150 / 300 / 600 / 900', endConnection: 'RF Flanged (ASME B16.5)', operationType: 'Gear Operated / Motorised Actuator', testStd: 'API 598' },
    sortOrder: 1,
  },

  // ── Food Processing ──────────────────────────────────────────────────────

  {
    id: 'prod-food-belt-conveyor',
    industryId: 'food-processing',
    categoryId: 'food-conveyor',
    name: 'Flat Belt Conveyor (SS 316L, FDA Grade)',
    subcategory: 'Flat Belt Conveyors (SS 316L)',
    description: 'Sanitary design flat belt conveyor for food processing lines. CIP-washable.',
    grade: 'SS 316L Frame / FDA Grade PU Belt',
    unit: 'pc',
    priceMin: 85000,
    priceMax: 650000,
    leadTimeDays: 30,
    certifications: ['FSSAI License','3-A Sanitary Standard 33','ISO 22000','CE Marking','FDA Food Contact'],
    specifications: { beltWidth: '300–1200 mm', length: '1000–8000 mm', speed: '5–60 m/min', driveMotor: '0.37–2.2 kW IE3', loadCapacity: '50–500 kg/m', cleaningDesign: 'CIP spray bars + quick-release rollers' },
    sortOrder: 1,
  },

  // ── Railway ──────────────────────────────────────────────────────────────

  {
    id: 'prod-rail-wheel',
    industryId: 'railway',
    categoryId: 'rail-wheels-bogies',
    name: 'Forged Monoblock Railway Wheel',
    subcategory: 'Wheels',
    description: 'Forged and machined monoblock wheel for broad gauge passenger coaches per RDSO specification.',
    grade: 'Class B Steel (IS 1030 Gr 280-520W)',
    unit: 'pc',
    priceMin: 25000,
    priceMax: 65000,
    leadTimeDays: 45,
    certifications: ['RDSO Approved','IS 5905 (Forged Wheels)','ISO 9001:2015','AAR M-107'],
    specifications: { nominalDia: '915 mm (BG)', rimWidth: '135 mm', webThickness: '22 mm', boreSize: '166 mm', hardness: '255–321 HB (Rim)', balancing: 'Static balanced' },
    sortOrder: 1,
  },
];

// ─── ANONYMISED MATCH PROFILE TEMPLATES ──────────────────────────────────────
// Used by the UI to generate fake-but-realistic anonymised supplier cards
// when displaying search results. Never expose real company names here.

export interface AnonymisedMatchProfile {
  cityOptions: string[];
  deliveryOptions: string[];
  moqOptions: string[];
  certBadges: string[];
  capacityOptions: string[];
}

export const INDUSTRY_MATCH_PROFILES: Record<string, AnonymisedMatchProfile> = {
  automobile: {
    cityOptions: ['Pune','Chennai','Gurugram','Bengaluru','Ahmedabad','Rajkot','Coimbatore','Ludhiana','Hyderabad','Nashik','Faridabad','Jamshedpur'],
    deliveryOptions: ['5–8 business days','7–10 business days','10–14 business days','3–5 business days','12–16 business days'],
    moqOptions: ['10 pcs','25 pcs','50 pcs','5 pcs','1 set','100 pcs','500 pcs'],
    certBadges: ['IATF 16949','ISO 9001','iCAT','AIS','ARAI'],
    capacityOptions: ['10,000 pcs/month','50,000 pcs/month','25,000 pcs/month','5 MT/month','200,000 pcs/month'],
  },
  aerospace: {
    cityOptions: ['Bengaluru','Hyderabad','Pune','Chennai','Mumbai','Delhi','Nagpur','Coimbatore'],
    deliveryOptions: ['14–21 days','21–30 days','30–45 days','45–60 days'],
    moqOptions: ['1 pc','5 pcs','10 pcs','1 set','Per drawing'],
    certBadges: ['AS9100D','NADCAP','DGCA','ISO 9001','FAA PMA'],
    capacityOptions: ['100 components/month','500 components/month','50 assemblies/month','Per contract'],
  },
  defence: {
    cityOptions: ['Pune','Hyderabad','Bengaluru','Delhi','Kanpur','Jabalpur','Dehradun','Chennai'],
    deliveryOptions: ['21–30 days','30–45 days','45–60 days','60–90 days'],
    moqOptions: ['10 pcs','50 pcs','100 pcs','1 MT','Per contract'],
    certBadges: ['DRDO Approved','SQAE','MIL-SPEC','ISO 9001','OFB Approved'],
    capacityOptions: ['100 units/month','500 units/month','5 MT/month','Per contract'],
  },
  space: {
    cityOptions: ['Bengaluru','Hyderabad','Thiruvananthapuram','Pune','Chennai','Ahmedabad'],
    deliveryOptions: ['30–45 days','45–60 days','60–90 days','90–120 days'],
    moqOptions: ['1 pc','Per drawing','5 pcs','Flight unit + 2 engineering models'],
    certBadges: ['AS9100D','ISRO Empanelled','ECSS','NADCAP'],
    capacityOptions: ['10 flight units/year','50 components/month','Per contract'],
  },
  electronics: {
    cityOptions: ['Bengaluru','Noida','Pune','Hyderabad','Chennai','Mumbai','Delhi','Surat'],
    deliveryOptions: ['5–7 days','7–10 days','10–14 days','2–4 days'],
    moqOptions: ['100 pcs','500 pcs','1000 pcs','50 pcs','5000 pcs','Per assembly BOM'],
    certBadges: ['IPC-A-610 Class 3','ISO 9001','RoHS','UL Listed','CE Marking'],
    capacityOptions: ['10,000 boards/month','50,000 boards/month','500,000 components/month'],
  },
  pharmaceutical: {
    cityOptions: ['Mumbai','Ahmedabad','Vadodara','Hyderabad','Bengaluru','Chennai','Pune','Delhi'],
    deliveryOptions: ['14–21 days','21–30 days','30–45 days','60–90 days'],
    moqOptions: ['1 unit','3 units','Per order','Minimum 1 line'],
    certBadges: ['WHO-GMP','USFDA 21 CFR','EU GMP','CDSCO','cGMP'],
    capacityOptions: ['2 machines/month','5 machines/month','Per project'],
  },
  'medical-devices': {
    cityOptions: ['Bengaluru','Mumbai','Chennai','Delhi','Pune','Hyderabad','Ahmedabad','Coimbatore'],
    deliveryOptions: ['7–10 days','10–14 days','14–21 days','21–30 days'],
    moqOptions: ['10 pcs','50 pcs','100 pcs','1000 pcs','Per lot'],
    certBadges: ['ISO 13485','CE Marking (MDR)','CDSCO','BIS','USFDA 510(k)'],
    capacityOptions: ['10,000 instruments/month','100,000 pcs/month','50,000 implants/year'],
  },
  construction: {
    cityOptions: ['Mumbai','Delhi','Chennai','Hyderabad','Pune','Kolkata','Bengaluru','Ahmedabad','Raipur','Jharsuguda'],
    deliveryOptions: ['7–10 days','10–14 days','14–21 days','21–30 days','Door delivery India-wide'],
    moqOptions: ['5 MT','10 MT','50 MT','100 MT','As per order'],
    certBadges: ['BIS/ISI (IS 2062)','ISO 9001','CPWD Approved','IS 800'],
    capacityOptions: ['500 MT/month','2000 MT/month','5000 MT/month'],
  },
  'energy-power': {
    cityOptions: ['Surat','Vadodara','Ahmedabad','Bengaluru','Pune','Chennai','Hyderabad','Rajkot'],
    deliveryOptions: ['7–14 days','14–21 days','21–30 days'],
    moqOptions: ['10 modules','50 modules','100 modules','1 MW lot','Per order'],
    certBadges: ['IEC 61215','IEC 61730','MNRE Approved','BIS','BEE Star'],
    capacityOptions: ['1 MW/month','5 MW/month','100 kW/month'],
  },
  chemical: {
    cityOptions: ['Mumbai','Pune','Ahmedabad','Vadodara','Chennai','Hyderabad','Rajkot','Coimbatore'],
    deliveryOptions: ['30–45 days','45–60 days','60–90 days','90–120 days'],
    moqOptions: ['1 unit','Per drawing','3 vessels','Per contract'],
    certBadges: ['ASME U Stamp','IBR','PED','ISO 9001','NACE MR0175'],
    capacityOptions: ['5 vessels/month','20 vessels/month','Per project'],
  },
  polymer: {
    cityOptions: ['Rajkot','Ahmedabad','Pune','Mumbai','Chennai','Bengaluru','Coimbatore','Ludhiana'],
    deliveryOptions: ['5–7 days','7–10 days','10–14 days','14–21 days'],
    moqOptions: ['1000 pcs','5000 pcs','10,000 pcs','100 kg','500 kg'],
    certBadges: ['IATF 16949','ISO 9001','RoHS','REACH','FDA 21 CFR'],
    capacityOptions: ['500,000 pcs/month','2,000,000 pcs/month','10 MT/month'],
  },
  'oil-gas': {
    cityOptions: ['Mumbai','Surat','Vadodara','Chennai','Kolkata','Ahmedabad','Rajkot','Coimbatore'],
    deliveryOptions: ['21–30 days','30–45 days','45–60 days','60–90 days'],
    moqOptions: ['1 pc','10 pcs','50 pcs','Per contract','Per lot'],
    certBadges: ['API 6D','API 6A','ASME','ISO 9001','NACE MR0175'],
    capacityOptions: ['100 valves/month','500 valves/month','Per project'],
  },
  'food-processing': {
    cityOptions: ['Pune','Mumbai','Ahmedabad','Coimbatore','Bengaluru','Chennai','Ludhiana','Delhi'],
    deliveryOptions: ['14–21 days','21–30 days','30–45 days'],
    moqOptions: ['1 unit','Per line','3 conveyors','Per project'],
    certBadges: ['FSSAI','3-A Sanitary','ISO 22000','HACCP','CE Marking'],
    capacityOptions: ['5 lines/month','20 machines/month','Per project'],
  },
  railway: {
    cityOptions: ['Pune','Jamshedpur','Bhopal','Bangalore','Kolkata','Chennai','Delhi','Nagpur'],
    deliveryOptions: ['30–45 days','45–60 days','60–90 days'],
    moqOptions: ['10 pcs','50 pcs','100 pcs','1 bogie set','Per lot'],
    certBadges: ['RDSO Approved','ISO 9001','AAR M-1003','EN 15085','BIS'],
    capacityOptions: ['500 wheels/month','2000 castings/month','Per contract'],
  },
};

// ─── HEADER DROPDOWN CONFIG ───────────────────────────────────────────────────
// Exactly what the Header component needs to render the Manufacturers dropdown.

export interface HeaderManufacturerItem {
  id: string;
  name: string;
  slug: string;
  icon: string;
  emoji: string;
  routePath: string;
}

export const HEADER_MANUFACTURER_ITEMS: HeaderManufacturerItem[] =
  MANUFACTURER_INDUSTRIES.map(({ id, name, slug, icon, emoji, routePath }) => ({
    id, name, slug, icon, emoji, routePath,
  }));

// ─── SPEC FORM CONFIG ─────────────────────────────────────────────────────────
// Drives the left-panel spec + dimension form on each manufacturer landing page.

export interface SpecFormConfig {
  industryId: string;
  orderTypes: { value: string; label: string }[];
  leadTimeOptions: string[];
  budgetPresets: string[];
}

export const SPEC_FORM_CONFIG: SpecFormConfig = {
  industryId: 'all',
  orderTypes: [
    { value: 'sample', label: 'Sample / Proto (1–10 pcs)' },
    { value: 'bulk', label: 'Bulk Production' },
    { value: 'both', label: 'Sample + Bulk' },
    { value: 'annual-contract', label: 'Annual Supply Contract' },
  ],
  leadTimeOptions: [
    'Urgent (< 7 days)', 'Standard (7–14 days)', 'Normal (14–30 days)',
    'Flexible (30–60 days)', 'Project Schedule',
  ],
  budgetPresets: [
    'Under ₹10,000', '₹10,000–₹50,000', '₹50,000–₹2,00,000',
    '₹2,00,000–₹10,00,000', '₹10,00,000–₹1 Cr', 'Above ₹1 Cr', 'Open Budget',
  ],
};

// ─── Convenience Helpers ──────────────────────────────────────────────────────

export function getIndustryById(id: string): ManufacturerIndustry | undefined {
  return MANUFACTURER_INDUSTRIES.find((i) => i.id === id);
}

export function getIndustryBySlug(slug: string): ManufacturerIndustry | undefined {
  return MANUFACTURER_INDUSTRIES.find((i) => i.slug === slug);
}

export function getCategoriesByIndustry(industryId: string): ManufacturerCategory[] {
  return MANUFACTURER_CATEGORIES.filter((c) => c.industryId === industryId);
}

export function getCategoryById(id: string): ManufacturerCategory | undefined {
  return MANUFACTURER_CATEGORIES.find((c) => c.id === id);
}

export function getProductsByIndustry(industryId: string): ManufacturerProduct[] {
  return MANUFACTURER_PRODUCTS.filter((p) => p.industryId === industryId);
}

export function getProductsByCategory(categoryId: string): ManufacturerProduct[] {
  return MANUFACTURER_PRODUCTS.filter((p) => p.categoryId === categoryId);
}

export function getMatchProfile(industryId: string): AnonymisedMatchProfile {
  return INDUSTRY_MATCH_PROFILES[industryId] ?? INDUSTRY_MATCH_PROFILES['automobile'];
}
