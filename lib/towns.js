export const TOWNS = [
  {
    slug: "las-vegas",
    name: "Las Vegas",
    state: "NV",
    lat: 36.1699,
    lon: -115.1398,
    elevation: 2001,
    corridors: ["las-vegas", "primm-state-line", "mountain-pass", "mesquite-virgin-river-gorge"],
    body: [
      "Las Vegas is where every drive on this corridor starts or ends. The valley floor sits at about 2,000 feet, ringed by mountains that collect weather the city itself never sees. A clear, calm morning on the Strip tells you almost nothing about Mountain Pass to the southwest or the Virgin River Gorge to the northeast, because both of those places sit higher, sit in different terrain, and answer to different storm tracks. What Las Vegas weather does tell you is real: valley wind means crosswinds on the open freeway, valley rain means slick roads and slowdowns on the urban stretch, and valley heat in summer means your cooling system and your water supply matter before you leave town.",
      "As a driving base, the city is the corridor's full service hub. Fuel, food, tires, towing, and lodging exist at nearly every exit, and the freeway through town is wide and well lit. That abundance ends quickly in both directions. Southbound, services thin out past Sloan and Jean on the way to Primm and the California climb. Northbound, you pass through North Las Vegas and the edge of the valley and then commit to a long, open run toward Mesquite and the Gorge. Check the live verdict for the segment you are actually driving, not the sky above the Strip, and leave with a full tank even when the trip looks short.",
    ],
    driveNote:
      "I-15 runs the length of the valley from the south end by the airport and the Strip to the north end past downtown. Use the segment verdict for your direction of travel, because conditions south toward Primm and north toward Mesquite often have nothing in common.",
  },
  {
    slug: "henderson",
    name: "Henderson",
    state: "NV",
    lat: 36.0397,
    lon: -115.9817,
    elevation: 1337,
    corridors: ["las-vegas"],
    body: [
      "Henderson is the quiet side of the valley, a residential city spread across the south and southeast, lower in elevation than most of Las Vegas and sheltered in its own basin. Weather here is valley weather: hot and dry for most of the year, with wind and the occasional fast moving storm as the main driving concerns. It tells you a fair amount about the first miles of a trip south on I-15, because Henderson connects directly into that freeway, and it tells you very little about what waits at Mountain Pass or in the Virgin River Gorge. Those places are hours and thousands of feet away from a Henderson driveway.",
      "The town's role on the corridor is as a starting point and a junction. Henderson is where I-215, the southern beltway, meets I-11, and that interchange shapes how south valley drivers reach I-15 for California trips. Many locals never drive through the center of Las Vegas at all: they take the beltway or I-11 across, join I-15 south of the Strip, and are on open desert road while the urban freeway is still busy. It is a practical, low drama way to begin a long drive, with fuel and food available along the main commercial corridors before you commit to the freeway.",
    ],
    driveNote:
      "Reach I-15 from Henderson by way of I-215 west or I-11 north, joining the freeway south of the Strip. Top off fuel in Henderson if you are heading south, because the next dependable services are at Primm, with only limited stops in between.",
  },
  {
    slug: "north-las-vegas",
    name: "North Las Vegas",
    state: "NV",
    lat: 36.1989,
    lon: -115.1175,
    elevation: 2205,
    corridors: ["las-vegas"],
    body: [
      "North Las Vegas sits at the top of the valley, slightly higher than the Strip and closer to the mountains that frame the north end. Its weather is still desert valley weather, but the north end catches wind differently, and gusts that funnel down from the ranges can make the open freeway lanes feel unsettled even on an otherwise clear day. What you see here is a decent guide to the first stretch of a northbound drive and a poor guide to the Virgin River Gorge, where the road drops into a river canyon in another state and the hazards change from wind to curves, rockfall, and flash flood risk.",
      "This is the working end of the corridor. The Las Vegas Motor Speedway sits out here, and on race weekends the freeway around it changes character completely, with heavy event traffic joining the normal flow of trucks and through travelers. North Las Vegas is also the last fully serviced part of the valley for northbound drivers. Beyond the city, I-15 crosses open desert with long gaps between exits, so the fuel, food, and restroom stop you skip here is the one you will wish you had taken once the road empties out toward Mesquite.",
    ],
    driveNote:
      "I-15 serves North Las Vegas directly, with the Speedway exits at the far north end of town. On event days at the Speedway, allow extra time just to clear the valley, and fuel up in town before starting the long run north.",
  },
  {
    slug: "primm",
    name: "Primm",
    state: "NV",
    lat: 35.6123,
    lon: -115.385,
    elevation: 2610,
    corridors: ["primm-state-line", "mountain-pass"],
    body: [
      "Primm exists because of a line on a map. The casinos, fuel, and food clustered at this exit sit right at the Nevada and California state line, and the town has one job on the corridor: it is the pause button between the Las Vegas valley and the Mojave Desert climb ahead. Primm sits a little higher than Las Vegas and a little closer to the mountains, so a cold or windy morning here is a better hint about Mountain Pass than anything you saw leaving the valley. It is still only a hint. The summit is higher again, and snow or ice can be waiting up there on a day when Primm itself is merely chilly.",
      "For drivers, Primm is the last Nevada stop southbound and the first Nevada stop northbound, and both roles matter. Southbound, it is your last easy chance for fuel and a break before the road commits to the long grade up toward Mountain Pass and the sparse services beyond it. Northbound, arriving at Primm means the hardest part of the California drive is behind you and the valley is less than an hour ahead in free flow. Traffic tells a story here too: if the freeway is already backing up at Primm on a Sunday, that is the famous southbound queue forming, not a local slowdown, and the rest of the drive toward California deserves a conditions check before you settle in.",
    ],
    driveNote:
      "Everything in Primm is at the single I-15 exit at the state line, with fuel, food, and lodging on both sides of the freeway. If you need services before the Mountain Pass climb, take them here rather than counting on the smaller stops ahead.",
  },
  {
    slug: "jean",
    name: "Jean",
    state: "NV",
    lat: 35.7842,
    lon: -115.3268,
    elevation: 2841,
    corridors: ["primm-state-line"],
    body: [
      "Jean is a very small place with an outsized job. There is little here beyond a casino, fuel, and a handful of services at the exit, but Jean sits on the open stretch of I-15 between the Las Vegas valley and the state line, at an elevation noticeably higher than the city. That height shows in the weather. Jean runs cooler than Las Vegas, catches more wind, and in winter can see a dusting or a hard freeze when the valley is only cold. It is the first honest checkpoint southbound: if the wind is pushing your vehicle around at Jean, expect more of it on the exposed road ahead.",
      "Behind Jean, to the west, sits Goodsprings, an old mining town reached by a short side road, a reminder that this empty looking desert was worked and settled long before the freeway. For corridor drivers, Jean's role is simpler. It is a quick, easy on and off stop for fuel or a break, without the size and bustle of Primm, and it is one of the last services of any kind before the state line. Northbound, Jean is the signal that you are back in the home stretch, with the valley's lights ahead and the desert drive nearly done.",
    ],
    driveNote:
      "Jean has one I-15 exit with basic services, and the side road west leads a few miles to Goodsprings. It is a good quick stop, but for a full meal, a room, or vehicle help, Primm and the Las Vegas valley are the real options.",
  },
  {
    slug: "mesquite",
    name: "Mesquite",
    state: "NV",
    lat: 36.8055,
    lon: -114.0669,
    elevation: 1593,
    corridors: ["mesquite-virgin-river-gorge"],
    body: [
      "Mesquite sits in the Virgin River valley at the edge of Nevada, a golf and snowbird town built around warm winters, green fairways in the middle of desert, and a steady flow of visitors who arrive on I-15. It is the lowest town on this list, and its sheltered valley weather can be mild and still while the road just northeast of town is doing something else entirely. That road is the Virgin River Gorge in Arizona, where the freeway leaves the open valley, drops into a winding river canyon, and picks up hazards Mesquite never sees at home: tight curves, rockfall areas, and water on the road during desert storms.",
      "As a driving base, Mesquite is the gateway town for the Gorge. Southbound, it is the first Nevada town after you climb out of the canyon, with fuel, food, casinos, and lodging ready at the exits. Northbound, it is the last full stop before the Gorge and the run on to St. George, so it is the natural place to check the Gorge verdict before you enter a stretch where turning around is not really an option. Mesquite also serves the local roads into the Arizona Strip and toward Lake Mead country, which makes its exits busy with trailers, RVs, and boats in the warm months.",
    ],
    driveNote:
      "Mesquite has several I-15 exits with full services on both sides of town. Northbound drivers should fuel and check the Virgin River Gorge conditions here, because there are no services inside the Gorge itself.",
  },
  {
    slug: "barstow",
    name: "Barstow",
    state: "CA",
    lat: 34.8958,
    lon: -117.0173,
    elevation: 2175,
    corridors: ["mountain-pass"],
    body: [
      "Barstow is a Mojave Desert junction town, plain and practical, built where routes cross. I-15 meets I-40 here, and trains, trucks, and desert travelers have been passing through this crossing for a long time. Barstow weather is high desert weather, closer in spirit to Mountain Pass than to the coast: cold nights in winter, serious heat in summer, and wind that can rake the open freeway in any season. A windy day in Barstow is useful information for the climb northeast toward the pass. A calm day here guarantees nothing, because the summit country has its own weather, but Barstow at least speaks the same desert language.",
      "The town's role on the corridor is as the southwest anchor of the Las Vegas drive. Everything between Barstow and Las Vegas is open desert with widely spaced services, so Barstow is where eastbound drivers fuel, eat, and decide they are ready for that run, and where westbound drivers exhale after it. The I-40 junction also makes Barstow a decision point: continue on I-15 toward Los Angeles and the Cajon Pass country, or turn east on I-40 toward Needles and Arizona. Either way, Barstow is the last town of real size until the road reaches somewhere else entirely.",
    ],
    driveNote:
      "Barstow has multiple I-15 exits with full services, and I-40 splits off at the east side of town. Fuel here before driving northeast toward Las Vegas, because the services between Barstow and Primm are few and far apart.",
  },
  {
    slug: "st-george",
    name: "St. George",
    state: "UT",
    lat: 37.0965,
    lon: -113.5684,
    elevation: 2700,
    corridors: ["mesquite-virgin-river-gorge"],
    body: [
      "St. George is the red rock gateway at the Utah end of the corridor, a fast growing city set among sandstone cliffs at about 2,700 feet. Its winters are milder than the rest of Utah, which is exactly why people move and visit here, and its weather can feel a world apart from both the Las Vegas valley and the higher Utah country beyond. For drivers, the key point is the road behind it: the Virgin River Gorge, in Arizona, between St. George and Mesquite. A sunny St. George afternoon says little about conditions in that canyon, where storms can drop heavy rain on the river corridor and send water and rock onto the roadway while the city stays dry.",
      "As a driving base, St. George is the north anchor of this site. It is the jumping off point for Zion National Park and the rest of southern Utah's park country, and it is the first full city for southbound drivers who have come through the Gorge. It is also a commitment point in the other direction. Leaving St. George southbound, you soon leave Utah, cross a corner of Arizona inside the Gorge, and reach Nevada at Mesquite, three states in one short drive, with no services in the canyon stretch. Check the Gorge verdict in St. George, fuel in the city, and treat the canyon as the drive it is, not as a short hop between towns.",
    ],
    driveNote:
      "St. George has several I-15 exits with full services, and the roads to Zion and the other southern Utah parks branch off from here. Southbound, fuel and check conditions in St. George before entering the Virgin River Gorge, where there are no exits with services.",
  },
];

export function getTown(slug) {
  return TOWNS.find((t) => t.slug === slug) || null;
}
