// World Schools Debate Motions
const worldSchoolsMotions = [
  // Easy Level
  "This House Would ban single-use plastics",
  "This House Believes that homework should be abolished",
  "This House Would make public transport free",
  "This House Believes that school uniforms should be optional",
  "This House Would lower the voting age to 16",
  
  // Medium Level
  "This House Would ban private schools",
  "This House Believes that social media has done more harm than good",
  "This House Would implement universal basic income",
  "This House Believes that democracy is the best form of government",
  "This House Would ban animal testing for cosmetic purposes",
  "This House Believes that artificial intelligence will benefit humanity more than harm it",
  "This House Would abolish the death penalty worldwide",
  "This House Believes that space exploration is worth the cost",
  "This House Would make voting compulsory",
  "This House Believes that globalization has done more good than harm",
  
  // Hard Level
  "This House Would replace prisons with rehabilitation centers",
  "This House Believes that economic growth should be sacrificed for environmental protection",
  "This House Would implement a global wealth tax",
  "This House Believes that national sovereignty is obsolete in the age of global challenges",
  "This House Would ban all forms of animal agriculture",
  "This House Believes that meritocracy is a myth",
  "This House Would dismantle the nuclear weapons arsenal",
  "This House Believes that cultural appropriation is harmful",
  "This House Would implement a four-day work week globally",
  "This House Believes that universal healthcare is a fundamental human right"
];

// British Parliamentary Debate Motions
const britishParliamentaryMotions = [
  // Easy Level
  "This House Would introduce a tax on sugary drinks",
  "This House Believes that students should have a say in curriculum design",
  "This House Would make community service mandatory for high school students",
  "This House Believes that fast food advertising should be banned during children's TV hours",
  "This House Would extend library opening hours",
  
  // Medium Level
  "This House Would introduce a tax on meat products",
  "This House Believes that cancel culture is toxic to public discourse",
  "This House Would replace prisons with rehabilitation centers",
  "This House Believes that nuclear energy is the solution to climate change",
  "This House Would ban single-use plastics globally",
  "This House Believes that traditional media is more reliable than social media",
  "This House Would implement a four-day work week",
  "This House Believes that cryptocurrency should be regulated like traditional finance",
  "This House Would abolish homework in schools",
  "This House Believes that remote work is the future of employment",
  
  // Hard Level
  "This House Would break up big tech companies",
  "This House Believes that post-colonial reparations are necessary",
  "This House Would implement a universal basic income funded by wealth tax",
  "This House Believes that democratic systems should incorporate elements of sortition",
  "This House Would ban all forms of animal agriculture",
  "This House Believes that cultural relativism undermines universal human rights",
  "This House Would abolish the concept of nation-states",
  "This House Believes that radical transparency in government is more harmful than beneficial",
  "This House Would implement negative interest rates to combat economic inequality",
  "This House Believes that technological unemployment requires a fundamental rethinking of work"
];

// World Schools Debate Roles
const worldSchoolsRoles = [
  "1st Speaker (Opening Government)",
  "2nd Speaker (Opening Government)", 
  "3rd Speaker (Opening Government)",
  "1st Speaker (Opening Opposition)",
  "2nd Speaker (Opening Opposition)",
  "3rd Speaker (Opening Opposition)"
];

// British Parliamentary Roles
const britishParliamentaryRoles = [
  "Prime Minister (Opening Government, 1st speaker)",
  "Leader of Opposition (Opening Opposition, 2nd speaker)",
  "Deputy Prime Minister (Closing Government, 3rd speaker)",
  "Deputy Leader of Opposition (Closing Opposition, 4th speaker)",
  "Government Member (Closing Government, 5th speaker)",
  "Opposition Member (Closing Opposition, 6th speaker)",
  "Government Whip (Closing Government, 7th speaker)",
  "Opposition Whip (Closing Opposition, 8th speaker)"
];

export function generateMotion(debateType: 'world-schools' | 'british-parliamentary'): string {
  const motions = debateType === 'world-schools' ? worldSchoolsMotions : britishParliamentaryMotions;
  const randomIndex = Math.floor(Math.random() * motions.length);
  return motions[randomIndex];
}

export function assignRole(debateType: 'world-schools' | 'british-parliamentary'): string {
  const roles = debateType === 'world-schools' ? worldSchoolsRoles : britishParliamentaryRoles;
  const randomIndex = Math.floor(Math.random() * roles.length);
  return roles[randomIndex];
}
