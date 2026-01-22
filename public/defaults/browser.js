const CATEGORIES = [
  "Mail Client", "Mail Server", "Notes", "To-Do", "Phone Photo Shooting",
  "Photo Management", "Calendar", "Cloud File Storage", "RSS", "Contacts",
  "Browser", "Chat", "Bookmarks", "Read It Later", "Word Processing",
  "Spreadsheets", "Presentations", "Shopping Lists", "Meal Planning",
  "Budgeting and Personal Finance", "News", "Music", "Podcasts", "Password Management"
];

// Normalize app name variations to canonical names
// Keys should be lowercase for case-insensitive matching
const CANONICAL_NAMES = {
  // Mail Client
  "mail.app": "Apple Mail",
  "mail": "Apple Mail",
  "mail.app on ios": "Apple Mail",
  "mail.app (ios)": "Apple Mail",
  "mail.app.": "Apple Mail",
  "mail.app ios and macos": "Apple Mail",
  "mail (ios)": "Apple Mail",
  "mail (apple)": "Apple Mail",
  "mail()": "Apple Mail",
  "mail on mac and ipad": "Apple Mail",
  "mail on ios/ipados": "Apple Mail",
  "mail app(macos and ios)": "Apple Mail",
  "ios mail": "Apple Mail",
  "mac default mail": "Apple Mail",
  "apple mail + web": "Apple Mail",
  "apple mail (mac and iphone)": "Apple Mail",
  "apple mail (mobile)": "Apple Mail",
  "apple mail (ios)": "Apple Mail",
  "apple mail.app": "Apple Mail",
  "apple mail everywhere else": "Apple Mail",
  "apple 邮件": "Apple Mail",
  "mail de apple": "Apple Mail",
  "the stock mail app on ios and mac": "Apple Mail",
  "hey": "HEY",
  "hey email": "HEY",
  "hey web app": "HEY",
  "hey mail": "HEY",
  "hey.com": "HEY",
  "gmail": "Gmail",
  "gmail app": "Gmail",
  "gmail app on ios": "Gmail",
  "gmail for ios": "Gmail",
  "gmail on the web": "Gmail",
  "gmail web": "Gmail",
  "gmail.com": "Gmail",
  "gmail pwa": "Gmail",
  "gmail (web & mobile)": "Gmail",
  "gmail app for personal": "Gmail",
  "gmail web client (macos)": "Gmail",
  "gmail web pages": "Gmail",
  "spark mail": "Spark",
  "spark 2": "Spark",
  "proton": "Proton Mail",
  "proton app": "Proton Mail",
  "proton web": "Proton Mail",
  "proton mail (ios)": "Proton Mail",
  "proton bridge": "Proton Mail",
  "proton webmail (desktop)": "Proton Mail",
  "proton mail app": "Proton Mail",
  "proton (business)": "Proton Mail",
  "proton (privat)": "Proton Mail",
  "proton's macos and ios clients": "Proton Mail",
  "fastmail": "Fastmail",
  "fastmail apps on mac": "Fastmail",
  "fastmail apps on ipad/iphone": "Fastmail",
  "fastmail web and ios": "Fastmail",
  "fastmail app on android": "Fastmail",
  "fastmail web on desktop": "Fastmail",
  "fastmail's web interface": "Fastmail",
  "fastmail ios app": "Fastmail",
  "fastmail web (macos / windows)": "Fastmail",
  "fastmail web": "Fastmail",
  "fastmail.app (macos)": "Fastmail",
  "fastmail web client": "Fastmail",
  "fastmail web interface & iphone app": "Fastmail",
  "fastmail app on ios": "Fastmail",
  "fastmail web app": "Fastmail",
  "fastmail (web and ios)": "Fastmail",
  "fastmate": "Fastmail",
  "fmail3 for fastmail": "Fastmail",
  "outlook (work)": "Outlook",
  "outlook for business": "Outlook",
  "outlook (ms office)": "Outlook",
  "outlook 365": "Outlook",
  "microsoft outlook (via microsoft 365)": "Outlook",
  "outlook pwа": "Outlook",
  "outlook (ios)": "Outlook",
  "outlook web": "Outlook",
  "outlook på jobbet": "Outlook",
  "work outlook via office365": "Outlook",
  "outlook on ios": "Outlook",
  "mozilla thunderbird": "Thunderbird",
  "thunderbird (pc)": "Thunderbird",
  "thunderbird (desktop)": "Thunderbird",
  "thunderbird (macos)": "Thunderbird",
  "k9-mail": "K-9 Mail",
  "k9 mail": "K-9 Mail",
  "k-9 mail (android)": "K-9 Mail",
  "k-9 mail (android)": "K-9 Mail",
  "tuta mail": "Tuta",
  "tuta": "Tuta",

  // Mail Server
  "icloud mail": "iCloud",
  "icloud with custom domain": "iCloud",
  "icloud custom domains": "iCloud",
  "icloud with custom domains": "iCloud",
  "icloud with 3 custom domain.": "iCloud",
  "icloud with 3 custom domain": "iCloud",
  "icloud, with custom domain": "iCloud",
  "icloud+ with a custom domain": "iCloud",
  "icloud mail with custom email domain": "iCloud",
  "icloud with custom domain through icloud+": "iCloud",
  "icloud+": "iCloud",
  "icloud+ (with custom domain)": "iCloud",
  "icloud custom email domain": "iCloud",
  "icloud+ med egen domän": "iCloud",
  "icloud custom domain": "iCloud",
  "icloud for personal": "iCloud",
  "google": "Google Workspace",
  "google for work": "Google Workspace",
  "googlesuite": "Google Workspace",
  "google workspace for work": "Google Workspace",
  "mainly google workspace": "Google Workspace",
  "google workspace custom domain": "Google Workspace",
  "google workspace": "Google Workspace",
  "google-mail": "Gmail",
  "google mail": "Gmail",
  "google (gmail)": "Gmail",
  "protonmail": "Proton Mail",
  "proton.me": "Proton Mail",
  "proton mail (pro)": "Proton Mail",
  "proton mail with a custom domain": "Proton Mail",
  "mailbox.org": "mailbox.org",
  "fastmail with custom domain": "Fastmail",
  "fastmail (personal)": "Fastmail",
  "fastmail for personal use": "Fastmail",
  "fastmail (custom domain)": "Fastmail",
  "gmail (work)": "Gmail",
  "outlook (personal)": "Outlook",
  "dreamhost": "Dreamhost",
  "purelymail": "Purelymail",
  "mxroute": "MXroute",
  "microsoft 365": "Microsoft 365",
  "ms365": "Microsoft 365",
  "office 365": "Microsoft 365",

  // Notes
  "notes.app": "Apple Notes",
  "notes": "Apple Notes",
  "apple notes (personal)": "Apple Notes",
  "apple notes for family note sharing": "Apple Notes",
  "icloud notes": "Apple Notes",
  "ios notes": "Apple Notes",
  "notes (apple)": "Apple Notes",
  "apple notes (ios)": "Apple Notes",
  "apple notes.app": "Apple Notes",
  "apple's notes": "Apple Notes",
  "apple notes with icloud": "Apple Notes",
  "apple notizen": "Apple Notes",
  "notizen app": "Apple Notes",
  "apple notes": "Apple Notes",
  "bear notes": "Bear",
  "bear app": "Bear",
  "bear pro": "Bear",
  "obsidian (for blog stuff)": "Obsidian",
  "obsidian (macos)": "Obsidian",
  "obsidian.md": "Obsidian",
  "obisidian": "Obsidian",
  "obsidian (android)": "Obsidian",
  "obsidian for work": "Obsidian",
  "obsidian on macos": "Obsidian",
  "obsidian sync": "Obsidian",
  "google keep (work)": "Google Keep",
  "keep notes": "Google Keep",
  "google keep": "Google Keep",
  "keep": "Google Keep",
  "craft docs": "Craft",
  "crafts": "Craft",
  "devonthink": "DEVONthink",
  "simplenote": "Simplenote",
  "logseq": "Logseq",
  "drafts": "Drafts",

  // To-Do
  "reminders": "Apple Reminders",
  "reminders.app": "Apple Reminders",
  "reminders app": "Apple Reminders",
  "icloud reminders": "Apple Reminders",
  "ios reminders": "Apple Reminders",
  "reminder.app": "Apple Reminders",
  "reminders (ios)": "Apple Reminders",
  "reminders()": "Apple Reminders",
  "apple reminders.app": "Apple Reminders",
  "recordatorios de apple": "Apple Reminders",
  "apple reminder": "Apple Reminders",
  "apple 提醒": "Apple Reminders",
  "reminders (apple)": "Apple Reminders",
  "apple erinnerungen": "Apple Reminders",
  "apple rappels": "Apple Reminders",
  "things": "Things 3",
  "things3": "Things 3",
  "omnifocus": "OmniFocus",
  "omnifocus 4": "OmniFocus",
  "tick tick": "TickTick",
  "ticktick": "TickTick",
  "todist": "Todoist",
  "microsoft to do": "Microsoft To Do",
  "ms to do": "Microsoft To Do",

  // Phone Photo Shooting
  "ios camera": "Apple Camera",
  "camera.app": "Apple Camera",
  "camera": "Apple Camera",
  "camera app": "Apple Camera",
  "iphone camera": "Apple Camera",
  "iphone camera app": "Apple Camera",
  "apple camera app": "Apple Camera",
  "ios camera app": "Apple Camera",
  "default camera": "Apple Camera",
  "default camera app": "Apple Camera",
  "standard ios camera": "Apple Camera",
  "standard camera app": "Apple Camera",
  "the default camera app.": "Apple Camera",
  "stock ios camera app": "Apple Camera",
  "built-in camera app": "Apple Camera",
  "default phone camera app": "Apple Camera",
  "apple camera.app": "Apple Camera",
  "stock camera app": "Apple Camera",
  "the iphone camera app": "Apple Camera",
  "the default app": "Apple Camera",
  "ios kamera": "Apple Camera",
  "the default one": "Apple Camera",
  "native camera app": "Apple Camera",
  "the stock camera app": "Apple Camera",
  "die standard-kamera-app": "Apple Camera",
  "ios camera.app": "Apple Camera",
  "apple's camera app": "Apple Camera",
  "camera-app": "Apple Camera",
  "android camera app": "Android Camera",
  "android camera": "Android Camera",
  "stock android camera": "Android Camera",
  "samsung camera": "Samsung Camera",
  "samsung camera app": "Samsung Camera",
  "stock samsung camera app": "Samsung Camera",
  "google camera": "Google Camera",
  "gcam": "Google Camera",
  "g cam": "Google Camera",

  // Photo Management
  "photos.app": "Apple Photos",
  "photos": "Apple Photos",
  "photos app": "Apple Photos",
  "apple photos.app": "Apple Photos",
  "apple photo": "Apple Photos",
  "photos()": "Apple Photos",
  "apple photos app": "Apple Photos",
  "fotos (apple)": "Apple Photos",
  "ios photos": "Apple Photos",
  "photos (apple)": "Apple Photos",
  "photos (ios)": "Apple Photos",
  "apple fotos": "Apple Photos",
  "ios photo app": "Apple Photos",
  "photos on ios/ipados": "Apple Photos",
  "standard photos app": "Apple Photos",
  "icloud photos": "iCloud",
  "lightroom classic": "Lightroom",
  "adobe lightroom classic": "Lightroom",
  "lightroom on macos": "Lightroom",
  "adobe lightroom": "Lightroom",
  "ente photos": "Ente",
  "ente photos (ios)": "Ente",
  "google photos on ios": "Google Photos",
  "google photos (archive and editing)": "Google Photos",
  "google photos (family sharing)": "Google Photos",
  "google photos (backup)": "Google Photos",
  "google foto": "Google Photos",
  "digikam": "Digikam",
  "darkroom": "Darkroom",
  "darktable": "Darktable",
  "photoprism (docker)": "Photoprism",
  "selfhosted photoprism": "Photoprism",
  "immich (self-hosted)": "Immich",
  "immich (self hosted)": "Immich",
  "immich(self-hosted)": "Immich",
  "synology photos(self-hosted)": "Synology Photos",
  "affinity photo 2": "Affinity Photo",
  "affinity photo": "Affinity Photo",

  // Calendar
  "calendar.app": "Apple Calendar",
  "calendar": "Apple Calendar",
  "apple kalender": "Apple Calendar",
  "apple calendar linked to fastmail": "Apple Calendar",
  "apple calendar (mac)": "Apple Calendar",
  "apple calendar": "Apple Calendar",
  "calendar()": "Apple Calendar",
  "apple calendar (fastmail)": "Apple Calendar",
  "calendar.app (with fastmail)": "Apple Calendar",
  "apple calendar.app": "Apple Calendar",
  "apple calendar.app with icloud": "Apple Calendar",
  "apple's stock calendar": "Apple Calendar",
  "apple calendar with icloud": "Apple Calendar",
  "icloud 日历": "Apple Calendar",
  "apple 日历": "Apple Calendar",
  "calendar (apple)": "Apple Calendar",
  "macos calender": "Apple Calendar",
  "calendar.app (desktop)": "Apple Calendar",
  "mac default calendar": "Apple Calendar",
  "calendar 5": "Apple Calendar",
  "apple calendar app": "Apple Calendar",
  "the stock calendar apps": "Apple Calendar",
  "calendar.app (personal)": "Apple Calendar",
  "calendar on ios": "Apple Calendar",
  "calendar.app synced with icloud": "Apple Calendar",
  "calendario (apple)": "Apple Calendar",
  "ical": "Apple Calendar",
  "calendar (ios)": "Apple Calendar",
  "icloud calendar": "iCloud",
  "google calendar via calendar.app": "Google Calendar",
  "google calendar (work)": "Google Calendar",
  "google cal": "Google Calendar",
  "gmail cal": "Google Calendar",
  "gmail calendar": "Google Calendar",
  "google calendar (pwа)": "Google Calendar",
  "google calendar (ios)": "Google Calendar",
  "google calender with self hosted ical": "Google Calendar",
  "google calendar in chrome (tab 1)": "Google Calendar",
  "google calender for work": "Google Calendar",
  "gcal": "Google Calendar",
  "google calender": "Google Calendar",
  "google calendar (mobile)": "Google Calendar",
  "google agenda": "Google Calendar",
  "fantastical calendar": "Fantastical",
  "fantastical legacy": "Fantastical",
  "fantastical (ios)": "Fantastical",
  "fantastical/icloud": "Fantastical",
  "fantastical backed by google calendar": "Fantastical",
  "fantastical.app": "Fantastical",
  "fastmail calendar": "Fastmail",
  "fastmail's calendar": "Fastmail",
  "nextcloud calendar": "Nextcloud",
  "outlook calendar": "Outlook",
  "busycal": "BusyCal",
  "busycal (mac)": "BusyCal",
  "proton calendar": "Proton Calendar",
  "fossify calendar": "Fossify Calendar",
  "tuta calendar": "Tuta",

  // Cloud File Storage
  "icloud drive": "iCloud",
  "icloud drive (apple)": "iCloud",
  "apple icloud": "iCloud",
  "icloud()": "iCloud",
  "icloud storage": "iCloud",
  "icloud for phone backup": "iCloud",
  "icloud (200gb)": "iCloud",
  "icloud+ (200gb)": "iCloud",
  "icloud +": "iCloud",
  "icloud drive / nas": "iCloud",
  "icloud drive (personal)": "iCloud",
  "icloud (personal)": "iCloud",
  "apple icloud (mostly)": "iCloud",
  "icloud drive / files app": "iCloud",
  "nextcloud": "Nextcloud",
  "nextcloud (selfhosted)": "Nextcloud",
  "nextcloud (self-hosted)": "Nextcloud",
  "self hosted nextcloud": "Nextcloud",
  "selfhosted nextcloud": "Nextcloud",
  "nextcloud (auto-hébergé)": "Nextcloud",
  "self-hosted nextcloud": "Nextcloud",
  "onedrive": "OneDrive",
  "onedrive (paid)": "OneDrive",
  "onedrive – for business": "OneDrive",
  "onedrive (pc)": "OneDrive",
  "onedrive (work)": "OneDrive",
  "drive": "Google Drive",
  "google drive (work)": "Google Drive",
  "google drive (google one)": "Google Drive",
  "googledrive": "Google Drive",
  "google driver": "Google Drive",
  "google drive (work)": "Google Drive",
  "protondrive": "Proton Drive",
  "syncthing": "Syncthing",
  "filen.io": "Filen",
  "owncloud": "ownCloud",
  "mega": "Mega",

  // RSS
  "reeder 5": "Reeder",
  "reeder classic": "Reeder",
  "reeder with freshrss": "Reeder",
  "reeder (with icloud)": "Reeder",
  "reader": "Reeder",
  "reeder app": "Reeder",
  "reeder5": "Reeder",
  "reeder (backed by feedly)": "Reeder",
  "reeder backed by self-hosted freshrss": "Reeder",
  "reeder classic via feedly": "Reeder",
  "reeder (client)": "Reeder",
  "reeder (ios)": "Reeder",
  "reeder backed by icloud": "Reeder",
  "reeder connected to inoreader": "Reeder",
  "netnewswire (ios)": "NetNewsWire",
  "netnewswire: rss reader": "NetNewsWire",
  "net news wire": "NetNewsWire",
  "netneswire": "NetNewsWire",
  "netnewswire (desktop)": "NetNewsWire",
  "netnewswire (mobile)": "NetNewsWire",
  "netnewswire via feedbin": "NetNewsWire",
  "netnewswire sync'd with icloud": "NetNewsWire",
  "netnewswire with self-hosted freshrss": "NetNewsWire",
  "netnewswire connected to feedbin": "NetNewsWire",
  "netnewswire sincronizado con icloud": "NetNewsWire",
  "netnewswire med icloud-synk": "NetNewsWire",
  "netnewswire": "NetNewsWire",
  "freshrss (self-hosted)": "FreshRSS",
  "freshrss (selfhosted)": "FreshRSS",
  "selfhosted freshrss": "FreshRSS",
  "freshrss (self hosted)": "FreshRSS",
  "freshrss(self-hosted)": "FreshRSS",
  "feedly": "Feedly",
  "innoreader": "Inoreader",
  "inoreader": "Inoreader",
  "readkit": "ReadKit",

  // Contacts
  "contacts.app": "Apple Contacts",
  "contacts": "Apple Contacts",
  "apple contacts app": "Apple Contacts",
  "apple contacts app.": "Apple Contacts",
  "macos contacts": "Apple Contacts",
  "contacts (ios)": "Apple Contacts",
  "contacts.app (google backend)": "Apple Contacts",
  "ios contacts (using google contacts as the backend)": "Apple Contacts",
  "apple kontakte": "Apple Contacts",
  "apple": "Apple Contacts",
  "contatti.app": "Apple Contacts",
  "contact app": "Apple Contacts",
  "contactos (apple)": "Apple Contacts",
  "the stock contacts app": "Apple Contacts",
  "apple contacts with icloud and vcards": "Apple Contacts",
  "contacts.aepp": "Apple Contacts",
  "contacts.app/icloud": "Apple Contacts",
  "contacts (apple)": "Apple Contacts",
  "apple conacts": "Apple Contacts",
  "default contact app": "Apple Contacts",
  "contacts app": "Apple Contacts",
  "contacts.app synced with icloud": "Apple Contacts",
  "apple contacts.app": "Apple Contacts",
  "ios contacts": "Apple Contacts",
  "contacts.app synced with google": "Apple Contacts",
  "mac contacts synced via icloud": "Apple Contacts",
  "macos contacts synced with google": "Apple Contacts",
  "apple contacts (fastmail)": "Apple Contacts",
  "contacts.app (with fastmail)": "Apple Contacts",
  "contactos de apple sincronizado con fastmail": "Apple Contacts",
  "contacts()": "Apple Contacts",
  "aosp contacts": "AOSP Contacts",
  "phone": "Phone",
  "icloud contacts": "iCloud",
  "simple contacts": "Simple Contacts",
  "nextcloud contacts": "Nextcloud",
  "samsung contacts": "Samsung Contacts",
  "contacts app by samsung": "Samsung Contacts",
  "samsung contacts app": "Samsung Contacts",
  "android contacts": "Android Contacts",
  "android": "Android Contacts",
  "the standard android app": "Android Contacts",
  "gnome contacts": "GNOME Contacts",

  // Browser
  "safari on ios": "Safari",
  "safari (ios)": "Safari",
  "safari (personal)": "Safari",
  "safari on mobile": "Safari",
  "safari.app": "Safari",
  "apple safari": "Safari",
  "safari (mobile)": "Safari",
  "safari ios": "Safari",
  "ios safari": "Safari",
  "safari()": "Safari",
  "google chrome": "Chrome",
  "chrome (work)": "Chrome",
  "google chrome (work)": "Chrome",
  "chrome (desktop and mobile)": "Chrome",
  "chrome for web work": "Chrome",
  "chrome at work": "Chrome",
  "chrome for work": "Chrome",
  "chrome – for web work and other business work": "Chrome",
  "chrome (google apps only)": "Chrome",
  "chrome beta": "Chrome",
  "chrome on pc and mac": "Chrome",
  "chrome on macos": "Chrome",
  "chrome (desktop work)": "Chrome",
  "chrome for development/work": "Chrome",
  "chrome on desktop": "Chrome",
  "microsoft edge": "Edge",
  "edge at work": "Edge",
  "microsoft edge (work)": "Edge",
  "microsoft edge (windows)": "Edge",
  "edge": "Edge",
  "mozilla firefox": "Firefox",
  "firefox developer edition": "Firefox",
  "firefox nightly": "Firefox",
  "firefox on desktop": "Firefox",
  "firefox (nightly on android)": "Firefox",
  "firefox (macos)": "Firefox",
  "firefox for leisure": "Firefox",
  "firefox for work": "Firefox",
  "firefox (developer edition)": "Firefox",
  "fifefox (daily)": "Firefox",
  "firefox for development": "Firefox",
  "firefox (dev)": "Firefox",
  "firefox dev": "Firefox",
  "fennec": "Firefox",
  "fennec f-droid": "Firefox",
  "fennec firefox": "Firefox",
  "zen": "Zen Browser",
  "zen (safari on ios)": "Zen Browser",
  "zen (linux)": "Zen Browser",
  "librewolf": "LibreWolf",
  "vivaldi at home": "Vivaldi",
  "vivaldi on android/windows": "Vivaldi",
  "vivaldi(personal)": "Vivaldi",
  "vivaldi (pc)": "Vivaldi",
  "vivaldi (desktop personal)": "Vivaldi",
  "vivaldi on iphone & pc": "Vivaldi",
  "arc on macbook": "Arc",
  "arc (macos & ios)": "Arc",
  "arc (macos)": "Arc",
  "arc for compatibility": "Arc",
  "arc browser for mac": "Arc",
  "arc search for ios": "Arc",
  "arc on mac": "Arc",
  "arc (mac)": "Arc",
  "orion (ios)": "Orion",
  "orion (mac)": "Orion",
  "orion (macos / ios / ipados)": "Orion",
  "orion": "Orion",
  "brave": "Brave",
  "brave (desktop)": "Brave",
  "brave (android)": "Brave",

  // Chat
  "messages": "iMessage",
  "apple messages": "iMessage",
  "messages.app": "iMessage",
  "imessages": "iMessage",
  "ios messages": "iMessage",
  "messages()": "iMessage",
  "apple imessage": "iMessage",
  "apple messages app": "iMessage",
  "mensajes de apple": "iMessage",
  "messages (apple)": "iMessage",
  "whatsapp": "WhatsApp",
  "what's app": "WhatsApp",
  "messenger": "Facebook Messenger",
  "fb messenger": "Facebook Messenger",
  "facebook messenger (because of family)": "Facebook Messenger",
  "microsoft teams": "Teams",
  "microsoft teams (work)": "Teams",
  "ms teams": "Teams",
  "signal": "Signal",
  "telegram": "Telegram",
  "discord": "Discord",
  "discord (friends)": "Discord",
  "discord mostly": "Discord",
  "google chat": "Google Chat",
  "google chat (web)": "Google Chat",

  // Bookmarks
  "raindrop": "Raindrop.io",
  "safari bookmarks": "Safari",
  "safari bookmarks.": "Safari",
  "apple safari bookmarks": "Safari",
  "safari (bookmarks)": "Safari",
  "safari's bookmarks": "Safari",
  "firefox bookmarks": "Firefox",
  "firefox bookmarks sync": "Firefox",
  "firefox's built-in bookmarks": "Firefox",
  "firefox sync": "Firefox",
  "browser": "Browser",
  "linkding": "Linkding",
  "linkace (selfhosted)": "LinkAce",
  "linkace": "LinkAce",
  "anybox": "Anybox",

  // Read It Later
  "goodlinks": "GoodLinks",
  "good links": "GoodLinks",
  "safari's reading list": "Safari Reading List",
  "safari read later": "Safari Reading List",
  "reading list in safari": "Safari Reading List",
  "safari reading list": "Safari Reading List",
  "raindrop.io": "Raindrop.io",
  "wallabag": "Wallabag",
  "wallabag (self hosted)": "Wallabag",
  "matter": "Matter",
  "reader (readwise)": "Readwise Reader",
  "reader from readwise": "Readwise Reader",
  "readwise reeder": "Readwise Reader",

  // Word Processing
  "word": "Microsoft Word",
  "ms word": "Microsoft Word",
  "microsoft word (via microsoft 365)": "Microsoft Word",
  "pages": "Apple Pages",
  "pages.app": "Apple Pages",
  "pages (apple)": "Apple Pages",
  "pages if i have to... mostly libreoffice": "Apple Pages",
  "pages (word under duress)": "Apple Pages",
  "pages if i have to.": "Apple Pages",
  "libreoffice": "LibreOffice",
  "libre office": "LibreOffice",
  "libreoffice writer": "LibreOffice",
  "vs code": "VS Code",
  "vscode": "VS Code",
  "visual studio code": "VS Code",
  "docs": "Google Docs",
  "google docs": "Google Docs",
  "google docs mostly": "Google Docs",
  "google docs at work/uni": "Google Docs",
  "google docs (work)": "Google Docs",
  "ia writer": "iA Writer",
  "iawriter": "iA Writer",

  // Spreadsheets
  "excel": "Microsoft Excel",
  "ms excel": "Microsoft Excel",
  "excel for work": "Microsoft Excel",
  "excel (mainly because of work)": "Microsoft Excel",
  "microsoft excel (via microsoft 365)": "Microsoft Excel",
  "excel (pro)": "Microsoft Excel",
  "microsoft excel on mac": "Microsoft Excel",
  "microsoft excel": "Microsoft Excel",
  "numbers": "Apple Numbers",
  "numbers.app": "Apple Numbers",
  "numbers (apple)": "Apple Numbers",
  "numbers()": "Apple Numbers",
  "number": "Apple Numbers",
  "numbers de apple": "Apple Numbers",
  "numbers for personal": "Apple Numbers",
  "libreoffice calc": "LibreOffice",
  "libreoffice sheets or something i forgot what it's called": "LibreOffice",
  "calc": "LibreOffice",
  "google spreadsheets": "Google Sheets",
  "sheets": "Google Sheets",
  "google sheets": "Google Sheets",
  "google sheets (work)": "Google Sheets",

  // Presentations
  "keynote": "Apple Keynote",
  "keynote.app": "Apple Keynote",
  "keynote (apple)": "Apple Keynote",
  "keynotes": "Apple Keynote",
  "powerpoint": "Microsoft PowerPoint",
  "ms powerpoint": "Microsoft PowerPoint",
  "microsoft powerpoint": "Microsoft PowerPoint",
  "powerpoint (ditto for work)": "Microsoft PowerPoint",
  "powerpoint at work": "Microsoft PowerPoint",
  "powerpoint (pro)": "Microsoft PowerPoint",
  "ms powerpoiot": "Microsoft PowerPoint",
  "reveal.js": "Reveal.js",
  "remarkjs": "Reveal.js",
  "revealjs": "Reveal.js",
  "reveal-md": "Reveal.js",
  "slides": "Google Slides",
  "google presentations": "Google Slides",
  "libreoffice impress": "LibreOffice",

  // Shopping Lists
  "bring": "Bring!",
  "anylist": "AnyList",
  "apple reminders shared list": "Apple Reminders",
  "shared reminders list": "Apple Reminders",
  "icloud reminders.app": "Apple Reminders",
  "shared reminders lists": "Apple Reminders",
  "shared reminder list": "Apple Reminders",
  "apple reminders shared with wife": "Apple Reminders",
  "notas de apple": "Apple Notes",

  // Meal Planning
  "paprika 3": "Paprika",

  // Budgeting
  "spreadsheet": "Spreadsheet",
  "spreadsheets": "Spreadsheet",
  "copilot money": "Copilot",
  "copilot": "Copilot",
  "actual": "Actual Budget",
  "soulver (not numbers or excel sorry andrew)": "Soulver",

  // News
  "apple news+": "Apple News",
  "guardian": "The Guardian",
  "the guardian": "The Guardian",
  "new york times": "The New York Times",
  "the new york times": "The New York Times",
  "nyt": "The New York Times",
  "nytimes": "The New York Times",
  "nytimes app": "The New York Times",
  "ny times": "The New York Times",
  "atlantic": "The Atlantic",
  "the atlantic": "The Atlantic",
  "new yorker": "The New Yorker",
  "the new yorker": "The New Yorker",
  "economist": "The Economist",
  "the economist": "The Economist",
  "bbc": "BBC News",
  "bbc mostly": "BBC News",
  "bbc website": "BBC News",
  "x(twitter)": "X",
  "twitter": "X",
  "netneswire": "NetNewsWire",

  // Music
  "music.app": "Apple Music",
  "music": "Apple Music",
  "music ()": "Apple Music",
  "music (apple)": "Apple Music",
  "musik app": "Apple Music",
  "apple music.app": "Apple Music",
  "applemusic": "Apple Music",
  "youtube music": "YouTube Music",
  "yt music": "YouTube Music",
  "ytmusic": "YouTube Music",
  "plexamp": "Plexamp",
  "spotify": "Spotify",
  "youtube": "YouTube",
  "youtube premium": "YouTube",

  // Podcasts
  "apple podcast": "Apple Podcasts",
  "podcasts.app": "Apple Podcasts",
  "podcasts": "Apple Podcasts",
  "podcast.app": "Apple Podcasts",
  "apple podcasts.": "Apple Podcasts",
  "podcasts app": "Apple Podcasts",
  "podcasts()": "Apple Podcasts",
  "apple podcasts (ios only)": "Apple Podcasts",
  "overcast 🙌🏻": "Overcast",
  "pocket casts": "Pocket Casts",
  "pocketcasts": "Pocket Casts",
  "pocketcast": "Pocket Casts",
  "pocketcasts (android)": "Pocket Casts",
  "pocket cast (ios)": "Pocket Casts",
  "antenna pod": "AntennaPod",
  "antennapod": "AntennaPod",
  "podcast addict": "Podcast Addict",
  "podcast addct": "Podcast Addict",
  "vlc app": "VLC",
  "vlc": "VLC",
  "yt": "YouTube",

  // Password Management
  "1password family": "1Password",
  "1password": "1Password",
  "1 password": "1Password",
  "1password.com": "1Password",
  "1password 7": "1Password",
  "1pass": "1Password",
  "1pw": "1Password",
  "1password for families": "1Password",
  "bitwarden": "Bitwarden",
  "bitwarden (self-hosted)": "Bitwarden",
  "bitwarden with vaultwarden": "Bitwarden",
  "self hosted bitwarden": "Bitwarden",
  "bitwarden(self-hosted)": "Bitwarden",
  "bitwarden (self-hosted) on my vps": "Bitwarden",
  "bitwarden <3": "Bitwarden",
  "icloud keychain": "iCloud Keychain",
  "apple keychain": "iCloud Keychain",
  "apple passwords/keychain": "iCloud Keychain",
  "icloud passwords": "iCloud Keychain",
  "apple icloud keychain": "iCloud Keychain",
  "icloud password manager": "iCloud Keychain",
  "keychain": "iCloud Keychain",
  "portachiavi.app": "iCloud Keychain",
  "apple icloud keychain": "iCloud Keychain",
  "keychain access/default password manager in ios": "iCloud Keychain",
  "safari (icloud keychain)": "iCloud Keychain",
  "keychain/icloud passwords": "iCloud Keychain",
  "apple keychain (future)": "iCloud Keychain",
  "apple passwords": "Apple Passwords",
  "passwords.app": "Apple Passwords",
  "passwörter app": "Apple Passwords",
  "apple passwords (moving away from 1password slowly)": "Apple Passwords",
  "icloud password": "Apple Passwords",
  "apple's functionality": "Apple Passwords",
  "vaultwarden": "Vaultwarden",
  "vaultwarden (self hosted)": "Vaultwarden",
  "protonpass": "Proton Pass",
  "keepass": "KeePass",
  "keepassxc": "KeePassXC",
  "keepass2android": "KeePass",
  "keepassdx": "KeePass",
  "keepassx": "KeePass",
  "kepassxc": "KeePassXC",
  "keepass password safe": "KeePass",
  "macpass": "KeePass",
  "lastpass": "LastPass",
  "dashlane": "Dashlane",
  "dashlanne": "Dashlane",
};

