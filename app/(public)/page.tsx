import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="container-custom flex min-h-screen flex-col items-center justify-center text-center">

        <span className="mb-5 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
          Welcome to MentorLagbe
        </span>

        <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
          Find Your Perfect Tutor.
          <span className="block text-blue-700">
            Build Your Future.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Discover qualified tutors, explore tuition opportunities,
          and connect with the right academic mentor for your journey.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-4">

          <Link
            href="/tuitions"
            className="rounded-lg bg-blue-700 px-7 py-3.5 font-semibold text-white transition hover:bg-blue-800"
          >
            Explore Tuitions
          </Link>

          <Link
            href="/sign-up"
            className="rounded-lg border border-slate-300 px-7 py-3.5 font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Become a Tutor
          </Link>

        </div>

      </section>
    </main>
  );
}
