/*
 * Book data, compiled from memory (not fetched live), so details may contain errors.
 * - TOP: 100 top-ranked novels from Goodreads' "Best Horror Novels" Listopia list.
 * - EXTRA: "deeper cuts" used for recommendations (shown in the catalogue only if they won an award).
 * - ADDED: award winners and classic-canon novels outside the top 100.
 * Format: [title, author, year, [tags]]. Rank = position in the array.
 */
(function () {
  const TOP = [
    ["The Shining", "Stephen King", 1977, ["haunted-house", "ghosts", "psychological", "isolation", "family"]],
    ["It", "Stephen King", 1986, ["monsters", "childhood", "coming-of-age", "small-town", "cosmic", "epic"]],
    ["Dracula", "Bram Stoker", 1897, ["vampires", "gothic", "classic"]],
    ["Frankenstein", "Mary Shelley", 1818, ["gothic", "classic", "monsters", "sci-fi", "literary"]],
    ["Pet Sematary", "Stephen King", 1983, ["grief", "family", "folk-horror", "cursed"]],
    ["'Salem's Lot", "Stephen King", 1975, ["vampires", "small-town", "religious"]],
    ["The Stand", "Stephen King", 1978, ["apocalyptic", "epic", "survival", "religious"]],
    ["Carrie", "Stephen King", 1974, ["psychic", "coming-of-age", "religious", "family"]],
    ["The Haunting of Hill House", "Shirley Jackson", 1959, ["haunted-house", "ghosts", "psychological", "classic", "literary"]],
    ["The Exorcist", "William Peter Blatty", 1971, ["possession", "demonic", "religious", "family"]],
    ["Interview with the Vampire", "Anne Rice", 1976, ["vampires", "gothic", "dark-fantasy", "literary"]],
    ["House of Leaves", "Mark Z. Danielewski", 2000, ["haunted-house", "psychological", "cosmic", "literary", "isolation"]],
    ["Misery", "Stephen King", 1987, ["psychological", "isolation", "thriller", "survival"]],
    ["Something Wicked This Way Comes", "Ray Bradbury", 1962, ["childhood", "coming-of-age", "dark-fantasy", "small-town", "classic"]],
    ["The Silence of the Lambs", "Thomas Harris", 1988, ["serial-killer", "thriller", "psychological", "mystery"]],
    ["World War Z", "Max Brooks", 2006, ["zombies", "apocalyptic", "sci-fi", "survival"]],
    ["Bird Box", "Josh Malerman", 2014, ["apocalyptic", "survival", "monsters", "psychological", "family"]],
    ["I Am Legend", "Richard Matheson", 1954, ["vampires", "apocalyptic", "isolation", "sci-fi", "classic"]],
    ["Rebecca", "Daphne du Maurier", 1938, ["gothic", "psychological", "classic", "mystery", "literary"]],
    ["Rosemary's Baby", "Ira Levin", 1967, ["cult", "demonic", "psychological", "religious"]],
    ["The Strange Case of Dr. Jekyll and Mr. Hyde", "Robert Louis Stevenson", 1886, ["gothic", "classic", "psychological", "monsters"]],
    ["The Picture of Dorian Gray", "Oscar Wilde", 1890, ["gothic", "classic", "cursed", "literary"]],
    ["The Turn of the Screw", "Henry James", 1898, ["ghosts", "classic", "psychological", "childhood", "gothic"]],
    ["Mexican Gothic", "Silvia Moreno-Garcia", 2020, ["gothic", "haunted-house", "body-horror", "historical", "family"]],
    ["Hell House", "Richard Matheson", 1971, ["haunted-house", "ghosts", "possession", "extreme"]],
    ["Ghost Story", "Peter Straub", 1979, ["ghosts", "small-town", "literary", "mystery"]],
    ["The Amityville Horror", "Jay Anson", 1977, ["haunted-house", "demonic", "family"]],
    ["Coraline", "Neil Gaiman", 2002, ["childhood", "dark-fantasy", "monsters", "family"]],
    ["Cujo", "Stephen King", 1981, ["creature", "survival", "small-town", "family"]],
    ["Red Dragon", "Thomas Harris", 1981, ["serial-killer", "thriller", "mystery", "psychological"]],
    ["Heart-Shaped Box", "Joe Hill", 2007, ["ghosts", "cursed", "thriller", "psychological"]],
    ["NOS4A2", "Joe Hill", 2013, ["dark-fantasy", "childhood", "family", "thriller", "epic"]],
    ["Doctor Sleep", "Stephen King", 2013, ["psychic", "childhood", "thriller", "ghosts"]],
    ["Bag of Bones", "Stephen King", 1998, ["ghosts", "grief", "small-town", "haunted-house"]],
    ["The Talisman", "Stephen King & Peter Straub", 1984, ["dark-fantasy", "coming-of-age", "epic", "werewolves"]],
    ["Needful Things", "Stephen King", 1991, ["small-town", "demonic", "cursed", "humor"]],
    ["Christine", "Stephen King", 1983, ["cursed", "coming-of-age", "possession"]],
    ["The Dead Zone", "Stephen King", 1979, ["psychic", "thriller", "small-town"]],
    ["Firestarter", "Stephen King", 1980, ["psychic", "thriller", "sci-fi", "family"]],
    ["The Outsider", "Stephen King", 2018, ["mystery", "monsters", "thriller", "small-town"]],
    ["Duma Key", "Stephen King", 2008, ["ghosts", "isolation", "psychic", "grief"]],
    ["Revival", "Stephen King", 2014, ["cosmic", "religious", "grief", "literary"]],
    ["The Green Mile", "Stephen King", 1996, ["psychic", "historical", "literary", "religious"]],
    ["Gerald's Game", "Stephen King", 1992, ["psychological", "isolation", "survival"]],
    ["The Institute", "Stephen King", 2019, ["psychic", "childhood", "thriller", "sci-fi"]],
    ["Swan Song", "Robert McCammon", 1987, ["apocalyptic", "epic", "survival", "demonic"]],
    ["Boy's Life", "Robert McCammon", 1991, ["coming-of-age", "small-town", "mystery", "literary"]],
    ["Summer of Night", "Dan Simmons", 1991, ["childhood", "coming-of-age", "small-town", "monsters"]],
    ["Carrion Comfort", "Dan Simmons", 1989, ["psychic", "thriller", "epic", "historical"]],
    ["The Terror", "Dan Simmons", 2007, ["historical", "survival", "monsters", "isolation"]],
    ["Watchers", "Dean Koontz", 1987, ["creature", "sci-fi", "thriller"]],
    ["Phantoms", "Dean Koontz", 1983, ["monsters", "small-town", "cosmic", "sci-fi"]],
    ["Odd Thomas", "Dean Koontz", 2003, ["ghosts", "psychic", "mystery", "humor", "small-town"]],
    ["The Keep", "F. Paul Wilson", 1981, ["vampires", "historical", "dark-fantasy"]],
    ["The Hellbound Heart", "Clive Barker", 1986, ["demonic", "body-horror", "extreme"]],
    ["The Girl Next Door", "Jack Ketchum", 1989, ["extreme", "psychological", "childhood", "coming-of-age"]],
    ["Off Season", "Jack Ketchum", 1980, ["extreme", "survival", "body-horror"]],
    ["Lost Souls", "Poppy Z. Brite", 1992, ["vampires", "gothic", "extreme", "southern-gothic"]],
    ["The Woman in Black", "Susan Hill", 1983, ["ghosts", "gothic", "isolation", "haunted-house"]],
    ["The Little Stranger", "Sarah Waters", 2009, ["haunted-house", "historical", "literary", "psychological"]],
    ["Dark Matter", "Michelle Paver", 2010, ["ghosts", "isolation", "historical", "survival"]],
    ["Let the Right One In", "John Ajvide Lindqvist", 2004, ["vampires", "childhood", "coming-of-age", "literary"]],
    ["The Historian", "Elizabeth Kostova", 2005, ["vampires", "historical", "mystery", "literary"]],
    ["A Head Full of Ghosts", "Paul Tremblay", 2015, ["possession", "psychological", "family", "religious"]],
    ["The Cabin at the End of the World", "Paul Tremblay", 2018, ["psychological", "apocalyptic", "religious", "family", "isolation"]],
    ["The Only Good Indians", "Stephen Graham Jones", 2020, ["folk-horror", "literary", "monsters", "cursed"]],
    ["My Heart Is a Chainsaw", "Stephen Graham Jones", 2021, ["slasher", "coming-of-age", "small-town"]],
    ["Hex", "Thomas Olde Heuvelt", 2016, ["witchcraft", "small-town", "folk-horror", "cursed"]],
    ["The Troop", "Nick Cutter", 2014, ["body-horror", "survival", "isolation", "coming-of-age", "extreme"]],
    ["The Deep", "Nick Cutter", 2015, ["body-horror", "isolation", "cosmic", "extreme"]],
    ["The Ruins", "Scott Smith", 2006, ["survival", "creature", "isolation", "body-horror"]],
    ["The Fisherman", "John Langan", 2016, ["cosmic", "grief", "literary", "folk-horror"]],
    ["The Library at Mount Char", "Scott Hawkins", 2015, ["dark-fantasy", "cosmic", "extreme"]],
    ["Annihilation", "Jeff VanderMeer", 2014, ["sci-fi", "cosmic", "isolation", "literary"]],
    ["The Girl with All the Gifts", "M.R. Carey", 2014, ["zombies", "apocalyptic", "sci-fi", "childhood"]],
    ["The Passage", "Justin Cronin", 2010, ["vampires", "apocalyptic", "epic", "sci-fi"]],
    ["The Strain", "Guillermo del Toro & Chuck Hogan", 2009, ["vampires", "apocalyptic", "thriller"]],
    ["Psycho", "Robert Bloch", 1959, ["serial-killer", "psychological", "classic", "slasher"]],
    ["We Have Always Lived in the Castle", "Shirley Jackson", 1962, ["gothic", "psychological", "family", "literary", "classic"]],
    ["American Psycho", "Bret Easton Ellis", 1991, ["serial-killer", "extreme", "psychological", "literary"]],
    ["Hannibal", "Thomas Harris", 1999, ["serial-killer", "thriller", "extreme"]],
    ["Ring", "Koji Suzuki", 1991, ["cursed", "ghosts", "mystery", "thriller"]],
    ["Burnt Offerings", "Robert Marasco", 1973, ["haunted-house", "family", "psychological"]],
    ["The Other", "Thomas Tryon", 1971, ["psychological", "childhood", "family", "small-town"]],
    ["The Elementals", "Michael McDowell", 1981, ["haunted-house", "southern-gothic", "family"]],
    ["At the Mountains of Madness", "H.P. Lovecraft", 1936, ["cosmic", "sci-fi", "isolation", "classic"]],
    ["The Case of Charles Dexter Ward", "H.P. Lovecraft", 1941, ["cosmic", "witchcraft", "classic", "mystery"]],
    ["Carmilla", "Sheridan Le Fanu", 1872, ["vampires", "gothic", "classic"]],
    ["The Phantom of the Opera", "Gaston Leroux", 1910, ["gothic", "classic", "mystery"]],
    ["The Monk", "Matthew Gregory Lewis", 1796, ["gothic", "religious", "demonic", "classic"]],
    ["The Hunger", "Alma Katsu", 2018, ["historical", "survival", "monsters", "folk-horror"]],
    ["Tender Is the Flesh", "Agustina Bazterrica", 2017, ["extreme", "literary", "body-horror", "sci-fi"]],
    ["Hidden Pictures", "Jason Rekulak", 2022, ["ghosts", "mystery", "childhood", "thriller"]],
    ["How to Sell a Haunted House", "Grady Hendrix", 2023, ["haunted-house", "family", "cursed", "humor", "grief"]],
    ["The Final Girl Support Group", "Grady Hendrix", 2021, ["slasher", "thriller", "humor"]],
    ["My Best Friend's Exorcism", "Grady Hendrix", 2016, ["possession", "coming-of-age", "humor", "demonic"]],
    ["Horrorstör", "Grady Hendrix", 2014, ["haunted-house", "humor", "ghosts"]],
    ["Imaginary Friend", "Stephen Chbosky", 2019, ["childhood", "religious", "small-town", "epic"]],
    ["The Silent Companions", "Laura Purcell", 2017, ["gothic", "historical", "haunted-house", "cursed"]],
    ["Lovecraft Country", "Matt Ruff", 2016, ["cosmic", "historical", "witchcraft", "family"]]
  ];

  const EXTRA = [
    ["The Twisted Ones", "T. Kingfisher", 2019, ["folk-horror", "isolation", "humor", "monsters"]],
    ["What Moves the Dead", "T. Kingfisher", 2022, ["gothic", "body-horror", "classic"]],
    ["The Hacienda", "Isabel Cañas", 2022, ["gothic", "haunted-house", "historical", "religious"]],
    ["Plain Bad Heroines", "Emily M. Danforth", 2020, ["gothic", "cursed", "literary", "historical"]],
    ["White Is for Witching", "Helen Oyeyemi", 2009, ["haunted-house", "family", "literary", "gothic"]],
    ["The Damnation Game", "Clive Barker", 1985, ["demonic", "extreme", "dark-fantasy"]],
    ["Experimental Film", "Gemma Files", 2015, ["cosmic", "psychological", "folk-horror", "family"]],
    ["The Ballad of Black Tom", "Victor LaValle", 2016, ["cosmic", "historical", "literary"]],
    ["The Changeling", "Victor LaValle", 2017, ["folk-horror", "family", "dark-fantasy", "literary"]],
    ["Ring Shout", "P. Djèlí Clark", 2020, ["historical", "monsters", "dark-fantasy", "cosmic"]],
    ["The Croning", "Laird Barron", 2012, ["cosmic", "cult", "folk-horror"]],
    ["The Southern Book Club's Guide to Slaying Vampires", "Grady Hendrix", 2020, ["vampires", "humor", "small-town", "southern-gothic"]],
    ["We Sold Our Souls", "Grady Hendrix", 2018, ["demonic", "humor", "cult"]],
    ["Come Closer", "Sara Gran", 2003, ["possession", "psychological", "demonic"]],
    ["The Loney", "Andrew Michael Hurley", 2014, ["folk-horror", "religious", "isolation", "literary"]],
    ["Wylding Hall", "Elizabeth Hand", 2015, ["folk-horror", "haunted-house", "mystery"]],
    ["Song of Kali", "Dan Simmons", 1985, ["cult", "religious", "extreme"]],
    ["The Cipher", "Kathe Koja", 1991, ["body-horror", "cosmic", "psychological", "extreme"]],
    ["The Auctioneer", "Joan Samson", 1975, ["small-town", "psychological", "folk-horror"]],
    ["Harvest Home", "Thomas Tryon", 1973, ["folk-horror", "cult", "small-town", "witchcraft"]],
    ["Slade House", "David Mitchell", 2015, ["haunted-house", "dark-fantasy", "literary", "psychic"]],
    ["The Shining Girls", "Lauren Beukes", 2013, ["serial-killer", "sci-fi", "thriller"]],
    ["Broken Monsters", "Lauren Beukes", 2014, ["serial-killer", "mystery", "body-horror"]],
    ["Our Share of Night", "Mariana Enríquez", 2019, ["cult", "family", "epic", "literary", "body-horror"]],
    ["Penpal", "Dathan Auerbach", 2012, ["childhood", "psychological", "mystery"]],
    ["Kill Creek", "Scott Thomas", 2017, ["haunted-house", "ghosts", "extreme"]],
    ["The Ritual", "Adam Nevill", 2011, ["folk-horror", "survival", "isolation", "cult"]],
    ["Last Days", "Adam Nevill", 2012, ["cult", "ghosts", "mystery"]],
    ["Bunny", "Mona Awad", 2019, ["psychological", "witchcraft", "humor", "literary"]],
    ["The Fervor", "Alma Katsu", 2022, ["historical", "folk-horror", "family"]],
    ["The Wolfen", "Whitley Strieber", 1978, ["werewolves", "thriller", "creature"]],
    ["Koko", "Peter Straub", 1988, ["serial-killer", "psychological", "historical", "literary"]],
    ["Floating Dragon", "Peter Straub", 1983, ["small-town", "monsters", "epic"]],
    ["The Cellar", "Richard Laymon", 1980, ["extreme", "creature", "haunted-house"]],
    ["Survivor Song", "Paul Tremblay", 2020, ["zombies", "apocalyptic", "survival"]],
    ["Black Mad Wheel", "Josh Malerman", 2017, ["psychological", "mystery", "sci-fi"]],
    ["The Pallbearers Club", "Paul Tremblay", 2022, ["vampires", "psychological", "coming-of-age", "humor"]],
    ["Blackwater", "Michael McDowell", 1983, ["southern-gothic", "family", "monsters", "epic"]],
    ["Ghost Eaters", "Clay McLeod Chapman", 2022, ["ghosts", "grief", "psychological"]],
    ["The Book of Accidents", "Chuck Wendig", 2021, ["haunted-house", "family", "cosmic", "small-town"]],
    ["Episode Thirteen", "Craig DiLouie", 2023, ["haunted-house", "ghosts", "mystery", "psychological"]],
    ["Feed", "Mira Grant", 2010, ["zombies", "apocalyptic", "sci-fi", "thriller"]]
  ];

  // Award winners and classics that aren't in the top 100. Append only: ids come from position.
  const ADDED = [
    // Bram Stoker Award, novel
    ["Mine", "Robert McCammon", 1990, ["psychological", "thriller", "cult"]],
    ["Blood of the Lamb", "Thomas F. Monteleone", 1992, ["religious", "thriller", "demonic"]],
    ["The Throat", "Peter Straub", 1993, ["serial-killer", "mystery", "literary", "psychological"]],
    ["Dead in the Water", "Nancy Holder", 1994, ["ghosts", "isolation", "cursed"]],
    ["Zombie", "Joyce Carol Oates", 1995, ["serial-killer", "psychological", "literary", "extreme"]],
    ["Children of the Dusk", "Janet Berliner & George Guthridge", 1997, ["dark-fantasy", "historical", "epic"]],
    ["Mr. X", "Peter Straub", 1999, ["cosmic", "family", "mystery", "literary"]],
    ["The Traveling Vampire Show", "Richard Laymon", 2000, ["vampires", "coming-of-age", "small-town"]],
    ["American Gods", "Neil Gaiman", 2001, ["dark-fantasy", "epic", "literary"]],
    ["The Night Class", "Tom Piccirilli", 2002, ["ghosts", "mystery", "psychological"]],
    ["Lost Boy Lost Girl", "Peter Straub", 2003, ["haunted-house", "serial-killer", "grief", "literary"]],
    ["In the Night Room", "Peter Straub", 2004, ["psychological", "ghosts", "literary"]],
    ["Creepers", "David Morrell", 2005, ["survival", "thriller", "isolation"]],
    ["Lisey's Story", "Stephen King", 2006, ["grief", "dark-fantasy", "psychological"]],
    ["The Missing", "Sarah Langan", 2007, ["small-town", "apocalyptic", "body-horror"]],
    ["Audrey's Door", "Sarah Langan", 2009, ["haunted-house", "psychological"]],
    ["Flesh Eaters", "Joe McKinney", 2011, ["zombies", "apocalyptic", "survival"]],
    ["The Drowning Girl", "Caitlín R. Kiernan", 2012, ["psychological", "ghosts", "literary"]],
    ["Blood Kin", "Steve Rasnic Tem", 2014, ["southern-gothic", "family", "historical", "cult"]],
    ["Ararat", "Christopher Golden", 2017, ["demonic", "isolation", "survival", "religious"]],
    ["Coyote Rage", "Owl Goingback", 2019, ["folk-horror", "monsters", "survival"]],
    ["Don't Fear the Reaper", "Stephen Graham Jones", 2022, ["slasher", "small-town"]],
    ["The Reformatory", "Tananarive Due", 2023, ["ghosts", "historical", "childhood", "southern-gothic"]],
    // Bram Stoker Award, first novel
    ["The Revelation", "Bentley Little", 1990, ["small-town", "religious", "demonic"]],
    ["The Rust Maidens", "Gwendolyn Kiste", 2018, ["body-horror", "coming-of-age", "small-town"]],
    // Shirley Jackson Award, novel
    ["Generation Loss", "Elizabeth Hand", 2007, ["psychological", "isolation", "mystery", "literary"]],
    ["The Shadow Year", "Jeffrey Ford", 2008, ["childhood", "coming-of-age", "mystery", "literary"]],
    ["Big Machine", "Victor LaValle", 2009, ["cult", "cosmic", "literary"]],
    ["Mr. Shivers", "Robert Jackson Bennett", 2010, ["historical", "dark-fantasy", "survival"]],
    ["Witches on the Road Tonight", "Sheri Holman", 2011, ["witchcraft", "family", "literary"]],
    ["American Elsewhere", "Robert Jackson Bennett", 2013, ["cosmic", "small-town", "sci-fi"]],
    ["The Hole", "Hye-young Pyun", 2017, ["psychological", "isolation", "literary"]],
    // Goodreads Choice Awards, horror
    ["The Fireman", "Joe Hill", 2016, ["apocalyptic", "survival", "epic"]],
    ["Sleeping Beauties", "Stephen King & Owen King", 2017, ["dark-fantasy", "small-town", "epic"]],
    ["Holly", "Stephen King", 2023, ["serial-killer", "mystery", "thriller"]],
    // Classic canon
    ["The Castle of Otranto", "Horace Walpole", 1764, ["gothic", "classic"]],
    ["The Mysteries of Udolpho", "Ann Radcliffe", 1794, ["gothic", "classic", "mystery"]],
    ["Melmoth the Wanderer", "Charles Maturin", 1820, ["gothic", "classic", "demonic", "religious"]],
    ["The Private Memoirs and Confessions of a Justified Sinner", "James Hogg", 1824, ["gothic", "classic", "religious", "psychological"]],
    ["Uncle Silas", "Sheridan Le Fanu", 1864, ["gothic", "classic", "mystery"]],
    ["The Great God Pan", "Arthur Machen", 1894, ["cosmic", "classic", "folk-horror"]],
    ["The Beetle", "Richard Marsh", 1897, ["classic", "monsters", "mystery"]],
    ["The House on the Borderland", "William Hope Hodgson", 1908, ["cosmic", "classic", "haunted-house", "isolation"]],
    ["Conjure Wife", "Fritz Leiber", 1943, ["witchcraft", "classic", "psychological"]],
    ["Our Lady of Darkness", "Fritz Leiber", 1977, ["cosmic", "mystery", "literary"]]
  ];

  // Where each book's recognition comes from, keyed by title. Years are award years.
  const AWARDS = {
    stoker: {
      "Misery": 1987, "Swan Song": 1987, "The Silence of the Lambs": 1988, "Carrion Comfort": 1989,
      "Mine": 1990, "Boy's Life": 1991, "Blood of the Lamb": 1992, "The Throat": 1993,
      "Dead in the Water": 1994, "Zombie": 1995, "The Green Mile": 1996, "Children of the Dusk": 1997,
      "Bag of Bones": 1998, "Mr. X": 1999, "The Traveling Vampire Show": 2000, "American Gods": 2001,
      "The Night Class": 2002, "Lost Boy Lost Girl": 2003, "In the Night Room": 2004, "Creepers": 2005,
      "Lisey's Story": 2006, "The Missing": 2007, "Duma Key": 2008, "Audrey's Door": 2009,
      "Flesh Eaters": 2011, "The Drowning Girl": 2012, "Doctor Sleep": 2013, "Blood Kin": 2014,
      "A Head Full of Ghosts": 2015, "The Fisherman": 2016, "Ararat": 2017,
      "The Cabin at the End of the World": 2018, "Coyote Rage": 2019, "The Only Good Indians": 2020,
      "My Heart Is a Chainsaw": 2021, "Don't Fear the Reaper": 2022, "The Reformatory": 2023
    },
    "stoker-first": {
      "The Revelation": 1990, "The Cipher": 1991, "Heart-Shaped Box": 2007, "The Rust Maidens": 2018
    },
    jackson: {
      "Generation Loss": 2007, "The Shadow Year": 2008, "Big Machine": 2009, "Mr. Shivers": 2010,
      "Witches on the Road Tonight": 2011, "American Elsewhere": 2013, "Annihilation": 2014,
      "Experimental Film": 2015, "The Hole": 2017
    },
    choice: {
      "Doctor Sleep": 2013, "Revival": 2014, "The Fireman": 2016, "Sleeping Beauties": 2017,
      "The Outsider": 2018, "The Institute": 2019, "Mexican Gothic": 2020,
      "The Final Girl Support Group": 2021, "Holly": 2023
    }
  };

  const CANON = new Set([
    "The Castle of Otranto", "The Mysteries of Udolpho", "The Monk", "Frankenstein", "Melmoth the Wanderer",
    "The Private Memoirs and Confessions of a Justified Sinner", "Uncle Silas", "Carmilla",
    "The Strange Case of Dr. Jekyll and Mr. Hyde", "The Picture of Dorian Gray", "The Great God Pan",
    "Dracula", "The Beetle", "The Turn of the Screw", "The House on the Borderland", "The Phantom of the Opera",
    "At the Mountains of Madness", "The Case of Charles Dexter Ward", "Rebecca", "Conjure Wife",
    "I Am Legend", "Psycho", "The Haunting of Hill House", "We Have Always Lived in the Castle",
    "Something Wicked This Way Comes", "Rosemary's Baby", "The Exorcist", "The Other", "Hell House",
    "'Salem's Lot", "Interview with the Vampire", "The Shining", "Our Lady of Darkness", "Ghost Story"
  ]);

  const PREFIX = { top: "t", extra: "x", added: "a" };
  const toBook = (row, i, pool) => {
    const title = row[0];
    const sources = [];
    if (pool === "top") sources.push({ kind: "goodreads", rank: i + 1 });
    for (const kind in AWARDS) if (AWARDS[kind][title]) sources.push({ kind, year: AWARDS[kind][title] });
    if (CANON.has(title)) sources.push({ kind: "canon" });
    return {
      id: PREFIX[pool] + String(i + 1).padStart(3, "0"),
      rank: pool === "top" ? i + 1 : null,
      title,
      author: row[1],
      year: row[2],
      tags: row[3],
      pool,
      sources,
      // Shown in the catalogue: the top 100 plus anything with an award or canon place.
      listed: pool === "top" || sources.length > 0
    };
  };

  window.HORROR_BOOKS = TOP.map((r, i) => toBook(r, i, "top"));
  window.HORROR_EXTRA = EXTRA.map((r, i) => toBook(r, i, "extra"));
  window.HORROR_ADDED = ADDED.map((r, i) => toBook(r, i, "added"));
})();
