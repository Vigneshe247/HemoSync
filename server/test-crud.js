import {
  createDonor,
  getDonors,
  getDonorById,
  updateDonor,
  deleteDonor,
  createRequest,
  getRequests,
  getRequestById,
  updateRequest,
  pledgeRequest,
  deleteRequest
} from './crud.js';
import { disconnectFromMongoDB } from './db.js';

async function runCrudTest() {
  console.log("==================================================");
  console.log("   MONGODB ATLAS CRUD OPERATIONS TEST (NEOBLOOD)   ");
  console.log("==================================================\n");

  try {
    // ----------------------------------------------------
    // 1. DONOR CRUD OPERATIONS
    // ----------------------------------------------------
    console.log("🩸 [1/8] CREATE: Inserting a new Donor...");
    const donor = await createDonor({
      name: "Sridharan A Test",
      bloodGroup: "O+",
      phone: "+91 98765 00000",
      email: "sridharan.test@neoblood.com",
      state: "Tamil Nadu",
      city: "Madurai",
      address: "Anna Nagar, Madurai",
      isAvailable: true
    });
    console.log("✅ Donor Created. ID:", donor._id.toString());

    console.log("\n🩸 [2/8] READ: Querying Donors from MongoDB...");
    const allDonors = await getDonors({ bloodGroup: "O+" });
    console.log(`✅ Found ${allDonors.length} O+ Donor(s). First match: ${allDonors[0].name} (${allDonors[0].city})`);

    const fetchedDonor = await getDonorById(donor._id.toString());
    console.log(`✅ Fetched Donor by ID: ${fetchedDonor?.name}`);

    console.log("\n🩸 [3/8] UPDATE: Updating Donor availability status...");
    const updatedDonor = await updateDonor(donor._id.toString(), {
      isAvailable: false,
      address: "KK Nagar, Madurai (Updated)"
    });
    console.log("✅ Donor Updated. isAvailable:", updatedDonor?.isAvailable, "Address:", updatedDonor?.address);

    // ----------------------------------------------------
    // 2. BLOOD REQUEST CRUD OPERATIONS
    // ----------------------------------------------------
    console.log("\n🚑 [4/8] CREATE: Inserting an Emergency Blood Request...");
    const request = await createRequest({
      patientName: "Emergency Test Patient",
      bloodGroup: "O+",
      unitsRequired: 2,
      hospitalName: "GRH Hospital Madurai",
      state: "Tamil Nadu",
      city: "Madurai",
      emergencyLevel: "CRITICAL",
      purpose: "Trauma Surgery",
      mobile: "+91 98400 11111"
    });
    console.log("✅ Request Created. ID:", request._id.toString());

    console.log("\n🚑 [5/8] READ: Querying Requests from MongoDB...");
    const allRequests = await getRequests({ city: "Madurai" });
    console.log(`✅ Found ${allRequests.length} Request(s) in Madurai.`);

    console.log("\n🚑 [6/8] UPDATE: Pledging donation for the request...");
    const pledgedReq = await pledgeRequest(
      request._id.toString(),
      donor._id.toString(),
      donor.name
    );
    console.log("✅ Request Pledged. Status:", pledgedReq?.status, "Accepted by:", pledgedReq?.acceptedDonorName);

    // ----------------------------------------------------
    // 3. DELETE OPERATIONS (CLEANUP)
    // ----------------------------------------------------
    console.log("\n🗑️ [7/8] DELETE: Removing test Request...");
    const delReqResult = await deleteRequest(request._id.toString());
    console.log("✅ Request Deleted successfully:", delReqResult.success);

    console.log("\n🗑️ [8/8] DELETE: Removing test Donor...");
    const delDonorResult = await deleteDonor(donor._id.toString());
    console.log("✅ Donor Deleted successfully:", delDonorResult.success);

    console.log("\n==================================================");
    console.log("🎉 ALL MONGODB CRUD OPERATIONS PASSED 100%!");
    console.log("==================================================");
  } catch (err) {
    console.error("❌ CRUD Test Error:", err);
  } finally {
    await disconnectFromMongoDB();
  }
}

runCrudTest();
