# Product Backlog Küchensystem

**Stand:** 2026-10-21, vor Fragerunde 1. Der Backlog enthält bisher nur Kandidaten:
- die Ideen aus dem früheren Jira-Projekt der Vorratskammer (Quelle `KAN-…`, ehemals `vorratskammer/Produktplan.csv`)
- die geplanten Phasen 2–4 aus `wochenplan/README.md` (Quelle `WP-README`)

Prioritäten sind bewusst noch **offen**. Sie werden nach den Antworten auf `docs/sprints/sprint-1/po-fragen.md` vergeben. Stories mit dem Hinweis **Produktentscheidung** haben Datenschutzfolgen und brauchen vorher eine Entscheidung (siehe `CLAUDE.md`, Rolle Product Owner).

Prioritäten später: **Muss** (Sprint-Kandidat), **Soll**, **Kann**, **Später**.

---

## E1 Küchensystem-Kern (Wochenplan, Einkauf, Kochen)

### B-01 Wochenplan für 7 Tage
Als planende Person möchte ich für jeden Tag der Woche ein Rezept festlegen, damit klar ist, was es gibt.
- Ein Wochenplan umfasst 7 Tage ab einem wählbaren Starttag.
- Pro Tag lässt sich ein Rezept aus der Rezeptliste zuordnen, ändern und entfernen.
- Der Plan bleibt nach dem Neuladen erhalten.
- Quelle: WP-README Phase 2 · Priorität: offen

### B-02 Wochenplan-Vorschläge
Als planende Person möchte ich Vorschläge für die Woche bekommen, damit ich nicht jedes Mal neu überlegen muss.
- Vorschläge wiederholen kein Rezept innerhalb der Woche.
- Kürzlich gekochte Rezepte werden seltener vorgeschlagen.
- Einzelne Tage lassen sich neu würfeln, ohne den Rest zu ändern.
- Quelle: WP-README Phase 2 · Priorität: offen

### B-03 Kindervariante eines Rezepts
Als kochende Person möchte ich zu einem Rezept eine Kindervariante hinterlegen, damit ich nicht zwei Gerichte planen muss.
- Abweichende Zutaten und Hinweise für Kinder lassen sich erfassen (Feld `variants.children` existiert bereits).
- In Detailansicht und Kochmodus ist die Variante sichtbar.
- Quelle: WP-README Phase 2 · Priorität: offen

### B-04 Einkaufsliste aus dem Wochenplan
Als einkaufende Person möchte ich aus dem Wochenplan eine Einkaufsliste erzeugen, die schon Vorhandenes abzieht, damit ich nur kaufe, was fehlt.
- Zutaten aller geplanten Rezepte werden zusammengefasst; gleiche Zutaten mit gleicher Einheit werden addiert.
- Was laut Vorratskammer vorhanden ist, wird abgezogen oder als „vorhanden“ markiert.
- Einträge lassen sich abhaken und von Hand ergänzen.
- Voraussetzung: B-06 (gemeinsame Benennung und Einheiten)
- Quelle: WP-README Phase 4 („Vorratsapp-Integration“) · Priorität: offen

### B-05 Kochmodus
Als kochende Person möchte ich ein Rezept Schritt für Schritt auf dem Handy sehen, damit ich mit nassen Händen und ohne Scrollen kochen kann.
- Großer Text, ein Schritt pro Ansicht, große Weiter/Zurück-Flächen.
- Der Bildschirm bleibt an, wo das Gerät es erlaubt.
- Zeitangaben in Schritten lassen sich als Timer starten.
- Quelle: WP-README Phase 3 · Priorität: offen

### B-06 Gemeinsame Sprache für Zutaten und Vorrat
Als System möchte ich Rezeptzutaten und Vorratsprodukte einander zuordnen können, damit Einkaufsliste und Abbuchen funktionieren.
- Es gibt eine gemeinsame Liste von Grundzutaten (z. B. „Grünkohl“, „Knoblauch“) mit Standardeinheit.
- Rezeptzutaten (Feld `search`) und Vorratsprodukte lassen sich einer Grundzutat zuordnen.
- Einheiten werden vereinheitlicht oder umgerechnet (g/kg, ml/l, Stück).
- Quelle: Sichtung durch den Product Owner · Priorität: offen

