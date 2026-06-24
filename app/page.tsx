import Hero from "@/components/home/Hero";
import StatsGrid from "@/components/home/StatsGrid";
import FocusList from "@/components/home/FocusList";
import CurrentlyReading from "@/components/home/CurrentlyReading";
import { books } from "@/lib/data/books";
import { countries } from "@/lib/data/countries";
import { posts } from "@/lib/data/posts";

export default function Home() {
  return (
    <main className="py-12 sm:py-22">
      <Hero />
      <StatsGrid counts={[books.length, countries.length, posts.length]} />
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
        <FocusList />
        <CurrentlyReading />
      </div>
    </main>
  );
}