function normalizeAppName(app) {
  // Remove all leading/trailing whitespace including non-breaking spaces
  const trimmed = app.replace(/^[\s\u00A0\u2007\u202F]+|[\s\u00A0\u2007\u202F]+$/g, '');
  const lower = trimmed.toLowerCase();
  return CANONICAL_NAMES[lower] || trimmed;
}

const STYLES = `
  #defaults-app {
    font-family: system-ui, -apple-system, sans-serif;
    margin-top: 40px;
  }
  .tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    border-bottom: 2px solid #e5e7eb;
  }
  .tab {
    padding: 0.75rem 1.25rem;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 1rem;
    color: #6b7280;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    transition: all 0.2s;
  }
  .tab:hover { color: #374151; }
  .tab.active {
    color: #2563eb;
    border-bottom-color: #2563eb;
  }
  .tab-content { display: none; }
  .tab-content.active { display: block; }
  .search-box {
    width: 100%;
    max-width: 400px;
    padding: 0.75rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }
  .search-box:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  .category-section { margin-bottom: 2rem; }
  .category-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #1f2937;
  }
  .histogram {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .histogram-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
  }
  .histogram-row:hover .histogram-bar {
    background: #1d4ed8;
  }
  .histogram-label {
    width: 140px;
    flex-shrink: 0;
    font-size: 0.9rem;
    color: #374151;
    text-align: right;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .histogram-bar-container {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .histogram-bar {
    height: 24px;
    background: #2563eb;
    border-radius: 4px;
    transition: all 0.2s;
    min-width: 4px;
  }
  .histogram-count {
    font-size: 0.85rem;
    color: #6b7280;
    min-width: 30px;
  }
  .post-card {
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1rem;
  }
  .post-name {
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.5rem;
  }
  .post-name a {
    color: #2563eb;
    text-decoration: none;
  }
  .post-name a:hover { text-decoration: underline; }
  .post-date {
    font-size: 0.85rem;
    color: #6b7280;
    margin-bottom: 0.75rem;
  }
  .post-apps {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.5rem;
    font-size: 0.9rem;
  }
  .post-app { display: flex; gap: 0.5rem; }
  .post-app-category { color: #6b7280; min-width: 100px; }
  .post-app-value { color: #1f2937; }
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }
  .stat-card {
    background: #f9fafb;
    padding: 1rem;
    border-radius: 0.5rem;
    text-align: center;
  }
  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: #2563eb;
  }
  .stat-label { font-size: 0.85rem; color: #6b7280; }
  .category-select {
    padding: 0.5rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    font-size: 1rem;
    margin-bottom: 1.5rem;
    background: white;
  }
`;