### B-07 Vorrat nach dem Kochen abbuchen
Als kochende Person möchte ich nach dem Kochen die verbrauchten Zutaten aus dem Vorrat abbuchen, damit der Vorrat stimmt.
- Nach dem Kochen erscheint ein Vorschlag, welche Mengen abgebucht werden; er lässt sich bestätigen oder anpassen.
- Voraussetzung: B-06
- Quelle: WP-README Phase 4 · Priorität: offen

### B-08 Feedback zu Rezepten
Als Familie möchten wir Rezepte bewerten und Notizen hinterlassen, damit gute Gerichte öfter und schlechte seltener vorkommen.
- Bewertung getrennt für Kinder und Erwachsene, Notiz, tatsächliche Dauer (Felder existieren bereits unter `feedback`).
- Bewertungen fließen in die Vorschläge (B-02) ein.
- Quelle: WP-README Phase 3 · Priorität: offen

---

## E2 Gemeinsamer Zugriff und Abgleich zwischen Geräten

**Produktentscheidung:** Der Jira-Plan sieht Supabase mit Konten vor, also Backend, Konten und personenbezogene Daten bei einem Dritten. Das README des Wochenplans sieht einen Sync über GitHub vor, was bei einem öffentlichen Repo ausscheidet. Erst entscheiden, ob mehrere Personen gleichzeitig Zugriff brauchen (Frage 5), dann wählt der Architekt den Weg.

### B-10 Haushalt anlegen
Als erste Person möchte ich einen Haushalt anlegen, damit weitere Personen beitreten können.
- Haushalt mit Namen anlegen.
- Ein Einladungscode (6-stellig) wird erzeugt und angezeigt.
- Nur Mitglieder sehen die Daten des Haushalts.
- Quelle: KAN-2 bis KAN-8 · Priorität: offen · **Produktentscheidung**

### B-11 Haushalt beitreten
Als weitere Person möchte ich mit einem Einladungscode beitreten, damit ich dieselben Daten sehe.
- Code eingeben, prüfen, Person dem Haushalt zuordnen, danach direkt in die App.
- Ungültige Codes werden verständlich abgelehnt.
- Quelle: KAN-9 bis KAN-12 · Priorität: offen · **Produktentscheidung**

### B-12 Änderungen erscheinen auf allen Geräten
Als Haushaltsmitglied möchte ich Änderungen der anderen zeitnah sehen, damit z. B. die Einkaufsliste beim Einkaufen stimmt.
- Änderungen erscheinen sofort lokal und werden im Hintergrund übertragen.
- Bei gleichzeitigen Änderungen gilt eine dokumentierte Regel (Jira-Vorschlag: die letzte Änderung gewinnt).
- Quelle: KAN-13 bis KAN-17 · Priorität: offen · **Produktentscheidung**
- Hinweis: KAN-15 („localStorage durch Supabase ersetzen“) widerspricht dem Grundsatz „Daten standardmäßig lokal“. Lokal bleibt die Hauptquelle, der Abgleich kommt dazu.

### B-13 Offline weiterarbeiten
Als Haushaltsmitglied möchte ich ohne Netz weiterarbeiten, damit die App im Keller oder im Supermarkt funktioniert.
- Änderungen ohne Netz werden gesammelt und beim nächsten Online-Moment übertragen.
- Ein Hinweis zeigt, wenn das Gerät offline ist.
- Quelle: KAN-18 bis KAN-21 · Priorität: offen

### B-14 Ohne Konto nutzen
Als Person, die kein Konto will, möchte ich die Apps weiter rein lokal nutzen, damit ich nichts preisgeben muss.
- Beim Start gibt es „Ohne Konto fortfahren“.
- Wer sich später anmeldet, kann die lokalen Daten übernehmen.
- Quelle: KAN-22 bis KAN-25 · Priorität: offen

---

## E3 Desktop-Ansicht (Vorratskammer)

### B-20 Responsives Desktop-Layout
Als Person am PC möchte ich den Vorrat in einer Tabelle bearbeiten, damit größere Änderungen schnell gehen.
- Ab 900 px Breite: links Filter und Kategorien, rechts eine sortierbare Tabelle.
- Spalten: Name, Marke, MHD, Menge, Lagerort, eingefroren.
- Bearbeiten direkt in der Tabelle.
- Quelle: KAN-26 bis KAN-32 · Priorität: offen

### B-21 Dashboard am PC
Als Person am PC möchte ich auf einen Blick sehen, was bald abläuft, damit nichts verdirbt.
- Kennzahlen: abgelaufen, bald ablaufend, eingefroren, gesamt.
- Ablaufkalender bzw. Diagramm der nächsten 30 Tage, Anzahl pro Kategorie.
- Quelle: KAN-33 bis KAN-37 · Priorität: offen

