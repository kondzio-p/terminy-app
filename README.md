# Terminy

Aplikacja do zarządzania rezerwacjami domków i apartamentów na wynajem. Kalendarz zajętości, rezerwacje z ceną za noc i historia z filtrami. Obiekt można udostępnić innym osobom, żeby wspólnie prowadziły grafik.

Demo: https://terminy-app.vercel.app

## Funkcje

- rejestracja i logowanie (hasła w bcrypt, sesja w podpisanym JWT)
- obiekty z kalendarzem rezerwacji
- dodawanie, edycja i usuwanie rezerwacji: termin, liczba gości, cena za noc, telefon, opis
- współdzielenie obiektu z innymi użytkownikami
- historia rezerwacji z filtrami po roku, miesiącu i obiekcie

## Technologie

Next.js 16 (App Router, Server Actions), React 19, Prisma 7, PostgreSQL, jose, bcryptjs. Hosting na Vercel.

## Uruchomienie

```bash
npm install          # instaluje zależności i generuje klienta Prisma
cp .env.example .env # ustaw DATABASE_URL i SESSION_SECRET
npx prisma migrate deploy
npm run dev
```
