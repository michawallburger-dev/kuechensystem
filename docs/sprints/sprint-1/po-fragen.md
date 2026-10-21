# Sprint 1 – Product Owner: Sichtung und Fragen

## Erkenntnisse aus der Sichtung
- **wochenplan/:** Rezeptmodell ist ausgebaut (Zutaten mit Menge, Einheit und Suchbegriffen; Ernährungsformen; Geräte; Camping; Kindervariante und Feedback als Felder vorbereitet). Bisher gibt es ein Rezept (Grünkohlpasta). Wochenplan, Generator, Kochmodus und Sync sind nur geplant. Das README beschreibt einen Sync über GitHub-Token, der noch nicht gebaut ist und bei einem öffentlichen Repo so nicht in Frage kommt.
- **vorratskammer/:** Produkte mit Name, Marke, Menge, Einheit (Freitext), Kategorie, Lagerort, MHD und eingefroren, gespeichert in localStorage. Barcode-Scan und Open Food Facts. Keine Verbindung zu Rezepten.
- **Jira-Export (ehemals `vorratskammer/Produktplan.csv`, jetzt in `docs/backlog.md`):** Familien-Sync über Supabase (Haushalte, Einladungscode, Magic Link, Echtzeit, offline), Desktop-Ansicht, UX-Ideen. Nichts davon umgesetzt außer MHD-Balken und Gruppierung nach Lagerort.
- **Lücke für das Zusammenspiel:** Zutaten im Rezept und Produkte im Vorrat haben keine gemeinsame Benennung und keine einheitlichen Einheiten. Das wird für Einkaufsliste und Abbuchen entscheidend.

## Fragerunde 1
1. **Haushalt und Rollen:** Wer gehört zum Haushalt (Erwachsene, Kinder mit Alter)? Wer plant, wer kocht, wer kauft ein, und auf welchen Geräten jeweils?
2. **Heutiger Ablauf und größter Schmerz:** Wie plant ihr heute Essen und Einkauf? Was nervt am meisten: entscheiden, was es gibt; Einkaufsliste schreiben; Dinge vergessen oder doppelt kaufen; Lebensmittel, die verderben?
3. **Umfang des Wochenplans:** Welche Mahlzeiten werden geplant (nur Abendessen, auch Mittag am Wochenende, Pausenbrot)? Gibt es feste Rituale (z. B. Freitag Pizza), Resteessen-Tage, Wünsche der Kinder? Wie viele Rezepte habt ihr realistisch im Repertoire?
4. **Vorrat in der Praxis:** Nutzt ihr die Vorratskammer-App wirklich, und wie vollständig ist sie gepflegt? Wie viel Aufwand ist beim Abbuchen okay: automatisch nach dem Kochen, kurz bestätigen oder gar nicht und nur grob? Ist euch der Barcode-Scan wichtig genug, dass dafür Produktdaten bei Open Food Facts abgefragt werden dürfen?
5. **Gemeinsamer Zugriff:** Müssen mehrere Personen auf eigenen Handys gleichzeitig denselben Plan und dieselbe Einkaufsliste sehen und abhaken, z. B. eine Person im Supermarkt und eine zu Hause? Oder reicht es, wenn PC und ein Handy denselben Stand haben? Wäre ein Konto bei einem Dienst wie Supabase (Login per E-Mail, Daten bei einem Dritten) akzeptabel?

## Antworten
_Noch offen._
