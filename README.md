# Küchensystem

Wochenplan, Rezepte, Vorratskammer, Einkaufsliste und Kochmodus für eine Familie. Alles läuft als Web-App im Browser, ist offline nutzbar und speichert Daten nur auf dem eigenen Gerät.

**Start:** https://michawallburger-dev.github.io/kuechensystem/

| App | Ordner | Adresse |
|---|---|---|
| Wochenplan und Rezepte | [`wochenplan/`](wochenplan/README.md) | `/kuechensystem/wochenplan/` |
| Vorratskammer | [`vorratskammer/`](vorratskammer/CHANGELOG.md) | `/kuechensystem/vorratskammer/` |

## Lokal starten

```bash
py -m http.server 8000
```

Dann `http://localhost:8000` öffnen. Über `file://` laufen ES-Module und Service Worker nicht.

## Tests

```bash
node --test tests/
```

Benötigt Node.js 22 oder neuer, sonst nichts.

## Entwicklung

Die Arbeitsweise (Rollen, Sprints, Branches, Arbeit auf mehreren Rechnern) steht in [`CLAUDE.md`](CLAUDE.md), der aktuelle Stand in [`docs/STATUS.md`](docs/STATUS.md).

Die Vorratskammer lag früher im eigenen Repo `vorratskammer`. Ihre Historie wurde hierher übernommen.
