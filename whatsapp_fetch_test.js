// Test script to verify WhatsApp fetching logic
console.log("Testing simplified WhatsApp fetching approach...\n");

// Mock track data
const mockTracks = [
  { 
    id: "1", 
    title: "My Awesome Beat", 
    type: "beat", 
    creatorId: "creator123",
    creatorWhatsapp: null // Simulate missing WhatsApp contact
  },
  { 
    id: "2", 
    title: "Regular Song", 
    type: "song", 
    creatorId: "creator456",
    creatorWhatsapp: "1234567890"
  },
  { 
    id: "3", 
    title: "Another Beat", 
    type: "mix", 
    creatorId: "creator789",
    creatorWhatsapp: null // Simulate missing WhatsApp contact
  }
];

// Mock fetchCreatorWhatsapp function
const fetchCreatorWhatsapp = async (creatorId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Return mock WhatsApp numbers based on creatorId
  const whatsappMap = {
    "creator123": "9876543210",
    "creator456": "1234567890",
    "creator789": "5556667777"
  };
  
  return whatsappMap[creatorId] || null;
};

// Test function to simulate the WhatsApp fetching logic
const testWhatsAppFetching = async (track) => {
  console.log(`Testing track: "${track.title}" (type: ${track.type})`);
  
  // Simple logic to detect if track is a beat
  const isBeat = track.type === 'beat' || 
                (track.title && track.title.toLowerCase().includes('beat'));
                
  console.log(`  Is beat: ${isBeat}`);
  
  if (isBeat) {
    // For beats, we need to ensure we have the creator's WhatsApp number
    let creatorWhatsapp = track.creatorWhatsapp;
    
    console.log(`  Initial WhatsApp: ${creatorWhatsapp || 'not available'}`);
    
    // If we don't have the WhatsApp number, fetch it directly
    if (!creatorWhatsapp && track.creatorId) {
      console.log(`  Fetching WhatsApp for creator: ${track.creatorId}`);
      creatorWhatsapp = await fetchCreatorWhatsapp(track.creatorId);
      console.log(`  Fetched WhatsApp: ${creatorWhatsapp || 'not found'}`);
    }
    
    if (creatorWhatsapp) {
      console.log(`  ✓ Will show WhatsApp button with number: ${creatorWhatsapp}`);
    } else {
      console.log(`  ✗ Will show error: Creator has not provided WhatsApp contact`);
    }
  } else {
    console.log(`  ✓ Will show download button (not a beat)`);
  }
  
  console.log(""); // Empty line for readability
};

// Run tests
(async () => {
  console.log("Running WhatsApp fetching tests...\n");
  
  for (const track of mockTracks) {
    await testWhatsAppFetching(track);
  }
  
  console.log("Test completed!");
})();