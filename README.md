# Planering

**Mål:** Skapa en webbshop för Textilestudio UF där man kan registrerar sig för att sedan kunna använda shoppingkorgen och utföra ett köp. Den skippar betalningen. Både beställningar och produkter finns i databasen. 


|    | Tis                    | Fre                      |
|----|------------------------|--------------------------|
| 16 | X                      | Planering                |
| 17 | Set-up m databaser     | Front-end                |
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