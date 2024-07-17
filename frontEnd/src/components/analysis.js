class Util {
    static locations = ['Alligator Point', 'Amelia City', 'Amelia Island', 'American Beach', "Anna Maria Island",
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
        "Fort Zachary Taylor Historic State Park", 'Jacksonville', 'Miami', 'Tampa', 'Orlando', 'St. Petersburg', 'Hialeah', 'Port St. Lucie',
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
        'Milton', "Florida", 'Alachua', 'Baker', 'Bay', 'Bradford', 'Brevard', 'Broward', 'Calhoun', 'Charlotte', 'Citrus',
        'Clay', 'Collier', 'Columbia', 'DeSoto', 'Dixie', 'Duval', 'Escambia', 'Flagler', 'Franklin',
        'Gadsden', 'Gilchrist', 'Glades', 'Gulf', 'Hamilton', 'Hardee', 'Hendry', 'Hernando', 'Highlands',
        'Hillsborough', 'Holmes', 'IndianRiver', 'Jackson', 'Jefferson', 'Lafayette', 'Lake', 'Lee', 'Leon',
        'Levy', 'Liberty', 'Madison', 'Manatee', 'Marion', 'Martin', 'Miami-Dade', 'Monroe', 'Nassau',
        'Okaloosa', 'Okeechobee', 'Orange', 'Osceola', 'PalmBeach', 'Pasco', 'Pinellas', 'Polk', 'Putnam',
        'SantaRosa', 'Sarasota', 'Seminole', 'St.Johns', 'St.Lucie', 'Sumter', 'Suwannee', 'Taylor',
        'Union', 'Volusia', 'Wakulla', 'Walton', 'Washington', 'Adelaide', 'Alice (Gainesville)', 'Alligator',
        'Angelo', 'Anoka', 'Apopka', 'August', 'Barco', 'Basket', 'Bay', 'Beauclair', 'Bennet', 'Bivens Arm',
        'Blue Cypress', 'Blue (Sebring)', 'Bonnet',
        'Bonny', 'Brentwood', 'Buena Vista', 'Byrd', 'Center (Osceola County)', 'Charlotte', 'Chilton',
        'Clay', 'Clear (Orlando)', 'Clearwater', 'Clermont chain of lakes', 'Conlin', 'Counterfeit',
        'Crescent', 'Crystal (Broward County)', 'Damon', 'Deaton', 'Deer', 'DeFuniak', 'Denton',
        'Dora', 'East Tohopekaliga', 'Elbert', 'Ella', 'Eustis', 'Gable',
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
        'Lake Wimico', 'Lake Winder', 'Lake Yale', 'Alafia River', 'Alafia River Reserve', 'Alapaha River', 'Alapahoochee River',
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
        "Yellow River (Pensacola Bay)", 'Apalachee Bay', 'Apalachicola Bay', 'Boca Ciega Bay', 'Charlotte Harbor',
        'Choctawhatchee Bay', 'East Bay', 'Escambia Bay', 'Estero Bay', 'Florida Bay', 'Pensacola Bay', 'Ponce de Leon Bay',
        'Sarasota Bay', 'St. Andrews Bay', 'St. Joseph Bay', 'Tampa Bay', 'Whitewater Bay', "Anna Maria", "Bradenton",
        "Bradenton Beach", "Cortez", "Ellenton", "Holmes Beach", "Longboat Key",
        "Myakka City", "Oneco", "Palmetto", "Parrish", "Sarasota", "Tallevast", "Terra Ceia", "Apollo Beach",
        "Balm", "Brandon", "Dover", "Durant", "Gibsonton", "Lithia", "Lutz", "Mango", "Odessa", "Plant City",
        "Riverview", "Ruskin", "Seffner", "Sun City", "Sun City Center", "Sydney", "Tampa", "Thonotosassa",
        "Valrico", "Wimauma", "Bay Pines", "Belleair Beach", "Clearwater", "Clearwater Beach", "Crystal Beach",
        "Dunedin", "Indian Rocks Beach", "Largo", "Oldsmar", "Ozona", "Palm Harbor", "Pinellas Park",
        "Safety Harbor", "Saint Petersburg", "Seminole", "Tarpon Springs", "Aripeka", "Crystal Springs",
        "Dade City", "Holiday", "Hudson", "Lacoochee", "Land O Lakes", "New Port Richey", "Port Richey",
        "Saint Leo", "San Antonio", "Spring Hill", "Trilby", "Wesley Chapel", "Zephyrhills", "fl",
        "florida", "swfl", "floridas", "manateecounty", "annamariaisland", "siestakey", "stpete", "sanibel", "everglades", "fortmyersbeach","manasotakey", "sarasotabay", "fortmyers", "lakeokeechobee", "bradentonbeach","formyers", "bocagrande","siesta", "florda", "srq", "sarastoabay", "stpetersburg", "tampabay", "pinellascounty", "pineypoint", "clearwaterbeach", "capecoral", "gulfofmexico","portcharlotte",""].map(location => location.toLowerCase());
    static stopWords = ['@govrondesantis', 'raw', 'septic', 'chemicals', 'discharges', 'discharge', 'storm water', 'algae',
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
        'counties','a', 'and', 'the', 'if', 'it', 'is', 'with', 'na', 'in', 'com', 'https', 'http', '.', 'of', 'to', 'www', 'on',
        "https", "http", "video", "image", "photo", "'", "news", "html", "com", "www",
        "storylink",
        "usf", "wusf", "edu", "red", "tide", "redtide", "cameron", "camerin", "herrin",
        "camerinherrin","cameronherrin", "justice",
        'rt', 'at', '!', '$', '%', '(', ')', '.', ':', ';', '?','#', ',', '[', ']', '{', '|', '}', 'or', 'i', '-', '&amp;', 'justiceforcameronherrin', "http",
        'democrat', 'democratic', 'republican', 'ron' , '1', 'scotts', 'rick', 'scott', 'gop', 'demcastfl', 'vote blue',
        'vote red', 'red wave', 'blue wave', 'right wing', 'left wing', 'far right', 'far left', 'extreme right', 'extreme left',
        'supremacy', 'supremacist', 'supremacys', 'supremacists', 'terrorist', 'terrorism', 'terrorists', 'ron desantis',
        'desantis', 'remove ron', 'deathsantis', 'rick scott', 'red tide rick', 'marco rubio', 'rubio', 'bill nelson', 'donald trump',
        'trump', 'mike pence', 'pence', 'joe biden', 'biden', 'kamala harris', 'crist', 'charlie christ', 'andrew gillum',
        'gillum', 'kriseman', 'richard kriseman', 'ken welch', 'george cretekos', 'cretekos', 'buckhorn', 'bob buckhorn',
        'jane castor', 'castor', 'john holic', 'holic', 'ron feinsod', 'twitter', 'status', "a", "a's", "able", "about", "above", "according", "accordingly", "across", "actually", "after", "afterwards", "again", "against", "ain't", "all", "allow", "allows",
        "almost", "alone", "along", "already", "also", "although", "always", "am", "among", "amongst", "an", "and", "another", "any", "anybody", "anyhow", "anyone",
        "anything", "anyway", "anyways", "anywhere", "apart", "appear", "appreciate", "appropriate", "are", "aren't", "around", "as", "aside", "ask", "asking", "associated",
        "at", "available", "away", "awfully", "b", "be", "became", "because", "become", "becomes", "becoming", "been", "before", "beforehand", "behind", "being", "believe",
        "below", "beside", "besides", "best", "better", "between", "beyond", "both", "brief", "but", "by", "c", "c'mon", "c's", "came", "can", "can't", "cannot", "cant",
        "cause", "causes", "certain", "certainly", "changes", "clearly", "co", "com", "come", "comes", "concerning", "consequently", "consider", "considering", "contain",
        "containing", "contains", "corresponding", "could", "couldn't", "course", "currently", "d", "definitely", "described", "despite", "did", "didn't", "different", "do",
        "does", "doesn't", "doing", "don't", "done", "down", "downwards", "during", "e", "each", "edu", "eg", "eight", "either", "else", "elsewhere", "enough", "entirely",
        "especially", "et", "etc", "even", "ever", "every", "everybody", "everyone", "everything", "everywhere", "ex", "exactly", "example", "except", "f", "far", "few",
        "fifth", "first", "five", "followed", "following", "follows", "for", "former", "formerly", "forth", "four", "from", "further", "furthermore", "g", "get", "gets",
        "getting", "given", "gives", "go", "goes", "going", "gone", "got", "gotten", "greetings", "h", "had", "hadn't", "happens", "hardly", "has", "hasn't", "have", "haven't",
        "having", "he", "he's", "hello", "help", "hence", "her", "here", "here's", "hereafter", "hereby", "herein", "hereupon", "hers", "herself", "hi", "him", "himself", "his",
        "hither", "hopefully", "how", "howbeit", "however", "i", "i'd", "i'll", "i'm", "i've", "ie", "if", "ignored", "immediate", "in", "inasmuch", "inc", "indeed", "indicate",
        "indicated", "indicates", "inner", "insofar", "instead", "into", "inward", "is", "isn't", "it", "it'd", "it'll", "it's", "its", "itself", "j", "just", "k", "keep", "keeps",
        "kept", "know", "knows", "known", "l", "last", "lately", "later", "latter", "latterly", "least", "less", "lest", "let", "let's", "like", "liked", "likely", "little", "look",
        "looking", "looks", "ltd", "m", "mainly", "many", "may", "maybe", "me", "mean", "meanwhile", "merely", "might", "more", "moreover", "most", "mostly", "much", "must", "my",
        "myself", "n", "name", "namely", "nd", "near", "nearly", "necessary", "need", "needs", "neither", "never", "nevertheless", "new", "next", "nine", "no", "nobody", "non",
        "none", "noone", "nor", "normally", "not", "nothing", "novel", "now", "nowhere", "o", "obviously", "of", "off", "often", "oh", "ok", "okay", "old", "on", "once", "one",
        "ones", "only", "onto", "or", "other", "others", "otherwise", "ought", "our", "ours", "ourselves", "out", "outside", "over", "overall", "own", "p", "particular", "particularly",
        "per", "perhaps", "placed", "please", "plus", "possible", "presumably", "probably", "provides", "q", "que", "quite", "qv", "r", "rather", "rd", "re", "really", "reasonably",
        "regarding", "regardless", "regards", "relatively", "respectively", "right", "s", "said", "same", "saw", "say", "saying", "says", "second", "secondly", "see", "seeing", "seem",
        "seemed", "seeming", "seems", "seen", "self", "selves", "sensible", "sent", "serious", "seriously", "seven", "several", "shall", "she", "should", "shouldn't", "since", "six",
        "so", "some", "somebody", "somehow", "someone", "something", "sometime", "sometimes", "somewhat", "somewhere", "soon", "sorry", "specified", "specify", "specifying", "still",
        "sub", "such", "sup", "sure", "t", "t's", "take", "taken", "tell", "tends", "th", "than", "thank", "thanks", "thanx", "that", "that's", "thats", "the", "their", "theirs",
        "them", "themselves", "then", "thence", "there", "there's", "thereafter", "thereby", "therefore", "therein", "theres", "thereupon", "these", "they", "they'd", "they'll",
        "they're", "they've", "think", "third", "this", "thorough", "thoroughly", "those", "though", "three", "through", "throughout", "thru", "thus", "to", "together", "too", "took",
        "toward", "towards", "tried", "tries", "truly", "try", "trying", "twice", "two", "u", "un", "under", "unfortunately", "unless", "unlikely", "until", "unto", "up", "upon", "us",
        "use", "used", "useful", "uses", "using", "usually", "uucp", "v", "value", "various", "very", "via", "viz", "vs", "w", "want", "wants", "was", "wasn't", "way", "we", "we'd",
        "we'll", "we're", "we've", "welcome", "well", "went", "were", "weren't", "what", "what's", "whatever", "when", "whence", "whenever", "where", "where's", "whereafter", "whereas",
        "whereby", "wherein", "whereupon", "wherever", "whether", "which", "while", "whither", "who", "who's", "whoever", "whole", "whom", "whose", "why", "will", "willing", "wish",
        "with", "within", "without", "won't", "wonder", "would", "wouldn't", "x", "y", "yes", "yet", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself",
        "yourselves", "z", "zero", "she's", "he'd", "she'd", "he'll", "she'll", "shan't", "mustn't", "when's", "why's", "how's", "area", "areas", "asked", "asks", "back", "backed",
        "backing", "backs", "began", "beings", "big", "case", "cases", "clear", "differ", "differently", "downed", "downing", "downs", "early", "end", "ended", "ending", "ends",
        "evenly", "face", "faces", "fact", "facts", "felt", "find", "finds", "full", "fully", "furthered", "furthering", "furthers", "gave", "general", "generally", "give", "good",
        "goods", "great", "greater", "greatest", "group", "grouped", "grouping", "groups", "high", "higher", "highest", "important", "interest", "interested", "interesting",
        "interests", "kind", "knew", "large", "largely", "latest", "lets", "long", "longer", "longest", "made", "make", "making", "man", "member", "members", "men", "mr", "mrs",
        "needed", "needing", "newer", "newest", "number", "numbers", "older", "oldest", "open", "opened", "opening", "opens", "order", "ordered", "ordering", "orders", "part",
        "parted", "parting", "parts", "place", "places", "point", "pointed", "pointing", "points", "present", "presented", "presenting", "presents", "problem", "problems", "put",
        "puts", "room", "rooms", "seconds", "sees", "show", "showed", "showing", "shows", "side", "sides", "small", "smaller", "smallest", "state", "states", "thing", "things",
        "thinks", "thought", "thoughts", "today", "turn", "turned", "turning", "turns", "wanted", "wanting", "ways", "wells", "work", "worked", "working", "works", "year", "years",
        "young", "younger", "youngest", "amp", "aint", "arent", "cmon", "cs", "couldnt", "didnt", "doesnt", "dont", "hadnt", "hasnt", "havent", "hes", "heres", "id", "ill", "im",
        "ive", "isnt", "itd", "itll", "shouldnt", "ts", "theyd", "theyll", "theyre", "theyve", "wasnt", "wed", "weve", "werent", "whats", "wheres", "whos", "wont", "wouldnt", "youd",
        "youll", "youre", "youve", "shes", "hed", "shed", "hell", "shell", "shant", "mustnt", "whens", "whys", "hows", "httpstcodszn4wwgrn", 'httpstcojcetf0i822'
    ];

    static countWords(wordList) {
        const termCounts = wordList.reduce((counts, token) => {
            counts[token] = (counts[token] || 0) + 1;
            return counts;
        }, {});

        const wordFrequencyArray = Object.entries(termCounts).map(([word, count]) => ({ text: word, value: count }));
        wordFrequencyArray.sort((a, b) => b.value - a.value);
        return wordFrequencyArray.slice(0, 200);
    }

    static nonGeoRegularTermWordCloud(tweets) {
        const flattenedText = tweets.map(item => item.text).join(' ').toLowerCase();

        // Defining patterns
        //"RT @username:" & "@username"
        const RTPattern = /RT\s+@[A-Za-z0-9._-]+:/gi;
        const usernamePattern = /@[A-Za-z0-9._-]+/g;
        let replacedText = flattenedText.replace(RTPattern, '').replace(usernamePattern, '').trim();

        // punctuation
        const punctuationPattern = /[^\w\s]|_/g
        replacedText = replacedText.replace(' ', '').replace(punctuationPattern, '')

        const { removeStopwords } = require('stopword')
        let filteredWords = removeStopwords(replacedText.split(/\s+/).filter(word => !Util.stopWords.includes(word.toLowerCase())));
        filteredWords = filteredWords.filter(word => !Util.locations.includes(word.toLowerCase()))

        // let replacedText = flattenedText.replace(RTPattern, '').replace(usernamePattern, '')
        // const geoTermsPattern = /\b(red tide|red tides|karenia brevis|red algae|redtide|redtide's|kbrevis|karenia|brevis|kareniabrevis|redalgae)\b/gi;
        // const politTermsPattern = /\b(democrat|democratic|republican|gop|demcastfl|vote blue|vote red|red wave|blue wave|right wing|left wing|far right|far left|extreme right|extreme left|supremacy|supremacist|supremacys|supremacists|terrorist|terrorism|terrorists|ron desantis|desantis|remove ron|deathsantis|rick scott|red tide rick|marco rubio|rubio|bill nelson|donald trump|trump|mike pence|pence|joe biden|biden|kamala harris|crist|charlie christ|andrew gillum|gillum|kriseman|richard kriseman|ken welch|george cretekos|cretekos|buckhorn|bob buckhorn|jane castor|castor|john holic|holic|ron feinsod)\b/gi;
        // const redTideTermsPattern = /\b(red tide|red tides|karenia brevis|red algae|redtide|redtide's|kbrevis|karenia|brevis|kareniabrevis|redalgae)\b/gi;
        //
        // const placeholder = '';
        // const replacedText = flattenedText.replace(geoTermsPattern, placeholder)
        //     .replace(politTermsPattern, placeholder)
        //     .replace(redTideTermsPattern, placeholder)
        //     .replace(RTPattern, placeholder);

        // const lemmatizer = require('wink-lemmatizer')
        // const filteredWords = replacedText.split(/\s+/).filter(word => !Util.stopWords.includes(word.toLowerCase()));
        return Util.countWords(filteredWords);
    }

    static geoRegularTermWordCloud(tweets) {
        const flattenedText = tweets.map(item => item.text).join(' ').toLowerCase();

        // Defining patterns
        //"RT @username:" & "@username"
        const RTPattern = /RT\s+@[A-Za-z0-9._-]+:/gi;
        const usernamePattern = /@[A-Za-z0-9._-]+/g;
        let replacedText = flattenedText.replace(RTPattern, '').replace(usernamePattern, '').trim();

        // punctuation
        const punctuationPattern = /[^\w\s]|_/g
        replacedText = replacedText.replace(' ', '').replace(punctuationPattern, '')

        const { removeStopwords } = require('stopword')
        let filteredWords = removeStopwords(replacedText.split(/\s+/).filter(word => !Util.stopWords.includes(word.toLowerCase())));
        filteredWords = filteredWords.filter(word => Util.locations.includes(word.toLowerCase()))

        return Util.countWords(filteredWords);
    }

    static geohashtagsCloud(tweets) {
        const punctuationPattern = /[^\w\s#]|_/g;
        const flattenedText = tweets.map(item => item.text).join(' ').toLowerCase().replace(punctuationPattern, ' ');

        const words = flattenedText.split(/\s+/);
        const hashtagPattern = /#(\w+)/g;

        return Util.countWords(words
            .filter(word => {
                const match = hashtagPattern.exec(word);
                if (match && match.index === 0 && match[1] !== undefined) {
                    const location = match[1].toLowerCase();
                    return Util.locations.includes(location);
                }
                return false;
            })
            .map(word => word.substring(1)));
    }

    static nonGeohashtagsCloud(tweets) {
        const punctuationPattern = /[^\w\s#]|_/g;
        const flattenedText = tweets.map(item => item.text).join(' ').toLowerCase().replace(punctuationPattern, ' ');

        const words = flattenedText.split(/\s+/);
        const hashtagPattern = /#(\w+)/g;

        return Util.countWords(words
            .filter(word => {
                const match = hashtagPattern.exec(word);
                if (match && match.index === 0 && match[1] !== undefined) {
                    const location = match[1].toLowerCase();
                    return !Util.locations.includes(location) && !Util.stopWords.includes(location); // Negate to filter out words in Util.locations
                }
                return false;
            })
            .map(word => word.substring(1)));
    }

    static singleUserWordCloud(tweets) {
        // Create a Map to store words and the set of users who used them
        const wordUsers = new Map();
    
        tweets.forEach(tweet => {
            // Use author_id as the primary identifier, fall back to id if author_id is not available
            let userId = tweet.author_id || tweet.id;
            if (!userId) {
                console.warn('Could not find user ID for tweet:', tweet);
                return; // Skip this tweet
            }
    
            let text = tweet.text || '';
    
            // Remove RT patterns, usernames, and punctuation
            const RTPattern = /RT\s+@[A-Za-z0-9._-]+:/gi;
            const usernamePattern = /@[A-Za-z0-9._-]+/g;
            const punctuationPattern = /[^\w\s]|_/g;
            const urlPattern = /https?:\/\/\S+/gi;
            text = text.replace(RTPattern, '')
                        .replace(usernamePattern, '')
                        .replace(punctuationPattern, '')
                        .replace(urlPattern, '')
                        .toLowerCase()
                        .trim();
    
            // Split into words and filter out stop words
            const { removeStopwords } = require('stopword');
            const words = removeStopwords(text.split(/\s+/).filter(word => !Util.stopWords.includes(word)));
    
            // Update the wordUsers map
            words.forEach(word => {
                if (!wordUsers.has(word)) {
                    wordUsers.set(word, new Set());
                }
                wordUsers.get(word).add(userId);
            });
        });
    
        // Convert the map to an array of objects with word and user count
        const wordFrequencyArray = Array.from(wordUsers.entries()).map(([word, users]) => ({
            text: word,
            value: users.size
        }));
    
        // Sort by user count and take top 100
        wordFrequencyArray.sort((a, b) => b.value - a.value);
        return wordFrequencyArray.slice(0, 100);
    }
}
// Export the Util class
module.exports = Util;
