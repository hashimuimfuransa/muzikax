// Test script to verify WhatsApp button logic
const testTracks = [
  { title: "My Beat Collection", type: "beat", creatorWhatsapp: "1234567890" },
  { title: "Song Title", type: "song", creatorWhatsapp: "1234567890" },
  { title: "Awesome Beat", type: "mix", creatorWhatsapp: "1234567890" },
  { title: "Regular Song", type: "song", creatorWhatsapp: "1234567890" },
  { title: "Hip Hop Beat", type: undefined, creatorWhatsapp: "1234567890" },
  { title: "Pop Song", type: undefined, creatorWhatsapp: "1234567890" }
];

console.log("Testing WhatsApp button detection logic:\n");

testTracks.forEach((track, index) => {
  // Our simplified logic
  const isBeat = track.type === 'beat' || 
                (track.title && track.title.toLowerCase().includes('beat'));
  
  const buttonText = isBeat ? 'WhatsApp' : 'Download';
  const iconType = isBeat ? 'WhatsApp Icon' : 'Download Icon';
  
  console.log(`Test ${index + 1}: "${track.title}" (type: ${track.type})`);
  console.log(`  Detected as beat: ${isBeat}`);
  console.log(`  Button text: ${buttonText}`);
  console.log(`  Icon: ${iconType}\n`);
});