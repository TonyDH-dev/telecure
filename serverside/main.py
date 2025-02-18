import json

patients_data = {}

condition_database = {
    "Fever": ["Cold", "Flu", "COVID-19", "Malaria"],
    "Headache": ["Migraine", "Tension Headache", "Sinusitis", "Dehydration"],
    "Fatigue":
    ["Anemia", "Chronic Fatigue Syndrome", "Diabetes", "Thyroid Disorder"],
    "Cough": ["Bronchitis", "Flu", "COVID-19", "Pneumonia", "Asthma"],
    "Shortness of Breath": ["Asthma", "Pneumonia", "COPD", "Heart Disease"],
    "Sore Throat": ["Strep Throat", "Tonsillitis", "Flu", "Cold"],
    "Chest Pain": ["Heart Attack", "Pneumonia", "Acid Reflux", "Anxiety"],
    "Dizziness": ["Anemia", "Dehydration", "Vertigo", "Low Blood Pressure"],
    "Vomiting": ["Food Poisoning", "Gastroenteritis", "Pregnancy", "Migraine"],
    "Joint Pain": ["Arthritis", "Lupus", "Gout", "Rheumatoid Arthritis"],
    "Back Pain": [
        "Muscle Strain", "Herniated Disc", "Arthritis", "Ostesoporosis",
        "Sciatica", "Scoliosis"
    ],
    "Nausea": [
        "Pregnancy", "Motion Sickness", "Food poisoning", "Gastroenteritis",
        "Migraine"
    ],
    "Blurred Vision": [
        "Glaucoma", "Cataracts", "Diabetes", "Stroke", "Multiple Sclerosis",
        "Retinal Detachment"
    ],
}


def run_diagnostics(patient_id):
    print(f"Running Diagnostics for Patient {patient_id}...")

    blood_pressure = input("Enter Blood Pressure (e.g., 120/80): ")
    temperature = float(
        input("Enter Body Temperature in Fahrenheit (e.g., 98.6): "))
    oxygen_level = int(input("Enter Oxygen Level in percentage (e.g., 98): "))
    blood_glucose = int(
        input("Enter Blood Glucose Level in mg/dL (e.g., 90): "))
    weight = float(input("Enter Weight in kilograms (e.g., 70.5): "))

    diagnostics = {
        "Blood Pressure": blood_pressure,
        "Temperature": temperature,
        "Oxygen Level": oxygen_level,
        "Blood Glucose": blood_glucose,
        "Weight": weight
    }

    patients_data[patient_id]["diagnostics"] = diagnostics
    print(f"Diagnostics recorded for {patient_id}.")
    return diagnostics


def symptom_checker(symptoms):
    print("Checking Symptoms...")

    diagnosed_conditions = set()

    for symptom in symptoms:
        for key in condition_database:
            if symptom.lower() in key.lower():
                diagnosed_conditions.update(condition_database[key])

    if not diagnosed_conditions:
        return ["No specific condition found. Please consult a doctor."]

    return list(diagnosed_conditions)


def remote_consultation(patient_id, diagnosis):
    print(f"Initiating remote consultation for Patient {patient_id}...")
    print(f"Suggested Diagnosis: {diagnosis}")

    doctor_override = input(
        "Doctor, do you want to confirm or change the diagnosis? (Type new diagnosis or press Enter to confirm): "
    )
    if doctor_override:
        diagnosis = [doctor_override]

    print("Consultation complete. Prescription will be generated.")
    return diagnosis


def generate_prescription(patient_id, diagnosis):
    prescriptions = {
        "Cold": ["Paracetamol", "Cough syrup"],
        "Flu": ["Tamiflu", "Hydration fluids"],
        "COVID-19": ["Antiviral medication", "Oxygen therapy"],
        "Bronchitis": ["Cough suppressants", "Antibiotics (if bacterial)"],
        "Asthma": ["Inhaler", "Steroids"],
        "Anemia": ["Iron supplements", "Vitamin B12"],
        "Migraine": ["Ibuprofen", "Rest", "Hydration"],
        "Diabetes": ["Insulin", "Metformin"],
        "Arthritis": ["Pain relievers", "Anti-inflammatory drugs"]
    }

    prescribed_medications = []
    for condition in diagnosis:
        prescribed_medications.extend(
            prescriptions.get(condition, ["General medication"]))

    print(f"Generating prescription for {patient_id}...")
    prescription = {
        "patient_id": patient_id,
        "medications": list(set(prescribed_medications)),
        "notes": "Follow up if symptoms persist."
    }

    return prescription


def store_health_record(patient_id, record):
    with open(f"patient_{patient_id}_record.json", 'w') as file:
        json.dump(record, file, indent=4)
    print(f"Health record for patient {patient_id} stored.")


def telemedicine_kiosk():
    print("Welcome to the Telecure Kiosk!")
    while True:
        patient_id = input("Enter Patient ID (or type 'exit' to quit): ")
        if patient_id.lower() == 'exit':
            break

        if patient_id not in patients_data:
            patients_data[patient_id] = {
                "firstName": input("Enter Patient's First Name: "),
                "lastName": input("Enter Patient's Last Name: "),
                "age": int(input("Enter Patient's Age: ")),
                "diagnostics": {}
            }

        run_diagnostics(patient_id)

        symptoms = input("Enter symptoms (comma separated): ").split(",")
        symptoms = [symptom.strip().capitalize() for symptom in symptoms]

        diagnosis = symptom_checker(symptoms)
        print(f"Possible Conditions: {', '.join(diagnosis)}")

        final_diagnosis = remote_consultation(patient_id, diagnosis)

        prescription = generate_prescription(patient_id, final_diagnosis)
        print(f"Prescription for {patient_id}: {prescription['medications']}")

        patients_data[patient_id]["diagnosis"] = final_diagnosis
        patients_data[patient_id]["prescription"] = prescription
        store_health_record(patient_id, patients_data[patient_id])


telemedicine_kiosk()
