// Nevada chain and winter restriction rules for i15pass.com.
// Researched from official sources only: Nevada Legislature (NRS and NAC
// chapter 484D), NDOT pages and documents at dot.nv.gov, Nevada 511 at
// nvroads.com, and Caltrans chain control pages at dot.ca.gov.
// Nevada has no numbered chain class ladder. Its law is keyed to what is
// posted on the road, and this copy is written to match that.

export const LAW_INTRO = [
  "This page explains the words, not the weather. Nevada does not run a standing chain season, and it does not publish a numbered ladder of chain classes for its own highways. The Nevada Department of Transportation, called NDOT on this page, posts a restriction for a specific stretch of road when conditions on that stretch call for one, and the same restriction appears in the Nevada 511 feed that powers the live status shown on this site. When a segment here shows a chain or snow tire status, this is the page that tells you what that status asks of you and of your vehicle.",
  "The honest starting point for Interstate 15 is that the Las Vegas valley almost never sees a chain posting. Nevada chain restrictions belong mainly to the Sierra and the northern mountain roads, and the one place on this corridor where chain controls are a real winter possibility is Mountain Pass, the high climb in California between the state line and Barstow, which is posted by Caltrans under California rules. This page covers Nevada law first, because Nevada 511 is the feed behind the Nevada segments, and then explains the California handoff and the wind postings that I-15 drivers in Nevada meet far more often than chains.",
];