### B-22 Erweiterte Filter und Sammelaktionen
Als Person am PC möchte ich filtern und mehrere Produkte gleichzeitig ändern, damit Aufräumaktionen schnell gehen.
- Filter nach Lagerort, Kategorie, MHD-Zeitraum, eingefroren.
- Mehrfachauswahl zum Löschen oder Lagerort-Ändern, Sortierung nach jeder Spalte.
- Export als CSV für Excel.
- Quelle: KAN-38 bis KAN-42 · Priorität: offen

---

## E4 Bedienung und Gestaltung (Vorratskammer)

### B-30 Wischgesten auf Produktkarten
Als Person am Handy möchte ich mit einer Wischgeste die Menge reduzieren oder ein Produkt löschen, damit es schneller geht.
- Nach rechts wischen: Menge −1; nach links wischen: löschen; jeweils 3 Sekunden rückgängig machbar.
- Auslösung erst ab 40 px waagerechter Bewegung, damit die Zurück-Geste in Safari nicht stört.
- Farbige Rückmeldung während des Wischens, auf dem iPhone getestet.
- Quelle: KAN-63, KAN-78 bis KAN-82 · Priorität: offen

### B-31 Glas-Optik für Produktkarten
Als Person am Handy möchte ich eine modernere Optik, damit die App angenehmer wirkt.
- Karten mit unscharfem, halbtransparentem Hintergrund und feinerem Schatten.
- Ausreichend schnell auf älteren iPhones (XR, 11); Rückfall für Browser ohne `backdrop-filter`.
- Quelle: KAN-62, KAN-74 bis KAN-77 · Priorität: offen

---

## E5 Technik und Datenschutz

### B-40 Schriften und Scanner-Bibliothek lokal ausliefern
Als Nutzerin oder Nutzer möchte ich, dass die App keine Daten an Google oder ein CDN sendet, damit beim Öffnen niemand mitliest.
- Die Vorratskammer lädt keine Google Fonts mehr (lokale Schrift oder Systemschrift).
- QuaggaJS liegt im Repo statt bei cdnjs.
- Quelle: Sichtung durch den Product Owner · Priorität: offen

### B-41 Barcode-Scan und Open Food Facts
Als Person, die Vorräte erfasst, möchte ich Produkte per Barcode erfassen. Offen ist, ob dafür Produktdaten bei Open Food Facts abgefragt werden dürfen.
- Entscheidung festhalten: Abfrage behalten (mit Hinweis in der App) oder nur Barcode speichern und manuell ausfüllen.
- Quelle: Sichtung durch den Product Owner · Priorität: offen · **Produktentscheidung** (Frage 4)

### B-42 Service Worker räumen nur eigene Caches auf
Als System möchte ich, dass sich die Apps auf derselben Domain nicht gegenseitig die Offline-Daten löschen.
- `wochenplan/sw.js` löscht beim Aktivieren nur Caches mit Präfix `wochenplan-`.
- Quelle: Umbau zum gemeinsamen Repo · Priorität: offen (klein, vor dem ersten eigenen Service Worker der Vorratskammer nötig)

### B-43 Vorratskammer offline nutzbar
Als Person im Keller ohne Netz möchte ich die Vorratskammer öffnen können, damit ich auch dort nachsehen und eintragen kann.
- Die Vorratskammer bekommt Manifest und Service Worker wie der Wochenplan.
- Quelle: Sichtung durch den Product Owner · Priorität: offen

---

## Erledigt (laut Code, aus Jira übernommen)
- KAN-55 bis KAN-59 Schwebende Plus-Schaltfläche statt Scanner-Tab
- KAN-60, KAN-64 bis KAN-68 Gruppierung nach Lagerort, ein- und ausklappbar, Reihenfolge einstellbar, Zustand gespeichert
- KAN-61, KAN-69 bis KAN-73 MHD-Fortschrittsbalken
- KAN-52, KAN-53 Versionsnummer in den Einstellungen und Changelog

## Verworfen oder überholt
- KAN-51 Deploy per GitHub Actions: GitHub Pages veröffentlicht `main` bereits direkt.
- KAN-3, KAN-44 bis KAN-49 Supabase-Einrichtung als eigene Aufgaben: gehen in E2 auf, sobald die Produktentscheidung gefallen ist und der Architekt den Weg gewählt hat.
- KAN-83 „Test“: leerer Eintrag.
