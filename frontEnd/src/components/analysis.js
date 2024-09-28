class Util {
    /*
    The Util class contains various static methods to process and analyze text data from tweets, focusing on generating
    word clouds and filtering words based on specific criteria.
     */
    static primaryLocations = ['Petersburg', 'Alligator Point', 'Amelia City', 'Amelia Island', 'American Beach', "Anna Maria Island",
        'Anna Maria','Anna','Maria','Island', "Anne's Beach", 'Atlantic Beach', 'Bahia Honda Key', 'Bal Harbour', 'Ballast Key',
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
        'Little Duck Key', 'Little Gasparilla Island', 'Little Talbot Island', 'Loggerhead Park','Longboat', 'Long Key',
        'Long Key State Park', 'Lovers Key State Park', 'Lower Matecumbe Key', 'Madeira Beach', 'Manalapan',
        'Manasota Key', 'Marathon', 'Marco Island', 'Marquesas Keys', 'Mashes Sands', 'Matanzas Inlet',
        'Matheson Hammock Park', 'Melbourne Beach', 'Mexico Beach', 'Miami Beach', 'Miramar Beach',
        'Money Key', 'Mule Keys', 'Naples', 'Neptune Beach', 'New Smyrna Beach', 'Nokomis',
        'North Captiva Island', 'North Redington Beach', "Oleta River State Park", "Orchid", "Oriole Beach",
        "Ormond Beach", "Ormond-by-the-Sea", "Osprey", "Palm Beach Island", "Palm Beach Shores", "Palm Key",
        "Panama City Beach", "Paradise Park", "Pensacola Beach", "Perdido Key",
        "Pine Island, Hernando County", "Playalinda Beach", "Pompano Beach", "Ponce de León Island",
        "Ponce Inlet", "Ponte Vedra Beach", "Redington Beach", "Redington Shores",'Southwest', "St. Augustine Beach",
        "St. Pete Beach", "Sandestin Golf and Beach Resort", "Santa Rosa Island", "Satellite Beach",
        "Scout Key", "Sea Ranch Lakes", "Seaside", "Sebastian Inlet State Park", "Siesta Key",
        "Smathers Beach", "South Beach", "South Beaches", "South Palm Beach", "South Patrick Shores",
        "South Venice", "St. Andrews State Park", "St. George Island", "St. George Island State Park",
        "St. Lucie Inlet Preserve State Park", "St. Teresa", "St. Vincent Island", "Summer Haven",
        "Sunny Isles Beach", "Sunset Beach", "Surfside",'South','West', 'East', 'North',
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
        "Saint Leo", "San Antonio", "Spring Hill", "Trilby", "Wesley Chapel", "Zephyrhills", "fl", 'pete', 'st', 'st pete',
        "florida", "swfl", "floridas", "manateecounty", "annamariaisland", "siestakey", "stpete", "sanibel", "everglades",
        "fortmyersbeach","manasotakey", "sarasotabay", "fortmyers", "lakeokeechobee", "bradentonbeach","formyers", "bocagrande",
        "siesta", "florda", "srq", "sarastoabay", "stpetersburg", "tampabay", "pinellascounty", "pineypoint", "clearwaterbeach",
        "capecoral", "gulfofmexico","portcharlotte",""].map(location => location.toLowerCase());

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
        'algae bloom', 'blue green algal', 'raw sewage', 'oil leaks', 'oil spillage', 'county', 'hillsborough',
        'counties','a', 'and', 'the', 'if', 'it', 'is', 'with', 'na', 'in', 'com', 'https', 'http', '.', 'of', 'to', 'www', 'on',
        "https", "http", "video", "image", "photo", "'", "news", "html", "com", "www",
        "storylink", "usf", "wusf", "edu", "red", "tide","tides", "redtide", "cameron", "camerin", "herrin", "camerinherrin","cameronherrin", "justice",
        'rt', 'at', '!', '$', '%', '(', ')', '.', ':', ';', '?','#', ',', '[', ']', '{', '|', '}', 'or', 'i', '-', '&amp;', 'justiceforcameronherrin', "http",

        'democrat', 'democratic', 'republican', 'ron' , '1', 'scotts', 'rick', 'scott', 'gop', 'demcastfl', 'vote blue', 'voteblue', 'votered',
        'vote red', 'red wave', 'blue wave', 'redwave', 'bluewave', 'right wing', 'left wing', 'far right', 'far left', 'extreme right', 'extreme left',
        'rightwing', 'leftwing', 'farright', 'farleft', 'extremeright', 'extremeleft', 'supremacy', 'supremacist', 'supremacys', 'supremacists', 'terrorist', 'terrorism', 'terrorists', 'ron desantis',
        'desantis', 'remove ron', 'deathsantis', 'rick scott', 'rickscott', 'red tide rick', 'marco rubio', 'rubio', 'bill nelson', 'billnelson', 'donald trump','marcorubio',
        'trump', 'mike pence', 'mikepence', 'pence', 'joebiden','joe biden', 'biden', 'kamala harris', 'kamalaharris', 'crist', 'charlie christ', 'charliechrist', 'andrew gillum','rondesantis', 'andrewgillum',
        'gillum', 'kriseman', 'richard kriseman', 'ken welch', 'george cretekos', 'cretekos', 'buckhorn', 'bob buckhorn',
        'jane castor', 'janecastor', 'castor', 'john holic', 'john holic', 'holic', 'ron feinsod', 'twitter', 'status', 'rickscott', 'rick',
        'redtiderick', 'redtideron', 'removeron', 'trumpmaga', 'gillumforgovernor', 'deathdesantis', 'maga', 'qanon', 'rondeathsantis', 
        'trumptampa', 'rondesantes', 'demvoice1', 'notscott',

        "x", "a", "a's", "about", "above", "according", "accordingly", "across", "actually", "after", "afterwards", "again", "against", "ain't", "all", "almost",
        "alone", "along", "already", "also", "although", "always", "am", "among", "amongst", "an", "and", "another", "any", "anybody",
        "anyhow", "anyone", "anything", "anyway", "anyways", "anywhere", "apart", "are", "aren't", "around", "as", "aside", "at", "away",
        "awfully", "b", "be", "because", "been", "before", "beforehand", "behind", "being", "below", "beside", "besides", "between", "beyond",
        "both", "but", "by", "c", "c'mon", "c's", "can", "can't", "cannot", "cant", "certain", "certainly", "clearly", "co", "com", "concerning", "consequently", "considering", "could",
        "couldn't", "currently", "d", "definitely", "despite", "did", "didn't", "do", "does", "doesn't", "doing", "don't",
        "done", "down", "downwards", "during", "e", "each", "eg", "eight", "either", "else", "elsewhere", "enough",
        "entirely", "especially", "et", "etc", "even", "ever", "every", "everybody",
        "everyone", "everything", "everywhere", "ex", "exactly", "except", "f", "far", "few", "fifth", "first", "five", "following", "for", "formerly", "forth", "four", "from", "further", "furthermore",
        "g", "get", "gets", "getting", "given", "gives", "go", "goes", "going", "gone", "got", "gotten", "greetings", "h", "had", "hadn't", "hardly", "has", "hasn't", "have", "haven't",
        "having", "he", "he's", "hello", "hence", "her", "here", "here's", "hereafter", "hereby", "herein", "hereupon", "hers", "herself", "hi", "him",
        "himself", "his", "hither", "hopefully", "how", "howbeit", "however", "i", "i'd", "i'll", "i'm", "i've", "ie", "if", "in",
        "inasmuch", "indeed", "insofar", "instead", "into", "inward", "is", "isn't", "it", "it'd", "it'll", "it's", "its", "itself", "j", "just", "k", "keep", "keeps", "kept", "know", "knows", "known", "l",
        "last", "lately", "later", "latter", "latterly", "least", "less", "lest", "let", "let's", "like", "likely", "little", "look", "looking", "looks",
        "m", "mainly", "many", "may", "maybe", "me", "mean", "meanwhile", "merely", "might", "more", "moreover", "most",
        "mostly", "much", "must", "my","myself", "n", "namely", "nd", "near", "nearly", "neither", "never", "nevertheless",
        "next", "nine", "no", "nobody", "non", "none", "noone", "nor", "normally", "not", "nothing", "now", "nowhere",
        "o", "obviously", "of", "off", "often", "oh", "ok", "okay", "on", "once", "one", "ones", "only", "onto", "or",
        "other", "others", "otherwise", "ought", "our", "ours", "ourselves", "out", "outside", "over", "overall", "own", "p",
        "particular", "particularly", "per", "perhaps", "please", "plus", "presumably", "probably", "q", "que", "quite", "qv", "r",
        "rather", "rd", "re", "really", "reasonably", "regarding", "regardless", "relatively", "respectively", "right",
        "s", "said", "same", "saw", "say", "saying", "says", "second","secondly", "see", "seeing", "seem", "seemed",
        "seeming", "seems", "seen", "self", "selves", "seriously", "seven", "several", "shall", "she", "should", "shouldn't", "since", "six", "so", "some", "somebody", "somehow", "someone",
        "something", "sometime", "sometimes", "somewhat", "somewhere", "soon", "still", "sub", "such", "sup", "sure", "t", "t's",
        "take", "taken", "tell", "th", "than", "that", "that's", "thats", "the", "their", "theirs", "them", "themselves", "then",
        "thence", "there", "there's", "thereafter", "thereby", "therefore", "therein", "theres", "thereupon", "these", "they",
        "they'd", "they'll", "they're", "they've", "think", "third", "this", "thoroughly", "those", "though", "three", "through", "throughout", "thru", "thus",
        "to", "together", "too", "took", "toward", "towards", "tried", "tries", "truly", "try", "trying", "twice", "two", "u", "un", "under",
        "unfortunately", "unless", "unlikely", "until", "unto", "up", "upon", "us", "use", "used", "uses", "using", "usually", "uucp", "v",
        "various", "very", "via", "viz", "vs", "w", "want", "wants", "was", "wasn't", "way", "we", "we'd", "we'll", "we're", "we've",  "well",  "went", "were", "weren't", "what", "what's", "whatever", "when", "whence", "whenever", "where", "where's",
        "whereafter", "whereas", "whereby", "wherein", "whereupon", "wherever","whether", "which", "while", "whither", "who", "who's", "whoever", "whom", "whose", "why", "will",
        "with", "within", "without", "won't", "would", "wouldn't", "x", "y", "yes", "yet", "you", "you'd",
        "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves", "z", "zero", "she's", "he'd", "she'd", "he'll", "she'll", "shan't",
        "mustn't", "when's", "why's", "how's", "differently", "early", "evenly", "fully", "gave", "general", "generally",
        "give", "good", "knew", "largely", "lets", "long", "longer", "made", "make", "making", "mr", "mrs", "put", "puts",
        "sees", "show", "showed", "showing", "shows", "state", "states", "thing", "things", "thinks", "thought", "thoughts",
        "today", "wanted", "wanting", "ways", "amp", "aint", "arent", "cmon", "cs", "couldnt", "didnt", "doesnt", "dont", "hadnt",
        "hasnt", "havent", "hes", "heres", "id", "ill", "im", "ive", "isnt", "itd", "itll", "shouldnt", "ts", "theyd", "theyll",
        "theyre", "theyve", "wasnt", "wed", "weve", "werent", "whats", "wheres", "whos", "wont", "wouldnt", "youd", "youll",
        "youre", "youve", "shes", "hed", "shed", "hell", "shell", "shant", "mustnt", "whens", "whys", "hows", "ten", "fourth"
    ];

    static expandLocationList(locations) {
        const suffixes = ['Lake', 'Beach', 'City', 'County', 'Key'];
        const expandedList = new Set();

        locations.forEach(location => {
            // Add original location
            expandedList.add(location.toLowerCase());

            // Process location
            const processedLocation = location.toLowerCase().replace(/\s+/g, '');
            expandedList.add(processedLocation);

            // Add suffixed versions
            suffixes.forEach(suffix => {
                const suffixedLocation = `${location}${suffix}`.toLowerCase();
                expandedList.add(suffixedLocation);
                expandedList.add(suffixedLocation.replace(/\s+/g, ''));

                // If location has multiple words, add collapsed version with suffix
                if (location.includes(' ')) {
                    const collapsedSuffixed = `${processedLocation}${suffix}`.toLowerCase();
                    expandedList.add(collapsedSuffixed);
                }
            });
        });

        return Array.from(expandedList);
    }
    static locations = Util.expandLocationList(Util.primaryLocations)

    /**
     * Counts the occurrences of each word in the provided list, sorts them by frequency, and returns the top 200 most frequent words.
     * @param {Array<string>} wordList - An array of words.
     * @returns {Array<object>} An array of objects with the properties `text` (the word) and `value` (the frequency), sorted by frequency and limited to the top 200 words.
     */
    static countWords(wordList) {
        const termCounts = wordList.reduce((counts, token) => {
            counts[token] = (counts[token] || 0) + 1;
            return counts;
        }, {});

        const wordFrequencyArray = Object.entries(termCounts).map(([word, count]) => ({ text: word, value: count }));
        wordFrequencyArray.sort((a, b) => b.value - a.value);
        return wordFrequencyArray.slice(0, 200);
    }

    /**
     * Generates a word cloud of non-geographic terms from the provided tweets.
     * @param {Array<object>} tweets - An array of tweet objects, each containing a `text` property.
     * @returns {Array<object>} An array of word-frequency objects, excluding geographic terms and stop words.
     */
    static nonGeoRegularTermWordCloud(tweets) {
        const urlRegex = /https?:\/\/\S+/g;
        const RTPattern = /RT\s+@[A-Za-z0-9._-]+:/gi;
        const usernamePattern = /@[A-Za-z0-9._-]+/g;
        const punctuationPattern = /[^\w\s]|_/g;
    
        // Convert stop words and locations into Sets for faster lookups
        const stopWordsSet = new Set(Util.stopWords);
        const locationsSet = new Set(Util.locations);
    
        // Combine replace operations and flatten text in one go
        const flattenedText = tweets.map(item => item.text)
            .join(' ')
            .toLowerCase()
            .replace(RTPattern, '')         // Remove RT patterns
            .replace(usernamePattern, '')   // Remove usernames
            .replace(urlRegex, '')          // Remove URLs
            .replace(punctuationPattern, ' ')  // Replace punctuation with space
            .trim();
    
        // Split the cleaned text into words
        const words = flattenedText.split(/\s+/);
    
        // Filter out stop words and location words
        const filteredWords = words.filter(word => !stopWordsSet.has(word) && !locationsSet.has(word));
    
        return Util.countWords(filteredWords);
    }

    /**
     * Generates a word cloud of geographic terms from the provided tweets.
     * @param {Array<object>} tweets - An array of tweet objects, each containing a `text` property.
     * @returns {Array<object>} An array of word-frequency objects, including only geographic terms.
     */
    static geoRegularTermWordCloud(tweets) {
        const urlRegex = /https?:\/\/\S+/g;
        const RTPattern = /RT\s+@[A-Za-z0-9._-]+:/gi;
        const usernamePattern = /@[A-Za-z0-9._-]+/g;
        const punctuationPattern = /[^\w\s]|_/g;
    
        // Convert stop words and locations into Sets
        const stopWordsSet = new Set(Util.stopWords);
        const locationsSet = new Set(Util.locations);
    
        // Combine replace operations and flatten text in one go
        const flattenedText = tweets.map(item => item.text)
            .join(' ')
            .toLowerCase()
            .replace(RTPattern, '')         // Remove RT patterns
            .replace(usernamePattern, '')   // Remove usernames
            .replace(urlRegex, '')          // Remove URLs
            .replace(punctuationPattern, ' ')  // Replace punctuation with space
            .trim();
    
        // Split the cleaned text into words
        const words = flattenedText.split(/\s+/);
    
        // Filter words: remove stop words and keep only location words
        const filteredWords = words.filter(word => !stopWordsSet.has(word) && locationsSet.has(word));
    
        return Util.countWords(filteredWords);
    }

    /**
     * Generates a word cloud of geographic hashtags from the provided tweets.
     * @param {Array<object>} tweets - An array of tweet objects, each containing a `text` property.
     * @returns {Array<object>} An array of hashtag-frequency objects, including only geographic hashtags.
     */
    static geohashtagsCloud(tweets) {
        const punctuationPattern = /[^\w\s#]|_/g;
        const urlRegex = /https?:\/\/\S+/g;

        // Convert locations into a Set for faster lookups
        const locationsSet = new Set(Util.locations);

        // Combine replace operations and flatten text into a single pass
        const flattenedText = tweets.map(item => item.text)
            .join(' ')
            .toLowerCase()
            .replace(urlRegex, '')       // Remove URLs
            .replace(punctuationPattern, ' ');  // Replace punctuation with space

        // Split the cleaned text into words
        const words = flattenedText.split(/\s+/);

        // Use a map to count valid location hashtags
        const validHashtags = words.filter(word => word.startsWith('#') && locationsSet.has(word.substring(1)));

        return Util.countWords(validHashtags.map(word => word.substring(1)));
    }

    /**
     * Generates a word cloud of non-geographic hashtags from the provided tweets.
     * @param {Array<object>} tweets - An array of tweet objects, each containing a `text` property.
     * @returns {Array<object>} An array of hashtag-frequency objects, excluding geographic hashtags and stop words.
     */
    static nonGeohashtagsCloud(tweets) {
        const urlRegex = /https?:\/\/\S+/g;
        const punctuationPattern = /[^\w\s#]|_/g;
    
        // Convert stop words and locations into Sets for O(1) lookups
        const stopWordsSet = new Set(Util.stopWords);
        const locationsSet = new Set(Util.locations);
    
        // Combine replace operations and flatten text in one go
        const flattenedText = tweets.map(item => item.text)
            .join(' ')
            .toLowerCase()
            .replace(urlRegex, '')          // Remove URLs
            .replace(punctuationPattern, ' ')  // Replace punctuation with space
            .trim();
    
        // Split the cleaned text into words
        const words = flattenedText.split(/\s+/);
    
        // Use a filter and map to collect valid non-geo hashtags
        const validHashtags = words.filter(word => {
            // Check if word starts with '#' and is not in locations or stop words
            if (word.startsWith('#')) {
                const hashtag = word.substring(1); // Remove the '#'
                return !locationsSet.has(hashtag) && !stopWordsSet.has(hashtag);
            }
            return false;
        }).map(word => word.substring(1)); // Remove the '#' for counting
    
        return Util.countWords(validHashtags);
    }


    static geoSingleUserWordCloud(tweets) {
        const wordUsers = new Map();
        const urlPattern = /https?:\/\/\S+/gi;
        const RTPattern = /RT\s+@[A-Za-z0-9._-]+:/gi;
        const usernamePattern = /@[A-Za-z0-9._-]+/g;
        const punctuationPattern = /[^\w\s]|_/g;
        const { removeStopwords } = require('stopword');
    
        // Convert stop words and locations into Sets for faster lookups
        const stopWordsSet = new Set(Util.stopWords);
        const locationsSet = new Set(Util.locations);
    
        tweets.forEach(tweet => {
            const userId = tweet.author_id || tweet.id;
            if (!userId) return; // Skip tweet if user ID is not available
    
            let text = tweet.text || '';
    
            // Combine all replace operations into a single pass
            text = text
                .replace(RTPattern, '')
                .replace(usernamePattern, '')
                .replace(urlPattern, '')
                .replace(punctuationPattern, '')
                .toLowerCase()
                .trim();
    
            // Split text into words and filter only location words
            const words = removeStopwords(text.split(/\s+/).filter(word => 
                !stopWordsSet.has(word) && locationsSet.has(word)
            ));
    
            // If there are valid location words, process them
            if (words.length > 0) {
                words.forEach(word => {
                    if (!wordUsers.has(word)) {
                        wordUsers.set(word, new Set());
                    }
                    wordUsers.get(word).add(userId);
                });
            }
        });
    
        // Convert the wordUsers Map to an array and sort by frequency
        const wordFrequencyArray = Array.from(wordUsers.entries()).map(([word, users]) => ({
            text: word,
            value: users.size
        }));
    
        wordFrequencyArray.sort((a, b) => b.value - a.value);
        return wordFrequencyArray.slice(0, 100);
    }

    static nonGeoSingleUserWordCloud(tweets) {
        const wordUsers = new Map();
        const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+|httpst?[^\s]+)/gi;
        const RTPattern = /RT\s+@[A-Za-z0-9._-]+:/gi;
        const usernamePattern = /@[A-Za-z0-9._-]+/g;
        const punctuationPattern = /[^\w\s]|_/g;
        const { removeStopwords } = require('stopword');
    
        // Convert stop words and locations into Sets for faster lookups 
        const stopWordsSet = new Set(Util.stopWords);
        const locationsSet = new Set(Util.locations);
    
        tweets.forEach(tweet => {
            const userId = tweet.author_id || tweet.id;
            if (!userId) return;
    
            let text = tweet.text || '';
            
            // Combine replacements into one pass
            text = text
                .replace(RTPattern, '')
                .replace(usernamePattern, '')
                .replace(urlPattern, '')
                .replace(punctuationPattern, '')
                .toLowerCase()
                .trim();
    
            // Filter out stop words and location words in one go
            const words = removeStopwords(text.split(/\s+/)).filter(word => 
                !stopWordsSet.has(word) && !locationsSet.has(word)
            );
    
            // Update word-user mapping
            words.forEach(word => {
                if (!wordUsers.has(word)) {
                    wordUsers.set(word, new Set());
                }
                wordUsers.get(word).add(userId);
            });
        });
    
        const wordFrequencyArray = Array.from(wordUsers.entries()).map(([word, users]) => ({
            text: word,
            value: users.size
        }));
    
        wordFrequencyArray.sort((a, b) => b.value - a.value);
        return wordFrequencyArray.slice(0, 100);
    }
}
module.exports = Util;
