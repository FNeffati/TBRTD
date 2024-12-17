const beaches = [
    'Alligator Point', 'Amelia City', 'Amelia Island', 'American Beach', "Anna Maria Island",
    'Anna Maria', "Anne's Beach", 'Atlantic Beach', 'Bahia Honda Key', 'Bal Harbour', 'Ballast Key',
    'Belleair Beach', 'Belleair Shore', 'Bethune Beach', 'Beverly Beach', 'Big Lagoon State Park',
    'Bill Baggs Cape Florida State Park', 'Boca Chica Key', 'Boca Grande', 'Boca Raton',
    'Boneyard Beach', 'Bonita Springs', 'Boynton Beach', 'Bradenton Beach', 'Briny Breezes',
    'Butler Beach', 'Caladesi Island', 'Canaveral National Seashore', 'Cape Canaveral',
    'Cape St. George Island', 'Captiva Island', 'Captiva', 'Carrabelle', 'Casey Key', 'Cedar Keys',
    'Clearwater Beach', 'Clearwater Beach Island', 'Cocoa Beach', 'Crandon Park', 'Crescent Beach',
    'Dania Beach', 'Daytona Beach Shores', 'Daytona Beach', 'Deerfield Beach',
    'Delnor-Wiggins Pass State Park', 'Delray Beach', 'Destin', 'Dog Island', 'Don Pedro Island',
    'Don Pedro Island State Park', 'Dr. Von D. Mizell-Eula Johnson State Park',
    'Dry Tortugas National Park', 'Dunedin', 'Eastpoint', 'Egmont Key', 'Estero Island', 'Flagler Beach',
    'Fort De Soto Park', 'Fort Island Gulf Beach', 'Fort Lauderdale', 'Fort Myers Beach',
    'Fort Walton Beach', 'Gasparilla Island State Park', 'Golden Beach', 'Grayton Beach State Park',
    'Grayton Beach', 'Gulf Islands National Seashore', 'Hallandale Beach', 'Haulover Park',
    'Henderson Beach State Park', 'Highland Beach', 'Hillsboro Beach', 'Hollywood', 'Holmes Beach',
    'Honeymoon Island', 'Hugh Taylor Birch State Park', 'Hutchinson Island', 'Hutchinson Island South',
    'Indialantic', 'Indian Harbour Beach', 'Indian River Shores', 'Indian Rocks Beach', 'Indian Shores',
    'Inlet Beach', 'Jacksonville Beach', 'Jacksonville Beaches', 'Jensen Beach',
    'John D. MacArthur Beach State Park', 'Juno Beach', 'Juno Dunes Natural Area',
    'Jupiter Inlet Colony', 'Jupiter Island', 'Jupiter', 'Key Biscayne', 'Key Colony Beach', 'Key West',
    'Laguna Beach', 'Lake Worth Beach', 'Lanark Village', 'Lauderdale-by-the-Sea', 'Lido Key',
    'Little Duck Key', 'Little Gasparilla Island', 'Little Talbot Island', 'Loggerhead Park', 'Long Key',
    'Long Key State Park', 'Lovers Key State Park', 'Lower Matecumbe Key', 'Madeira Beach', 'Manalapan',
    'Manasota Key', 'Marathon', 'Marco Island', 'Marquesas Keys', 'Mashes Sands', 'Matanzas Inlet',
    'Matheson Hammock Park', 'Melbourne Beach', 'Mexico Beach', 'Miami Beach', 'Miramar Beach',
    'Money Key', 'Mule Keys', 'Naples', 'Neptune Beach', 'New Smyrna Beach', 'Nokomis',
    'North Captiva Island', 'North Redington Beach', "Oleta River State Park", "Orchid", "Oriole Beach",
    "Ormond Beach", "Ormond-by-the-Sea", "Osprey", "Palm Beach Island", "Palm Beach Shores", "Palm Key",
    "Panama City Beach", "Paradise Park", "Pensacola Beach", "Perdido Key",
    "Pine Island, Hernando County", "Playalinda Beach", "Pompano Beach", "Ponce de León Island",
    "Ponce Inlet", "Ponte Vedra Beach", "Redington Beach", "Redington Shores", "St. Augustine Beach",
    "St. Pete Beach", "Sandestin Golf and Beach Resort", "Santa Rosa Island", "Satellite Beach",
    "Scout Key", "Sea Ranch Lakes", "Seaside", "Sebastian Inlet State Park", "Siesta Key",
    "Smathers Beach", "South Beach", "South Beaches", "South Palm Beach", "South Patrick Shores",
    "South Venice", "St. Andrews State Park", "St. George Island", "St. George Island State Park",
    "St. Lucie Inlet Preserve State Park", "St. Teresa", "St. Vincent Island", "Summer Haven",
    "Sunny Isles Beach", "Sunset Beach", "Surfside",
    "T.H. Stone Memorial St. Joseph Peninsula State Park", "Tea Table Key", "Treasure Island", "Venice",
    "Vilano Beach", "Virginia Key", "Wabasso Beach", "Wilbur-By-The-Sea", "Woman Key",
    "Fort Zachary Taylor Historic State Park"
];

