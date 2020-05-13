/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* global getAssetRegistry getFactory emit */

/**
 * Add a new Record to an existing patient profile
 * @param {org.dhr.basic.createProcedure} tx
 * @transaction
 */

async function createProcedure(tx) {
	try {
		let procedureRegistry = await getAssetRegistry("org.dhr.basic.Procedure");
		let factory = await getFactory();
		let procedureId = tx.procedure.procedureId;
		let newProcedure = factory.newResource("org.dhr.basic", "Procedure", procedureId);

		// Copy input info to new Asset - newProcedure
		newProcedure = Object.assign(newProcedure, tx.procedure);
		await procedureRegistry.add(newProcedure);
	} catch (err) {
		console.log("Could not add new Record ");
		console.log(err);
	}
}

/**
 * Grant Read Access to a Doctor
 * @param {org.dhr.basic.grantReadAccess} tx
 * @transaction
 */

async function grantReadAccess(tx) {
	try {
		let doctorRegistry = await getParticipantRegistry("org.dhr.basic.Doctor");
		let doctorId = tx.doctor.doctorId;
		console.log(tx.patient);
		console.log(tx.patient.contactDetails);

		// Check if Doctor exists
		let doctorExists = await doctorRegistry.exists(doctorId);

		// If Doctor exists, add to access list

		if (doctorExists) {
			// Check if already present in asset list
			if (!tx.patient.readAccess.includes(doctorId)) tx.patient.readAccess.push(doctorId);

			let patientRegistry = await getParticipantRegistry("org.dhr.basic.Patient");

			await patientRegistry.update(tx.patient);
		} else throw new Error("Invalid ID - Doctor does not Exist");
	} catch (err) {
		console.log("Could not complete Transaction  ");
		console.log(err);
	}
}

/**
 * Grant Read-Write Access to a Doctor
 * @param {org.dhr.basic.grantRWAccess} tx
 * @transaction
 */

async function grantReadWriteAccess(tx) {
	try {
		let doctorRegistry = await getParticipantRegistry("org.dhr.basic.Doctor");
		let doctorId = tx.doctor.doctorId;

		// Check if Doctor exists
		let doctorExists = await doctorRegistry.exists(doctorId);

		// If Doctor exists, add to access list

		if (doctorExists) {
			// Check if already present in asset list
			if (!tx.patient.readAccess.includes(doctorId)) {
				tx.patient.readAccess.push(doctorId);
			}

			if (!tx.patient.writeAccess.includes(doctorId)) {
				tx.patient.writeAccess.push(doctorId);
			}

			let patientRegistry = await getParticipantRegistry("org.dhr.basic.Patient");

			await patientRegistry.update(tx.patient);
		} else throw new Error("Invalid ID - Doctor does not Exist");
	} catch (err) {
		console.log("Could not complete Transaction ");
		console.log(err);
	}
}

/**
 * Revoke Write Access from a Doctor
 * @param {org.dhr.basic.revokeWriteAccess} tx
 * @transaction
 */

async function revokeWriteAccess(tx) {
	try {
		let doctorId = tx.doctor.doctorId;
		let writeIndex = tx.patient.writeAccess.indexOf(doctorId);

		if (writeIndex > -1) {
			tx.patient.writeAccess.splice(writeIndex, 1);
		}

		let patientRegistry = await getParticipantRegistry("org.dhr.basic.Patient");
		await patientRegistry.update(tx.patient);
	} catch (err) {
		console.log("Could not complete Transaction ");
		console.log(err);
	}
}

/**
 * Revoke Read-Write Access from a Doctor
 * @param {org.dhr.basic.revokeRWAccess} tx
 * @transaction
 */

async function revokeReadWriteAccess(tx) {
	try {
		let doctorId = tx.doctor.doctorId;
		let readIndex = tx.patient.readAccess.indexOf(doctorId);
		if (readIndex > -1) {
			tx.patient.readAccess.splice(readIndex, 1);
		}

		let writeIndex = tx.patient.writeAccess.indexOf(doctorId);
		if (writeIndex > -1) {
			tx.patient.writeAccess.splice(writeIndex, 1);
		}

		let patientRegistry = await getParticipantRegistry("org.dhr.basic.Patient");
		await patientRegistry.update(tx.patient);
	} catch (err) {
		console.log("Could not complete Transaction ");
		console.log(err);
	}
}

/**
 * View A Patient's Doctors
 * @param {org.dhr.basic.viewMyDoctors} tx
 * @returns {org.dhr.basic.Doctor[]}
 * @transaction
 */

async function viewMyDoctors(tx) {
	try {
		let doctors = [];
		let doctorRegistry = await getParticipantRegistry("org.dhr.basic.Doctor");

		let accessList = tx.owner.readAccess;

		for (let idx = 0; idx < accessList.length; idx++) {
			let doctor = await doctorRegistry.get(accessList[idx]);
			if (doctor) doctors.push(doctor);
		}

		console.log(doctors);

		return doctors;
	} catch (err) {
		console.log("Could not complete Transaction ");
		console.log(err);
	}
}
