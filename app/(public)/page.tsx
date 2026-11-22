
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Users,
} from "lucide-react";

const features = [
  {
    icon: GraduationCap,
    title: "Qualified Tutors",
    description:
      "Discover tutors who can support your academic goals and learning journey.",
  },
  {
    icon: BookOpen,
    title: "Flexible Learning",
    description:
      "Explore online and offline tuition opportunities based on your needs.",
  },
  {
    icon: Users,
    title: "Student Community",
    description:
      "Connect with tutors and find learning opportunities that fit your schedule.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="overflow-hidden bg-white">
        <div className="container-custom grid min-h-[600px] items-center gap-12 py-20 lg:grid-cols-2">

          <div>
            <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-primary">
              Your Learning Journey Starts Here
            </span>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Find Your Perfect Tutor.
              <span className="mt-2 block text-primary">
                Build Your Future.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              Discover qualified tutors, explore tuition opportunities,
              and connect with the right academic mentor for your journey.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/tuitions"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3.5 font-semibold text-white transition hover:bg-blue-900"
              >
                Explore Tuitions
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/sign-up"
                className="rounded-lg border border-border px-6 py-3.5 font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                Become a Tutor
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-8">
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  Student
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Find your tutor
                </p>
              </div>

              <div>
                <p className="text-2xl font-bold text-slate-900">
                  Tutor
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Share your expertise
                </p>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative">
            <div className="absolute -left-8 -top-8 h-40 w-40 rounded-full bg-blue-100 blur-3xl" />

            <div className="relative rounded-3xl border border-border bg-slate-50 p-6 shadow-sm sm:p-10">
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-primary">
                    <GraduationCap size={30} />
                  </div>

                  <div>
                    <p className="font-semibold text-slate-900">
                      Your Academic Growth
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Find the right learning support
                    </p>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="h-3 w-full rounded-full bg-slate-100" />
                  <div className="h-3 w-4/5 rounded-full bg-slate-100" />
                  <div className="h-3 w-2/3 rounded-full bg-slate-100" />
                </div>

                <div className="mt-8 rounded-xl bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-primary">
                    Start exploring tuition opportunities
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Choose a learning path that works for you.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-primary p-5 text-white">
                <div className="flex items-center gap-3">
                  <BookOpen size={22} />

                  <div>
                    <p className="font-semibold">
                      Learn with confidence
                    </p>

                    <p className="mt-1 text-sm text-blue-100">
                      Your next learning opportunity is waiting.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-20">
        <div className="container-custom">

          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold text-primary">
              WHY MENTORLAGBE
            </span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Learning made more accessible
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Find learning opportunities and connect with tutors
              through one convenient platform.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-border bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-primary">
                    <Icon size={24} />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to start learning?
          </h2>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-blue-100">
            Explore tuition opportunities and find a tutor
            who matches your academic goals.
          </p>

          <Link
            href="/tuitions"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3.5 font-semibold text-primary transition hover:bg-blue-50"
          >
            Find Tutors
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