let data = {};
let entries = [];
let currentTab = 'popular';

function init() {
  const container = document.getElementById('defaults-app');
  if (!container) {
    setTimeout(init, 100);
    return;
  }

  container.innerHTML = `
    <style>${STYLES}</style>
    <div class="loading" style="text-align: center; padding: 2rem; color: #6b7280;">Loading data...</div>
  `;

  loadData();
}

async function loadData() {
  try {
    const response = await fetch('/defaults/data.json');
    data = await response.json();
    
    entries = Object.values(data)
      .filter(e => e._meta && !e.error)
      .sort((a, b) => (b._meta.date || '').localeCompare(a._meta.date || ''));
    
    renderApp();
  } catch (err) {
    document.getElementById('defaults-app').innerHTML = `<p>Error loading data: ${err.message}</p>`;
  }
}

function renderApp() {
  const container = document.getElementById('defaults-app');
  const totalPosts = entries.length;
  const totalResponses = entries.reduce((sum, e) => {
    return sum + CATEGORIES.filter(cat => e[cat]?.length > 0).length;
  }, 0);

  container.innerHTML = `
    <style>${STYLES}</style>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${totalPosts}</div>
        <div class="stat-label">Posts</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${CATEGORIES.length}</div>
        <div class="stat-label">Categories</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${totalResponses.toLocaleString()}</div>
        <div class="stat-label">Total Responses</div>
      </div>
    </div>

    <div class="tabs">
      <button class="tab ${currentTab === 'popular' ? 'active' : ''}" data-tab="popular">Popular Apps</button>
      <button class="tab ${currentTab === 'posts' ? 'active' : ''}" data-tab="posts">Browse Posts</button>
      <button class="tab ${currentTab === 'search' ? 'active' : ''}" data-tab="search">Search Apps</button>
    </div>

    <div class="tab-content ${currentTab === 'popular' ? 'active' : ''}" id="popular-tab">
      <select class="category-select" id="category-select">
        <option value="all">All Categories</option>
        ${CATEGORIES.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
      </select>
      <div id="popular-content"></div>
    </div>

    <div class="tab-content ${currentTab === 'posts' ? 'active' : ''}" id="posts-tab">
      <input type="text" class="search-box" id="posts-search" placeholder="Search by author...">
      <div id="posts-list"></div>
    </div>

    <div class="tab-content ${currentTab === 'search' ? 'active' : ''}" id="search-tab">
      <input type="text" class="search-box" id="app-search" placeholder="Search for an app (e.g., Obsidian, Safari)...">
      <div id="search-results"></div>
    </div>
  `;

  // Attach event listeners
  container.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentTab = tab.dataset.tab;
      renderApp();
    });
  });

  document.getElementById('category-select').addEventListener('change', (e) => {
    renderPopular(e.target.value);
  });

  document.getElementById('posts-search').addEventListener('input', (e) => {
    renderPosts(e.target.value);
  });

  document.getElementById('app-search').addEventListener('input', (e) => {
    renderSearch(e.target.value);
  });

  // Render current tab content
  if (currentTab === 'popular') renderPopular('all');
  if (currentTab === 'posts') renderPosts('');
  if (currentTab === 'search') renderSearch('');
}

