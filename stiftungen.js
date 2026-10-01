// Hier weitere Stiftungen ergänzen. IDs müssen eindeutig sein.
// x/y: relative Bildposition zwischen 0 und 1, KEINE geografischen Koordinaten.
// Umschalt-Klick auf die Karte zeigt passende Werte an.
// Alle Positionen sind illustrative Beispielpositionen.
// Nur der Körner-Eintrag wurde inhaltlich aus der Vorlage übernommen;
// die übrigen Einträge sind ausdrücklich fiktive Platzhalter.
const STIFTUNGEN = [
  {
    id: 'koerner',
    name: 'Prof. Dr. Jürgen G. Körner Stiftungsfonds',
    kategorien: ['Humanitär & Sozial'],
    x: 0.316, y: 0.467,
    schwerpunkte: 'Unterstützung bedürftiger Menschen, Förderung von Bildung und Wissenschaft',
    projekte: 'Sonnenschein Café in Hamburg-Ottensen und Deutschlandstipendium für einen Physikstudenten',
    url: '' // Hier die tatsächliche URL des Stiftungsporträts eintragen.
  },
  { id: 'forschung-demo', name: 'Beispielstiftung Forschung', kategorien: ['Forschung'], x: .167, y: .170, schwerpunkte: 'Fiktiver Beispieleintrag für Forschung und Wissenschaft.', projekte: 'Hier geförderte Projekte beschreiben.', url: '' },
  { id: 'kinder-demo', name: 'Beispielstiftung Junge Menschen', kategorien: ['Kinder & junge Menschen'], x: .353, y: .284, schwerpunkte: 'Fiktiver Beispieleintrag für Bildung und Teilhabe.', projekte: 'Hier geförderte Projekte beschreiben.', url: '' },
  { id: 'kultur-demo', name: 'Beispielstiftung Kultur', kategorien: ['Kultur'], x: .502, y: .201, schwerpunkte: 'Fiktiver Beispieleintrag für Kunst und Kultur.', projekte: 'Hier geförderte Projekte beschreiben.', url: '' },
  { id: 'senioren-demo', name: 'Beispielstiftung Senioren', kategorien: ['Senioren', 'Humanitär & Sozial'], x: .491, y: .383, schwerpunkte: 'Fiktiver Beispieleintrag für Begegnung im Alter.', projekte: 'Hier geförderte Projekte beschreiben.', url: '' },
  { id: 'natur-demo', name: 'Beispielstiftung Natur', kategorien: ['Natur'], x: .236, y: .891, schwerpunkte: 'Fiktiver Beispieleintrag für Natur und Umwelt.', projekte: 'Hier geförderte Projekte beschreiben.', url: '' },
  { id: 'sozial-demo', name: 'Beispielstiftung Miteinander', kategorien: ['Humanitär & Sozial'], x: .664, y: .205, schwerpunkte: 'Fiktiver Beispieleintrag für soziale Unterstützung.', projekte: 'Hier geförderte Projekte beschreiben.', url: '' }
];