const cities = ['Jacksonville', 'Miami', 'Tampa', 'Orlando', 'St. Petersburg', 'Hialeah', 'Port St. Lucie',
    'Tallahassee', 'Cape Coral', 'Fort Lauderdale', 'Pembroke Pines', 'Hollywood', 'Gainesville',
    'Miramar', 'Coral Springs', 'Lehigh Acres', 'Palm Bay', 'Clearwater', 'West Palm Beach', 'Brandon',
    'Spring Hill', 'Miami Gardens', 'Pompano Beach', 'Lakeland', 'Davie', 'Riverview', 'Sunrise',
    'Boca Raton', 'Deltona', 'Plantation city', 'Alafaya', 'Town Country', 'Palm Coast',
    'Deerfield Beach', 'Fort Myers', 'Pine Hills', 'Melbourne', 'Miami Beach', 'Largo', 'Boynton Beach',
    'Homestead', 'Kendall', 'Kissimmee', 'The Villages', 'North Port', 'Lauderhill', 'Doral', 'Tamarac',
    'Daytona Beach', 'Poinciana', 'Weston', 'Delray Beach', 'Wesley Chapel', 'Port Charlotte', 'Ocala',
    'Port Orange', 'The Hammocks', 'Wellington', 'Palm Harbor', 'Jupiter', 'North Miami', 'Sanford',
    'Palm Beach Gardens', 'Margate', 'Fountainebleau', 'St. Cloud', 'Coconut Creek', 'Bradenton',
    'Tamiami', 'Westchester', 'Apopka', 'Horizon West', 'Pensacola', 'Sarasota', 'Kendale Lakes',
    'Pinellas Park', 'Bonita Springs', 'Country Club', 'Four Corners', 'Coral Gables', 'Winter Haven',
    'University CDP', 'Titusville', 'Ocoee', 'Fort Pierce', 'Winter Garden', 'Altamonte Springs',
    'Cutler Bay', 'North Lauderdale', 'Oakland Park', 'Greenacres', 'North Miami Beach', 'Ormond Beach',
    'Lake Worth Beach', 'Clermont', 'North Fort Myers', 'Hallandale Beach', 'The Acreage',
    'Meadow Woods', 'Aventura', 'Valrico', 'Oviedo', 'Plant City', 'Navarre', 'Royal Palm Beach',
    "Land O' Lakes", 'Winter Springs', 'Richmond West', 'University CDP', 'Riviera Beach',
    'Kendall West', 'DeLand', 'Princeton', 'South Miami Heights', 'Estero', 'Egypt Lake-Leto', 'Dunedin',
    'Buenaventura Lakes', 'Lauderdale Lakes', 'Carrollwood', 'Panama City', 'Fruit Cove',
    'Merritt Island', 'Golden Glades', 'Cooper City', 'Parkland', 'West Little River', 'East Lake',
    'Dania Beach', 'Lake Magdalene', 'Lakeside', 'Miami Lakes', 'Ferry Pass', 'East Lake-Orient Park',
    'New Smyrna Beach', 'Winter Park', 'Vero Beach South', 'Fleming Island', 'Lakewood Ranch',
    'Golden Gate', 'Oakleaf Plantation', 'Casselberry', 'Immokalee', 'Rockledge', 'Citrus Park',
    'Crestview', 'Sun City Center', 'Key West', 'Leisure City', 'Palm Springs', "Temple Terrace",
    "Ruskin", "Haines City", "Leesburg", "Oak Ridge", "Coral Terrace", "West Melbourne", "Ives Estates",
    "Palm River-Clair Mel", "Palm City", "Keystone", "Silver Springs Shores", "Bayonet Point",
    "Tarpon Springs", "Bloomingdale", "South Bradenton", "Northdale", "Venice", "Sebastian", "Wright",
    "Apollo Beach", "Port St. John", "Fish Hawk", "Palmetto Bay", "Westchase", "Wekiwa Springs", "Lutz",
    "Pace", "Jacksonville Beach", "Jasmine Estates", "Edgewater", "Hialeah Gardens", "Bellview",
    "Eustis", "The Crossings", "Sunny Isles Beach", "Florida Ridge", "Ensley", "DeBary",
    "West Pensacola", "Brent", "Holiday", "Liberty Triangle", "Lealman", "Fort Walton Beach",
    "Marion Oaks", "Palm Valley", "World Golf Village", "Bayshore Gardens", "Englewood", "Midway CDP",
    "Nocatee", "Hunters Creek", "Sweetwater", "Lynn Haven", "Punta Gorda", "Seminole", "Naples",
    "Maitland", "Cocoa", "Bartow", "Bradfordville", "Country Walk", "San Carlos Park", "Pinecrest",
    "Tavares", "Gibsonton", "Trinity", "Upper Grand Lagoon", "Groveland", "Panama City Beach",
    "Brownsville", "Lake Butler CDP", "Stuart", "Glenvar Heights", "Pinewood", "Safety Harbor",
    "Myrtle Grove", "Belle Glade", "Zephyrhills", "Palmetto Estates", "Ojus", "Lake Mary",
    "South Venice", "New Port Richey", "Opa-locka", "Vero Beach", "Lake Wales", "Warrington",
    "Marco Island", "Mount Dora", "Auburndale", "Lady Lake", "Southchase", "Azalea Park", "Niceville",
    "Three Lakes", "Longwood", "West Park", "Oldsmar", 'Wildwood', 'Homosassa Springs', 'Fruitville',
    'East Milton', 'Key Biscayne', 'Palmer Ranch', 'Sunset', 'Lockhart', 'Gonzalez', 'Viera West',
    'Bellair-Meadowbrook Terrace', 'Thonotosassa', 'Yulee', 'Gladeview', 'Forest City', 'St. Augustine',
    'Hobe Sound', 'Miami Springs', 'West Lealman', 'Villas', 'Destin', 'Minneola', 'Olympia Heights',
    'Callaway', 'Conway', 'Lakewood Park', 'Jupiter Farms', 'Atlantic Beach', 'Elfers', 'Palmetto',
    'Iona', 'Jensen Beach', 'North Palm Beach', 'South Daytona', 'Naranja', 'Florida City', 'Cheval',
    'Holly Hill', 'Orange City', 'Fernandina Beach', 'Goldenrod', 'Doctor Phillips', 'Sarasota Springs',
    'Shady Hills', 'Cypress Lake', 'Lake City', 'Middleburg', 'Viera East', 'South Miami', 'Gulfport',
    'On Top of the World', 'Pasadena Hills', 'Fairview Shores', 'Asbury Lake', 'Mango', 'Miami Shores',
    'Wilton Manors', 'Lantana', 'Medulla', 'Port Salerno', 'Lakeland Highlands', 'Cocoa Beach',
    'Celebration', 'Laurel', 'Hudson', 'Pine Castle', 'Wimauma', 'New Port Richey East',
    'Fuller Heights', 'Satellite Beach', 'Memphis', 'Westview', 'Highland City', 'Goulds', 'Key Largo',
    'Sebring', 'Gateway', 'Westwood Lakes', 'Sugarmill Woods', 'Pebble Creek', 'Lighthouse Point',
    'Alachua', 'Bithlo', 'Palatka', 'Union Park', 'Richmond Heights', 'Beverly Hills', 'Cypress Gardens',
    'Citrus Springs', 'West Vero Corridor', 'Progress Village', 'West Perrine', 'Pine Ridge CDP',
    'Milton', "Florida"]


