export const COMPARES = [
  {
    slug: "mountain-pass-vs-virgin-river-gorge",
    title: "Mountain Pass vs the Virgin River Gorge",
    corridorSlugs: ["mountain-pass", "mesquite-virgin-river-gorge"],
    intro:
      "I-15 out of Las Vegas has two signature drives, and they could hardly be less alike. Southwest, toward California, the freeway climbs over Mountain Pass, a high desert summit where the worry is altitude: winter snow, ice, and wind on an open, exposed grade. Northeast, toward Utah, the freeway drops into the Virgin River Gorge, a winding river canyon where the worry is water: tight curves, rockfall, and flash floods fed by desert storms. Same freeway, same valley in the middle, two completely different drives. Which one deserves your caution depends entirely on the season and the sky, and this page compares them so you can read the right verdict the right way.",
    body: [
      "Mountain Pass is a drive about height and exposure. The road climbs steadily out of the desert at Primm into open summit country, with long grades, big views, and nothing to block the wind. Its hazards follow the calendar in a familiar mountain pattern. Winter is the season of worry, when storms can bring snow, ice, and freezing fog to the summit while Las Vegas and Barstow, at either end, stay dry and merely cold. Summer flips the problem rather than removing it: heat works on vehicles instead of drivers, and the climb fills with overheated cars on the shoulder. The road itself stays wide and mostly straight, so a Mountain Pass problem usually announces itself as weather or a slowdown on the grade, and the sensible responses are simple: check the verdict before Primm, slow down, and give trucks room on the climb and the descent.",
      "The Virgin River Gorge is a drive about confinement and water. Between Mesquite and St. George, the freeway leaves the open desert, enters Arizona, and follows the Virgin River through a deep canyon, trading the straight lines of the rest of the corridor for sustained curves between rock walls. Its hazards follow storms more than seasons. Heavy desert rain, most common in the summer monsoon pattern but possible whenever a strong storm crosses the canyon, can put water and debris on the roadway, raise flash flood risk along the river, and loosen rock onto the road. There are no services and no easy exits inside the Gorge, so you cannot simply pull off and wait the way you can on the open road at Primm or Baker. The Gorge asks for its decision in advance: read its verdict in Mesquite or St. George, and if the canyon is flagged for storm conditions, waiting in town is a real option. Two drives, two rulebooks. Mountain Pass rewards watching the winter forecast and respecting altitude. The Gorge rewards watching the storm sky and respecting water. Knowing which drive you are actually taking, and which kind of trouble belongs to it, is most of what this corridor asks of a driver.",
    ],
    faqs: [
      {
        q: "Which is more likely to slow me down, Mountain Pass or the Virgin River Gorge?",
        a: "It depends on the day, and that is the point of the comparison. Mountain Pass slowdowns are usually winter weather on the summit grades or heavy weekend volume on the California corridor. Gorge slowdowns are usually storm related, a crash on the curves, or rock and debris work in a canyon with no alternate route. Check the verdict for the specific segment you are driving, because a problem in one says nothing about the other.",
      },
      {
        q: "What season is each drive most worrying?",
        a: "Mountain Pass worries in winter, when its elevation can turn a cold storm into snow and ice on the grades. The Gorge worries most in storm season, especially the summer monsoon pattern, when intense desert rain can send water, debris, and rock into the canyon roadway and raise flash flood risk. Wind can affect both drives in any season, since Mountain Pass is exposed and the Gorge funnels gusts between its walls.",
      },
      {
        q: "Can I wait out a problem in either place?",
        a: "At Mountain Pass, usually yes, in the towns at either end. Primm sits below the climb on the Nevada side and Baker and Barstow serve the California side, so waiting is practical. In the Gorge, there are no services and no real exits between Mesquite and St. George, so the waiting has to happen before you enter, in one of those two towns. That difference is why the Gorge verdict deserves a look before every trip, even a familiar one.",
      },
    ],
  },
];

export function getCompare(slug) {
  return COMPARES.find((c) => c.slug === slug) || null;
}
