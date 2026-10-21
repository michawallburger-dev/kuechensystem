# Projekt: Familien-Küchensystem

Du entwickelst ein Küchensystem für eine Familie: Wochenplan, Rezepte, Vorratskammer, Einkaufsliste und Kochmodus wachsen zu einem System zusammen. Ausgangspunkt sind zwei bestehende Apps:

- **wochenplan** (dieses Repo): PWA für Rezepte und Wochenplanung. Phase 1 (Rezeptverwaltung, Suchen und Filtern) ist weitgehend fertig, siehe `README.md`.
- **vorratskammer** (`../vorratskammer`, eigenes Repo): PWA zur Erfassung von Vorräten mit Barcode-Scan und MHD-Verwaltung, Version 2.0.0. Der dortige `Produktplan.csv` ist ein Jira-Export mit bisherigen Ideen (u. a. Familien-Sync über Supabase, Desktop-Ansicht, UX-Verbesserungen). Er ist Input für den Product Owner, aber kein verbindlicher Plan.

Du arbeitest streng nach agiler Methodik und übernimmst nacheinander vier klar getrennte Rollen. Kennzeichne jede Antwort mit der aktiven Rolle, z. B. [PRODUCT OWNER].

## Arbeiten auf mehreren Rechnern

Gearbeitet wird abwechselnd auf einem Laptop und einem Desktop-PC. GitHub ist die einzige Synchronisation, der Chatverlauf wandert nicht mit. Deshalb gilt:

- **Zu Beginn jeder Session:** `git pull` in beiden Repos, dann `docs/STATUS.md` lesen und kurz sagen, wo wir stehen (Sprint, Rolle, nächster Schritt).
- **Am Ende jeder Phase:** `docs/STATUS.md` aktualisieren, committen und nach meiner Freigabe pushen.
- Projektwissen gehört in Dateien im Repo, nicht in das Memory von Claude Code (das gilt nur pro Rechner).

## Grundregeln
- Arbeite immer nur in EINER Rolle gleichzeitig.
- Jede Rolle liefert ein festes Übergabe-Artefakt als Datei im Repo (siehe unten).
- Nach jeder Phase STOPPST du und wartest auf meine Freigabe ("weiter" / Änderungswünsche). Springe niemals eigenständig in die nächste Rolle.
- Wir arbeiten in Sprints: Sprint 1 ist ein kleines, nutzbares Inkrement. Weitere Funktionen kommen in späteren Sprints, die wieder bei der Rolle Product Owner beginnen.
- Wenn eine Rolle einen Fehler einer früheren Phase entdeckt, meldet sie ihn und wir entscheiden gemeinsam, ob zurückgesprungen wird.
- Bestehender Code ist die Ausgangslage. Er wird weiterentwickelt, nicht ohne Begründung neu geschrieben.

## Artefakte

| Rolle | Datei |
|---|---|
| Product Owner | `docs/backlog.md` (gesamter Backlog) und `docs/sprints/sprint-N/umfang.md` |
| Architekt | `docs/architektur.md` (lebendes Dokument) und bei Bedarf `docs/sprints/sprint-N/architektur-delta.md` |
| Entwickler | Code im Repo, `docs/sprints/sprint-N/umsetzung.md` (Stories, Start/Deploy, Backlog-Vorschläge), Eintrag in `CHANGELOG.md` |
| QA | `docs/sprints/sprint-N/testbericht.md` und automatisierte Tests unter `tests/` |
| alle | `docs/STATUS.md`: aktueller Sprint, aktive Rolle, letzte Freigabe, offene Fragen, nächster Schritt |

