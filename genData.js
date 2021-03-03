const ObjectsToCsv = require("objects-to-csv");

const DIAGNOSIS = ["Flu", "Cold", "Bronchitis"];

const TREATMENTS = [
  "Vitamin C",
  "Tamaflu",
  "Healing Potion",
  "Positive Thoughts",
  "Bleach",
];

const TREATMENT_COEFF = {
  "Vitamin C": { tox: 0, eff: 0 },
  Tamaflu: { tox: 1, eff: 0.1 },
  "Healing Potion": { tox: 1, eff: 0.2 },
  "Positive Thoughts": { tox: 0, eff: -0.1 },
  Bleach: { tox: 2, eff: -0.2 },
};

const INIT_SYPM = [1, 2];

const IMPROVEMENT = [-0.1, 0, 0.1];

const frequencies = [0.45, 0.3, 0.2, 0.15, 0.08];

const genData = (numUsers, numDays) => {
  const data = [];

  for (let i = 0; i < numUsers; i++) {
    let patient = genUser(i);
    data.push({ ...patient });

    for (let j = 0; j < numDays - 1; j++) {
      const dataPoint = genDataPoint(patient);
      if (isActive(patient) && Math.random() < patient.frequency) {
        data.push({ ...dataPoint });
      }
    }
  }

  return data;
};

const genDataPoint = (patient) => {
  const treatmentCos = TREATMENT_COEFF[patient.treatment];

  patient.symptomSeverity = sample([
    0,
    1,
    2,
    patient.symptomSeverity,
    patient.symptomSeverity,
    patient.symptomSeverity,
    patient.symptomSeverity,
    patient.symptomSeverity,
    treatmentCos.tox,
    treatmentCos.tox,
    treatmentCos.tox,
  ]);
  patient.efficacy = calcEfficacy(patient, treatmentCos);
  patient.daysOnTreatment++;

  return { ...patient };
};

const genUser = (id) => {
  return {
    id,
    symptomSeverity: sample(INIT_SYPM),
    efficacy: 0,
    diagnosis: sample(DIAGNOSIS),
    treatment: sample(TREATMENTS),
    daysOnTreatment: 0,
    frequency: sample(frequencies),
  };
};

const sample = (items) => {
  return items[Math.floor(Math.random() * items.length)];
};

const isActive = (patient) => {
  return patient.efficacy < 1 && patient.efficacy > -1;
};

const calcEfficacy = (patient, treatmentCos) => {
  const eff = parseFloat(
    parseFloat(
      patient.efficacy + sample([...IMPROVEMENT, treatmentCos.eff])
    ).toFixed(1)
  );

  if (eff > 1) {
    return 1;
  } else if (eff < -1) {
    return -1;
  } else {
    return eff;
  }
};

const testData = genData(1, 100);
const testFile = "./testData.csv";
const testJsonFile = "./src/assets/testData.json";
const jsonData = JSON.stringify(testData);

const csv = new ObjectsToCsv(testData);
csv.toDisk(testFile);

const fs = require("fs");
fs.writeFile(testJsonFile, jsonData, "utf8", function(err) {
  if (err) throw err;
  console.log("complete");
});
