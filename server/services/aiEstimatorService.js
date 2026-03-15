const MATERIAL_RATES = {
  bitumen: 52000,
  aggregate: 1800,
  sand: 1400,
  cement: 420,
};

const normalizeSoil = (soilType = '') => soilType.trim().toLowerCase();

export function estimateRoadMaterials({ road_length, road_width, soil_type, soil_report_text = '' }) {
  const length = Number(road_length) || 0;
  const width = Number(road_width) || 0;
  const area = length * width;
  const soil = normalizeSoil(soil_type);

  let bitumen = area * 0.08;
  let aggregate = area * 0.15;
  let sand = area * 0.1;
  let cement = area * 0.12;

  if (soil === 'clay') {
    aggregate *= 1.2;
  }

  if (soil === 'sandy') {
    cement *= 1.1;
  }

  if (soil_report_text.toLowerCase().includes('moisture')) {
    sand *= 1.05;
  }

  const estimated_cost =
    bitumen * MATERIAL_RATES.bitumen +
    aggregate * MATERIAL_RATES.aggregate +
    sand * MATERIAL_RATES.sand +
    cement * MATERIAL_RATES.cement;

  return {
    bitumen_required: Number(bitumen.toFixed(2)),
    aggregate_required: Number(aggregate.toFixed(2)),
    sand_required: Number(sand.toFixed(2)),
    cement_required: Number(cement.toFixed(2)),
    estimated_cost: Number(estimated_cost.toFixed(2)),
    assumptions: {
      area_sq_m: Number(area.toFixed(2)),
      soil_type: soil_type || 'UNKNOWN',
      soil_report_excerpt: soil_report_text.slice(0, 240),
    },
  };
}

export default {
  estimateRoadMaterials,
};
