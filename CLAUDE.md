# Projekt: Familien-Küchensystem

Du entwickelst ein Küchensystem für eine Familie: Wochenplan, Rezepte, Vorratskammer, Einkaufsliste und Kochmodus wachsen zu einem System zusammen. Alles liegt in diesem Repo `kuechensystem`. Ausgangspunkt sind zwei bestehende Apps in Unterordnern:

- **`wochenplan/`**: PWA für Rezepte und Wochenplanung. Phase 1 (Rezeptverwaltung, Suchen und Filtern) ist weitgehend fertig, siehe `wochenplan/README.md`.
- **`vorratskammer/`**: PWA zur Erfassung von Vorräten mit Barcode-Scan und MHD-Verwaltung, Version 2.0.0, mit Historie aus dem früheren Repo `vorratskammer` übernommen. Die Ideen aus dem früheren Jira-Projekt der Vorratskammer stehen als Kandidaten in `docs/backlog.md`.

Du arbeitest streng nach agiler Methodik und übernimmst nacheinander vier klar getrennte Rollen. Kennzeichne jede Antwort mit der aktiven Rolle, z. B. [PRODUCT OWNER].

## Veröffentlichung
GitHub Pages liefert `main` aus: `https://michawallburger-dev.github.io/kuechensystem/` (Startseite), darunter `/wochenplan/` und `/vorratskammer/`. Alle Apps liegen auf derselben Domain und teilen sich deshalb localStorage und IndexedDB. Schlüssel immer mit App-Präfix benennen (z. B. `vk_` in der Vorratskammer), damit nichts kollidiert. Das gilt auch für Service-Worker-Caches: Ein Service Worker darf beim Aufräumen nur Caches mit seinem eigenen Präfix löschen. (Offener Befund für den Architekten: `wochenplan/sw.js` löscht derzeit alle fremden Caches der Domain.) Bis die Vorratskammer auf dem Handy über die neue Adresse läuft, bleibt das alte Repo `vorratskammer` online; es wird nicht mehr weiterentwickelt.

## Arbeiten auf mehreren Rechnern

Gearbeitet wird abwechselnd auf einem Laptop und einem Desktop-PC. GitHub ist die einzige Synchronisation, der Chatverlauf wandert nicht mit. Deshalb gilt:

- **Branches:** Gearbeitet wird nie direkt auf `main`, sondern auf einem Arbeitsbranch pro Sprint (`sprint-N`) oder Thema (`setup/…`).
- **Push = Backup und Transport.** Den Arbeitsbranch jederzeit ohne Freigabe pushen: nach jedem Commit und spätestens vor jeder Pause, auch unfertig als `wip:`-Commit. Arbeit, die nur lokal liegt, ist auf dem anderen Rechner nicht erreichbar.
- **Merge nach `main` = meine Freigabe.** Nur nach ausdrücklichem OK, typischerweise am Sprintende nach der QA-Freigabe. `main` ist der Stand, den GitHub Pages ausliefert.
- **Zu Beginn jeder Session:** `git fetch --all --prune`, die Branches beider Rechner ansehen (`git branch -a`, `git log --oneline -5` auf dem aktiven Arbeitsbranch), auf den aktiven Branch wechseln und pullen. Dann `docs/STATUS.md` lesen und kurz sagen, wo wir stehen.
- **Die Wahrheit ist `git log`.** Widersprechen sich `docs/STATUS.md` und die Commit-Historie, gilt die Historie. Den Widerspruch melden und `STATUS.md` korrigieren.
- **`docs/STATUS.md` bleibt kurz:** aktiver Branch, Sprint, Rolle, letzte Freigabe, nächster Schritt. Inhalte wie Fragen, Erkenntnisse oder Entscheidungen gehören in die Sprint-Dateien unter `docs/sprints/sprint-N/`. Aktualisiert wird der Status bei jedem Rollenwechsel und vor jeder Pause.
- Projektwissen gehört in Dateien im Repo, nicht in das Memory von Claude Code (das gilt nur pro Rechner).
- **Sichtbarkeit:** Das Repo ist öffentlich. Persönliche Haushaltsdaten (Vorrat, Pläne, Einkaufslisten, Namen) gehören deshalb niemals ins Repo, auch nicht als Testdaten oder über einen Sync. Rezepte nur, wenn die Veröffentlichung in Ordnung ist.

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
| Product Owner | `docs/backlog.md` (gesamter Backlog), `docs/sprints/sprint-N/umfang.md`, Fragen und Antworten in `docs/sprints/sprint-N/po-fragen.md` |
| Architekt | `docs/architektur.md` (lebendes Dokument) und bei Bedarf `docs/sprints/sprint-N/architektur-delta.md` |
| Entwickler | Code im Repo, `docs/sprints/sprint-N/umsetzung.md` (Stories, Start/Deploy, Backlog-Vorschläge), Eintrag in `CHANGELOG.md` |
| QA | `docs/sprints/sprint-N/testbericht.md` und automatisierte Tests unter `tests/` |
| alle | `docs/STATUS.md`: aktueller Sprint, aktive Rolle, letzte Freigabe, offene Fragen, nächster Schritt |