function getAppCounts(category) {
  const counts = {};
  entries.forEach(entry => {
    const apps = entry[category] || [];
    apps.forEach(app => {
      const normalized = normalizeAppName(app);
      if (normalized) {
        counts[normalized] = (counts[normalized] || 0) + 1;
      }
    });
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
}

function renderPopular(selectedCategory) {
  const container = document.getElementById('popular-content');
  const categories = selectedCategory === 'all' ? CATEGORIES : [selectedCategory];
  
  container.innerHTML = categories.map(category => {
    const apps = getAppCounts(category);
    if (apps.length === 0) return '';
    
    // Find max count for scaling bars
    const maxCount = apps.length > 0 ? apps[0][1] : 1;
    
    return `
      <div class="category-section">
        <h3>${category}</h3>
        <div class="histogram">
          ${apps.map(([app, count]) => {
            const barWidth = (count / maxCount) * 100;
            return `
              <div class="histogram-row" data-app="${app.replace(/"/g, '&quot;')}">
                <span class="histogram-label" title="${app}">${app}</span>
                <div class="histogram-bar-container">
                  <div class="histogram-bar" style="width: ${barWidth}%"></div>
                  <span class="histogram-count">${count}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.histogram-row').forEach(row => {
    row.addEventListener('click', () => {
      currentTab = 'search';
      renderApp();
      document.getElementById('app-search').value = row.dataset.app;
      renderSearch(row.dataset.app);
    });
  });
}

