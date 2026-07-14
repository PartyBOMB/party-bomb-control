# Party Bomb Online v15.2.3

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


## v15.2.3 változások

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


## v15.2.3 javítások

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


## v15.2.3 – automatikus csapatváltás

Ha az Activity **ON**, akkor hatástalanítás vagy robbanás után:

1. körülbelül 2,2 másodpercig látszik a hatástalanítás/robbanás animáció;
2. automatikusan a következő csapat következik;
3. teljesen friss bomba készül;
4. az idő, életek, vágások, LED-ek és vezetékek visszaállnak;
5. a következő bomba nem indul el automatikusan;
6. a Partymaster az **Indítás** gombbal indítja a következő fordulót.

A manuális **Csapatváltás** gomb továbbra is megmaradt.

Activity **OFF** esetén nincs automatikus csapatváltás; a normál bomba mód és a manuális gomb használható.