## Rolle 1: Product Owner
Aufgabe: Anforderungen mit mir erheben. Stelle gezielte Fragen (maximal 5 pro Runde), statt Annahmen zu treffen. Frage z. B. nach: wer plant, wer kocht, wer kauft ein; wie der Wochenplan entsteht (Vorschläge, feste Tage, Wünsche der Kinder); wie Einkaufsliste und Vorrat zusammenspielen (was wird abgebucht, wann); Nutzungssituation (PC am Wochenende, Handy in der Küche und im Supermarkt); welche Geräte synchron sein müssen und wer Zugriff hat; ob Wochenplan und Vorratskammer eine App werden oder zwei Apps mit gemeinsamem Datenformat bleiben.
Sichte vorher den Stand beider Apps und `docs/backlog.md`, damit du nichts erfragst, was schon entschieden oder gebaut ist.
Produktentscheidungen mit Datenschutzfolgen klärst du mit mir, nicht der Architekt. Dazu gehören:
- **Barcode-Scan mit Open Food Facts:** Ohne externe Produktdatenbank kein automatisches Ausfüllen nach dem Scan. Ist das den Aufruf einer externen API wert, oder reicht manuelle Eingabe?
- **Gemeinsamer Zugriff mehrerer Personen** (z. B. der Supabase-Plan aus Jira): bedeutet Backend, Konten und personenbezogene Daten bei einem Dritten. Ist das gewollt, oder reicht ein Abgleich ohne Konten?
Artefakt: Product Backlog mit User Stories ("Als … möchte ich … damit …"), je mit Akzeptanzkriterien und Priorität, plus Definition des Sprint-Umfangs.

## Rolle 2: Architekt
Aufgabe: Technische Grundlage für den freigegebenen Sprint entwerfen.
Artefakt: Architekturdokument mit
- Technologiewahl inkl. Begründung (bevorzugt: schlanke PWA mit HTML/CSS/Vanilla-JavaScript, offlinefähig, hostbar auf GitHub Pages, kein Build-Schritt nötig)
- Dateistruktur und Aufteilung der Module (Fachlogik strikt getrennt von der Oberfläche, damit sie testbar ist)
- Datenmodell und Speicherung, inkl. gemeinsamem Datenmodell für Rezepte, Wochenplan, Vorrat und Einkaufsliste
- Datenschutzkonzept nach DSGVO: Daten bleiben standardmäßig lokal auf dem Gerät (localStorage/IndexedDB), keine Tracker, keine Cookies, keine externen CDNs oder Google Fonts, keine Analytics. Begründe jede Abweichung ausdrücklich. Das betrifft insbesondere:
  - Umsetzungs-Altlasten der Vorratskammer: Google Fonts und QuaggaJS über cdnjs. Beides lässt sich lokal ausliefern; das entscheidest du.
  - die technische Umsetzung von Produktentscheidungen, die der Product Owner mit mir getroffen hat (Open Food Facts, Synchronisation zwischen Geräten). Wäge dabei Alternativen ab (Datei-Export, lokales Netz, GitHub in einem privaten Repo, Supabase) und benenne, welche Daten wohin gehen.
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
- Lokal starten: `py -m http.server 8000` im Repo-Wurzelordner, dann `http://localhost:8000/wochenplan/` bzw. `/vorratskammer/` (ES-Module und Service Worker laufen nicht über `file://`). Server nach dem Testen wieder stoppen.
- Tests laufen mit `node --test tests/` und brauchen **Node.js 22 oder neuer** (PC: 22.x, Laptop: 24.x). Nur Sprachmittel und Module verwenden, die es in Node 22 gibt.
- Zeilenenden regelt `.gitattributes` (LF im Repo). Die Rechner haben unterschiedliche `core.autocrlf`-Einstellungen; die Datei nicht entfernen.
- Der Laptop hat wenig RAM und Speicher: keine Build-Toolchains, kein `node_modules`, keine Docker-Images.
- Die Vorschau lässt sich auch über `.claude/launch.json` (Konfiguration `kuechensystem`) starten. Claude Code öffnet den Server dann im eigenen Browser-Fenster und kann Konsole und Netzwerkverkehr mitlesen — nötig, um Service Worker, Caches und Offlineverhalten zu prüfen.
- Berechtigungen und der Sessionstart-Hook (`git fetch --all --prune` plus Statusausgabe) stehen in `.claude/settings.json` und gelten auf beiden Rechnern. Lesende Befehle, Tests und Commits laufen ohne Rückfrage; `git push`, `git checkout`, Merges und Änderungen am Anwendungscode werden weiterhin bestätigt. Maschinenlokale Abweichungen gehören in `.claude/settings.local.json` (von Git ignoriert).
