# Planering

**Mål:** Skapa en webbshop för Textilestudio UF där man kan registrerar sig för att sedan kunna använda shoppingkorgen och utföra ett köp. Den skippar betalningen. Både beställningar och produkter finns i databasen. 


|    | Tis                    | Fre                      |
|----|------------------------|--------------------------|
| 16 | X                      | Planering                |
| 17 | Set-up m databaser     | Strukturera              |
| 18 | Login & Shopping cart  | Shopping cart            |
| 19 | Buy routes             | Buy routes               |
| 20 | Error-hantering        | X                        |
| 21 | X                      | Hosting, PM & Lämna in   |

**Tabeller i databasen:**

**nt19loginInfo**
| id | username | password | firstname | lastname | accessLevel |
|----|----------|----------|-----------|----------|-------------|
| a  |          |          | b         | b        | admin?      |

**nt19products**
| id | name | price | amount |
|----|------|-------|--------|
| c  |      |       |        |

**nt19cart**
| id | userId | productId | amount | price |
|----|--------|-----------|--------|-------|
|    | from a | from c    |        |       |

**nt19orders**
| id | customer | dated | total |
|----|----------|-------|-------|
| d  | from b   |       |       |

**nt19orderedProducts**
| id | orderId | productId | amount |
|----|---------|-----------|--------|
|    | from d  | from c    |        |

## Loggbok

**v.16 - 21 april 2023**

Har gjort:
- Kommit fram till ett projekt och skapat ett repo med planering i README.md
- Planerat i skissblock hur sidan ska fungera och hur tabellerna ska se ut. Även lite grafiskt
- Skapat tabeller i databas (vilket var planen för nästa lektion)

Nästa gång:
- Skapa relevanta filer och mappar i repo
- Ladda ner paket
- Gå vidare till att strukturera upp elementen som behövs för funktioner och liknande

**v.17 - 25 april 2023**

Har gjort:
- Skapat grundläggande filstruktur
- Laddat ner relevanta paket

Nästa gång: