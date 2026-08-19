/**
 * Comprehensive agronomy encyclopedia for plant disease classification.
 * Maps raw model output labels to enriched crop diagnosis and treatment guides.
 */

const REMEDIES_DATABASE = {
  "Cherry___Powdery_mildew": {
    crop: "Cherry",
    condition: "Powdery Mildew",
    isHealthy: false,
    severity: "Moderate to High",
    pathogen: "Podosphaera clandestina (Fungus)",
    description: "Powdery mildew appears as white, talcum-powder-like fungal patches on leaves, shoots, and young fruit. Infected leaves curl upward, blister, and may drop prematurely, reducing tree vigor.",
    symptoms: [
      "White powdery coating on upper and lower leaf surfaces",
      "Upward curling and distortion of young leaves",
      "Stunted growth of new shoots",
      "Premature leaf drop and scarred fruit"
    ],
    organicTreatments: [
      "Apply potassium bicarbonate or neem oil spray every 7-10 days.",
      "Spray wettable sulfur early in the season before temperatures exceed 30°C (85°F).",
      "Apply bio-fungicides containing Bacillus subtilis or Trichoderma harzianum."
    ],
    chemicalTreatments: [
      "Use myclobutanil or tebuconazole fungicides at petal fall.",
      "Apply strobilurin fungicides (e.g., trifloxystrobin) alternately to prevent fungal resistance."
    ],
    prevention: [
      "Prune dense foliage to ensure optimal air circulation and sunlight penetration.",
      "Avoid overhead irrigation; keep foliage dry during evening hours.",
      "Promptly collect and destroy infected fallen leaves."
    ]
  },

  "Cherry___healthy": {
    crop: "Cherry",
    condition: "Healthy",
    isHealthy: true,
    severity: "None",
    pathogen: "None",
    description: "The cherry leaves show uniform green pigmentation, sturdy cell structure, and no visible lesions, fungal growth, or pest damage.",
    symptoms: [
      "Vibrant green leaf coloration",
      "Clean margins with no chlorosis or necrosis",
      "Strong foliage structure and optimal turgidity"
    ],
    organicTreatments: [
      "Maintain regular organic compost tea or seaweed extract feeding for robust immune health."
    ],
    chemicalTreatments: [
      "No chemical intervention needed."
    ],
    prevention: [
      "Maintain standard orchard sanitation and balanced N-P-K fertilization.",
      "Conduct regular scouting for early aphid or fungal detection."
    ]
  },

  "Peach___Bacterial_spot": {
    crop: "Peach",
    condition: "Bacterial Spot",
    isHealthy: false,
    severity: "High",
    pathogen: "Xanthomonas arboricola pv. pruni (Bacterium)",
    description: "Bacterial spot causes water-soaked, angular reddish-brown to purple spots on leaves that turn necrotic and drop out, creating a 'shot-hole' appearance.",
    symptoms: [
      "Small, angular, dark lesions on leaves bounded by leaf veins",
      "Shot-hole effect where dead tissue falls out leaving ragged holes",
      "Yellowing (chlorosis) around infected leaf areas and premature defoliation",
      "Sunken, crater-like lesions on peach fruit"
    ],
    organicTreatments: [
      "Apply fixed copper sprays (copper hydroxide) during dormancy and early bloom.",
      "Use oxytetracycline or plant extract bio-bactericides where organically certified."
    ],
    chemicalTreatments: [
      "Rotate copper-based bactericides with oxytetracycline sprays starting at petal fall through shuck split.",
      "Apply zinc sulfate + hydrated lime spray mixtures as a protective barrier."
    ],
    prevention: [
      "Plant resistant peach cultivars in windy or sandy regions.",
      "Maintain windbreaks around orchards to reduce sandblasting and microscopic leaf abrasions.",
      "Avoid excessive nitrogen fertilization which produces excessively succulent, vulnerable growth."
    ]
  },

  "Peach___healthy": {
    crop: "Peach",
    condition: "Healthy",
    isHealthy: true,
    severity: "None",
    pathogen: "None",
    description: "The peach foliage shows healthy elongated blade structure, uniform coloration, and complete absence of bacterial or fungal leaf spots.",
    symptoms: [
      "Smooth, glossy green leaf surfaces",
      "Intact leaf lamina without shot-holes or yellow halos",
      "Normal shoot elongation"
    ],
    organicTreatments: [
      "Foliar spray with balanced micronutrients (Zinc, Boron, Iron) to support fruit set."
    ],
    chemicalTreatments: [
      "No chemical treatment required."
    ],
    prevention: [
      "Ensure proper drainage in the root zone.",
      "Dormant copper sprays in late autumn to prevent overwintering bacterial colonies."
    ]
  },

  "Pepper__bell___Bacterial_spot": {
    crop: "Bell Pepper",
    condition: "Bacterial Spot",
    isHealthy: false,
    severity: "High",
    pathogen: "Xanthomonas campestris pv. vesicatoria (Bacterium)",
    description: "Bacterial spot on bell peppers starts as small, water-soaked, circular-to-irregular dark brown spots on leaves. Severely diseased foliage turns yellow and drops, exposing developing peppers to sunscald.",
    symptoms: [
      "Water-soaked circular or irregular brown spots (1-3mm) with yellow halos",
      "Leaf curling, generalized yellowing, and severe defoliation",
      "Raised, rough, scab-like spots on bell pepper fruits",
      "Loss of protective canopy resulting in sunscald damage"
    ],
    organicTreatments: [
      "Apply copper octanoate (copper soap) or liquid copper bactericide every 7-14 days.",
      "Spray bio-control agents such as Bacillus amyloliquefaciens."
    ],
    chemicalTreatments: [
      "Apply tank-mixes of copper hydroxide combined with mancozeb to increase bactericidal efficacy.",
      "Apply acibenzolar-S-methyl (systemic acquired resistance activator)."
    ],
    prevention: [
      "Use certified disease-free, hot-water-treated pepper seeds.",
      "Enforce a 2-3 year crop rotation away from solanaceous plants (tomatoes, peppers, eggplants).",
      "Sterilize pruning shears and avoid handling plants when foliage is wet."
    ]
  },

  "Pepper__bell___healthy": {
    crop: "Bell Pepper",
    condition: "Healthy",
    isHealthy: true,
    severity: "None",
    pathogen: "None",
    description: "The bell pepper plant leaf exhibits healthy dark green color, crisp texture, and clear venation with no signs of bacterial or viral infection.",
    symptoms: [
      "Lush, deep-green leaf color",
      "Even leaf expansion with no mottling or mosaic patterns",
      "Vigorous node development"
    ],
    organicTreatments: [
      "Apply organic fish fertilizer or kelp meal to stimulate root expansion and flowering."
    ],
    chemicalTreatments: [
      "No chemical action required."
    ],
    prevention: [
      "Maintain consistent drip irrigation to avoid moisture fluctuations.",
      "Mulch soil around plants to prevent soil-splash pathogens."
    ]
  },

  "Strawberry___Leaf_scorch": {
    crop: "Strawberry",
    condition: "Leaf Scorch",
    isHealthy: false,
    severity: "Moderate to High",
    pathogen: "Diplocarpon earlianum (Fungus)",
    description: "Leaf scorch produces numerous small, dark purple-to-brown spots on upper leaf surfaces. As the spots enlarge and coalesce, the entire leaf margins appear burned or 'scorched', eventually withering.",
    symptoms: [
      "Numerous irregular, small purple blotches on leaf surfaces",
      "Centers of spots do not turn white (distinguishing it from common leaf spot)",
      "Edges of leaves curl upward and turn brown/scorched",
      "Infected flower petals and calyxes turn brown and die prematurely"
    ],
    organicTreatments: [
      "Apply liquid copper or sulfur-based organic fungicides at first sign of purple spotting.",
      "Spray neem oil extracts or compost tea to inhibit fungal spore development."
    ],
    chemicalTreatments: [
      "Apply strobilurin (e.g., pyraclostrobin) or captan fungicides during early spring emergence.",
      "Use fenhexamid or thiophanate-methyl when symptoms first appear on runner plants."
    ],
    prevention: [
      "Plant certified disease-free, high-vigor strawberry runners.",
      "Renovate strawberry beds after harvest by mowing and removing old foliage.",
      "Use drip tape irrigation rather than overhead sprinklers to minimize leaf wetness duration."
    ]
  },

  "Strawberry___healthy": {
    crop: "Strawberry",
    condition: "Healthy",
    isHealthy: true,
    severity: "None",
    pathogen: "None",
    description: "The strawberry leaf shows healthy trifoliate leaves with vibrant green coloration, sharp serrated margins, and no fungal purpling or leaf scorch.",
    symptoms: [
      "Deep green trifoliate leaves with clean serrated margins",
      "Sturdy petioles and lush crown growth",
      "No discoloration or brown marginal necrosis"
    ],
    organicTreatments: [
      "Top-dress with well-rotted compost or bone meal before the flowering cycle."
    ],
    chemicalTreatments: [
      "No chemical treatment required."
    ],
    prevention: [
      "Apply pine straw or clean straw mulch beneath plants to keep fruit and leaves elevated above wet soil.",
      "Ensure strawberry rows are spaced for good air movement."
    ]
  }
};

/**
 * Helper to get enriched disease details by model class name.
 */
function getRemedyDetails(className) {
  if (REMEDIES_DATABASE[className]) {
    return REMEDIES_DATABASE[className];
  }

  // Fallback for unexpected or unknown labels
  const parts = className.split("___");
  const crop = parts[0]?.replace(/_/g, " ") || "Plant";
  const condition = parts[1]?.replace(/_/g, " ") || "Unknown Condition";

  return {
    crop,
    condition,
    isHealthy: condition.toLowerCase().includes("healthy"),
    severity: "Unknown",
    pathogen: "N/A",
    description: `Diagnosis result for ${crop}: ${condition}.`,
    symptoms: ["Visual symptoms detected on leaf surface"],
    organicTreatments: ["Isolate plant and consult local agricultural extension."],
    chemicalTreatments: ["Consult certified agronomist for targeted treatment."],
    prevention: ["Maintain sanitary growing conditions and monitor soil moisture."]
  };
}

module.exports = {
  REMEDIES_DATABASE,
  getRemedyDetails
};