function renderPosts(filter) {
  const container = document.getElementById('posts-list');
  const filtered = filter 
    ? entries.filter(e => e._meta.name.toLowerCase().includes(filter.toLowerCase()))
    : entries.slice(0, 50);
  
  container.innerHTML = filtered.map(entry => {
    const meta = entry._meta;
    const apps = CATEGORIES
      .filter(cat => entry[cat]?.length > 0)
      .slice(0, 8)
      .map(cat => `<div class="post-app">
        <span class="post-app-category">${cat}:</span>
        <span class="post-app-value">${entry[cat].join(', ')}</span>
      </div>`);
    
    return `
      <div class="post-card">
        <div class="post-name">
          <a href="${meta.url}" target="_blank" rel="noopener">${meta.name}</a>
        </div>
        <div class="post-date">${meta.date ? meta.date.split(' ')[0] : 'Unknown date'}</div>
        <div class="post-apps">${apps.join('')}</div>
      </div>
    `;
  }).join('');
  
  if (!filter && entries.length > 50) {
    container.innerHTML += `<p style="color: #6b7280; text-align: center;">Showing 50 of ${entries.length} posts. Use search to find more.</p>`;
  }
}

function renderSearch(query) {
  const container = document.getElementById('search-results');
  if (!query) {
    container.innerHTML = '<p style="color: #6b7280;">Enter an app name to see who uses it.</p>';
    return;
  }
  
  const results = [];
  const lowerQuery = query.toLowerCase();
  
  entries.forEach(entry => {
    const matches = [];
    CATEGORIES.forEach(cat => {
      const apps = entry[cat] || [];
      apps.forEach(app => {
        if (app.toLowerCase().includes(lowerQuery)) {
          matches.push({ category: cat, app });
        }
      });
    });
    if (matches.length > 0) {
      results.push({ entry, matches });
    }
  });
  
  if (results.length === 0) {
    container.innerHTML = `<p style="color: #6b7280;">No results found for "${query}".</p>`;
    return;
  }
  
  container.innerHTML = `
    <p style="margin-bottom: 1rem;"><strong>${results.length}</strong> posts mention apps matching "${query}"</p>
    ${results.slice(0, 100).map(({ entry, matches }) => `
      <div class="post-card">
        <div class="post-name">
          <a href="${entry._meta.url}" target="_blank" rel="noopener">${entry._meta.name}</a>
        </div>
        <div class="post-apps">
          ${matches.map(m => `
            <div class="post-app">
              <span class="post-app-category">${m.category}:</span>
              <span class="post-app-value">${m.app}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')}
  `;
}

// Start the app
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
