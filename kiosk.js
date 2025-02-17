const fs = require("fs");
const readline = require("readline");

const patientsData = {};

const conditionDatabase = {
    "Fever": ["Cold", "Flu", "COVID-19", "Malaria"],
    "Headache": ["Migraine", "Tension Headache", "Sinusitis", "Dehydration"],
    "Fatigue": ["Anemia", "Chronic Fatigue Syndrome", "Diabetes", "Thyroid Disorder"],
    "Cough": ["Bronchitis", "Flu", "COVID-19", "Pneumonia", "Asthma"],
    "Shortness of Breath": ["Asthma", "Pneumonia", "COPD", "Heart Disease"],
    "Sore Throat": ["Strep Throat", "Tonsillitis", "Flu", "Cold"],
    "Chest Pain": ["Heart Attack", "Pneumonia", "Acid Reflux", "Anxiety"],
    "Dizziness": ["Anemia", "Dehydration", "Vertigo", "Low Blood Pressure"],
    "Vomiting": ["Food Poisoning", "Gastroenteritis", "Pregnancy", "Migraine"],
    "Joint Pain": ["Arthritis", "Lupus", "Gout", "Rheumatoid Arthritis"],
    "Back Pain": ["Muscle Strain", "Herniated Disc", "Arthritis", "Ostesoporosis", "Sciatica", "Scoliosis"],
    "Nausea": ["Pregnancy", "Motion Sickness", "Food poisoning", "Gastroenteritis", "Migraine"],
    "Blurred Vision": ["Glaucoma", "Cataracts", "Diabetes", "Stroke", "Multiple Sclerosis", "Retinal Detachment"],
};

const prescriptions = {
    "Cold": ["Paracetamol", "Cough syrup"],
    "Flu": ["Tamiflu", "Hydration fluids"],
    "COVID-19": ["Antiviral medication", "Oxygen therapy"],
    "Bronchitis": ["Cough suppressants", "Antibiotics (if bacterial)"],
    "Asthma": ["Inhaler", "Steroids"],
    "Anemia": ["Iron supplements", "Vitamin B12"],
    "Migraine": ["Ibuprofen", "Rest", "Hydration"],
    "Diabetes": ["Insulin", "Metformin"],
    "Arthritis": ["Pain relievers", "Anti-inflammatory drugs"]
};

async function askQuestion(query) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(query, answer => {
        rl.close();
        resolve(answer);
    }));
}

async function runDiagnostics(patientId) {
    console.log(`Running Diagnostics for Patient ${patientId}...`);

    const bloodPressure = await askQuestion("Enter Blood Pressure (e.g., 120/80): ");
    const temperature = parseFloat(await askQuestion("Enter Body Temperature (°F): "));
    const oxygenLevel = parseInt(await askQuestion("Enter Oxygen Level (%): "));
    const bloodGlucose = parseInt(await askQuestion("Enter Blood Glucose (mg/dL): "));
    const weight = parseFloat(await askQuestion("Enter Weight (kg): "));

    const diagnostics = { bloodPressure, temperature, oxygenLevel, bloodGlucose, weight };
    patientsData[patientId].diagnostics = diagnostics;
    console.log(`Diagnostics recorded for ${patientId}.`);
    return diagnostics;
}

function symptomChecker(symptoms) {
    console.log("Checking Symptoms...");
    let diagnosedConditions = new Set();

    symptoms.forEach(symptom => {
        if (conditionDatabase[symptom]) {
            conditionDatabase[symptom].forEach(condition => diagnosedConditions.add(condition));
        }
    });

    return diagnosedConditions.size > 0 ? Array.from(diagnosedConditions) : ["No specific condition found. Please consult a doctor."];
}

async function remoteConsultation(patientId, diagnosis) {
    console.log(`Initiating remote consultation for Patient ${patientId}...`);
    console.log(`Suggested Diagnosis: ${diagnosis}`);

    const doctorOverride = await askQuestion("Doctor, confirm or change diagnosis: ");
    if (doctorOverride) {
        diagnosis = [doctorOverride];
    }

    console.log("Consultation complete. Prescription will be generated.");
    return diagnosis;
}

function generatePrescription(patientId, diagnosis) {
    let prescribedMedications = [];
    diagnosis.forEach(condition => {
        prescribedMedications = prescribedMedications.concat(prescriptions[condition] || ["General medication"]);
    });
    
    console.log(`Generating prescription for ${patientId}...`);
    return { patientId, medications: Array.from(new Set(prescribedMedications)), notes: "Follow up if symptoms persist." };
}

function storeHealthRecord(patientId, record) {
    fs.writeFileSync(`patient_${patientId}_record.json`, JSON.stringify(record, null, 4));
    console.log(`Health record for patient ${patientId} stored.`);
}

async function telemedicineKiosk() {
    console.log("Welcome to the Telemedicine Kiosk!");
    while (true) {
        const patientId = await askQuestion("Enter Patient ID (or type 'exit' to quit): ");
        if (patientId.toLowerCase() === 'exit') break;

        if (!patientsData[patientId]) {
            const age = await askQuestion("Enter Patient's Age: ");
            patientsData[patientId] = { name: `Patient ${patientId}`, age, diagnostics: {} };
        }

        await runDiagnostics(patientId);

        const symptoms = (await askQuestion("Enter symptoms (comma separated): ")).split(",").map(s => s.trim());
        const diagnosis = symptomChecker(symptoms);
        console.log(`Possible Conditions: ${diagnosis.join(", ")}`);

        const finalDiagnosis = await remoteConsultation(patientId, diagnosis);
        const prescription = generatePrescription(patientId, finalDiagnosis);
        console.log(`Prescription for ${patientId}: ${prescription.medications.join(", ")}`);

        patientsData[patientId].diagnosis = finalDiagnosis;
        patientsData[patientId].prescription = prescription;
        storeHealthRecord(patientId, patientsData[patientId]);
    }
}

telemedicineKiosk();