export const LAW_SECTIONS = [
  {
    heading: "Nevada posts by sign, not by class number",
    body: [
      "Nevada chain law is built around posting. Under Nevada Revised Statutes section 484D.515, it is unlawful to operate a motor vehicle without traction devices, tire chains, or snow tires on any street or highway under icy or snowy conditions when that highway is marked or posted with signs requiring them. The statute says this applies to emergency vehicles as well. When nothing is posted, that statute does not by itself order anyone to chain up, and when something is posted, the posting is the obligation.",
      "That is why there is no Nevada level number to memorize. California summarizes its controls with the R-1, R-2, and R-3 shorthand described below, and drivers crossing state lines often expect Nevada to use the same kind of ladder. Nevada postings do not work that way. NDOT raises and lowers a restriction for the road in front of you as conditions change, the restriction is reported segment by segment in Nevada 511, and the sign on the road and the 511 status for your segment are what govern, not a forecast and not a rule you remember from another state.",
      "NDOT winter guidance is simple about the order of operations: check conditions before you drive by dialing 511 inside Nevada, or 1-877-NV-ROADS from outside the state, or by checking nvroads.com, and always comply with all posted chain requirements. If the live status and the roadside sign ever seem to disagree, follow the sign and any officer or road crew direction at the scene.",
    ],
  },
  {
    heading: "What \"Chains or Snow Tires Required\" means",
    body: [
      "This is the lighter of the two chain postings Nevada 511 uses, and Nevada law gives lighter vehicles a choice under it. Under NRS 484D.520, when a highway is posted for traction devices, tire chains, or snow tires, a vehicle or combination of vehicles with a gross weight or combined gross weight of 10,000 pounds or less may be equipped with traction devices, tire chains, or snow tires. In plain terms, at this posting a car or light truck can comply with proper snow tires and does not have to stop and chain.",
      "The same statute draws a hard line at weight. A vehicle or combination over 10,000 pounds must be equipped with tire chains when this posting is up. Snow tires alone do not satisfy the posting for a heavy truck, a large RV, or a heavy towing combination.",
      "Snow tire is a defined term, not a feeling about your tread. Nevada Administrative Code section 484D.230 requires a snow tire to have a special traction tread pattern, a minimum tread depth of 3/16 inch, and a permanent sidewall label with the words \"mud and snow\" or an abbreviation using the letters M and S. Sections 484D.220 and 484D.225 set construction standards for the chains and traction devices themselves. When equipment is required, NRS 484D.525 says it must be installed on at least two driving wheels, and on at least two braking wheels of any trailing vehicle that is equipped with brakes or required to have them.",
    ],
  },
  {
    heading: "What \"Chains Required\" with a four wheel drive exception means",
    body: [
      "Nevada 511 also posts a stricter status that reads, in full, \"Chains Required, All Vehicles except 4-wheel drive with Snow tires.\" The statute behind that wording is the second part of NRS 484D.520: when a highway is posted requiring traction devices or tire chains on all motor vehicles except vehicles with 4-wheel drive and snow tires on all wheels, every other vehicle must be equipped with traction devices or tire chains.",
      "Read the exception narrowly, because that is how it is written. Four wheel drive by itself is not the pass. The excepted vehicle is a 4-wheel drive vehicle running snow tires, as defined above, on all of its wheels. A two wheel drive car on snow tires, which was fine under the lighter posting, must chain or fit traction devices under this one. So must a 4-wheel drive vehicle on ordinary highway tires.",
      "Notice what Nevada does not add. The Nevada 511 statuses used on this site have no third step that orders chains on every vehicle with no exception at all, the way California uses its highest level. If a Nevada road is truly impassable, the posting you will see is a closure, and a closure ends the discussion for every vehicle type.",
    ],
  },
  {
    heading: "The Tahoe area rule, and why it is not an I-15 rule",
    body: [
      "One named set of Nevada roads runs stricter than the general statute, and naming it keeps this page honest about where Nevada chain controls really live. In 2018 NDOT announced that on State Route 431, the Mt. Rose Highway, on State Route 207, Kingsbury Grade, and on U.S. 50 between Glenbrook and Carson City, a vehicle traveling without tire chains during a chain restriction must be four wheel or all wheel drive with snow tires. On those three Tahoe area highways, two wheel drive on snow tires alone no longer passes when a restriction is up, and NDOT stated the change applied to those roads and did not change requirements on other highway corridors.",
      "That geography is the pattern for the whole state. Nevada chain postings are a Sierra and northern mountain story, plus high mountain roads elsewhere when a storm is on them, including the Mount Charleston roads west of Las Vegas, State Routes 156, 157, and 158, where NDOT warns that snow chains, four wheel drive, or both may be required in winter. They are not a Las Vegas valley freeway routine. If a chain status ever appears on an I-15 segment inside Nevada, treat it as an unusual storm event and obey the live posting, but do not plan a valley trip around equipment the valley almost never asks for.",
    ],
  },
  {
    heading: "Mountain Pass is a California control",
    body: [
      "Cross the state line at Primm heading south and the agency, the feed, and the law all change. The climb over Mountain Pass, and the rest of I-15 down toward Barstow, is Caltrans country. Winter storms can put snow and ice on that high desert climb even when Las Vegas and Primm are clear, and when Caltrans posts chain control there, California rules decide who chains, who is excepted, and who turns back.",
      "Caltrans does not post the level numbers on its signs. The signs state the requirement, and R-1, R-2, and R-3 are shorthand that Caltrans and the California Highway Patrol use internally and that traffic reports repeat. Requirement 1 means chains on all vehicles except passenger vehicles and light duty trucks under 6,000 pounds gross weight with snow tires on at least two drive wheels, and vehicles using snow tires must still carry chains. Requirement 2 means chains or traction devices on all vehicles except four wheel drive vehicles under 6,500 pounds gross weight with snow tires on all four wheels, and those vehicles must carry chains for one set of drive wheels. Requirement 3 means chains or traction devices on all vehicles, no exceptions. Caltrans notes that a highway will often close before an R-3 condition is imposed.",
      "Three practical consequences follow for I-15 drivers. First, an exemption is not permission to travel empty handed: Caltrans states that vehicles without chains are not permitted to enter a chain control area, including exempt four wheel drive vehicles, which must carry a set of chains for one drive axle. Second, when signs require chains you must stop and put them on, drivers who do not can be cited and fined by the Highway Patrol, and the speed limit while chains are required is 25 or 30 miles per hour. Third, the two systems are cousins, not twins: the weight thresholds and the exact exception wording differ between Nevada and California, so read each posting on its own terms instead of carrying one state's rule across the line.",
    ],
  },
  {
    heading: "Wind is the posting this corridor actually gets",
    body: [
      "For most I-15 trips in Nevada, the restriction that matters is not about tires at all. NDOT warns that high winds are common throughout Nevada, that sudden gusts can push a vehicle sideways, and that blowing dust can cut visibility with little warning. Its high wind guidance names the vehicles most at risk plainly: high profile vehicles such as trucks, vans, and SUVs, and anything towing a trailer, are more vulnerable in high winds, including to rollover crashes. NDOT also instructs drivers to obey all posted wind advisories, restrictions, and roadway closures when they are in effect.",
      "On this corridor that warning fits the terrain. The open desert segments south toward Primm and north toward Mesquite, the climb at Mountain Pass, and the Virgin River Gorge leave tall and lightly loaded vehicles exposed, and gusts hit hardest where the road leaves shelter, on bridges and overpasses, and at canyon openings. Nevada 511 carries wind alerts on I-15 segments as live conditions, and this site shows them next to the segment status, so read a wind alert on your segment as an instruction attached to your trip and not as background color.",
      "The exact words of a wind posting matter. A caution or not advised posting is NDOT telling high profile drivers that conditions are marginal: slow down, keep both hands on the wheel, leave extra space around large vehicles, and seriously consider waiting it out. A posting that prohibits high profile vehicles, or closes the road, is not advice. It is a restriction, and the trip waits until it lifts. If gusts make it hard to hold your lane at any point, NDOT guidance is to pull into a safe parking area rather than stopping on the shoulder of a busy roadway, and to stay there until conditions improve.",
    ],
  },
];

