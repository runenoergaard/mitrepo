//DETTE SCRIPT LÆGGER EN BESKED I MANGE FAG PÅ E-LEARNING

// Funktion til at hente CSRF-token fra cookies
const CSRFtoken = function () {
  return decodeURIComponent(
    (document.cookie.match("(^|;) *_csrf_token=([^;]*)") || "")[2]
  );
};

// 1️⃣ Hent alle courses
async function fetchCourses() {
  const subaccounts = [23, 24]; //E-LEARNING SUBACCOUNTS
  const params = new URLSearchParams();

  subaccounts.forEach((id) => params.append("by_subaccounts[]", id));
  params.append("blueprint", "false");
  params.append("search_term", "v26"); //VIGTIG VARIABEL. ANGIVER HVAD DER RETURNERES FRA DATABASEN
  params.append("per_page", "999");

  const courses = [];
  let url = `/api/v1/accounts/1/courses?${params.toString()}`;

  while (url) {
    const response = await fetch(url);
    const data = await response.json();
    courses.push(...data);

    const linkHeader = response.headers.get("Link");
    const match = linkHeader?.match(/<(.*?)>; rel="next"/);
    url = match?.[1] || null;
  }

  return courses;
}

// 2️⃣ Opret event med console-preview og confirm
async function createCalendarEvents() {
  const courses = await fetchCourses();

  const message = `<p><strong>Hvor?</strong> Teams <a href="https://events.teams.microsoft.com/event/c5e8d10b-90b8-42ef-98c0-ee257e98a981@e3a34c64-6d3a-4ced-8326-ce8478b16d6f?source=copyLinkOneEventsShareDialog" target="_blank">Følg dette link</a></p>
<p><strong>Hvem?</strong>Dig der skal til eksamen til vinter og primært er e-laerningkursist.
Du behøver ikke tilmelde dig - bare mød op!</p>
<p><strong>Program:</strong></p>
<ul>
<li>Velkomst + lidt om skolen v. Jakob 👨🏻‍🏫</li>
<li>Generel info om eksamen v. eksamenskontoret 💃🏻</li>
<li>Info fra studievejledningen om tilbud, apps o. lign. v. Trine 👩🏼‍🎓</li>
<li>Info om ExamCookie v. Jakob 🍪</li>
<li>OBS på IT v. Kristian 🧑‍💻</li>
<li>Spørgsmål fra 'salen' 🙋🏼</li>
</ul>
<p>Vi glæder os til at se dig!</p>
<p>OBS: der afholdes kun ét møde. Hvis du har flere fag som afsluttes med vintereksamen, vil mødet stå flere gange i din kalender (fordi alle v26-hold er indkaldt).</p>
<p>Kan du ikke deltage? Så kan du finde nyttig information om eksamen på <a target="_blank" href="https://vucv.instructure.com/courses/2236/pages/alt-om-eksamen">"Alt om eksamen"</a>.</p>`;

  // Log alle kurser og beskeden til console
  console.log("=== EVENTS PREVIEW ===");
  courses.forEach((course) => {
    console.log(`Course: ${course.name} (ID: ${course.id})`);
  });
  console.log("Message to be sent:\n", message);
  console.log("======================");

  // Simpel confirm til at fortsætte
  if (!confirm("Er det ok at poste ovenstående events? Check console først.")) {
    console.log("Event oprettelse afbrudt af brugeren.");
    return;
  }

  // Post events til alle kurser
  for (const course of courses) {
    const bodyParams = new URLSearchParams();
    bodyParams.append("calendar_event[context_code]", `course_${course.id}`);
    bodyParams.append(
      "calendar_event[title]",
      "Eksamensmøde for e-learningkursister"
    );
    bodyParams.append("calendar_event[location_name]", "Teams");
    bodyParams.append("calendar_event[start_at]", "2026-11-16T16:00:00Z"); //år måned dag. 1 time tidligere her end det der skal stå i opslaget om efteråret. VIGTIG VARIABEL. OBS PÅ EVT: SOMMERTID TROR JEG
    bodyParams.append("calendar_event[end_at]", "2026-11-16T17:00:00Z"); //VIGTIG VARIABEL. 1 time tidligere her end det der skal stå i opslaget om efteråret.OBS PÅ EVT: SOMMERTID TROR JEG
    bodyParams.append("calendar_event[description]", message);

    try {
      const response = await fetch(`/api/v1/calendar_events/`, {
        method: "POST",
        headers: {
          "X-CSRF-Token": CSRFtoken(),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: bodyParams,
      });

      if (!response.ok) {
        console.error(`Fejl ved course ${course.id}`);
        continue;
      }

      console.log(`Event oprettet i course ${course.id}`);
    } catch (err) {
      console.error(`Request fejlede for ${course.id}`, err);
    }
  }

  console.log("Alle events forsøgt oprettet ✅");
}

// 3️⃣ Kør script
createCalendarEvents();
