class BoqEstimatorService {
  static calculateMaterials(length, width, soil_type, road_type) {
    // Placeholder engineering formulas
    // In a real application, these would be more complex and depend on soil_type and road_type
    
    const area = length * width;
    
    // Base calculations
    let bitumen = area * 0.08;
    let aggregate = area * 0.25;
    let cement = area * 0.05;
    let sand = area * 0.10;

    // Adjustments based on road type
    if (road_type === 'HIGHWAY') {
      bitumen *= 1.2;
      aggregate *= 1.3;
    } else if (road_type === 'RURAL') {
      bitumen *= 0.8;
      aggregate *= 0.9;
    }

    // Adjustments based on soil type
    if (soil_type === 'CLAY') {
      cement *= 1.5; // Needs more stabilization
      sand *= 1.2;
    } else if (soil_type === 'SANDY') {
      cement *= 1.1;
    }

    // Calculate estimated cost (placeholder prices)
    const pricePerUnit = {
      bitumen: 50,
      aggregate: 20,
      cement: 15,
      sand: 10
    };

    const estimated_cost = 
      (bitumen * pricePerUnit.bitumen) +
      (aggregate * pricePerUnit.aggregate) +
      (cement * pricePerUnit.cement) +
      (sand * pricePerUnit.sand);

    return {
      bitumen: Number(bitumen.toFixed(2)),
      aggregate: Number(aggregate.toFixed(2)),
      cement: Number(cement.toFixed(2)),
      sand: Number(sand.toFixed(2)),
      estimated_cost: Number(estimated_cost.toFixed(2))
    };
  }
}

module.exports = BoqEstimatorService;