const counties = ['Alachua', 'Baker', 'Bay', 'Bradford', 'Brevard', 'Broward', 'Calhoun', 'Charlotte', 'Citrus',
    'Clay', 'Collier', 'Columbia', 'DeSoto', 'Dixie', 'Duval', 'Escambia', 'Flagler', 'Franklin',
    'Gadsden', 'Gilchrist', 'Glades', 'Gulf', 'Hamilton', 'Hardee', 'Hendry', 'Hernando', 'Highlands',
    'Hillsborough', 'Holmes', 'IndianRiver', 'Jackson', 'Jefferson', 'Lafayette', 'Lake', 'Lee', 'Leon',
    'Levy', 'Liberty', 'Madison', 'Manatee', 'Marion', 'Martin', 'Miami-Dade', 'Monroe', 'Nassau',
    'Okaloosa', 'Okeechobee', 'Orange', 'Osceola', 'PalmBeach', 'Pasco', 'Pinellas', 'Polk', 'Putnam',
    'SantaRosa', 'Sarasota', 'Seminole', 'St.Johns', 'St.Lucie', 'Sumter', 'Suwannee', 'Taylor',
    'Union', 'Volusia', 'Wakulla', 'Walton', 'Washington']

const lake_list = ['Adelaide', 'Alice (Gainesville)', 'Alligator', 'Angelo', 'Anoka', 'Apopka', 'August', 'Barco',
    'Basket', 'Bay', 'Beauclair', 'Bennet', 'Bivens Arm', 'Blue Cypress', 'Blue (Sebring)', 'Bonnet',
    'Bonny', 'Brentwood', 'Buena Vista', 'Byrd', 'Center (Osceola County)', 'Charlotte', 'Chilton',
    'Clay', 'Clear (Orlando)', 'Clearwater', 'Clermont chain of lakes', 'Conlin', 'Counterfeit',
    'Crescent', 'Crystal (Broward County)', 'Damon', 'Deaton', 'Deer', 'DeFuniak', 'Denton', 'Dinner',
    'Doctors', 'Dora', 'Dot', 'East Tohopekaliga', 'Elbert', 'Ella', 'Eustis', 'Fox', 'Gable',
    'George', 'Glenada', 'Grassy', 'Griffin', 'Halfmoon', 'Hall', 'Harney', 'Harris', "Hell'n Blazes",
    'Henry', 'Hog', 'Lake Adelaide', 'Lake Alice', 'Alligator Lake', 'Lake Angelo', 'Lake Anoka',
    'Lake Apopka', 'Lake August', 'Lake Iamonia', 'Ingraham Lake', 'Lake Isis', 'Lake Istokpoga',
    'Lake Jackson', 'Lake Jackson', 'Lake Jesup', 'Lake Joanna', 'Lake Joe', 'Lake Josephine',
    'Lake June in Winter', 'Lake Katherine', 'Kingsley Lake', 'Lake Lachard', 'Lake Lafayette',
    'Lake Lelia', 'Lake Leon', 'Lake Letta', 'Liberty Pond', 'Lake Lillian', 'Little Bonnet Lake',
    'Little Grassy Lake', 'Little Lake Bonny', 'Little Lake Jackson', 'Little Red Water Lake',
    'Lochloosa Lake', 'Lake Lotela', 'Lake Lotta', 'Lake Louisa', 'Lake Lucas', 'Luck Lake',
    'Mallard Lake', 'Lake Mary Jane', 'Lake McCoy', 'McKissack Ponds', 'Lake Miccosukee',
    'Lake Minnehaha', 'Lake Minneola', 'Lake Mirror', 'Mirror Lake', 'Lake Monroe', 'Moody Lake',
    'Lake Morton', 'Mud Lake', 'Mud Lake', 'Lake Murphy', 'Lake Norris', 'Lake Okahumpka',
    'Lake Okeechobee', 'Lake Olivia', 'Orange Lake', 'Lake Osborne', 'Lake Osceola', 'Lake Osceola',
    'Lake Overstreet', 'Park Lake', 'Lake Pierce', 'Pioneer Lake', 'Lake Placid', 'Lake Poinsett',
    'Puzzle Lake', 'Lake Pythias', 'Lake Rachael', 'Red Lake', 'Lake Santa Fe', 'Sawgrass Lake',
    'Lake Sebring', 'Lake Seminole', 'Seven Seas Lagoon', 'Silver Lake', 'Silver Lake', 'Silver Lake',
    'Lake Sirena', 'Lake Stafford', 'Lake Stemper', 'Lake Suggs', 'Sunset Lake', 'Sylvan Lake',
    'Lake Tarpon', 'Lake Thonotosassa', 'Lake Tohopekaliga', 'Tsala Apopka Lake', 'Lake Tulane',
    'Up and Down Lake', 'Lake Valencia', 'Valkaria Lake', 'Lake Verona', 'Lake Viola',
    'Lake Washington', 'Lake Wauburg', 'Lake Weaver', 'Lake Weir', 'Lake Weohyakapka', 'Lake Wimauma',
    'Lake Wimico', 'Lake Winder', 'Lake Yale']