export const LAW_FAQS = [
  {
    q: "Do I need chains to drive I-15 from Las Vegas into California?",
    a: "On most days, no posting of any kind is in effect and ordinary tires are all the road asks for. The place to watch is Mountain Pass in California, where a winter storm can bring a Caltrans chain control while Las Vegas stays clear and dry. Check the live segment status here before you leave, and in winter carry chains that fit your vehicle if you are crossing the pass, because Caltrans does not let any vehicle, including an exempt four wheel drive, enter a chain control area without chains on board.",
  },
  {
    q: "Is there a Nevada chain season with set dates?",
    a: "No. Nevada restrictions in the law and in Nevada 511 are posting driven, not calendar driven, so a requirement exists when NDOT posts it for that road and ends when the posting comes down. The October 1 to April 30 window you may see in NDOT material is about equipment, not about a duty to chain: NDOT advises drivers who have snow tires to install and use them between those dates, and NDOT's chain requirements document lists studded snow tires as permitted between October 1 and April 30.",
  },
  {
    q: "Does four wheel drive get me through a Nevada chain posting without chains?",
    a: "It depends on which posting is up. Under \"Chains or Snow Tires Required,\" a lighter vehicle complies with snow tires, chains, or traction devices, whatever its drive type. Under \"Chains Required, All Vehicles except 4-wheel drive with Snow tires,\" the only vehicles excused from chains or traction devices are 4-wheel drive vehicles with snow tires on all wheels. Four wheel drive on regular tires does not qualify, and on the three Tahoe area highways named on this page NDOT applies the same idea to four wheel and all wheel drive with snow tires.",
  },
  {
    q: "What applies to heavy vehicles and to towing?",
    a: "Weight removes the snow tire option in Nevada. Under a posting for traction devices, chains, or snow tires, a vehicle or combination over 10,000 pounds gross weight must be equipped with tire chains under NRS 484D.520. Required equipment goes on at least two driving wheels, and on at least two braking wheels of a trailer that has brakes or is required to have them, under NRS 484D.525. In California chain control, towing vehicles must chain one drive axle and a trailer with brakes must have chains on at least one axle, at every requirement level.",
  },
  {
    q: "What does a wind alert on my I-15 segment require me to do?",
    a: "Obey it as posted. NDOT instructs drivers to obey all posted wind advisories, restrictions, and closures, and a wind posting aimed at high profile vehicles applies to trucks, RVs, vans, SUVs, and vehicles towing trailers, which gusts can push out of a lane or over. If the posting prohibits high profile vehicles, do not enter until it lifts. If it is an advisory, slow down, keep both hands on the wheel, give large vehicles extra room, and if the vehicle will not hold its lane comfortably, pull into a safe parking area off the roadway and wait for the wind to drop.",
  },
];

export const LAW_SOURCES = [
  {
    label: "Nevada Revised Statutes, Chapter 484D, sections 484D.515 to 484D.530, Nevada Legislature",
    url: "https://www.leg.state.nv.us/NRS/NRS-484D.html",
  },
  {
    label: "Nevada Administrative Code, Chapter 484D, sections 484D.220 to 484D.230, Nevada Legislature",
    url: "https://www.leg.state.nv.us/division/legal/lawlibrary/nac/NAC-484D.html",
  },
  {
    label: "NDOT, Safe Winter Driving",
    url: "https://www.dot.nv.gov/safety/safe-winter-driving",
  },
  {
    label: "NDOT, Nevada Chain Requirements, traction device requirements document",
    url: "https://www.dot.nv.gov/home/showpublisheddocument/96/636178489821170000",
  },
  {
    label: "NDOT, Traction Device Requirement Changes on Certain Tahoe Highways",
    url: "https://www.dot.nv.gov/Home/Components/News/News/4074/16?cftype=News",
  },
  {
    label: "NDOT, High Wind Driving Safety Tips",
    url: "https://www.dot.nv.gov/safety/high-wind-driving-safety-tips",
  },
  {
    label: "Nevada 511 road conditions, NVRoads",
    url: "https://nvroads.com",
  },
  {
    label: "Caltrans, Chain Controls and Chain Installation",
    url: "https://dot.ca.gov/travel/winter-driving-tips/chain-controls",
  },
  {
    label: "Caltrans, Truck Chain Requirements",
    url: "https://dot.ca.gov/travel/winter-driving-tips/chain-requirements",
  },
];
