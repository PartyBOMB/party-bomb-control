# Party Bomb Online v15.2.8

Firebase, lobby, partikód és többtelefonos kapcsolat nélkül.

- Teljes demó.
- USB és HM-10 kapcsolat.
- Csapatok/játékosok helyi létrehozása.
- Maximum 4 fő csapatonként.
- A → B → C → D → A szerepforgás.
- A feladványadó utáni játékos találgat.
- Jó vágás után a találgató lesz az új feladványadó.
- Kezdő csapat kiválasztható.
- Csapatváltás friss bombával.
- Activity ON/OFF.
- DRAW / DESC / PANT.
- DESC esetén tabu szavak.
- 287 beépített szó.
- Helyi mentés.

Demó: Indítás → Élő játék → az aktív LED színével azonos vezetékre kattints.


## v15.2.8 változások

- Legfeljebb 4 fix színű csapat lehet:
  - 🔴 Piros csapat
  - 🔵 Kék csapat
  - 🟡 Sárga csapat
  - 🟢 Zöld csapat
- Új csapat hozzáadásakor automatikusan a következő még nem használt szín jön létre.
- Az élő játék magyarul írja ki:
  - `🔵 Kék csapat – Tomi rajzol`
  - `🔵 Pati találgat`
- A DRAW / DESC / PANT kódok csak a bombával folytatott hardverkommunikációban maradnak.
- A ranglista színes csapat-emojikkal jelenik meg.


## v15.2.8 javítások

- Demó mód külön BE/KI gombot kapott.
- A Bontás gomb a felső sávban és a Vezérlés fülön is működik.
- A beállításmezők nem lógnak egymásba.
- Akkumulátor-százalék a feszültségből számolódik, ezért 4,11 V nem lehet kevesebb, mint 3,97 V.
- Alapállapotban nincs csapat és nincs játékos.
- Legfeljebb négy színes csapat adható hozzá.
- A Szavak fül sorszámozott táblázatot mutat tabu szavakkal.
- 287 szó van beépítve.
- Az Élő játék fülön külön Játék indítása gomb van.
- Játék közben a LED-ek automatikusan váltogatják egymást.
- Hangok jó vágásnál, rossz vágásnál, hatástalanításnál és robbanásnál működnek.


## v15.2.8 – automatikus csapatváltás

Ha az Activity **ON**, akkor hatástalanítás vagy robbanás után:

1. körülbelül 2,2 másodpercig látszik a hatástalanítás/robbanás animáció;
2. automatikusan a következő csapat következik;
3. teljesen friss bomba készül;
4. az idő, életek, vágások, LED-ek és vezetékek visszaállnak;
5. a következő bomba nem indul el automatikusan;
6. a Partymaster az **Indítás** gombbal indítja a következő fordulót.

A manuális **Csapatváltás** gomb továbbra is megmaradt.

Activity **OFF** esetén nincs automatikus csapatváltás; a normál bomba mód és a manuális gomb használható.


## v15.2.8 kritikus javítás

A hiba oka az volt, hogy az alkalmazás egy nem létező `liveStart` gombhoz próbált eseményt rendelni. Emiatt a JavaScript indulás közben leállt, így egyszerre nem működött a csapatfelvétel, a játékosfelvétel és a szólista.

Javítva:

- az Élő játék fülön látható a **Játék indítása** gomb;
- a csapatok és játékosok újra felvehetők;
- a 287 szavas lista megjelenik a tabu szavakkal;
- a fejléc neve **Party BOMB**;
- egy hiányzó opcionális gomb többé nem állíthatja le az egész alkalmazást;
- az utolsó csapat és az utolsó játékos is törölhető;
- a service worker új gyorsítótár-verziót használ.


## v15.2.8 – funkcionális és szóadatbázis-javítás

- A korábbi mesterséges tabu szavakat teljesen eltávolítottuk.
- 228 szó maradt, mindegyikhez öt, a szóhoz valóban kapcsolódó tabu szó tartozik.
- A szólista kategóriát is mutat.
- A csapatok fül új telepítésnél valóban üresen indul.
- A helyi mentés kulcsa megváltozott, ezért a korábbi csapatok nem töltődnek vissza.
- A `➕ Játékos` gomb működik, és legfeljebb négy játékost enged csapatonként.
- Activity OFF esetén csapat és játékos nélkül is elindítható a normál bomba.
- Activity OFF esetén az Élő játék fül elrejti:
  - a feladványadót;
  - a találgatót;
  - a feladatot;
  - a szót;
  - a tabu szavakat.
- Activity ON esetén a csapat- és játékoslogika változatlanul működik.


## v15.2.8 – titkos feladvány

Activity ON esetén a szó és a tabu szavak alapból rejtve vannak. A LED-ek és a vezetékek között lévő nagy 👁️ gombot folyamatosan nyomva tartva jelennek meg. Felengedéskor azonnal eltűnnek. DESC esetén a szóval együtt a tabu szavak is láthatók. Activity OFF módban a szemgomb sem jelenik meg.


## v15.2.8

Arduino-kompatibilis határok:

- Idő: 60–5999 másodperc
- Életek: 1–5
- Szükséges vágások: 1–5
- LED-sebesség: 1–5
- Fényerő: 0–7

A szemgomb a Feladvány mező mellé került. A szómező Activity ON esetén mindig azonos méretben látszik, alapból teljesen homályos. Csak a szemgomb nyomva tartása alatt válik olvashatóvá. Tabu szavak csak körülírásnál jelennek meg.


## v15.2.8

A feladványmező ismét sárga, világító keretet kapott, és fix méretű marad. A szó nagy, fénylő betűkkel jelenik meg, a „Szó” felirat pedig kicsi és visszafogott. Körülírásnál a tabu szavak nagy, jól olvasható, fénylő címkéken jelennek meg.

Az Arduino LIFE/CUTC balansza bekerült:

- mindig teljesül: `CUTC + LIFE - 1 <= 5`;
- LIFE módosításakor a CUTC lehetőleg 3 marad;
- túl sok élet esetén a CUTC automatikusan csökken;
- CUTC módosításakor szükség esetén a LIFE automatikusan csökken;
- Activity ON esetén a CUTC legalább az aktuális csapat játékosainak száma, 2–4 között.
