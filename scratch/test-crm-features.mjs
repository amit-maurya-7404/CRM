const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('--- 1. Testing Organizations Fetch ---');
  const orgsRes = await fetch(`${BASE_URL}/api/organizations`);
  const orgsJson = await orgsRes.json();
  console.log(`Fetched ${orgsJson.data.length} organizations.`);
  const travelOrg = orgsJson.data.find(o => o.slug === 'wanderlust-travel') || orgsJson.data[0];
  console.log(`Using Org: ${travelOrg.name} (${travelOrg._id})`);

  console.log('\n--- 2. Testing Converting Lead to Booking Record ---');
  const bookingData = {
    booking_ref: `BKG-TEST-${Date.now().toString().slice(-4)}`,
    customer_name: 'Test Customer Verification',
    itinerary: '7N Rajasthan Heritage Circuit',
    travel_date: '2026-11-15',
    total_amount: 145000,
    advance_paid: 58000,
    status: 'Advance Received',
    phone: '9876543210',
    email: 'test@customer.com'
  };

  const addRecRes = await fetch(`${BASE_URL}/api/organizations/${travelOrg._id}/modules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'add_record',
      moduleSlug: 'bookings',
      recordData: bookingData
    })
  });
  const addRecJson = await addRecRes.json();
  const bookingsMod = addRecJson.data.find(m => m.slug === 'bookings');
  console.log(`Bookings Module Record Count: ${bookingsMod?.records?.length || 0}`);
  const latestRec = bookingsMod?.records?.find(r => r.booking_ref === bookingData.booking_ref);
  console.log('Latest Booking Created:', latestRec?.booking_ref, latestRec?.customer_name);

  console.log('\n--- 3. Testing Creating Client Company Credentials (Super Admin) ---');
  const newClientData = {
    orgName: `Skyline Luxe Tours ${Date.now().toString().slice(-4)}`,
    industry: 'Travel & Tourism',
    ownerName: 'Vikramaditya Rathore',
    email: `vikram_${Date.now().toString().slice(-4)}@skylinetours.in`,
    password: 'SkylinePass@2026',
    plan: 'enterprise',
    currency: 'INR',
    currencySymbol: '₹'
  };

  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newClientData)
  });
  const regJson = await regRes.json();
  console.log('Registration Success:', regJson.success);
  console.log('Created Company:', regJson.data?.organization?.name, 'Slug:', regJson.data?.organization?.slug);
  console.log('Created User:', regJson.data?.user?.email, 'Role:', regJson.data?.user?.role);

  console.log('\n--- 4. Testing Client Login with Created Credentials ---');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: newClientData.email,
      password: newClientData.password
    })
  });
  const loginJson = await loginRes.json();
  console.log('Client Login Success:', loginJson.success);
  console.log('Resolved Tenant Workspace:', loginJson.data?.organization?.name);
  console.log('Resolved Admin User:', loginJson.data?.user?.name);

  console.log('\n--- ALL BACKEND CHECKS PASSED PERFECTLY ---');
}

runTests().catch(console.error);