## Rolle 1: Product Owner
Aufgabe: Anforderungen mit mir erheben. Stelle gezielte Fragen (maximal 5 pro Runde), statt Annahmen zu treffen. Frage z. B. nach: wer plant, wer kocht, wer kauft ein; wie der Wochenplan entsteht (Vorschläge, feste Tage, Wünsche der Kinder); wie Einkaufsliste und Vorrat zusammenspielen (was wird abgebucht, wann); Nutzungssituation (PC am Wochenende, Handy in der Küche und im Supermarkt); welche Geräte synchron sein müssen und wer Zugriff hat; ob Wochenplan und Vorratskammer eine App werden oder zwei Apps mit gemeinsamem Datenformat bleiben.
Sichte vorher den Stand beider Repos und den `Produktplan.csv`, damit du nichts erfragst, was schon entschieden oder gebaut ist.
Artefakt: Product Backlog mit User Stories ("Als … möchte ich … damit …"), je mit Akzeptanzkriterien und Priorität, plus Definition des Sprint-Umfangs.

## Rolle 2: Architekt
Aufgabe: Technische Grundlage für den freigegebenen Sprint entwerfen.
Artefakt: Architekturdokument mit
- Technologiewahl inkl. Begründung (bevorzugt: schlanke PWA mit HTML/CSS/Vanilla-JavaScript, offlinefähig, hostbar auf GitHub Pages, kein Build-Schritt nötig)
- Dateistruktur und Aufteilung der Module (Fachlogik strikt getrennt von der Oberfläche, damit sie testbar ist)
- Datenmodell und Speicherung, inkl. gemeinsamem Datenmodell für Rezepte, Wochenplan, Vorrat und Einkaufsliste
- Datenschutzkonzept nach DSGVO: Daten bleiben standardmäßig lokal auf dem Gerät (localStorage/IndexedDB), keine Tracker, keine Cookies, keine externen CDNs oder Google Fonts, keine Analytics. Begründe jede Abweichung ausdrücklich. Das betrifft insbesondere:
  - die Synchronisation zwischen Geräten (braucht zwangsläufig einen Weg nach draußen; Alternativen wie GitHub, Supabase, Datei-Export oder lokales Netz abwägen)
  - Altlasten der Vorratskammer: Google Fonts, QuaggaJS über cdnjs, Produktabfrage bei Open Food Facts
- Barrierefreiheit und mobile Bedienbarkeit (große Touch-Ziele, gut lesbar, Kochmodus mit nassen Händen bedienbar)

## Rolle 3: Entwickler
Aufgabe: Nur die freigegebenen User Stories des aktuellen Sprints umsetzen, exakt nach Architekturdokument.
Artefakt: Vollständiger, lauffähiger Code (keine Platzhalter), kurze Anleitung zum Starten/Deployen, Liste der umgesetzten Stories.
Regeln: Fachlogik als reine Funktionen schreiben. Kommentare auf Deutsch. Keine Funktionen außerhalb des Sprint-Umfangs einbauen; Ideen dafür als Vorschlag für das Backlog notieren. Kleine, nachvollziehbare Commits.

## Rolle 4: QA
Aufgabe: Das Ergebnis kritisch und unabhängig prüfen. Dafür den Subagenten `qa` (`.claude/agents/qa.md`) starten. Er kennt den Gesprächsverlauf nicht und prüft nur gegen Code, Backlog und Architektur.
Artefakt: Testbericht mit
- Testfällen pro Akzeptanzkriterium (Eingabe → erwartetes Ergebnis → tatsächliches Ergebnis), inkl. Randfällen: 0, negative Werte, Kommazahlen, sehr große Zahlen, leere Listen, Einheiten-Umrechnung, doppelte Einträge
- automatisierten Tests für die Fachlogik (mit `node --test`, ohne externe Abhängigkeiten ausführbar)
- Prüfung von Datenschutz, Offlinefähigkeit, Mobilansicht und Barrierefreiheit
- gefundenen Fehlern mit Schweregrad
Ergebnis: "Freigabe" oder "Zurück an Entwickler" mit konkreter Fehlerliste.

## Technische Hinweise
- Lokal starten: `py -m http.server 8000` im Repo, dann `http://localhost:8000` (ES-Module und Service Worker laufen nicht über `file://`). Server nach dem Testen wieder stoppen.
- Der Laptop hat wenig RAM und Speicher: keine Build-Toolchains, kein `node_modules`, keine Docker-Images.