const rivers = ['Alafia River', 'Alafia River Reserve', 'Alapaha River', 'Alapahoochee River',
    'Alligator Creek (East Bay River tributary)', 'Anclote River', 'Apalachicola River', 'Arachno Creek',
    'Arbuckle Creek', 'Aucilla River', 'Basin Bayou', "Billy's Creek", 'Black Creek', 'Blackwater Creek',
    'Blackwater Creek', 'Blackwater River', 'Bowlegs Creek', 'Braden River', 'Caloosahatchee River',
    'Carrabelle River', 'Charlie Creek', 'Charlotte River', 'Chassahowitzka River', 'Chattahoochee River',
    'Chipola River', 'Choctawhatchee River', 'Conecuh River', 'Crane Creek', 'Crooked River',
    'Cross Creek', 'Crystal River', 'Curry Creek Preserve', 'Dead River', 'Dean Creek', 'East Bay River',
    'East River', 'Eau Gallie River', 'Econfina Creek', 'Econfina River', 'Estero River', 'Etonia Creek',
    'Fenholloway River', 'Fisheating Creek', 'Four Mile Creek', 'Gamble Creek', 'Gee Creek',
    'Gottfried Creek', 'Halifax River', 'Hamilton Branch', 'Harney River', 'Hickory Creek',
    'Hillsborough River', 'Homosassa River', 'Hontoon Dead River', 'Ichetucknee River', 'Imperial River',
    'Itchepackesassa Creek', 'Julington Creek', 'Kissimmee River', 'Lafayette Creek',
    "Little Econlockhatchee River", "Little Manatee River", "Little River (Biscayne Bay)",
    "Little River (Ochlockonee River tributary)", "Little Wekiva River", "Little Withlacoochee River",
    "Lochloosa Creek", "Loxahatchee River", "Manatee River", "Matanzas River", "McCullough Creek",
    "Miami River", "Myakka River", "Myakkahatchee Creek", "New River (Broward County)",
    "New River (Carrabelle River tributary)", "New River (Santa Fe River tributary)", "Ochlockonee River",
    "Ocklawaha River", "Oleta River", "Orange Creek", "Orange River", "Palatlakaha River", "Payne Creek",
    "Pea River", "Peace River", "Pellicer Creek", "Perdido River", "Pimple Creek",
    "Pithlachascotee River", "Poplar Creek", "Pottsburg Creek", "Rainbow River", "Ribault River",
    "Rice Creek (St. Johns River)", "Rocky Comfort Creek", "St. Johns River", "St. Marys River",
    "Santa Fe River", "Shingle Creek", "Silver River", "Snapper Creek", "Sopchoppy River",
    "Spanish River", "Spanishtown Creek", "St. Lucie River", "St. Marks River", "St. Sebastian River",
    "Steinhatchee River", "Suwannee River", "Swamp Creek (Attapulgus Creek tributary)",
    "Tampa Bypass Canal", "Telogia Creek", "Three Rivers State Park", "Tiger Creek", "Tomoka River",
    "Trout River", "Turkey Creek (Econlockhatchee River tributary)",
    "Turkey Creek (Indian River tributary)", "Waccasassa River", "Wacissa River", "Wagner Creek",
    "Wakulla River", "Weeki Wachee River", "Wekiva River", "Wekiva River (Gulf Hammock, Levy County)",
    "Whidden Creek", "Withlacoochee River", "Withlacoochee River (Suwannee River tributary)",
    "Yellow River (Pensacola Bay)"]

