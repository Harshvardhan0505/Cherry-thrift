// Indian states and union territories, with their larger cities, for the
// checkout's suggestions. The city lists are a convenience, not a limit:
// shoppers can type any city.
export const CITIES_BY_STATE: Record<string, string[]> = {
  "Andaman and Nicobar Islands": ["Port Blair"],
  "Andhra Pradesh": [
    "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati",
    "Rajahmundry", "Kakinada", "Kadapa", "Anantapur", "Eluru", "Ongole",
  ],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang"],
  Assam: ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur"],
  Bihar: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Purnia", "Arrah", "Begusarai"],
  Chandigarh: ["Chandigarh"],
  Chhattisgarh: ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
  Delhi: ["New Delhi", "Delhi"],
  Goa: ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
  Gujarat: [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar",
    "Junagadh", "Anand", "Bharuch", "Navsari",
  ],
  Haryana: [
    "Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal", "Rohtak", "Hisar", "Sonipat",
    "Panchkula", "Yamunanagar",
  ],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Mandi", "Solan", "Kullu", "Manali"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur"],
  Jharkhand: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh"],
  Karnataka: [
    "Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Belagavi", "Kalaburagi", "Davanagere",
    "Ballari", "Shivamogga", "Tumakuru", "Udupi",
  ],
  Kerala: [
    "Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Kannur", "Alappuzha",
    "Palakkad", "Kottayam", "Malappuram",
  ],
  Ladakh: ["Leh", "Kargil"],
  Lakshadweep: ["Kavaratti"],
  "Madhya Pradesh": [
    "Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Satna", "Rewa", "Ratlam", "Dewas",
  ],
  Maharashtra: [
    "Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Navi Mumbai", "Aurangabad", "Solapur",
    "Kolhapur", "Amravati", "Nanded", "Sangli", "Jalgaon", "Akola", "Latur",
  ],
  Manipur: ["Imphal", "Thoubal", "Churachandpur"],
  Meghalaya: ["Shillong", "Tura", "Jowai"],
  Mizoram: ["Aizawl", "Lunglei"],
  Nagaland: ["Kohima", "Dimapur", "Mokokchung"],
  Odisha: ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore"],
  Puducherry: ["Puducherry", "Karaikal", "Mahe", "Yanam"],
  Punjab: [
    "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Hoshiarpur", "Pathankot",
  ],
  Rajasthan: [
    "Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Alwar", "Bhilwara", "Sikar",
    "Bharatpur",
  ],
  Sikkim: ["Gangtok", "Namchi"],
  "Tamil Nadu": [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur",
    "Vellore", "Erode", "Thoothukudi", "Thanjavur",
  ],
  Telangana: ["Hyderabad", "Secunderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
  Tripura: ["Agartala", "Dharmanagar"],
  "Uttar Pradesh": [
    "Lucknow", "Kanpur", "Noida", "Greater Noida", "Ghaziabad", "Agra", "Varanasi", "Prayagraj",
    "Meerut", "Bareilly", "Aligarh", "Moradabad", "Gorakhpur", "Jhansi", "Mathura",
  ],
  Uttarakhand: ["Dehradun", "Haridwar", "Rishikesh", "Haldwani", "Roorkee", "Nainital"],
  "West Bengal": [
    "Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Bardhaman", "Kharagpur", "Darjeeling",
  ],
};

export const STATES = Object.keys(CITIES_BY_STATE);

const simplify = (text: string) =>
  text.toLowerCase().replace(/&/g, "and").replace(/[^a-z]/g, "");

// The state's name as we list it, from however it was typed or returned.
export function matchState(text: string): string | undefined {
  const wanted = simplify(text);
  return STATES.find((state) => simplify(state) === wanted);
}

// Options whose name, or any word in it, starts with what was typed.
export function suggest(options: string[], typed: string, limit = 8): string[] {
  const query = typed.trim().toLowerCase();
  if (!query) return [];
  const starts = options.filter((option) => option.toLowerCase().startsWith(query));
  const words = options.filter(
    (option) =>
      !starts.includes(option) &&
      option
        .toLowerCase()
        .split(/[\s-]+/)
        .some((word) => word.startsWith(query)),
  );
  return [...starts, ...words].slice(0, limit);
}

type PostOffice = { District: string; Block?: string; State: string };

// City and state for a PIN code, from India Post's public lookup.
// Returns null when the PIN code doesn't exist, and throws if the lookup
// itself fails (so the form can carry on without it).
export async function lookupPin(
  pin: string,
  signal?: AbortSignal,
): Promise<{ city: string; state: string } | null> {
  const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`, { signal });
  if (!response.ok) throw new Error(`PIN lookup failed: ${response.status}`);
  const [result] = (await response.json()) as [{ Status: string; PostOffice: PostOffice[] | null }];
  const offices = result?.PostOffice;
  if (result?.Status !== "Success" || !offices?.length) return null;

  const mostCommon = (values: string[]) => {
    const counts = new Map<string, number>();
    for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1])[0];
  };
  const [district] = mostCommon(offices.map((office) => office.District));
  // The block is often the name people use (Noida, New Delhi), but only when
  // most of the area shares it and it isn't just part of the district
  // (Bangalore North for Bangalore).
  const blocks = offices.map((office) => office.Block ?? "").filter((block) => block && block !== "NA");
  const [block, blockCount] = blocks.length ? mostCommon(blocks) : ["", 0];
  const useBlock =
    blockCount > offices.length / 2 && !block.includes(district) && !district.includes(block);

  return {
    city: useBlock ? block : district,
    state: matchState(offices[0].State) ?? offices[0].State,
  };
}