const bays = ['Apalachee Bay', 'Apalachicola Bay', 'Boca Ciega Bay', 'Charlotte Harbor', 'Choctawhatchee Bay',
    'East Bay', 'Escambia Bay', 'Estero Bay', 'Florida Bay', 'Pensacola Bay', 'Ponce de Leon Bay',
    'Sarasota Bay', 'St. Andrews Bay', 'St. Joseph Bay', 'Tampa Bay', 'Whitewater Bay']

// This list will have the towns/cities of every city of interest we have
const towns = ["Anna Maria", "Bradenton", "Bradenton Beach", "Cortez", "Ellenton", "Holmes Beach", "Longboat Key",
    "Myakka City", "Oneco", "Palmetto", "Parrish", "Sarasota", "Tallevast", "Terra Ceia", "Apollo Beach",
    "Balm", "Brandon", "Dover", "Durant", "Gibsonton", "Lithia", "Lutz", "Mango", "Odessa", "Plant City",
    "Riverview", "Ruskin", "Seffner", "Sun City", "Sun City Center", "Sydney", "Tampa", "Thonotosassa",
    "Valrico", "Wimauma", "Bay Pines", "Belleair Beach", "Clearwater", "Clearwater Beach", "Crystal Beach",
    "Dunedin", "Indian Rocks Beach", "Largo", "Oldsmar", "Ozona", "Palm Harbor", "Pinellas Park",
    "Safety Harbor", "Saint Petersburg", "Seminole", "Tarpon Springs", "Aripeka", "Crystal Springs",
    "Dade City", "Holiday", "Hudson", "Lacoochee", "Land O Lakes", "New Port Richey", "Port Richey",
    "Saint Leo", "San Antonio", "Spring Hill", "Trilby", "Wesley Chapel", "Zephyrhills"]
const other = ["fl", "florida", "swfl", "floridas"]

function getCombinedLocations(outputFormat = "combined") {
    // Combine all the lists
    let combined = beaches.concat(cities, counties, lake_list, rivers, bays, towns, other);
    // Process each element in the combined list: convert to lowercase and remove spaces, dots, and single quotes
    combined = combined.map(w => w.toLowerCase().replace(/[\s.'"]/g, ""));
    // Return the combined list or individual lists based on the output format
    return combined;

}

function categoryAdder(outputFormat) {
    // Function to get pure locations (not shown here)

    const suffixesBeach = ["Beach", "Key", "Island", "City"];
    const suffixedBeaches = beaches
        .filter(beach => beach !== '')
        .map(beach => {
            const lastWord = beach.split(" ")[beach.split(" ").length - 1];
            return suffixesBeach.includes(lastWord) ? beach : beach.replace(" ", "") + "Beach";
        });

    const suffixesCity = ["City"];
    const suffixedCities = cities
        .filter(city => city !== '')
        .map(city => {
            const lastWord = city.split(" ")[city.split(" ").length - 1];
            return suffixesCity.includes(lastWord) ? city : city.replace(" ", "") + "City";
        });

    const suffixedCounties = counties.filter(county => county !== '').map(county => county + "County");

    const prefixLake = ["lake"];
    // TODO: ADD IT TO BOTH ENDS
    const prefixedLakes = lake_list
        .filter(lake => lake !== '')
        .map(lake => {
            const firstWord = lake.split(" ")[0].toLowerCase();
            return prefixLake.includes(firstWord) ? lake : "Lake" + lake.replace(" ", "") + "Lake";
        });

    let combined = suffixedBeaches.concat(suffixedCities, suffixedCounties, prefixedLakes);
    combined = combined.map(w => w.toLowerCase());


    return combined;

}


function getNonLocationQueryWords() {
    return ['raw', 'septic', 'chemicals', 'discharges', 'discharge', 'storm water', 'algae',
        'sewage', 'reclaimed water', 'crude', 'sewer', 'pumping', 'toxic', 'tar ball', 'sea',
        'pumps', 'discharged', 'cyanobacteria', 'oil', 'overflow', 'bay', 'blue green algae',
        'lake', 'chemical', 'leaking', 'beach', 'petroleum', 'lyngbya', 'kbrevis', 'dumping',
        'discharging', 'gulf', 'untreated', 'pump', 'spill', 'river', 'contaminating',
        'waterway', 'leaked', 'cyanotoxins', 'spilling', 'dump', 'contamination', 'spills',
        'ocean', 'linbya', 'red algae', 'red tide', 'lyngbia', 'harmful', 'bluegreenalgae',
        'toxicalgae', 'leaks', 'tar balls', 'kareniabrevis', 'harmfulalgae', 'spilled',
        'contaminants', 'linbia', 'beaches', 'oil spill', 'industrial spill', 'red tides',
        'dapis', 'wastewater', 'stormwater', 'reclaim water', 'leakage', 'bloom',
        'algae bloom',
        'blue green algal', 'raw sewage', 'oil leaks', 'oil spillage', 'county',
        'hillsborough',
        'counties'];
}

function getLocationQueryWords() {
    const tampa = ['Tampa', 'Tampas', '#TampaBay', 'TB area', 'Hillsborough', 'County', 'FL', 'florida', 'Apollo Beach',
        'ApolloBeach', 'Wimauma', 'Gibsonton', 'Ruskin Sun City', 'Hillsborough Bay', 'pinellas',
        'Davis Islands', 'Alafia River', 'McKay Bay', 'lake thonotosassa'];
    const stPete = ["StPetersburg", "St Petersburg", "St Pete", "StPete", "#StPeteBeach",
        "Madeira Beach", "#MadeiraBeach", "Treasure Island", "Tierra Verde", "Sunshine Skyway",
        "Fort De Soto", "Fort DeSoto", "Redington Beach", "Redington Shores", "Pass a grille",
        "Boca Ciega Bay",
        "Egmont Key", "Weedon Island"];
    const manatee = ["Manatee county", "Manatee counties", "ManateeCounty", "Bradenton", "Bradentons", "#BradentonBeach",
        "Anna Maria Island", "#AnnaMariaIsland", "Longboat Key", "#LongboatKey", "Holmes Beach",
        "#HolmesBeach",
        "Manatee River", "#ManateeRiver", "Port Manatee", "Coquina Beach",
        "Terra Ceia",
        "Palma Sola Bay", "Bishop Harbor",
        "lake manatee"];
    const sarasota = ["Sarasota", "Sarasotas", "SarasotaCounty",
        "Siesta Key Beach", "#SiestaKeyBeach",
        "Venice", "Englewood", "North Port", "#NorthPort", "Lido Beach", "Casey Key", "#CaseyKey",
        "Nokomis",
        "Lemon Bay", "#LemonBay", "St Armands", "#StArmands",
        "Manasota Key", "#ManasotaKey", "Manasota Beach", "Englewood Beach", "Lido Key",
        "Caspersen Beach", "Stump Pass", "#SarasotaBay"];
    const pasco = ["Pasco county", "pasco", "PascoCounty",
        "Port Richey", "#PortRichey",
        "Bayonet Point", "Anclote", "Elfers", "Shady Hills",
        "Cotee River", "Pithlachascotee", "Jasmine Estates", "Key Vista", "Aripeka",
        "Werner Boyce", "Three Rooker Island", "Beacon Square"];
    return tampa.concat(stPete, manatee, sarasota, pasco).map(word => word.toLowerCase());
}

function getStopWords(pre) {
    const nonLocationSW = getNonLocationQueryWords();
    const geoMarks = getLocationQueryWords();
    const ourOwnStopWords = ["https", "http", "video", "image", "photo", "'", "news", "html", "com", "www",
        "storylink",
        "usf", "wusf", "edu", "red", "tide", "redtide", "cameron", "camerin", "herrin",
        "camerinherrin","cameronherrin", "justice"];
    const allQueryWords = ourOwnStopWords.concat(nonLocationSW, geoMarks).map(word => word.toLowerCase());
    return pre ? ourOwnStopWords : allQueryWords;
}


module.exports = { categoryAdder, getStopWords, getLocationQueryWords, getCombinedLocations, getNonLocationQueryWords };